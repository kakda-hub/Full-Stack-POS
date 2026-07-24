import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { backdropAnimation, modalAnimation } from '../../../shared/animations/animations';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CustomerService } from '../../../core/services/api/customer.service';
import { KhqrService } from '../../../core/services/api/khqr.service';
import { Customer } from '../../../core/models';
import { Subject, debounceTime, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-payment-modal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent {
  @Input() total = 0;
  @Input() subtotal = 0;
  @Input() processing = false;
  @Output() paid = new EventEmitter<{
    method: 'cash' | 'aba' | 'card';
    cashReceived?: number;
    customerId?: number;
    customerName?: string;
    pointsEarned?: number;
    pointsRedeemed?: number;
    loyaltyDiscount?: number;
  }>();
  @Output() cancel = new EventEmitter<void>();

  selectedMethod = signal<'cash' | 'aba' | 'card'>('cash');
  cashReceived = 0;
  private _change = signal(0);
  change = this._change.asReadonly();

  // Customer state
  customerPhone = signal('');
  customer = signal<Customer | null>(null);
  customerSearching = signal(false);
  customerNotFound = signal(false);
  customerSearchError = signal(false);
  pointsToRedeem = signal(0);
  showRedeemInput = signal(false);

  // KHQR state
  qrImage = signal<string | null>(null);
  qrLoading = signal(false);
  qrError = signal(false);

  // Computed values
  loyaltyDiscount = computed(() => {
    if (!this.customer()) return 0;
    const pts = this.pointsToRedeem();
    return Math.floor(pts / 100);
  });

  effectiveTotal = computed(() => {
    return Math.max(0, this.total - this.loyaltyDiscount());
  });

  pointsEarned = computed(() => {
    if (!this.customer()) return 0;
    return Math.floor(this.effectiveTotal() * (this.customer()?.pointsPerDollar || 10));
  });

  private phoneSearch = new Subject<string>();

  methods = [
    { id: 'cash' as const, label: 'Cash', labelKm: 'សាច់ប្រាក់', icon: '💵' },
    { id: 'aba' as const, label: 'ABA', labelKm: 'ABA', icon: '📱' },
    { id: 'card' as const, label: 'Card', labelKm: 'កាត', icon: '💳' },
  ];

  quickAmounts = computed(() => {
    const t = this.effectiveTotal();
    const base = Math.ceil(t);
    return [base, base + 5, base + 10, base + 20].map(n => Math.ceil(n / 5) * 5).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
  });

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
    private customerService: CustomerService,
    private khqrService: KhqrService,
  ) {
    this.phoneSearch.pipe(
      debounceTime(500),
      switchMap(phone => {
        if (!phone || phone.length < 3) {
          this.customerSearching.set(false);
          this.customerSearchError.set(false);
          return of(null);
        }
        this.customerSearching.set(true);
        this.customerNotFound.set(false);
        this.customerSearchError.set(false);
        return this.customerService.findByPhone(phone).pipe(
          catchError((err) => {
            this.customerSearching.set(false);
            if (err.status === 404) {
              this.customerNotFound.set(true);
            } else {
              this.customerSearchError.set(true);
            }
            return of(null);
          }),
        );
      }),
    ).subscribe(customer => {
      this.customerSearching.set(false);
      if (customer) {
        this.customer.set(customer);
        this.customerNotFound.set(false);
      }
    });
  }

  onPhoneSearch(value: string): void {
    const phone = value.trim();
    this.customerPhone.set(phone);
    this.customer.set(null);
    this.customerNotFound.set(false);
    this.customerSearchError.set(false);
    this.customerSearching.set(false);
    this.pointsToRedeem.set(0);
    this.showRedeemInput.set(false);
    this.phoneSearch.next(phone);
  }

  clearCustomer(): void {
    this.customer.set(null);
    this.customerPhone.set('');
    this.customerNotFound.set(false);
    this.customerSearchError.set(false);
    this.pointsToRedeem.set(0);
    this.showRedeemInput.set(false);
  }

  /** Track the last amount that was used for QR generation */
  private lastQrAmount = 0;

  /** Generate KHQR when ABA is selected */
  generateKhqr(): void {
    if (this.selectedMethod() !== 'aba') return;
    const amount = this.effectiveTotal();
    if (amount <= 0) return;

    // Skip if amount hasn't changed and QR already generated
    if (amount === this.lastQrAmount && this.qrImage()) return;

    this.lastQrAmount = amount;
    this.qrLoading.set(true);
    this.qrError.set(false);
    this.qrImage.set(null);

    this.khqrService.generate(amount, `TXN-${Date.now()}`).subscribe({
      next: async (res) => {
        try {
          // Render QR code on the client side from the raw qrString
          const dataUrl = await this.khqrService.generateQrDataUrl(res.qrString);
          this.qrImage.set(dataUrl);
        } catch {
          this.qrError.set(true);
        }
        this.qrLoading.set(false);
      },
      error: () => {
        this.qrLoading.set(false);
        this.qrError.set(true);
      },
    });
  }

  toggleRedeem(): void {
    this.showRedeemInput.update(v => !v);
    if (!this.showRedeemInput()) {
      this.pointsToRedeem.set(0);
    }
  }

  setPointsToRedeem(ptsStr: string | number): void {
    const pts = typeof ptsStr === 'number' ? ptsStr : (parseInt(ptsStr, 10) || 0);
    const customer = this.customer();
    if (!customer) return;
    const max = customer.loyaltyPoints;
    this.pointsToRedeem.set(Math.min(Math.max(0, pts), max));
  }

  /** Watch for method changes to trigger QR generation */
  onMethodChange(method: 'cash' | 'aba' | 'card'): void {
    this.selectedMethod.set(method);
    if (method === 'aba') {
      this.generateKhqr();
    } else {
      this.qrImage.set(null);
      this.qrError.set(false);
    }
  }

  onCashChange(): void {
    this._change.set(this.cashReceived - this.effectiveTotal());
  }

  setCash(amount: number): void {
    this.cashReceived = amount;
    this._change.set(amount - this.effectiveTotal());
  }

  canConfirm(): boolean {
    if (this.selectedMethod() === 'cash') return this.cashReceived >= this.effectiveTotal();
    return true;
  }

  confirm(): void {
    const customer = this.customer();
    const ptsRedeemed = this.pointsToRedeem();
    const disc = this.loyaltyDiscount();
    const ptsEarned = this.pointsEarned();

    this.paid.emit({
      method: this.selectedMethod(),
      cashReceived: this.selectedMethod() === 'cash' ? this.cashReceived : undefined,
      customerId: customer?.id,
      customerName: customer?.name,
      pointsEarned: ptsEarned,
      pointsRedeemed: ptsRedeemed > 0 ? ptsRedeemed : undefined,
      loyaltyDiscount: disc > 0 ? disc : undefined,
    });
  }
}

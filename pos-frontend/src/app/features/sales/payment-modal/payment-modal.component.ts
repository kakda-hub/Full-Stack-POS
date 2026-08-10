import { ChangeDetectionStrategy, Component, computed, effect, Inject, OnDestroy, signal, untracked } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { backdropAnimation, modalAnimation } from '../../../shared/animations/animations';
import { animatePrice, prefersReducedMotion } from '../../../shared/helpers/price-tween.helper';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { CustomerService } from '../../../services/customer.service';
import { KhqrService } from '../../../services/khqr.service';
import { Customer } from '../../../models';
import { CartItem } from '../../../models/cart-item.model';
import { Subject, debounceTime, switchMap, of, catchError } from 'rxjs';

export interface PaymentDialogData {
  total: number;
  subtotal: number;
  processing: boolean;
  items: CartItem[];
  photoResolver: (category: string) => string | undefined;
}

@Component({
  selector: 'app-payment-modal',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent implements OnDestroy {
  total = 0;
  subtotal = 0;
  processing = false;
  items: CartItem[] = [];
  photoResolver: (category: string) => string | undefined = () => undefined;

  selectedMethod = signal<'cash' | 'aba' | 'card'>('cash');
  cashReceived = 0;
  private _change = signal(0);
  change = this._change.asReadonly();

  amountDueDisplay = signal(0);
  changeDisplay = signal(0);
  private amountDueRaf: { id: number | null } = { id: null };
  private changeRaf: { id: number | null } = { id: null };
  private reduceMotion = prefersReducedMotion();
  private displayInitialised = false;

  customerPhone = signal('');
  customer = signal<Customer | null>(null);
  customerSearching = signal(false);
  customerNotFound = signal(false);
  customerSearchError = signal(false);
  pointsToRedeem = signal(0);
  showRedeemInput = signal(false);

  qrImage = signal<string | null>(null);
  qrLoading = signal(false);
  qrError = signal(false);

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
    { id: 'cash' as const, labelKey: 'payment.cash', icon: '💵' },
    { id: 'aba' as const, labelKey: 'payment.aba', icon: '📱' },
    { id: 'card' as const, labelKey: 'payment.card', icon: '💳' },
  ];

  methodLabel(id: 'cash' | 'aba' | 'card'): string {
    const m = this.methods.find(x => x.id === id);
    return m ? this.lang.t(m.labelKey) : id;
  }

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
    private dialogRef: MatDialogRef<PaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: PaymentDialogData,
  ) {
    this.total = data.total;
    this.subtotal = data.subtotal;
    this.processing = data.processing;
    this.items = data.items;
    this.photoResolver = data.photoResolver;

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

    effect(() => {
      const amountDue = this.effectiveTotal();
      const change = this.change();
      untracked(() => {
        if (!this.displayInitialised) {
          this.amountDueDisplay.set(amountDue);
          this.changeDisplay.set(change);
          this.displayInitialised = true;
          return;
        }
        if (this.reduceMotion) {
          this.amountDueDisplay.set(amountDue);
          this.changeDisplay.set(change);
          return;
        }
        animatePrice(this.amountDueRaf, () => this.amountDueDisplay(), amountDue, v => this.amountDueDisplay.set(v));
        animatePrice(this.changeRaf, () => this.changeDisplay(), change, v => this.changeDisplay.set(v));
      });
    });
  }

  ngOnDestroy(): void {
    [this.amountDueRaf, this.changeRaf].forEach(r => {
      if (r.id !== null) cancelAnimationFrame(r.id);
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

  private lastQrAmount = 0;

  generateKhqr(): void {
    if (this.selectedMethod() !== 'aba') return;
    const amount = this.effectiveTotal();
    if (amount <= 0) return;
    if (amount === this.lastQrAmount && this.qrImage()) return;

    this.lastQrAmount = amount;
    this.qrLoading.set(true);
    this.qrError.set(false);
    this.qrImage.set(null);

    this.khqrService.generate(amount, `TXN-${Date.now()}`).subscribe({
      next: async (res) => {
        try {
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

    this.dialogRef.close({
      method: this.selectedMethod(),
      cashReceived: this.selectedMethod() === 'cash' ? this.cashReceived : undefined,
      customerId: customer?.id,
      customerName: customer?.name,
      pointsEarned: ptsEarned,
      pointsRedeemed: ptsRedeemed > 0 ? ptsRedeemed : undefined,
      loyaltyDiscount: disc > 0 ? disc : undefined,
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

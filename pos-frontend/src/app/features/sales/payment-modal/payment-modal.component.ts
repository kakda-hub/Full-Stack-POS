import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { backdropAnimation, modalAnimation } from '../../../shared/animations/animations';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';

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
  @Output() paid = new EventEmitter<{ method: 'cash' | 'aba' | 'card'; cashReceived?: number }>();
  @Output() cancel = new EventEmitter<void>();

  selectedMethod = signal<'cash' | 'aba' | 'card'>('cash');
  cashReceived = 0;
  private _change = signal(0);
  change = this._change.asReadonly();

  methods = [
    { id: 'cash' as const, label: 'Cash', labelKm: 'សាច់ប្រាក់', icon: '💵' },
    { id: 'aba' as const, label: 'ABA', labelKm: 'ABA', icon: '📱' },
    { id: 'card' as const, label: 'Card', labelKm: 'កាត', icon: '💳' },
  ];

  quickAmounts = computed(() => {
    const t = this.total;
    const base = Math.ceil(t);
    return [base, base + 5, base + 10, base + 20].map(n => Math.ceil(n / 5) * 5).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
  });

  constructor(public lang: LanguageService, public theme: ThemeService) {}

  onCashChange(): void {
    this._change.set(this.cashReceived - this.total);
  }

  setCash(amount: number): void {
    this.cashReceived = amount;
    this._change.set(amount - this.total);
  }

  canConfirm(): boolean {
    if (this.selectedMethod() === 'cash') return this.cashReceived >= this.total;
    return true;
  }

  confirm(): void {
    this.paid.emit({
      method: this.selectedMethod(),
      cashReceived: this.selectedMethod() === 'cash' ? this.cashReceived : undefined,
    });
  }
}

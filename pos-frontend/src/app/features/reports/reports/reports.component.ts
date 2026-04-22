import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Transaction } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { ProductService } from '../../../core/services/product.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, pageTransition, listAnimation],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  today = new Date();
  isLoading = signal(true);
  Object = Object;

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 600);
  }

  paymentEntries = computed(() => {
    const breakdown = this.txnService.paymentBreakdown();
    const total = Object.values(breakdown).reduce((s, v) => s + v.amount, 0);
    return Object.entries(breakdown).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      pct: total > 0 ? (data.amount / total) * 100 : 0,
    }));
  });

  constructor(
    public txnService: TransactionService,
    public productService: ProductService,
    public lang: LanguageService,
    public theme: ThemeService,
  ) {}

  getPaymentIcon(method: string): string {
    return { cash: '💵', aba: '📱', card: '💳' }[method] || '💰';
  }

  getBarColor(method: string): string {
    return (
      { cash: 'bg-emerald-500', aba: 'bg-indigo-500', card: 'bg-violet-500' }[method] ||
      'bg-slate-400'
    );
  }

  getPaymentBadge(method: string): string {
    return (
      {
        cash: 'bg-emerald-50 text-emerald-700',
        aba: 'bg-indigo-50 text-indigo-700',
        card: 'bg-violet-50 text-violet-700',
      }[method] || 'bg-slate-50 text-slate-700'
    );
  }

  trackById(_: number, t: Transaction): string {
    return t.id;
  }
}

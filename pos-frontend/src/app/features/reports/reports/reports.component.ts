import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { LanguageService } from '../../../core/services/language.service';
import { ProductService } from '../../../core/services/product.service';
import { ThemeService } from '../../../core/services/theme.service';
import {
  ReportService,
  ReportSummary,
  PaymentSummaryEntry,
  DailyRevenueEntry,
  TopProductEntry,
  SalesByCashierEntry,
} from '../../../core/services/api/report.service';
import { SaleService } from '../../../core/services/api/sale.service';

type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

interface SaleItem {
  id: number;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  paymentMethod: string;
  createdAt: string;
  items: { id: number; quantity: number; price: number; product?: { id: number; name: string; barcode: string } }[];
  user?: { id: number; name: string; email: string };
}

@Component({
  selector: 'app-reports',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, pageTransition, listAnimation],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  isLoading = signal(false);
  Object = Object;

  // Date range
  datePreset = signal<DateRangePreset>('today');
  customFrom = signal('');
  customTo = signal('');

  // API data
  summary = signal<ReportSummary | null>(null);
  paymentSummary = signal<PaymentSummaryEntry[]>([]);
  dailyRevenue = signal<DailyRevenueEntry[]>([]);
  topProducts = signal<TopProductEntry[]>([]);
  salesByCashier = signal<SalesByCashierEntry[]>([]);
  sales = signal<SaleItem[]>([]);

  // Computed date range strings
  dateRange = computed(() => {
    const preset = this.datePreset();
    const today = new Date();
    const yyyyMmDd = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'custom') {
      return { from: this.customFrom() || undefined, to: this.customTo() || undefined };
    }

    const todayStr = yyyyMmDd(today);

    if (preset === 'today') {
      return { from: todayStr, to: todayStr };
    }

    if (preset === 'week') {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay()); // Sunday
      return { from: yyyyMmDd(start), to: todayStr };
    }

    // month
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: yyyyMmDd(start), to: todayStr };
  });

  // Computed payment entries for chart
  paymentEntries = computed(() => {
    const entries = this.paymentSummary();
    const total = entries.reduce((s, e) => s + e.totalRevenue, 0);
    return entries.map((e) => ({
      method: e.paymentMethod,
      amount: e.totalRevenue,
      count: e.totalTransactions,
      pct: total > 0 ? (e.totalRevenue / total) * 100 : 0,
    }));
  });

  // Computed daily revenue entries for bar chart
  dailyRevenueEntries = computed(() => {
    const entries = this.dailyRevenue();
    const maxRev = Math.max(...entries.map((e) => e.revenue), 1);
    return entries.map((e) => ({
      date: e.date,
      revenue: e.revenue,
      totalSales: e.totalSales,
      pct: (e.revenue / maxRev) * 100,
    }));
  });

  // Computed top product entries w/ percentage for bars
  topProductEntries = computed(() => {
    const entries = this.topProducts();
    const maxQty = Math.max(...entries.map((e) => e.totalQuantitySold), 1);
    return entries.map((e) => ({
      productId: e.productId,
      productName: e.productName,
      barcode: e.barcode,
      totalQuantitySold: e.totalQuantitySold,
      totalRevenue: e.totalRevenue,
      pct: (e.totalQuantitySold / maxQty) * 100,
    }));
  });

  // Computed cashier entries w/ percentage
  cashierEntries = computed(() => {
    const entries = this.salesByCashier();
    const maxRev = Math.max(...entries.map((e) => e.totalRevenue), 1);
    return entries.map((e) => ({
      userId: e.userId,
      cashierName: e.cashierName,
      totalSales: e.totalSales,
      totalRevenue: e.totalRevenue,
      pct: (e.totalRevenue / maxRev) * 100,
    }));
  });

  // Low stock count from summary
  lowStockCount = computed(() => this.summary()?.lowStockProducts?.length ?? 0);

  // Near-expiry products
  nearExpiryProducts = computed(() => this.productService.nearExpiryProducts());

  // Helper: format date label (DD/MM), returns fallback for invalid dates
  formatDateLabel(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '—';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  constructor(
    public reportService: ReportService,
    public saleService: SaleService,
    public productService: ProductService,
    public lang: LanguageService,
    public theme: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  setDatePreset(preset: DateRangePreset): void {
    this.datePreset.set(preset);
    this.loadData();
  }

  onCustomDateChange(): void {
    if (this.datePreset() === 'custom') {
      this.loadData();
    }
  }

  loadData(): void {
    this.isLoading.set(true);
    const { from, to } = this.dateRange();

    // Fetch all in parallel
    this.reportService.getSummary(from, to).subscribe({
      next: (res) => this.summary.set(res),
      error: () => this.summary.set(null),
    });

    this.reportService.getPaymentSummary(from, to).subscribe({
      next: (res) => this.paymentSummary.set(res),
      error: () => this.paymentSummary.set([]),
    });

    this.reportService.getDailyRevenue(from, to).subscribe({
      next: (res) => this.dailyRevenue.set(res),
      error: () => this.dailyRevenue.set([]),
    });

    this.reportService.getTopProducts(5, from, to).subscribe({
      next: (res) => this.topProducts.set(res),
      error: () => this.topProducts.set([]),
    });

    this.reportService.getSalesByCashier(from, to).subscribe({
      next: (res) => this.salesByCashier.set(res),
      error: () => this.salesByCashier.set([]),
    });

    this.saleService.getAllSales().subscribe({
      next: (res) => {
        this.sales.set(Array.isArray(res) ? res : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.sales.set([]);
        this.isLoading.set(false);
      },
    });
  }

  getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getExpiryBadgeClass(days: number): string {
    if (days <= 7) return 'bg-rose-50 text-rose-700';
    if (days <= 14) return 'bg-amber-50 text-amber-700';
    return 'bg-yellow-50 text-yellow-700';
  }

  getPaymentIcon(method: string): string {
    return { cash: '💵', aba: '📱', card: '💳' }[method.toLowerCase()] || '💰';
  }

  getBarColor(method: string): string {
    return (
      { cash: 'bg-emerald-500', aba: 'bg-indigo-500', card: 'bg-violet-500' }[method.toLowerCase()] ||
      'bg-slate-400'
    );
  }

  getPaymentBadge(method: string): string {
    return (
      {
        cash: 'bg-emerald-50 text-emerald-700',
        aba: 'bg-indigo-50 text-indigo-700',
        card: 'bg-violet-50 text-violet-700',
      }[method.toLowerCase()] || 'bg-slate-50 text-slate-700'
    );
  }

  trackById(_: number, t: any): number {
    return t.id;
  }
}

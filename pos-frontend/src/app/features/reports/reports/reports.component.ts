import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation } from '../../../shared/animations/animations';
import { LanguageService } from '../../../services/shared/language.service';
import { ProductService } from '../../../services/shared/product.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { ReportService } from '../../../services/report.service';
import { SaleService } from '../../../services/sale.service';
import {
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexTooltip,
  ApexGrid,
  ApexDataLabels,
  ApexStates,
  ApexNoData,
  ApexTheme,
} from 'ng-apexcharts';
import { SaleItem } from '../../../models/sale';
import {
  ReportSummary,
  PaymentSummaryEntry,
  DailyRevenueEntry,
  TopProductEntry,
  SalesByCashierEntry,
} from '../../../models';

type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

// interface SaleItem {
//   id: number;
//   total: number;
//   subtotal: number;
//   discount: number;
//   tax: number;
//   paymentMethod: string;
//   createdAt: string;
//   items: { id: number; quantity: number; price: number; product?: { id: number; name: string; barcode: string } }[];
//   user?: { id: number; name: string; email: string };
// }

@Component({
  selector: 'app-reports',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation],
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

  // ───────────────────────────────────────────────────────────────
  // ApexCharts Options (reacts to data, theme & language changes)
  // ───────────────────────────────────────────────────────────────
  chartSeries = computed<{ name: string; data: number[] }[]>(() => {
    const entries = this.dailyRevenueEntries();
    return [{
      name: this.lang.t('reports.revenue'),
      data: entries.map((e) => e.revenue),
    }];
  });

  chartCategories = computed<string[]>(() => {
    return this.dailyRevenueEntries().map((e) => this.formatDateLabel(e.date));
  });

  chartColors = computed<string[]>(() => {
    return [this.theme.isDark() ? '#818cf8' : '#6366f1'];
  });

  chartConfig = computed<ApexChart>(() => ({
    type: 'bar',
    height: 220,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
      export: {
        csv: {
          filename: `daily-revenue-${new Date().toISOString().split('T')[0]}`,
          columnDelimiter: ',',
          headerCategory: this.lang.t('reports.date'),
          headerValue: this.lang.t('reports.revenue'),
        },
        svg: {
          filename: `daily-revenue-${new Date().toISOString().split('T')[0]}`,
        },
        png: {
          filename: `daily-revenue-${new Date().toISOString().split('T')[0]}`,
        },
      },
    },
    animations: {
      enabled: true,
      speed: 500,
      animateGradually: { enabled: true, delay: 100 },
    },
    foreColor: this.theme.isDark() ? '#94a3b8' : '#64748b',
    background: 'transparent',
    fontFamily: 'inherit',
    parentHeightOffset: 0,
    sparkline: { enabled: false },
    redrawOnParentResize: true,
  }));

  chartPlotOptions = computed<ApexPlotOptions>(() => ({
    bar: {
      borderRadius: 6,
      columnWidth: '55%',
      borderRadiusApplication: 'end',
      distributed: false,
    },
  }));

  chartXaxis = computed<ApexXAxis>(() => ({
    categories: this.chartCategories(),
    labels: {
      show: true,
      rotate: 0,
      trim: true,
      style: {
        colors: this.theme.isDark() ? '#94a3b8' : '#64748b',
        fontSize: '10px',
        fontFamily: 'inherit',
        fontWeight: 500,
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  }));

  chartYaxis = computed<ApexYAxis>(() => ({
    show: true,
    labels: {
      style: {
        colors: this.theme.isDark() ? '#94a3b8' : '#64748b',
        fontSize: '11px',
        fontFamily: 'inherit',
        fontWeight: 500,
      },
      formatter: (val: number) => `$${val.toFixed(0)}`,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  chartGrid = computed<ApexGrid>(() => ({
    show: true,
    borderColor: this.theme.isDark() ? '#334155' : '#e2e8f0',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  }));

  chartTooltip = computed<ApexTooltip>(() => {
    const isDark = this.theme.isDark();
    const entries = this.dailyRevenueEntries();
    return {
      enabled: true,
      shared: false,
      followCursor: true,
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px', fontFamily: 'inherit' },
      y: {
        formatter: (val: number, opts?: any) => {
          const idx = opts?.dataPointIndex ?? 0;
          const salesCount = entries[idx]?.totalSales ?? 0;
          const salesLabel = this.lang.t('reports.sales');
          return `$${val.toFixed(2)} (${salesCount} ${salesLabel})`;
        },
      },
    };
  });

  chartStates = computed<ApexStates>(() => ({
    hover: { filter: { type: 'darken', value: 0.15 } },
    active: { allowMultipleDataPointsSelection: false, filter: { type: 'darken' } },
  }));

  chartNoData = computed<ApexNoData>(() => ({
    text: this.lang.t('reports.noDataRange'),
    align: 'center',
    verticalAlign: 'middle',
    style: { color: '#94a3b8', fontSize: '14px', fontFamily: 'inherit' },
  }));

  chartTheme = computed<ApexTheme>(() => ({
    mode: this.theme.isDark() ? 'dark' : 'light',
  }));

  chartDataLabels = computed<ApexDataLabels>(() => ({ enabled: false }));

  // Helper: format date label (DD/MM), returns fallback for invalid dates
  formatDateLabel(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';

    // Handle raw YYYY-MM-DD without going through Date constructor
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [, m, d] = dateStr.split('-');
      return `${d}/${m}`;
    }

    // Handle ISO datetime or other parseable strings
    const d = new Date(dateStr);
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

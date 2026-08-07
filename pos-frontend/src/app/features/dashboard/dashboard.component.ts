import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { fadeIn } from '../../shared/animations/animations';
import { Product } from '../../models';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import {
  ReportService,
  ReportSummary,
  TopProductEntry,
} from '../../core/services/api/report.service';
import { SaleService } from '../../core/services/api/sale.service';

interface SaleItem {
  id: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  user?: { id: number; name: string };
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isLoading = signal(true);
  summary = signal<ReportSummary | null>(null);
  topProducts = signal<TopProductEntry[]>([]);
  recentSales = signal<SaleItem[]>([]);

  // ── Computed KPIs ──────────────────────────────────────────────────────
  lowStockCount = computed(() => this.summary()?.lowStockProducts?.length ?? 0);
  nearExpiryCount = computed(() => this.productService.nearExpiryProducts().length);
  totalProducts = computed(() => this.productService.products().length);

  // ── Low stock list (mirrors the low-stock drawer styling) ────────────────
  dashboardLowStock = computed(() => this.productService.lowStockProducts().slice(0, 8));

  // ── Computed greeting ──────────────────────────────────────────────────
  greeting = computed(() => {
    const hour = new Date().getHours();
    const name = this.auth.currentUser()?.name || '';
    if (this.lang.currentLang() === 'km') {
      if (hour < 12) return `អរុណសួស្តី ${name}`;
      if (hour < 17) return `ទិវាសួស្តី ${name}`;
      return `សាយ័ណ្ហសួស្តី ${name}`;
    }
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  });

  // ── Date formatting helpers ─────────────────────────────────────────────
  todayLabel = computed(() => {
    const d = new Date();
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
    return d.toLocaleDateString(this.lang.currentLang() === 'km' ? 'km-KH' : 'en-US', opts);
  });

  // ── Top 5 products for mini-list ────────────────────────────────────────
  topProductEntries = computed(() => {
    const entries = this.topProducts();
    const maxQty = Math.max(...entries.map((e) => e.totalQuantitySold), 1);
    return entries.slice(0, 5).map((e) => ({
      name: e.productName,
      qty: e.totalQuantitySold,
      revenue: e.totalRevenue,
      pct: (e.totalQuantitySold / maxQty) * 100,
    }));
  });

  // ── Recent sales ────────────────────────────────────────────────────────
  recentEntries = computed(() => {
    return this.recentSales()
      .slice(0, 6)
      .map((s) => ({
        id: s.id,
        total: s.total,
        method: s.paymentMethod,
        time: new Date(s.createdAt),
        cashier: s.user?.name || '—',
      }));
  });

  constructor(
    public reportService: ReportService,
    public saleService: SaleService,
    public productService: ProductService,
    public lang: LanguageService,
    public theme: ThemeService,
    public auth: AuthService,
    private router: Router,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadData();
  }

  // ── Data fetching ─────────────────────────────────────────────────────────
  private loadData(): void {
    this.isLoading.set(true);

    const today = new Date().toISOString().split('T')[0];

    forkJoin({
      summary: this.reportService.getSummary(today, today).pipe(
        catchError(() => of(null)),
      ),
      topProducts: this.reportService.getTopProducts(5, today, today).pipe(
        catchError(() => of([] as TopProductEntry[])),
      ),
      sales: this.saleService.getAllSales().pipe(
        catchError(() => of([])),
      ),
    }).subscribe({
      next: (res) => {
        this.summary.set(res.summary as ReportSummary | null);
        this.topProducts.set(res.topProducts as TopProductEntry[]);

        const todayStr = new Date().toISOString().split('T')[0];
        const sales = Array.isArray(res.sales) ? res.sales : [];
        const todaySales = sales.filter(
          (s: SaleItem) => s.createdAt?.startsWith(todayStr),
        );
        this.recentSales.set(todaySales);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  // ── Low stock helpers ────────────────────────────────────────────────────
  /** Percentage of the low-stock threshold remaining, clamped to 0-100. */
  lowStockPercent(item: Product): number {
    const threshold =
      item.lowStockThreshold && item.lowStockThreshold > 0
        ? item.lowStockThreshold
        : 10;
    return Math.max(0, Math.min(100, Math.round((item.stock / threshold) * 100)));
  }

  getCategoryName = (categoryId: string): string => {
    const cat = this.productService
      .categories()
      .find((c) => c.id === categoryId);
    if (!cat) return categoryId;
    return this.lang.currentLang() === 'km' && cat.nameKm ? cat.nameKm : cat.name;
  };

  // ── Navigation helpers ──────────────────────────────────────────────────
  goTo(route: string): void {
    this.router.navigate([route]);
  }

  // ── Payment icon helper ─────────────────────────────────────────────────
  getPaymentIcon(method: string): string {
    return { cash: '💵', aba: '📱', card: '💳' }[method.toLowerCase()] || '💰';
  }

  // ── Time formatting ─────────────────────────────────────────────────────
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ── Refresh handler ─────────────────────────────────────────────────────
  refresh(): void {
    this.loadData();
  }
}

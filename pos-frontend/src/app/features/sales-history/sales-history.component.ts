import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { backdropAnimation, fadeIn, modalAnimation } from '../../shared/animations/animations';
import { LanguageService } from '../../services/shared/language.service';
import { ThemeService } from '../../services/shared/theme.service';
import { SaleService } from '../../services/sale.service';
import { nextSort, SortDirection } from '../../shared/helpers/sort.helper';
import { ListQuery } from '../../models/list-query';
import { SaleDetail, SaleDisplay } from '../../models/sales-history.model';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sales-history',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [backdropAnimation, fadeIn, modalAnimation],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.scss',
})
export class SalesHistoryComponent implements OnInit, OnDestroy {
  // Server-side pagination state — `sales` holds the current page
  sales = signal<SaleDisplay[]>([]);
  totalItems = signal(0);
  isLoading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = 15;

  // Sorting (fields must be in the backend sort allowlist: createdAt, total, ...)
  sortBy = signal('createdAt');
  sortDir = signal<SortDirection>('desc');

  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  activeQuickFilter = signal<string>('all');
  searchQuery = signal<string>('');

  selectedSale = signal<SaleDetail | null>(null);

  // KPI stats come from a separate search/date-scoped snapshot (capped at the
  // same 100 records the old client-side page used), so the cards stay accurate
  // even though the table only renders one page.
  statsSales = signal<SaleDisplay[]>([]);
  totalRevenue = computed(() => this.statsSales().reduce((sum, s) => sum + s.total, 0));
  uniqueCashiers = computed(() => {
    const names = new Set(this.statsSales().map((s) => s.cashierName));
    return Array.from(names);
  });
  averageOrderValue = computed(() =>
    this.statsSales().length > 0 ? this.totalRevenue() / this.statsSales().length : 0
  );

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private statsSeq = 0;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
    private saleService: SaleService,
  ) {}

  ngOnInit(): void {
    this.fetchPage();
    this.loadStats();

    // Search is debounced and hits the server (cashier name / sale ID).
    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q.trim());
        this.currentPage.set(1); // reset offset to 0 on search
        this.fetchPage();
        this.loadStats();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Standard offset-based list query: max/offset/sort/sortBy/search/date range. */
  private buildQuery(): ListQuery {
    return {
      search: this.searchQuery() || undefined,
      sortBy: this.sortBy(),
      sort: this.sortDir(),
      offset: (this.currentPage() - 1) * this.pageSize,
      max: this.pageSize,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
    };
  }

  /** Fetches one server-side page and keeps the raw rows for the detail modal. */
  private fetchPage(): void {
    this.isLoading.set(true);
    this.error.set(null);
    const seq = ++this.loadSeq;

    this.saleService.getSalesPage(this.buildQuery()).subscribe({
      next: (res) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const data = res?.data ?? [];
        // After a delete (or concurrent data shrink) the current page may be
        // empty while more records exist — step back one page.
        if (data.length === 0 && this.currentPage() > 1 && (res?.total ?? 0) > 0) {
          this.currentPage.update((p) => p - 1);
          this.fetchPage();
          return;
        }
        this._rawSales = data;
        const mapped = data.map((sale: any) => this.mapSale(sale));
        this.sales.set(mapped);
        this.totalItems.set(res?.total ?? data.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to fetch sales', err);
        this.error.set(
          this.lang.currentLang() === 'km'
            ? 'មិនអាចផ្ទុកប្រវត្តិការលក់បានទេ'
            : 'Failed to load sales history'
        );
        this.sales.set([]);
        this.totalItems.set(0);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Global KPI snapshot (max=100, same filter scope as the table) so the
   * revenue / cashier / average cards match the active search + date range.
   */
  private loadStats(): void {
    const seq = ++this.statsSeq; // stale-response guard (rapid filter changes)
    this.saleService.getSalesPage({
      search: this.searchQuery() || undefined,
      sortBy: 'createdAt',
      sort: 'desc',
      offset: 0,
      max: 100,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
    }).subscribe({
      next: (res) => {
        if (seq !== this.statsSeq) return; // stale response — ignore
        this.statsSales.set((res?.data ?? []).map((sale: any) => this.mapSale(sale)));
      },
      error: () => {
        if (seq !== this.statsSeq) return; // stale response — ignore
        this.statsSales.set([]);
      },
    });
  }

  private mapSale(sale: any): SaleDisplay {
    const items = sale?.items ?? [];
    return {
      id: sale.id,
      date: new Date(sale.createdAt),
      cashierName: sale?.user?.name ?? 'Unknown',
      itemsCount: items.length,
      itemsList: items
        .slice(0, 3)
        .map((i: any) => i?.product?.name ?? `#${i.productId}`)
        .join(', ') + (items.length > 3 ? ` +${items.length - 3} more` : ''),
      paymentMethod: sale.paymentMethod ?? 'cash',
      subtotal: Number(sale.subtotal ?? 0),
      discount: Number(sale.discount ?? 0),
      tax: Number(sale.tax ?? 0),
      total: Number(sale.total ?? 0),
    };
  }

  private mapDetail(sale: any): SaleDetail {
    const items = sale?.items ?? [];
    return {
      id: sale.id,
      date: new Date(sale.createdAt),
      cashierName: sale?.user?.name ?? 'Unknown',
      paymentMethod: sale.paymentMethod ?? 'cash',
      subtotal: Number(sale.subtotal ?? 0),
      discount: Number(sale.discount ?? 0),
      tax: Number(sale.tax ?? 0),
      total: Number(sale.total ?? 0),
      items: items.map((i: any) => ({
        productName: i?.product?.name ?? `Product #${i.productId}`,
        quantity: i.quantity,
        unitPrice: Number(i.price ?? 0),
        lineTotal: Number(i.price ?? 0) * i.quantity,
      })),
    };
  }

  openDetail(saleDisplay: SaleDisplay): void {
    const rawSale = this._rawSales?.find((r) => r.id === saleDisplay.id);
    if (rawSale) {
      this.selectedSale.set(this.mapDetail(rawSale));
    }
  }

  closeDetail(): void {
    this.selectedSale.set(null);
  }

  private _rawSales: any[] = [];

  trackById(_: number, sale: SaleDisplay): number {
    return sale.id;
  }

  getPaymentIcon(method: string): string {
    return { cash: '💵', aba: '📱', card: '💳' }[method] || '💰';
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

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize) || 1;
  }

  quickFilters = [
    { key: 'all', label: 'All Time', labelKm: 'ទាំងអស់' },
    { key: 'today', label: 'Today', labelKm: 'ថ្ងៃនេះ' },
    { key: 'week', label: 'This Week', labelKm: 'សប្តាហ៍នេះ' },
    { key: 'month', label: 'This Month', labelKm: 'ខែនេះ' },
  ];

  onSearch(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.fetchPage();
    this.loadStats();
  }

  onDateChange(event: Event, field: 'from' | 'to'): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'from') {
      this.dateFrom.set(value);
    } else {
      this.dateTo.set(value);
    }
    this.activeQuickFilter.set('');
    this.currentPage.set(1);
    this.fetchPage();
    this.loadStats();
  }

  setQuickFilter(filter: string): void {
    this.activeQuickFilter.set(filter);
    this.currentPage.set(1);
    const now = new Date();

    switch (filter) {
      case 'today': {
        const todayStr = this.formatDate(now);
        this.dateFrom.set(todayStr);
        this.dateTo.set(todayStr);
        break;
      }
      case 'week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        this.dateFrom.set(this.formatDate(startOfWeek));
        this.dateTo.set('');
        break;
      }
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.dateFrom.set(this.formatDate(startOfMonth));
        this.dateTo.set('');
        break;
      }
      default: {
        this.dateFrom.set('');
        this.dateTo.set('');
        break;
      }
    }

    this.fetchPage();
    this.loadStats();
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  printReceipt(): void {
    const sale = this.selectedSale();
    if (!sale) return;

    const win = window.open('', '_blank');
    if (!win) return;

    const itemsHtml = sale.items.map((item, i) => `
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
        <span style="flex:1;">${i + 1}. ${item.productName}</span>
        <span>$${item.unitPrice.toFixed(2)} × ${item.quantity}</span>
      </div>
      <div style="text-align: right; font-weight: bold; font-size: 12px; margin-bottom: 6px;">= $${item.lineTotal.toFixed(2)}</div>
    `).join('');

    const discountHtml = sale.discount
      ? `<div style="display: flex; justify-content: space-between; color: #059669;"><span>Discount</span><span> -$${sale.discount.toFixed(2)}</span></div>`
      : '';

    const taxHtml = sale.tax
      ? `<div style="display: flex; justify-content: space-between;"><span>Tax</span><span> $${sale.tax.toFixed(2)}</span></div>`
      : '';

    win.document.write(`
      <html><head>
      <title>Receipt #${sale.id}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 4mm; color: #333; }
        .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 8px; margin-bottom: 8px; }
        .header h3 { margin: 0; font-size: 16px; font-weight: 900; }
        .header p { margin: 2px 0; color: #666; font-size: 11px; }
        .meta { border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px; font-size: 11px; }
        .meta .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .meta .label { color: #888; }
        .items { border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px; }
        .totals { border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px; font-size: 11px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .grand-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; padding-top: 4px; border-top: 1px solid #333; margin-top: 4px; }
        .grand-total span:last-child { color: #4f46e5; }
        .footer { text-align: center; color: #999; font-size: 10px; padding-top: 8px; }
        @media print { @page { size: 80mm auto; margin: 0; } }
      </style>
      </head><body>
        <div class="header">
          <h3>MiniMart Store</h3>
          <p>Phnom Penh, Cambodia</p>
          <p>Tel: +855 23 000 000</p>
        </div>

        <div class="meta">
          <div class="row"><span class="label">Receipt</span><span style="font-weight: bold;">#${sale.id}</span></div>
          <div class="row"><span class="label">Date</span><span>${sale.date.toLocaleDateString()} ${sale.date.toLocaleTimeString()}</span></div>
          <div class="row"><span class="label">Cashier</span><span>${sale.cashierName}</span></div>
          <div class="row"><span class="label">Payment</span><span style="text-transform: uppercase; font-weight: bold;">${sale.paymentMethod}</span></div>
        </div>

        <div class="items">
          ${itemsHtml}
        </div>

        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>$${sale.subtotal.toFixed(2)}</span></div>
          ${discountHtml}
          ${taxHtml}
          <div class="grand-total"><span>TOTAL</span><span>$${sale.total.toFixed(2)}</span></div>
        </div>

        <div class="footer">
          <p>Thank you! Please come again.</p>
          <p style="margin-top:4px;">Powered by MiniMart</p>
        </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchPage();
  }

  /** Column header click: toggle asc/desc on the active column, else start asc. */
  onSort(field: string): void {
    // Date/total default to descending first (newest / highest first).
    const next = nextSort(this.sortBy(), this.sortDir(), field, ['createdAt', 'total']);
    this.sortBy.set(next.sortBy);
    this.sortDir.set(next.sort);
    this.currentPage.set(1); // reset offset to 0 on sort change
    this.fetchPage();
  }

  refresh(): void {
    this.fetchPage();
    this.loadStats();
  }
}

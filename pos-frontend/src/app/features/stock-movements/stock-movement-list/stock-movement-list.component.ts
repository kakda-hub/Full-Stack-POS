import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { StockMovementService } from '../../../core/services/api/stock-movement.service';
import { ProductService } from '../../../core/services/api/product.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-stock-movement-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './stock-movement-list.component.html',
  styleUrl: './stock-movement-list.component.scss',
})
export class StockMovementListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  movements = signal<any[]>([]);
  filteredMovements = signal<any[]>([]);
  products: any[] = [];

  // Filters
  selectedProductId = signal<number | null>(null);
  selectedType = signal<string>('');
  searchQuery = signal<string>('');

  // Pagination
  pageSize = signal(20);
  pageIndex = signal(0);
  paginatedMovements = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredMovements().slice(startIndex, startIndex + this.pageSize());
  });

  // Stats
  totalIn = computed(() =>
    this.filteredMovements()
      .filter((m) => m.quantity > 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  );
  totalOut = computed(() =>
    this.filteredMovements()
      .filter((m) => m.quantity < 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  );

  readonly movementTypes = StockMovementService.MOVEMENT_TYPES;
  /** Class reference so static methods can be called in the template */
  readonly MovementService = StockMovementService;

  private destroy$ = new Subject<void>();

  constructor(
    public movementService: StockMovementService,
    public productApiService: ProductService,
    public lang: LanguageService,
    public theme: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();
  }

  loadProducts(): void {
    this.productApiService.getAllProducts().subscribe((data: any) => {
      this.products = data || [];
    });
  }

  loadMovements(): void {
    this.isLoading.set(true);
    this.movementService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data ?? res ?? [];
        this.movements.set(data);
        this.applyFilters();
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.movements.set([]);
        this.filteredMovements.set([]);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  applyFilters(): void {
    let result = this.movements();

    if (this.selectedProductId()) {
      result = result.filter((m) => m.productId === this.selectedProductId());
    }
    if (this.selectedType()) {
      result = result.filter((m) => m.type === this.selectedType());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(
        (m) =>
          (m.product?.name || '').toLowerCase().includes(q) ||
          (m.product?.barcode || '').toLowerCase().includes(q) ||
          (m.note || '').toLowerCase().includes(q)
      );
    }

    this.filteredMovements.set(result);
    this.pageIndex.set(0);
  }

  onProductFilter(productId: number | null): void {
    this.selectedProductId.set(productId);
    this.applyFilters();
  }

  onTypeFilter(type: string): void {
    this.selectedType.set(type);
    this.applyFilters();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page - 1);
  }

  /** Get product name by ID */
  getProductName(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return `#${productId}`;
    return this.lang.currentLang() === 'km' && product.nameKh
      ? product.nameKh
      : product.name;
  }

  /** Format quantity with +/- sign and color class */
  getQuantityClass(qty: number): string {
    if (qty > 0) return 'qty--in';
    if (qty < 0) return 'qty--out';
    return '';
  }

  getQuantitySign(qty: number): string {
    return qty > 0 ? '+' : '';
  }

  /** Format a numeric value as a price string */
  formatPrice(value: any): string {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  /** Format date to readable string */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(this.lang.currentLang() === 'km' ? 'km-KH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_: number, m: any): string {
    return m.id;
  }
}

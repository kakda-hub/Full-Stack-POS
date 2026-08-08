import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimationSnappy } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Product } from '../../../models';
import { nextSort, SortDirection } from '../../../shared/helpers/sort.helper';
import { AlertService } from '../../../services/shared/alert.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ProductService as CoreProductService } from '../../../services/shared/product.service';
import { ProductService as ApiProductService } from '../../../services/product.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { PurchaseOrderDetailComponent } from '../../purchase-orders/purchase-order-detail/purchase-order-detail.component';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogConfig } from '../../../enums/dialog-config.enum';

@Component({
  selector: 'app-product-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimationSnappy],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit, OnDestroy {
  showForm = false;
  isLoading = signal(true);
  /** True after the first load completes — the skeleton only shows before this. */
  hasLoadedOnce = signal(false);
  editingProduct: Product | null = null;

  isLowStockDrawerOpen = false;
  lowStockThreshold = 10;
  /** Products with a stock-adjust request currently in flight. */
  pendingStockAdjusts = signal<string[]>([]);

  // Server-side pagination state
  products = signal<Product[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);
  searchQuery = signal('');
  selectedCategory = signal('all');

  // Server-side sorting (fields must be in the backend sort allowlist)
  sortBy = signal('name');
  sortDir = signal<SortDirection>('asc');

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onCategorySelect(id: string) {
    this.selectedCategory.set(id);
    this.currentPage.set(1);
    this.loadProducts();
  }

  /** Column header click: toggle asc/desc on the active column, else start asc. */
  onSort(field: string): void {
    // Price/stock default to descending first (highest first); text fields to ascending.
    const next = nextSort(this.sortBy(), this.sortDir(), field, ['price', 'stock']);
    this.sortBy.set(next.sortBy);
    this.sortDir.set(next.sort);
    this.currentPage.set(1);
    this.loadProducts();
  }

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true
  }

  constructor(
    public productService: CoreProductService,
    private apiProductService: ApiProductService,
    public lang: LanguageService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private reusableDialogService: ReusableDialogService,
  ) {
    this.reusableDialogService.setDialogComponent(ProductDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadProducts();
    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(q => {
        this.searchQuery.set(q.trim());
        this.currentPage.set(1);
        this.loadProducts();
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }

  /** Loads one server-side page using the standard list query params. */
  loadProducts(): void {
    this.isLoading.set(true);
    const seq = ++this.loadSeq;
    const query: any = {
      search: this.searchQuery() || undefined,
      sortBy: this.sortBy(),
      sort: this.sortDir(),
      offset: (this.currentPage() - 1) * this.pageSize(),
      max: this.pageSize(),
    };
    if (this.selectedCategory() !== 'all') {
      query.categoryId = this.selectedCategory();
    }

    this.apiProductService.getProducts(query).subscribe({
      next: (res) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const data = res?.data ?? [];
        // After a delete, the current page may be empty — step back one page.
        if (data.length === 0 && this.currentPage() > 1) {
          this.currentPage.update(p => p - 1);
          this.loadProducts();
          return;
        }
        this.products.set(data.map((p: any) => this.mapApiProduct(p)));
        this.totalItems.set(res?.total ?? data.length);
        this.hasLoadedOnce.set(true);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to load products', err);
        this.products.set([]);
        this.totalItems.set(0);
        this.hasLoadedOnce.set(true);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private mapApiProduct(p: any): Product {
    return {
      id: String(p.id),
      name: p.name,
      nameKm: p.nameKh,
      price: Number(p.price),
      costPrice: p.costPrice !== undefined ? Number(p.costPrice) : undefined,
      barcode: p.barcode,
      category: String(p.categoryId),
      stock: p.stock,
      imgUrl: p.imgUrl,
      lowStockThreshold: p.lowStockThreshold !== undefined ? Number(p.lowStockThreshold) : undefined,
      expiryDate: p.expiryDate || undefined,
      description: p.description,
    };
  }

  onAdd(): void {
    this.editingProduct = null;
    this.openDialog();
  }

  openEdit(p: Product): void {
    this.editingProduct = p;
    this.openDialog();
  }

  deleteProduct(p: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.t('confirm.title'),
        message: this.lang.t('confirm.deleteQuestion', { name: p.name }),
        confirmLabel: this.lang.t('confirm.deleteLabel'),
        cancelLabel: this.lang.t('confirm.cancelLabel'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.apiProductService.deleteProduct(p.id).subscribe({
        next: () => {
          this.loadProducts();
          this.alertService.warning(
            this.lang.t('products.productDeleted', { name: p.name }),
            this.lang.t('confirm.deletedTitle')
          );
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to delete product', err);
          this.alertService.error(this.lang.t('products.productDeleteFailed'));
          this.cdr.markForCheck();
        },
      });
    });
  }

  onSave(data: Partial<Product>): void {
    if (this.editingProduct) {
      this.apiProductService.updateProduct(Number(this.editingProduct.id), data).subscribe({
        next: () => {
          this.loadProducts();
          this.alertService.success(
            this.lang.t('products.productUpdated'),
            this.lang.t('confirm.updated')
          );
          this.showForm = false;
          this.editingProduct = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to update product', err);
          this.alertService.error(this.lang.t('products.productUpdateFailed'));
          this.cdr.markForCheck();
        },
      });
    } else {
      this.apiProductService.createProduct(data).subscribe({
        next: () => {
          this.currentPage.set(1); // show the newly created record
          this.loadProducts();
          this.alertService.success(
            this.lang.t('products.productAdded'),
            this.lang.t('confirm.added')
          );
          this.showForm = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to create product', err);
          this.alertService.error(this.lang.t('products.productCreateFailed'));
          this.cdr.markForCheck();
        },
      });
    }
  }

  getStockClass(p: Product): string {
    if (p.stock === 0) return 'stock-badge--out';
    if (p.stock <= (p.lowStockThreshold || 10)) return 'stock-badge--low';
    return 'stock-badge--ok';
  }

  getCategoryName = (categoryId: string): string => {
    const categories = this.productService?.categories();
    if (!categories) return categoryId;
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return categoryId;
    return this.lang.currentLang() === 'km' && cat.nameKm ? cat.nameKm : cat.name;
  };

  get lowStockProducts(): Product[] {
    return this.products().filter(
      p => p.stock <= (p.lowStockThreshold ?? this.lowStockThreshold)
    );
  }

  openLowStockDrawer(): void {
    this.isLowStockDrawerOpen = true;
  }

  closeLowStockDrawer(): void {
    this.isLowStockDrawerOpen = false;
  }

  /** Adjusts stock from the drawer with an optimistic update; refetches on failure. */
  onStockAdjust(event: { product: Product; delta: number }): void {
    const id = event.product.id;
    // One in-flight request per product prevents server-side lost updates.
    if (this.pendingStockAdjusts().includes(id)) return;

    const current = this.products().find((p) => p.id === id);
    const newStock = (current?.stock ?? event.product.stock) + event.delta;
    if (newStock < 0) return;

    // Optimistic update so the drawer reacts instantly.
    this.products.update((list) =>
      list.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
    this.pendingStockAdjusts.update((ids) => [...ids, id]);
    this.cdr.markForCheck();

    this.apiProductService.adjustStock(Number(id), event.delta).subscribe({
      complete: () => {
        this.pendingStockAdjusts.update((ids) => ids.filter((i) => i !== id));
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.pendingStockAdjusts.update((ids) => ids.filter((i) => i !== id));
        console.error('Failed to adjust stock', err);
        this.loadProducts(); // roll back to server truth
        this.alertService.error(this.lang.t('lowStock.adjustFailed'));
        this.cdr.markForCheck();
      },
    });
  }

  /** Opens the Purchase Order dialog pre-filled with the given product. */
  onRestock(product: Product): void {
    this.closeLowStockDrawer();
    const dialogRef = this.dialog.open(PurchaseOrderDetailComponent, {
      panelClass: DialogConfig.LARGE_DIALOG,
      disableClose: true,
      data: { preselectProduct: product },
    });
    // Refresh the list when the dialog closes with a saved order, so newly
    // received stock appears immediately in the table and low-stock drawer.
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadProducts();
    });
  }

  trackById(_: number, p: Product): string { return p.id; }

  openDialog() {
    const dialogRef = this.reusableDialogService.open(
      this.editingProduct ? { product: this.editingProduct } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingProduct = null;
        return;
      }
      const wasCreate = !this.editingProduct;
      if (wasCreate) this.currentPage.set(1); // show the newly created record
      this.loadProducts();
      const isEdit = !!this.editingProduct;
      this.alertService.success(
        this.lang.t('products.productSaved', {
          action: this.lang.t(isEdit ? 'confirm.actionUpdated' : 'confirm.actionAdded'),
        }),
        this.lang.t('confirm.success')
      );
      this.editingProduct = null;
    });
  }
}

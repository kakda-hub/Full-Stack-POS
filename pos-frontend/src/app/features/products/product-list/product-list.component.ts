import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Product } from '../../../models';
import { nextSort, SortDirection } from '../../../shared/helpers/sort.helper';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProductService as CoreProductService } from '../../../core/services/product.service';
import { ProductService as ApiProductService } from '../../../core/services/api/product.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-product-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit, OnDestroy {
  showForm = false;
  isLoading = signal(true);
  editingProduct: Product | null = null;

  isLowStockDrawerOpen = false;
  lowStockThreshold = 10;

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
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to load products', err);
        this.products.set([]);
        this.totalItems.set(0);
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
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message: this.lang.currentLang() === 'km' ? `លុប "${p.name}" មែនទេ?` : `Delete "${p.name}"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'លុប' : 'Delete',
        cancelLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.apiProductService.deleteProduct(p.id).subscribe({
        next: () => {
          this.loadProducts();
          this.alertService.warning(
            this.lang.currentLang() === 'km' ? `"${p.name}" ត្រូវបានលុបចោល` : `"${p.name}" has been deleted`,
            this.lang.currentLang() === 'km' ? 'បានលុប' : 'Deleted'
          );
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to delete product', err);
          this.alertService.error(
            this.lang.currentLang() === 'km' ? 'ការលុបផលិតផលបរាជ័យ' : 'Failed to delete product'
          );
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
            this.lang.currentLang() === 'km' ? 'ផលិតផលត្រូវបានធ្វើបច្ចុប្បន្នភាព' : 'Product updated successfully',
            this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Updated'
          );
          this.showForm = false;
          this.editingProduct = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to update product', err);
          this.alertService.error(
            this.lang.currentLang() === 'km' ? 'ការកែប្រែផលិតផលបរាជ័យ' : 'Failed to update product'
          );
          this.cdr.markForCheck();
        },
      });
    } else {
      this.apiProductService.createProduct(data).subscribe({
        next: () => {
          this.currentPage.set(1); // show the newly created record
          this.loadProducts();
          this.alertService.success(
            this.lang.currentLang() === 'km' ? 'ផលិតផលថ្មីត្រូវបានបន្ថែម' : 'Product added successfully',
            this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Added'
          );
          this.showForm = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to create product', err);
          this.alertService.error(
            this.lang.currentLang() === 'km' ? 'ការបន្ថែមផលិតផលបរាជ័យ' : 'Failed to create product'
          );
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
        this.lang.currentLang() === 'km'
          ? `ផលិតផលត្រូវបាន${isEdit ? 'កែប្រែ' : 'បន្ថែម'}ដោយជោគជ័យ`
          : `Product ${isEdit ? 'updated' : 'added'} successfully`,
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
      );
      this.editingProduct = null;
    });
  }
}

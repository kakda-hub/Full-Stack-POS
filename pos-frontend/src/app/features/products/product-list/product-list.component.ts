import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Product } from '../../../core/models';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProductService as CoreProductService } from '../../../core/services/product.service';
import { ProductService as ApiProductService } from '../../../services/product.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
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
  currentPage = signal(1);

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
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

    effect(() => {
      if (!this.productService.loading()) {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(q => this.productService.setSearch(q));
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }

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
          this.productService.refreshProducts();
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
          this.productService.refreshProducts();
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
          this.productService.refreshProducts();
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

  getCategoryName(categoryId: string): string {
    const cat = this.productService.categories().find(c => c.id === categoryId);
    if (!cat) return categoryId;
    return this.lang.currentLang() === 'km' && cat.nameKm ? cat.nameKm : cat.name;
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
      this.productService.refreshProducts();
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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Product } from '../../../core/models';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProductService } from '../../../core/services/product.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { MatDialogConfig } from '@angular/material/dialog';

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
    public productService: ProductService,
    public lang: LanguageService,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private reusableDialogService: ReusableDialogService,
  ) {
    this.reusableDialogService.setDialogComponent(ProductDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    // Simulate initial data load
    setTimeout(() => { this.isLoading.set(false); this.cdr.markForCheck(); }, 700);
    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(q => this.productService.setSearch(q));
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }

  onAdd(): void {
    this.openDialog();
  }

  openEdit(p: Product): void { this.editingProduct = p; this.showForm = true; }

  deleteProduct(p: Product): void {
    if (confirm(this.lang.currentLang() === 'km' ? `លុប "${p.name}" មែនទេ?` : `Delete "${p.name}"?`)) {
      this.productService.deleteProduct(p.id);
      this.alertService.warning(
        this.lang.currentLang() === 'km' ? `"${p.name}" ត្រូវបានលុបចោល` : `"${p.name}" has been deleted`,
        this.lang.currentLang() === 'km' ? 'បានលុប' : 'Deleted'
      );
      this.cdr.markForCheck();
    }
  }

  onSave(data: Partial<Product>): void {
    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, data);
      this.alertService.success(
        this.lang.currentLang() === 'km' ? 'ផលិតផលត្រូវបានធ្វើបច្ចុប្បន្នភាព' : 'Product updated successfully',
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Updated'
      );
    } else {
      this.productService.addProduct(data as Omit<Product, 'id'>);
      this.alertService.success(
        this.lang.currentLang() === 'km' ? 'ផលិតផលថ្មីត្រូវបានបន្ថែម' : 'Product added successfully',
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Added'
      );
    }
    this.showForm = false;
    this.editingProduct = null;
    this.cdr.markForCheck();
  }

  getStockClass(p: Product): string {
    if (p.stock === 0) return 'font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg';
    if (p.stock <= (p.lowStockThreshold || 10)) return 'font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg';
    return 'font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg';
  }

  trackById(_: number, p: Product): string { return p.id; }

  openDialog() {
    const dialogRef = this.reusableDialogService.open();
    dialogRef.subscribe((result) => {
      if (!result) {
        return;
      }
      // this.addProduct(result)
    });
  }
}

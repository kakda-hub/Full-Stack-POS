import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { CategoriesService } from '../../../services/categories.service';
import { ThemeService } from '../../../core/services/theme.service';
import { PageEvent } from '@angular/material/paginator';
import { TableColumn } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { CategoryDetailComponent } from '../category-detail/category-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-category-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingCategory: any | null = null;
  categories = signal<any[]>([]);
  filteredCategories = signal<any[]>([]);

  /** Column definitions passed to DynamicTableComponent */
  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name', labelKm: 'ឈ្មោះ' },
    { key: 'nameKh', label: 'Name (Khmer)', labelKm: 'ឈ្មោះ (ខ្មែរ)' },
    { key: 'description', label: 'Description', labelKm: 'ការពិពណ៌នា', type: 'description', responsive: 'md' },
  ];

  // Pagination
  pageSize = signal(10);
  pageIndex = signal(0);
  paginatedCategories = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredCategories().slice(startIndex, startIndex + this.pageSize());
  });

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true
  }

  constructor(
    public categoriesService: CategoriesService,
    public lang: LanguageService,
    private reusableDialogService: ReusableDialogService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(CategoryDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadCategories();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(q => {
        const query = q.toLowerCase().trim();
        if (!query) {
          this.filteredCategories.set(this.categories());
        } else {
          this.filteredCategories.set(
            this.categories().filter(c =>
              (c.name || '').toLowerCase().includes(query) ||
              (c.nameKh || '').includes(query) ||
              (c.nameKm || '').includes(query)
            )
          );
        }
        this.pageIndex.set(0); // Reset to first page on search
      });
  }

  loadCategories() {
    this.isLoading.set(true);
    this.categoriesService.list().subscribe((res: any) => {
      const data = res.data || [];
      this.categories.set(data);
      this.filteredCategories.set(data);
      this.isLoading.set(false);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openEdit(c: any): void {
    this.editingCategory = c;
    this.openDialog();
  }

  deleteCategory(c: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message: this.lang.currentLang() === 'km' ? `លុប "${c.name}" មែនទេ?` : `Delete "${c.name}"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'លុប' : 'Delete',
        cancelLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.categoriesService.delete(c.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.currentLang() === 'km' ? `"${c.name}" ត្រូវបានលុបចោល` : `"${c.name}" has been deleted`,
            this.lang.currentLang() === 'km' ? 'បានលុប' : 'Deleted'
          );
          this.loadCategories();
        },
        error: (err) => {
          console.error('Failed to delete category', err);
          this.alertService.error(
            this.lang.currentLang() === 'km' ? 'ការលុបប្រភេទបរាជ័យ' : 'Failed to delete category'
          );
        },
      });
    });
  }

  trackById(_: number, c: any): string { return c.id; }

  openDialog() {
    const dialogRef = this.reusableDialogService.open(
      this.editingCategory ? { category: this.editingCategory } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingCategory = null;
        return;
      }
      this.loadCategories();
      const isEdit = !!this.editingCategory;
      this.alertService.success(
        this.lang.currentLang() === 'km'
          ? `ប្រភេទត្រូវបាន${isEdit ? 'កែប្រែ' : 'បន្ថែម'}ដោយជោគជ័យ`
          : `Category ${isEdit ? 'updated' : 'added'} successfully`,
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
      );
      this.editingCategory = null;
    });
  }
}
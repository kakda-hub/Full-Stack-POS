import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { CategoriesService } from '../../../core/services/api/categories.service';
import { ThemeService } from '../../../core/services/theme.service';
import { PageEvent } from '@angular/material/paginator';
import { TableColumn } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { CategoryDetailComponent } from '../category-detail/category-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { buildListParams } from '../../../core/services/api/list-params';

@Component({
  selector: 'app-category-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingCategory: any | null = null;

  // Server-side pagination state
  categories = signal<any[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  searchQuery = signal('');

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;

  /** Column definitions passed to DynamicTableComponent */
  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name', labelKm: 'ឈ្មោះ' },
    { key: 'nameKh', label: 'Name (Khmer)', labelKm: 'ឈ្មោះ (ខ្មែរ)' },
    { key: 'description', label: 'Description', labelKm: 'ការពិពណ៌នា', type: 'description', responsive: 'md' },
  ];

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
        this.searchQuery.set(q.trim());
        this.pageIndex.set(0); // Reset to first page on search
        this.loadCategories();
      });
  }

  /** Loads one server-side page using the standard list query params. */
  loadCategories() {
    this.isLoading.set(true);
    const seq = ++this.loadSeq;
    const params = buildListParams({
      search: this.searchQuery() || undefined,
      sortBy: 'name',
      sort: 'asc',
      offset: this.pageIndex() * this.pageSize(),
      max: this.pageSize(),
    });
    this.categoriesService.list({ params }).subscribe({
      next: (res: any) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const data = res?.data ?? [];
        // After a delete, the current page may be empty — step back one page.
        if (data.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadCategories();
          return;
        }
        this.categories.set(data);
        this.totalItems.set(res?.total ?? data.length);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to load categories', err);
        this.categories.set([]);
        this.totalItems.set(0);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCategories();
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
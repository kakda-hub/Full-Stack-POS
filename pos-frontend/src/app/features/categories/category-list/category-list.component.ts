import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../services/shared/alert.service';
import { LanguageService } from '../../../services/shared/language.service';
import { CategoriesService } from '../../../services/categories.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { PageEvent } from '@angular/material/paginator';
import { TableColumn } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { CategoryDetailComponent } from '../category-detail/category-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { buildListParams } from '../../../services/list-params';

@Component({
  selector: 'app-category-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // Mobile infinite-scroll state (append-mode pages for the card layout)
  mobileCategories = signal<any[]>([]);
  hasMore = signal(true);
  isLoadingMore = signal(false);

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;

  /** Column definitions passed to DynamicTableComponent */
  readonly columns: TableColumn[] = [
    { key: 'name', labelKey: 'categories.name' },
    { key: 'nameKh', labelKey: 'categories.nameKm' },
    { key: 'description', labelKey: 'categories.description', type: 'description', responsive: 'md' },
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

  /**
   * Loads one server-side page using the standard list query params.
   *
   * `append = false` (desktop pagination, search, delete, save) replaces the
   * list. `append = true` (mobile infinite scroll) fetches the next page at
   * the current appended length and merges it into `mobileCategories`.
   */
  loadCategories(append = false) {
    if (append && (this.isLoadingMore() || !this.hasMore())) return;
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
    }
    const seq = ++this.loadSeq;
    const offset = append
      ? this.mobileCategories().length
      : this.pageIndex() * this.pageSize();
    const params = buildListParams({
      search: this.searchQuery() || undefined,
      sortBy: 'name',
      sort: 'asc',
      offset,
      max: this.pageSize(),
    });
    this.categoriesService.list({ params }).subscribe({
      next: (res: any) => {
        if (seq !== this.loadSeq) {
          // stale response — ignore
          if (append) this.isLoadingMore.set(false);
          return;
        }
        const data = res?.data ?? [];
        const total = res?.total ?? data.length;

        if (append) {
          this.mobileCategories.update(list => {
            const seen = new Set(list.map((c: any) => c.id));
            return [...list, ...data.filter((c: any) => !seen.has(c.id))];
          });
          this.hasMore.set(data.length > 0 && this.mobileCategories().length < total);
          this.isLoadingMore.set(false);
          this.cdr.markForCheck();
          return;
        }

        // After a delete, the current page may be empty — step back one page.
        if (data.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadCategories();
          return;
        }
        this.categories.set(data);
        this.mobileCategories.set(data);
        this.totalItems.set(total);
        this.hasMore.set(data.length > 0 && data.length < total);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) {
          // stale response — ignore
          if (append) this.isLoadingMore.set(false);
          return;
        }
        console.error('Failed to load categories', err);
        if (append) {
          // Keep `hasMore` as-is so a later scroll can retry.
          this.isLoadingMore.set(false);
        } else {
          this.categories.set([]);
          this.mobileCategories.set([]);
          this.totalItems.set(0);
          this.hasMore.set(false);
          this.isLoading.set(false);
        }
        this.cdr.markForCheck();
      },
    });
  }

  /** Mobile infinite scroll: fetch and append the next page of categories. */
  loadMoreCategories(): void {
    this.loadCategories(true);
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(query: string): void { this.searchSubject.next(query); }

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
        title: this.lang.t('confirm.title'),
        message: this.lang.t('confirm.deleteQuestion', { name: c.name }),
        confirmLabel: this.lang.t('confirm.deleteLabel'),
        cancelLabel: this.lang.t('confirm.cancelLabel'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.categoriesService.delete(c.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.t('categories.deleted', { name: c.name }),
            this.lang.t('confirm.deletedTitle')
          );
          this.loadCategories();
        },
        error: (err) => {
          console.error('Failed to delete category', err);
          this.alertService.error(this.lang.t('categories.deleteFailed'));
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
        this.lang.t('categories.saved', {
          action: this.lang.t(isEdit ? 'confirm.actionUpdated' : 'confirm.actionAdded'),
        }),
        this.lang.t('confirm.success')
      );
      this.editingCategory = null;
    });
  }
}
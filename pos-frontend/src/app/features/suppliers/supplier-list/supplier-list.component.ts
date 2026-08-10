import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../services/shared/alert.service';
import { LanguageService } from '../../../services/shared/language.service';
import { SupplierService } from '../../../services/supplier.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { PageEvent } from '@angular/material/paginator';
import { TableColumn } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { SupplierDetailComponent } from '../supplier-detail/supplier-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { buildListParams } from '../../../services/list-params';

@Component({
  selector: 'app-supplier-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-list.component.html',
})
export class SupplierListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingSupplier: any | null = null;

  // Server-side pagination state
  suppliers = signal<any[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  searchQuery = signal('');

  // Mobile infinite-scroll state (append-mode pages for the card layout)
  mobileSuppliers = signal<any[]>([]);
  hasMore = signal(true);
  isLoadingMore = signal(false);

  /** Column definitions passed to DynamicTableComponent */
  readonly columns: TableColumn[] = [
    { key: 'name', labelKey: 'suppliers.name' },
    { key: 'contactPerson', labelKey: 'suppliers.contactPerson', responsive: 'md' },
    { key: 'phone', labelKey: 'suppliers.phone', responsive: 'md' },
    { key: 'email', labelKey: 'suppliers.email', responsive: 'lg' },
  ];

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true,
  };

  constructor(
    public supplierService: SupplierService,
    public lang: LanguageService,
    private reusableDialogService: ReusableDialogService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(SupplierDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadSuppliers();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q.trim());
        this.pageIndex.set(0);
        this.loadSuppliers();
      });
  }

  /**
   * Loads one server-side page using the standard list query params.
   *
   * `append = false` (desktop pagination, search, delete, save) replaces the
   * list. `append = true` (mobile infinite scroll) fetches the next page at
   * the current appended length and merges it into `mobileSuppliers`.
   */
  loadSuppliers(append = false) {
    if (append && (this.isLoadingMore() || !this.hasMore())) return;
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
    }
    const seq = ++this.loadSeq;
    const offset = append
      ? this.mobileSuppliers().length
      : this.pageIndex() * this.pageSize();
    const params = buildListParams({
      search: this.searchQuery() || undefined,
      sortBy: 'name',
      sort: 'asc',
      offset,
      max: this.pageSize(),
    });
    this.supplierService.list({ params }).subscribe({
      next: (res: any) => {
        if (seq !== this.loadSeq) {
          // stale response — ignore
          if (append) this.isLoadingMore.set(false);
          return;
        }
        const data = res?.data ?? [];
        const total = res?.total ?? data.length;

        if (append) {
          this.mobileSuppliers.update(list => {
            const seen = new Set(list.map((s: any) => s.id));
            return [...list, ...data.filter((s: any) => !seen.has(s.id))];
          });
          this.hasMore.set(data.length > 0 && this.mobileSuppliers().length < total);
          this.isLoadingMore.set(false);
          this.cdr.markForCheck();
          return;
        }

        // After a delete, the current page may be empty — step back one page.
        if (data.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadSuppliers();
          return;
        }
        this.suppliers.set(data);
        this.mobileSuppliers.set(data);
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
        console.error('Failed to load suppliers', err);
        if (append) {
          // Keep `hasMore` as-is so a later scroll can retry.
          this.isLoadingMore.set(false);
        } else {
          this.suppliers.set([]);
          this.mobileSuppliers.set([]);
          this.totalItems.set(0);
          this.hasMore.set(false);
          this.isLoading.set(false);
        }
        this.cdr.markForCheck();
      },
    });
  }

  /** Mobile infinite scroll: fetch and append the next page of suppliers. */
  loadMoreSuppliers(): void {
    this.loadSuppliers(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadSuppliers();
  }

  openEdit(s: any): void {
    this.editingSupplier = s;
    this.openDialog();
  }

  deleteSupplier(s: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.t('confirm.title'),
        message: this.lang.t('suppliers.deleteQuestion', { name: s.name }),
        confirmLabel: this.lang.t('confirm.deleteLabel'),
        cancelLabel: this.lang.t('confirm.cancelLabel'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.supplierService.delete(s.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.t('suppliers.deleted', { name: s.name }),
            this.lang.t('confirm.deletedTitle')
          );
          this.loadSuppliers();
        },
        error: (err) => {
          console.error('Failed to delete supplier', err);
          this.alertService.error(this.lang.t('suppliers.deleteFailed'));
        },
      });
    });
  }

  trackById(_: number, s: any): string {
    return s.id;
  }

  openDialog() {
    const dialogRef = this.reusableDialogService.open(
      this.editingSupplier ? { supplier: this.editingSupplier } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingSupplier = null;
        return;
      }
      const wasCreate = !this.editingSupplier;
      if (wasCreate) this.pageIndex.set(0); // show the newly created record
      this.loadSuppliers();
      const isEdit = !!this.editingSupplier;
      this.alertService.success(
        this.lang.t('suppliers.saved', {
          action: this.lang.t(isEdit ? 'confirm.actionUpdated' : 'confirm.actionAdded'),
        }),
        this.lang.t('confirm.success')
      );
      this.editingSupplier = null;
    });
  }
}

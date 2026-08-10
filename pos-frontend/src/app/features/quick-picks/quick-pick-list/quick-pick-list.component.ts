import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn, listAnimation } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../services/shared/alert.service';
import { LanguageService } from '../../../services/shared/language.service';
import { QuickPickService } from '../../../services/quick-pick.service';
import { QuickPickItem } from '../../../models';
import { ThemeService } from '../../../services/shared/theme.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { QuickPickDetailComponent } from '../quick-pick-detail/quick-pick-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-quick-pick-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation],
  templateUrl: './quick-pick-list.component.html',
  styleUrl: './quick-pick-list.component.scss',
})
export class QuickPickListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingItem: QuickPickItem | null = null;

  // Server-side pagination state
  items = signal<QuickPickItem[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  pageSizeOptions = [10, 25, 50, 100];
  pageIndex = signal(0);
  searchQuery = signal('');

  // Mobile infinite-scroll state (append-mode pages for the card layout)
  mobileItems = signal<QuickPickItem[]>([]);
  hasMore = signal(true);
  isLoadingMore = signal(false);

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true,
  };

  constructor(
    public quickPickService: QuickPickService,
    public lang: LanguageService,
    private reusableDialogService: ReusableDialogService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(QuickPickDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadItems();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q.trim());
        this.pageIndex.set(0); // Reset to first page on search
        this.loadItems();
      });
  }

  /**
   * Loads one server-side page using the standard list query params.
   *
   * `append = false` (desktop pagination, search, delete, save) replaces the
   * list. `append = true` (mobile infinite scroll) fetches the next page at
   * the current appended length and merges it into `mobileItems`.
   */
  loadItems(append = false): void {
    if (append && (this.isLoadingMore() || !this.hasMore())) return;
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
    }
    const seq = ++this.loadSeq;
    this.quickPickService.getPage({
      search: this.searchQuery() || undefined,
      sortBy: 'sortOrder',
      sort: 'asc',
      offset: append
        ? this.mobileItems().length
        : this.pageIndex() * this.pageSize(),
      max: this.pageSize(),
    }).subscribe({
      next: (res) => {
        if (seq !== this.loadSeq) {
          // stale response — ignore
          if (append) this.isLoadingMore.set(false);
          return;
        }
        const data = res?.data ?? [];
        const total = res?.total ?? data.length;

        if (append) {
          this.mobileItems.update(list => {
            const seen = new Set(list.map(i => i.id));
            return [...list, ...data.filter((i: any) => !seen.has(i.id))];
          });
          this.hasMore.set(data.length > 0 && this.mobileItems().length < total);
          this.isLoadingMore.set(false);
          this.cdr.markForCheck();
          return;
        }

        // After a delete, the current page may be empty — step back one page.
        if (data.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadItems();
          return;
        }
        this.items.set(data);
        this.mobileItems.set(data);
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
        console.error('Failed to load quick pick items', err);
        if (append) {
          // Keep `hasMore` as-is so a later scroll can retry.
          this.isLoadingMore.set(false);
        } else {
          this.items.set([]);
          this.mobileItems.set([]);
          this.totalItems.set(0);
          this.hasMore.set(false);
          this.isLoading.set(false);
        }
        this.cdr.markForCheck();
      },
    });
  }

  /** Mobile infinite scroll: fetch and append the next page of quick picks. */
  loadMoreItems(): void {
    this.loadItems(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page - 1);
    this.loadItems();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0); // changing page size resets the offset to 0
    this.loadItems();
  }

  openEdit(item: QuickPickItem): void {
    this.editingItem = item;
    this.openDialog();
  }

  deleteItem(item: QuickPickItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.t('confirm.title'),
        message: this.lang.t('quickPicks.deleteQuestion', { name: item.label }),
        confirmLabel: this.lang.t('confirm.deleteLabel'),
        cancelLabel: this.lang.t('confirm.cancelLabel'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.quickPickService.delete(item.id).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.t('quickPicks.deleted', { name: item.label }),
            this.lang.t('quickPicks.deletedTitle')
          );
          this.loadItems();
        },
        error: (err) => {
          console.error('Failed to delete quick pick', err);
          this.alertService.error(this.lang.t('quickPicks.deleteFailed'));
        },
      });
    });
  }

  trackById(_: number, item: QuickPickItem): number {
    return item.id;
  }

  openDialog(): void {
    const dialogRef = this.reusableDialogService.open(
      this.editingItem ? { quickPick: this.editingItem } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingItem = null;
        return;
      }
      this.loadItems();
      const isEdit = !!this.editingItem;
      this.alertService.success(
        this.lang.t('quickPicks.saved', {
          action: this.lang.t(isEdit ? 'confirm.actionUpdated' : 'confirm.actionAdded'),
        }),
        this.lang.t('confirm.success')
      );
      this.editingItem = null;
    });
  }
}

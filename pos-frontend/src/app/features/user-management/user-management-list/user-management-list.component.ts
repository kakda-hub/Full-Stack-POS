import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { fadeIn, listAnimation } from '../../../shared/animations/animations';
import { Subject, debounceTime, forkJoin, takeUntil } from 'rxjs';
import { AlertService } from '../../../services/shared/alert.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { UserService } from '../../../services/user.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { UserDetailDialogComponent } from '../../../shared/user-detail-dialog/user-detail-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { buildListParams } from '../../../services/list-params';

@Component({
  selector: 'app-user-management-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation],
  templateUrl: './user-management-list.component.html',
  styleUrl: './user-management-list.component.scss',
})
export class UserManagementListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingItem: any | null = null;

  // Server-side pagination state
  items = signal<any[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  searchQuery = signal('');

  // Mobile infinite-scroll state (append-mode pages for the card layout)
  mobileItems = signal<any[]>([]);
  hasMore = signal(true);
  isLoadingMore = signal(false);

  // Stats (computed server-side via role-filtered totals)
  totalUsers = computed(() => this.totalItems());
  adminCount = signal(0);
  cashierCount = signal(0);

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true,
  };

  constructor(
    private userService: UserService,
    public lang: LanguageService,
    private reusableDialogService: ReusableDialogService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(UserDetailDialogComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit(): void {
    this.loadItems();
    this.loadStats();

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery.set(q.trim());
        this.pageIndex.set(0);
        this.loadItems();
        this.loadStats(); // stats are search-scoped, so refresh with the search
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
    const offset = append
      ? this.mobileItems().length
      : this.pageIndex() * this.pageSize();
    const params = buildListParams({
      search: this.searchQuery() || undefined,
      sortBy: 'name',
      sort: 'asc',
      offset,
      max: this.pageSize(),
    });
    this.userService.list({ params }).subscribe({
      next: (res: any) => {
        if (seq !== this.loadSeq) {
          // stale response — ignore
          if (append) this.isLoadingMore.set(false);
          return;
        }
        const raw = res?.data ?? [];
        const total = res?.total ?? raw.length;
        const mapUser = (u: any) => ({
          id: String(u.id),
          name: u.name,
          username: u.email?.split('@')[0] || u.name?.toLowerCase().replace(/\s+/g, '.') || '',
          email: u.email || '',
          role: u.role || 'cashier',
          status: u.isActive ? 'active' : 'inactive',
          avatarUrl: u.avatarUrl || '',
          lastLogin: u.lastLogin || u.updatedAt || null,
        });

        if (append) {
          const page = raw.map(mapUser);
          this.mobileItems.update(list => {
            const seen = new Set(list.map((i: any) => i.id));
            return [...list, ...page.filter((i: any) => !seen.has(i.id))];
          });
          this.hasMore.set(raw.length > 0 && this.mobileItems().length < total);
          this.isLoadingMore.set(false);
          this.cdr.markForCheck();
          return;
        }

        // After a delete, the current page may be empty — step back one page.
        if (raw.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadItems();
          return;
        }
        const mapped = raw.map(mapUser);
        this.items.set(mapped);
        this.mobileItems.set(mapped);
        this.totalItems.set(total);
        this.hasMore.set(raw.length > 0 && raw.length < total);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) {
          // stale response — ignore
          if (append) this.isLoadingMore.set(false);
          return;
        }
        console.error('Failed to load users', err);
        this.alertService.error(this.lang.t('users.loadFailed'));
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

  /** Mobile infinite scroll: fetch and append the next page of users. */
  loadMoreItems(): void {
    this.loadItems(true);
  }

  /**
   * Fetches accurate role counts from the server (max=1 per role and read
   * the `total` from the envelope) so the stat cards stay correct even
   * though the table only shows one page. Stats are scoped to the active
   * search so all three cards stay consistent with the filtered list.
   */
  private loadStats(): void {
    const roleParams = (role: string) =>
      buildListParams({ search: this.searchQuery() || undefined, sortBy: 'name', sort: 'asc', max: 1 })
        .set('role', role);

    forkJoin([
      this.userService.list({ params: roleParams('admin') }),
      this.userService.list({ params: roleParams('cashier') }),
    ]).subscribe({
      next: ([adminRes, cashierRes]: any[]) => {
        this.adminCount.set(adminRes?.total ?? 0);
        this.cashierCount.set(cashierRes?.total ?? 0);
      },
      error: (err) => console.error('Failed to load user stats', err),
    });
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
    this.pageIndex.set(0);
    this.loadItems();
  }

  openEdit(item: any): void {
    this.editingItem = item;
    this.openDialog();
  }

  deleteItem(item: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.t('confirm.title'),
        message: this.lang.t('users.deleteQuestion', { name: item.name }),
        confirmLabel: this.lang.t('confirm.deleteLabel'),
        cancelLabel: this.lang.t('confirm.cancelLabel'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.userService.delete(Number(item.id)).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.t('users.deleted', { name: item.name }),
            this.lang.t('users.deletedTitle')
          );
          this.loadItems();
          this.loadStats();
        },
        error: (err) => {
          console.error('Failed to delete user', err);
          this.alertService.error(this.lang.t('users.deleteFailed'));
        },
      });
    });
  }

  trackById(_: number, item: any): string {
    return item.id;
  }

  openDialog(): void {
    const dialogRef = this.reusableDialogService.open(
      this.editingItem ? { user: this.editingItem } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingItem = null;
        return;
      }
      const wasCreate = !this.editingItem;
      if (wasCreate) this.pageIndex.set(0); // show the newly created record
      this.loadItems();
      this.loadStats();
      const isEdit = !!this.editingItem;
      this.alertService.success(
        this.lang.t('users.saved', {
          action: this.lang.t(isEdit ? 'confirm.actionUpdated' : 'confirm.actionAdded'),
        }),
        this.lang.t('confirm.success')
      );
      this.editingItem = null;
    });
  }
}

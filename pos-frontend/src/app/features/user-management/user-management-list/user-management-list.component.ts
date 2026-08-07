import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { fadeIn, listAnimation } from '../../../shared/animations/animations';
import { Subject, debounceTime, forkJoin, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/api/user.service';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { UserDetailDialogComponent } from '../../../shared/user-detail-dialog/user-detail-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { buildListParams } from '../../../core/services/api/list-params';

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

  /** Loads one server-side page using the standard list query params. */
  loadItems(): void {
    this.isLoading.set(true);
    const seq = ++this.loadSeq;
    const params = buildListParams({
      search: this.searchQuery() || undefined,
      sortBy: 'name',
      sort: 'asc',
      offset: this.pageIndex() * this.pageSize(),
      max: this.pageSize(),
    });
    this.userService.list({ params }).subscribe({
      next: (res: any) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const raw = res?.data ?? [];
        // After a delete, the current page may be empty — step back one page.
        if (raw.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.update(p => p - 1);
          this.loadItems();
          return;
        }
        const mapped = raw.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          username: u.email?.split('@')[0] || u.name?.toLowerCase().replace(/\s+/g, '.') || '',
          email: u.email || '',
          role: u.role || 'cashier',
          status: u.isActive ? 'active' : 'inactive',
          avatarUrl: u.avatarUrl || '',
          lastLogin: u.lastLogin || u.updatedAt || null,
        }));
        this.items.set(mapped);
        this.totalItems.set(res?.total ?? raw.length);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to load users', err);
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'មិនអាចផ្ទុកអ្នកប្រើបានទេ' : 'Failed to load users'
        );
        this.items.set([]);
        this.totalItems.set(0);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
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

  onSearch(e: Event): void {
    this.searchSubject.next((e.target as HTMLInputElement).value);
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
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message:
          this.lang.currentLang() === 'km'
            ? `លុបអ្នកប្រើ "${item.name}" មែនទេ?`
            : `Delete user "${item.name}"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'លុប' : 'Delete',
        cancelLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.userService.delete(Number(item.id)).subscribe({
        next: () => {
          this.alertService.warning(
            this.lang.currentLang() === 'km'
              ? `"${item.name}" ត្រូវបានលុបចោល`
              : `"${item.name}" has been deleted`,
            this.lang.currentLang() === 'km' ? 'បានលុប' : 'Deleted'
          );
          this.loadItems();
          this.loadStats();
        },
        error: (err) => {
          console.error('Failed to delete user', err);
          this.alertService.error(
            this.lang.currentLang() === 'km'
              ? 'ការលុបបរាជ័យ'
              : 'Failed to delete user'
          );
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
        this.lang.currentLang() === 'km'
          ? `អ្នកប្រើត្រូវបាន${isEdit ? 'កែប្រែ' : 'បន្ថែម'}ដោយជោគជ័យ`
          : `User ${isEdit ? 'updated' : 'added'} successfully`,
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
      );
      this.editingItem = null;
    });
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeIn } from '../../../shared/animations/animations';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { AlertService } from '../../../services/shared/alert.service';
import { UserService } from '../../../services/user.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserDetailDialogComponent } from '../../../shared/user-detail-dialog/user-detail-dialog.component';
import { buildListParams } from '../../../services/list-params';

@Component({
  selector: 'app-user-management-card',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn],
  templateUrl: './user-management-card.component.html',
  styleUrl: './user-management-card.component.scss',
})
  export class UserManagementCardComponent implements OnInit, OnDestroy {
  // Server-side pagination state
  users = signal<any[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);
  isLoading = signal(true);
  editingUser: any | null = null;

  // Stats (computed server-side via role-filtered totals)
  adminCount = signal(0);
  cashierCount = signal(0);

  get totalUsers(): number {
    return this.totalItems();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadUsers();
  }

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;
  private destroy$ = new Subject<void>();
  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true
  }

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private reusableDialogService: ReusableDialogService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {
    this.reusableDialogService.setDialogComponent(UserDetailDialogComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Loads one server-side page using the standard list query params. */
  private loadUsers(): void {
    this.isLoading.set(true);
    const seq = ++this.loadSeq;
    const params = buildListParams({
      sortBy: 'name',
      sort: 'asc',
      offset: (this.currentPage() - 1) * this.pageSize(),
      max: this.pageSize(),
    });
    this.userService.list({ params }).subscribe({
      next: (res: any) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const raw = res?.data ?? [];
        // After a delete, the current page may be empty — step back one page.
        if (raw.length === 0 && this.currentPage() > 1) {
          this.currentPage.update(p => p - 1);
          this.loadUsers();
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
        this.users.set(mapped);
        this.totalItems.set(res?.total ?? raw.length);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        console.error('Failed to load users', err);
        this.alertService.error(this.lang.t('users.loadFailed'));
        this.users.set([]);
        this.totalItems.set(0);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Fetches accurate role counts from the server (max=1 per role and read
   * the `total` from the envelope) so the stat cards stay correct even
   * though the grid only shows one page.
   */
  private loadStats(): void {
    const roleParams = (role: string) =>
      buildListParams({ sortBy: 'name', sort: 'asc', max: 1 }).set('role', role);

    forkJoin([
      this.userService.list({ params: roleParams('admin') }),
      this.userService.list({ params: roleParams('cashier') }),
    ]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([adminRes, cashierRes]: any[]) => {
        this.adminCount.set(adminRes?.total ?? 0);
        this.cashierCount.set(cashierRes?.total ?? 0);
      },
      error: (err) => console.error('Failed to load user stats', err),
    });
  }

  onEdit(id: string) {
    this.editingUser = this.users().find(u => u.id === id) || null;
    this.openDialog();
  }

  onDelete(id: string) {
    const user = this.users().find(u => u.id === id);
    if (!user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.lang.t('confirm.title'),
        message: this.lang.t('users.deleteQuestion', { name: user.name }),
        confirmLabel: this.lang.t('confirm.deleteLabel'),
        cancelLabel: this.lang.t('confirm.cancelLabel'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.userService.delete(Number(id)).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStats();
          this.alertService.warning(
            this.lang.t('users.deleted', { name: user.name }),
            this.lang.t('users.deletedTitle')
          );
        },
        error: (err) => {
          console.error('Failed to delete user', err);
          this.alertService.error(this.lang.t('users.deleteFailed'));
        },
      });
    });
  }

  onAdd() {
    this.openDialog();
  }

  openDialog() {
    const dialogRef = this.reusableDialogService.open(
      this.editingUser ? { user: this.editingUser } : undefined
    );
    dialogRef.subscribe((result) => {
      if (!result) {
        this.editingUser = null;
        return;
      }
      const wasCreate = !this.editingUser;
      if (wasCreate) this.currentPage.set(1); // show the newly created record
      this.loadUsers();
      this.loadStats();
      const isEdit = !!this.editingUser;
      this.alertService.success(
        this.lang.t('users.saved', {
          action: this.lang.t(isEdit ? 'confirm.actionUpdated' : 'confirm.actionAdded'),
        }),
        this.lang.t('confirm.success')
      );
      this.editingUser = null;
    });
  }
}

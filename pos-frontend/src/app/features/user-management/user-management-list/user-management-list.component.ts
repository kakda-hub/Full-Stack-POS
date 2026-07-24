import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/api/user.service';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { UserDetailDialogComponent } from '../../shared/user-detail-dialog/user-detail-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-user-management-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, pageTransition],
  templateUrl: './user-management-list.component.html',
  styleUrl: './user-management-list.component.scss',
})
export class UserManagementListComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  editingItem: any | null = null;
  items = signal<any[]>([]);
  filteredItems = signal<any[]>([]);

  // Pagination
  pageSize = signal(10);
  pageIndex = signal(0);
  paginatedItems = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredItems().slice(startIndex, startIndex + this.pageSize());
  });

  // Stats
  totalUsers = computed(() => this.items().length);
  adminCount = computed(() => this.items().filter(u => u.role === 'admin').length);
  cashierCount = computed(() => this.items().filter(u => u.role === 'cashier').length);

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

    this.searchSubject.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((q) => {
        const query = q.toLowerCase().trim();
        if (!query) {
          this.filteredItems.set(this.items());
        } else {
          this.filteredItems.set(
            this.items().filter(
              (i) =>
                (i.name || '').toLowerCase().includes(query) ||
                (i.email || '').toLowerCase().includes(query) ||
                (i.role || '').toLowerCase().includes(query)
            )
          );
        }
        this.pageIndex.set(0);
      });
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.userService.list().subscribe({
      next: (res: any) => {
        const raw = res?.data ?? res ?? [];
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
        this.filteredItems.set(mapped);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'មិនអាចផ្ទុកអ្នកប្រើបានទេ' : 'Failed to load users'
        );
        this.isLoading.set(false);
      },
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
      this.loadItems();
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

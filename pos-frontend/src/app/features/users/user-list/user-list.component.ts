import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AlertService } from '../../../core/services/alert.service';
import { fadeIn, pageTransition } from '../../../shared/animations/animations';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserService } from '../../../services/user.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';


@Component({
  selector: 'app-user-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, pageTransition],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})

export class UserListComponent implements OnInit {
  users = signal<any[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  editingUser: any | null = null;

  get totalUsers(): number {
    return this.users().length;
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

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
  ) {
    this.reusableDialogService.setDialogComponent(UserDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
  }

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.userService.list().subscribe({
      next: (res: any) => {
        const raw = res?.data ?? [];
        const mapped = raw.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          username: u.email?.split('@')[0] || u.name.toLowerCase().replace(/\s+/g, '.'),
          email: u.email,
          role: u.role,
          status: u.isActive ? 'active' : 'inactive',
        }));
        this.users.set(mapped);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load users', err);
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'មិនអាចផ្ទុកអ្នកប្រើបានទេ' : 'Failed to load users'
        );
        this.isLoading.set(false);
      },
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
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message: this.lang.currentLang() === 'km' ? `លុប "${user.name}" មែនទេ?` : `Delete "${user.name}"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'លុប' : 'Delete',
        cancelLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.userService.delete(Number(id)).subscribe({
        next: () => {
          this.loadUsers();
          this.alertService.warning(
            this.lang.currentLang() === 'km' ? `"${user.name}" ត្រូវបានលុបចោល` : `"${user.name}" has been deleted`,
            this.lang.currentLang() === 'km' ? 'បានលុប' : 'Deleted'
          );
        },
        error: (err) => {
          console.error('Failed to delete user', err);
          this.alertService.error(
            this.lang.currentLang() === 'km' ? 'ការលុបអ្នកប្រើបរាជ័យ' : 'Failed to delete user'
          );
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
      this.loadUsers();
      const isEdit = !!this.editingUser;
      this.alertService.success(
        this.lang.currentLang() === 'km'
          ? `អ្នកប្រើត្រូវបាន${isEdit ? 'កែប្រែ' : 'បន្ថែម'}ដោយជោគជ័យ`
          : `User ${isEdit ? 'updated' : 'added'} successfully`,
        this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
      );
      this.editingUser = null;
    });
  }
}

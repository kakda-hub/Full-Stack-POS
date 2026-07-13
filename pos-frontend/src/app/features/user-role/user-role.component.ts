import { Component, OnInit, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { AlertService } from '../../core/services/alert.service';
import { UserService } from '../../core/services/api/user.service';

interface UserRoleItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  status: 'active' | 'inactive';
  avatarUrl?: string;
}

@Component({
  selector: 'app-user-role',
  standalone: false,
  templateUrl: './user-role.component.html',
  styleUrl: './user-role.component.scss',
})
export class UserRoleComponent implements OnInit {
  users = signal<UserRoleItem[]>([]);
  isLoading = signal(true);
  updatingUserId = signal<number | null>(null);

  get admins(): UserRoleItem[] {
    return this.users().filter((u) => u.role === 'admin');
  }

  get cashiers(): UserRoleItem[] {
    return this.users().filter((u) => u.role === 'cashier');
  }

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
    private userService: UserService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.userService.list().subscribe({
      next: (res: any) => {
        const raw = res?.data ?? [];
        const mapped: UserRoleItem[] = raw.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.isActive ? 'active' : 'inactive',
          avatarUrl: u.avatarUrl,
        }));
        this.users.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.alertService.error(
          this.lang.currentLang() === 'km'
            ? 'មិនអាចផ្ទុកអ្នកប្រើបានទេ'
            : 'Failed to load users'
        );
        this.isLoading.set(false);
      },
    });
  }

  onRoleChange(userId: number, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value as 'admin' | 'cashier';
    this.updatingUserId.set(userId);
    this.userService.update(userId, { role: newRole }).subscribe({
      next: () => {
        this.users.update((users) =>
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        this.updatingUserId.set(null);
        this.alertService.success(
          this.lang.currentLang() === 'km'
            ? 'តួនាទីត្រូវបានធ្វើបច្ចុប្បន្នភាព'
            : 'Role updated successfully'
        );
      },
      error: (err) => {
        console.error('Failed to update role', err);
        this.updatingUserId.set(null);
        this.alertService.error(
          this.lang.currentLang() === 'km'
            ? 'ការផ្លាស់ប្តូរតួនាទីបរាជ័យ'
            : 'Failed to update role'
        );
      },
    });
  }
}

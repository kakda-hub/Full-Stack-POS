import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { User } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { fadeIn, pageTransition } from '../../../shared/animations/animations';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-user-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, pageTransition],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})

export class UserListComponent {
  users = MOCK_USERS;
  isLoading = signal(true);

  permissions = [
    { label: 'Access Sales', labelKm: 'ចូលប្រើការលក់', admin: true, cashier: true },
    { label: 'Process Payments', labelKm: 'ដំណើរការទូទាត់', admin: true, cashier: true },
    { label: 'View Reports', labelKm: 'មើលរបាយការណ៍', admin: true, cashier: false },
    { label: 'Manage Products', labelKm: 'គ្រប់គ្រងផលិតផល', admin: true, cashier: false },
    { label: 'Manage Users', labelKm: 'គ្រប់គ្រងអ្នកប្រើ', admin: true, cashier: false },
    { label: 'Apply Discounts', labelKm: 'បញ្ចុះតម្លៃ', admin: true, cashier: true },
    { label: 'Delete Transactions', labelKm: 'លុបប្រតិបត្តិការ', admin: true, cashier: false },
    { label: 'Export Data', labelKm: 'នាំចេញទិន្នន័យ', admin: true, cashier: false },
  ];

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
    private userService: UserService,
    private dialog: MatDialog,
  ) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(UserDetailComponent, {
      data: { name: 'New User' },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        // Handle the result (e.g., add user to list)
      }
    });
  }


  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 500);
    // this.getUsers();
  }

  private getUsers() {
    this.userService.list().subscribe({
      next: (response) => {
        console.log('Response User:', response);
        alert('Check console for user response');
        // Assuming response.data contains the list of users
        // this.users = response.data;
        // this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
        // this.isLoading.set(false);
      },
    });
  }
}


const MOCK_USERS: (User & { lastLogin?: Date; status: 'active' | 'inactive' })[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(),
  },
  {
    id: '2',
    username: 'cashier',
    name: 'John Cashier',
    role: 'cashier',
    status: 'active',
    lastLogin: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    username: 'cashier2',
    name: 'Sophea Chan',
    role: 'cashier',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000),
  },
  { id: '4', username: 'cashier3', name: 'Ratanak Kim', role: 'cashier', status: 'inactive' },
];

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { User } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { fadeIn, pageTransition } from '../../../shared/animations/animations';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
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

export class UserListComponent {
  users = MOCK_USERS;
  isLoading = signal(true);
  currentPage = signal(1);
  totalUsers = MOCK_USERS.length;

  onPageChange(page: number) {
    this.currentPage.set(page);
    // Add logic here to fetch users for the specific page if needed
  }

  private defaultOption: MatDialogConfig = {
    panelClass: 'medium-dialog',
    disableClose: true
  }

  constructor(
    public lang: LanguageService,
    public theme: ThemeService,
    private reusableDialogService: ReusableDialogService,
    private userService: UserService,
    private dialog: MatDialog,
  ) {
    this.reusableDialogService.setDialogComponent(UserDetailComponent);
    this.reusableDialogService.setDialogConfigOption(this.defaultOption);
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

  onEdit(id: string) {
    this.openDialog();
  }

  onDelete(id: string) {
    alert(id);
  }

  onAdd() {
    this.openDialog();
  }

  openDialog() {
    const dialogRef = this.reusableDialogService.open();
    dialogRef.subscribe((result) => {

      if (!result) {
        return;
      }

      console.log(result)
      // this.addCategory(result)
      // console.log("result -> ", result)
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

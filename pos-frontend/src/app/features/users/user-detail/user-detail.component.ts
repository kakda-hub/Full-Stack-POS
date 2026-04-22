import { Component, Inject, model, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
  // Using signals for form fields
  name = signal('');
  username = signal('');
  email = signal('');
  phone = signal('');
  address = signal('');
  role = signal<'admin' | 'cashier'>('cashier');

  constructor(
    public dialogRef: MatDialogRef<UserDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
  ) {
    if (data && data.name) {
      this.name.set(data.name);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getSaveData() {
    return {
      name: this.name(),
      username: this.username() || this.name().toLowerCase().replace(/\s/g, ''),
      email: this.email(),
      phone: this.phone(),
      address: this.address(),
      role: this.role(),
    };
  }
}



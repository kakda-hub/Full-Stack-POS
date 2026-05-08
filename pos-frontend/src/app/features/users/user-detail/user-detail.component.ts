import { Component, Inject, model, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  form !: FormGroup;
  id: number | undefined;
  roles: any[] = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'cashier', viewValue: 'Cashier' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDetailComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
  ) {
  }

  ngOnInit(): void {
    this.intiForm();
  }

  private intiForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: ['', Validators.pattern('[0-9]{10}')],
      username: ['', Validators.required],
      password: ['', Validators.required],
      address: ['', Validators.required],
      role: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }
    this.id ? this.update() : this.create();
  }

  create() {
    this.userService.save(this.form.value).subscribe({
      next: () => {
        alert("ok");
        this.dialogRef.close(true);
      }
    });
  }

  update() {
    this.userService.update(this.id ?? 0, this.form.value).subscribe({
      next: () => {
        this.dialogRef.close(true);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}



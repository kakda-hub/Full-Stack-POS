import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  form !: FormGroup;
  roles: any[] = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'cashier', viewValue: 'Cashier' },
  ];

  // Avatar state
  avatarPreview: string | null = null;
  selectedAvatarFile: File | null = null;

  get id(): number | undefined {
    return this.data?.user?.id;
  }

  get currentAvatar(): string {
    return this.avatarPreview
      || this.data?.user?.avatarUrl
      || 'https://cdn-icons-png.flaticon.com/512/219/219988.png';
  }

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<UserDetailComponent>,
    private userService: UserService,
    private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: { user?: any } | null,
  ) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    const user = this.data?.user || null;
    this.form = this.fb.group({
      name: [user?.name || '', Validators.required],
      email: [user?.email || '', Validators.email],
      password: ['', user ? Validators.minLength(6) : Validators.required],
      role: [user?.role || '', Validators.required]
    });

    // If editing, password is optional — clear all validators so empty is valid
    if (user) {
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.setErrors(null);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = this.form.value;
    // Don't send empty password on edit
    if (this.id && !payload.password) {
      delete payload.password;
    }

    if (this.selectedAvatarFile) {
      this.userService.uploadAvatar(this.selectedAvatarFile).subscribe({
        next: (res: any) => {
          const fileUrl = res?.data?.[0]?.fileUrl;
          if (fileUrl) {
            payload.avatarUrl = fileUrl;
          }
          this.saveOrUpdateUser(payload);
        },
        error: (err) => {
          console.error('Failed to upload avatar', err);
          this.alertService.error('Failed to upload avatar');
        }
      });
    } else {
      this.saveOrUpdateUser(payload);
    }
  }

  private saveOrUpdateUser(payload: any) {
    if (this.id) {
      this.userService.update(this.id, payload).subscribe({
        next: () => {
          this.alertService.success('User updated successfully');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to update user', err);
        },
      });
    } else {
      this.userService.save(payload).subscribe({
        next: () => {
          this.alertService.success('User created successfully');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to create user', err);
        },
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

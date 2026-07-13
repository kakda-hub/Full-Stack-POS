import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../core/services/api/user.service';
import { LanguageService } from '../../../core/services/language.service';
import { AlertService } from '../../../core/services/alert.service';
import { CloudinaryService } from '../../../core/services/api/cloudinary.service';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  form !: FormGroup;
  isUploading = signal(false);
  roles: any[] = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'cashier', viewValue: 'Cashier' },
  ];

  // Avatar state
  avatarPreview: string | null = null;
  avatarError = false;

  get id(): number | undefined {
    return this.data?.user?.id;
  }

  get currentAvatar(): string {
    if (this.avatarError) return '';
    return this.avatarPreview
      || this.data?.user?.avatarUrl
      || '';
  }

  get hasAvatar(): boolean {
    return !!(this.avatarPreview || this.data?.user?.avatarUrl);
  }

  get initials(): string {
    const name = this.data?.user?.name || '';
    return name ? name.charAt(0).toUpperCase() : '';
  }

  get showInitials(): boolean {
    return !!this.initials;
  }

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public lang: LanguageService,
    public dialogRef: MatDialogRef<UserDetailComponent>,
    private userService: UserService,
    private alertService: AlertService,
    private cloudinaryService: CloudinaryService,
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

    this.avatarError = false;
    this.isUploading.set(true);

    this.cloudinaryService.uploadFile(file).subscribe({
      next: (res) => {
        // Extract fileUrl from the nested response envelope
        const fileUrl =
          res?.data?.data?.fileUrl ||          // { data: { data: { fileUrl } } }
          res?.data?.data?.[0]?.fileUrl ||      // { data: { data: [{ fileUrl }] } }
          res?.data?.fileUrl;                    // { data: { fileUrl } }

        if (fileUrl) {
          this.avatarPreview = fileUrl;
          this.alertService.success(
            this.lang.currentLang() === 'km' ? 'បានបង្ហោះរូបភាពដោយជោគជ័យ' : 'Avatar uploaded successfully',
            this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
          );
        }
        this.isUploading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'ការបង្ហោះរូបភាពបរាជ័យ' : 'Avatar upload failed',
          this.lang.currentLang() === 'km' ? 'កំហុស' : 'Error'
        );
        this.isUploading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = this.form.value;
    // Don't send empty password on edit
    if (this.id && !payload.password) {
      delete payload.password;
    }

    // Use the Cloudinary-uploaded avatar URL if available
    if (this.avatarPreview && this.avatarPreview !== this.data?.user?.avatarUrl) {
      payload.avatarUrl = this.avatarPreview;
    }

    this.saveOrUpdateUser(payload);
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

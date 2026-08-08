import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../services/shared/language.service';
import { ThemeService } from '../../services/shared/theme.service';
import { AlertService } from '../../services/shared/alert.service';
import { UserService } from '../../services/user.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { modalAnimation, backdropAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-user-detail-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './user-detail-dialog.component.html',
  styleUrl: './user-detail-dialog.component.scss',
})
export class UserDetailDialogComponent implements OnInit {
  form!: FormGroup;
  isSaving = signal(false);
  isUploading = signal(false);
  roles: any[] = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'cashier', viewValue: 'Cashier' },
  ];

  // Avatar state
  avatarPreview = signal<string | null>(null);
  avatarError = false;

  get id(): number | undefined {
    return this.data?.user?.id;
  }

  get currentAvatar(): string {
    if (this.avatarError) return '';
    return this.avatarPreview() || this.data?.user?.avatarUrl || '';
  }

  get hasAvatar(): boolean {
    return !!(this.avatarPreview() || this.data?.user?.avatarUrl);
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
    public lang: LanguageService,
    private alertService: AlertService,
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
    public theme: ThemeService,
    private dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: any } | null,
  ) {}

  ngOnInit(): void {
    const item = this.data?.user || null;
    this.form = this.fb.group({
      name: [item?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [item?.email || '', [Validators.email]],
      role: [item?.role || '', [Validators.required]],
      password: ['', item ? Validators.minLength(6) : Validators.required],
      isActive: [item ? (item.status === 'active' || item.isActive) : true],
      avatarUrl: [item?.avatarUrl || ''],
    });

    // If editing, password is optional
    if (item) {
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.setErrors(null);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  /** Handle avatar file selected from inline upload component */
  onAvatarChange(file: File): void {
    this.isUploading.set(true);
    this.avatarError = false;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to cloudinary
    this.cloudinaryService.uploadFile(file).subscribe({
      next: (res) => {
        const fileUrl =
          res?.data?.data?.fileUrl ||
          res?.data?.data?.[0]?.fileUrl ||
          res?.data?.fileUrl;

        if (fileUrl) {
          this.avatarPreview.set(fileUrl);
          this.form.patchValue({ avatarUrl: fileUrl });
          this.alertService.success(
            this.lang.currentLang() === 'km' ? 'បានបង្ហោះរូបភាពដោយជោគជ័យ' : 'Avatar uploaded successfully',
          );
        }
        this.isUploading.set(false);
      },
      error: () => {
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'ការបង្ហោះរូបភាពបរាជ័យ' : 'Avatar upload failed',
        );
        this.isUploading.set(false);
      },
    });
  }

  /** Handle avatar removal */
  onAvatarRemoved(): void {
    this.avatarPreview.set(null);
    this.avatarError = false;
    this.form.patchValue({ avatarUrl: '' });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.avatarError = false;
    this.isUploading.set(true);

    this.cloudinaryService.uploadFile(file).subscribe({
      next: (res) => {
        const fileUrl =
          res?.data?.data?.fileUrl ||
          res?.data?.data?.[0]?.fileUrl ||
          res?.data?.fileUrl;

        if (fileUrl) {
          this.avatarPreview.set(fileUrl);
          this.alertService.success(
            this.lang.currentLang() === 'km' ? 'បានបង្ហោះរូបភាពដោយជោគជ័យ' : 'Avatar uploaded successfully',
            this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success',
          );
        }
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'ការបង្ហោះរូបភាពបរាជ័យ' : 'Avatar upload failed',
        );
        this.isUploading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload: any = { ...this.form.value };

    // Don't send empty password on edit
    if (this.id && !payload.password) {
      delete payload.password;
    }

    // Use uploaded avatar URL if a new one was uploaded
    const preview = this.avatarPreview();
    if (preview && preview !== this.data?.user?.avatarUrl) {
      payload.avatarUrl = preview;
    }

    // Don't send isActive on create (backend defaults to true)
    if (!this.id) {
      delete payload.isActive;
    } else {
      // Convert form isActive boolean to API format
      payload.isActive = payload.isActive === true || payload.isActive === 'true';
    }

    const request$ = this.id
      ? this.userService.update(this.id, payload)
      : this.userService.save(payload);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Failed to save user', err);
        this.alertService.error(
          this.lang.currentLang() === 'km'
            ? 'ការរក្សាទុកបរាជ័យ'
            : 'Failed to save user',
        );
        this.isSaving.set(false);
      },
    });
  }
}

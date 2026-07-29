import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CloudinaryService } from '../../../core/services/api/cloudinary.service';
import { UserService } from '../../../core/services/api/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { modalAnimation, backdropAnimation } from '../../animations/animations';

@Component({
  selector: 'app-avatar-upload-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './avatar-upload-dialog.component.html',
  styleUrl: './avatar-upload-dialog.component.scss',
})
export class AvatarUploadDialogComponent {
  isUploading = signal(false);
  isDragging = signal(false);
  previewUrl = signal<string | null>(null);
  previewSafeUrl = signal<SafeUrl | null>(null);
  uploadError = signal<string | null>(null);
  selectedFileInfo = signal<{ name: string; size: string } | null>(null);

  get currentAvatarUrl(): string {
    return this.data?.currentAvatarUrl || '';
  }

  get userName(): string {
    return this.data?.userName || 'User';
  }

  get hasChanges(): boolean {
    return !!this.previewUrl();
  }

  constructor(
    public dialogRef: MatDialogRef<AvatarUploadDialogComponent>,
    public lang: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: { currentAvatarUrl?: string; userName?: string } | null,
    private cloudinaryService: CloudinaryService,
    private userService: UserService,
    private auth: AuthService,
    private alert: AlertService,
    private sanitizer: DomSanitizer,
  ) {}

  /** Handle file selection from input or drag & drop */
  onFileSelected(file: File): void {
    this.uploadError.set(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.uploadError.set(
        this.lang.currentLang() === 'km'
          ? 'សូមជ្រើសរើសឯកសាររូបភាព'
          : 'Please select an image file',
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set(
        this.lang.currentLang() === 'km'
          ? 'ទំហំឯកសារត្រូវតែតិចជាង 5MB'
          : 'File size must be less than 5MB',
      );
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      this.previewUrl.set(url);
      this.previewSafeUrl.set(this.sanitizer.bypassSecurityTrustUrl(url));
    };
    reader.readAsDataURL(file);

    // Show file info
    this.selectedFileInfo.set({
      name: file.name,
      size: this.formatFileSize(file.size),
    });
  }

  /** Handle drag & drop events */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.onFileSelected(file);
    }
  }

  /** Upload the selected image to Cloudinary and update user profile */
  onUploadAndSave(): void {
    if (!this.previewUrl() || this.isUploading()) return;

    this.isUploading.set(true);
    this.uploadError.set(null);

    // Convert data URL back to Blob/File for upload
    fetch(this.previewUrl()!)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

        this.cloudinaryService.uploadFile(file, 'pos-avatars').subscribe({
          next: (res) => {
            // Extract the uploaded file URL from the nested response
            const fileUrl =
              res?.data?.data?.fileUrl ||
              res?.data?.data?.[0]?.fileUrl ||
              res?.data?.fileUrl ||
              res?.fileUrl ||
              res?.url ||
              res?.secure_url;

            if (!fileUrl) {
              this.uploadError.set(
                this.lang.currentLang() === 'km'
                  ? 'ការបង្ហោះរូបភាពបរាជ័យ'
                  : 'Failed to upload image',
              );
              this.isUploading.set(false);
              this.selectedFileInfo.set(null);
              return;
            }

            // Update user profile with new avatar URL
            const userId = Number(this.auth.currentUser()?.id);
            if (!userId) {
              this.uploadError.set('User not found');
              this.isUploading.set(false);
              this.selectedFileInfo.set(null);
              return;
            }

            this.userService.update(userId, { avatarUrl: fileUrl }).subscribe({
              next: () => {
                // Update local auth state with new avatar
                this.auth.updateAvatar(fileUrl);

                this.alert.success(
                  this.lang.currentLang() === 'km'
                    ? 'បានផ្លាស់ប្តូររូបភាពទម្រង់ដោយជោគជ័យ'
                    : 'Avatar updated successfully',
                );
                this.dialogRef.close(fileUrl);
              },
              error: () => {
                this.uploadError.set(
                  this.lang.currentLang() === 'km'
                    ? 'ការរក្សាទុករូបភាពបរាជ័យ'
                    : 'Failed to save avatar',
                );
                this.isUploading.set(false);
                this.selectedFileInfo.set(null);
              },
            });
          },
          error: () => {
            this.uploadError.set(
              this.lang.currentLang() === 'km'
                ? 'ការបង្ហោះរូបភាពបរាជ័យ'
                : 'Image upload failed',
            );
            this.isUploading.set(false);
            this.selectedFileInfo.set(null);
          },
        });
      })
      .catch(() => {
        this.uploadError.set(
          this.lang.currentLang() === 'km'
            ? 'កំហុសក្នុងការអានឯកសារ'
            : 'Error reading file',
        );
        this.isUploading.set(false);
        this.selectedFileInfo.set(null);
      });
  }

  /** Remove preview and reset */
  onReset(): void {
    this.previewUrl.set(null);
    this.previewSafeUrl.set(null);
    this.uploadError.set(null);
    this.selectedFileInfo.set(null);
  }

  /** Format file size for display */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /** Close without saving */
  onCancel(): void {
    this.selectedFileInfo.set(null);
    this.dialogRef.close(null);
  }
}

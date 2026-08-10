import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../../services/shared/language.service';
import { AlertService } from '../../../services/shared/alert.service';
import { CloudinaryService } from '../../../services/cloudinary.service';

@Component({
  selector: 'app-image-upload-avatar',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-upload-avatar.component.html',
  styleUrl: './image-upload-avatar.component.scss',
})
export class ImageUploadAvatarComponent implements OnInit {
  @Input() imageUrl: string | undefined;
  @Input() imageUrls: string[] = [];
  @Input() isMultiple: boolean = false;

  @Output() imageChange = new EventEmitter<string>();
  @Output() imagesChange = new EventEmitter<string[]>();
  @Output() remove = new EventEmitter<void>();
  @Output() removeAt = new EventEmitter<number>();
  @Output() setPrimary = new EventEmitter<number>();
  @Output() galleryOpen = new EventEmitter<void>();

  private destroyRef = inject(DestroyRef);
  isUploading = signal(false);

  constructor(
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    if (!this.isMultiple) {
      this.imageUrls = this.imageUrl ? [this.imageUrl] : [];
    }
  }

  get displayUrls(): string[] {
    if (this.isMultiple && this.imageUrls.length > 0) {
      return this.imageUrls;
    }
    if (this.imageUrl) {
      return [this.imageUrl];
    }
    return [];
  }

  get primaryUrl(): string | undefined {
    return this.displayUrls[0];
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadFile(file);
  }

  uploadFile(file: File): void {
    this.isUploading.set(true);

    this.cloudinaryService.uploadFile(file).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res: any) => {
        const fileUrl =
          res?.data?.data?.fileUrl ||
          res?.data?.data?.[0]?.fileUrl ||
          res?.data?.fileUrl ||
          res?.secure_url ||
          res?.url;

        if (fileUrl) {
          if (this.isMultiple) {
            const updated = [fileUrl, ...(this.imageUrls || [])];
            this.imageUrls = updated;
            this.imagesChange.emit(updated);
          } else {
            this.imageUrl = fileUrl;
            this.imageChange.emit(fileUrl);
          }
          this.alertService.success(
            this.lang.t('categories.imageUploaded'),
            this.lang.t('confirm.success'),
          );
        }
        this.isUploading.set(false);
      },
      error: () => {
        this.alertService.error(
          this.lang.t('categories.imageUploadFailed'),
          this.lang.t('error.title'),
        );
        this.isUploading.set(false);
      },
    });
  }

  onRemove(): void {
    if (this.isMultiple) {
      const updated = this.displayUrls.slice(1);
      this.imageUrls = updated;
      this.imagesChange.emit(updated);
    } else {
      this.imageUrl = undefined;
      this.imageChange.emit('');
    }
    this.remove.emit();
  }

  onRemoveAt(index: number): void {
    const updated = this.displayUrls.filter((_, i) => i !== index);
    this.imageUrls = updated;
    this.imagesChange.emit(updated);
    this.removeAt.emit(index);
  }

  onSetPrimary(index: number): void {
    if (index === 0) return;
    const current = this.displayUrls;
    const updated = [current[index], ...current.filter((_, i) => i !== index)];
    this.imageUrls = updated;
    this.imagesChange.emit(updated);
    this.setPrimary.emit(index);
  }

  onGalleryOpen(): void {
    this.galleryOpen.emit();
  }
}

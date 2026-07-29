import { ChangeDetectionStrategy, Component, ElementRef, viewChild, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-avatar-upload',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar-upload.component.html',
  styleUrl: './avatar-upload.component.scss',
})
export class AvatarUploadComponent {
  /** Inputs */
  imageUrl = input<string | null | undefined>();
  userName = input<string>('User');

  /** Outputs */
  imageChange = output<File>();
  imageRemoved = output<void>();

  /** Internal State */
  isDragging = signal(false);
  isHovering = signal(false);
  localPreview = signal<string | null>(null);
  
  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    // Create local preview
    const reader = new FileReader();
    reader.onload = () => this.localPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    this.imageChange.emit(file);
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.localPreview.set(null);
    this.imageRemoved.emit();
    if (this.fileInput()) {
      this.fileInput()!.nativeElement.value = '';
    }
  }
}
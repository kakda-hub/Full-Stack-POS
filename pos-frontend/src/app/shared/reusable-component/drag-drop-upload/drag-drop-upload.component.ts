import { ChangeDetectionStrategy, Component, Input, forwardRef, signal, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-drag-drop-upload',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drag-drop-upload.component.html',
  styleUrl: './drag-drop-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DragDropUploadComponent),
      multi: true,
    },
  ],
})
export class DragDropUploadComponent implements ControlValueAccessor {
  @Input() label: string = 'Image';
  @Input() labelKm: string = 'រូបភាព';
  @Input() uploadUrl: string = 'http://localhost:3000/api/v1/dynamicFileupload';

  value: string | null = null;
  isUploading = signal(false);
  isDragging = signal(false);

  // Injected services
  public theme = inject(ThemeService);
  public lang = inject(LanguageService);
  private http = inject(HttpClient);

  // CVA Callbacks
  onChange = (value: any) => { };
  onTouched = () => { };

  // Writes value from the parent form to the component
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  // File Selection
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  // Drag & Drop Handlers
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
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>(this.uploadUrl, formData).subscribe({
      next: (res) => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          const fileUrl = res.data.data[0].fileUrl;
          this.value = fileUrl;
          this.onChange(fileUrl);
        }
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.isUploading.set(false);
      }
    });
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.value = null;
    this.onChange(null);
  }
}


// <app-drag-drop-upload formControlName="imgUrl"></app-drag-drop-upload>

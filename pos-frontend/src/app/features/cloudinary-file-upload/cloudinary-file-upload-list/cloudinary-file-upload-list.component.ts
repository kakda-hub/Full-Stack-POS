import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CloudinaryService, CloudinaryResource } from '../../../services/cloudinary.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-cloudinary-file-upload-list',
  templateUrl: './cloudinary-file-upload-list.component.html',
  styleUrls: ['./cloudinary-file-upload-list.component.scss'],
  standalone: false
})
export class CloudinaryFileUploadListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  resources: CloudinaryResource[] = [];
  loading = true;
  error = '';
  displayedColumns: string[] = ['preview', 'public_id', 'format', 'bytes', 'created_at', 'actions'];

  // Upload state
  showUploadPanel = false;
  uploading = false;
  uploadProgress = 0;
  uploadSuccess = '';
  uploadError = '';
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  uploadFolder = 'pos-general';
  isDragOver = false;

  constructor(
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService
  ) {}

  deleting = false;

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources() {
    this.loading = true;
    this.error = '';
    this.cloudinaryService.listResources().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.resources) {
          this.resources = res.data.resources;
        } else {
          this.error = 'Failed to load resources.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching cloudinary resources:', err);
        this.error = err.error?.message || err.error?.error?.message || 'Cloudinary service is currently unavailable. Please try again later.';
        this.loading = false;
      }
    });
  }

  toggleUploadPanel() {
    this.showUploadPanel = !this.showUploadPanel;
    if (!this.showUploadPanel) {
      this.resetUploadState();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectFile(input.files[0]);
    }
  }

  selectFile(file: File) {
    this.selectedFile = file;
    this.uploadError = '';
    this.uploadSuccess = '';

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedFilePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFilePreview = null;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectFile(event.dataTransfer.files[0]);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';

    this.cloudinaryService.uploadFile(this.selectedFile, this.uploadFolder).subscribe({
      next: (res) => {
        this.uploading = false;
        this.uploadSuccess = `File "${this.selectedFile?.name}" uploaded successfully!`;
        this.selectedFile = null;
        this.selectedFilePreview = null;
        // Refresh the list
        this.loadResources();
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err.error?.message || 'Upload failed. Please try again.';
      }
    });
  }

  resetUploadState() {
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploading = false;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.uploadFolder = 'pos-general';
  }

  deleteResource(resource: CloudinaryResource) {
    const confirmed = confirm(`Are you sure you want to delete "${resource.public_id}"?`);
    if (!confirmed) return;

    this.deleting = true;
    this.cloudinaryService.deleteResource(resource.public_id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.resources = this.resources.filter(r => r.public_id !== resource.public_id);
        this.alertService.success(`Resource "${resource.public_id}" deleted successfully`);
      },
      error: (err) => {
        this.deleting = false;
        this.alertService.error(err.error?.message || 'Failed to delete resource. Please try again.');
      }
    });
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}

import { Component, OnInit, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CloudinaryService, CloudinaryResource } from '../../../core/services/api/cloudinary.service';
import { AlertService } from '../../../core/services/alert.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';

type SortColumn = 'public_id' | 'format' | 'bytes' | 'created_at';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-cloudinary-file-upload-list',
  templateUrl: './cloudinary-file-upload-list.component.html',
  styleUrls: ['./cloudinary-file-upload-list.component.scss'],
  animations: [fadeIn, listAnimation, pageTransition],
  standalone: false
})
export class CloudinaryFileUploadListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  resources = signal<CloudinaryResource[]>([]);
  loading = true;
  error = '';

  // Search / Filter
  searchQuery = signal('');
  private searchSubject = new Subject<string>();

  // Derived
  filteredResources = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.resources();
    return this.resources().filter(r =>
      r.public_id.toLowerCase().includes(q) ||
      r.format.toLowerCase().includes(q)
    );
  });

  // KPI stats
  totalFiles = computed(() => this.resources().length);
  totalSize = computed(() => {
    return this.resources().reduce((sum, r) => sum + r.bytes, 0);
  });
  uniqueFormats = computed(() => {
    const formats = new Set(this.resources().map(r => r.format));
    return formats.size;
  });

  // Upload state
  showUploadPanel = false;
  uploading = false;
  uploadSuccess = '';
  uploadError = '';
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  uploadFolder = 'pos-general';
  isDragOver = false;

  // Sort state
  sortColumn = signal<SortColumn>('created_at');
  sortDirection = signal<SortDirection>('desc');

  sortedResources = computed(() => {
    const all = this.filteredResources();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return [...all].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'public_id':
          cmp = a.public_id.localeCompare(b.public_id);
          break;
        case 'format':
          cmp = a.format.localeCompare(b.format);
          break;
        case 'bytes':
          cmp = a.bytes - b.bytes;
          break;
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  toggleSort(column: SortColumn) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  sortIndicator(column: SortColumn): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '▲' : '▼';
  }

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  pageSizeOptions = [10, 25, 50, 100];

  paginatedResources = computed(() => {
    const all = this.sortedResources();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  // Delete state
  deleting = false;

  // Preview lightbox
  previewImage = signal<string | null>(null);

  constructor(
    public theme: ThemeService,
    public lang: LanguageService,
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadResources();

    this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(q => {
      this.searchQuery.set(q);
      this.currentPage.set(1);
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  loadResources() {
    this.loading = true;
    this.error = '';
    this.cloudinaryService.listResources().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.data && res.data.data.resources) {
          this.resources.set(res.data.data.resources);
          this.currentPage.set(1);
        } else {
          this.error = this.lang.currentLang() === 'km' ? 'មិនអាចផ្ទុកធនធានបានទេ។' : 'Failed to load resources.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching cloudinary resources:', err);
        this.error = err.error?.message || err.error?.error?.message 
          || (this.lang.currentLang() === 'km' 
            ? 'សេវាកម្ម Cloudinary មិនអាចប្រើបានទេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។' 
            : 'Cloudinary service is currently unavailable. Please try again later.');
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
        this.uploadSuccess = this.lang.currentLang() === 'km'
          ? `ឯកសារ "${this.selectedFile?.name}" បានផ្ទុកឡើងដោយជោគជ័យ!`
          : `File "${this.selectedFile?.name}" uploaded successfully!`;
        this.selectedFile = null;
        this.selectedFilePreview = null;
        this.loadResources();
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err.error?.message 
          || (this.lang.currentLang() === 'km' ? 'ការផ្ទុកឯកសារបរាជ័យ។ សូមព្យាយាមម្តងទៀត។' : 'Upload failed. Please try again.');
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

  // ----- Pagination -----
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  // ----- Delete -----
  deleteResource(resource: CloudinaryResource) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message: this.lang.currentLang() === 'km'
          ? `តើអ្នកប្រាកដថាចង់លុប "${resource.public_id}" មែនទេ?`
          : `Are you sure you want to delete "${resource.public_id}"?`,
        confirmLabel: this.lang.currentLang() === 'km' ? 'លុប' : 'Delete',
        cancelLabel: this.lang.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.deleting = true;
    this.cloudinaryService.deleteResource(resource.public_id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.resources.update(list => list.filter(r => r.public_id !== resource.public_id));
        this.currentPage.set(1);
        const successMsg = this.lang.currentLang() === 'km'
          ? `ធនធាន "${resource.public_id}" ត្រូវបានលុបដោយជោគជ័យ`
          : `Resource "${resource.public_id}" deleted successfully`;
        this.alertService.success(successMsg);
      },
      error: (err) => {
        this.deleting = false;
        const errorMsg = err.error?.message 
          || (this.lang.currentLang() === 'km' ? 'ការលុបធនធានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។' : 'Failed to delete resource. Please try again.');
        this.alertService.error(errorMsg);
      }
    });
    });
  }

  // ----- Preview Lightbox -----
  openPreview(url: string) {
    this.previewImage.set(url);
  }

  closePreview() {
    this.previewImage.set(null);
  }

  // ----- Copy to Clipboard -----
  copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      const msg = this.lang.currentLang() === 'km'
        ? `${label} ត្រូវបានចម្លង`
        : `${label} copied to clipboard`;
      this.alertService.success(msg);
    }).catch(() => {
      const msg = this.lang.currentLang() === 'km'
        ? 'ការចម្លងបរាជ័យ'
        : 'Failed to copy to clipboard';
      this.alertService.error(msg);
    });
  }

  // ----- Helpers -----
  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  formatTotalSize(bytes: number) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  trackByPublicId(_: number, r: CloudinaryResource): string {
    return r.public_id;
  }
}

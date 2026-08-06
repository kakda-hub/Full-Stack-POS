import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  computed,
} from '@angular/core';
import {
  Subject,
  Observable,
  merge,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
  of,
  takeUntil,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  CloudinaryService,
  CloudinaryResource,
  CloudinaryApiResponse,
} from '../../../core/services/api/cloudinary.service';
import { AlertService } from '../../../core/services/alert.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { fadeIn, listAnimation, pageTransition } from '../../../shared/animations/animations';
import { ListQuery } from '../../../models/list-query';

type SortColumn = 'public_id' | 'format' | 'bytes' | 'created_at';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-cloudinary-file-upload-list',
  templateUrl: './cloudinary-file-upload-list.component.html',
  styleUrls: ['./cloudinary-file-upload-list.component.scss'],
  animations: [fadeIn, listAnimation, pageTransition],
  standalone: false,
})
export class CloudinaryFileUploadListComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly destroyed$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private readonly refreshSubject = new Subject<void>();

  // Core state — `resources` holds the current server-side page
  resources = signal<CloudinaryResource[]>([]);
  totalItems = signal(0);
  isLoading = signal(false);
  error = signal('');

  // Search
  searchQuery = signal('');

  // Derived: KPI stats
  // totalFiles uses the envelope total (search-scoped, never the page length).
  totalFiles = computed(() => this.totalItems());
  // totalSize / uniqueFormats are computed from a global stats snapshot
  // (capped at the backend's 500-resource ceiling) so the cards stay accurate
  // even though the table only shows one page.
  statsResources = signal<CloudinaryResource[]>([]);
  totalSize = computed(() => this.statsResources().reduce((sum, r) => sum + (r.bytes || 0), 0));
  uniqueFormats = computed(() => new Set(this.statsResources().map((r) => r.format)).size);
  showingCount = computed(() => this.totalItems());

  // Server-side sort + offset-based pagination
  sortColumn = signal<SortColumn>('created_at');
  sortDirection = signal<SortDirection>('desc');
  currentPage = signal(1);
  pageSize = signal(10);
  pageSizeOptions = [10, 25, 50, 100];

  /** Monotonic token that invalidates in-flight page requests (stale-response guard). */
  private loadSeq = 0;

  // Upload state
  showUploadPanel = false;
  uploading = false;
  uploadSuccess = '';
  uploadError = '';
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  uploadFolder = 'pos-general';
  isDragOver = false;

  // Delete / preview
  deleting = false;
  previewImage = signal<string | null>(null);

  constructor(
    public theme: ThemeService,
    public lang: LanguageService,
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // Single fetch pipeline: refresh triggers fetch instantly, search input is
    // debounced server-side. switchMap cancels any in-flight request so stale
    // responses can never overwrite newer ones.
    merge(
      this.refreshSubject.pipe(map(() => this.searchQuery())),
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()),
    )
      .pipe(
        switchMap((term) => this.fetchResources(term)),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    // Initial load on route entry so the dashboard renders right away.
    this.refreshSubject.next();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSearch(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  } /** Fresh fetch (refresh button, retry, after upload) using the active search term. */
  loadResources(): void {
    this.refreshSubject.next();
  }

  /**
   * GET /cloudinary returns the flat standard envelope (@SkipIntercept on the
   * backend), so `data` is the resources array itself.
   */
  private unwrapResources(response: CloudinaryApiResponse | null): CloudinaryResource[] {
    return Array.isArray(response?.data) ? response.data : [];
  }

  /** Standard offset-based list query: max/offset/sort/sortBy/search. */
  private buildQuery(): ListQuery {
    return {
      search: this.searchQuery() || undefined,
      sortBy: this.sortColumn(),
      sort: this.sortDirection(),
      offset: (this.currentPage() - 1) * this.pageSize(),
      max: this.pageSize(),
    };
  }

  private applyPage(res: CloudinaryApiResponse | null): void {
    const page = this.unwrapResources(res);
    this.resources.set(page);
    this.totalItems.set(res?.total ?? page.length);
    this.isLoading.set(false);
  }

  private errorMessage(err: any): string {
    return (
      err.error?.message ||
      err.error?.error?.message ||
      (this.lang.currentLang() === 'km'
        ? 'សេវាកម្ម Cloudinary មិនអាចប្រើបានទេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។'
        : 'Cloudinary service is currently unavailable. Please try again later.')
    );
  }

  /**
   * Search / refresh pipeline: resets to page 1 and also refreshes the global
   * KPI stats so the stat cards stay search-scoped.
   */
  private fetchResources(searchTerm: string): Observable<CloudinaryResource[]> {
    this.isLoading.set(true);
    this.error.set('');
    this.searchQuery.set(searchTerm);
    this.currentPage.set(1);
    const seq = ++this.loadSeq; // stale-response guard shared with fetchPage

    return this.cloudinaryService.listResources(this.buildQuery()).pipe(
      map((res) => {
        if (seq !== this.loadSeq) return this.resources(); // stale response — ignore
        this.applyPage(res);
        this.loadStats();
        return this.resources();
      }),
      catchError((err) => {
        if (seq !== this.loadSeq) return of(this.resources()); // stale response — ignore
        this.error.set(this.errorMessage(err));
        this.isLoading.set(false);
        return of([]);
      }),
    );
  }

  /** Page navigation / sort / page-size change: fetches a fresh page only. */
  private fetchPage(): void {
    this.isLoading.set(true);
    this.error.set('');
    const seq = ++this.loadSeq;

    this.cloudinaryService.listResources(this.buildQuery()).subscribe({
      next: (res) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        const page = this.unwrapResources(res);
        // After a delete (or concurrent data shrink) the current page may be
        // empty while more records exist — step back one page, like the other
        // list pages do.
        if (page.length === 0 && this.currentPage() > 1 && (res?.total ?? 0) > 0) {
          this.currentPage.update(p => p - 1);
          this.fetchPage();
          return;
        }
        this.applyPage(res);
      },
      error: (err) => {
        if (seq !== this.loadSeq) return; // stale response — ignore
        this.error.set(this.errorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Global KPI snapshot (capped at the backend's 500 ceiling, search-scoped).
   * Keeps the Total Size / Unique Formats cards accurate while the table
   * paginates server-side.
   */
  private loadStats(): void {
    this.cloudinaryService
      .listResources({ search: this.searchQuery() || undefined, max: 500, sortBy: 'created_at', sort: 'desc' })
      .subscribe({
        next: (res) => this.statsResources.set(this.unwrapResources(res)),
        error: () => this.statsResources.set([]),
      });
  }

  // Upload
  toggleUploadPanel(): void {
    this.showUploadPanel = !this.showUploadPanel;
    if (!this.showUploadPanel) this.resetUploadState();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.selectFile(input.files[0]);
  }

  selectFile(file: File): void {
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files?.length) this.selectFile(event.dataTransfer.files[0]);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';

    this.cloudinaryService.uploadFile(this.selectedFile, this.uploadFolder).subscribe({
      next: () => {
        this.uploading = false;
        this.uploadSuccess =
          this.lang.currentLang() === 'km'
            ? `ឯកសារ "${this.selectedFile?.name}" បានផ្ទុកឡើងដោយជោគជ័យ!`
            : `File "${this.selectedFile?.name}" uploaded successfully!`;
        this.selectedFile = null;
        this.selectedFilePreview = null;
        this.loadResources();
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError =
          err.error?.message ||
          (this.lang.currentLang() === 'km'
            ? 'ការផ្ទុកឯកសារបរាជ័យ។ សូមព្យាយាមម្តងទៀត។'
            : 'Upload failed. Please try again.');
      },
    });
  }

  resetUploadState(): void {
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploading = false;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.uploadFolder = 'pos-general';
  }

  // Sorting (server-side: reset offset to 0, then reload)
  toggleSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
    this.fetchPage();
  }

  sortIndicator(column: SortColumn): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '▲' : '▼';
  }

  // Pagination (offset-based: next page = offset + max, never below 0)
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchPage();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // changing page size resets the offset to 0
    this.fetchPage();
  }

  // Delete
  deleteResource(resource: CloudinaryResource): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        title: this.lang.currentLang() === 'km' ? 'បញ្ជាក់ការលុប' : 'Confirm Delete',
        message:
          this.lang.currentLang() === 'km'
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
        next: () => {
          this.deleting = false;
          this.resources.update((list) => list.filter((r) => r.public_id !== resource.public_id));
          this.totalItems.update((t) => Math.max(0, t - 1));
          this.currentPage.set(1);
          this.loadStats();
          this.alertService.success(
            this.lang.currentLang() === 'km'
              ? `ធនធាន "${resource.public_id}" ត្រូវបានលុបដោយជោគជ័យ`
              : `Resource "${resource.public_id}" deleted successfully`,
          );
        },
        error: (err) => {
          this.deleting = false;
          this.alertService.error(
            err.error?.message ||
              (this.lang.currentLang() === 'km'
                ? 'ការលុបធនធានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។'
                : 'Failed to delete resource. Please try again.'),
          );
        },
      });
    });
  }

  // Preview lightbox
  openPreview(url: string): void {
    this.previewImage.set(url);
  }

  closePreview(): void {
    this.previewImage.set(null);
  }

  // Clipboard
  copyToClipboard(text: string, label: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.alertService.success(
          this.lang.currentLang() === 'km'
            ? `${label} ត្រូវបានចម្លង`
            : `${label} copied to clipboard`,
        );
      })
      .catch(() => {
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'ការចម្លងបរាជ័យ' : 'Failed to copy to clipboard',
        );
      });
  }

  // Helpers
  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  formatTotalSize(bytes: number): string {
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

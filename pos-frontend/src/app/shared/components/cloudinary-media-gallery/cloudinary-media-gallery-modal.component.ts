import { Component, Inject, OnInit, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  CloudinaryService,
  CloudinaryResource,
} from '../../../core/services/api/cloudinary.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { modalAnimation } from '../../../shared/animations/animations';

export interface MediaGalleryData {
  selectedUrl?: string;
  folder?: string;
}

@Component({
  selector: 'app-cloudinary-media-gallery',
  standalone: false,
  animations: [modalAnimation],
  templateUrl: './cloudinary-media-gallery-modal.component.html',
  styleUrl: './cloudinary-media-gallery-modal.component.scss',
})
export class CloudinaryMediaGalleryModalComponent implements OnInit {
  searchQuery = signal('');
  selectedCategory = signal('all');
  currentPage = signal(1);
  pageSize = 20;
  isLoading = signal(false);
  isUploading = signal(false);
  selectedUrl = signal('');

  resources = signal<CloudinaryResource[]>([]);
  // Server-side total (API envelope `total`) used for page count.
  totalItems = signal(0);

  // NOTE: values must match Cloudinary folder names (pos-* prefix) so the
  // category filter (mapped to the API search param) and upload folder stay
  // consistent.
  categories = [
    { value: 'all', label: 'All' },
    { value: 'pos-banners', label: 'Banners' },
    { value: 'pos-general', label: 'General' },
    { value: 'pos-products', label: 'Products' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CloudinaryMediaGalleryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MediaGalleryData | null,
    private cloudinaryService: CloudinaryService,
    public lang: LanguageService,
    public theme: ThemeService,
  ) {}

  ngOnInit(): void {
    this.selectedUrl.set(this.data?.selectedUrl || '');
    this.loadResources();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize));
  }

  /** Monotonic token that invalidates in-flight requests (stale-response guard). */
  private loadSeq = 0;

  loadResources(): void {
    this.isLoading.set(true);
    const seq = ++this.loadSeq; // stale-response guard
    // Server-side search: the typed query wins; otherwise the selected category
    // folder (public_id prefix) narrows the request. Pagination is offset-based
    // so the modal never bulk-loads the whole library (max = page size).
    const search =
      this.searchQuery().trim() ||
      (this.selectedCategory() !== 'all' ? this.selectedCategory() : undefined);
    this.cloudinaryService
      .listResources({
        search,
        sortBy: 'created_at',
        sort: 'desc',
        offset: (this.currentPage() - 1) * this.pageSize,
        max: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          if (seq !== this.loadSeq) return; // stale response — ignore
          // GET /cloudinary returns the flat standard envelope, so `data` is the
          // resources array itself.
          const resources = Array.isArray(res?.data) ? res.data : [];
          this.resources.set(resources);
          this.totalItems.set(res?.total ?? resources.length);
          this.isLoading.set(false);
        },
        error: () => {
          if (seq !== this.loadSeq) return; // stale response — ignore
          this.resources.set([]);
          this.totalItems.set(0);
          this.isLoading.set(false);
        },
      });
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadResources();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.loadResources();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadResources();
  }

  onSelect(resource: CloudinaryResource): void {
    this.selectedUrl.set(resource.secure_url);
  }

  isSelected(resource: CloudinaryResource): boolean {
    return this.selectedUrl() === resource.secure_url;
  }

  confirm(): void {
    this.dialogRef.close(this.selectedUrl());
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadFile(file);
  }

  uploadFile(file: File): void {
    this.isUploading.set(true);
    const folder = this.selectedCategory() !== 'all' ? this.selectedCategory() : 'pos-general';
    this.cloudinaryService.uploadFile(file, folder).subscribe({
      next: (res) => {
        const fileUrl =
          res?.data?.data?.fileUrl ||
          res?.data?.data?.[0]?.fileUrl ||
          res?.data?.fileUrl ||
          res?.secure_url ||
          res?.url;
        if (fileUrl) {
          this.selectedUrl.set(fileUrl);
        }
        this.isUploading.set(false);
        this.loadResources();
      },
      error: () => {
        this.isUploading.set(false);
      },
    });
  }

  getFormatLabel(format: string): string {
    const upper = format.toUpperCase();
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG', 'PDF'].includes(upper)) {
      return upper;
    }
    return upper || '?';
  }
}

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

  // NOTE: values must match Cloudinary folder names (pos-* prefix) so the
  // client-side category filter and upload folder stay consistent.
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

  get filteredResources(): CloudinaryResource[] {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();

    let filtered = this.resources();

    if (query) {
      filtered = filtered.filter(
        (r) =>
          r.public_id.toLowerCase().includes(query) ||
          r.format.toLowerCase().includes(query) ||
          (r.url || '').toLowerCase().includes(query),
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter((r) => {
        const folder = r.public_id.split('/')[0];
        return folder === category;
      });
    }

    return filtered;
  }

  get paginatedResources(): CloudinaryResource[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredResources.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredResources.length / this.pageSize));
  }

  loadResources(): void {
    this.isLoading.set(true);
    this.cloudinaryService.listResources(this.searchQuery()).subscribe({
      next: (res) => {
        // GET /cloudinary returns the flat standard envelope, so `data` is the
        // resources array itself.
        const resources = Array.isArray(res?.data) ? res.data : [];
        this.resources.set(resources);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.resources.set([]);
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
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
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

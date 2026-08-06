import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CloudinaryFileUploadListComponent } from './cloudinary-file-upload-list.component';
import {
  CloudinaryService,
  CloudinaryResource,
  CloudinaryApiResponse,
} from '../../../core/services/api/cloudinary.service';
import { AlertService } from '../../../core/services/alert.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../core/material/material.module';

// NOTE: this app runs zoneless, so `fakeAsync`/`tick` are unavailable.
// The component debounces searches by 300ms — tests use real timers instead.
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const DEBOUNCE_MS = 300;

describe('CloudinaryFileUploadListComponent', () => {
  let fixture: ComponentFixture<CloudinaryFileUploadListComponent>;
  let component: CloudinaryFileUploadListComponent;

  const themeMock = { isDark: () => false };
  const langMock = { currentLang: () => 'en' };
  const alertMock = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const cloudinaryMock = {
    listResources: vi.fn(),
    uploadFile: vi.fn(),
    deleteResource: vi.fn(),
  };
  const dialogMock = {
    open: vi.fn(() => ({ afterClosed: () => of(true) })),
  };

  const sampleResources: CloudinaryResource[] = [
    {
      asset_id: 'a1',
      public_id: 'pos-products/tshirt',
      format: 'png',
      version: 1,
      resource_type: 'image',
      type: 'upload',
      created_at: '2025-01-03T00:00:00Z',
      bytes: 3000,
      width: 800,
      height: 600,
      url: 'https://u1',
      secure_url: 'https://s1',
    },
    {
      asset_id: 'a2',
      public_id: 'pos-banners/sale',
      format: 'jpg',
      version: 1,
      resource_type: 'image',
      type: 'upload',
      created_at: '2025-01-01T00:00:00Z',
      bytes: 1000,
      width: 800,
      height: 400,
      url: 'https://u2',
      secure_url: 'https://s2',
    },
    {
      asset_id: 'a3',
      public_id: 'docs/invoice',
      format: 'pdf',
      version: 1,
      resource_type: 'raw',
      type: 'upload',
      created_at: '2025-01-02T00:00:00Z',
      bytes: 2000,
      width: 0,
      height: 0,
      url: 'https://u3',
      secure_url: 'https://s3',
    },
  ];

  function mockListResponse(resources: CloudinaryResource[] = sampleResources) {
    const response: CloudinaryApiResponse = {
      success: true,
      statusCode: 200,
      data: resources,
      total: resources.length,
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    cloudinaryMock.listResources.mockReturnValue(of(response));
  }

  /** Deterministic fake FileReader so image previews resolve synchronously. */
  class FakeFileReader {
    result = 'data:image/png;base64,abc';
    onload: (() => void) | null = null;
    readAsDataURL() {
      this.onload?.();
    }
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal('FileReader', FakeFileReader);
    mockListResponse();

    await TestBed.configureTestingModule({
      declarations: [CloudinaryFileUploadListComponent],
      imports: [SharedModule, MaterialModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        { provide: LanguageService, useValue: langMock },
        { provide: AlertService, useValue: alertMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CloudinaryFileUploadListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** Mount the component and wait for the initial (debounced) fetch. */
  async function mount() {
    fixture.detectChanges();
    await sleep(DEBOUNCE_MS + 50);
    fixture.detectChanges();
  }

  function searchInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
  }

  function typeInSearch(value: string) {
    const input = searchInput();
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  // ─── Initial load ─────────────────────────────────────────────────────────
  describe('initial load', () => {
    it('fetches resources on init with an empty search term', async () => {
      await mount();
      expect(cloudinaryMock.listResources).toHaveBeenCalledWith('');
      expect(component.isLoading()).toBe(false);
    });

    it('renders one table row per resource', async () => {
      await mount();
      const rows = fixture.nativeElement.querySelectorAll('tbody tr.group');
      expect(rows.length).toBe(sampleResources.length);
      expect(rows[0].textContent).toContain('pos-products/tshirt');
    });

    it('stays in the loading state until the fetch completes', async () => {
      cloudinaryMock.listResources.mockReturnValue(new Subject());
      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);
      await sleep(DEBOUNCE_MS + 50);
      expect(component.isLoading()).toBe(true);
      expect(component.error()).toBe('');
    });
  });

  // ─── KPI stats & helpers ──────────────────────────────────────────────────
  describe('KPI stats & helpers', () => {
    it('computes total files, total size and unique formats', async () => {
      await mount();
      expect(component.totalFiles()).toBe(3);
      expect(component.totalSize()).toBe(6000);
      expect(component.uniqueFormats()).toBe(3);
    });

    it('formats byte sizes', () => {
      expect(component.formatBytes(0)).toBe('0 Bytes');
      expect(component.formatBytes(1024)).toBe('1 KB');
      expect(component.formatBytes(1536)).toBe('1.5 KB');
      expect(component.formatBytes(5 * 1024 * 1024)).toBe('5 MB');
      expect(component.formatTotalSize(2048)).toBe('2 KB');
    });

    it('tracks rows by public id', () => {
      expect(component.trackByPublicId(0, sampleResources[0])).toBe('pos-products/tshirt');
    });
  });

  // ─── Search ───────────────────────────────────────────────────────────────
  describe('search', () => {
    it('debounces input and fetches server-side with the search term', async () => {
      await mount();
      cloudinaryMock.listResources.mockClear();

      typeInSearch('pos-products');
      // 100ms margin: real timers can drift under load, a 1ms margin is flaky.
      await sleep(DEBOUNCE_MS - 100);
      expect(cloudinaryMock.listResources).not.toHaveBeenCalled();
      // Cross the 300ms debounce window.
      await sleep(DEBOUNCE_MS + 50);

      expect(cloudinaryMock.listResources).toHaveBeenCalledWith('pos-products');
      expect(component.searchQuery()).toBe('pos-products');
      // debounced fetch resets to page 1
      expect(component.currentPage()).toBe(1);
    });

    it('clearing the search reloads everything', async () => {
      await mount();
      cloudinaryMock.listResources.mockClear();

      typeInSearch('pos-products');
      await sleep(DEBOUNCE_MS + 50);
      cloudinaryMock.listResources.mockClear();

      typeInSearch('');
      await sleep(DEBOUNCE_MS + 50);
      expect(cloudinaryMock.listResources).toHaveBeenCalledWith('');
    });

    it('filters the loaded resources client-side as a fallback', async () => {
      await mount();
      component.resources.set(sampleResources);
      component.searchQuery.set('invoice');
      expect(component.filteredResources().length).toBe(1);
      expect(component.filteredResources()[0].public_id).toBe('docs/invoice');
    });

    it('is case-insensitive client-side', async () => {
      await mount();
      component.resources.set(sampleResources);
      component.searchQuery.set('TSHIRT');
      expect(component.filteredResources().length).toBe(1);
    });
  });

  // ─── Sorting ──────────────────────────────────────────────────────────────
  describe('sorting', () => {
    it('sorts by public_id ascending, then descending on second click', async () => {
      await mount();
      component.toggleSort('public_id');
      expect(component.sortedResources().map((r) => r.public_id)).toEqual([
        'docs/invoice',
        'pos-banners/sale',
        'pos-products/tshirt',
      ]);

      component.toggleSort('public_id');
      expect(component.sortedResources()[0].public_id).toBe('pos-products/tshirt');
    });

    it('sorts by bytes numerically', async () => {
      await mount();
      component.toggleSort('bytes');
      expect(component.sortedResources().map((r) => r.bytes)).toEqual([1000, 2000, 3000]);
    });

    it('renders a sort indicator only for the active column', async () => {
      await mount();
      expect(component.sortIndicator('public_id')).toBe('');
      component.toggleSort('public_id');
      expect(component.sortIndicator('public_id')).toBe('▲');
      component.toggleSort('public_id');
      expect(component.sortIndicator('public_id')).toBe('▼');
    });
  });

  // ─── Pagination ───────────────────────────────────────────────────────────
  describe('pagination', () => {
    function manyResources(count: number): CloudinaryResource[] {
      return Array.from({ length: count }, (_, i) => ({
        ...sampleResources[0],
        asset_id: `a${i}`,
        public_id: `pos-products/item-${i}`,
        bytes: i + 1,
      }));
    }

    it('paginates resources and navigates pages', async () => {
      mockListResponse(manyResources(15));
      await mount();

      expect(component.paginatedResources().length).toBe(10);
      component.onPageChange(2);
      expect(component.currentPage()).toBe(2);
      expect(component.paginatedResources().length).toBe(5);
    });

    it('changing page size resets to page 1', async () => {
      mockListResponse(manyResources(15));
      await mount();

      component.onPageChange(2);
      component.onPageSizeChange(25);
      expect(component.pageSize()).toBe(25);
      expect(component.currentPage()).toBe(1);
      expect(component.paginatedResources().length).toBe(15);
    });
  });

  // ─── Upload panel ─────────────────────────────────────────────────────────
  describe('upload panel', () => {
    it('toggles the panel and resets upload state when closed', () => {
      component.toggleUploadPanel();
      expect(component.showUploadPanel).toBe(true);

      component.selectedFile = new File(['x'], 'x.png', { type: 'image/png' });
      component.uploadFolder = 'custom-folder';
      component.toggleUploadPanel();

      expect(component.showUploadPanel).toBe(false);
      expect(component.selectedFile).toBeNull();
      expect(component.uploadFolder).toBe('pos-general');
      expect(component.uploadSuccess).toBe('');
    });

    it('selects an image file and generates a data-url preview', () => {
      const file = new File(['x'], 'photo.png', { type: 'image/png' });
      component.selectFile(file);
      expect(component.selectedFile).toBe(file);
      expect(component.selectedFilePreview).toBe('data:image/png;base64,abc');
      expect(component.uploadError).toBe('');
    });

    it('leaves the preview null for non-image files', () => {
      const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
      component.selectFile(file);
      expect(component.selectedFile).toBe(file);
      expect(component.selectedFilePreview).toBeNull();
    });

    it('selects files dropped onto the dropzone', () => {
      const file = new File(['x'], 'drop.jpg', { type: 'image/jpeg' });
      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent;

      component.onDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.selectedFile).toBe(file);
      expect(component.isDragOver).toBe(false);
    });

    it('sets and clears the drag-over highlight', () => {
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as DragEvent;
      component.onDragOver(event);
      expect(component.isDragOver).toBe(true);
      component.onDragLeave(event);
      expect(component.isDragOver).toBe(false);
    });
  });

  // ─── Upload flow ──────────────────────────────────────────────────────────
  describe('upload flow', () => {
    it('uploads the selected file, shows a success message and reloads', async () => {
      await mount();
      cloudinaryMock.uploadFile.mockReturnValue(of({ success: true }));
      const file = new File(['x'], 'new.png', { type: 'image/png' });
      component.selectedFile = file;
      component.uploadFolder = 'pos-products';

      component.uploadFile();

      expect(cloudinaryMock.uploadFile).toHaveBeenCalledWith(file, 'pos-products');
      expect(component.uploading).toBe(false);
      expect(component.uploadSuccess).toContain('new.png');
      expect(component.selectedFile).toBeNull();
      expect(component.selectedFilePreview).toBeNull();
      // a reload is triggered after a successful upload
      expect(cloudinaryMock.listResources).toHaveBeenCalled();
    });

    it('shows an error message when the upload fails', async () => {
      await mount();
      cloudinaryMock.uploadFile.mockReturnValue(
        throwError(() => ({ error: { message: 'Upload quota exceeded' } })),
      );
      component.selectedFile = new File(['x'], 'bad.png', { type: 'image/png' });

      component.uploadFile();

      expect(component.uploading).toBe(false);
      expect(component.uploadError).toBe('Upload quota exceeded');
      expect(component.selectedFile).toBeTruthy();
    });

    it('does nothing when no file is selected', () => {
      component.uploadFile();
      expect(cloudinaryMock.uploadFile).not.toHaveBeenCalled();
    });
  });

  // ─── Delete ───────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('removes the resource from the list after confirmation', async () => {
      await mount();
      dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
      cloudinaryMock.deleteResource.mockReturnValue(of({ success: true }));

      const target = sampleResources[0];
      component.deleteResource(target);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(cloudinaryMock.deleteResource).toHaveBeenCalledWith(target.public_id);
      expect(component.resources().some((r) => r.public_id === target.public_id)).toBe(false);
      expect(alertMock.success).toHaveBeenCalled();
    });

    it('does not delete when the dialog is cancelled', async () => {
      await mount();
      dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

      component.deleteResource(sampleResources[0]);

      expect(cloudinaryMock.deleteResource).not.toHaveBeenCalled();
    });
  });

  // ─── Clipboard ────────────────────────────────────────────────────────────
  describe('clipboard', () => {
    it('copies text and shows a success alert', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      component.copyToClipboard('hello', 'URL');
      await sleep(0);

      expect(writeText).toHaveBeenCalledWith('hello');
      expect(alertMock.success).toHaveBeenCalledWith('URL copied to clipboard');
    });

    it('shows an error alert when the clipboard is unavailable', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      });

      component.copyToClipboard('hello', 'URL');
      await sleep(0);

      expect(alertMock.error).toHaveBeenCalled();
    });
  });

  // ─── Preview lightbox ─────────────────────────────────────────────────────
  describe('preview lightbox', () => {
    it('opens and closes the lightbox state', () => {
      component.openPreview('https://s1');
      expect(component.previewImage()).toBe('https://s1');
      component.closePreview();
      expect(component.previewImage()).toBeNull();
    });

    it('renders the lightbox in the DOM while open', async () => {
      await mount();
      component.openPreview('https://s1');
      fixture.detectChanges();

      const lightbox = fixture.nativeElement.querySelector('.fixed.inset-0.z-50');
      expect(lightbox).toBeTruthy();
      expect(lightbox.querySelector('img')?.getAttribute('src')).toBe('https://s1');

      component.closePreview();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fixed.inset-0.z-50')).toBeNull();
    });
  });

  // ─── Error handling ───────────────────────────────────────────────────────
  describe('error handling', () => {
    it('shows an error message and stops loading when the fetch fails', async () => {
      cloudinaryMock.listResources.mockReturnValue(
        throwError(() => ({ error: { message: 'Cloudinary unavailable' } })),
      );

      fixture.detectChanges();
      await sleep(DEBOUNCE_MS + 50);

      expect(component.error()).toBe('Cloudinary unavailable');
      expect(component.isLoading()).toBe(false);
      expect(component.resources().length).toBe(0);
    });

    it('refresh keeps the active search term', async () => {
      await mount();
      component.searchQuery.set('invoice');
      cloudinaryMock.listResources.mockClear();

      component.loadResources();

      expect(cloudinaryMock.listResources).toHaveBeenCalledWith('invoice');
    });
  });
});

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CategoryListComponent } from './category-list.component';
import { CategoriesService } from '../../../services/categories.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { AlertService } from '../../../services/shared/alert.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { MaterialModule } from '../../../core/material/material.module';
import { createI18nMocks } from '../../../testing/i18n-mock';

describe('CategoryListComponent — server-side pagination + mobile infinite scroll', () => {
  let fixture: ComponentFixture<CategoryListComponent>;
  let component: CategoryListComponent;

  const { langMock, translateServiceMock } = createI18nMocks();
  const categoriesServiceMock = { list: vi.fn() };
  const themeMock = { isDark: () => false };
  const alertMock = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const dialogMock = { open: vi.fn(() => ({ afterClosed: () => of(false) })) };
  const reusableDialogMock = {
    setDialogComponent: vi.fn(),
    setDialogConfigOption: vi.fn(),
    open: vi.fn(() => of(undefined)),
  };
  const cdrMock = { markForCheck: vi.fn() };

  const makeCategory = (id: number) => ({
    id,
    name: `Category ${id}`,
    nameKh: '',
    description: `Desc ${id}`,
  });

  /** Returns a contiguous page of categories starting at `start`. */
  const makePage = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) => makeCategory(start + i));

  /** Makes the service resolve with one server-side page plus the envelope total. */
  function mockPage(data: any[] = makePage(1, 10), total = 30) {
    categoriesServiceMock.list.mockReturnValue(of({ data, total }));
  }

  /** Returns the HttpParams of the most recent list() call (asserted via .get). */
  function lastParams(): { get: (key: string) => string | null } {
    const call = categoriesServiceMock.list.mock.calls.at(-1)?.[0] as {
      params: { get: (key: string) => string | null };
    };
    return call.params;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPage();

    await TestBed.configureTestingModule({
      declarations: [CategoryListComponent],
      imports: [CommonModule, MaterialModule, NoopAnimationsModule, TranslateModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CategoriesService, useValue: categoriesServiceMock },
        { provide: LanguageService, useValue: langMock },
        { provide: ThemeService, useValue: themeMock },
        { provide: AlertService, useValue: alertMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ReusableDialogService, useValue: reusableDialogMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initial load', () => {
    it('fetches page 1 with the standard list-query defaults', () => {
      expect(categoriesServiceMock.list).toHaveBeenCalledTimes(1);
      expect(lastParams().get('offset')).toBe('0');
      expect(lastParams().get('max')).toBe('10');
      expect(component.categories()).toHaveLength(10);
      expect(component.mobileCategories()).toHaveLength(10);
      expect(component.totalItems()).toBe(30);
      expect(component.hasMore()).toBe(true);
      expect(component.isLoading()).toBe(false);
    });

    it('sets hasMore = false when the first page contains every record', () => {
      vi.clearAllMocks();
      mockPage(makePage(1, 10), 10);
      component.loadCategories();

      expect(component.hasMore()).toBe(false);
    });
  });

  describe('loadMoreCategories (mobile infinite scroll)', () => {
    it('appends the next page at offset = appended length and keeps the desktop page', () => {
      mockPage(makePage(11, 10), 30);

      component.loadMoreCategories();

      expect(lastParams().get('offset')).toBe('10');
      expect(lastParams().get('max')).toBe('10');
      expect(component.mobileCategories()).toHaveLength(20);
      // Desktop page slice stays on the first page.
      expect(component.categories()).toHaveLength(10);
      expect(component.totalItems()).toBe(30);
      expect(component.hasMore()).toBe(true);
      expect(component.isLoadingMore()).toBe(false);
    });

    it('dedupes overlapping records when appending', () => {
      // Page 2 repeats category 5 (already in the appended list).
      mockPage([makeCategory(5), ...makePage(11, 9)], 30);
      component.mobileCategories.set(makePage(1, 10));

      component.loadMoreCategories();

      expect(component.mobileCategories()).toHaveLength(19);
      expect(component.mobileCategories().filter((c: any) => c.id === 5)).toHaveLength(1);
    });

    it('sets hasMore = false once the appended list reaches the total', () => {
      mockPage(makePage(11, 5), 15);
      component.mobileCategories.set(makePage(1, 10));

      component.loadMoreCategories();

      expect(component.mobileCategories()).toHaveLength(15);
      expect(component.hasMore()).toBe(false);
    });

    it('does not issue a second request while a page is already loading', () => {
      const pending = new Subject<any>();
      categoriesServiceMock.list.mockReturnValue(pending.asObservable());

      component.loadMoreCategories();
      component.loadMoreCategories();

      // 1 (initial beforeEach load) + 1 (first append) — the second is guarded.
      expect(categoriesServiceMock.list).toHaveBeenCalledTimes(2);

      pending.next({ data: makePage(11, 10), total: 30 });
      pending.complete();
      expect(component.mobileCategories()).toHaveLength(20);
      expect(component.isLoadingMore()).toBe(false);
    });

    it('does not fetch when every record has already been loaded', () => {
      component.hasMore.set(false);
      categoriesServiceMock.list.mockClear();

      component.loadMoreCategories();

      expect(categoriesServiceMock.list).not.toHaveBeenCalled();
    });

    it('clears the loading flag and keeps hasMore retryable when the append fails', () => {
      component.hasMore.set(true);
      component.isLoadingMore.set(false);
      categoriesServiceMock.list.mockReturnValue(throwError(() => new Error('network')));

      component.loadMoreCategories();

      expect(component.isLoadingMore()).toBe(false);
      expect(component.hasMore()).toBe(true);
      expect(component.mobileCategories()).toHaveLength(10);
    });
  });

  describe('reset behaviour', () => {
    it('resets the mobile list when a non-append load runs (search / delete / save)', () => {
      component.mobileCategories.set([...makePage(1, 10), ...makePage(11, 10)]);
      component.hasMore.set(false);
      categoriesServiceMock.list.mockClear();
      mockPage(makePage(1, 10), 30);

      component.loadCategories();

      expect(component.mobileCategories()).toHaveLength(10);
      expect(component.hasMore()).toBe(true);
      expect(lastParams().get('offset')).toBe('0');
      expect(lastParams().get('max')).toBe('10');
    });

    it('clears the list and stops loading on a first-page error', () => {
      categoriesServiceMock.list.mockReturnValue(throwError(() => new Error('network')));

      component.loadCategories();

      expect(component.categories()).toEqual([]);
      expect(component.mobileCategories()).toEqual([]);
      expect(component.totalItems()).toBe(0);
      expect(component.hasMore()).toBe(false);
      expect(component.isLoading()).toBe(false);
    });
  });
});

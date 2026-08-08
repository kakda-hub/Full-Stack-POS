import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { QuickPickListComponent } from './quick-pick-list.component';
import { QuickPickService } from '../../../services/quick-pick.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { AlertService } from '../../../services/shared/alert.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../core/material/material.module';

describe('QuickPickListComponent — server-side pagination', () => {
  let fixture: ComponentFixture<QuickPickListComponent>;
  let component: QuickPickListComponent;

  const themeMock = { isDark: () => false };
  const langMock = { currentLang: () => 'en' };
  const alertMock = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const quickPickServiceMock = { getPage: vi.fn(), delete: vi.fn() };
  const dialogMock = { open: vi.fn(() => ({ afterClosed: () => of(true) })) };
  const reusableDialogMock = {
    setDialogComponent: vi.fn(),
    setDialogConfigOption: vi.fn(),
    open: vi.fn(() => of(undefined)),
  };
  const cdrMock = { markForCheck: vi.fn() };
  // The template uses the standalone TranslatePipe directly, which injects
  // TranslateService — provide a lightweight stub so the pipe renders the key.
  const translateServiceMock = {
    get: vi.fn((key: string) => of(key)),
    instant: vi.fn((key: string) => key),
    currentLang: 'en',
    defaultLang: 'en',
    getCurrentLang: vi.fn(() => 'en'),
    getFallbackLang: vi.fn(() => 'en'),
    onTranslationChange: new EventEmitter(),
    onLangChange: new EventEmitter(),
    onFallbackLangChange: new EventEmitter(),
  };

  // NOTE: price must be a number — the real service maps API strings to
  // Number(price) before the template calls .toFixed(2).
  const sampleItem = {
    id: 1,
    label: 'Plastic Bag',
    labelKh: 'ថង់ប្លាស្ទិក',
    price: 0.25,
    icon: '🛍️',
    sortOrder: 1,
    isActive: true,
  };

  /** Returns one server-side page plus the envelope total (default 10 records). */
  function mockPage(data: any[] = [sampleItem], total = 10) {
    quickPickServiceMock.getPage.mockReturnValue(of({ data, total }));
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPage();

    await TestBed.configureTestingModule({
      declarations: [QuickPickListComponent],
      imports: [SharedModule, MaterialModule, NoopAnimationsModule, TranslateModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        { provide: LanguageService, useValue: langMock },
        { provide: AlertService, useValue: alertMock },
        { provide: QuickPickService, useValue: quickPickServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ReusableDialogService, useValue: reusableDialogMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickPickListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initial load', () => {
    it('fetches page 1 sorted by sortOrder ascending', () => {
      expect(quickPickServiceMock.getPage).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, max: 10, sortBy: 'sortOrder', sort: 'asc' }),
      );
      expect(component.totalItems()).toBe(10);
      expect(component.items()).toHaveLength(1);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('onPageChange (page navigation)', () => {
    it('navigates to page 2: offset = (2 - 1) * pageSize and reloads', () => {
      quickPickServiceMock.getPage.mockClear();

      component.onPageChange(2);

      expect(component.pageIndex()).toBe(1);
      expect(quickPickServiceMock.getPage).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 10, max: 10 }),
      );
    });
  });

  describe('onPageSizeChange (page size)', () => {
    it('applies the new size, resets to page 1 and reloads', () => {
      component.pageIndex.set(1);
      quickPickServiceMock.getPage.mockClear();

      component.onPageSizeChange(50);

      expect(component.pageSize()).toBe(50);
      expect(component.pageIndex()).toBe(0);
      expect(quickPickServiceMock.getPage).toHaveBeenCalledWith(
        expect.objectContaining({ max: 50, offset: 0 }),
      );
    });
  });

  describe('empty-page step-back', () => {
    it('steps back one page when the server returns an empty page', () => {
      component.pageIndex.set(1);
      mockPage([], 10);
      quickPickServiceMock.getPage.mockClear();

      component.loadItems();

      expect(component.pageIndex()).toBe(0);
      expect(quickPickServiceMock.getPage).toHaveBeenCalledTimes(2); // initial + step-back
    });
  });
});

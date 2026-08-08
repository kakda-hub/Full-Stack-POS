import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PurchaseOrderListComponent } from './purchase-order-list.component';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { AlertService } from '../../../services/shared/alert.service';
import { AuthService } from '../../../services/shared/auth.service';
import { ReusableDialogService } from '../../../services/dialogs/reusable-dialog.service';
import { FormatNumberPipe } from '../../../shared/pipes/format-number.pipe';
import { MaterialModule } from '../../../core/material/material.module';

describe('PurchaseOrderListComponent — server-side pagination', () => {
  let fixture: ComponentFixture<PurchaseOrderListComponent>;
  let component: PurchaseOrderListComponent;

  const themeMock = { isDark: () => false };
  const langMock = { currentLang: () => 'en' };
  const alertMock = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const authMock = { currentUser: () => ({ id: '1' }) };
  const poServiceMock = { getAll: vi.fn(), receive: vi.fn(), cancel: vi.fn() };
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

  const samplePO = {
    id: 1,
    orderNumber: 'PO-2026-001',
    status: 'ordered',
    total: 100,
    createdAt: '2026-07-01T00:00:00.000Z',
    items: [],
    supplier: { name: 'ACME Supplies' },
  };

  /** Returns one server-side page plus the envelope total (default 30 records). */
  function mockPage(data: any[] = [samplePO], total = 30) {
    poServiceMock.getAll.mockReturnValue(of({ data, total }));
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPage();

    await TestBed.configureTestingModule({
      declarations: [PurchaseOrderListComponent, FormatNumberPipe],
      imports: [CommonModule, MaterialModule, NoopAnimationsModule, TranslateModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        { provide: LanguageService, useValue: langMock },
        { provide: AlertService, useValue: alertMock },
        { provide: AuthService, useValue: authMock },
        { provide: PurchaseOrderService, useValue: poServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ReusableDialogService, useValue: reusableDialogMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initial load', () => {
    it('fetches page 1 with the standard list-query defaults', () => {
      expect(poServiceMock.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, max: 10, sortBy: 'createdAt', sort: 'desc' }),
      );
      expect(component.totalItems()).toBe(30);
      expect(component.purchaseOrders()).toHaveLength(1);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('onPageChange (page navigation)', () => {
    it('navigates to page 2: offset = (2 - 1) * pageSize and reloads', () => {
      poServiceMock.getAll.mockClear();

      component.onPageChange(2);

      expect(component.pageIndex()).toBe(1);
      expect(poServiceMock.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 10, max: 10 }),
      );
    });

    it('returns to page 1 (offset = 0) from a deeper page', () => {
      component.pageIndex.set(3);
      poServiceMock.getAll.mockClear();

      component.onPageChange(1);

      expect(component.pageIndex()).toBe(0);
      expect(poServiceMock.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, max: 10 }),
      );
    });

    it('keeps the active search term when reloading a page', () => {
      component.searchQuery.set('bakery');
      poServiceMock.getAll.mockClear();

      component.onPageChange(2);

      expect(poServiceMock.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'bakery', offset: 10 }),
      );
    });

    it('steps back one page when the server returns an empty page with records left', () => {
      // Simulates deleting the last item on a page: the current offset is now
      // past the end, so the component must back up one page and reload.
      component.pageIndex.set(1);
      mockPage([], 30);
      poServiceMock.getAll.mockClear();

      component.loadPOs();

      expect(component.pageIndex()).toBe(0);
      expect(poServiceMock.getAll).toHaveBeenCalledTimes(2); // initial + step-back
      expect(poServiceMock.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ offset: 0 }),
      );
    });
  });

  describe('onPageSizeChange (page size)', () => {
    it('applies the new size, resets to page 1 and reloads', () => {
      component.pageIndex.set(2);
      poServiceMock.getAll.mockClear();

      component.onPageSizeChange(25);

      expect(component.pageSize()).toBe(25);
      expect(component.pageIndex()).toBe(0);
      expect(poServiceMock.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ max: 25, offset: 0 }),
      );
    });
  });
});

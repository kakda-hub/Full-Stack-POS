import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductListComponent } from './product-list.component';
import { ProductService as CoreProductService } from '../../../core/services/product.service';
import { ProductService as ApiProductService } from '../../../core/services/api/product.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AlertService } from '../../../core/services/alert.service';
import { ReusableDialogService } from '../../../core/services/dialogs/reusable-dialog.service';
import { MaterialModule } from '../../../core/material/material.module';

describe('ProductListComponent — skeleton/table swap on category select', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  /** The in-flight request; resolved manually by resolvePage() so tests can
      observe the loading (skeleton) state before data arrives. */
  let pending: Subject<any> | null = null;

  const themeMock = { isDark: () => false };
  const langMock = { currentLang: () => 'en' };
  const alertMock = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const categories = [
    { id: '1', name: 'Beverages', nameKm: 'ភេសជ្ជៈ' },
    { id: '2', name: 'Food', nameKm: 'អាហារ' },
  ];
  const coreProductServiceMock = { categories: vi.fn(() => categories) };
  const apiProductServiceMock = {
    getProducts: vi.fn(),
    adjustStock: vi.fn(),
    deleteProduct: vi.fn(),
    updateProduct: vi.fn(),
    createProduct: vi.fn(),
  };
  const dialogMock = { open: vi.fn(() => ({ afterClosed: () => of(true) })) };
  const reusableDialogMock = {
    setDialogComponent: vi.fn(),
    setDialogConfigOption: vi.fn(),
    open: vi.fn(() => of(undefined)),
  };
  const cdrMock = { markForCheck: vi.fn() };
  // The template uses the TranslatePipe directly, which injects
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

  // Shape matches the API envelope consumed by mapApiProduct().
  const beverages = [
    { id: 1, name: 'Cola', nameKh: 'កូឡា', price: '1.50', stock: 20, categoryId: '1', barcode: '885-1' },
    { id: 2, name: 'Water', nameKh: 'ទឹក', price: '0.50', stock: 40, categoryId: '1', barcode: '885-2' },
  ];
  const food = [
    { id: 9, name: 'Baguette', nameKh: 'នំប៉័ងបារាំង', price: '1.00', stock: 19, categoryId: '2', barcode: '885-9' },
  ];

  /** Keep every getProducts() call in-flight until the test resolves it. */
  function deferPage() {
    apiProductServiceMock.getProducts.mockImplementation(() => {
      pending = new Subject<any>();
      return pending.asObservable();
    });
  }

  /** Resolve the current in-flight request with a server page. */
  function resolvePage(data: any[] = [], total = data.length) {
    pending!.next({ data, total });
    pending!.complete();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    deferPage();

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      imports: [CommonModule, MaterialModule, NoopAnimationsModule, TranslateModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        { provide: LanguageService, useValue: langMock },
        { provide: AlertService, useValue: alertMock },
        { provide: CoreProductService, useValue: coreProductServiceMock },
        { provide: ApiProductService, useValue: apiProductServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ReusableDialogService, useValue: reusableDialogMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit fires; first request stays in-flight
  });

  describe('initial load', () => {
    it('shows the skeleton and hides the table until the first response arrives', () => {
      expect(component.isLoading()).toBe(true);
      expect(component.hasLoadedOnce()).toBe(false);
      expect(fixture.nativeElement.querySelector('.skeleton-section')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.table-container')).toBeFalsy();
    });

    it('swaps skeleton → table once the first page arrives', () => {
      resolvePage(beverages, 42);

      expect(component.isLoading()).toBe(false);
      expect(component.hasLoadedOnce()).toBe(true);
      expect(fixture.nativeElement.querySelector('.skeleton-section')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.table-container')).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('.table-row')).toHaveLength(2);
    });

    it('hides the skeleton on a first-load error so it does not hang forever', () => {
      pending!.error(new Error('boom'));
      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      expect(component.hasLoadedOnce()).toBe(true);
      expect(component.products()).toEqual([]);
      expect(fixture.nativeElement.querySelector('.skeleton-section')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.table-container')).toBeTruthy();
    });
  });

  describe('category select (after first load)', () => {
    beforeEach(() => {
      resolvePage(beverages, 42); // complete the initial load
    });

    it('keeps the table mounted while loading — no skeleton flash, no remount', () => {
      component.onCategorySelect('2');
      fixture.detectChanges();

      expect(component.isLoading()).toBe(true);
      expect(component.hasLoadedOnce()).toBe(true);
      // The skeleton must NOT reappear, the table must STAY in the DOM, and
      // the previous rows must remain visible while the new page loads.
      expect(fixture.nativeElement.querySelector('.skeleton-section')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.table-container')).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('.table-row')).toHaveLength(2);
      expect(apiProductServiceMock.getProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ categoryId: '2', offset: 0, max: 10 }),
      );
    });

    it('replaces the rows with the new category’s products after the response', () => {
      component.onCategorySelect('2');
      fixture.detectChanges();
      resolvePage(food, 1);

      expect(component.selectedCategory()).toBe('2');
      // mapApiProduct() stringifies ids.
      expect(component.products().map((p) => p.id)).toEqual(['9']);
      expect(component.isLoading()).toBe(false);
      expect(fixture.nativeElement.querySelectorAll('.table-row')).toHaveLength(1);
    });

    it('drops the category filter when returning to "all"', () => {
      component.onCategorySelect('2');
      fixture.detectChanges();
      resolvePage(food, 1);

      component.onCategorySelect('all');
      fixture.detectChanges();
      resolvePage(beverages, 42);

      expect(component.selectedCategory()).toBe('all');
      expect(apiProductServiceMock.getProducts).toHaveBeenLastCalledWith(
        expect.not.objectContaining({ categoryId: expect.anything() }),
      );
      // mapApiProduct() stringifies ids.
      expect(component.products().map((p) => p.id)).toEqual(['1', '2']);
    });
  });
});

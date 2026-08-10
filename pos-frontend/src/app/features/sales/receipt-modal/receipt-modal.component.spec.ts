import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReceiptModalComponent } from './receipt-modal.component';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { Transaction, CartItem, Product } from '../../../models';
import { of } from 'rxjs';
import { createI18nMocks } from '../../../testing/i18n-mock';

describe('ReceiptModalComponent — branded receipt header', () => {
  let fixture: ComponentFixture<ReceiptModalComponent>;
  let component: ReceiptModalComponent;

  /** Mutable theme mock mirroring ThemeService behavior */
  const themeMock = {
    dark: false,
    isDark: () => themeMock.dark,
    toggle: () => { themeMock.dark = !themeMock.dark; },
  };

  const product: Product = {
    id: '1',
    name: 'Iced Americano',
    price: 3.5,
    barcode: '8851234567890',
    category: 'Beverages',
    stock: 100,
  };

  const item: CartItem = { product, quantity: 2, discount: 0 };

  const transaction: Transaction = {
    id: 'TX-001',
    items: [item],
    subtotal: 7,
    totalDiscount: 0,
    tax: 0,
    total: 7,
    paymentMethod: 'cash',
    cashReceived: 10,
    change: 3,
    cashier: 'System Admin',
    timestamp: new Date('2026-01-01T10:00:00'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceiptModalComponent],
      imports: [SharedModule, TranslateModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        { provide: LanguageService, useValue: createI18nMocks().langMock },
        { provide: TranslateService, useValue: createI18nMocks().translateServiceMock },
      ],
    }).compileComponents();

    themeMock.dark = false;
    fixture = TestBed.createComponent(ReceiptModalComponent);
    component = fixture.componentInstance;
    component.transaction = transaction;
    fixture.detectChanges();
  });

  describe('receipt header brand logo', () => {
    function receiptLogoImg(): HTMLImageElement {
      return fixture.nativeElement.querySelector(
        '#receipt-print img[src="assets/images/mini-market-logo.png"]',
      ) as HTMLImageElement;
    }

    it('renders the local mini-market-logo.png inside the printable receipt header', () => {
      const img = receiptLogoImg();

      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('assets/images/mini-market-logo.png');
      expect(img.getAttribute('alt')).toBe('MiniMart');
      // Must live inside #receipt-print so it is captured by printReceipt()
      // and included in the printed thermal output.
      expect(img.closest('#receipt-print')).toBeTruthy();
    });
  });
});

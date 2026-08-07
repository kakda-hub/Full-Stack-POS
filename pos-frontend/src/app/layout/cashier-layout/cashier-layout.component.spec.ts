import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared/shared.module';
import { CashierLayoutComponent } from './cashier-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { CartService } from '../../core/services/cart.service';
import { NavStateService, NavItem } from '../../core/services/nav-state.service';
import { AlertService } from '../../core/services/alert.service';
import { User } from '../../models';

describe('CashierLayoutComponent — header brand badge', () => {
  let fixture: ComponentFixture<CashierLayoutComponent>;
  let component: CashierLayoutComponent;

  /** Mutable theme mock mirroring ThemeService behavior (toggle flips isDark) */
  const themeMock = {
    dark: false,
    isDark: () => themeMock.dark,
    currentTheme: () => (themeMock.dark ? 'dark' : 'light'),
    toggle: () => { themeMock.dark = !themeMock.dark; },
    setTheme: () => {},
  };

  const user: User = {
    id: '1',
    username: 'admin@pos.com',
    name: 'System Admin',
    role: 'admin',
    token: 'test-token',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CashierLayoutComponent],
      imports: [SharedModule, RouterTestingModule.withRoutes([]), NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        {
          provide: AuthService,
          useValue: { currentUser: () => user, logout: () => {}, isAdmin: () => true },
        },
        {
          provide: LanguageService,
          useValue: { currentLang: () => 'en', switchLanguage: () => {}, toggle: () => {} },
        },
        { provide: CartService, useValue: { itemCount: () => 0 } },
        {
          provide: NavStateService,
          useValue: {
            navItems: (): NavItem[] => [
              { label: 'POS Sale', labelKm: 'លក់', route: '/sales', icon: 'cart' },
            ],
          },
        },
        { provide: AlertService, useValue: { success: () => {}, error: () => {}, warning: () => {} } },
      ],
    }).compileComponents();

    themeMock.dark = false;
    fixture = TestBed.createComponent(CashierLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('header brand badge', () => {
    function brandLogoImg(): HTMLImageElement {
      return fixture.nativeElement.querySelector(
        '.cashier-header img[src="assets/images/mini-market-logo.png"]',
      ) as HTMLImageElement;
    }

    it('renders the local mini-market-logo.png asset with an accessible alt text', () => {
      const img = brandLogoImg();

      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('assets/images/mini-market-logo.png');
      expect(img.getAttribute('alt')).toBe('Mini Mart');
    });
  });
});

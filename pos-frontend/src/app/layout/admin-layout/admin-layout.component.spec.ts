import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../services/shared/auth.service';
import { LanguageService } from '../../services/shared/language.service';
import { ThemeService } from '../../services/shared/theme.service';
import { NavStateService, NavItem } from '../../services/shared/nav-state.service';
import { PendingCountService } from '../../services/shared/pending-count.service';
import { AlertService } from '../../services/shared/alert.service';
import { User } from '../../models';
import { of } from 'rxjs';

describe('AdminLayoutComponent — theme toggle & sidebar collapse', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;
  let component: AdminLayoutComponent;

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
      declarations: [AdminLayoutComponent],
      imports: [SharedModule, TranslateModule, RouterTestingModule.withRoutes([]), NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        { provide: AuthService, useValue: { currentUser: () => user, logout: () => {} } },
        {
          provide: LanguageService,
          useValue: { currentLang: () => 'en', switchLanguage: () => {}, toggle: () => {}, t: (key: string) => key },
        },
        { provide: TranslateService, useValue: { instant: (key: string) => key, get: (key: string) => of(key), getCurrentLang: () => 'en', getFallbackLang: () => 'en', onTranslationChange: new EventEmitter(), onLangChange: new EventEmitter(), onFallbackLangChange: new EventEmitter() } as unknown as TranslateService },
        {
          provide: NavStateService,
          useValue: {
            navItems: (): NavItem[] => [
              { label: 'Dashboard', labelKm: 'ទិដ្ឋភាពទូទៅ', route: '/dashboard', icon: 'dashboard' },
              { label: 'Sales History', labelKm: 'ប្រវត្តិលក់', route: '/sales-history', icon: 'history' },
            ],
          },
        },
        { provide: PendingCountService, useValue: { count: () => 0, refresh: () => {} } },
        { provide: AlertService, useValue: { success: () => {}, error: () => {}, warning: () => {} } },
      ],
    }).compileComponents();

    themeMock.dark = false;
    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function themeToggleBtn(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.topbar-icon-btn') as HTMLButtonElement;
  }

  /** The toggle icon is rendered via the shared <app-icon> component */
  function themeIcons(): Element[] {
    return Array.from(themeToggleBtn().querySelectorAll('app-icon'));
  }

  function themeIconName(): string | null {
    return themeToggleBtn().querySelector('app-icon')?.getAttribute('name') ?? null;
  }

  describe('dark mode toggle', () => {
    it('shows exactly ONE icon (moon) in light mode', () => {
      expect(themeIcons().length).toBe(1);
      expect(themeIconName()).toBe('moon');
    });

    it('swaps to a single sun icon when toggled to dark, then back to moon', () => {
      // Light -> dark
      themeToggleBtn().click();
      fixture.detectChanges();

      expect(themeIcons().length).toBe(1);
      expect(themeIconName()).toBe('sun');
      expect(themeMock.dark).toBe(true);

      // Dark -> light
      themeToggleBtn().click();
      fixture.detectChanges();

      expect(themeIcons().length).toBe(1);
      expect(themeIconName()).toBe('moon');
      expect(themeMock.dark).toBe(false);
    });
  });

  // NOTE: the mobile-menu PREFERENCES section (its own dark-mode + language
  // toggles) was removed from admin-layout.component.html in the working tree,
  // so the dark-mode toggle is exercised via the header (.topbar-icon-btn) only.

  describe('sidebar collapse toggle (header button)', () => {
    function sidebarToggleBtn(): HTMLButtonElement {
      return fixture.nativeElement.querySelector('.sidebar-toggle-btn') as HTMLButtonElement;
    }

    it('collapses the sidebar (w-20, labels hidden) and expands it back', () => {
      const brand = fixture.nativeElement.querySelector('.sidebar-brand') as HTMLElement;

      // Initially expanded
      expect(brand.classList.contains('w-20')).toBe(false);
      expect(fixture.nativeElement.querySelector('.sidebar-section-label')).toBeTruthy();

      // Collapse
      sidebarToggleBtn().click();
      fixture.detectChanges();
      expect(component.isCollapsed()).toBe(true);
      expect(brand.classList.contains('w-20')).toBe(true);
      expect(brand.classList.contains('w-64')).toBe(false);
      expect(fixture.nativeElement.querySelector('.sidebar-section-label')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.sidebar-credit-mini')?.textContent).toBe('KK');

      // Expand
      sidebarToggleBtn().click();
      fixture.detectChanges();
      expect(component.isCollapsed()).toBe(false);
      expect(brand.classList.contains('w-64')).toBe(true);
      expect(fixture.nativeElement.querySelector('.sidebar-section-label')).toBeTruthy();
    });
  });

  describe('brand badge logo', () => {
    function brandLogoImg(): HTMLImageElement {
      return fixture.nativeElement.querySelector('.brand-content img') as HTMLImageElement;
    }

    it('renders the local mini-market-logo.png asset with an accessible alt text', () => {
      const img = brandLogoImg();

      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('assets/images/mini-market-logo.png');
      expect(img.getAttribute('alt')).toBe('Mini Mart');
    });
  });
});

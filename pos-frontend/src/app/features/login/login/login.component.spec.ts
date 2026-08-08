import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/shared/auth.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { User } from '../../../models';

describe('LoginComponent — brand panel', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  /** Mutable theme mock mirroring ThemeService behavior */
  const themeMock = {
    dark: false,
    isDark: () => themeMock.dark,
    toggle: () => { themeMock.dark = !themeMock.dark; },
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
      declarations: [LoginComponent],
      imports: [
        SharedModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        {
          provide: AuthService,
          useValue: { login: () => of(true), currentUser: () => user, logout: () => {} },
        },
        { provide: LanguageService, useValue: { currentLang: () => 'en', toggle: () => {} } },
      ],
    }).compileComponents();

    themeMock.dark = false;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('brand panel logo', () => {
    function brandLogoImg(): HTMLImageElement {
      return fixture.nativeElement.querySelector(
        'img[src="assets/images/mini-market-logo.png"]',
      ) as HTMLImageElement;
    }

    it('renders the local mini-market-logo.png in the brand panel with an accessible alt text', () => {
      const img = brandLogoImg();

      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('assets/images/mini-market-logo.png');
      expect(img.getAttribute('alt')).toBe('Mini Mart');
      // Sits on the white rounded badge inside the indigo brand panel
      expect(img.closest('.bg-white')).toBeTruthy();
    });
  });
});

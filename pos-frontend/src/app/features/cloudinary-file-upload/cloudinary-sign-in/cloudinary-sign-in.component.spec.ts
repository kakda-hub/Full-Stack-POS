import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { CloudinarySignInComponent } from './cloudinary-sign-in.component';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../core/material/material.module';
import { isSignedIn, CLOUDINARY_SESSION_KEY } from '../cloudinary-session';

describe('CloudinarySignInComponent', () => {
  let fixture: ComponentFixture<CloudinarySignInComponent>;
  let component: CloudinarySignInComponent;

  const themeMock = { isDark: () => false };
  const langMock = { currentLang: () => 'en' };
  const routerMock = { navigate: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    langMock.currentLang = () => 'en';
    localStorage.clear();
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      declarations: [CloudinarySignInComponent],
      imports: [SharedModule, MaterialModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ThemeService, useValue: themeMock },
        { provide: LanguageService, useValue: langMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CloudinarySignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('stores a session (localStorage) and navigates to the list with valid credentials', () => {
    component.username.set('admin_user');
    component.password.set('secret');
    component.remember.set(true);

    component.onSubmit();

    expect(isSignedIn()).toBe(true);
    expect(localStorage.getItem(CLOUDINARY_SESSION_KEY)).toContain('admin_user');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cloudinary-file-upload/list']);
    expect(component.submitted()).toBe(true);
  });

  it('uses sessionStorage when "stay signed in" is unchecked', () => {
    component.username.set('cashier');
    component.password.set('pw');
    component.remember.set(false);

    component.onSubmit();

    expect(localStorage.getItem(CLOUDINARY_SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(CLOUDINARY_SESSION_KEY)).toContain('cashier');
  });

  it('does not sign in when the username is blank', () => {
    component.username.set('   ');
    component.password.set('pw');

    component.onSubmit();

    expect(component.usernameInvalid()).toBe(true);
    expect(isSignedIn()).toBe(false);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('does not sign in when the password is missing', () => {
    component.username.set('admin');
    component.password.set('');

    component.onSubmit();

    expect(component.passwordInvalid()).toBe(true);
    expect(isSignedIn()).toBe(false);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('renders validation messages after an invalid submit', () => {
    component.onSubmit();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Please enter your username.');
    expect(text).toContain('Please enter your password.');
  });

  it('renders Khmer copy when the language is Khmer', () => {
    // Switch the language first, then re-create the component so its initial
    // render is Khmer (a mid-test language swap trips zoneless NG0100).
    langMock.currentLang = () => 'km';
    fixture.destroy();
    fixture = TestBed.createComponent(CloudinarySignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ចូលប្រើប្រព័ន្ធ');
    expect(text).toContain('ឈ្មោះអ្នកប្រើ');
    expect(text).toContain('ពាក្យសម្ងាត់');
    expect(text).toContain('ចូលទៅកាន់ Cloudinary');
  });

  // NOTE: (ngSubmit) cannot be simulated in the zoneless jsdom test env
  // (Angular's form submit listener never fires there), so the form wiring is
  // verified through the input bindings + direct onSubmit() calls above.
  it('updates the model from DOM input events', () => {
    const username = fixture.nativeElement.querySelector('#username') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;

    username.value = 'dom_user';
    username.dispatchEvent(new Event('input'));
    password.value = 'dom_pw';
    password.dispatchEvent(new Event('input'));

    expect(component.username()).toBe('dom_user');
    expect(component.password()).toBe('dom_pw');
    // "Stay signed in" is no longer exposed in the UI; it defaults to true
    // (localStorage session) unless changed programmatically.
    expect(component.remember()).toBe(true);
  });
});

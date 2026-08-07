import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { cloudinarySignedInGuard } from './cloudinary-signed-in.guard';
import { signIn, CLOUDINARY_SIGN_IN_ROUTE } from './cloudinary-session';

describe('cloudinarySignedInGuard', () => {
  const routerMock = { parseUrl: vi.fn((url: string) => url) };

  /** Run the guard inside an injection context (the guard ignores route/state). */
  function runGuard(): ReturnType<typeof cloudinarySignedInGuard> {
    return TestBed.runInInjectionContext(() =>
      cloudinarySignedInGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerMock }],
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('allows access when a session exists', () => {
    signIn('admin_user', true);

    const result = runGuard();

    expect(result).toBe(true);
    expect(routerMock.parseUrl).not.toHaveBeenCalled();
  });

  it('allows access when the session lives in sessionStorage only', () => {
    signIn('cashier', false);

    const result = runGuard();

    expect(result).toBe(true);
  });

  it('redirects to the sign-in page when no session exists', () => {
    const result = runGuard();

    expect(routerMock.parseUrl).toHaveBeenCalledWith(CLOUDINARY_SIGN_IN_ROUTE);
    expect(result).toBe(CLOUDINARY_SIGN_IN_ROUTE);
  });
});

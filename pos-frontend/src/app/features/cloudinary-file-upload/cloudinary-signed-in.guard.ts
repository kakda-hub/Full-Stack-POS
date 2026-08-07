import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isSignedIn, CLOUDINARY_SIGN_IN_ROUTE } from './cloudinary-session';

/**
 * Gates the Cloudinary file-upload list behind the UI sign-in.
 * Mirrors the authGuard style: returns true when signed in, otherwise
 * redirects to the sign-in page.
 */
export const cloudinarySignedInGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (isSignedIn()) return true;
  return router.parseUrl(CLOUDINARY_SIGN_IN_ROUTE);
};

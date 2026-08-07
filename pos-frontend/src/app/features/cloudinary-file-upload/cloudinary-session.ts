/**
 * Lightweight "gate" for the Cloudinary file-upload pages.
 *
 * This is a UI-only sign-in: any non-empty credentials store a session marker
 * so the list page can require a sign-in before loading. Real Cloudinary
 * credentials are configured server-side (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET),
 * so no backend call is made here.
 *
 * "Stay signed in" selects the storage backend:
 *  - localStorage (remembered, survives browser restarts)
 *  - sessionStorage (cleared when the tab closes)
 */
export const CLOUDINARY_SESSION_KEY = 'cloudinary_signed_in';

/** Absolute route to the Cloudinary sign-in page (shared by guard + components). */
export const CLOUDINARY_SIGN_IN_ROUTE = '/cloudinary-file-upload/sign-in';

export interface CloudinarySession {
  username: string;
  signedInAt: string;
}

function readSession(storage: Storage): CloudinarySession | null {
  try {
    const raw = storage.getItem(CLOUDINARY_SESSION_KEY);
    return raw ? (JSON.parse(raw) as CloudinarySession) : null;
  } catch {
    return null;
  }
}

export function isSignedIn(): boolean {
  return (
    readSession(localStorage) !== null || readSession(sessionStorage) !== null
  );
}

export function currentSession(): CloudinarySession | null {
  return readSession(localStorage) ?? readSession(sessionStorage);
}

export function signIn(username: string, remember: boolean): void {
  const session: CloudinarySession = {
    username: username.trim(),
    signedInAt: new Date().toISOString(),
  };
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(CLOUDINARY_SESSION_KEY, JSON.stringify(session));
}

export function signOut(): void {
  localStorage.removeItem(CLOUDINARY_SESSION_KEY);
  sessionStorage.removeItem(CLOUDINARY_SESSION_KEY);
}

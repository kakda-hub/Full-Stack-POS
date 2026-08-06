import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { User } from '../../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(this.loadUser());
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());
  isAdmin = computed(() => this._currentUser()?.role === 'admin');
  isCashier = computed(() => this._currentUser()?.role === 'cashier');

  constructor(private router: Router, private http: HttpClient) { }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<any>('/api/v1/auth/login', { email: username, password })
      .pipe(
        map(response => {
          // Handle both wrapped (with interceptor) and unwrapped (@SkipIntercept) responses
          const data = response?.data ?? response;
          if (data && data.accessToken) {
            const user: User = {
              id: String(data.user.id),
              username: data.user.email,
              name: data.user.name,
              role: data.user.role as 'admin' | 'cashier',
              token: data.accessToken,
              avatarUrl: data.user.avatarUrl,
            };
            this._currentUser.set(user);
            localStorage.setItem('pos_user', JSON.stringify(user));
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Login error', error);
          return of(false);
        })
      );
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem('pos_user');
    this.router.navigate(['/login']);
  }

  private loadUser(): User | null {
    try {
      const stored = localStorage.getItem('pos_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this._currentUser()?.token || null;
  }
}

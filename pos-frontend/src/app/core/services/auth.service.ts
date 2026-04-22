import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models';

const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Admin User', role: 'admin', token: 'mock-admin-token', profile: 'https://png.pngtree.com/png-clipart/20241125/original/pngtree-cartoon-user-avatar-vector-png-image_17295195.png' },
  { id: '2', username: 'cashier', name: 'John Cashier', role: 'cashier', token: 'mock-cashier-token', profile: 'https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(this.loadUser());
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());
  isAdmin = computed(() => this._currentUser()?.role === 'admin');
  isCashier = computed(() => this._currentUser()?.role === 'cashier');

  constructor(private router: Router) { }

  login(username: string, password: string): boolean {
    const user = MOCK_USERS.find(u => u.username === username);
    if (user && password === '1234') {
      this._currentUser.set(user);
      localStorage.setItem('pos_user', JSON.stringify(user));
      return true;
    }
    return false;
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
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { fadeIn } from '../../../shared/animations/animations';

@Component({
  selector: 'app-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal(false);
  loading = signal(false);

  constructor(
    private auth: AuthService,
    public lang: LanguageService,
    private router: Router,
    public theme: ThemeService,
  ) {}

  onLogin(e: Event): void {
    e.preventDefault();
    this.error.set(false);
    this.loading.set(true);
    setTimeout(() => {
      const ok = this.auth.login(this.username, this.password);
      this.loading.set(false);
      if (ok) {
        const user = this.auth.currentUser();
        this.router.navigate([user?.role === 'admin' ? '/products' : '/sales']);
      } else {
        this.error.set(true);
      }
    }, 600);
  }

  fillDemo(role: string): void {
    this.username = role;
    this.password = '1234';
  }
}

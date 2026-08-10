import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/shared/auth.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
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
  loginForm: FormGroup;
  error = signal(false);
  loading = signal(false);
  showPassword = signal(false);

  constructor(
    private auth: AuthService,
    public lang: LanguageService,
    private router: Router,
    public theme: ThemeService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      station: ['Front Counter - Register 1'],
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.error.set(false);
    this.loading.set(true);

    const { username, password } = this.loginForm.value;

    this.auth.login(username, password).subscribe((ok) => {
      this.loading.set(false);
      if (ok) {
        const user = this.auth.currentUser();
        this.router.navigate([user?.role === 'admin' ? '/products' : '/sales']);
      } else {
        this.error.set(true);
      }
    });
  }

  fillDemo(role: string): void {
    if (role === 'admin') {
      this.loginForm.patchValue({
        username: 'admin@pos.com',
        password: 'admin123'
      });
    } else {
      this.loginForm.patchValue({
        username: 'cashier@pos.com',
        password: 'cashier123'
      });
    }
  }
}

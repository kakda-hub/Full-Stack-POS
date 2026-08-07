import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';
import { signIn } from '../cloudinary-session';

@Component({
  selector: 'app-cloudinary-sign-in',
  standalone: false,
  templateUrl: './cloudinary-sign-in.component.html',
  styleUrl: './cloudinary-sign-in.component.scss',
})
export class CloudinarySignInComponent {
  username = signal('');
  password = signal('');
  remember = signal(true);
  submitted = signal(false);

  usernameInvalid = computed(() => this.submitted() && !this.username().trim());
  passwordInvalid = computed(() => this.submitted() && !this.password());

  constructor(
    public theme: ThemeService,
    public lang: LanguageService,
    private router: Router,
  ) {}

  onUsernameInput(event: Event): void {
    this.username.set((event.target as HTMLInputElement).value);
  }

  onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  /** Empty fields are invalid; otherwise any credentials pass the UI gate. */
  onSubmit(): void {
    this.submitted.set(true);
    if (!this.username().trim() || !this.password()) {
      return;
    }

    signIn(this.username(), this.remember());
    this.router.navigate(['/cloudinary-file-upload/list']);
  }
}

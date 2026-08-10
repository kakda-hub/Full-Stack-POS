import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../../services/shared/language.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  standalone: false
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  token = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    public lang: LanguageService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.errorMessage = this.lang.t('resetPassword.invalidLink');
      }
    });
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    };

    this.http.post<{ message: string }>('/api/v1/auth/reset-password', payload)
      .subscribe({
        next: (res) => {
          this.successMessage = res.message;
          this.loading = false;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'An error occurred';
          this.loading = false;
        }
      });
  }
}

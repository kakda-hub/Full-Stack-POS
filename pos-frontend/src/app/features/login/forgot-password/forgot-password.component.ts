import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  standalone: false
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public lang: LanguageService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post<{ message: string }>('http://localhost:3000/api/v1/auth/forgot-password', this.forgotForm.value)
      .subscribe({
        next: (res) => {
          this.successMessage = res.message;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'An error occurred';
          this.loading = false;
        }
      });
  }
}

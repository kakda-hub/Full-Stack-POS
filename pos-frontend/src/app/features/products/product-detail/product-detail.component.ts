import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  inject,
  DestroyRef,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AlertService } from '../../../core/services/alert.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';
import { ProductService } from '../../../core/services/api/product.service';
import { CategoriesService } from '../../../core/services/api/categories.service';
import { CloudinaryService } from '../../../core/services/api/cloudinary.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  form!: FormGroup;
  isSaving = signal(false);
  isUploading = signal(false);
  /** Banner-level server error (e.g., network failure, unexpected error) */
  serverError = signal<string | null>(null);

  categories: any[] = [];

  private destroyRef = inject(DestroyRef);

  get product(): any | null {
    return this.data?.product ?? null;
  }

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private cloudinaryService: CloudinaryService,
    private alertService: AlertService,
    private categoryService: CategoriesService,
    private productService: ProductService,
    public theme: ThemeService,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ProductDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: any } | null,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getAllCategories();

    // Auto-clear server-side field errors when the user edits the field
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        Object.keys(this.form.controls).forEach(key => {
          const control = this.form.get(key);
          if (control?.errors?.['serverError'] && control.dirty) {
            const { serverError, ...rest } = control.errors;
            control.setErrors(Object.keys(rest).length ? rest : null);
          }
        });
      });
  }

  private initForm() {
    const product = this.product;
    this.form = this.fb.group({
      name: [product?.name || '', [Validators.required, Validators.minLength(2)]],
      nameKh: [product?.nameKh || product?.nameKm || ''],
      price: [product?.price || '', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      stock: [product?.stock || '', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      barcode: [product?.barcode || '', [Validators.required]],
      categoryId: [Number(product?.categoryId ?? product?.category) || '', [Validators.required]],
      imgUrl: [product?.imgUrl || ''],
      description: [product?.description || ''],
    });
  }

  getAllCategories() {
    this.categoryService.list().subscribe((res: any) => {
      if (res && res.data) {
        this.categories = res.data;
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploading.set(true);

    this.cloudinaryService.uploadFile(file).subscribe({
      next: (res) => {
        // Extract fileUrl from the nested response envelope
        const fileUrl =
          res?.data?.data?.fileUrl ||          // { data: { data: { fileUrl } } }
          res?.data?.data?.[0]?.fileUrl ||      // { data: { data: [{ fileUrl }] } }
          res?.data?.fileUrl;                    // { data: { fileUrl } }

        if (fileUrl) {
          this.form.patchValue({ imgUrl: fileUrl });
          this.alertService.success(
            this.lang.currentLang() === 'km' ? 'បានបង្ហោះរូបភាពដោយជោគជ័យ' : 'Image uploaded successfully',
            this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success'
          );
        }
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'ការបង្ហោះរូបភាពបរាជ័យ' : 'Image upload failed',
          this.lang.currentLang() === 'km' ? 'កំហុស' : 'Error'
        );
        this.isUploading.set(false);
      },
    });
  }

  /** Clear all server-side errors on the form */
  private clearServerErrors(): void {
    this.serverError.set(null);
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.errors?.['serverError']) {
        const { serverError, ...rest } = control.errors;
        control.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
  }

  /** Map HTTP error to form field errors or banner error */
  private handleServerError(err: HttpErrorResponse): void {
    this.clearServerErrors();

    if (err.status === 409) {
      // Conflict — e.g., duplicate barcode
      const msg = err.error?.message || err.message || '';
      if (msg.toLowerCase().includes('barcode')) {
        this.form.get('barcode')?.setErrors({ serverError: msg });
        this.form.get('barcode')?.markAsTouched();
      } else {
        this.serverError.set(msg);
      }
      return;
    }

    if (err.status === 400 && Array.isArray(err.error?.message)) {
      // Validation error from NestJS ValidationPipe
      const fieldMessages = err.error.message as string[];
      fieldMessages.forEach(msg => {
        // Try to match field name from message like "name must be..."
        const matched = msg.match(/^(\w+)\s/);
        if (matched && this.form.get(matched[1])) {
          this.form.get(matched[1])?.setErrors({ serverError: msg });
        } else {
          // General validation message
          this.serverError.update(prev => prev ? `${prev}\n${msg}` : msg);
        }
      });
      return;
    }

    // Network or unexpected error
    const msg = err.error?.message || err.message || 'An unexpected error occurred';
    this.serverError.set(msg);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.serverError.set(null);
    const payload = this.form.value;

    const product = this.product;
    const request$ = product?.id
      ? this.productService.updateProduct(product.id, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to save product', err);
        this.isSaving.set(false);
        this.handleServerError(err);
      },
    });
  }
}

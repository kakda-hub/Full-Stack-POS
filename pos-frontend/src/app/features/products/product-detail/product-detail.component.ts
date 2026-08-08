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
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LanguageService } from '../../../services/shared/language.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { AlertService } from '../../../services/shared/alert.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';
import { ProductService } from '../../../services/product.service';
import { CategoriesService } from '../../../services/categories.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { CloudinaryMediaGalleryModalComponent, MediaGalleryData } from '../../../shared/components/cloudinary-media-gallery/cloudinary-media-gallery-modal.component';

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
  serverError = signal<string | null>(null);

  categories: any[] = [];

  private destroyRef = inject(DestroyRef);

  get product(): any | null {
    return this.data?.product ?? null;
  }

  get imgUrls(): string[] {
    const val = this.form.get('imgUrls')?.value as string[] | undefined;
    if (val && val.length > 0) return val;
    const single = this.form.get('imgUrl')?.value as string | undefined;
    if (single) return [single];
    return [];
  }

  get primaryImgUrl(): string | undefined {
    return this.imgUrls[0];
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
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ProductDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: any } | null,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getAllCategories();

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
    const existingUrls = product?.imgUrls || (product?.imgUrl ? [product.imgUrl] : []);
    this.form = this.fb.group({
      name: [product?.name || '', [Validators.required, Validators.minLength(2)]],
      nameKh: [product?.nameKh || product?.nameKm || ''],
      price: [product?.price || '', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      stock: [product?.stock || '', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      lowStockThreshold: [product?.lowStockThreshold || 10, [Validators.min(0), Validators.pattern(/^\d+$/)]],
      expiryDate: [product?.expiryDate || ''],
      barcode: [product?.barcode || '', [Validators.required]],
      categoryId: [Number(product?.categoryId ?? product?.category) || '', [Validators.required]],
      imgUrl: [product?.imgUrl || ''],
      imgUrls: [existingUrls],
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
    this.uploadFile(file);
  }

  uploadFile(file: File): void {
    this.isUploading.set(true);
    this.cloudinaryService.uploadFile(file).subscribe({
      next: (res) => {
        const fileUrl =
          res?.data?.data?.fileUrl ||
          res?.data?.data?.[0]?.fileUrl ||
          res?.data?.fileUrl ||
          res?.secure_url ||
          res?.url;

        if (fileUrl) {
          const currentUrls = this.form.get('imgUrls')?.value as string[] || [];
          const updated = [fileUrl, ...currentUrls];
          this.form.patchValue({ imgUrls: updated, imgUrl: fileUrl });
          this.alertService.success(
            this.lang.currentLang() === 'km' ? 'បានបង្ហោះរូបភាពដោយជោគជ័យ' : 'Image uploaded successfully',
            this.lang.currentLang() === 'km' ? 'ជោគជ័យ' : 'Success',
          );
        }
        this.isUploading.set(false);
      },
      error: () => {
        this.alertService.error(
          this.lang.currentLang() === 'km' ? 'ការបង្ហោះរូបភាពបរាជ័យ' : 'Image upload failed',
          this.lang.currentLang() === 'km' ? 'កំហុស' : 'Error',
        );
        this.isUploading.set(false);
      },
    });
  }

  openGallery(): void {
    const data: MediaGalleryData = {
      selectedUrl: this.primaryImgUrl,
    };
    const galleryDialogRef = this.dialog.open(CloudinaryMediaGalleryModalComponent, {
      panelClass: 'medium-dialog',
      data,
    });

    galleryDialogRef.afterClosed().subscribe((url: string | null) => {
      this.onGallerySelect(url);
    });
  }

  onGallerySelect(url: string | null): void {
    if (url) {
      const currentUrls = this.form.get('imgUrls')?.value as string[] || [];
      if (!currentUrls.includes(url)) {
        const updated = [url, ...currentUrls];
        this.form.patchValue({ imgUrls: updated, imgUrl: url });
      } else {
        this.form.patchValue({ imgUrl: url });
      }
    }
  }

  removeImage(index: number): void {
    const currentUrls = this.form.get('imgUrls')?.value as string[] || [];
    const updated = currentUrls.filter((_: string, i: number) => i !== index);
    this.form.patchValue({ imgUrls: updated });
    if (this.primaryImgUrl === undefined && updated.length > 0) {
      this.form.patchValue({ imgUrl: updated[0] });
    } else if (updated.length === 0) {
      this.form.patchValue({ imgUrl: '' });
    }
  }

  setPrimary(index: number): void {
    const currentUrls = this.form.get('imgUrls')?.value as string[] || [];
    if (index === 0) return;
    const updated = [currentUrls[index], ...currentUrls.filter((_: string, i: number) => i !== index)];
    this.form.patchValue({ imgUrls: updated });
  }

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

  private handleServerError(err: HttpErrorResponse): void {
    this.clearServerErrors();

    if (err.status === 409) {
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
      const fieldMessages = err.error.message as string[];
      fieldMessages.forEach(msg => {
        const matched = msg.match(/^(\w+)\s/);
        if (matched && this.form.get(matched[1])) {
          this.form.get(matched[1])?.setErrors({ serverError: msg });
        } else {
          this.serverError.update(prev => prev ? `${prev}\n${msg}` : msg);
        }
      });
      return;
    }

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

    const payload = Object.fromEntries(
      Object.entries(this.form.value).filter(([_, v]) => v !== '' && v !== null && v !== undefined),
    );

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
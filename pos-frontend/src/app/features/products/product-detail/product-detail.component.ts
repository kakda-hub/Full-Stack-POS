import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';
import { ProductService } from '../../../services/product.service';
import { CategoriesService } from '../../../services/categories.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  @Input() product: any | null = null;

  form!: FormGroup;
  isSaving = signal(false);
  isUploading = signal(false);

  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private categoryService: CategoriesService,
    private productService: ProductService,
    public theme: ThemeService,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ProductDetailComponent>,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getAllCategories();
  }

  private initForm() {
    this.form = this.fb.group({
      name: [this.product?.name || '', [Validators.required]],
      nameKh: [this.product?.nameKh || this.product?.nameKm || ''],
      price: [this.product?.price || 0, [Validators.required, Validators.min(0)]],
      stock: [this.product?.stock || 0, [Validators.required, Validators.min(0)]],
      barcode: [this.product?.barcode || ''],
      categoryId: [this.product?.categoryId || 1, [Validators.required]],
      imgUrl: [this.product?.imgUrl || ''],
      description: [this.product?.description || ''],
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
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>('/api/v1/dynamicFileupload', formData).subscribe({
      next: (res) => {
        if (res?.data?.fileUrl) {
          this.form.patchValue({ imgUrl: res.data.fileUrl });
        } else if (res?.data?.data?.[0]?.fileUrl) {
          this.form.patchValue({ imgUrl: res.data.data[0].fileUrl });
        }
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.isUploading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.value;

    const request$ = this.product?.id
      ? this.productService.updateProduct(this.product.id, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Failed to save product', err);
        this.isSaving.set(false);
      },
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isSaving = signal(false);
  isUploading = signal(false);

  categories = [
    { id: 1, name: 'Beverages', nameKm: 'ភេសជ្ជៈ' },
    { id: 2, name: 'Food', nameKm: 'អាហារ' },
    { id: 3, name: 'Snacks', nameKm: 'អាហារសម្រន់' },
    { id: 4, name: 'Dairy', nameKm: 'ផលិតផលទឹកដោះ' },
  ];

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private categoryService: CategoriesService,
    private productService: ProductService,
    public theme: ThemeService,
    private http: HttpClient,
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
      console.log('Categories fetched:', res);
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

    this.http.post<any>('http://localhost:3000/api/v1/dynamicFileupload', formData).subscribe({
      next: (res) => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          this.form.patchValue({ imgUrl: res.data.data[0].fileUrl });
        }
        console.log('Upload success', res);
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

    if (this.product?.id) {
      this.productService.updateProduct(this.product.id, payload).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.save.emit(res);
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
          this.save.emit(payload); // emit anyway to close modal for demo
        },
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.save.emit(res);
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
          this.save.emit(payload); // emit anyway to close modal for demo
        },
      });
    }
  }
}

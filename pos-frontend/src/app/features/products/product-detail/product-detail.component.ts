import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Product } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  @Input() product: Product | null = null;
  @Output() save = new EventEmitter<Partial<Product>>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  categories = [
    { id: 'beverages', name: 'Beverages', nameKm: 'ភេសជ្ជៈ' },
    { id: 'food', name: 'Food', nameKm: 'អាហារ' },
    { id: 'snacks', name: 'Snacks', nameKm: 'អាហារសម្រន់' },
    { id: 'dairy', name: 'Dairy', nameKm: 'ផលិតផលទឹកដោះ' },
  ];

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    public theme: ThemeService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.product?.name || '', [Validators.required]],
      nameKm: [this.product?.nameKm || ''],
      price: [this.product?.price || 0, [Validators.required, Validators.min(0)]],
      stock: [this.product?.stock || 0, [Validators.required, Validators.min(0)]],
      barcode: [this.product?.barcode || '', [Validators.required]],
      category: [this.product?.category || 'beverages', [Validators.required]],
      lowStockThreshold: [this.product?.lowStockThreshold || 10],
    });
  }

  onSubmit(): void {
    if (this.form.valid) this.save.emit(this.form.value);
  }
}

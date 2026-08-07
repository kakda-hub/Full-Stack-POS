import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AlertService } from '../../../core/services/alert.service';
import { PurchaseOrderService } from '../../../core/services/api/purchase-order.service';
import { SupplierService } from '../../../core/services/api/supplier.service';
import { ProductService } from '../../../core/services/api/product.service';
import { modalAnimation, backdropAnimation } from '../../../shared/animations/animations';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnimation, backdropAnimation],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-order-detail.component.scss',
})
export class PurchaseOrderDetailComponent implements OnInit {
  form!: FormGroup;
  isSaving = signal(false);
  suppliers: any[] = [];
  products: any[] = [];
  /** Read-only view for existing POs */
  isReadonly = signal(false);

  get po(): any | null {
    return this.data?.purchaseOrder ?? null;
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private alertService: AlertService,
    private poService: PurchaseOrderService,
    private supplierService: SupplierService,
    private productService: ProductService,
    public theme: ThemeService,
    private dialogRef: MatDialogRef<PurchaseOrderDetailComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { purchaseOrder?: any; preselectProduct?: any } | null,
  ) {}

  /** Product pre-selected for restocking (opened from the low-stock drawer). */
  get preselectProduct(): any | null {
    return this.data?.preselectProduct ?? null;
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
    this.initForm();
  }

  private initForm(): void {
    const po = this.po;

    // Read-only for existing POs (view mode)
    if (po?.id) {
      this.isReadonly.set(true);
    }

    this.form = this.fb.group({
      orderNumber: [po?.orderNumber || this.generateOrderNumber(), [Validators.required]],
      supplierId: [po?.supplierId || '', [Validators.required]],
      discount: [po?.discount || 0],
      shippingCost: [po?.shippingCost || 0],
      notes: [po?.notes || ''],
      items: this.fb.array([]),
    });

    // Add existing items, a pre-selected product, or one empty row
    if (po?.items?.length) {
      po.items.forEach((item: any) => this.addItemRow(item));
    } else if (this.preselectProduct) {
      this.addItemRow({
        productId: Number(this.preselectProduct.id),
        quantity: this.preselectProduct.lowStockThreshold || 10,
        unitCost: this.preselectProduct.costPrice || 0,
      });
    } else {
      this.addItemRow();
    }

    // Disable form in read-only mode
    if (this.isReadonly()) {
      this.form.disable();
    }
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    return `PO-${y}${m}${d}-${seq}`;
  }

  private loadSuppliers(): void {
    this.supplierService.list().subscribe((res: any) => {
      this.suppliers = res?.data || [];
    });
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe((data: any) => {
      this.products = data || [];
      // Ensure the pre-selected (restock) product appears in the options list,
      // even if it falls outside the first page of results.
      const preselected = this.preselectProduct;
      if (
        preselected &&
        !this.products.some((p: any) => Number(p.id) === Number(preselected.id))
      ) {
        this.products = [
          { ...preselected, id: Number(preselected.id), nameKh: preselected.nameKm },
          ...this.products,
        ];
      }
    });
  }

  /** Creates a form group for a single purchase order item */
  private createItemGroup(item?: any) {
    return this.fb.group({
      productId: [item?.productId || item?.product?.id || '', [Validators.required]],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitCost: [item?.unitCost || 0, [Validators.required, Validators.min(0)]],
    });
  }

  addItemRow(item?: any): void {
    this.itemsFormArray.push(this.createItemGroup(item));
  }

  removeItemRow(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  /** Get product name by ID */
  getProductName(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return String(productId);
    return this.lang.currentLang() === 'km' && product.nameKh
      ? product.nameKh
      : product.name;
  }

  /** Calculate item total (quantity * unitCost) */
  itemTotal(index: number): number {
    const group = this.itemsFormArray.at(index);
    const qty = group.get('quantity')?.value || 0;
    const cost = group.get('unitCost')?.value || 0;
    return qty * cost;
  }

  /** Calculate PO subtotal (sum of all item totals) */
  get subtotal(): number {
    let total = 0;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      total += this.itemTotal(i);
    }
    return total;
  }

  /** Calculate PO grand total (subtotal - discount + shipping) */
  get total(): number {
    return this.subtotal - (this.form.get('discount')?.value || 0) + (this.form.get('shippingCost')?.value || 0);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isReadonly()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.value;

    this.poService.create(payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Failed to create purchase order', err);
        this.alertService.error(
          this.lang.currentLang() === 'km'
            ? 'ការបង្កើតបញ្ជាទិញបរាជ័យ'
            : 'Failed to create purchase order'
        );
        this.isSaving.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

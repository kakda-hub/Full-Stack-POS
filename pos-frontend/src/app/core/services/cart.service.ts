import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  private _totalDiscount = signal<number>(0); // flat discount on total

  items = this._items.asReadonly();
  totalDiscount = this._totalDiscount.asReadonly();

  subtotal = computed(() =>
    this._items().reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      const itemDiscount = itemTotal * (item.discount / 100);
      return sum + itemTotal - itemDiscount;
    }, 0)
  );

  discountAmount = computed(() => this.subtotal() * (this._totalDiscount() / 100));

  taxRate = signal<number>(0); // optional tax percentage
  taxAmount = computed(() => (this.subtotal() - this.discountAmount()) * (this.taxRate() / 100));

  total = computed(() => this.subtotal() - this.discountAmount() + this.taxAmount());

  itemCount = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));

  addItem(product: Product): void {
    this._items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...items, { product, quantity: 1, discount: 0 }];
    });
  }

  removeItem(productId: string): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this._items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  updateItemDiscount(productId: string, discount: number): void {
    this._items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, discount } : i)
    );
  }

  setTotalDiscount(discount: number): void {
    this._totalDiscount.set(discount);
  }

  setTaxRate(rate: number): void {
    this.taxRate.set(rate);
  }

  clearCart(): void {
    this._items.set([]);
    this._totalDiscount.set(0);
  }

  findByBarcode(barcode: string): CartItem | undefined {
    return this._items().find(i => i.product.barcode === barcode);
  }
}

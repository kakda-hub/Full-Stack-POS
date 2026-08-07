import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../models';

@Component({
  selector: 'app-low-stock-drawer',
  standalone: false,
  templateUrl: './low-stock-drawer.component.html',
  styleUrl: './low-stock-drawer.component.scss',
})
export class LowStockDrawerComponent {
  @Input() products: Product[] = [];
  @Input() getCategoryName: (categoryId: string) => string = () => '';
  @Input() updatingIds: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() restock = new EventEmitter<Product>();
  @Output() stockAdjust = new EventEmitter<{ product: Product; delta: number }>();

  get lowStockProducts(): Product[] {
    return this.products.filter(
      (product) => product.stock <= (product.lowStockThreshold ?? 10)
    );
  }

  /** Emits a stock adjustment, guarding against going below zero. */
  adjustStock(item: Product, delta: number): void {
    if (item.stock + delta < 0) return;
    this.stockAdjust.emit({ product: item, delta });
  }

  /** Whether a stock-adjust request is in flight for the given product. */
  isUpdating(item: Product): boolean {
    return this.updatingIds.includes(item.id);
  }

  /** Percentage of the low-stock threshold remaining, clamped to 0-100. */
  stockPercent(product: Product): number {
    const threshold =
      product.lowStockThreshold && product.lowStockThreshold > 0
        ? product.lowStockThreshold
        : 10;
    return Math.max(
      0,
      Math.min(100, Math.round((product.stock / threshold) * 100))
    );
  }
}

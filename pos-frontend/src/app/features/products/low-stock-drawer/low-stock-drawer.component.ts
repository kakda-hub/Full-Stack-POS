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
  @Output() close = new EventEmitter<void>();

  get lowStockProducts(): Product[] {
    return this.products.filter(
      (product) => product.stock <= (product.lowStockThreshold ?? 10)
    );
  }
}

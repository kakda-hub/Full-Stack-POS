import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { counterAnimation } from '../../../shared/animations/animations';
import { Product } from '../../../models/product.model';
import { LanguageService } from '../../../services/shared/language.service';
import { ProductService } from '../../../services/shared/product.service';

export type StockStatus = 'ok' | 'low' | 'out';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  animations: [counterAnimation],
  host: {
    class: 'block w-full h-full',
  },
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isInCart = false;
  @Input() quantity = 0;
  @Input() effectiveStock = 0;
  @Input() photoResolver: (category: string) => string | undefined = () => undefined;
  @Input() isLastAdded = false;
  @Input() isShaking = false;

  @Output() addToCart = new EventEmitter<void>();
  @Output() removeFromCart = new EventEmitter<void>();
  @Output() decreaseQuantity = new EventEmitter<number>();
  @Output() increaseQuantity = new EventEmitter<number>();

  langService = inject(LanguageService);
  private productService = inject(ProductService);

  /**
   * Resolved category label in the active language, or '' when unknown.
   *
   * Plain getter (not `computed`): it reads `@Input()` properties which are
   * not signals, so a memoized computed would cache stale values whenever the
   * parent re-binds the inputs (e.g. `[effectiveStock]` after a cart change).
   * The component uses default change detection, so getters stay fresh.
   */
  get categoryName(): string {
    const cat = this.productService
      .categories()
      .find(c => c.id === this.product.category);
    if (!cat) return '';
    return this.langService.currentLang() === 'km' && cat.nameKm ? cat.nameKm : cat.name;
  }

  /** 'ok' | 'low' | 'out' based on effective stock vs the product threshold. */
  get stockStatus(): StockStatus {
    if (this.effectiveStock <= 0) return 'out';
    const threshold = this.product.lowStockThreshold ?? 10;
    return this.effectiveStock <= threshold ? 'low' : 'ok';
  }

  onImgLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    const container = img.closest('.img-container');
    if (container) {
      container.classList.remove('img-loading');
    }
  }
}

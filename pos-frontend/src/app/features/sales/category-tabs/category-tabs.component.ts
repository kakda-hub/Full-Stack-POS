import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductService } from '../../../services/shared/product.service';
import { LanguageService } from '../../../services/shared/language.service';

@Component({
  selector: 'app-category-tabs',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-tabs.component.html',
  styleUrl: './category-tabs.component.scss',
})
export class CategoryTabsComponent {
  productService: ProductService = inject(ProductService);
  langService: LanguageService = inject(LanguageService);
}

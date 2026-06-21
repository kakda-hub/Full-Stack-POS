import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { counterAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-cashier-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [counterAnimation],
  templateUrl: './cashier-layout.component.html',
  styleUrl: './cashier-layout.component.scss',
})
export class CashierLayoutComponent {
  constructor(
    public auth: AuthService,
    public langService: LanguageService,
    public cart: CartService,
    public theme: ThemeService,
  ) { }
}

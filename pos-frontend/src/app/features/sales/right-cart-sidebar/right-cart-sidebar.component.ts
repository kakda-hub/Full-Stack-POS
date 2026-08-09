import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CartService } from '../../../services/shared/cart.service';
import { LanguageService } from '../../../services/shared/language.service';
import { CartItem } from '../../../models/cart-item.model';
import { fadeIn, cartItemAnimation, counterAnimation } from '../../../shared/animations/animations';

const sidebarAnimation = trigger('sidebarAnimation', [
  state('open', style({ width: '*', opacity: 1, visibility: 'visible' })),
  state('closed', style({ width: '0', opacity: 0, visibility: 'hidden', margin: '0', padding: '0', border: '0' })),
  transition('open <=> closed', [animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')])
]);

const drawerSlide = trigger('drawerSlide', [
  state('closed', style({ transform: 'translateY(100%)' })),
  state('open', style({ transform: 'translateY(0)' })),
  transition('closed => open', [animate('350ms cubic-bezier(0.32, 0.72, 0, 1)')]),
  transition('open => closed', [animate('250ms cubic-bezier(0.4, 0, 0.2, 1)')])
]);

const drawerBackdrop = trigger('drawerBackdrop', [
  state('closed', style({ opacity: 0, pointerEvents: 'none' as const })),
  state('open', style({ opacity: 1, pointerEvents: 'auto' as const })),
  transition('closed <=> open', [animate('250ms ease')])
]);

@Component({
  selector: 'app-right-cart-sidebar',
  standalone: false,
  templateUrl: './right-cart-sidebar.component.html',
  styleUrl: './right-cart-sidebar.component.scss',
  animations: [fadeIn, cartItemAnimation, counterAnimation, sidebarAnimation, drawerSlide, drawerBackdrop],
})
export class RightCartSidebarComponent {
  cart = inject(CartService);
  langService = inject(LanguageService);

  @Input() isCartOpen = signal(true);
  @Input() subtotalDisplay = signal(0);
  @Input() taxDisplay = signal(0);
  @Input() totalDisplay = signal(0);
  @Input() photoResolver: (category: string) => string | undefined = () => undefined;
  @Input() isMobile = signal(false);
  @Input() isCartDrawerOpen = signal(false);

  @Output() clearCart = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();
  @Output() toggleCartSidebar = new EventEmitter<void>();
  @Output() closeCartDrawer = new EventEmitter<void>();

  trackByProductId(_: number, item: CartItem): string {
    return item.product.id;
  }
}

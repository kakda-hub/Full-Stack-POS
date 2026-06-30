import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { Transaction, Product, CartItem } from '../../../core/models';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProductService } from '../../../core/services/product.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { fadeIn, listAnimation, cartItemAnimation, counterAnimation, slideOut, slideIn, pageTransition } from '../../../shared/animations/animations';

// Sidebar specific animation
const sidebarAnimation = trigger('sidebarAnimation', [
  state('open', style({ width: '*', opacity: 1, visibility: 'visible' })),
  state('closed', style({ width: '0', opacity: 0, visibility: 'hidden', margin: '0', padding: '0', border: '0' })),
  transition('open <=> closed', [animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')])
]);

@Component({
  selector: 'app-C',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, cartItemAnimation, counterAnimation, slideOut, slideIn, pageTransition, sidebarAnimation],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss',
})
export class SalesComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Signal state for Sidebar
  isCartOpen = signal(true);

  showPayment = false;
  isLoadingProducts = signal(true);
  lastTransaction: Transaction | null = null;
  lastAddedId = signal<string | null>(null);
  shakingProductId = signal<string | null>(null);

  // Price slide animation state
  showOldSubtotal = signal(false);
  showOldTotal = signal(false);
  prevSubtotalVal = 0;
  prevTotalVal = 0;
  private priceAnimTimeout: ReturnType<typeof setTimeout> | null = null;

  private stockTimeout: ReturnType<typeof setTimeout> | null = null;
  private shakeTimeout: ReturnType<typeof setTimeout> | null = null;
  private searchSubject = new Subject<string>();

  constructor(
    public cart: CartService,
    public productService: ProductService,
    public auth: AuthService,
    public langService: LanguageService,
    private transactionService: TransactionService,
    public theme: ThemeService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
  ) {
    // Initialize price tracking before the effect to prevent animation on first render
    this.prevSubtotalVal = this.cart.subtotal();
    this.prevTotalVal = this.cart.total();

    // Sync loading state with ProductService API response
    effect(() => {
      if (!this.productService.loading()) {
        this.isLoadingProducts.set(false);
        this.cdr.markForCheck();
      }
    });

    // Watch for price changes to trigger slide animation
    effect(() => {
      const sub = this.cart.subtotal();
      const tot = this.cart.total();
      const subChanged = sub !== this.prevSubtotalVal;
      const totChanged = tot !== this.prevTotalVal;
      if (!subChanged && !totChanged) return;
      // Show old values sliding out
      this.showOldSubtotal.set(subChanged);
      this.showOldTotal.set(totChanged);
      if (this.priceAnimTimeout) clearTimeout(this.priceAnimTimeout);
      this.priceAnimTimeout = setTimeout(() => {
        this.showOldSubtotal.set(false);
        this.showOldTotal.set(false);
        this.prevSubtotalVal = sub;
        this.prevTotalVal = tot;
        this.priceAnimTimeout = null;
      }, 200);
    });
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(250)).subscribe(q => {
      this.productService.setSearch(q);
      this.cdr.markForCheck();
    });
  }

  toggleCartSidebar(): void {
    this.isCartOpen.update(v => !v);
  }

  @HostListener('window:keydown.control.b', ['$event'])
  handleShortcut(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.toggleCartSidebar();
  }

  onSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchSubject.next(val);
  }

  onBarcodeEnter(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim();
    const product = this.productService.findByBarcode(val);
    if (product) {
      this.addToCart(product);
      (event.target as HTMLInputElement).value = '';
      this.productService.setSearch('');
    }
  }

  /** Compute remaining stock after deducting cart quantities */
  effectiveStock(product: Product): number {
    const inCart = this.cart.items().find(i => i.product.id === product.id);
    const qtyInCart = inCart ? inCart.quantity : 0;
    return product.stock - qtyInCart;
  }

  addToCart(product: Product): void {
    if (this.effectiveStock(product) <= 0) {
      this.alertService.error('Out of stock');
      // Shake animation on out-of-stock click
      this.shakingProductId.set(product.id);
      if (this.shakeTimeout) clearTimeout(this.shakeTimeout);
      this.shakeTimeout = setTimeout(() => {
        this.shakingProductId.set(null);
        this.shakeTimeout = null;
      }, 500);
      return;
    }
    this.cart.addItem(product);
    // Stock flash animation — cancel any previous timeout to avoid glitch on rapid clicks
    this.lastAddedId.set(product.id);
    if (this.stockTimeout) clearTimeout(this.stockTimeout);
    this.stockTimeout = setTimeout(() => {
      this.lastAddedId.set(null);
      this.stockTimeout = null;
    }, 700);
    // If cart was closed, auto-open it when adding item
    if (!this.isCartOpen()) this.isCartOpen.set(true);
  }

  clearCart(): void {
    if (confirm('Clear all items?')) this.cart.clearCart();
  }

  onPaymentComplete(data: any): void {
    const txn = this.transactionService.saveTransaction(
      this.cart.items(),
      this.cart.subtotal(),
      this.cart.discountAmount(),
      this.cart.taxAmount(),
      this.cart.total(),
      data.method,
      this.auth.currentUser()?.name || 'Cashier',
      data.cashReceived,
    );
    this.cart.items().forEach(item => this.productService.reduceStock(item.product.id, item.quantity));
    this.cart.clearCart();
    this.showPayment = false;
    this.lastTransaction = txn;
    this.alertService.success('Success');
    this.cdr.markForCheck();
  }

  trackById(_: number, p: Product): string { return p.id; }
  trackByProductId(_: number, item: CartItem): string { return item.product.id; }

  getProductColor(category: string): string {
    const map: Record<string, string> = {
      beverages: 'bg-blue-50 text-blue-500',
      food: 'bg-orange-50 text-orange-500',
      snacks: 'bg-yellow-50 text-yellow-500',
      dairy: 'bg-green-50 text-green-500',
    };
    return map[category] || 'bg-slate-50';
  }

  getCategoryEmoji(category: string): string {
    const map: Record<string, string> = { beverages: '🥤', food: '🍱', snacks: '🍿', dairy: '🥛' };
    return map[category] || '📦';
  }

  getProductPhoto(category: string): string {
    const map: Record<string, string> = {
      beverages: 'https://kptmedia.ap-south-1.linodeobjects.com/uploads/2025/06/khmer-drinks-1000x600.jpg',
      food: 'https://www.eatingwell.com/thmb/m5xUzIOmhWSoXZnY-oZcO9SdArQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/article_291139_the-top-10-healthiest-foods-for-kids_-02-4b745e57928c4786a61b47d8ba920058.jpg',
      snacks: 'https://cdn.jwplayer.com/v2/media/Ny6oGnz7/poster.jpg?width=720',
      dairy: 'https://media.cnn.com/api/v1/images/stellar/prod/210922092746-dairy-products-stock.jpg?q=w_2500,h_1667,x_0,y_0,c_fill'
    };
    return map[category];
  }
}
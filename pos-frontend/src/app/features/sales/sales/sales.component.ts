import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, signal, untracked, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, debounceTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Transaction, Product, CartItem, QuickPickItem, CreateSaleDto } from '../../../models';
import { AlertService } from '../../../services/shared/alert.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../services/shared/auth.service';
import { CartService } from '../../../services/shared/cart.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ProductService } from '../../../services/shared/product.service';
import { ThemeService } from '../../../services/shared/theme.service';
import { TransactionService } from '../../../services/shared/transaction.service';
import { QuickPickService } from '../../../services/quick-pick.service';
import { SaleService } from '../../../services/sale.service';
import { fadeIn, listAnimation, cartItemAnimation, counterAnimation } from '../../../shared/animations/animations';
import { animatePrice, prefersReducedMotion } from '../../../shared/helpers/price-tween.helper';

// Sidebar specific animation
const sidebarAnimation = trigger('sidebarAnimation', [
  state('open', style({ width: '*', opacity: 1, visibility: 'visible' })),
  state('closed', style({ width: '0', opacity: 0, visibility: 'hidden', margin: '0', padding: '0', border: '0' })),
  transition('open <=> closed', [animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')])
]);

// Mobile bottom drawer animations
const drawerSlide = trigger('drawerSlide', [
  state('closed', style({ transform: 'translateY(100%)' })),
  state('open', style({ transform: 'translateY(0)' })),
  transition('closed => open', [
    animate('350ms cubic-bezier(0.32, 0.72, 0, 1)')
  ]),
  transition('open => closed', [
    animate('250ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

const drawerBackdrop = trigger('drawerBackdrop', [
  state('closed', style({ opacity: 0, pointerEvents: 'none' as const })),
  state('open', style({ opacity: 1, pointerEvents: 'auto' as const })),
  transition('closed <=> open', [animate('250ms ease')])
]);

@Component({
  selector: 'app-C',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation, cartItemAnimation, counterAnimation, sidebarAnimation, drawerSlide, drawerBackdrop],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss',
})
export class SalesComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Signal state for Sidebar
  isCartOpen = signal(true);

  // Mobile responsive state
  isMobile = signal(false);
  private mobileBreakpoint = 768;
  isCartDrawerOpen = signal(false);

  showPayment = false;
  isLoadingProducts = signal(true);
  isProcessingSale = signal(false);
  lastTransaction: Transaction | null = null;
  lastAddedId = signal<string | null>(null);
  shakingProductId = signal<string | null>(null);

  // Quick Pick items
  quickPicks = signal<QuickPickItem[]>([]);

  // Price display values — tweened toward the cart totals with rAF so the
  // digits roll smoothly on every change (no snapping, no overlap, and rapid
  // +/- clicks just re-target the in-flight tween instead of restarting it).
  subtotalDisplay = signal(0);
  taxDisplay = signal(0);
  totalDisplay = signal(0);
  private subtotalRaf: { id: number | null } = { id: null };
  private taxRaf: { id: number | null } = { id: null };
  private totalRaf: { id: number | null } = { id: null };
  /**
   * Honours prefers-reduced-motion: when set, totals snap to the new value
   * instead of rolling (the rAF tween bypasses Angular animations, so the
   * global noop-animations swap in app.module.ts would not cover it).
   */
  private reduceMotion = prefersReducedMotion();

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
    private quickPickService: QuickPickService,
    private saleService: SaleService,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    // Detect mobile on init
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
    // Seed displayed prices with the current cart totals (no animation on load)
    this.subtotalDisplay.set(this.cart.subtotal());
    this.taxDisplay.set(this.cart.taxAmount());
    this.totalDisplay.set(this.cart.total());

    // Sync loading state with ProductService API response
    effect(() => {
      if (!this.productService.loading()) {
        this.isLoadingProducts.set(false);
        this.cdr.markForCheck();
      }
    });

    // Watch the cart totals and roll the displayed values toward them.
    // Writes to the display signals happen inside untracked() so the tween's
    // own progress frames don't re-trigger this effect (each cart change
    // re-targets the tween from wherever it currently is — buttery smooth).
    effect(() => {
      const sub = this.cart.subtotal();
      const tax = this.cart.taxAmount();
      const tot = this.cart.total();
      untracked(() => {
        if (this.reduceMotion) {
          // Reduced motion: snap to the new totals, no roll.
          this.subtotalDisplay.set(sub);
          this.taxDisplay.set(tax);
          this.totalDisplay.set(tot);
          return;
        }
        animatePrice(this.subtotalRaf, () => this.subtotalDisplay(), sub, v => this.subtotalDisplay.set(v));
        animatePrice(this.taxRaf, () => this.taxDisplay(), tax, v => this.taxDisplay.set(v));
        animatePrice(this.totalRaf, () => this.totalDisplay(), tot, v => this.totalDisplay.set(v));
      });
    });
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(250)).subscribe(q => {
      this.productService.setSearch(q);
      this.cdr.markForCheck();
    });

    // Load Quick Pick items
    this.quickPickService.getAll().subscribe({
      next: (items) => this.quickPicks.set(items),
      error: () => this.quickPicks.set([]),
    });
  }

  ngOnDestroy(): void {
    // Stop any in-flight price tweens so the rAF loop can't outlive the component.
    [this.subtotalRaf, this.taxRaf, this.totalRaf].forEach(r => {
      if (r.id !== null) cancelAnimationFrame(r.id);
    });
  }

  /** Check screen width and update mobile state */
  @HostListener('window:resize')
  checkScreenSize(): void {
    const mobile = window.innerWidth < this.mobileBreakpoint;
    if (mobile !== this.isMobile()) {
      this.isMobile.set(mobile);
      // Close drawer when resizing to desktop
      if (!mobile) {
        this.isCartDrawerOpen.set(false);
      }
      this.cdr.markForCheck();
    }
  }

  toggleCartSidebar(): void {
    if (this.isMobile()) {
      this.isCartDrawerOpen.update(v => !v);
      if (this.isCartDrawerOpen()) {
        this.isCartOpen.set(true);
      }
    } else {
      this.isCartOpen.update(v => !v);
    }
  }

  /** Close mobile cart drawer */
  closeCartDrawer(): void {
    this.isCartDrawerOpen.set(false);
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

  addQuickPick(item: QuickPickItem): void {
    // Create a pseudo-product from quick pick item
    const quickProduct: Product = {
      id: `quick-${item.id}`,
      name: item.label,
      nameKm: item.labelKh,
      price: item.price,
      barcode: `QP-${item.id}`,
      category: 'quick',
      stock: 9999,
      imgUrl: undefined,
      lowStockThreshold: undefined,
      expiryDate: undefined,
    };
    this.cart.addItem(quickProduct);
    if (this.isMobile()) {
      this.isCartDrawerOpen.set(true);
    } else if (!this.isCartOpen()) {
      this.isCartOpen.set(true);
    }
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
    // Auto-open cart drawer on mobile when adding items
    if (this.isMobile() && !this.isCartDrawerOpen()) {
      this.isCartDrawerOpen.set(true);
    }
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.langService.currentLang() === 'km' ? 'បញ្ជាក់ការសម្អាត' : 'Confirm Clear Cart',
        message: this.langService.currentLang() === 'km'
          ? 'តើអ្នកពិតជាចង់លុបទំនិញទាំងអស់ក្នុងកន្ត្រកមែនទេ?'
          : 'Are you sure you want to remove all items from your cart?',
        confirmLabel: this.langService.currentLang() === 'km' ? 'លុបចោល' : 'Clear',
        cancelLabel: this.langService.currentLang() === 'km' ? 'បោះបង់' : 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.cart.clearCart();
      this.alertService.warning(
        this.langService.currentLang() === 'km'
          ? 'បានសម្អាតកន្ត្រកទំនិញរួចរាល់'
          : 'Cart has been cleared'
      );
    });
  }

  onPaymentComplete(data: any): void {
    // Calculate effective total with loyalty discount
    const loyaltyDisc = data.loyaltyDiscount || 0;
    const effectiveTotal = this.cart.total() - loyaltyDisc;

    // Build DTO for backend — filter out quick-pick items (synthetic 'quick-' IDs)
    const realItems = this.cart.items().filter(i => !i.product.id.startsWith('quick-'));

    if (realItems.length > 0) {
      const dto: CreateSaleDto = {
        items: realItems.map(i => ({
          productId: parseInt(i.product.id, 10),
          quantity: i.quantity,
        })),
        discount: this.cart.discountAmount(),
        tax: this.cart.taxAmount(),
        paymentMethod: data.method,
        customerId: data.customerId,
        pointsRedeemed: data.pointsRedeemed,
      };

      // Persist to backend first
      this.isProcessingSale.set(true);
      this.cdr.markForCheck();

      this.saleService.createSale(dto).subscribe({
        next: () => {
          this.isProcessingSale.set(false);
          this.completeSaleLocally(data, effectiveTotal);
        },
        error: (err) => {
          this.isProcessingSale.set(false);
          this.cdr.markForCheck();
          console.error('Sale API error', err);
          this.alertService.error(
            this.langService.currentLang() === 'km'
              ? 'ការលក់បរាជ័យ សូមព្យាយាមម្តងទៀត'
              : 'Sale failed, please try again',
          );
        },
      });
    } else {
      // All items are quick-picks — no backend persistence needed
      this.completeSaleLocally(data, effectiveTotal);
    }
  }

  /**
   * Complete the sale locally: save to localStorage, reduce local stock,
   * clear cart, and show the receipt modal.
   */
  private completeSaleLocally(data: any, effectiveTotal: number): void {
    const txn = this.transactionService.saveTransaction(
      this.cart.items(),
      this.cart.subtotal(),
      this.cart.discountAmount(),
      this.cart.taxAmount(),
      Math.max(0, effectiveTotal),
      data.method,
      this.auth.currentUser()?.name || 'Cashier',
      data.cashReceived,
      data.customerId,
      data.customerName,
      data.pointsEarned,
      data.pointsRedeemed,
      data.loyaltyDiscount,
    );
    // Reduce stock for real products only (skip quick-pick items with synthetic IDs)
    this.cart.items().forEach(item => {
      if (!item.product.id.startsWith('quick-')) {
        this.productService.reduceStock(item.product.id, item.quantity);
      }
    });
    this.cart.clearCart();
    this.showPayment = false;
    this.lastTransaction = txn;
    this.alertService.success(
      this.langService.currentLang() === 'km'
        ? 'លក់ជោគជ័យ'
        : 'Sale completed',
    );
    this.cdr.markForCheck();
  }

  /** Check if a product is already in the cart (for selected-state highlighting) */
  isInCart(product: Product): boolean {
    return this.cart.items().some(i => i.product.id === product.id);
  }

  /** Get the cart quantity for a product (for badge overlay) */
  cartQuantity(product: Product): number {
    return this.cart.items().find(i => i.product.id === product.id)?.quantity || 0;
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

  /** Remove loading state once image loads */
  onImgLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    const container = img.closest('.img-container');
    if (container) {
      container.classList.remove('img-loading');
    }
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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, debounceTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Transaction, Product, QuickPickItem, CreateSaleDto } from '../../../models';
import { AlertService } from '../../../services/shared/alert.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../services/shared/auth.service';
import { CartService } from '../../../services/shared/cart.service';
import { LanguageService } from '../../../services/shared/language.service';
import { ProductService } from '../../../services/shared/product.service';
import { TransactionService } from '../../../services/shared/transaction.service';
import { QuickPickService } from '../../../services/quick-pick.service';
import { SaleService } from '../../../services/sale.service';
import { PaymentModalComponent, PaymentDialogData } from '../payment-modal/payment-modal.component';
import { ReceiptModalComponent, ReceiptDialogData } from '../receipt-modal/receipt-modal.component';
import { fadeIn, listAnimation } from '../../../shared/animations/animations';
import { animatePrice, prefersReducedMotion } from '../../../shared/helpers/price-tween.helper';
import { DialogConfig } from '../../../enums/dialog-config.enum';

@Component({
  selector: 'app-C',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn, listAnimation],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss',
})
export class SalesComponent implements OnInit, OnDestroy {
  // Signal state for Sidebar
  isCartOpen = signal(true);

  // Mobile responsive state
  isMobile = signal(false);
  private mobileBreakpoint = 768;
  isCartDrawerOpen = signal(false);

  isLoadingProducts = signal(true);
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
    private auth: AuthService,
    private langService: LanguageService,
    private transactionService: TransactionService,
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

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  /**
   * Infinite scroll: when the product-grid container nears the bottom, request
   * the next page. `ProductService.loadMore()` guards against duplicate or
   * out-of-range requests.
   */
  onProductScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const threshold = 300; // px from the bottom
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      this.productService.loadMore();
    }
  }

  onBarcodeEnter(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.trim();
    const product = this.productService.findByBarcode(val);
    if (product) {
      this.addToCart(product);
      input.value = '';
      this.productService.setSearch('');
      return;
    }
    // Product is not in the loaded pages (grid is paginated) — fall back to a
    // targeted server lookup so scanning still works for the full catalog.
    this.productService.findByBarcodeFromServer(val).subscribe({
      next: (found) => {
        if (found) {
          this.addToCart(found);
          input.value = '';
          this.productService.setSearch('');
        }
      },
      error: (err) => {
        console.error('Barcode lookup failed', val, err);
      },
    });
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
      this.alertService.error(this.langService.t('sales.outOfStockAlert'));
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

  /** Opens the payment dialog (MatDialog) with the current cart snapshot. */
  openPaymentModal(): void {
    const dialogRef = this.dialog.open(PaymentModalComponent, {
      panelClass: DialogConfig.SMALL_DIALOG,
      width: '28rem',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        total: this.cart.total(),
        subtotal: this.cart.subtotal(),
        processing: false,
        items: this.cart.items(),
        photoResolver: this.getProductPhoto,
      } satisfies PaymentDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;
      this.onPaymentComplete(result);
    });
  }

  /** Shows the receipt for a completed sale via MatDialog. */
  private openReceiptModal(transaction: Transaction): void {
    this.dialog.open(ReceiptModalComponent, {
      panelClass: DialogConfig.SMALL_DIALOG,
      width: '24rem',
      maxWidth: '95vw',
      data: {
        transaction,
        photoResolver: this.getProductPhoto,
      } satisfies ReceiptDialogData,
    });
  }

  clearCart(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.langService.t('sales.confirmClearTitle'),
        message: this.langService.t('sales.confirmClearMessage'),
        confirmLabel: this.langService.t('sales.clearLabel'),
        cancelLabel: this.langService.t('common.cancel'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.cart.clearCart();
      this.alertService.warning(this.langService.t('sales.cartCleared'));
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
      this.cdr.markForCheck();

      this.saleService.createSale(dto).subscribe({
        next: () => {
          this.completeSaleLocally(data, effectiveTotal);
        },
        error: (err) => {
          this.cdr.markForCheck();
          console.error('Sale API error', err);
          this.alertService.error(this.langService.t('sales.saleFailed'));
        },
      });
    } else {
      // All items are quick-picks — no backend persistence needed
      this.completeSaleLocally(data, effectiveTotal);
    }
  }

  /**
   * Complete the sale locally: save to localStorage, reduce local stock,
   * clear cart, and show the receipt dialog.
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
    this.openReceiptModal(txn);
    this.alertService.success(this.langService.t('sales.saleCompleted'));
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
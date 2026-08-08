import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, HostListener, computed, signal, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/shared/auth.service';
import { CartService } from '../../services/shared/cart.service';
import { LanguageService, AppLanguage } from '../../services/shared/language.service';
import { ThemeService } from '../../services/shared/theme.service';
import { NavStateService, NavItem } from '../../services/shared/nav-state.service';
import { AlertService } from '../../services/shared/alert.service';
import { counterAnimation, themeRotate } from '../../shared/animations/animations';

@Component({
  selector: 'app-cashier-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [counterAnimation, themeRotate],
  template: `<div class="cashier-layout font-sans">
  <!-- Top Nav -->
  <header class="cashier-header">
    <div class="flex items-center gap-3 min-w-0">

      @if (auth.isAdmin()) {
        <div>
          <app-ui-button [variant]="'secondary'" [size]="'md'" type="button" (click)="goHome()">
            <app-icon name="arrow-left" svgClass="w-4 h-4"></app-icon>
            <span>{{ 'layout.backHome' | translate }}</span>
          </app-ui-button>
        </div>
      }

      <!-- Brand -->
      <div class="flex items-center gap-2.5 flex-shrink-0">
        <div class="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-lg shadow-indigo-200 dark:bg-slate-800 dark:shadow-indigo-900/40">
          <img
            class="w-full h-full object-contain"
            src="assets/images/mini-market-logo.png"
            alt="Mini Mart"
          />
        </div>
        <h1 class="hidden sm:block text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">
          {{ 'brand.title' | translate }}
        </h1>
        @if (cart.itemCount() > 0) {
          <span class="cart-count-badge" [@counterAnimation]="cart.itemCount()">{{ cart.itemCount() }}</span>
        }
      </div>

      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" [attr.aria-label]="'nav.breadcrumb' | translate">
        @for (crumb of breadcrumbs(); track crumb; let last = $last) {
          <span class="breadcrumb-item" [class.breadcrumb-current]="last">{{ crumb }}</span>
          @if (!last) {
            <app-icon name="chevron-right" svgClass="w-3.5 h-3.5 flex-shrink-0 text-slate-300 dark:text-slate-600" />
          }
        }
      </nav>
    </div>

    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      <!-- Language Dropdown -->
      <div class="dropdown-wrap" [class.dropdown-open]="langMenuOpen()">
        <button
          (click)="toggleLangMenu()"
          class="lang-pill"
          aria-haspopup="true"
          [attr.aria-expanded]="langMenuOpen()"
          [title]="'layout.language' | translate"
          type="button"
        >
          <img class="lang-flag-img" [src]="langService.currentLang() === 'en' ? 'assets/images/en-flag.png' : 'assets/images/kh-flag.png'" alt="" />
          <span class="lang-label">{{ langService.currentLang() === 'en' ? ('layout.english' | translate) : ('layout.khmer' | translate) }}</span>
          <app-icon
            name="chevron-down"
            class="transition-transform duration-200"
            [class.rotate-180]="langMenuOpen()"
            svgClass="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"
          />
        </button>

        @if (langMenuOpen()) {
          <div class="dropdown-menu lang-dropdown" role="menu">
            <button
              class="dropdown-item"
              [class.dropdown-item-active]="langService.currentLang() === 'en'"
              (click)="setLanguage('en')"
              role="menuitem"
              type="button"
            >
              <img class="dropdown-item-flag-img" src="assets/images/en-flag.png" alt="" />
              <span class="dropdown-item-label">ENGLISH</span>
              @if (langService.currentLang() === 'en') {
                <app-icon name="check" svgClass="w-4 h-4 text-indigo-500" />
              }
            </button>
            <button
              class="dropdown-item"
              [class.dropdown-item-active]="langService.currentLang() === 'km'"
              (click)="setLanguage('km')"
              role="menuitem"
              type="button"
            >
              <img class="dropdown-item-flag-img" src="assets/images/kh-flag.png" alt="" />
              <span class="dropdown-item-label">ភាសាខ្មែរ</span>
              @if (langService.currentLang() === 'km') {
                <app-icon name="check" svgClass="w-4 h-4 text-indigo-500" />
              }
            </button>
          </div>
        }
      </div>

      <!-- Dark Mode Toggle -->
      <button
        (click)="theme.toggle()"
        class="topbar-icon-btn"
        [title]="theme.isDark()
          ? ('layout.switchToLight' | translate)
          : ('layout.switchToDark' | translate)"
        [attr.aria-label]="theme.isDark() ? ('layout.switchToLight' | translate) : ('layout.switchToDark' | translate)"
        type="button"
      >
        @if (theme.isDark()) {
          <app-icon name="sun" svgClass="w-5 h-5" [@themeRotate] />
        } @else {
          <app-icon name="moon" svgClass="w-5 h-5" [@themeRotate] />
        }
      </button>

      <!-- User Menu -->
      <div class="dropdown-wrap" [class.dropdown-open]="userMenuOpen()">
        <button
          (click)="toggleUserMenu()"
          class="user-menu-btn"
          aria-haspopup="true"
          [attr.aria-expanded]="userMenuOpen()"
          [attr.aria-label]="auth.currentUser()?.name || 'User'"
          [title]="auth.currentUser()?.name || 'User'"
          type="button"
        >
          <app-ui-avatar
            [imageUrl]="auth.currentUser()?.avatarUrl"
            [name]="auth.currentUser()?.name"
            size="sm"
            [ring]="true"
            ringColor="ring-indigo-500/30"
          ></app-ui-avatar>
        </button>

        @if (userMenuOpen()) {
          <div class="dropdown-menu user-dropdown" role="menu">
            <div class="user-dropdown-header">
              <div class="flex items-center gap-3">
                <app-ui-avatar
                  [imageUrl]="auth.currentUser()?.avatarUrl"
                  [name]="auth.currentUser()?.name"
                  size="md"
                  [ring]="true"
                  ringColor="ring-indigo-500/30"
                  class="flex-shrink-0"
                ></app-ui-avatar>
                <div class="min-w-0 flex-1">
                  <p class="user-dropdown-name">{{ auth.currentUser()?.name || 'User' }}</p>
                  <p class="user-dropdown-role">{{ userRoleLabel() }}</p>
                  <p class="user-dropdown-email">{{ auth.currentUser()?.username }}</p>
                </div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item dropdown-item-danger" (click)="logout()" role="menuitem" type="button">
              <app-icon name="logout" svgClass="w-4 h-4 flex-shrink-0"></app-icon>
              <span class="dropdown-item-label">{{ 'nav.signOut' | translate }}</span>
            </button>
          </div>
        }
      </div>
    </div>

    <!-- Backdrop to close dropdowns -->
    @if (langMenuOpen() || userMenuOpen()) {
      <div class="dropdown-backdrop" (click)="closeMenus()"></div>
    }
  </header>

  <!-- Main -->
  <main class="flex-1 overflow-hidden">
    <router-outlet></router-outlet>
  </main>
</div>
`,
  styles: [`/* ==========================================================
   Cashier Layout Component Styles – Premium Refresh
   Glass-morphism header with refined interactions
   Dark mode via Tailwind's \`dark:\` variant prefix
   ========================================================== */

/* ─── Cart count badge ─── */
.cart-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

/* ─── Layout containers ─── */
.cashier-layout {
  @apply h-screen flex flex-col;
  @apply bg-slate-50 dark:bg-slate-950;
}

/* ─── Glass-header with premium feel ─── */
.cashier-header {
  @apply flex items-center justify-between gap-3 z-40 relative flex-shrink-0;
  @apply border-b px-4 py-3;
  @apply bg-white/90 border-gray-200;
  @apply dark:bg-slate-950/90 dark:border-slate-800/80;
  @apply overflow-visible;
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  box-shadow: 0 1px 0 rgba(99, 102, 241, 0.04), 0 4px 16px -8px rgba(15, 23, 42, 0.06);

  &::after {
    content: '';
    @apply absolute bottom-0 left-4 right-4 h-px pointer-events-none;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.12), transparent);
  }
}

/* ─── Breadcrumbs ─── */
.breadcrumbs {
  @apply flex items-center gap-1.5 min-w-0 text-sm;
}

.breadcrumb-item {
  @apply truncate font-medium transition-colors;
  @apply text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300;
  max-width: 180px;
}

.breadcrumb-current {
  @apply font-medium;
  @apply text-gray-800 dark:text-slate-100;
}

.breadcrumb-sep {
  @apply w-3.5 h-3.5 flex-shrink-0;
  @apply text-slate-300 dark:text-slate-600;
}

/* ─── Theme toggle button (minimalist, transparent) ─── */
.topbar-icon-btn {
  @apply w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200;
  @apply text-gray-600 hover:bg-gray-100;
  @apply dark:text-slate-300 dark:hover:bg-slate-800;

  &:active {
    @apply scale-95;
  }
}

/* ─── Dropdown wrapper ─── */
.dropdown-wrap {
  @apply relative;
}

/* ─── Language pill ─── */
.lang-pill {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200;
  @apply text-slate-600 border border-gray-200 bg-white;
  @apply dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600;

  &:hover {
    @apply text-indigo-600 border-indigo-200/60 bg-indigo-50;
    @apply dark:text-indigo-400 dark:border-indigo-500/20 dark:bg-indigo-500/10;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }

  &:active {
    @apply scale-95;
  }
}

.lang-flag-img {
  @apply w-5 h-3.5 object-cover rounded-sm flex-shrink-0;
}

.lang-label {
  @apply whitespace-nowrap;
}

.lang-chevron {
  @apply w-3.5 h-3.5 transition-transform duration-200;
  @apply text-slate-400 dark:text-slate-500;

  .dropdown-open & {
    transform: rotate(180deg);
  }
}

/* ─── User menu button ─── */
.user-menu-btn {
  @apply flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200;
  @apply border-2 border-transparent;

  &:hover {
    @apply border-indigo-300/60 dark:border-indigo-500/40;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }

  &:active {
    @apply scale-95;
  }
}

/* ─── Dropdown menu (shared) ─── */
.dropdown-menu {
  @apply absolute right-0 top-[calc(100%+0.5rem)] min-w-[140px] rounded-xl border p-1 shadow-xl z-50;
  @apply bg-white border-gray-100;
  @apply dark:bg-slate-900 dark:border-slate-700/80;
  animation: dropdownIn 160ms cubic-bezier(0.32, 0.72, 0, 1);
  transform-origin: top right;
}

.lang-dropdown {
  @apply min-w-[140px];
}

.user-dropdown {
  @apply min-w-[240px] w-72 p-0 rounded-2xl overflow-hidden;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.dropdown-item {
  @apply w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer;
  @apply text-slate-600 hover:text-indigo-600 hover:bg-gray-50;
  @apply dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10;

  &:active {
    @apply scale-[0.98];
  }

  .dropdown-item-flag-img {
    @apply w-5 h-3.5 object-cover rounded-sm flex-shrink-0;
  }    .dropdown-item-label {
      @apply flex-1 text-left;
    }
  }

.dropdown-item-active {
  @apply font-bold;
  @apply text-indigo-600 bg-indigo-50/80;
  @apply dark:text-indigo-400 dark:bg-indigo-500/10;
}

.dropdown-check {
  @apply w-4 h-4;
  @apply text-indigo-500;
}

.dropdown-item-danger {
  @apply text-rose-600 hover:text-rose-600 hover:bg-rose-50;
  @apply dark:text-rose-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10;
}

.dropdown-divider {
  @apply h-px my-3;
  @apply bg-gray-100 dark:bg-slate-800;
}

.user-dropdown-header {
  @apply px-4 py-3;
  @apply bg-gradient-to-b from-gray-50/80 to-transparent;
  @apply dark:from-slate-800/50 dark:to-transparent;
}

.user-dropdown-name {
  @apply text-sm font-bold truncate;
  @apply text-slate-900 dark:text-white;
}

.user-dropdown-role {
  @apply text-[11px] font-semibold uppercase tracking-wider mt-0.5;
  @apply text-indigo-600 dark:text-indigo-400;
}

.user-dropdown-email {
  @apply text-xs mt-0.5 truncate;
  @apply text-gray-400 dark:text-slate-500;
}

/* ─── Sign Out action (matches profile card spec) ─── */
.user-dropdown .dropdown-item-danger {
  @apply gap-2 px-3 py-2.5 transition-colors text-red-600 hover:text-red-600 hover:bg-red-50;
  @apply dark:text-red-400 dark:hover:bg-red-500/10;
  border-top: 1px solid;
  @apply border-gray-100 dark:border-slate-800;
  border-radius: 0;
  margin: 0;
}

/* ─── Dropdown backdrop ─── */
.dropdown-backdrop {
  @apply fixed inset-0 z-40 cursor-default;
  background: transparent;
}

/* ─── Responsive: top header on small screens ─── */
@media (max-width: 639px) {
  /* Flag-only language pill to save space on small screens */
  .lang-label {
    display: none;
  }

  .lang-flag-img {
    @apply w-5 h-3.5;
  }

  .lang-pill {
    @apply px-2.5 py-1.5;
  }

  /* Collapse breadcrumbs to the current page only */
  .breadcrumb-item:not(.breadcrumb-current),
  .breadcrumb-sep {
    display: none;
  }
}

/* ==========================================================
   REDUCED MOTION ACCESSIBILITY
   ========================================================== */

@media (prefers-reduced-motion: reduce) {
  .topbar-icon-btn,
  .lang-pill,
  .user-menu-btn,
  .dropdown-menu,
  .dropdown-item {
    transition: none !important;
  }

  .topbar-icon-btn:hover,
  .topbar-icon-btn:active,
  .lang-pill:active,
  .user-menu-btn:active,
  .dropdown-item:active {
    transform: none !important;
  }

  .dropdown-menu {
    animation: none;
  }

  .lang-chevron {
    transform: none !important;
  }

  .cart-count-badge {
    animation: none !important;
  }
}
`],
})
export class CashierLayoutComponent implements OnInit, OnDestroy {
  /** Tracks the current URL so the computed can react to route changes */
  currentUrl = signal('');

  /** ── Top header dropdown state ── */
  langMenuOpen = signal(false);
  userMenuOpen = signal(false);

  private routerSub: Subscription | null = null;

  /** Dynamic breadcrumb trail: e.g. Cashier › POS Sale */
  breadcrumbs = computed(() => {
    const path = this.currentUrl().split('?')[0];
    const lang = this.langService.currentLang();
    const trail: string[] = [lang === 'km' ? 'អ្នកគិតលុយ' : 'Cashier'];
    if (!path) return trail;

    const item = this.navItems.find(i =>
      path === i.route || path.startsWith(i.route + '/')
    );
    if (item) {
      trail.push(lang === 'km' ? item.labelKm : item.label);
    } else {
      // Fallback for unmapped routes: title-case the last path segment
      const segment = path.split('/').filter(Boolean).pop();
      if (segment) {
        trail.push(
          segment
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        );
      }
    }
    return trail;
  });

  constructor(
    public auth: AuthService,
    public langService: LanguageService,
    public cart: CartService,
    public theme: ThemeService,
    public navState: NavStateService,
    private alertService: AlertService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.currentUrl.set(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.currentUrl.set(e.urlAfterRedirects);
        this.closeMenus();
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  get navItems(): NavItem[] {
    return this.navState.navItems();
  }

  /** Navigate back to the admin home (Dashboard) route */
  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  /** ── Top header dropdown handlers ── */
  toggleLangMenu() {
    this.langMenuOpen.update(v => !v);
    this.userMenuOpen.set(false);
    this.cdr.markForCheck();
  }

  setLanguage(lang: AppLanguage) {
    this.langService.switchLanguage(lang);
    this.langMenuOpen.set(false);
    this.cdr.markForCheck();
  }

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
    this.langMenuOpen.set(false);
    this.cdr.markForCheck();
  }

  closeMenus() {
    this.langMenuOpen.set(false);
    this.userMenuOpen.set(false);
    this.cdr.markForCheck();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenus();
  }

  /** Human-readable label for the current user's role (localized) */    userRoleLabel = computed(() => {
        const role = this.auth.currentUser()?.role;
        if (role === 'admin') return this.langService.t('field.admin');
        return this.langService.t('field.cashier');
    });

  /** Sign out: close menus, clear auth state, return to login, and confirm via toast */
  logout() {
    this.closeMenus();
    this.auth.logout();
    this.alertService.success(this.langService.t('layout.loggedOut'));
  }
}

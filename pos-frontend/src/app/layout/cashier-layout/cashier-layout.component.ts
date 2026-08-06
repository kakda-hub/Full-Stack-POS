import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, HostListener, computed, signal, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageService, AppLanguage } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavStateService, NavItem } from '../../core/services/nav-state.service';
import { AlertService } from '../../core/services/alert.service';
import { counterAnimation, themeRotate } from '../../shared/animations/animations';

@Component({
  selector: 'app-cashier-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [counterAnimation, themeRotate],
  templateUrl: './cashier-layout.component.html',
  styleUrl: './cashier-layout.component.scss',
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

  /** Human-readable label for the current user's role (localized) */
  userRoleLabel = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (this.langService.currentLang() === 'km') {
      return role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'អ្នកគិតលុយ';
    }
    return role === 'admin' ? 'Admin' : 'Cashier';
  });

  /** Sign out: close menus, clear auth state, return to login, and confirm via toast */
  logout() {
    this.closeMenus();
    this.auth.logout();
    this.alertService.success(
      this.langService.currentLang() === 'km'
        ? 'បានចាកចេញដោយជោគជ័យ'
        : 'Successfully logged out'
    );
  }
}

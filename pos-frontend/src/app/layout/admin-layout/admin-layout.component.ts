import { Component, signal, computed, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/shared/auth.service';
import { LanguageService, AppLanguage } from '../../services/shared/language.service';
import { ThemeService } from '../../services/shared/theme.service';
import { NavStateService, NavItem } from '../../services/shared/nav-state.service';
import { PendingCountService } from '../../services/shared/pending-count.service';
import { AlertService } from '../../services/shared/alert.service';
import { fadeIn, themeRotate } from '../../shared/animations/animations';

@Component({
    selector: 'app-admin-layout',
    standalone: false,
    templateUrl: './admin-layout.component.html',
    styleUrl: './admin-layout.component.scss',
    animations: [fadeIn, themeRotate],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
    isCollapsed = signal(false);
    isMobileMenuOpen = signal(false);

    selectedMenu = signal<string>('');

    /** Tracks the current URL so the computed can react to route changes */
    currentUrl = signal('');

    /** ── Top header dropdown state ── */
    langMenuOpen = signal(false);
    userMenuOpen = signal(false);

    private routerSub: Subscription | null = null;

    /** ── Swipe-to-close gesture state ── */
    private swipeStartY = 0;
    private swipeCurrentY = 0;
    private isSwiping = false;
    swipeTranslateY = signal('translateY(0)');
    swipeTransition = signal('transform 0s linear');

    /** Cached pending Purchase Orders count — auto-refreshes every 30s via PendingCountService */
    pendingPoCount = computed(() => this.pendingCountService.count());

    /** The Management nav item */
    managementItem = computed(() =>
        this.navItems.find(item => item.route === '/settings')
    );

    /** All Management sub-routes (including the parent /settings) */
    managementSubRoutes = computed(() => {
        const mgmt = this.managementItem();
        if (!mgmt?.subMenus) return ['/settings'];
        return ['/settings', ...mgmt.subMenus.map(s => s.route)];
    });

    /** Whether the current route is any of the Management sub-pages */
    isManagementActive = computed(() =>
        this.managementSubRoutes().some(route => this.currentUrl().startsWith(route))
    );

    /** Dynamic breadcrumb trail: e.g. Admin › Management › User Management */
    breadcrumbs = computed(() => {
        const path = this.currentUrl().split('?')[0];
        const lang = this.langService.currentLang();
        const trail: string[] = [lang === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Admin'];
        if (!path) return trail;

        const item = this.navItems.find(i =>
            path === i.route || path.startsWith(i.route + '/')
        );
        if (item) {
            trail.push(lang === 'km' ? item.labelKm : item.label);
            const sub = item.subMenus?.find(s =>
                path === s.route || path.startsWith(s.route + '/')
            );
            if (sub) trail.push(lang === 'km' ? sub.labelKm : sub.label);
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
        public theme: ThemeService,
        public navState: NavStateService,
        public pendingCountService: PendingCountService,
        private alertService: AlertService,
        private router: Router,
    ) { }

    ngOnInit() {
        this.currentUrl.set(this.router.url);

        // Manually refresh on navigation (in case something changed)
        this.routerSub = this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(e => {
                this.currentUrl.set(e.urlAfterRedirects);
                this.pendingCountService.refresh();
                this.closeMenus();
            });
    }

    ngOnDestroy() {
        this.routerSub?.unsubscribe();
    }

    get navItems(): NavItem[] {
        return this.navState.navItems();
    }

    /** Find a nav item by route path */
    getNavItem(route: string): NavItem | undefined {
        return this.navItems.find(i => i.route === route);
    }

    /** Whether a nav item should appear in the mobile menu (skip tabbed items) */
    showInMobileMenu(route: string): boolean {
        return route !== '/sales' && route !== '/sales-history';
    }

    toggleSubMenu(item: NavItem) {
        this.selectedMenu.update(current => current === item.route ? '' : item.route);
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    toggleSidebar() {
        this.isCollapsed.update((val) => !val);
    }

    /** ── Top header dropdown handlers ── */
    toggleLangMenu() {
        this.langMenuOpen.update(v => !v);
        this.userMenuOpen.set(false);
    }

    setLanguage(lang: AppLanguage) {
        this.langService.switchLanguage(lang);
        this.langMenuOpen.set(false);
    }

    toggleUserMenu() {
        this.userMenuOpen.update(v => !v);
        this.langMenuOpen.set(false);
    }

    closeMenus() {
        this.langMenuOpen.set(false);
        this.userMenuOpen.set(false);
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

    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
        this.resetSwipe();
    }

    /** ── Swipe-to-close handlers ── */
    onSwipeStart(event: TouchEvent) {
        // Only swipe on the panel itself, not the overlay backdrop
        const target = event.target as HTMLElement;
        if (!target.closest('.mobile-menu-panel')) return;

        this.isSwiping = true;
        this.swipeStartY = event.touches[0].clientY;
        this.swipeCurrentY = this.swipeStartY;
        this.swipeTransition.set('transform 0s linear');
    }

    onSwipeMove(event: TouchEvent) {
        if (!this.isSwiping) return;

        this.swipeCurrentY = event.touches[0].clientY;
        const delta = this.swipeCurrentY - this.swipeStartY;

        // Only allow downward swipe, with resistance
        if (delta < 0) return;
        const resisted = delta * 0.4; // 60% resistance
        this.swipeTranslateY.set(`translateY(${resisted}px)`);
    }

    onSwipeEnd(_event: TouchEvent) {
        if (!this.isSwiping) return;
        this.isSwiping = false;

        const delta = this.swipeCurrentY - this.swipeStartY;
        if (delta > 100) {
            // Threshold exceeded — close
            this.swipeTransition.set('transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)');
            this.swipeTranslateY.set('translateY(100%)');
            setTimeout(() => this.closeMobileMenu(), 250);
        } else {
            // Snap back
            this.swipeTransition.set('transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)');
            this.swipeTranslateY.set('translateY(0)');
        }
    }

    private resetSwipe() {
        this.swipeTranslateY.set('translateY(0)');
        this.swipeTransition.set('transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)');
        this.isSwiping = false;
    }
}
import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavStateService, NavItem } from '../../core/services/nav-state.service';
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
    avatarError = signal(false);
    isMobileMenuOpen = signal(false);

    selectedMenu = signal<string>('');

    /** Tracks the current URL so the computed can react to route changes */
    currentUrl = signal('');

    private routerSub: Subscription | null = null;

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

    constructor(
        public auth: AuthService,
        public langService: LanguageService,
        public theme: ThemeService,
        public navState: NavStateService,
        private router: Router,
    ) { }

    ngOnInit() {
        // Initialize with the current URL
        this.currentUrl.set(this.router.url);

        // Subscribe to NavigationEnd events to keep currentUrl in sync
        this.routerSub = this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(e => {
                this.currentUrl.set(e.urlAfterRedirects);
            });
    }

    ngOnDestroy() {
        this.routerSub?.unsubscribe();
    }

    get navItems(): NavItem[] {
        return this.navState.navItems();
    }

    toggleSubMenu(item: NavItem) {
        this.selectedMenu.update(current => current === item.route ? '' : item.route);
    }

    collapseAll() {
        this.selectedMenu.set('');
    }

    onAvatarError() {
        this.avatarError.set(true);
    }

    toggleSidebar() {
        this.isCollapsed.update((val) => !val);
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
    }
}
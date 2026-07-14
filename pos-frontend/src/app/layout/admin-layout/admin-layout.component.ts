import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavStateService, NavItem } from '../../core/services/nav-state.service';
import { fadeIn } from '../../shared/animations/animations';

@Component({
    selector: 'app-admin-layout',
    standalone: false,
    templateUrl: './admin-layout.component.html',
    styleUrl: './admin-layout.component.scss',
    animations: [fadeIn],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
    isCollapsed = signal(false);
    avatarError = signal(false);

    selectedMenu = signal<string>('');

    /** Whether the 'More' full-screen overlay is visible */
    showMoreOverlay = signal(false);

    /** Tracks the current URL so the computed can react to route changes */
    currentUrl = signal('');

    private routerSub: Subscription | null = null;

    /** The 'More' nav item object containing all secondary nav items */
    moreItem = computed(() => 
        this.navItems.find(item => item.route === '/more')
    );

    /** The sub-items (Users, Categories, Permission) inside More */
    moreSubItems = computed(() => this.moreItem()?.subMenus || []);

    /** All More sub-routes (Users, Categories, Permission) */
    moreSubRoutes = computed(() =>
        this.moreSubItems().map(item => item.route)
    );

    /** Whether the current route is any of the More sub-pages */
    isMoreActive = computed(() => 
        this.moreSubRoutes().some(route => this.currentUrl().startsWith(route))
    );

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

    /** Toggle the full-screen More overlay */
    openMoreOverlay() {
        this.showMoreOverlay.set(true);
    }

    closeMoreOverlay() {
        this.showMoreOverlay.set(false);
    }

    /** Navigate to a sub-item from the More overlay */
    navigateTo(item: NavItem) {
        this.showMoreOverlay.set(false);
        this.router.navigate([item.route]);
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
}
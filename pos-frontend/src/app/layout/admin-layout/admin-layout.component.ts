import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { NavStateService, NavItem } from '../../core/services/nav-state.service';
import { PendingCountService } from '../../core/services/pending-count.service';
import { AvatarUploadDialogComponent } from '../../shared/components/avatar-upload-dialog/avatar-upload-dialog.component';
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

    constructor(
        public auth: AuthService,
        public langService: LanguageService,
        public theme: ThemeService,
        public navState: NavStateService,
        public pendingCountService: PendingCountService,
        private router: Router,
        private dialog: MatDialog,
    ) { }

    ngOnInit() {
        this.currentUrl.set(this.router.url);

        // Manually refresh on navigation (in case something changed)
        this.routerSub = this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(e => {
                this.currentUrl.set(e.urlAfterRedirects);
                this.pendingCountService.refresh();
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

    collapseAll() {
        this.selectedMenu.set('');
    }

    openAvatarDialog() {
        this.dialog.open(AvatarUploadDialogComponent, {
            width: '440px',
            maxWidth: '95vw',
            panelClass: 'avatar-upload-dialog-panel',
            disableClose: true,
            data: {
                currentAvatarUrl: this.auth.currentUser()?.avatarUrl || '',
                userName: this.auth.currentUser()?.name || 'User',
            },
        });
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
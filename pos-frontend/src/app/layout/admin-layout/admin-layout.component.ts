import { Component, signal } from '@angular/core';
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
export class AdminLayoutComponent {
    isCollapsed = signal(false);

    selectedMenu = signal<string>('');

    constructor(
        public auth: AuthService,
        public langService: LanguageService,
        public theme: ThemeService,
        public navState: NavStateService,
    ) { }

    get navItems(): NavItem[] {
        return this.navState.navItems();
    }

    toggleSubMenu(item: NavItem) {
        this.selectedMenu.update(current => current === item.route ? '' : item.route);
    }

    collapseAll() {
        this.selectedMenu.set('');
    }

    toggleSidebar() {
        this.isCollapsed.update((val) => !val);
    }
}
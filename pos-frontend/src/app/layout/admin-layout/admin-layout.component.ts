import { Component, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
    label: string;
    labelKm: string;
    route: string;
    icon: string;
    subMenus?: NavItem[]; // optional nested sub-menu items
}

@Component({
    selector: 'app-admin-layout',
    standalone: false,
    templateUrl: './admin-layout.component.html',
    styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
    isCollapsed = signal(false);

    navItems: NavItem[] = [
        { label: 'Sales', labelKm: 'លក់', route: '/sales', icon: 'sale' },
        { label: 'Products', labelKm: 'ផលិតផល', route: '/products', icon: 'product' },
        { label: 'Reports', labelKm: 'របាយការណ៍', route: '/reports', icon: 'report' },
        { label: 'Users', labelKm: 'អ្នកប្រើ', route: '/users', icon: 'user' },
        { label: 'Categories', labelKm: 'ប្រភេទ', route: '/categories', icon: 'category' },
        { label: 'Permission', labelKm: 'ការអនុញ្ញាត', route: '/permission', icon: 'permission' },
        {
            label: 'Settings',
            labelKm: 'ការកំណត់',
            route: '/settings',
            icon: 'settings',
            subMenus: [
                { label: 'User Management', labelKm: 'ការគ្រប់គ្រងអ្នកប្រើ', route: '/user-management', icon: 'user' },
                { label: 'User Role', labelKm: 'តួនាទីអ្នកប្រើ', route: '/user-role', icon: 'role' },
            ]
        },
    ];

    selectedMenu = signal<string>('');

    constructor(
        public auth: AuthService,
        public langService: LanguageService,
        public theme: ThemeService,
    ) { }

    toggleSubMenu(item: NavItem) {
        this.selectedMenu.update(current => current === item.route ? '' : item.route);
    }

    toggleSidebar() {
        this.isCollapsed.update((val) => !val);
    }
}

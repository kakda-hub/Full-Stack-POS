import { Component, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
    label: string;
    labelKm: string;
    route: string;
    icon: string;
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
    ];

    constructor(
        public auth: AuthService,
        public langService: LanguageService,
        public theme: ThemeService,
    ) { }

    toggleSidebar() {
        this.isCollapsed.update((val) => !val);
    }
}

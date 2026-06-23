import { Injectable, signal } from '@angular/core';

export interface NavItem {
  label: string;
  labelKm: string;
  route: string;
  icon: string;
  subMenus?: NavItem[];
}

@Injectable({
  providedIn: 'root',
})
export class NavStateService {
  /** The canonical navigation items used by the sidebar */
  navItems = signal<NavItem[]>([
    { label: 'POS Sale', labelKm: 'លក់', route: '/sales', icon: 'sale' },
    { label: 'Sales History', labelKm: 'ប្រវត្តិលក់', route: '/sales-history', icon: 'history' },
    { label: 'Product', labelKm: 'ផលិតផល', route: '/products', icon: 'product' },
    { label: 'Report', labelKm: 'របាយការណ៍', route: '/reports', icon: 'report' },
    { label: 'User', labelKm: 'អ្នកប្រើ', route: '/users', icon: 'user' },
    { label: 'Categories', labelKm: 'ប្រភេទ', route: '/categories', icon: 'category' },
    { label: 'Permission', labelKm: 'ការអនុញ្ញាត', route: '/permission', icon: 'permission' },
    {
      label: 'Setting',
      labelKm: 'ការកំណត់',
      route: '/settings',
      icon: 'settings',
      subMenus: [
        { label: 'Page Permission Mgmt', labelKm: 'ការគ្រប់គ្រងការអនុញ្ញាតទំព័រ', route: '/page-permission-management', icon: 'permission' },
        { label: 'Management Page', labelKm: 'គ្រប់គ្រង់ទំព័រ', route: '/management-page', icon: 'management' },
        { label: 'User Management', labelKm: 'ការគ្រប់គ្រងអ្នកប្រើ', route: '/user-management', icon: 'user' },
        { label: 'User Role', labelKm: 'តួនាទីអ្នកប្រើ', route: '/user-role', icon: 'role' },
        { label: 'Cloudinary File Upload', labelKm: 'ការផ្ទុកឯកសារ Cloudinary', route: '/cloudinary-file-upload', icon: 'cloudinary' },
      ],
    },
  ]);

  /**
   * Dynamically add a new sub-menu item under a parent nav item.
   * Finds the parent by matching its label or labelKm (case-sensitive).
   * If the parent is found, the new item is pushed into its subMenus array.
   * The signal reactivity automatically updates the sidebar.
   */
  addPage(data: { label: string; labelKm: string; route: string; icon: string }, parentLabel: string): void {
    this.navItems.update(items =>
      items.map(item => {
        if (item.label === parentLabel || item.labelKm === parentLabel) {
          return {
            ...item,
            subMenus: [...(item.subMenus || []), {
              label: data.label,
              labelKm: data.labelKm,
              route: data.route,
              icon: data.icon,
            }],
          };
        }
        return item;
      })
    );
  }
}

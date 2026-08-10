import { Component, Input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

/**
 * Registered icon names - the single source of truth for the icon registry.
 * AppIconName is derived from it, and app-icon.component.spec.ts is typed
 * against AppIconName, so the compiler keeps the registry and NavItem.icon
 * in sync.
 *
 * Adding a new icon means:
 *  1. add a matching file `src/assets/icons/<name>.svg`, and
 *  2. register the name here.
 *
 * Each icon's artwork lives in a standalone SVG file under
 * `src/assets/icons/` (e.g. `logout.svg`, `chevron-down.svg`). The component
 * paints that file through a CSS mask over a `currentColor` background, so
 * icons keep inheriting color utilities (`text-*`, `dark:*`, hover states)
 * exactly like the previous inline SVG did.
 */
export const APP_ICON_NAMES = [
  '', // empty = no icon rendered (runtime fallback for unknown names)
  'logout',
  'sun',
  'moon',
  'chevron-down',
  'chevron-right',
  'chevron-left',
  'chevron-down-solid',
  'chevron-right-bold',
  'check',
  'check-circle',
  'menu',
  'menu-rows',
  'panel-collapse',
  'panel-expand',
  'dashboard',
  'sale',
  'product',
  'report',
  'history',
  'user',
  'user-circle',
  'user-hero',
  'user-email',
  'avatar-user',
  'users',
  'users-role',
  'category',
  'permission',
  'purchase-order',
  'supplier',
  'management',
  'settings',
  'cart',
  'orders',
  'x',
  'zap',
  'globe',
  'shopping-bag',
  'search',
  'sort',
  'sort-asc',
  'sort-desc',
  'edit',
  'trash',
  'trash-detail',
  'box',
  'camera',
  'upload',
  'upload-tray',
  'upload-cloud',
  'plus',
  'plus-bold',
  'image',
  'alert',
  'info',
  'eye',
  'eye-off',
  'lock',
  'arrow-left',
  'money',
  'banknote',
  'document',
  'doc',
  'folder',
  'star',
  'star-outline',
  'shield',
  'credit-card',
  'calendar',
  'refresh',
  'refresh-alt',
  'tag',
  'save',
  'cloud',
  'cloud-upload',
  'filter',
  'copy',
  'link',
  'print',
] as const;

/** Every icon name supported by the icon registry (files in assets/icons/). */
export type AppIconName = (typeof APP_ICON_NAMES)[number];

/**
 * Fallback for unknown/dynamic icon strings (e.g. icons coming from a backend
 * or user input). Returns '' when the name isn't registered, so the icon
 * renders empty instead of requesting a missing asset.
 */
export function asAppIconName(value: string): AppIconName {
  return (APP_ICON_NAMES as readonly string[]).includes(value)
    ? (value as AppIconName)
    : '';
}

@Component({
  selector: 'app-icon',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-icon.component.html',
  styleUrl: './app-icon.component.scss',
})
export class AppIconComponent {
  /** Icon to render - supported names are defined by the icon registry */
  @Input() name: AppIconName = '';

  /** Tailwind size classes applied to the rendered element, e.g. 'w-4 h-4' */
  @Input() svgClass: string = 'w-5 h-5';

  /**
   * CSS mask style referencing the icon's asset file:
   * `url('assets/icons/<name>.svg') no-repeat center / contain`.
   * Unknown/empty names produce 'none' - the span is then hidden via
   * `visibility` so no solid color box is painted.
   */
  get maskStyle(): string {
    const iconName = asAppIconName(this.name);
    return iconName
      ? `url('assets/icons/${iconName}.svg') no-repeat center / contain`
      : 'none';
  }

  /** Whether a registered icon is being rendered (controls visibility). */
  get isIconVisible(): boolean {
    return asAppIconName(this.name) !== '';
  }
}

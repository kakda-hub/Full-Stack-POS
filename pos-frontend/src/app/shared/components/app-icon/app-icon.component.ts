import { Component, Input } from '@angular/core';

/**
 * Registered icon names — the single source of truth for the icon registry.
 * AppIconName is derived from it, and app-icon.component.spec.ts is typed
 * against AppIconName, so the compiler keeps the registry, the spec table,
 * and NavItem.icon in sync. Adding a new icon means: add it here, add a
 * `@case` to the template @switch, and add a shape-count entry to the spec.
 */
export const APP_ICON_NAMES = [
  '', // empty = no icon rendered (runtime fallback for unknown names)
  'logout',
  'sun',
  'moon',
  'chevron-down',
  'chevron-right',
  'check',
  'menu',
  'panel-collapse',
  'panel-expand',
  'dashboard',
  'sale',
  'product',
  'report',
  'history',
  'user',
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
] as const;

/** Every icon name supported by the @switch in app-icon.component.html. */
export type AppIconName = (typeof APP_ICON_NAMES)[number];

/**
 * Fallback for unknown/dynamic icon strings (e.g. icons coming from a backend
 * or user input). Returns '' when the name isn't registered, so the icon
 * renders empty instead of throwing.
 */
export function asAppIconName(value: string): AppIconName {
  return (APP_ICON_NAMES as readonly string[]).includes(value)
    ? (value as AppIconName)
    : '';
}

@Component({
  selector: 'app-icon',
  standalone: false,
  templateUrl: './app-icon.component.html',
  styleUrl: './app-icon.component.scss',
})
export class AppIconComponent {
  /** Icon to render — supported names are defined by the @switch in app-icon.component.html */
  @Input() name: AppIconName = '';

  /** Tailwind size classes applied to the inner SVG, e.g. 'w-4 h-4' */
  @Input() svgClass: string = 'w-5 h-5';
}

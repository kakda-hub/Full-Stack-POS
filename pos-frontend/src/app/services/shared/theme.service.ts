import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>(this.loadTheme());
  currentTheme = this._theme.asReadonly();

  isDark = () => this._theme() === 'dark';

  constructor() {
    // Add .theme-ready after a microtask to prevent flash of transition on initial load
    queueMicrotask(() => {
      document.documentElement.classList.add('theme-ready');
    });

    effect(() => {
      const theme = this._theme();
      const html = document.documentElement;
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      localStorage.setItem('pos_theme', theme);
    });
  }

  toggle(): void {
    this._theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem('pos_theme') as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

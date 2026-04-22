import { Component } from '@angular/core';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <router-outlet></router-outlet>
    <app-alert-host></app-alert-host>
  `,
})
export class App {
  constructor(
    private langService: LanguageService,
    private themeService: ThemeService,
  ) {}
}

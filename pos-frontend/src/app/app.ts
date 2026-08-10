import { Component } from '@angular/core';
import { LanguageService } from './services/shared/language.service';
import { ThemeService } from './services/shared/theme.service';

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

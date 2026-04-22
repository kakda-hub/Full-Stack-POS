import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'km';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _lang = signal<AppLanguage>(this.loadLang());
  currentLang = this._lang.asReadonly();

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'km']);
    this.translate.setDefaultLang('en');
    this.translate.use(this._lang());
  }

  switchLanguage(lang: AppLanguage): void {
    this._lang.set(lang);
    this.translate.use(lang);
    localStorage.setItem('pos_lang', lang);
    document.documentElement.lang = lang;
  }

  toggle(): void {
    this.switchLanguage(this._lang() === 'en' ? 'km' : 'en');
  }

  private loadLang(): AppLanguage {
    return (localStorage.getItem('pos_lang') as AppLanguage) || 'en';
  }
}

import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import en from '../../assets/i18n/en.json';
import km from '../../assets/i18n/km.json';

/**
 * Shared i18n test doubles for components that use `LanguageService` and/or
 * `TranslateService`.
 *
 * Unlike a key-pass-through stub, these mocks resolve **real translations**
 * from `src/assets/i18n/{en,km}.json` (with `{{param}}` interpolation), so
 * specs can assert on actual rendered copy — including Khmer after `setLang`.
 *
 * Returns:
 *  - `langMock`             — stands in for `LanguageService`
 *                             (`currentLang()`, `t(key, params?)`).
 *  - `translateServiceMock` — minimal `@ngx-translate/core` TranslateService
 *                             stub backed by the same dictionaries.
 *  - `setLang(lang)`        — switch the mock language (reassigns
 *                             `langMock.currentLang`, so it works even after a
 *                             spec reassigns the property itself).
 */
export function createI18nMocks() {
  const dictionaries: Record<string, Record<string, unknown>> = { en, km };

  function getNested(dict: unknown, key: string): unknown {
    let cur: any = dict;
    for (const part of key.split('.')) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[part];
    }
    return cur;
  }

  function interpolate(template: string, params?: Record<string, unknown>): string {
    if (!params) return template;
    return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
      params[name] !== undefined ? String(params[name]) : `{{${name}}}`,
    );
  }

  function resolve(lang: string, key: string, params?: Record<string, unknown>): string {
    const raw = getNested(dictionaries[lang], key);
    if (typeof raw !== 'string') return key;
    return interpolate(raw, params);
  }

  const langMock = {
    currentLang: () => 'en',
    t: (key: string, params?: Record<string, unknown>) =>
      resolve(langMock.currentLang(), key, params),
  };

  const translateServiceMock = {
    get: vi.fn((key: string, params?: Record<string, unknown>) =>
      of(resolve(langMock.currentLang(), key, params)),
    ),
    instant: vi.fn((key: string, params?: Record<string, unknown>) =>
      resolve(langMock.currentLang(), key, params),
    ),
    currentLang: 'en',
    defaultLang: 'en',
    getCurrentLang: vi.fn(() => langMock.currentLang()),
    getFallbackLang: vi.fn(() => 'en'),
    onTranslationChange: new EventEmitter(),
    onLangChange: new EventEmitter(),
    onFallbackLangChange: new EventEmitter(),
  };

  return {
    langMock,
    translateServiceMock,
    setLang(lang: 'en' | 'km') {
      langMock.currentLang = () => lang;
      translateServiceMock.currentLang = lang;
    },
  };
}

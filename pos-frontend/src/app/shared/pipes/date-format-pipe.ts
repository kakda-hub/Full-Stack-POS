import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateFormat',
  standalone: false,
  pure: false // Set to false so it updates immediately when the language changes
})
export class DateFormatPipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(value: Date | string | number, format: 'short' | 'medium' | 'long' = 'medium'): string | null {
    if (!value) return null;

    const date = new Date(value);
    if (isNaN(date.getTime())) return null;

    const locale = this.translate.currentLang === 'km' ? 'km-KH' : 'en-GB';
    
    // We can use Intl for a cleaner implementation
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
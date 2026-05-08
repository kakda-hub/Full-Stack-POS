import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateFormat',
  standalone: false,
  pure: false // Set to false so it updates immediately when the language changes
})
export class DateFormatPipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(value: Date | string | number): string | null {
    if (!value) return null;

    const date = new Date(value);
    if (isNaN(date.getTime())) return null;

    const currentLang = this.translate.currentLang || 'en';

    if (currentLang === 'km') {
      // Option A: Full Khmer Date (e.g., ១៥ តុលា ២០២៣)
      // return new Intl.DateTimeFormat('km-KH', { dateStyle: 'long' }).format(date);

      // Option B: DD/MM/YYYY in Khmer digits (e.g., ១៥/១០/២០២៣)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      return this.toKhmerDigits(formattedDate);
    } else {
      // English Format (15/10/2023)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  // Helper to convert 0-9 to ០-៩
  private toKhmerDigits(str: string): string {
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return str.replace(/[0-9]/g, (digit) => khmerNumbers[parseInt(digit)]);
  }
}
import { Pipe, PipeTransform } from '@angular/core';
import { parseNumber, formatCurrency } from '../helpers/number.helper';

@Pipe({
  name: 'appNumber',
  standalone: false,
})
export class FormatNumberPipe implements PipeTransform {
  /**
   * Transforms a value to a formatted number.
   *
   * Usage in templates:
   *   {{ po.total | appNumber }}           → "123.45"
   *   {{ po.total | appNumber:'currency' }} → "$123.45"
   *   {{ po.total | appNumber:'decimal':2 }} → "123.46"
   *
   * @param value   - The value to format
   * @param format  - 'decimal' (default) or 'currency'
   * @param digits  - Number of decimal places (default: 2)
   * @returns Formatted string, or '0.00' / '$0.00' on failure
   */
  transform(
    value: unknown,
    format: 'decimal' | 'currency' = 'decimal',
    digits = 2,
  ): string {
    const num = parseNumber(value);
    if (format === 'currency') {
      return formatCurrency(num);
    }
    return num.toFixed(digits);
  }
}

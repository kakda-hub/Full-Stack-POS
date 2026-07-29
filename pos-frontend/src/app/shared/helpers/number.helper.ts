/**
 * Safely parses a value to a number.
 * Handles values that come from MySQL DECIMAL fields (returned as strings by mysql2).
 *
 * Usage in components:
 *   const total = parseNumber(po.total);
 *   const price = parseNumber(item.price, 0);
 *
 * @param value  - The value to parse (string, number, null, undefined)
 * @param fallback - Default value if parsing fails (default: 0)
 * @returns A valid number
 */
export function parseNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return Number.isNaN(value) ? fallback : value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Safely formats a numeric value as a currency string.
 * Parses the value first, then formats with toFixed(2).
 *
 * Usage in templates (via pipe) or in component code:
 *   `$${formatCurrency(po.total)}`
 *
 * @param value  - The value to format (string, number, null, undefined)
 * @param symbol - Currency symbol (default: '$')
 * @returns Formatted string like "$123.45"
 */
export function formatCurrency(value: unknown, symbol = '$'): string {
  return `${symbol}${parseNumber(value).toFixed(2)}`;
}

/**
 * Maps an array of objects and parses specified numeric fields.
 * Useful in service/component methods that fetch data from the API.
 *
 * Usage:
 *   const orders = parseNumericFields(response.data, ['total', 'subtotal', 'discount']);
 *
 * @param items  - Array of objects from API
 * @param fields - Array of field names to parse as numbers
 * @returns A new array with parsed numeric fields
 */
export function parseNumericFields<T extends Record<string, any>>(
  items: T[],
  fields: (keyof T)[],
): T[] {
  return (items || []).map((item) => {
    const parsed = { ...item };
    for (const field of fields) {
      if (field in parsed) {
        (parsed as any)[field] = parseNumber(parsed[field]);
      }
    }
    return parsed;
  });
}

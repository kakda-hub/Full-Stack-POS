export type SortDirection = 'asc' | 'desc';

export interface SortState {
  sortBy: string;
  sort: SortDirection;
}

/**
 * Computes the next sort state when a column header is clicked:
 * - clicking a new column starts ascending (or descending for the fields
 *   listed in `descFirstFields`, typically dates/amounts)
 * - clicking the active column toggles asc <-> desc
 */
export function nextSort(
  currentBy: string,
  currentDir: SortDirection,
  field: string,
  descFirstFields: string[] = [],
): SortState {
  if (currentBy === field) {
    return { sortBy: field, sort: currentDir === 'asc' ? 'desc' : 'asc' };
  }
  return { sortBy: field, sort: descFirstFields.includes(field) ? 'desc' : 'asc' };
}

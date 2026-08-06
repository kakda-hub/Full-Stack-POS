/**
 * Standard query parameters for GET list endpoints:
 *   GET /api/v1/{resource}?search=&sortBy=&sort=&offset=&max=
 */
export interface ListQuery {
  search?: string;
  sortBy?: string;
  sort?: 'asc' | 'desc';
  offset?: number;
  max?: number;
  /** Inclusive start date (YYYY-MM-DD) — supported by the sales endpoint. */
  dateFrom?: string;
  /** Inclusive end date (YYYY-MM-DD) — supported by the sales endpoint. */
  dateTo?: string;
}

/**
 * Project-wide pagination defaults (offset-based):
 *   max = 10, offset = 0, sort = 'desc'
 *
 * `buildListParams()` applies these automatically whenever a value is missing,
 * so every list request is equivalent to:
 *   GET /api/v1/{resource}?max=10&offset=0&sort=desc
 */
export const DEFAULT_LIST_QUERY = Object.freeze({
  max: 10,
  offset: 0,
  sort: 'desc' as const,
});

/** Standard flat list response envelope (total at the top level, no nested meta). */
export interface ListResponse<T> {
  success: boolean;
  statusCode: number;
  data: T[];
  total: number;
  timestamp: string;
}

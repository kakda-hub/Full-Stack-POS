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
}

/** Standard flat list response envelope (total at the top level, no nested meta). */
export interface ListResponse<T> {
  success: boolean;
  statusCode: number;
  data: T[];
  total: number;
  timestamp: string;
}

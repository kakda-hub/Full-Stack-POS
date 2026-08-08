import { HttpParams } from '@angular/common/http';
import { ListQuery, DEFAULT_LIST_QUERY } from '../models/list-query';

/**
 * Builds HttpParams from a ListQuery — the standard way to send list queries.
 * GET requests never send a JSON body; only query params.
 *
 * Standard defaults are applied automatically (max=10, offset=0, sort=desc),
 * so every list request conforms to the project-wide pagination contract:
 *   GET /api/v1/{resource}?max=10&offset=0&sort=desc
 */
export function buildListParams(query?: ListQuery): HttpParams {
  let params = new HttpParams();
  if (!query) return params;

  if (query.search) params = params.set('search', query.search);
  if (query.sortBy) params = params.set('sortBy', query.sortBy);
  if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
  if (query.dateTo) params = params.set('dateTo', query.dateTo);
  params = params.set('sort', query.sort ?? DEFAULT_LIST_QUERY.sort);
  params = params.set('offset', String(query.offset ?? DEFAULT_LIST_QUERY.offset));
  params = params.set('max', String(query.max ?? DEFAULT_LIST_QUERY.max));

  return params;
}

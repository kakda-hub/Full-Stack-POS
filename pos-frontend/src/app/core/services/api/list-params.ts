import { HttpParams } from '@angular/common/http';
import { ListQuery } from '../../../models/list-query';

/**
 * Builds HttpParams from a ListQuery — the standard way to send list queries.
 * GET requests never send a JSON body; only query params.
 */
export function buildListParams(query?: ListQuery): HttpParams {
  let params = new HttpParams();
  if (!query) return params;

  if (query.search) params = params.set('search', query.search);
  if (query.sortBy) params = params.set('sortBy', query.sortBy);
  if (query.sort) params = params.set('sort', query.sort);
  if (query.offset !== undefined) params = params.set('offset', String(query.offset));
  if (query.max !== undefined) params = params.set('max', String(query.max));

  return params;
}

import { HttpParams } from '@angular/common/http';
import { buildListParams } from './list-params';
import { DEFAULT_LIST_QUERY, ListQuery } from '../models/list-query';

/** Flattens HttpParams into a plain record for readable assertions. */
function paramsToRecord(params: HttpParams): Record<string, string> {
  const record: Record<string, string> = {};
  for (const key of params.keys()) {
    record[key] = params.get(key) ?? '';
  }
  return record;
}

describe('buildListParams — standard list query builder', () => {
  it('applies the project defaults (max=10, offset=0, sort=desc) when nothing is provided', () => {
    expect(paramsToRecord(buildListParams({}))).toEqual({
      max: '10',
      offset: '0',
      sort: 'desc',
    });
  });

  it('produces the canonical initial request: ?max=10&offset=0&sort=desc', () => {
    const params = buildListParams({});
    const sorted = params
      .keys()
      .sort()
      .map((k) => `${k}=${params.get(k)}`)
      .join('&');
    expect(sorted).toBe('max=10&offset=0&sort=desc');
  });

  it('defaults match the DEFAULT_LIST_QUERY constant', () => {
    const params = buildListParams({});
    expect(params.get('max')).toBe(String(DEFAULT_LIST_QUERY.max));
    expect(params.get('offset')).toBe(String(DEFAULT_LIST_QUERY.offset));
    expect(params.get('sort')).toBe(DEFAULT_LIST_QUERY.sort);
  });

  it('lets explicit values override the defaults', () => {
    expect(paramsToRecord(buildListParams({ max: 25, offset: 20, sort: 'asc' }))).toEqual({
      max: '25',
      offset: '20',
      sort: 'asc',
    });
  });

  it('preserves an explicit offset of 0 (0 is not replaced by the default)', () => {
    expect(buildListParams({ offset: 0, max: 5 }).get('offset')).toBe('0');
  });

  it('sends optional params only when they are truthy', () => {
    const params = paramsToRecord(
      buildListParams({
        search: 'coca',
        sortBy: 'name',
        dateFrom: '2026-08-01',
        dateTo: '2026-08-31',
      }),
    );
    expect(params).toEqual({
      search: 'coca',
      sortBy: 'name',
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
      max: '10',
      offset: '0',
      sort: 'desc',
    });
  });

  it('skips empty-string and undefined optional params', () => {
    const query: ListQuery = {
      search: '',
      sortBy: undefined,
      dateFrom: '',
      dateTo: undefined,
    };
    expect(paramsToRecord(buildListParams(query))).toEqual({
      max: '10',
      offset: '0',
      sort: 'desc',
    });
  });

  it('returns empty params when no query is given (backend defaults rule)', () => {
    expect(paramsToRecord(buildListParams(undefined))).toEqual({});
  });

  it('never emits a `page` parameter (offset-based standard)', () => {
    const params = buildListParams({ offset: 30, max: 10 });
    expect(params.has('page')).toBe(false);
    expect(params.get('offset')).toBe('30');
  });

  it('matches the documented contract used by list pages (e.g. sales-history page 2)', () => {
    const params = paramsToRecord(
      buildListParams({
        search: 'sok',
        sortBy: 'createdAt',
        sort: 'desc',
        offset: 15,
        max: 15,
        dateFrom: '2026-08-01',
        dateTo: '2026-08-06',
      }),
    );
    expect(params).toEqual({
      search: 'sok',
      sortBy: 'createdAt',
      sort: 'desc',
      offset: '15',
      max: '15',
      dateFrom: '2026-08-01',
      dateTo: '2026-08-06',
    });
  });
});

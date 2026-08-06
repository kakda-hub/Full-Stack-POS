import { DEFAULT_LIST_QUERY } from './list-query';

describe('DEFAULT_LIST_QUERY — project-wide pagination standard', () => {
  it('defaults to max=10, offset=0, sort=desc', () => {
    expect(DEFAULT_LIST_QUERY).toEqual({
      max: 10,
      offset: 0,
      sort: 'desc',
    });
  });

  it('uses offset-based pagination (no page concept)', () => {
    expect(DEFAULT_LIST_QUERY.offset).toBe(0);
    expect(DEFAULT_LIST_QUERY.max).toBe(10);
  });

  it('sorts descending by default', () => {
    expect(DEFAULT_LIST_QUERY.sort).toBe('desc');
  });

  it('is frozen so consumers cannot mutate the shared constant', () => {
    expect(Object.isFrozen(DEFAULT_LIST_QUERY)).toBe(true);
    expect(() => {
      (DEFAULT_LIST_QUERY as { max: number }).max = 100;
    }).toThrow();
    expect(DEFAULT_LIST_QUERY.max).toBe(10);
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { ProductService } from './product.service';
import { ApiEndpointEnum } from '../../enums/api-endpoint-enum';

describe('ProductService — server-side pagination + infinite scroll (POS grid)', () => {
  let service: ProductService;
  const getMock = vi.fn();

  const p = (id: number, over: Record<string, unknown> = {}) => ({
    id,
    name: `Product ${id}`,
    price: '1.00',
    barcode: `885-${id}`,
    stock: 10,
    categoryId: '1',
    ...over,
  });

  /** Standard flat envelope returned by the backend. */
  const page = (data: any[] = [], total: number = data.length) => ({
    success: true,
    statusCode: 200,
    data,
    total,
    timestamp: new Date().toISOString(),
  });

  /** Params of the Nth /products request, for assertion. */
  function productsCall(index: number) {
    const calls = getMock.mock.calls.filter((c: any[]) => c[0] === ApiEndpointEnum.PRODUCTS);
    return calls[index]?.[1].params as { get: (k: string) => string | null };
  }

  function productsRequestCount(): number {
    return getMock.mock.calls.filter((c: any[]) => c[0] === ApiEndpointEnum.PRODUCTS).length;
  }

  /** Queue of per-request Subjects so tests can defer/resolve responses. */
  function deferProducts(): Subject<any>[] {
    const subjects: Subject<any>[] = [];
    getMock.mockImplementation((url: string) => {
      if (url === ApiEndpointEnum.CATEGORIES) return of(page([]));
      const s = new Subject<any>();
      subjects.push(s);
      return s.asObservable();
    });
    return subjects;
  }

  /** Serve a scripted list of /products responses (one per request). */
  function scriptProducts(responses: any[]) {
    let i = 0;
    getMock.mockImplementation((url: string) => {
      if (url === ApiEndpointEnum.CATEGORIES) return of(page([]));
      return of(responses[Math.min(i++, responses.length - 1)]);
    });
  }

  beforeEach(() => {
    getMock.mockReset();
    // Default: categories empty; first products page empty so the service
    // boots cleanly. Tests override the products handler per scenario.
    getMock.mockImplementation((url: string) =>
      url === ApiEndpointEnum.CATEGORIES ? of(page([])) : of(page([])),
    );

    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: { get: getMock } }],
    });

    service = TestBed.inject(ProductService);
    // Forget the constructor's boot requests so tests count their own.
    getMock.mockClear();
  });

  // ─── Initial load ─────────────────────────────────────────────────────────
  describe('initial load', () => {
    it('requests the first page with max=10, offset=0 and the default sort', () => {
      scriptProducts([page([p(1), p(2)], 25)]);

      service.refreshProducts();

      const params = productsCall(0);
      expect(params.get('max')).toBe('10');
      expect(params.get('offset')).toBe('0');
      expect(params.get('sortBy')).toBe('name');
      expect(params.get('sort')).toBe('asc');
      expect(service.products().map((x) => x.id)).toEqual(['1', '2']);
      expect(service.total()).toBe(25);
      expect(service.hasMore()).toBe(true);
      expect(service.loading()).toBe(false);
    });

    it('exposes the grid list through filteredProducts (template surface)', () => {
      scriptProducts([page([p(1), p(2)], 25)]);

      service.refreshProducts();

      expect(service.filteredProducts()).toBe(service.products());
      expect(service.filteredProducts()).toHaveLength(2);
    });

    it('falls back to the page length when the response omits total', () => {
      scriptProducts([page([p(1), p(2), p(3)])]); // no `total` field

      service.refreshProducts();

      expect(service.total()).toBe(3);
      expect(service.hasMore()).toBe(false);
    });
  });

  // ─── Infinite scroll (loadMore) ───────────────────────────────────────────
  describe('infinite scroll', () => {
    it('appends the next page on loadMore (offset advances by page size)', () => {
      const first = Array.from({ length: 10 }, (_, i) => p(i + 1));
      const second = Array.from({ length: 10 }, (_, i) => p(i + 11));
      scriptProducts([page(first, 25), page(second, 25)]);

      service.refreshProducts();
      service.loadMore();

      expect(productsCall(1).get('offset')).toBe('10');
      expect(service.products()).toHaveLength(20);
      expect(service.hasMore()).toBe(true);
    });

    it('dedupes by id when pages overlap at the boundary', () => {
      const first = Array.from({ length: 10 }, (_, i) => p(i + 1));
      const second = Array.from({ length: 10 }, (_, i) => p(i + 10)); // id 10 repeats
      scriptProducts([page(first, 19), page(second, 19)]);

      service.refreshProducts();
      service.loadMore();

      expect(service.products()).toHaveLength(19);
      expect(new Set(service.products().map((x) => x.id)).size).toBe(19);
    });

    it('loads the partial final page and then stops requesting', () => {
      const first = Array.from({ length: 10 }, (_, i) => p(i + 1));
      const second = Array.from({ length: 10 }, (_, i) => p(i + 11));
      const last = Array.from({ length: 5 }, (_, i) => p(i + 21));
      scriptProducts([page(first, 25), page(second, 25), page(last, 25)]);

      service.refreshProducts();
      expect(service.products()).toHaveLength(10);
      expect(service.hasMore()).toBe(true);

      service.loadMore();
      expect(service.products()).toHaveLength(20);
      expect(service.hasMore()).toBe(true);

      service.loadMore();
      expect(service.products()).toHaveLength(25);
      expect(service.hasMore()).toBe(false);

      service.loadMore(); // must be a no-op
      expect(productsRequestCount()).toBe(3);
    });

    it('does not fire duplicate requests while a page is loading', () => {
      const subjects = deferProducts();

      service.refreshProducts();
      service.loadMore();
      service.loadMore();
      service.loadMore();

      // Only one in-flight request despite three scroll events.
      expect(subjects).toHaveLength(1);

      // Complete the in-flight page, then loadMore() is allowed again.
      subjects[0].next(page(Array.from({ length: 10 }, (_, i) => p(i + 1)), 30));
      service.loadMore();
      expect(subjects).toHaveLength(2);
    });

    it('toggles loadingMore while the next page is in flight', () => {
      const subjects = deferProducts();

      service.refreshProducts();
      subjects[0].next(page(Array.from({ length: 10 }, (_, i) => p(i + 1)), 30));
      expect(service.loadingMore()).toBe(false);

      service.loadMore();
      expect(service.loadingMore()).toBe(true);

      subjects[1].next(page(Array.from({ length: 10 }, (_, i) => p(i + 11)), 30));
      expect(service.loadingMore()).toBe(false);
      expect(service.products()).toHaveLength(20);
    });
  });

  // ─── Stop conditions ──────────────────────────────────────────────────────
  describe('stop conditions', () => {
    it('stops requesting when products.length >= total', () => {
      const first = Array.from({ length: 10 }, (_, i) => p(i + 1));
      scriptProducts([page(first, 10)]);

      service.refreshProducts();

      expect(service.products()).toHaveLength(10);
      expect(service.hasMore()).toBe(false);

      service.loadMore(); // must be a no-op
      expect(productsRequestCount()).toBe(1);
    });

    it('stops when the API returns an empty data array', () => {
      scriptProducts([page([], 0)]);

      service.refreshProducts();

      expect(service.products()).toHaveLength(0);
      expect(service.hasMore()).toBe(false);

      service.loadMore(); // must be a no-op
      expect(productsRequestCount()).toBe(1);
    });

    it('clears the grid and stops loading on a first-page error', () => {
      getMock.mockImplementation((url: string) =>
        url === ApiEndpointEnum.CATEGORIES ? of(page([])) : throwError(() => new Error('network down')),
      );

      service.refreshProducts();

      expect(service.products()).toHaveLength(0);
      expect(service.hasMore()).toBe(false);
      expect(service.loading()).toBe(false);
    });
  });

  // ─── Filters & resets ─────────────────────────────────────────────────────
  describe('filters & resets', () => {
    it('resets to offset=0 and sends search when the search query changes', () => {
      scriptProducts([page([p(1)], 1)]);

      service.refreshProducts();
      service.setSearch('cola');

      const last = productsCall(1);
      expect(last.get('offset')).toBe('0');
      expect(last.get('search')).toBe('cola');
      expect(service.products().map((x) => x.id)).toEqual(['1']);
      expect(service.searchQuery()).toBe('cola');
    });

    it('clears the loaded list while a reset reload is in flight', () => {
      const subjects = deferProducts();

      service.refreshProducts();
      subjects[0].next(page(Array.from({ length: 10 }, (_, i) => p(i + 1)), 10));

      service.setSearch('x');
      // Old rows are dropped immediately; the skeleton loading state returns.
      expect(service.products()).toHaveLength(0);
      expect(service.loading()).toBe(true);

      subjects[1].next(page([p(99)], 1));
      expect(service.products().map((x) => x.id)).toEqual(['99']);
      expect(service.loading()).toBe(false);
    });

    it('sends categoryId and resets offset when the category changes', () => {
      scriptProducts([page([p(1)], 1)]);

      service.refreshProducts();
      service.setCategory('2');

      const last = productsCall(1);
      expect(last.get('offset')).toBe('0');
      expect(last.get('categoryId')).toBe('2');
      expect(service.selectedCategory()).toBe('2');

      service.setCategory('all');
      const afterAll = productsCall(2);
      expect(afterAll.get('categoryId')).toBeNull();
    });

    it('does not reload when setSearch/setCategory receive the same value', () => {
      scriptProducts([page([p(1)], 1)]);

      service.refreshProducts();
      const before = productsRequestCount();

      service.setSearch('');
      service.setSearch('');
      service.setCategory('all');
      service.setCategory('all');

      expect(productsRequestCount()).toBe(before);
    });

    it('ignores stale responses after a filter reset (loadSeq guard)', () => {
      const subjects = deferProducts();

      service.refreshProducts(); // request 0 — in flight
      service.setSearch('x');    // request 1 — supersedes request 0

      // Newest request resolves first.
      subjects[1].next(page([p(1)], 1));
      // Old (stale) request resolves last with old-query data — must be ignored.
      subjects[0].next(page(Array.from({ length: 10 }, (_, i) => p(i + 50)), 100));

      expect(service.products().map((x) => x.id)).toEqual(['1']);
      expect(service.total()).toBe(1);
      expect(service.hasMore()).toBe(false);
    });
  });

  // ─── Full catalog (dashboard / reports KPIs) ──────────────────────────────
  describe('full catalog (stats consumers)', () => {
    const in30Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const expired = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const farFuture = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    it('loads the full catalog (max=100) into catalogProducts', () => {
      scriptProducts([page([p(1), p(2)], 2)]);

      service.loadCatalog();

      expect(productsCall(0).get('max')).toBe('100');
      expect(service.catalogProducts()).toHaveLength(2);
    });

    it('derives lowStockProducts from the catalog (stock <= threshold)', () => {
      scriptProducts([
        page([
          p(1, { stock: 3 }),              // low (default threshold 10)
          p(2, { stock: 20 }),             // ok
          p(3, { stock: 15, lowStockThreshold: 20 }), // low (custom threshold)
        ], 3),
      ]);

      service.loadCatalog();

      expect(service.lowStockProducts().map((x) => x.id)).toEqual(['1', '3']);
    });

    it('derives nearExpiryProducts from the catalog within a 30-day window', () => {
      scriptProducts([
        page([
          p(1, { expiryDate: in30Days }),   // within window
          p(2, { expiryDate: expired }),    // already expired — excluded
          p(3, { expiryDate: farFuture }),  // too far — excluded
          p(4, {}),                         // no expiry — excluded
        ], 4),
      ]);

      service.loadCatalog();

      expect(service.nearExpiryProducts().map((x) => x.id)).toEqual(['1']);
    });
  });

  // ─── Barcode lookup ───────────────────────────────────────────────────────
  describe('barcode lookup', () => {
    it('finds the product by exact barcode via the server fallback', () => {
      scriptProducts([page([p(1), p(2, { barcode: '885-999' })], 2)]);

      let found: any;
      service.findByBarcodeFromServer('885-999').subscribe((x) => (found = x));

      expect(productsCall(0).get('search')).toBe('885-999');
      expect(found?.id).toBe('2');
    });

    it('ignores LIKE false positives (name matches, barcode differs)', () => {
      // A product whose NAME contains the query but whose barcode differs must
      // NOT be returned — the lookup is an exact barcode match.
      scriptProducts([page([p(1, { name: '885-999 cola' })], 1)]);

      let found: any = 'sentinel';
      service.findByBarcodeFromServer('885-999').subscribe((x) => (found = x));

      expect(found).toBeUndefined();
    });

    it('returns undefined when no product matches', () => {
      scriptProducts([page([p(1)], 1)]);

      let found: any = 'sentinel';
      service.findByBarcodeFromServer('missing-barcode').subscribe((x) => (found = x));

      expect(found).toBeUndefined();
    });
  });
});

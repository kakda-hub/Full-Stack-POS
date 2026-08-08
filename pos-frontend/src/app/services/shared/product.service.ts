import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Category } from '../../models';
import { ApiEndpointEnum } from '../../enums/api-endpoint-enum';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { buildListParams } from '../list-params';

/**
 * POS product catalog service.
 *
 * The POS grid is loaded with **server-side offset pagination** (`PAGE_SIZE`
 * products per request) and appended via infinite scroll (`loadMore`). Search
 * and category are sent to the backend as `search` / `categoryId`, and the
 * response `total` drives when every product has been loaded.
 *
 * A separate lazy full-catalog fetch (`loadCatalog`) backs the dashboard /
 * reports KPIs (low-stock, near-expiry, product counts) which genuinely need
 * the whole catalog — it is only requested by those consumers.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Server-side page size used by the POS grid. */
  static readonly PAGE_SIZE = 10;

  private apiUrl = ApiEndpointEnum.PRODUCTS;
  private categoriesApiUrl = ApiEndpointEnum.CATEGORIES;

  // ── POS grid state (server-side pagination) ──────────────────────────────
  private _products = signal<Product[]>([]);
  private _offset = signal(0);
  private _total = signal(0);
  private _hasMore = signal(true);
  private _loadingMore = signal(false);
  /** Monotonic token — invalidates stale responses after search/category resets. */
  private loadSeq = 0;

  // ── Full-catalog state (dashboard / reports KPIs) ────────────────────────
  private _catalog = signal<Product[]>([]);

  // ── Filters & misc state ──────────────────────────────────────────────────
  private _searchQuery = signal<string>('');
  private _selectedCategory = signal<string>('all');
  private _loading = signal<boolean>(true);
  private _categories = signal<Category[]>([]);

  products = this._products.asReadonly();
  categories = this._categories.asReadonly();
  searchQuery = this._searchQuery.asReadonly();
  selectedCategory = this._selectedCategory.asReadonly();
  loading = this._loading.asReadonly();

  total = this._total.asReadonly();
  hasMore = this._hasMore.asReadonly();
  loadingMore = this._loadingMore.asReadonly();
  catalogProducts = this._catalog.asReadonly();

  /**
   * Products currently visible in the POS grid. Search + category are applied
   * server-side (see `buildQuery`), so this is effectively a pass-through that
   * keeps the template API stable.
   */
  filteredProducts = computed(() => this._products());

  lowStockProducts = computed(() =>
    this._catalog().filter(p => p.stock <= (p.lowStockThreshold || 10))
  );

  nearExpiryProducts = computed(() =>
    this._catalog().filter(p => {
      if (!p.expiryDate) return false;
      const expiry = new Date(p.expiryDate);
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      return expiry <= thirtyDays && expiry >= new Date();
    })
  );

  constructor(private http: HttpClient) {
    this.loadFirstPage();
    this.loadCategories();
  }

  // ── Query building ────────────────────────────────────────────────────────

  private buildQuery(offset: number) {
    const query: any = {
      search: this._searchQuery() || undefined,
      sortBy: 'name',
      sort: 'asc',
      offset,
      max: ProductService.PAGE_SIZE,
    };
    let params = buildListParams(query);
    const cat = this._selectedCategory();
    if (cat !== 'all') {
      params = params.set('categoryId', cat);
    }
    return params;
  }

  // ── POS grid loading (server-side pagination) ────────────────────────────

  /** Loads the first page (offset 0) and resets all pagination state. */
  private loadFirstPage(): void {
    this._loading.set(true);
    this._loadingMore.set(false);
    this._products.set([]);
    this._total.set(0);
    this._offset.set(0);
    this._hasMore.set(true);
    this.loadPage(0, false);
  }

  /** Resets pagination and reloads the first page. */
  refreshProducts(): void {
    this.loadFirstPage();
  }

  /**
   * Fetches the next page and appends it (infinite scroll). No-ops while a
   * request is already loading or when every product has been loaded.
   */
  loadMore(): void {
    if (
      this._loadingMore() ||
      this._loading() ||
      !this._hasMore() ||
      this._offset() >= this._total()
    ) {
      return;
    }
    this.loadPage(this._offset(), true);
  }

  /**
   * Fetches one server-side page. `append = true` adds it to the grid list
   * (used by infinite scroll); `false` replaces the list (first page / reset).
   */
  private loadPage(offset: number, append: boolean): void {
    if (append) {
      this._loadingMore.set(true);
    }
    const seq = ++this.loadSeq;
    const params = this.buildQuery(offset);
    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        if (seq !== this.loadSeq) {
          // Stale response — a reset superseded this request.
          if (append) this._loadingMore.set(false);
          return;
        }
        const raw = res?.data ?? res ?? [];
        const page: Product[] = raw.map((p: any) => this.mapApiProduct(p));
        const total = typeof res?.total === 'number' ? res.total : page.length;

        if (append) {
          this._products.update(list => {
            const seen = new Set(list.map(p => p.id));
            return [...list, ...page.filter(p => !seen.has(p.id))];
          });
        } else {
          this._products.set(page);
        }

        this._offset.set(offset + page.length);
        this._total.set(total);
        // Stop loading when the API returns an empty page or all products
        // (products.length >= total) have been loaded.
        this._hasMore.set(
          page.length > 0 &&
          this._products().length < total &&
          this._offset() < total
        );

        if (append) this._loadingMore.set(false);
        else this._loading.set(false);
      },
      error: (err) => {
        if (seq !== this.loadSeq) {
          if (append) this._loadingMore.set(false);
          return;
        }
        console.error('Failed to load products from API', err);
        if (append) {
          // Keep `hasMore` as-is so a later scroll can retry.
          this._loadingMore.set(false);
        } else {
          this._products.set([]);
          this._total.set(0);
          this._hasMore.set(false);
          this._loading.set(false);
        }
      },
    });
  }

  // ── Full catalog (dashboard / reports KPIs) ──────────────────────────────

  /**
   * Fetches the full catalog (max=100) for stats consumers that need every
   * product (dashboard KPIs, reports near-expiry list). Call from `ngOnInit`
   * of the consumers that need it — it is deliberately NOT part of the POS
   * grid boot path.
   */
  loadCatalog(): void {
    const params = buildListParams({ max: 100, sortBy: 'name', sort: 'asc' });
    this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => (res?.data ?? res ?? []).map((p: any) => this.mapApiProduct(p))),
      catchError(err => {
        console.error('Failed to load product catalog', err);
        return of([] as Product[]);
      }),
    ).subscribe(products => this._catalog.set(products));
  }

  // ── Categories ────────────────────────────────────────────────────────────

  private loadCategories(): void {
    const params = buildListParams({ max: 100, sortBy: 'name', sort: 'asc' });
    this.http.get<any>(this.categoriesApiUrl, { params }).pipe(
      map(res => {
        const rawCategories = res?.data ?? res ?? [];
        // Add "All" at the beginning
        const allCategory: Category = { id: 'all', name: 'All', nameKm: 'ទាំងអស់' };
        const mapped = rawCategories.map((c: any) => this.mapApiCategory(c));
        return [allCategory, ...mapped];
      }),
      tap(categories => {
        this._categories.set(categories);
      }),
      catchError(err => {
        console.error('Failed to load categories from API', err);
        return of([]);
      })
    ).subscribe();
  }

  // ── Mappers ───────────────────────────────────────────────────────────────

  private mapApiProduct(p: any): Product {
    return {
      id: String(p.id),
      name: p.name,
      nameKm: p.nameKh,
      price: Number(p.price),
      barcode: p.barcode,
      category: String(p.categoryId),
      stock: p.stock,
      imgUrl: p.imgUrl,
      lowStockThreshold: p.lowStockThreshold !== undefined ? Number(p.lowStockThreshold) : undefined,
      expiryDate: p.expiryDate || undefined,
      description: p.description,
    };
  }

  private mapApiCategory(c: any): Category {
    return {
      id: String(c.id),
      name: c.name,
      nameKm: c.nameKh,
    };
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  /**
   * Applies a search query and reloads from the first page. No-op when the
   * query did not change (avoids redundant requests, e.g. after a barcode scan
   * clears an already-empty search).
   */
  setSearch(query: string): void {
    const q = query ?? '';
    if (this._searchQuery() === q) return;
    this._searchQuery.set(q);
    this.loadFirstPage();
  }

  /** Applies a category filter and reloads from the first page. */
  setCategory(id: string): void {
    if (this._selectedCategory() === id) return;
    this._selectedCategory.set(id);
    this.loadFirstPage();
  }

  // ── Lookups ───────────────────────────────────────────────────────────────

  /** Local fast-path lookup over the products loaded so far. */
  findByBarcode(barcode: string): Product | undefined {
    return this._products().find(p => p.barcode === barcode);
  }

  /**
   * Server-side barcode lookup for products not yet loaded by the grid.
   * The backend `search` is a LIKE across name/nameKh/barcode, so the returned
   * page is narrowed to an exact barcode match.
   */
  findByBarcodeFromServer(barcode: string): Observable<Product | undefined> {
    const params = buildListParams({
      search: barcode,
      sortBy: 'name',
      sort: 'asc',
      offset: 0,
      max: ProductService.PAGE_SIZE,
    });
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => {
        const raw = res?.data ?? res ?? [];
        const products: Product[] = raw.map((p: any) => this.mapApiProduct(p));
        return products;
      }),
      map(products => products.find(p => p.barcode.trim() === barcode.trim())),
    );
  }

  // ── Refresh ───────────────────────────────────────────────────────────────

  refreshCategories(): void {
    this.loadCategories();
  }

  refreshAll(): void {
    this.loadFirstPage();
    this.loadCategories();
    this.loadCatalog();
  }

  // ── Local mutations ───────────────────────────────────────────────────────

  addProduct(product: Omit<Product, 'id'>): void {
    // This is handled by the admin product service; but for local state
    const id = Date.now().toString();
    const full = { ...product, id };
    this._products.update(p => [...p, full]);
    this._catalog.update(p => [...p, full]);
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this._products.update(p => p.map(prod => prod.id === id ? { ...prod, ...updates } : prod));
    this._catalog.update(p => p.map(prod => prod.id === id ? { ...prod, ...updates } : prod));
  }

  deleteProduct(id: string): void {
    this._products.update(p => p.filter(prod => prod.id !== id));
    this._catalog.update(p => p.filter(prod => prod.id !== id));
  }

  reduceStock(id: string, qty: number): void {
    this._products.update(p => p.map(prod =>
      prod.id === id ? { ...prod, stock: Math.max(0, prod.stock - qty) } : prod
    ));
    this._catalog.update(p => p.map(prod =>
      prod.id === id ? { ...prod, stock: Math.max(0, prod.stock - qty) } : prod
    ));
  }
}

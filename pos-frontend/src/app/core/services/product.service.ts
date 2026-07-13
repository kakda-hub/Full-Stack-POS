import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Category } from '../models';
import { ApiEndpointEnum } from '../models/enums/api-endpoint-enum';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = ApiEndpointEnum.PRODUCTS;
  private categoriesApiUrl = ApiEndpointEnum.CATEGORIES;

  private _products = signal<Product[]>([]);
  private _categories = signal<Category[]>([]);
  private _searchQuery = signal<string>('');
  private _selectedCategory = signal<string>('all');
  private _loading = signal<boolean>(true);

  products = this._products.asReadonly();
  categories = this._categories.asReadonly();
  searchQuery = this._searchQuery.asReadonly();
  selectedCategory = this._selectedCategory.asReadonly();
  loading = this._loading.asReadonly();

  filteredProducts = computed(() => {
    let result = this._products();
    if (this._selectedCategory() !== 'all') {
      result = result.filter(p => p.category === this._selectedCategory());
    }
    const q = this._searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        (p.nameKm || '').includes(q)
      );
    }
    return result;
  });

  lowStockProducts = computed(() =>
    this._products().filter(p => p.stock <= (p.lowStockThreshold || 10))
  );

  constructor(private http: HttpClient) {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(): void {
    this._loading.set(true);
    this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        const rawProducts = res?.data ?? res ?? [];
        return rawProducts.map((p: any) => this.mapApiProduct(p));
      }),
      tap(products => {
        this._products.set(products);
        this._loading.set(false);
      }),
      catchError(err => {
        console.error('Failed to load products from API', err);
        this._loading.set(false);
        return of([]);
      })
    ).subscribe();
  }

  private loadCategories(): void {
    this.http.get<any>(this.categoriesApiUrl).pipe(
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

  private mapApiProduct(p: any): Product {
    return {
      id: String(p.id),
      name: p.name,
      nameKm: p.nameKh,
      price: Number(p.price),
      barcode: p.barcode,
      category: String(p.categoryId), // Use category ID for filtering
      stock: p.stock,
      imgUrl: p.imgUrl,
      lowStockThreshold: p.stock <= 10 ? 10 : undefined,
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

  setSearch(query: string): void { this._searchQuery.set(query); }
  setCategory(id: string): void { this._selectedCategory.set(id); }

  findByBarcode(barcode: string): Product | undefined {
    return this._products().find(p => p.barcode === barcode);
  }

  refreshProducts(): void {
    this.loadProducts();
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  refreshAll(): void {
    this.loadProducts();
    this.loadCategories();
  }

  addProduct(product: Omit<Product, 'id'>): void {
    // This is handled by the admin product service; but for local state
    const id = Date.now().toString();
    this._products.update(p => [...p, { ...product, id }]);
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this._products.update(p => p.map(prod => prod.id === id ? { ...prod, ...updates } : prod));
  }

  deleteProduct(id: string): void {
    this._products.update(p => p.filter(prod => prod.id !== id));
  }

  reduceStock(id: string, qty: number): void {
    this._products.update(p => p.map(prod =>
      prod.id === id ? { ...prod, stock: Math.max(0, prod.stock - qty) } : prod
    ));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../../../enums/api-endpoint-enum';
import { ListQuery, ListResponse } from '../../../models/list-query';
import { buildListParams } from './list-params';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = ApiEndpointEnum.PRODUCTS;

  constructor(private http: HttpClient) { }

  /**
   * Get low-stock products (stock ≤ lowStockThreshold)
   */
  getLowStockProducts(threshold?: number): Observable<any> {
    const params = threshold ? `?threshold=${threshold}` : '';
    return this.http.get<any>(`${this.apiUrl}/low-stock${params}`).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Get all products (server-side paginated). Defaults to the full catalog
   * (up to max=100) for client-side consumers.
   */
  getAllProducts(query?: ListQuery): Observable<any[]> {
    const params = buildListParams(query ?? { max: 100, sortBy: 'name', sort: 'asc' });
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Get a server-side paginated page of products, returning the full standard
   * envelope ({ data, total }) so consumers can drive real pagination.
   * `categoryId` is the optional resource-specific filter for this endpoint.
   */
  getProducts(query?: ListQuery & { categoryId?: number | string }): Observable<ListResponse<any>> {
    let params = buildListParams(query);
    if (query?.categoryId !== undefined && query.categoryId !== null && query.categoryId !== '') {
      params = params.set('categoryId', String(query.categoryId));
    }
    return this.http.get<ListResponse<any>>(this.apiUrl, { params });
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Create a new product
   */
  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Update a product
   */
  updateProduct(id: number, product: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, product).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = ApiEndpointEnum.PRODUCTS;

  constructor(private http: HttpClient) { }

  /**
   * Get all products
   */
  getAllProducts(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res) => res?.data ?? res)
    );
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/v1/products'; // Backend API URL

  constructor(private http: HttpClient) { }

  /**
   * Get all products
   */
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new product
   */
  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  /**
   * Update a product
   */
  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search products by name or barcode
   */
  searchProducts(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?query=${query}`);
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(threshold: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/low-stock?threshold=${threshold}`);
  }
}

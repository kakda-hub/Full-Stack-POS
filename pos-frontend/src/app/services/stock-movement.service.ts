import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';

export interface StockMovementQuery {
  productId?: number;
  type?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class StockMovementService {
  private apiUrl = ApiEndpointEnum.STOCK_MOVEMENTS;

  constructor(private http: HttpClient) {}

  /**
   * Get all stock movements (paginated, filterable)
   */
  getAll(query?: StockMovementQuery): Observable<any> {
    const params: any = {};
    if (query?.productId) params.productId = query.productId;
    if (query?.type) params.type = query.type;
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Get stock movements for a specific product
   */
  getByProduct(productId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/product/${productId}`).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Human-readable label for movement type
   */
  static getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      sale: 'Sale',
      purchase: 'Purchase',
      return: 'Return',
      adjustment: 'Adjustment',
      damaged: 'Damaged',
    };
    return labels[type] || type;
  }

  /**
   * Khmer label for movement type
   */
  static getTypeLabelKm(type: string): string {
    const labels: Record<string, string> = {
      sale: 'លក់',
      purchase: 'ទិញចូល',
      return: 'ត្រឡប់',
      adjustment: 'កែតម្រូវ',
      damaged: 'ខូចខាត',
    };
    return labels[type] || type;
  }

  /**
   * CSS class for movement type badge
   */
  static getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      sale: 'type-badge--sale',
      purchase: 'type-badge--purchase',
      return: 'type-badge--return',
      adjustment: 'type-badge--adjustment',
      damaged: 'type-badge--damaged',
    };
    return classes[type] || '';
  }

  /**
   * Available movement types for filtering
   */
  static readonly MOVEMENT_TYPES = [
    'sale',
    'purchase',
    'return',
    'adjustment',
    'damaged',
  ];
}

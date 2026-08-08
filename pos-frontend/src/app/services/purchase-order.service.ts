import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';
import { ListQuery } from '../models/list-query';
import { buildListParams } from './list-params';
import { parseNumericFields } from '../shared/helpers/number.helper';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private apiUrl = ApiEndpointEnum.PURCHASE_ORDERS;

  constructor(private http: HttpClient) {}

  /** Parse numeric fields that MySQL DECIMAL returns as strings */
  private mapPO(po: any): any {
    if (!po) return po;
    return parseNumericFields([po], ['total', 'subtotal', 'discount', 'shippingCost'])[0];
  }

  /** Get the count of pending (non-received, non-cancelled) purchase orders */
  getPendingCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/pending-count`).pipe(
      map((res) => res?.count ?? 0)
    );
  }

  /**
   * Get one server-side page of purchase orders plus the envelope total.
   * Standard offset-based list query: max/offset/sort/sortBy/search.
   */
  getAll(query?: ListQuery): Observable<{ data: any[]; total: number }> {
    const params = buildListParams(query);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => ({
        data: ((res?.data ?? []) as any[]).map((po: any) => this.mapPO(po)),
        total: res?.total ?? 0,
      })),
    );
  }

  /** Get a single purchase order by ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => this.mapPO(res?.data ?? res)),
    );
  }

  /** Create a new purchase order */
  create(dto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /** Receive a purchase order (updates stock) */
  receive(id: number, dto: { receivedBy: number; notes?: string }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/receive`, dto).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /** Cancel a purchase order */
  cancel(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
    );
  }
}

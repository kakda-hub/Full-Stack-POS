import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ApiEndpointEnum } from '../../models/enums/api-endpoint-enum';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private apiUrl = ApiEndpointEnum.PURCHASE_ORDERS;

  constructor(private http: HttpClient) {}

  /** Get all purchase orders (paginated) */
  getAll(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /** Get a single purchase order by ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
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

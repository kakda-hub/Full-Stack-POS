import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../../models/enums/api-endpoint-enum';

export interface CreateSaleItemDto {
  productId: number;
  quantity: number;
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[];
  discount?: number;
  tax?: number;
  paymentMethod?: 'cash' | 'aba' | 'card';
  customerId?: number;
  pointsRedeemed?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private apiUrl = ApiEndpointEnum.SALES;

  constructor(private http: HttpClient) {}

  /**
   * Create a new sale
   */
  createSale(dto: CreateSaleDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Get all sales
   */
  /** Convert numeric sale fields from strings to numbers */
  private mapSale(sale: any): any {
    if (!sale) return sale;
    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      tax: Number(sale.tax),
      total: Number(sale.total),
      pointsEarned: Number(sale.pointsEarned ?? 0),
      pointsRedeemed: Number(sale.pointsRedeemed ?? 0),
      loyaltyDiscount: Number(sale.loyaltyDiscount ?? 0),
      cashReceived: sale.cashReceived != null ? Number(sale.cashReceived) : undefined,
      change: sale.change != null ? Number(sale.change) : undefined,
      items: (sale.items ?? []).map((item: any) => ({
        ...item,
        price: Number(item.price),
      })),
    };
  }

  getAllSales(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res) => {
        const data = res?.data ?? res ?? [];
        return data.map((s: any) => this.mapSale(s));
      }),
    );
  }

  /**
   * Get a single sale by ID
   */
  getSaleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => this.mapSale(res?.data ?? res)),
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';

export interface CreateSaleItemDto {
  productId: number;
  quantity: number;
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[];
  discount?: number;
  tax?: number;
  paymentMethod?: 'cash' | 'aba' | 'card';
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
  getAllSales(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Get a single sale by ID
   */
  getSaleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
    );
  }
}

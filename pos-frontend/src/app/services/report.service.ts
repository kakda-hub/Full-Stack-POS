import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';

export interface ReportSummary {
  totalSales: number;
  totalRevenue: number;
  totalDiscount: number;
  averageOrderValue: number;
  lowStockProducts: { id: number; name: string; stock: number; barcode: string }[];
}

export interface PaymentSummaryEntry {
  paymentMethod: string;
  totalTransactions: number;
  totalRevenue: number;
}

export interface DailyRevenueEntry {
  date: string;
  totalSales: number;
  revenue: number;
  totalDiscount: number;
  totalTax: number;
}

export interface TopProductEntry {
  productId: number;
  productName: string;
  barcode: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface SalesByCashierEntry {
  userId: number;
  cashierName: string;
  totalSales: number;
  totalRevenue: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseUrl = ApiEndpointEnum.REPORTS;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/reports/summary?from=&to=
   */
  /** Convert numeric report fields from strings to numbers */
  private mapSummary(raw: any): ReportSummary {
    if (!raw) return raw;
    return {
      ...raw,
      totalSales: Number(raw.totalSales),
      totalRevenue: Number(raw.totalRevenue),
      totalDiscount: Number(raw.totalDiscount),
      averageOrderValue: Number(raw.averageOrderValue),
      lowStockProducts: (raw.lowStockProducts ?? []).map((p: any) => ({
        ...p,
        stock: Number(p.stock),
      })),
    };
  }

  getSummary(from?: string, to?: string): Observable<ReportSummary> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http
      .get<any>(`${this.baseUrl}/summary`, { params })
      .pipe(map((res) => this.mapSummary(res?.data ?? res)));
  }

  /**
   * GET /api/v1/reports/payment-summary?from=&to=
   */
  getPaymentSummary(
    from?: string,
    to?: string,
  ): Observable<PaymentSummaryEntry[]> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http
      .get<any>(`${this.baseUrl}/payment-summary`, { params })
      .pipe(map((res) => {
        const data = res?.data ?? res ?? [];
        return data.map((e: any) => ({ ...e, totalRevenue: Number(e.totalRevenue) }));
      }));
  }

  /**
   * GET /api/v1/reports/daily-revenue?from=&to=
   */
  getDailyRevenue(
    from?: string,
    to?: string,
  ): Observable<DailyRevenueEntry[]> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http
      .get<any>(`${this.baseUrl}/daily-revenue`, { params })
      .pipe(map((res) => {
        const data = res?.data ?? res ?? [];
        return data.map((e: any) => ({
          ...e,
          revenue: Number(e.revenue),
          totalDiscount: Number(e.totalDiscount),
          totalTax: Number(e.totalTax),
          totalSales: Number(e.totalSales),
        }));
      }));
  }

  /**
   * GET /api/v1/reports/top-products?limit=&from=&to=
   */
  getTopProducts(
    limit: number = 5,
    from?: string,
    to?: string,
  ): Observable<TopProductEntry[]> {
    const params: Record<string, string> = { limit: String(limit) };
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http
      .get<any>(`${this.baseUrl}/top-products`, { params })
      .pipe(map((res) => {
        const data = res?.data ?? res ?? [];
        return data.map((e: any) => ({
          ...e,
          totalQuantitySold: Number(e.totalQuantitySold),
          totalRevenue: Number(e.totalRevenue),
        }));
      }));
  }

  /**
   * GET /api/v1/reports/sales-by-cashier?from=&to=
   */
  getSalesByCashier(
    from?: string,
    to?: string,
  ): Observable<SalesByCashierEntry[]> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http
      .get<any>(`${this.baseUrl}/sales-by-cashier`, { params })
      .pipe(map((res) => {
        const data = res?.data ?? res ?? [];
        return data.map((e: any) => ({
          ...e,
          totalSales: Number(e.totalSales),
          totalRevenue: Number(e.totalRevenue),
        }));
      }));
  }
}

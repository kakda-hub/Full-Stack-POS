import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';
import { ListQuery } from '../models/list-query';
import { buildListParams } from './list-params';
import { QuickPickItem } from '../models';

@Injectable({ providedIn: 'root' })
export class QuickPickService {
  private apiUrl = ApiEndpointEnum.QUICK_PICKS;

  constructor(private http: HttpClient) {}

  getAll(query?: ListQuery): Observable<QuickPickItem[]> {
    const params = buildListParams(query ?? { max: 100, sortBy: 'sortOrder', sort: 'asc' });
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => {
        const items: any[] = res?.data ?? res ?? [];
        return items.map((item) => ({
          ...item,
          price: Number(item.price),
        }));
      }),
    );
  }

  /**
   * Server-side paginated page (standard offset-based list query) plus the
   * envelope total — used by the quick-pick list table.
   */
  getPage(query?: ListQuery): Observable<{ data: QuickPickItem[]; total: number }> {
    const params = buildListParams(query);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => ({
        data: ((res?.data ?? []) as any[]).map((item) => ({
          ...item,
          price: Number(item.price),
        })),
        total: res?.total ?? 0,
      })),
    );
  }

  getById(id: number): Observable<QuickPickItem> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => {
        const item = res?.data ?? res;
        return { ...item, price: Number(item.price) };
      }),
    );
  }

  create(item: Partial<QuickPickItem>): Observable<QuickPickItem> {
    return this.http.post<any>(this.apiUrl, item).pipe(
      map((res) => res?.data ?? res)
    );
  }

  update(id: number, item: Partial<QuickPickItem>): Observable<QuickPickItem> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, item).pipe(
      map((res) => res?.data ?? res)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
    );
  }
}

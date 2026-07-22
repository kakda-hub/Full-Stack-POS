import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../../models/enums/api-endpoint-enum';
import { QuickPickItem } from '../../models';

@Injectable({ providedIn: 'root' })
export class QuickPickService {
  private apiUrl = ApiEndpointEnum.QUICK_PICKS;

  constructor(private http: HttpClient) {}

  getAll(): Observable<QuickPickItem[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res) => {
        const items: any[] = res?.data ?? res ?? [];
        return items.map((item) => ({
          ...item,
          price: Number(item.price),
        }));
      }),
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

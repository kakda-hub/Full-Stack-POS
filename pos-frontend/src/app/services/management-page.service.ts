import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';

export interface ManagementPage {
  id: number;
  title: string;
  titleKm: string;
  icon?: string;
  type?: string;
  url?: string;
  description?: string;
  permissions?: string[];
  badge?: number;
  sortOrder: number;
  isActive: boolean;
  parentId?: number;
  children?: ManagementPage[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ManagementPageService {
  private baseUrl = ApiEndpointEnum.MANAGEMENT;

  constructor(private http: HttpClient) {}

  /** Get all active pages sorted by sortOrder */
  getAll(): Observable<ManagementPage[]> {
    return this.http
      .get<any>(`${this.baseUrl}`)
      .pipe(map((res) => res?.data ?? res));
  }

  /** Get a single page by ID */
  getById(id: number): Observable<ManagementPage> {
    return this.http
      .get<any>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res?.data ?? res));
  }

  /** Create a new page */
  create(page: Partial<ManagementPage>): Observable<ManagementPage> {
    return this.http
      .post<any>(`${this.baseUrl}`, page)
      .pipe(map((res) => res?.data ?? res));
  }

  /** Update a page by ID */
  update(
    id: number,
    page: Partial<ManagementPage>,
  ): Observable<ManagementPage> {
    return this.http
      .patch<any>(`${this.baseUrl}/${id}`, page)
      .pipe(map((res) => res?.data ?? res));
  }

  /** Delete a page by ID */
  delete(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res?.data ?? res));
  }

}

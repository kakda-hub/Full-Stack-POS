import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../../../enums/api-endpoint-enum';
import { ListQuery } from '../../../models/list-query';
import { buildListParams } from './list-params';
import { Customer } from '../../../models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = ApiEndpointEnum.CUSTOMERS;

  constructor(private http: HttpClient) {}

  getAll(query?: ListQuery): Observable<Customer[]> {
    const params = buildListParams(query ?? { max: 100, sortBy: 'name', sort: 'asc' });
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => res?.data ?? res)
    );
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
    );
  }

  findByPhone(phone: string): Observable<Customer> {
    return this.http.get<any>(`${this.apiUrl}/phone/${encodeURIComponent(phone)}`).pipe(
      map((res) => res?.data ?? res)
    );
  }

  findOrCreateByPhone(phone: string, name?: string): Observable<Customer> {
    return this.http.post<any>(`${this.apiUrl}/phone/${encodeURIComponent(phone)}/find-or-create`, { name }).pipe(
      map((res) => res?.data ?? res)
    );
  }

  create(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<any>(this.apiUrl, customer).pipe(
      map((res) => res?.data ?? res)
    );
  }

  update(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, customer).pipe(
      map((res) => res?.data ?? res)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res?.data ?? res)
    );
  }

  addPoints(id: number, points: number): Observable<Customer> {
    return this.http.post<any>(`${this.apiUrl}/${id}/points/add`, { points }).pipe(
      map((res) => res?.data ?? res)
    );
  }

  redeemPoints(id: number, points: number): Observable<{ customer: Customer; discountValue: number }> {
    return this.http.post<any>(`${this.apiUrl}/${id}/points/redeem`, { points }).pipe(
      map((res) => res?.data ?? res)
    );
  }
}

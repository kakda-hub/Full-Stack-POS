import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiEndpointEnum } from '../../models/enums/api-endpoint-enum';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IRequestOptions } from './abstract-rest.service';

@Injectable({
  providedIn: 'root',
})
export class DynamicHttp {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // private buildUrl(endpoint: ApiEndpointEnum | string): string {
  //   return `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  // }

  private buildUrl(endpoint: ApiEndpointEnum | string): string {
    const endpointStr = String(endpoint);
    if (endpointStr.startsWith('http')) {
      return endpointStr; // already full URL
    }

    return `${this.baseUrl.replace(/\/$/, '')}/${endpointStr.replace(/^\//, '')}`;
  }

  get<T>(
    endpoint: ApiEndpointEnum | string,
    options?: IRequestOptions,
  ): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), options);
  }

  post<T>(
    endpoint: ApiEndpointEnum | string,
    body: unknown,
    options?: IRequestOptions,
  ): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, options);
  }

  put<T>(
    endpoint: ApiEndpointEnum | string,
    body: unknown,
    options?: IRequestOptions,
  ): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, options);
  }

  patch<T>(
    endpoint: ApiEndpointEnum | string,
    body: unknown,
    options?: IRequestOptions,
  ): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, options);
  }

  delete<T>(
    endpoint: ApiEndpointEnum | string,
    options?: IRequestOptions,
  ): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), options);
  }
}

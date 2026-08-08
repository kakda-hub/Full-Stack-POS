import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataResponse } from '../../models/data-response';
import { Observable } from 'rxjs';
import { DynamicHttp } from './dynamic-http.service';

export interface IRequestOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  withCredentials?: boolean;
  observe?: 'body';
  responseType?: 'json';
}

@Injectable({
  providedIn: 'root',
})

export abstract class AbstractRest {

  private readonly url: string;

  protected baseHeaders?: HttpHeaders;

  constructor(private httpCore: DynamicHttp) {
    this.url = this.getUrl();
  }

  abstract getUrl(): string;

  public list(options?: IRequestOptions): Observable<DataResponse> {
    return this.httpCore.get<DataResponse>(
      this.url,
      this.mapBaseHeaders(options)
    );
  }

  public get(id: number, options?: IRequestOptions): Observable<DataResponse> {
    return this.httpCore.get<DataResponse>(
      `${this.url}/${id}`,
      this.mapBaseHeaders(options)
    );
  }

  public save(body: any, options?: IRequestOptions): Observable<DataResponse> {
    return this.httpCore.post<DataResponse>(
      this.url,
      body,
      this.mapBaseHeaders(options)
    );
  }

  public update(id: number, body: any, options?: IRequestOptions): Observable<DataResponse> {
    return this.httpCore.put<DataResponse>(
      `${this.url}/${id}`,
      body,
      this.mapBaseHeaders(options)
    );
  }

  public patch(id: number, body: any, options?: IRequestOptions): Observable<DataResponse> {
    return this.httpCore.patch<DataResponse>(
      `${this.url}/${id}`,
      body,
      this.mapBaseHeaders(options)
    );
  }

  public delete(id: number, options?: IRequestOptions): Observable<DataResponse> {
    return this.httpCore.delete<DataResponse>(
      `${this.url}/${id}`,
      this.mapBaseHeaders(options)
    );
  }

  protected mapBaseHeaders(options?: IRequestOptions): IRequestOptions {
    const mergedOptions: IRequestOptions = {
      ...options,
      headers: options?.headers || new HttpHeaders()
    };

    if (this.baseHeaders) {
      this.baseHeaders.keys().forEach(key => {
        const value = this.baseHeaders?.get(key);
        if (value) {
          mergedOptions.headers = mergedOptions.headers?.set(key, value);
        }
      });
    }

    return mergedOptions;
  }

}

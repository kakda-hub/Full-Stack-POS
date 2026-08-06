import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractRest, IRequestOptions } from '../shared/abstract-rest.service';
import { ApiEndpointEnum } from '../../../enums/api-endpoint-enum';
import { DynamicHttp } from '../shared/dynamic-http.service';
import { DataResponse } from '../../../models/data-response';
import { buildListParams } from './list-params';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends AbstractRest {

  constructor(protected http: DynamicHttp) {
    super(http);
  }

  override getUrl(): string {
    return ApiEndpointEnum.CATEGORIES;
  }

  /**
   * List categories (server-side paginated). Defaults to the full set (max=100)
   * so client-side consumers keep working unchanged.
   */
  override list(options?: IRequestOptions): Observable<DataResponse> {
    const params = buildListParams({ max: 100, sortBy: 'name', sort: 'asc' });
    return super.list({ ...options, params: options?.params ?? params });
  }

  /**
   * Backend uses @Patch, so override update to use PATCH instead of PUT
   */
  override update(id: number, body: any): Observable<DataResponse> {
    return this.http.patch<DataResponse>(`${this.getUrl()}/${id}`, body);
  }

}
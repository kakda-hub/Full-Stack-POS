import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractRest } from './shared/abstract-rest.service';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';
import { DynamicHttp } from './shared/dynamic-http.service';
import { DataResponse } from '../core/models/data-response';

@Injectable({
  providedIn: 'root',
})
export class SupplierService extends AbstractRest {

  constructor(protected http: DynamicHttp) {
    super(http);
  }

  override getUrl(): string {
    return ApiEndpointEnum.SUPPLIERS;
  }

  /**
   * Backend uses @Patch, so override update to use PATCH instead of PUT
   */
  override update(id: number, body: any): Observable<DataResponse> {
    return this.http.patch<DataResponse>(`${this.getUrl()}/${id}`, body);
  }

}

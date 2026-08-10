import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';
import { DataResponse } from '../models/data-response';
import { ManagementPage } from '../models';
import { DynamicHttp } from './shared/dynamic-http.service';
import { AbstractRest, IRequestOptions } from './shared/abstract-rest.service';

@Injectable({
  providedIn: 'root',
})
export class ManagementPageService extends AbstractRest {
  constructor(
    protected http: DynamicHttp
  ) {
    super(http);
  }

  override getUrl(): string {
    return ApiEndpointEnum.MANAGEMENT;
  }

  override update(id: number, body: any, options?: IRequestOptions): Observable<DataResponse> {
    return this.patch(id, body, options);
  }
}

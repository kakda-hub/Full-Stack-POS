import { Injectable } from '@angular/core';
import { AbstractRest } from './shared/abstract-rest.service';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';
import { DynamicHttp } from './shared/dynamic-http.service';

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

}
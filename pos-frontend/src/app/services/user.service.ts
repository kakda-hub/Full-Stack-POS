import { Injectable } from '@angular/core';
import { AbstractRest } from './shared/abstract-rest.service';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';
import { HttpClient } from '@angular/common/http';
import { DynamicHttp } from './shared/dynamic-http.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends AbstractRest {

  constructor(http: DynamicHttp) {
    super(http);
  }

  getUrl(): string {
    return ApiEndpointEnum.USERS;
  }
}

import { Injectable } from '@angular/core';
import { AbstractRest } from './shared/abstract-rest.service';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';

@Injectable({
  providedIn: 'root',
})
export class UserService extends AbstractRest {
  getUrl(): string {
    return ApiEndpointEnum.USERS;
  }
}

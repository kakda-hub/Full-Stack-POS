import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AbstractRest } from './shared/abstract-rest.service';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';
import { DynamicHttp } from './shared/dynamic-http.service';
import { DataResponse } from '../core/models/data-response';

@Injectable({
  providedIn: 'root',
})
export class UserService extends AbstractRest {

  constructor(protected http: DynamicHttp, private httpClient: HttpClient) {
    super(http);
  }

  getUrl(): string {
    return ApiEndpointEnum.USERS;
  }

  /**
   * Backend uses @Patch, so override update to use PATCH instead of PUT
   */
  override update(id: number, body: any): Observable<DataResponse> {
    return this.http.patch<DataResponse>(`${this.getUrl()}/${id}`, body);
  }

  /**
   * Upload avatar using /dynamicFileupload and return the response containing fileUrl
   */
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadBy', 'user-avatar');

    return this.httpClient
      .post('http://localhost:3000/api/v1/dynamicFileupload', formData);
  }
}


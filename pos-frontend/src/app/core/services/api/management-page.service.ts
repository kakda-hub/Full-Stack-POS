import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpointEnum } from '../../models/enums/api-endpoint-enum';
import { DataResponse } from '../../models/data-response';
import { DynamicHttp } from '../shared/dynamic-http.service';
import { AbstractRest } from '../shared/abstract-rest.service';

export interface ManagementPage {
  id: number;
  title: string;
  titleKm: string;
  icon?: string;
  type?: string;
  url?: string;
  description?: string;
  permissions?: string[];
  badge?: number;
  sortOrder: number;
  isActive: boolean;
  parentId?: number;
  children?: ManagementPage[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ManagementPageService extends AbstractRest {
  constructor(
    protected http: DynamicHttp
  ) {
    super(http);
  }

  getUrl(): string {
    return ApiEndpointEnum.MANAGEMENT;
  }

  override update(id: number, body: any): Observable<DataResponse> {
    return this.http.patch<DataResponse>(`${this.getUrl()}/${id}`, body);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListQuery } from '../models/list-query';
import { CloudinaryResource, CloudinaryApiResponse } from '../models';
import { buildListParams } from './list-params';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private apiUrl = '/api/v1/cloudinary';

  constructor(private http: HttpClient) {}

  /**
   * List Cloudinary resources using the standard offset-based list query
   * (max/offset/sort/sortBy/search via HttpParams). Defaults: max=10, offset=0,
   * sort=desc — GET /api/v1/cloudinary?max=10&offset=0&sort=desc
   */
  listResources(query?: ListQuery): Observable<CloudinaryApiResponse> {
    const params = buildListParams(query);
    return this.http.get<CloudinaryApiResponse>(this.apiUrl, { params });
  }

  uploadFile(file: File, folder: string = 'pos-general'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  deleteResource(publicId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${publicId}`);
  }
}

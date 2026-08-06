import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListQuery } from '../../../models/list-query';
import { buildListParams } from './list-params';

export interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  asset_folder?: string;
  display_name?: string;
  url: string;
  secure_url: string;
}

/**
 * Flat standard envelope returned by GET /api/v1/cloudinary.
 * The endpoint uses @SkipIntercept(), so `data` is the resources array itself
 * (no nested data.data.resources wrapping).
 */
export interface CloudinaryApiResponse {
  success: boolean;
  statusCode: number;
  data: CloudinaryResource[];
  total?: number;
  timestamp?: string;
}

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

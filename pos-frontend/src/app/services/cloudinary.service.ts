import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  url: string;
  secure_url: string;
}

export interface CloudinaryApiResponse {
  success: boolean;
  statusCode: number;
  data: {
    success: boolean;
    statusCode: number;
    data: {
      resources: CloudinaryResource[];
      rate_limit_allowed?: number;
      rate_limit_reset_at?: string;
      rate_limit_remaining?: number;
    };
  };
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private apiUrl = 'http://localhost:3000/api/v1/cloudinary';

  constructor(private http: HttpClient) {}

  listResources(): Observable<CloudinaryApiResponse> {
    return this.http.get<CloudinaryApiResponse>(this.apiUrl);
  }

  uploadFile(file: File, folder: string = 'pos-general'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  renameResource(oldPublicId: string, newPublicId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/rename`, { oldPublicId, newPublicId });
  }

  deleteResource(publicId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${publicId}`);
  }
}

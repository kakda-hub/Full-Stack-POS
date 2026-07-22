import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEndpointEnum } from '../../models/enums/api-endpoint-enum';

export interface KhqrResponse {
  qrString: string;
  md5: string;
  qrImage: string; // base64 PNG data URI
}

@Injectable({ providedIn: 'root' })
export class KhqrService {
  private apiUrl = ApiEndpointEnum.KHQR;

  constructor(private http: HttpClient) {}

  /**
   * Generate a KHQR payment code for the given amount
   */
  generate(amount: number, billNumber?: string): Observable<KhqrResponse> {
    return this.http.post<any>(`${this.apiUrl}/generate`, { amount, billNumber }).pipe(
      map((res) => res?.data ?? res)
    );
  }
}

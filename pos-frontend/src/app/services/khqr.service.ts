import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { ApiEndpointEnum } from '../enums/api-endpoint-enum';

export interface KhqrResponse {
  qrString: string;
  md5: string;
}

@Injectable({ providedIn: 'root' })
export class KhqrService {
  private apiUrl = ApiEndpointEnum.KHQR;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Generate a KHQR payment code for the given amount
   */
  generate(amount: number, billNumber?: string): Observable<KhqrResponse> {
    return this.http.post<any>(`${this.apiUrl}/generate`, { amount, billNumber }).pipe(
      map((res) => res?.data ?? res)
    );
  }

  /**
   * Convert a raw KHQR string into a displayable QR code data URL (base64 PNG).
   * Uses the qrcode library on the client side so no backend image generation is needed.
   */
  async generateQrDataUrl(qrString: string): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    const QRCode = await import('qrcode');
    return QRCode.toDataURL(qrString, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1e1e2f',
        light: '#ffffff',
      },
    });
  }
}

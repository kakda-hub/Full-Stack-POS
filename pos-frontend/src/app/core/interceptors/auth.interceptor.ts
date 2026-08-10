import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/shared/auth.service';

import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let requestUrl = request.url;

    // If the request is a relative API call, prepend the backend host
    if (requestUrl.startsWith('/api/')) {
      let hostUrl = environment.apiUrl;
      
      // Fallback for Vercel deployment if environment.prod.ts is not applied
      if (!hostUrl && window.location.hostname !== 'localhost') {
        hostUrl = 'https://full-stack-pos.onrender.com/api/v1';
      }

      if (hostUrl && hostUrl.includes('/api/v1')) {
        hostUrl = hostUrl.split('/api/v1')[0];
      }
      
      if (hostUrl) {
        requestUrl = `${hostUrl.replace(/\/$/, '')}${requestUrl}`;
      }
    }

    // Get token from AuthService
    const token = this.authService.getToken();

    // Clone the request and add Authorization header and updated URL
    let clonedRequest = request.clone({ url: requestUrl });
    
    if (token) {
      clonedRequest = clonedRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(clonedRequest);
  }
}

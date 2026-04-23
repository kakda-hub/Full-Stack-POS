// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { AuthService } from '../services/auth.service';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private authService: AuthService) { }

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // Get token from AuthService
//     const token = this.authService.getToken();

//     // If token exists, clone the request and add Authorization header
//     if (token) {
//       const clonedRequest = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       return next.handle(clonedRequest);
//     }

//     // If no token, continue with the original request
//     return next.handle(request);
//   }
// }

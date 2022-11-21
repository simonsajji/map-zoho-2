import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class Interceptor implements HttpInterceptor {

  constructor(private router: Router) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 403) { // invalid token
            this.logout();
          } else {
            return throwError(err);
          }
        }
        return new Observable<HttpEvent<any>>();
      }));
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['']);
  }
}

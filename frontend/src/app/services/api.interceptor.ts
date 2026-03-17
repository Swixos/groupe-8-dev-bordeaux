import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('carbontrack_token');

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        localStorage.removeItem('carbontrack_token');
        localStorage.removeItem('carbontrack_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

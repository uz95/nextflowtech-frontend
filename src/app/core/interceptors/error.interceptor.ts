import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.title || error.error?.message || error.message || 'Request failed';
      notifications.error(message);
      if (error.status === 401 && !request.url.includes('/auth/login')) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
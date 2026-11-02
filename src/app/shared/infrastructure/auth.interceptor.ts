import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {SessionStore} from '../application/session.store';

/**
 * Attaches the JWT issued by the Flowboard Web Service to every request sent to it and reacts to
 * authentication failures.
 *
 * @remarks Requests to the fake API (platformProviderApiBaseUrl) are left untouched.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const isWebService = request.url.startsWith(environment.webServiceApiBaseUrl);
  const isLogin = request.url.endsWith('/auth/login');
  // A 401 from change-password only means "wrong current password", not an expired session.
  const isPasswordChange = request.url.endsWith('/auth/change-password');
  const token = session.session()?.token;

  const outgoing = isWebService && !isLogin && token
    ? request.clone({setHeaders: {Authorization: `Bearer ${token}`}})
    : request;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isWebService && !isLogin && !isPasswordChange && token) {
        if (error.status === 401) {
          session.clear();
          void router.navigate(['/login']);
        } else if (error.status === 403 && session.mustChangePassword()) {
          void router.navigate(['/change-password']);
        }
      }
      return throwError(() => error);
    })
  );
};

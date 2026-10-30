import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

// The backend reads the token from a header called "x" with the value "<role> <token>"
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const user = auth.currentUser;
  if (!user || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authReq = req.clone({ setHeaders: { x: `${user.role} ${user.token}` } });

  return next(authReq).pipe(
    switchMap(event => {
      // when the token is expired the backend answers with a new one (status 200),
      // so the new token is saved and the same request is sent again
      if (event instanceof HttpResponse) {
        const body: any = event.body;
        if (body && body.refreshtoken && auth.currentUser) {
          auth.updateToken(body.refreshtoken);
          return next(req.clone({ setHeaders: { x: `${user.role} ${body.refreshtoken}` } }));
        }
      }
      return of(event);
    }),
    catchError((err: HttpErrorResponse) => {
      const message: string = err.error && err.error.message ? String(err.error.message) : '';

      // the token is not valid any more: log out and go to the login page
      if (/jwt|invalid signature|invalid token|user not found/i.test(message)) {
        auth.logout();
        toastService.show('Your session has expired. Please log in again.', 'danger');
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};

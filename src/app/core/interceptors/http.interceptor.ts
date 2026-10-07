import {
  type HttpInterceptorFn,
  type HttpRequest,
  type HttpHandlerFn,
  type HttpEvent,
  type HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  type Observable,
  catchError,
  finalize,
  switchMap,
  throwError,
  tap,
  filter,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoaderService } from '@core/services/loader.service';
import { AuthService } from '@core/services/auth.service';
import { HttpResponseHandlerService } from '@core/services/http-response-handler.service';
import { HttpCustomHeader } from '@shared/enums/http-custom-headers.enum';

const notifyResponse = (
  req: HttpRequest<unknown>,
  res: HttpResponse<unknown>,
  responseHandler: HttpResponseHandlerService,
): void => {
  // Check for backend warning message header (from response)
  const warningTag = res.headers.get(HttpCustomHeader.CUSTOM_WARNING_MESSAGE);
  if (warningTag) {
    responseHandler.handleHttpWarning(warningTag);
    return;
  }

  // Check for default success message header
  if (
    req.headers.get(HttpCustomHeader.SHOW_DEFAULT_SUCCESS_MESSAGE) === 'true'
  ) {
    responseHandler.handleSuccessResponse();
    return;
  }

  // Check for custom success message header
  const customSuccessTag = req.headers.get(
    HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE,
  );
  if (customSuccessTag) {
    responseHandler.handleSuccessResponse(customSuccessTag);
  }
};

export const customHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  // Skip interceptor for translation files to avoid circular dependency
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }

  const loaderService = inject(LoaderService);
  const authService = inject(AuthService);
  const responseHandler = inject(HttpResponseHandlerService);

  const userData = authService.userData();
  const headers: Record<string, string> = {};
  if (userData) {
    headers['Authorization'] = `Bearer ${userData.token}`;
  }

  const modifiedReq = req.clone({
    url: `${environment.api}${req.url}`,
    setHeaders: headers,
  });

  let shouldShowLoader = false;
  if (req.headers.get(HttpCustomHeader.SHOW_LOADER) !== 'false') {
    shouldShowLoader = true;
    loaderService.show();
  }

  const handleSessionExpired = () => {
    responseHandler.handleSessionExpired();
    authService.logout();
  };

  const refreshTokenAndRefetch = () => {
    return authService.refreshToken().pipe(
      switchMap((token) =>
        next(
          modifiedReq.clone({
            url: modifiedReq.urlWithParams,
            setHeaders: {
              Authorization: `Bearer ${token?.token}`,
            },
          }),
        ),
      ),
      catchError((error: HttpErrorResponse) => {
        handleSessionExpired();
        return throwError(() => new Error(error.message));
      }),
    );
  };

  return next(modifiedReq).pipe(
    filter(
      (event): event is HttpResponse<unknown> => event instanceof HttpResponse,
    ),
    tap((res: HttpResponse<unknown>) =>
      notifyResponse(req, res, responseHandler),
    ),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (req.url === '/refreshToken') {
          handleSessionExpired();
          return throwError(() => new Error(error.message));
        } else if (req.url !== '/login') {
          return refreshTokenAndRefetch();
        }
      }

      responseHandler.handleHttpError(error);
      return throwError(() => new Error(error.message));
    }),
    finalize(() => {
      if (shouldShowLoader) {
        loaderService.hide();
      }
    }),
  );
};

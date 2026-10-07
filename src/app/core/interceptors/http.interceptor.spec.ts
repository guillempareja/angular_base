import { signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LoaderService } from '@core/services/loader.service';
import { HttpResponseHandlerService } from '@core/services/http-response-handler.service';
import type { LoginResponse } from '@core/api/login/login.types';
import { HttpCustomHeader } from '@shared/enums/http-custom-headers.enum';
import { environment } from '../../../environments/environment';
import { customHttpInterceptor } from './http.interceptor';

describe('customHttpInterceptor', () => {
  const API = environment.api;
  const session = { username: 'user', token: 'token', refreshToken: 'refresh' };

  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loaderService: LoaderService;
  let responseHandlerSpy: jasmine.SpyObj<HttpResponseHandlerService>;
  let authServiceMock: {
    userData: WritableSignal<LoginResponse | null>;
    refreshToken: jasmine.Spy;
    logout: jasmine.Spy;
  };

  beforeEach(() => {
    authServiceMock = {
      userData: signal<LoginResponse | null>(null),
      refreshToken: jasmine.createSpy('refreshToken'),
      logout: jasmine.createSpy('logout'),
    };
    responseHandlerSpy = jasmine.createSpyObj('HttpResponseHandlerService', [
      'handleHttpError',
      'handleHttpWarning',
      'handleSuccessResponse',
      'handleSessionExpired',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([customHttpInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: HttpResponseHandlerService, useValue: responseHandlerSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loaderService = TestBed.inject(LoaderService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Base URL and auth', () => {
    it('should not touch translation file requests', () => {
      http.get('/assets/i18n/es.json').subscribe();

      httpMock.expectOne('/assets/i18n/es.json').flush({});
    });

    it('should prefix the API base URL', () => {
      http.get('/data').subscribe();

      httpMock.expectOne(`${API}/data`).flush({});
    });

    it('should add the bearer token when there is a session', () => {
      authServiceMock.userData.set(session);
      http.get('/data').subscribe();

      const req = httpMock.expectOne(`${API}/data`);
      req.flush({});

      expect(req.request.headers.get('Authorization')).toBe('Bearer token');
    });

    it('should not add the Authorization header without session', () => {
      http.get('/data').subscribe();

      const req = httpMock.expectOne(`${API}/data`);
      req.flush({});

      expect(req.request.headers.has('Authorization')).toBeFalse();
    });
  });

  describe('Loader', () => {
    it('should show the loader while the request is pending', () => {
      http.get('/data').subscribe();

      expect(loaderService.isLoading()).toBeTrue();
      httpMock.expectOne(`${API}/data`).flush({});
      expect(loaderService.isLoading()).toBeFalse();
    });

    it('should not show the loader when SHOW_LOADER is false', () => {
      http
        .get('/data', { headers: { [HttpCustomHeader.SHOW_LOADER]: 'false' } })
        .subscribe();

      expect(loaderService.isLoading()).toBeFalse();
      httpMock.expectOne(`${API}/data`).flush({});
    });
  });

  describe('Notifications', () => {
    it('should show the backend warning header', () => {
      http.get('/data').subscribe();

      httpMock.expectOne(`${API}/data`).flush(
        {},
        {
          headers: {
            [HttpCustomHeader.CUSTOM_WARNING_MESSAGE]: 'someWarning',
          },
        },
      );

      expect(responseHandlerSpy.handleHttpWarning).toHaveBeenCalledWith(
        'someWarning',
      );
    });

    it('should show the default success message when requested', () => {
      http
        .post(
          '/data',
          {},
          {
            headers: {
              [HttpCustomHeader.SHOW_DEFAULT_SUCCESS_MESSAGE]: 'true',
            },
          },
        )
        .subscribe();

      httpMock.expectOne(`${API}/data`).flush({});

      expect(responseHandlerSpy.handleSuccessResponse).toHaveBeenCalledWith();
    });

    it('should show the custom success message tag', () => {
      http
        .post(
          '/data',
          {},
          {
            headers: { [HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE]: 'saved' },
          },
        )
        .subscribe();

      httpMock.expectOne(`${API}/data`).flush({});

      expect(responseHandlerSpy.handleSuccessResponse).toHaveBeenCalledWith(
        'saved',
      );
    });

    it('should not notify plain successful responses', () => {
      http.get('/data').subscribe();

      httpMock.expectOne(`${API}/data`).flush({});

      expect(responseHandlerSpy.handleSuccessResponse).not.toHaveBeenCalled();
    });
  });

  describe('Errors', () => {
    it('should delegate generic errors to the response handler', async () => {
      const promise = firstValueFrom(http.get('/data'));

      httpMock
        .expectOne(`${API}/data`)
        .flush({ tag: 'boom' }, { status: 500, statusText: 'Server Error' });

      await expectAsync(promise).toBeRejected();
      expect(responseHandlerSpy.handleHttpError).toHaveBeenCalled();
    });

    it('should treat a 401 on /login as a normal error', async () => {
      const promise = firstValueFrom(http.post('/login', {}));

      httpMock
        .expectOne(`${API}/login`)
        .flush(null, { status: 401, statusText: 'Unauthorized' });

      await expectAsync(promise).toBeRejected();
      expect(responseHandlerSpy.handleHttpError).toHaveBeenCalled();
      expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
    });

    it('should expire the session on a 401 from /refreshToken', async () => {
      const promise = firstValueFrom(http.post('/refreshToken', {}));

      httpMock
        .expectOne(`${API}/refreshToken`)
        .flush(null, { status: 401, statusText: 'Unauthorized' });

      await expectAsync(promise).toBeRejected();
      expect(responseHandlerSpy.handleSessionExpired).toHaveBeenCalled();
      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });

  describe('Refresh token', () => {
    it('should refresh the token and retry the request on 401', async () => {
      authServiceMock.refreshToken.and.returnValue(
        of({ token: 'newToken', refreshToken: 'newRefresh' }),
      );
      const promise = firstValueFrom(http.get('/data'));

      httpMock
        .expectOne(`${API}/data`)
        .flush(null, { status: 401, statusText: 'Unauthorized' });
      const retry = httpMock.expectOne(`${API}/data`);
      retry.flush({ ok: true });

      expect(retry.request.headers.get('Authorization')).toBe(
        'Bearer newToken',
      );
      expect(await promise).toEqual({ ok: true });
    });

    it('should expire the session when the refresh fails', async () => {
      authServiceMock.refreshToken.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 401 })),
      );
      const promise = firstValueFrom(http.get('/data'));

      httpMock
        .expectOne(`${API}/data`)
        .flush(null, { status: 401, statusText: 'Unauthorized' });

      await expectAsync(promise).toBeRejected();
      expect(responseHandlerSpy.handleSessionExpired).toHaveBeenCalled();
      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });
});

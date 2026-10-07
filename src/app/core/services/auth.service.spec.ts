import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { LoginService } from '@core/api/login/login.service';
import { RefreshTokenService } from '@core/api/refresh-token/refresh-token.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const STORAGE_KEY = 'userData';
  const session = { username: 'user', token: 't', refreshToken: 'r' };

  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let refreshTokenServiceSpy: jasmine.SpyObj<RefreshTokenService>;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['login']);
    refreshTokenServiceSpy = jasmine.createSpyObj('RefreshTokenService', [
      'refreshToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: RefreshTokenService, useValue: refreshTokenServiceSpy },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('login', () => {
    beforeEach(async () => {
      loginServiceSpy.login.and.resolveTo(session);
      await service.login({ username: 'user', password: 'pass' });
    });

    it('should store the session in the signal', () => {
      expect(service.userData()).toEqual(session);
    });

    it('should persist the session in localStorage', () => {
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(session);
    });

    it('should navigate to /main', () => {
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
    });
  });

  describe('loadSession', () => {
    it('should restore the stored session', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

      service.loadSession();

      expect(service.userData()).toEqual(session);
    });

    it('should keep the session empty when nothing is stored', () => {
      service.loadSession();

      expect(service.userData()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear the session and navigate to /login', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      service.userData.set(session);

      service.logout();

      expect(service.userData()).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('refreshToken', () => {
    it('should fail and logout when there is no stored session', async () => {
      await expectAsync(firstValueFrom(service.refreshToken())).toBeRejected();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should update the session with the refreshed tokens', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      const refreshed = { token: 'newT', refreshToken: 'newR' };
      refreshTokenServiceSpy.refreshToken.and.returnValue(of(refreshed));

      await firstValueFrom(service.refreshToken());

      expect(refreshTokenServiceSpy.refreshToken).toHaveBeenCalledWith('r');
      expect(service.userData()).toEqual({ ...session, ...refreshed });
    });

    it('should logout when the refresh request fails', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      refreshTokenServiceSpy.refreshToken.and.returnValue(
        throwError(() => new Error('401')),
      );

      await expectAsync(firstValueFrom(service.refreshToken())).toBeRejected();

      expect(service.userData()).toBeNull();
    });
  });
});

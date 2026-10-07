import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import type { LoginResponse } from '@core/api/login/login.types';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  const authServiceMock = { userData: signal<LoginResponse | null>(null) };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow access when there is a session token', () => {
    authServiceMock.userData.set({
      username: 'user',
      token: 't',
      refreshToken: 'r',
    });

    expect(guard.canActivate()).toBeTrue();
  });

  it('should redirect to /login when there is no session', () => {
    authServiceMock.userData.set(null);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});

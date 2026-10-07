import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, type Observable, tap, throwError } from 'rxjs';
import { LoginService } from '@core/api/login/login.service';
import { RefreshTokenService } from '@core/api/refresh-token/refresh-token.service';
import type { LoginRequest, LoginResponse } from '@core/api/login/login.types';
import type { RefreshTokenResponse } from '@core/api/refresh-token/refresh-token.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Injections
  private router = inject(Router);
  private loginService = inject(LoginService);
  private refreshTokenService = inject(RefreshTokenService);

  // Data
  public userData = signal<LoginResponse | null>(null);

  // Methods
  public async login(credentials: LoginRequest): Promise<void> {
    const response = await this.loginService.login(credentials);
    localStorage.setItem('userData', JSON.stringify(response));
    this.userData.set(response);
    this.router.navigate(['/main']);
  }

  public refreshToken(): Observable<RefreshTokenResponse> {
    const storedUserData = localStorage.getItem('userData');
    const throwTokenError = () => {
      this.logout();
      return throwError(() => new Error('Failed to refresh token'));
    };

    if (!storedUserData) {
      return throwTokenError();
    }

    const userData: LoginResponse = JSON.parse(storedUserData);

    return this.refreshTokenService.refreshToken(userData.refreshToken).pipe(
      tap((response) => {
        const updatedUserData = {
          ...userData,
          ...response,
        };
        this.userData.set(updatedUserData);
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      }),
      catchError(throwTokenError),
    );
  }

  public loadSession(): void {
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      this.userData.set(JSON.parse(storedUserData));
    }
  }

  public logout(): void {
    this.userData.set(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }
}

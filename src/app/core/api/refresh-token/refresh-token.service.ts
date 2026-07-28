import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Token } from '@shared/models/auth.types';
import type {
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './refresh-token.types';

@Injectable({
  providedIn: 'root',
})
export class RefreshTokenService {
  // Injections
  private http = inject(HttpClient);

  // Methods
  // Returns an Observable (not a Promise) because it is consumed inside the
  // HTTP interceptor's retry pipeline (switchMap on 401).
  public refreshToken(refreshToken: Token): Observable<RefreshTokenResponse> {
    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<RefreshTokenResponse>('/refreshToken', body);
  }
}

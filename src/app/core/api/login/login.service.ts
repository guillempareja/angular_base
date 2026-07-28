import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { LoginRequest, LoginResponse } from './login.types';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // Injections
  private http = inject(HttpClient);

  // Methods
  public login(body: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(this.http.post<LoginResponse>('/login', body));
  }
}

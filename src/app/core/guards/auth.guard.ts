import { inject, Injectable } from '@angular/core';
import { type CanActivate, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  public canActivate(): boolean {
    const userData = this.authService.userData();

    if (userData?.token) {
      return true;
    }

    void this.router.navigate(['/login']);
    return false;
  }
}

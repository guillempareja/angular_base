import { type Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.component'),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'main',
  },
];

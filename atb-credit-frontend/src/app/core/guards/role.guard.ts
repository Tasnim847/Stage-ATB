import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Array<string>;
  const userRole = authService.getUserRole();

  if (!userRole) {
    return router.parseUrl('/login');
  }

  if (requiredRoles && requiredRoles.includes(userRole)) {
    return true;
  }

  return router.parseUrl('/dashboard');
};
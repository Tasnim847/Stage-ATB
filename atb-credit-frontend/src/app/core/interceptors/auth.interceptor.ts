import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🔍 Interceptor - URL:', req.url);
  console.log('🔍 Interceptor - Token:', token ? token.substring(0, 30) + '...' : 'null');

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ Token ajouté à la requête');
    return next(cloned);
  }

  console.log('⚠️ Aucun token trouvé');
  return next(req);
};
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const token = authService.getToken();

  // ✅ Exclure les endpoints d'authentification de l'ajout du token
  const isAuthEndpoint = req.url.includes('/api/auth/login') || 
                         req.url.includes('/api/auth/register') ||
                         req.url.includes('/api/auth/refresh') ||
                         req.url.includes('/api/auth/check-status');

  // ✅ Ne pas ajouter le token pour les endpoints d'authentification
  if (isAuthEndpoint) {
    console.log('🔓 Endpoint d\'authentification, pas de token ajouté');
    return next(req);
  }

  // ✅ Ajouter le token pour les autres requêtes
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('🔍 Interceptor - URL:', req.url);
    console.log('🔍 Interceptor - Token:', token ? token.substring(0, 30) + '...' : 'null');
    console.log('✅ Token ajouté à la requête');
  } else {
    console.log('⚠️ Aucun token trouvé pour:', req.url);
  }

  // ✅ Gérer les erreurs de réponse
  return next(clonedReq).pipe(
    catchError((error) => {
      console.error('❌ Erreur interceptée:', error.status, error.statusText);

      // ✅ Si erreur 401 (Non autorisé) ou 403 (Interdit)
      if (error.status === 401 || error.status === 403) {
        // ✅ Vérifier si c'est une erreur de compte inactif
        if (error.error?.errorCode === 'ACCOUNT_INACTIVE' || 
            error.error?.errorCode === 'CLIENT_INACTIVE' ||
            error.error?.errorCode === 'ACCOUNT_LOCKED') {
          
          toastr.error(
            error.error?.message || 'Votre compte a été désactivé ou verrouillé. Veuillez contacter l\'administrateur.',
            'Accès refusé',
            { timeOut: 5000, positionClass: 'toast-top-center' }
          );
          
          // ✅ Déconnecter l'utilisateur
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        // ✅ Si le token est expiré ou invalide
        const token = authService.getToken();
        if (token) {
          // ✅ Essayer de rafraîchir le token
          // (À implémenter si vous avez un refresh token)
        } else {
          // ✅ Pas de token, rediriger vers login
          toastr.warning('Votre session a expiré. Veuillez vous reconnecter.', 'Session expirée');
          authService.logout();
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
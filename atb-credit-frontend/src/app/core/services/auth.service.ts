import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  ClientRegisterRequest,
  EmployeeRegisterRequest,
  AuthResponse, 
  User
} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.refreshTokenKey;
  private readonly USER_KEY = 'user';

  // ========== AUTHENTIFICATION ==========

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          this.handleAuthResponse(response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Inscription employé (Admin, Analyst, Advisor, Manager)
   */
  registerEmployee(employeeData: EmployeeRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/employee/register`, employeeData)
      .pipe(
        tap((response: AuthResponse) => {
          this.handleAuthResponse(response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Inscription client (Rôle CLIENT)
   */
  registerClient(clientData: ClientRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/client/register`, clientData)
      .pipe(
        tap((response: AuthResponse) => {
          this.handleAuthResponse(response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Rafraîchir le token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    return this.http.post<AuthResponse>(
      `${environment.authUrl}/refresh`,
      {},
      { headers: { 'Authorization': `Bearer ${refreshToken}` } }
    ).pipe(
      tap((response: AuthResponse) => {
        this.handleAuthResponse(response);
      }),
      catchError((error) => {
        this.logout();
        return this.handleError(error);
      })
    );
  }

  // ========== GESTION DU TOKEN ==========

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      return Date.now() < expiration;
    } catch {
      return false;
    }
  }

  // ========== GESTION DE L'UTILISATEUR ==========

  getUserRole(): string | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserInfo(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return roles.includes(userRole || '');
  }

  // ========== MÉTHODES PRIVÉES ==========

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role
    }));
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
    } else if (error.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.status === 403) {
      errorMessage = 'Compte désactivé ou verrouillé';
    } else if (error.status === 404) {
      errorMessage = 'Service non trouvé';
    } else if (error.status === 409) {
      errorMessage = 'Email ou nom d\'utilisateur déjà existant';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      ...error,
      message: errorMessage
    }));
  }

  // core/services/auth.service.ts - AJOUTER CETTE MÉTHODE

updateUserInfo(userData: any): void {
  const currentUser = this.getUserInfo();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
}
}
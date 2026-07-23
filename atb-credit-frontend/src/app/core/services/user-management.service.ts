// core/services/user-management.service.ts - VERSION CORRIGÉE

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { UserResponseDTO, UserCreateRequest, UserUpdateRequest } from '@core/models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private http = inject(HttpClient);
  
  // ✅ Utiliser /api/admin/users pour correspondre au backend
  private apiUrl = `${environment.apiUrl}/admin/users`;

  /**
   * Récupérer tous les utilisateurs
   */
  getAllUsers(): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupérer un utilisateur par ID
   */
  getUserById(id: string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ✅ Créer un nouvel utilisateur (avec création automatique de Client ou Employee)
   */
  createUser(userData: UserCreateRequest): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(this.apiUrl, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Modifier un utilisateur
   */
  updateUser(id: string, userData: UserUpdateRequest): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.apiUrl}/${id}`, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Supprimer un utilisateur (supprime aussi Client ou Employee associé)
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Désactiver un utilisateur
   */
  deactivateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deactivate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Activer un utilisateur
   */
  activateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/reset-password`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Verrouiller un utilisateur
   */
  lockUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/lock`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Déverrouiller un utilisateur
   */
  unlockUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/unlock`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Compter les utilisateurs actifs
   */
  countActiveUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/active`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupérer les utilisateurs par rôle
   */
  getUsersByRole(role: string): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(`${this.apiUrl}/role/${role}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.status === 409) {
        errorMessage = 'Impossible de supprimer cet utilisateur car il a des données associées';
      } else if (error.status === 403) {
        errorMessage = 'Vous n\'avez pas les droits pour effectuer cette action';
      } else if (error.status === 404) {
        errorMessage = 'Utilisateur non trouvé';
      } else if (error.status === 405) {
        errorMessage = 'La méthode n\'est pas supportée par le serveur';
      } else if (error.status === 400) {
        errorMessage = 'Requête invalide';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur interne';
      }
    }
    
    console.error('Service error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
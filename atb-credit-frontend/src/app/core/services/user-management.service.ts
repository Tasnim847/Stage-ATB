// core/services/user-management.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { UserResponseDTO, UserCreateRequest, UserUpdateRequest } from '@core/models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/users`;

  /**
   * Récupérer tous les utilisateurs
   */
  getAllUsers(): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(this.apiUrl);
  }

  /**
   * Récupérer un utilisateur par ID
   */
  getUserById(id: string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouvel utilisateur
   */
  createUser(userData: UserCreateRequest): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(this.apiUrl, userData);
  }

  /**
   * Modifier un utilisateur
   */
  updateUser(id: string, userData: UserUpdateRequest): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * Désactiver un utilisateur
   */
  deactivateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  /**
   * Activer un utilisateur
   */
  activateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  /**
   * Verrouiller un utilisateur
   */
  lockUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/lock`, {});
  }

  /**
   * Déverrouiller un utilisateur
   */
  unlockUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/unlock`, {});
  }
}
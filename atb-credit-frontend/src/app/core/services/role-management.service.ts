// core/services/role-management.service.ts - AJOUTER LA MÉTHODE RESET
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { RoleResponseDTO, RoleUpdateRequest } from '@core/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleManagementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/roles`;

  /**
   * Récupérer tous les utilisateurs avec leurs rôles
   */
  getAllUsersWithRoles(): Observable<RoleResponseDTO[]> {
    return this.http.get<RoleResponseDTO[]>(`${this.apiUrl}/users`);
  }

  /**
   * Récupérer les utilisateurs par rôle
   */
  getUsersByRole(role: string): Observable<RoleResponseDTO[]> {
    return this.http.get<RoleResponseDTO[]>(`${this.apiUrl}/by-role/${role}`);
  }

  /**
   * Mettre à jour le rôle d'un utilisateur
   */
  updateUserRole(request: RoleUpdateRequest): Observable<RoleResponseDTO> {
    return this.http.put<RoleResponseDTO>(`${this.apiUrl}/update`, request);
  }

  /**
   * ✅ Réinitialiser le rôle d'un utilisateur
   */
  resetUserRole(userId: string): Observable<RoleResponseDTO> {
    return this.http.post<RoleResponseDTO>(`${this.apiUrl}/reset/${userId}`, {});
  }

  /**
   * Récupérer les permissions disponibles
   */
  getAvailablePermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/permissions`);
  }
}
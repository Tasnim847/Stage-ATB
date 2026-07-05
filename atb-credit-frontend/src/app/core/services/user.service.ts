// core/services/user.service.ts - CORRIGÉ
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  User, 
  UserResponse, 
  UserRole, 
  RegisterRequest 
} from '@core/models/user.model';
import { AuthResponse } from '@core/models/auth.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // ✅ CORRIGER : Supprimer le double '/api'
  private apiUrl = `${environment.apiUrl}/users`;  // Au lieu de /api/users

  constructor(private http: HttpClient) {}

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  getUserByEmail(email: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/email/${email}`);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  getUsersByRole(role: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/role/${role}`);
  }

  getUsersByRoleEnum(role: UserRole): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/role/${role}`);
  }

  updateUser(id: string, userData: RegisterRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  lockUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/lock`, {});
  }

  unlockUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/unlock`, {});
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  countActiveUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/active`);
  }

  getAdvisors(): Observable<UserResponse[]> {
    return this.getUsersByRole('ADVISOR');
  }

  getAdmins(): Observable<UserResponse[]> {
    return this.getUsersByRole('ADMIN');
  }

  getAnalysts(): Observable<UserResponse[]> {
    return this.getUsersByRole('ANALYST');
  }

  getManagers(): Observable<UserResponse[]> {
    return this.getUsersByRole('MANAGER');
  }

  hasRole(user: UserResponse, role: UserRole | string): boolean {
    return user.role === role || user.role === role.toString();
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'ANALYST': 'Analyste',
      'ADVISOR': 'Conseiller',
      'MANAGER': 'Manager',
      'CLIENT': 'Client'
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': '#e8f5e9',
      'ANALYST': '#e3f2fd',
      'ADVISOR': '#f3e5f5',
      'MANAGER': '#fff3e0',
      'CLIENT': '#fce4ec'
    };
    return colors[role] || '#f5f5f5';
  }

  getRoleTextColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': '#2e7d32',
      'ANALYST': '#1565c0',
      'ADVISOR': '#7b1fa2',
      'MANAGER': '#e65100',
      'CLIENT': '#c62828'
    };
    return colors[role] || '#333';
  }
}
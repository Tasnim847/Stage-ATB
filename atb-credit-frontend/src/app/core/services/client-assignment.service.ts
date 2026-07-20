// core/services/client-assignment.service.ts - VERSION CORRECTE
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { 
  AdvisorAssignmentDTO,
  AssignmentStats 
} from '@core/models/client-assignment.model';
import { ClientResponseDTO } from '@core/models/client.model';
import { UserResponse } from '@core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ClientAssignmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients/assignment`;

  // ============================================
  // CONSEILLERS (ADVISOR)
  // ============================================

  getAvailableAdvisors(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/advisors`);
  }

  getClientsByAdvisor(advisorId: string): Observable<ClientResponseDTO[]> {
    return this.http.get<ClientResponseDTO[]>(`${this.apiUrl}/advisor/${advisorId}`);
  }

  assignAdvisorToClient(clientId: string, advisorId: string): Observable<ClientResponseDTO> {
    return this.http.post<ClientResponseDTO>(
      `${this.apiUrl}/assign?clientId=${clientId}&advisorId=${advisorId}`,
      {}
    );
  }

  assignAdvisorToMultipleClients(assignment: AdvisorAssignmentDTO): Observable<ClientResponseDTO[]> {
    return this.http.post<ClientResponseDTO[]>(
      `${this.apiUrl}/assign-multiple`,
      assignment
    );
  }

  reassignAdvisor(clientId: string, newAdvisorId: string): Observable<ClientResponseDTO> {
    return this.http.put<ClientResponseDTO>(
      `${this.apiUrl}/reassign?clientId=${clientId}&newAdvisorId=${newAdvisorId}`,
      {}
    );
  }

  removeAdvisorFromClient(clientId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${clientId}/advisor`);
  }

  // ============================================
  // ANALYSTES (ANALYST)
  // ============================================

  getAvailableAnalysts(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/analysts-only`);
  }

  getClientsByAnalyst(analystId: string): Observable<ClientResponseDTO[]> {
    return this.http.get<ClientResponseDTO[]>(`${this.apiUrl}/analyst/${analystId}`);
  }

  assignAnalystToClient(clientId: string, analystId: string): Observable<ClientResponseDTO> {
    return this.http.post<ClientResponseDTO>(
      `${this.apiUrl}/assign-analyst?clientId=${clientId}&analystId=${analystId}`,
      {}
    );
  }

  removeAnalystFromClient(clientId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${clientId}/analyst`);
  }

  // ============================================
  // STATISTIQUES ET AUTRES
  // ============================================

  getAssignmentStats(): Observable<AssignmentStats> {
    return this.http.get<AssignmentStats>(`${this.apiUrl}/stats`);
  }

  getUnassignedClients(): Observable<ClientResponseDTO[]> {
    return this.http.get<ClientResponseDTO[]>(`${this.apiUrl}/unassigned`);
  }

  getAllAdvisorsAndAnalysts(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/all-advisors-analysts`);
  }
}
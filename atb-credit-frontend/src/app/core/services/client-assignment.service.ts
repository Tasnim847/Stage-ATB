// core/services/client-assignment.service.ts - CORRIGÉ
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { 
  AdvisorAssignmentDTO,
  AssignmentResponse,
  AssignmentStats 
} from '@core/models/client-assignment.model';
import { ClientResponseDTO } from '@core/models/client.model';
import { UserResponse } from '@core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ClientAssignmentService {
  private http = inject(HttpClient);
  // ✅ CORRIGER : Supprimer le double '/api'
  private apiUrl = `${environment.apiUrl}/clients/assignment`;

  getAvailableAdvisors(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/advisors`);
  }

  getUnassignedClients(): Observable<ClientResponseDTO[]> {
    return this.http.get<ClientResponseDTO[]>(`${this.apiUrl}/unassigned`);
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

  // ✅ CORRIGÉ : L'URL doit correspondre au backend
  removeAdvisorFromClient(clientId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${clientId}/advisor`);
  }

  getAssignmentStats(): Observable<AssignmentStats> {
    return this.http.get<AssignmentStats>(`${this.apiUrl}/stats`);
  }
}
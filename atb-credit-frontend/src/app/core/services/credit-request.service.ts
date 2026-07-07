// core/services/credit-request.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreditResponseDTO, CreditRequestDTO, CreditStatus } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class CreditRequestService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Récupérer les crédits du client connecté
   */
  getMyCreditRequests(): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/my-credits`);
  }

  /**
   * Récupérer les crédits du client connecté par statut
   */
  getMyCreditRequestsByStatus(status: CreditStatus): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/my-credits/status/${status}`);
  }

  /**
   * Compter les crédits du client connecté
   */
  countMyCreditRequests(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/credit-requests/my-credits/count`);
  }

  /**
   * Créer une demande de crédit
   */
  createCreditRequest(request: CreditRequestDTO): Observable<CreditResponseDTO> {
    return this.http.post<CreditResponseDTO>(`${this.apiUrl}/credit-requests`, request);
  }

  /**
   * Récupérer une demande de crédit par ID
   */
  getCreditRequestById(id: string): Observable<CreditResponseDTO> {
    return this.http.get<CreditResponseDTO>(`${this.apiUrl}/credit-requests/${id}`);
  }

  /**
   * ✅ Récupérer les demandes de crédit d'un client
   */
  getCreditRequestsByClient(clientId: string): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/client/${clientId}`);
  }

  /**
   * Récupérer les demandes de crédit par statut
   */
  getCreditRequestsByStatus(status: CreditStatus): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/status/${status}`);
  }

  /**
   * Récupérer toutes les demandes de crédit
   */
  getAllCreditRequests(): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests`);
  }
}
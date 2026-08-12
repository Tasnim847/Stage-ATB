// core/services/credit-request.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreditResponseDTO, CreditRequestDTO, CreditStatus } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class CreditRequestService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ============================================
  // MÉTHODES CLIENT
  // ============================================

  /**
   * Définir si un dossier nécessite une validation manager
   */
  setManagerValidation(
    id: string, 
    required: boolean, 
    reason?: string, 
    comments?: string
  ): Observable<CreditResponseDTO> {
    let params = new HttpParams()
      .set('required', required.toString());
    
    if (reason) params = params.set('reason', reason);
    if (comments) params = params.set('comments', comments);
    
    return this.http.patch<CreditResponseDTO>(
      `${this.apiUrl}/credit-requests/${id}/manager-validation`,
      null,
      { params }
    );
  }
  /**
   * Mettre à jour le statut avec validation manager
   */
  updateStatusWithManagerValidation(
    id: string,
    status: CreditStatus,
    reason?: string,
    managerValidation: boolean = false
  ): Observable<CreditResponseDTO> {
    let params = new HttpParams()
      .set('status', status)
      .set('managerValidation', managerValidation.toString());
    
    if (reason) params = params.set('reason', reason);
    
    return this.http.patch<CreditResponseDTO>(
      `${this.apiUrl}/credit-requests/${id}/status-with-manager`,
      null,
      { params }
    );
  }
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

  // ============================================
  // MÉTHODES CRÉATION
  // ============================================

  /**
   * Créer une demande de crédit (avec toutes les données)
   */
  createCreditRequest(request: CreditRequestDTO): Observable<CreditResponseDTO> {
    return this.http.post<CreditResponseDTO>(`${this.apiUrl}/credit-requests`, request);
  }

  // ============================================
  // MÉTHODES LECTURE
  // ============================================

  /**
   * Récupérer une demande de crédit par ID
   */
  getCreditRequestById(id: string): Observable<CreditResponseDTO> {
    return this.http.get<CreditResponseDTO>(`${this.apiUrl}/credit-requests/${id}`);
  }

  /**
   * Récupérer les demandes de crédit d'un client
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

  // ============================================
  // MÉTHODES ANALYSTE
  // ============================================

  /**
   * Récupérer les demandes de crédit pour l'analyste connecté
   */
  getCreditRequestsForAnalyst(): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/analyst/my-clients`);
  }

  /**
   * Récupérer les demandes de crédit pour l'analyste par statut
   */
  getCreditRequestsForAnalystByStatus(status: CreditStatus): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/analyst/my-clients/status/${status}`);
  }

  /**
   * Compter les demandes de crédit pour l'analyste
   */
  countCreditRequestsForAnalyst(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/credit-requests/analyst/my-clients/count`);
  }

  // ============================================
  // MÉTHODES DE MODIFICATION
  // ============================================

  /**
   * Annuler une demande de crédit (si elle est en attente)
   */
  cancelCreditRequest(id: string): Observable<CreditResponseDTO> {
    return this.http.patch<CreditResponseDTO>(`${this.apiUrl}/credit-requests/${id}/cancel`, {});
  }

  /**
   * Transmettre une demande de crédit à l'analyste
   */
  transmitToAnalyst(id: string, notes?: string): Observable<CreditResponseDTO> {
    return this.http.patch<CreditResponseDTO>(
      `${this.apiUrl}/credit-requests/${id}/transmit-to-analyst`,
      { notes }
    );
  }

  /**
   * Vérifier si une demande peut être transmise
   */
  canTransmitToAnalyst(id: string): Observable<{ canTransmit: boolean; missingDocuments: string[] }> {
    return this.http.get<{ canTransmit: boolean; missingDocuments: string[] }>(
      `${this.apiUrl}/credit-requests/${id}/can-transmit`
    );
  }

  // ============================================
  // MÉTHODES ADMIN
  // ============================================

  /**
   * Récupérer toutes les demandes pour l'admin
   */
  getAdminCreditRequests(): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/admin/all`);
  }

  /**
   * Récupérer les demandes par statut pour l'admin
   */
  getAdminCreditRequestsByStatus(status: CreditStatus): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.apiUrl}/credit-requests/admin/status/${status}`);
  }
}
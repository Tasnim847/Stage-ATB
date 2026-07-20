// core/services/client.service.ts - Version correcte
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
// ✅ Importer depuis les modèles
import { ClientResponseDTO, ClientRequestDTO } from '@core/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Créer un nouveau client
   */
  createClient(clientData: ClientRequestDTO): Observable<ClientResponseDTO> {
    return this.http.post<ClientResponseDTO>(`${this.apiUrl}/clients`, clientData);
  }

  /**
   * Récupérer tous les clients
   */
  getAllClients(): Observable<ClientResponseDTO[]> {
    return this.http.get<ClientResponseDTO[]>(`${this.apiUrl}/clients`);
  }

  /**
   * Récupérer les clients d'un conseiller
   */
  getClientsByAdvisor(advisorId: string): Observable<ClientResponseDTO[]> {
    return this.http.get<ClientResponseDTO[]>(`${this.apiUrl}/clients/advisor/${advisorId}`);
  }

  /**
   * Récupérer un client par ID
   */
  getClientById(id: string): Observable<ClientResponseDTO> {
    return this.http.get<ClientResponseDTO>(`${this.apiUrl}/clients/${id}`);
  }

  /**
   * Récupérer un client par email
   */
  getClientByEmail(email: string): Observable<ClientResponseDTO> {
    return this.http.get<ClientResponseDTO>(`${this.apiUrl}/clients/email/${email}`);
  }

  /**
   * Récupérer un client par numéro client
   */
  getClientByNumber(clientNumber: string): Observable<ClientResponseDTO> {
    return this.http.get<ClientResponseDTO>(`${this.apiUrl}/clients/number/${clientNumber}`);
  }

  /**
   * Rechercher des clients
   */
  searchClients(query: string): Observable<ClientResponseDTO[]> {
    return this.http.get<ClientResponseDTO[]>(`${this.apiUrl}/clients/search`, { params: { query } });
  }

  /**
   * Mettre à jour un client
   */
  updateClient(id: string, clientData: ClientRequestDTO): Observable<ClientResponseDTO> {
    return this.http.put<ClientResponseDTO>(`${this.apiUrl}/clients/${id}`, clientData);
  }

  /**
   * Activer un client
   */
  activateClient(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/clients/${id}/activate`, {});
  }

  /**
   * Désactiver un client
   */
  deactivateClient(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/clients/${id}/deactivate`, {});
  }

  /**
   * Supprimer un client
   */
  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }

  /**
   * Compter les clients actifs
   */
  countActiveClients(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/clients/count/active`);
  }

  /**
   * Récupérer le client connecté (pour le rôle CLIENT)
   */
  getCurrentClient(): Observable<ClientResponseDTO> {
    return this.http.get<ClientResponseDTO>(`${this.apiUrl}/clients/me`);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreditSimulation } from '../models/credit-simulation.model';

@Injectable({
  providedIn: 'root'
})
export class CreditSimulationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Récupérer la simulation par ID de la demande de crédit
   */
  getSimulationByCreditRequestId(creditRequestId: string): Observable<CreditSimulation> {
    return this.http.get<CreditSimulation>(`${this.apiUrl}/credit-requests/${creditRequestId}/simulation`);
  }

  /**
   * Récupérer une simulation par ID
   */
  getSimulationById(id: string): Observable<CreditSimulation> {
    return this.http.get<CreditSimulation>(`${this.apiUrl}/credit-simulations/${id}`);
  }

  /**
   * Récupérer les simulations de l'utilisateur
   */
  getMySimulations(): Observable<CreditSimulation[]> {
    return this.http.get<CreditSimulation[]>(`${this.apiUrl}/credit-simulations/my-simulations`);
  }
}
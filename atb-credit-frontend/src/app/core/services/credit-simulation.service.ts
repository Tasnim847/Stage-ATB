// core/services/credit-simulation.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreditSimulation } from '../models/credit-simulation.model';

@Injectable({
  providedIn: 'root'
})
export class CreditSimulationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ============ MÉTHODES EXISTANTES ============

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

  /**
   * Créer une simulation autonome
   */
  createStandaloneSimulation(params: {
    amount: number;
    durationMonths: number;
    interestRate: number;
    clientId?: string;
  }): Observable<CreditSimulation> {
    let httpParams = new HttpParams()
      .set('amount', params.amount.toString())
      .set('durationMonths', params.durationMonths.toString())
      .set('interestRate', params.interestRate.toString());
    
    if (params.clientId) {
      httpParams = httpParams.set('clientId', params.clientId);
    }
    
    return this.http.post<CreditSimulation>(
      `${this.apiUrl}/credit-simulations/simulate`,
      null,
      { params: httpParams }
    );
  }

  /**
   * Comparer plusieurs simulations
   */
  compareSimulations(simulationIds: string[]): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/credit-simulations/compare`,
      simulationIds
    );
  }

  /**
   * Générer un résumé de simulation
   */
  getSimulationSummary(id: string): Observable<string> {
    return this.http.get<string>(
      `${this.apiUrl}/credit-simulations/${id}/summary`,
      { responseType: 'text' as 'json' }
    );
  }

  // ============ 📝 NOUVELLES MÉTHODES UPDATE ============

  /**
   * Mettre à jour une simulation complète
   */
  updateSimulation(id: string, data: {
    amount: number;
    durationMonths: number;
    interestRate: number;
  }): Observable<CreditSimulation> {
    let params = new HttpParams()
      .set('amount', data.amount.toString())
      .set('durationMonths', data.durationMonths.toString())
      .set('interestRate', data.interestRate.toString());
    
    return this.http.put<CreditSimulation>(
      `${this.apiUrl}/credit-simulations/${id}`,
      null,
      { params }
    );
  }

  /**
   * Mettre à jour uniquement le montant
   */
  updateSimulationAmount(id: string, amount: number): Observable<CreditSimulation> {
    return this.http.patch<CreditSimulation>(
      `${this.apiUrl}/credit-simulations/${id}/amount`,
      null,
      { params: { amount: amount.toString() } }
    );
  }

  /**
   * Mettre à jour uniquement la durée
   */
  updateSimulationDuration(id: string, durationMonths: number): Observable<CreditSimulation> {
    return this.http.patch<CreditSimulation>(
      `${this.apiUrl}/credit-simulations/${id}/duration`,
      null,
      { params: { durationMonths: durationMonths.toString() } }
    );
  }

  /**
   * Mettre à jour uniquement le taux d'intérêt
   */
  updateSimulationInterestRate(id: string, interestRate: number): Observable<CreditSimulation> {
    return this.http.patch<CreditSimulation>(
      `${this.apiUrl}/credit-simulations/${id}/interest-rate`,
      null,
      { params: { interestRate: interestRate.toString() } }
    );
  }

  /**
   * Mettre à jour le nom d'une simulation
   */
  updateSimulationName(id: string, name: string): Observable<CreditSimulation> {
    return this.http.patch<CreditSimulation>(
      `${this.apiUrl}/credit-simulations/${id}/name`,
      null,
      { params: { name } }
    );
  }

  /**
   * Mettre à jour plusieurs simulations en lot
   */
  batchUpdateInterestRate(ids: string[], interestRate: number): Observable<number> {
    return this.http.patch<number>(
      `${this.apiUrl}/credit-simulations/batch/interest-rate`,
      ids,
      { params: { interestRate: interestRate.toString() } }
    );
  }

  // ============ 🗑️ NOUVELLES MÉTHODES DELETE ============

  /**
   * Supprimer une simulation
   */
  deleteSimulation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/credit-simulations/${id}`);
  }

  /**
   * Supprimer toutes mes simulations
   */
  deleteMySimulations(): Observable<number> {
    return this.http.delete<number>(`${this.apiUrl}/credit-simulations/my-simulations`);
  }

  /**
   * Supprimer les simulations plus anciennes (Admin uniquement)
   */
  deleteSimulationsOlderThan(date: string): Observable<number> {
    return this.http.delete<number>(
      `${this.apiUrl}/credit-simulations/older-than`,
      { params: { date } }
    );
  }

  /**
   * Supprimer toutes les simulations (Admin uniquement)
   */
  deleteAllSimulations(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/credit-simulations/all`);
  }
}
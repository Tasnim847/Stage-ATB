// src/app/core/services/manager.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private apiUrl = environment.apiUrl + '/manager';

  constructor(private http: HttpClient) {}

  /**
   * Génère un rapport stratégique
   */
  generateStrategyReport(): Observable<any> {
    return this.http.post(`${this.apiUrl}/strategy-report/generate`, {});
  }

  /**
   * Récupère les décisions en attente de validation
   */
  getPendingDecisions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/decisions/pending`);
  }

  /**
   * Valide une décision
   */
  validateDecision(decisionId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/decisions/${decisionId}/validate`, data);
  }

  /**
   * Refuse une décision
   */
  rejectDecision(decisionId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/decisions/${decisionId}/reject`, data);
  }

  /**
   * Retourne un dossier à l'analyste
   */
  returnToAnalyst(decisionId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/decisions/${decisionId}/return`, data);
  }

  /**
   * Récupère les performances des analystes
   */
  getAnalystsPerformance(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analysts/performance`, { params });
  }

  /**
   * Récupère la répartition des dossiers
   */
  getWorkloadDistribution(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analysts/workload`);
  }

  /**
   * Récupère les crédits à haut montant
   */
  getHighAmountCredits(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/credits/high-amount`, { params });
  }

  /**
   * Récupère les prévisions
   */
  getForecasts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/forecasts`);
  }

  /**
   * Récupère les fraudes détectées
   */
  getDetectedFrauds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/frauds/detected`);
  }

  /**
   * Récupère l'analyse du portefeuille
   */
  getPortfolioAnalysis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/portfolio/analysis`);
  }

  /**
   * Récupère les KPIs du manager
   */
  getManagerKPIs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/kpis`);
  }

  /**
   * Récupère le tableau de bord Power BI
   */
  getPowerBIDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/powerbi`);
  }
}
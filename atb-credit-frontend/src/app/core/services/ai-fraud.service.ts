// core/services/ai-fraud.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface FraudAlert {
  id: string;
  creditRequestId: string;
  requestNumber: string;
  clientName: string;
  clientId: string;
  fraudType: FraudType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  confidence: number;
  evidence: string[];
  status: 'NEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export enum FraudType {
  DOCUMENT_FORGERY = 'DOCUMENT_FORGERY',
  IDENTITY_THEFT = 'IDENTITY_THEFT',
  INCOME_MISMATCH = 'INCOME_MISMATCH',
  DUPLICATE_APPLICATION = 'DUPLICATE_APPLICATION',
  SYNDICATED_FRAUD = 'SYNDICATED_FRAUD',
  COLLUSION = 'COLLUSION',
  MONEY_LAUNDERING = 'MONEY_LAUNDERING',
  OTHER = 'OTHER'
}

export interface FraudStatistics {
  totalAlerts: number;
  newAlerts: number;
  underReview: number;
  confirmed: number;
  rejected: number;
  byType: { [key: string]: number };
  bySeverity: { [key: string]: number };
  trendLastDays: number[];
}

@Injectable({
  providedIn: 'root'
})
export class AIFraudService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/manager/ai`;

  /**
   * Récupérer les alertes de fraude
   */
  getFraudAlerts(status?: string, severity?: string): Observable<FraudAlert[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (severity) params = params.set('severity', severity);
    return this.http.get<FraudAlert[]>(`${this.apiUrl}/fraud/alerts`, { params });
  }

  /**
   * Récupérer une alerte de fraude par ID
   */
  getFraudAlert(id: string): Observable<FraudAlert> {
    return this.http.get<FraudAlert>(`${this.apiUrl}/fraud/alert/${id}`);
  }

  /**
   * Mettre à jour le statut d'une alerte
   */
  updateFraudAlertStatus(id: string, status: string, comments?: string): Observable<FraudAlert> {
    return this.http.patch<FraudAlert>(`${this.apiUrl}/fraud/alert/${id}/status`, { status, comments });
  }

  /**
   * Récupérer les statistiques de fraude
   */
  getFraudStatistics(): Observable<FraudStatistics> {
    return this.http.get<FraudStatistics>(`${this.apiUrl}/fraud/statistics`);
  }

  /**
   * Générer un rapport de fraude
   */
  generateFraudReport(startDate: string, endDate: string): Observable<string> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/fraud/report`, {
      params,
      responseType: 'text'
    });
  }
}
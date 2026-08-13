// core/services/ai-forecast.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ForecastRequest {
  period: 'month' | 'quarter' | 'year';
  metric: 'approval_rate' | 'volume' | 'risk_score' | 'default_rate';
  confidenceLevel?: number;
}

export interface ForecastResponse {
  id: string;
  date: string;
  metric: string;
  currentValue: number;
  forecastValues: ForecastValue[];
  confidenceInterval: ConfidenceInterval;
  trend: 'up' | 'down' | 'stable';
  seasonality: string[];
  recommendations: string[];
}

export interface ForecastValue {
  period: string;
  value: number;
  lowerBound: number;
  upperBound: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number;
}

export interface ScenarioSimulation {
  id: string;
  name: string;
  description: string;
  parameters: ScenarioParameter[];
  expectedOutcome: number;
  probability: number;
  riskLevel: string;
}

export interface ScenarioParameter {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
}

@Injectable({
  providedIn: 'root'
})
export class AIForecastService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/manager/ai`;

  /**
   * Générer des prévisions
   */
  generateForecast(request: ForecastRequest): Observable<ForecastResponse> {
    return this.http.post<ForecastResponse>(`${this.apiUrl}/forecast/generate`, request);
  }

  /**
   * Récupérer les prévisions existantes
   */
  getForecasts(limit?: number): Observable<ForecastResponse[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<ForecastResponse[]>(`${this.apiUrl}/forecast/list`, { params });
  }

  /**
   * Récupérer une prévision par ID
   */
  getForecast(id: string): Observable<ForecastResponse> {
    return this.http.get<ForecastResponse>(`${this.apiUrl}/forecast/${id}`);
  }

  /**
   * Simuler des scénarios
   */
  simulateScenarios(parameters: any): Observable<ScenarioSimulation[]> {
    return this.http.post<ScenarioSimulation[]>(`${this.apiUrl}/forecast/scenarios`, parameters);
  }
}
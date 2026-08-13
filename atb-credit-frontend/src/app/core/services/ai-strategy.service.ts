// core/services/ai-strategy.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface StrategicReportRequest {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  includeRiskAnalysis: boolean;
  includePerformance: boolean;
  includeForecast: boolean;
  language: 'fr' | 'en' | 'ar';
}

export interface StrategicReportResponse {
  id: string;
  title: string;
  date: string;
  summary: string;
  sections: StrategicSection[];
  recommendations: string[];
  generatedBy: string;
  version: string;
}

export interface StrategicSection {
  title: string;
  content: string;
  metrics: SectionMetric[];
  chartData?: any;
}

export interface SectionMetric {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface AIDecisionDTO {
  id: string;
  requestNumber: string;
  clientName: string;
  aiRecommendation: string;
  riskScore: number;
  riskLevel: string;
  confidence: number;
  factors: string[];
  suggestedActions: string[];
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIStrategyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/manager/ai`;

  /**
   * Générer un rapport stratégique
   */
  generateStrategicReport(request: StrategicReportRequest): Observable<StrategicReportResponse> {
    return this.http.post<StrategicReportResponse>(`${this.apiUrl}/strategy/generate`, request);
  }

  /**
   * Récupérer les rapports stratégiques existants
   */
  getStrategicReports(limit?: number): Observable<StrategicReportResponse[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<StrategicReportResponse[]>(`${this.apiUrl}/strategy/reports`, { params });
  }

  /**
   * Récupérer un rapport spécifique
   */
  getStrategicReport(id: string): Observable<StrategicReportResponse> {
    return this.http.get<StrategicReportResponse>(`${this.apiUrl}/strategy/report/${id}`);
  }

  /**
   * Récupérer les décisions IA
   */
  getAIDecisions(): Observable<AIDecisionDTO[]> {
    return this.http.get<AIDecisionDTO[]>(`${this.apiUrl}/decisions`);
  }

  /**
   * Exporter un rapport
   */
  exportReport(id: string, format: 'pdf' | 'docx' | 'json'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/strategy/export/${id}`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Générer un résumé IA
   */
  generateSummary(data: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/strategy/summary`, data, {
      responseType: 'text' as 'json'
    });
  }
}
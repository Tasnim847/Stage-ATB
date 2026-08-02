// services/financial-analysis.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { 
  RatioCalculationRequest, 
  RatioCalculationResponse,
  FinancialAnalysisRequest,
  FinancialAnalysisResponse 
} from '../models/financial-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialAnalysisService {
  private apiUrl = `${environment.apiUrl}/financial-analysis`;

  constructor(private http: HttpClient) {}

  // ============================================
  // ÉCRAN 1: CALCUL DES RATIOS
  // ============================================
  
  calculateRatios(request: RatioCalculationRequest): Observable<RatioCalculationResponse> {
    return this.http.post<RatioCalculationResponse>(`${this.apiUrl}/ratios/calculate`, request);
  }

  // ============================================
  // ÉCRAN 2: ANALYSE FINANCIÈRE
  // ============================================
  
  analyzeFinancialSituation(request: FinancialAnalysisRequest): Observable<FinancialAnalysisResponse> {
    return this.http.post<FinancialAnalysisResponse>(`${this.apiUrl}/analyze`, request);
  }

  // ============================================
  // AUTRES MÉTHODES
  // ============================================
  
  getAnalysisById(id: string): Observable<FinancialAnalysisResponse> {
    return this.http.get<FinancialAnalysisResponse>(`${this.apiUrl}/${id}`);
  }

  getAnalysesByClient(clientId: string): Observable<FinancialAnalysisResponse[]> {
    return this.http.get<FinancialAnalysisResponse[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getAllAnalyses(): Observable<FinancialAnalysisResponse[]> {
    return this.http.get<FinancialAnalysisResponse[]>(`${this.apiUrl}/all`);
  }

  approveAnalysis(id: string, analystId: string): Observable<FinancialAnalysisResponse> {
    return this.http.post<FinancialAnalysisResponse>(`${this.apiUrl}/${id}/approve?analystId=${analystId}`, null);
  }

  rejectAnalysis(id: string, analystId: string, reason?: string): Observable<FinancialAnalysisResponse> {
    let url = `${this.apiUrl}/${id}/reject?analystId=${analystId}`;
    if (reason) {
      url += `&reason=${encodeURIComponent(reason)}`;
    }
    return this.http.post<FinancialAnalysisResponse>(url, null);
  }
}
// financial-analysis.service.ts - CORRIGÉ
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { FinancialAnalysisRequest, FinancialAnalysisResponse } from '../models/financial-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialAnalysisService {
  // ✅ CORRECTION - Ajouter /api/ dans l'URL
  private apiUrl = `${environment.apiUrl}/financial-analysis`;

  constructor(private http: HttpClient) {}

  calculateAnalysis(request: FinancialAnalysisRequest): Observable<FinancialAnalysisResponse> {
    return this.http.post<FinancialAnalysisResponse>(`${this.apiUrl}/calculate`, request);
  }

  simulateAnalysis(request: FinancialAnalysisRequest): Observable<FinancialAnalysisResponse> {
    return this.http.post<FinancialAnalysisResponse>(`${this.apiUrl}/simulate`, request);
  }

  getAnalysisById(id: string): Observable<FinancialAnalysisResponse> {
    return this.http.get<FinancialAnalysisResponse>(`${this.apiUrl}/${id}`);
  }

  getAnalysesByClient(clientId: string): Observable<FinancialAnalysisResponse[]> {
    return this.http.get<FinancialAnalysisResponse[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getAnalysesByCreditRequest(creditRequestId: string): Observable<FinancialAnalysisResponse[]> {
    return this.http.get<FinancialAnalysisResponse[]>(`${this.apiUrl}/credit-request/${creditRequestId}`);
  }

  getAnalysesByAnalyst(analystId: string): Observable<FinancialAnalysisResponse[]> {
    return this.http.get<FinancialAnalysisResponse[]>(`${this.apiUrl}/analyst/${analystId}`);
  }

  getAllAnalyses(): Observable<FinancialAnalysisResponse[]> {
    return this.http.get<FinancialAnalysisResponse[]>(`${this.apiUrl}/all`);
  }

  updateAnalysis(id: string, request: FinancialAnalysisRequest): Observable<FinancialAnalysisResponse> {
    return this.http.put<FinancialAnalysisResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteAnalysis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approveAnalysis(id: string, analystId: string): Observable<FinancialAnalysisResponse> {
    const params = new HttpParams().set('analystId', analystId);
    return this.http.post<FinancialAnalysisResponse>(`${this.apiUrl}/${id}/approve`, null, { params });
  }

  rejectAnalysis(id: string, analystId: string, reason?: string): Observable<FinancialAnalysisResponse> {
    let params = new HttpParams().set('analystId', analystId);
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.post<FinancialAnalysisResponse>(`${this.apiUrl}/${id}/reject`, null, { params });
  }
}
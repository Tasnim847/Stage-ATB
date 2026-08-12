// core/services/manager-validation.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { 
  ValidationSummaryDTO, 
  CreditResponseDTO,
  ManagerValidationRequest,
  DecisionReturnRequest
} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ManagerValidationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private baseUrl = `${environment.apiUrl}/manager/validation`;

  // ============================================
  // VALIDER LES DÉCISIONS
  // ============================================

  getPendingValidations(): Observable<ValidationSummaryDTO[]> {
    return this.http.get<ValidationSummaryDTO[]>(`${this.baseUrl}/pending`);
  }

  getHighAmountValidations(minAmount?: number): Observable<ValidationSummaryDTO[]> {
    let params = new HttpParams();
    if (minAmount !== undefined && minAmount !== null) {
      params = params.set('minAmount', minAmount.toString());
    }
    return this.http.get<ValidationSummaryDTO[]>(`${this.baseUrl}/high-amount`, { params });
  }

  getHighRiskValidations(riskThreshold?: number): Observable<ValidationSummaryDTO[]> {
    let params = new HttpParams();
    if (riskThreshold !== undefined && riskThreshold !== null) {
      params = params.set('riskThreshold', riskThreshold.toString());
    }
    return this.http.get<ValidationSummaryDTO[]>(`${this.baseUrl}/high-risk`, { params });
  }

  getPendingValidationsByDateRange(startDate: string, endDate: string): Observable<ValidationSummaryDTO[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ValidationSummaryDTO[]>(`${this.baseUrl}/date-range`, { params });
  }

  validateDecision(request: ManagerValidationRequest): Observable<CreditResponseDTO> {
    return this.http.post<CreditResponseDTO>(`${this.baseUrl}/validate`, request);
  }

  approveHighAmountCredit(creditRequestId: string, comments?: string): Observable<CreditResponseDTO> {
    let params = new HttpParams();
    if (comments !== undefined && comments !== null) {
      params = params.set('comments', comments);
    }
    return this.http.post<CreditResponseDTO>(
      `${this.baseUrl}/approve-high-amount/${creditRequestId}`,
      null,
      { params }
    );
  }

  rejectDecision(creditRequestId: string, reason: string, comments?: string): Observable<CreditResponseDTO> {
    let params = new HttpParams().set('reason', reason);
    if (comments !== undefined && comments !== null) {
      params = params.set('comments', comments);
    }
    return this.http.post<CreditResponseDTO>(
      `${this.baseUrl}/reject/${creditRequestId}`,
      null,
      { params }
    );
  }

  returnToAnalyst(request: DecisionReturnRequest): Observable<CreditResponseDTO> {
    return this.http.post<CreditResponseDTO>(`${this.baseUrl}/return-to-analyst`, request);
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  getValidationStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  getValidationHistory(startDate: string, endDate: string): Observable<CreditResponseDTO[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<CreditResponseDTO[]>(`${this.baseUrl}/history`, { params });
  }

  getValidationDetails(creditRequestId: string): Observable<CreditResponseDTO> {
    return this.http.get<CreditResponseDTO>(`${this.baseUrl}/details/${creditRequestId}`);
  }

  requiresManagerValidation(creditRequestId: string): Observable<{ requiresValidation: boolean; creditRequestId: string }> {
    return this.http.get<{ requiresValidation: boolean; creditRequestId: string }>(
      `${this.baseUrl}/requires-validation/${creditRequestId}`
    );
  }

  generateValidationReport(startDate: string, endDate: string): Observable<string> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get(`${this.baseUrl}/report`, {
      params,
      responseType: 'text'
    });
  }
}
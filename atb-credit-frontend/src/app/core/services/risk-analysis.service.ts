import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  RiskModel,
  RiskThreshold,
  FinancialRatioConfig,
  DecisionRule,
  AlertConfig,
  KycAmlConfig,
  AIConfig,
  FraudRule,
  AuditLog,
  RiskLevel
} from '@app/core/models/risk-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class RiskAnalysisService {
  private apiUrl = `${environment.apiUrl}/risk`;
  private adminApiUrl = `${environment.apiUrl}/admin`; // ✅ Pour les endpoints admin

  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  // Error states
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================
  // GESTION DES ERREURS
  // ============================================
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur';
          break;
        case 400:
          errorMessage = 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès refusé - Permissions insuffisantes';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    if (loading) {
      this.errorSubject.next(null);
    }
  }

  // ============================================
  // 1. MODÈLES DE RISQUE
  // ============================================
  getRiskModels(): Observable<RiskModel[]> {
    this.setLoading(true);
    return this.http.get<RiskModel[]>(`${this.apiUrl}/models`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  addRiskModel(model: Partial<RiskModel>): Observable<RiskModel> {
    this.setLoading(true);
    return this.http.post<RiskModel>(`${this.apiUrl}/models`, model)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateRiskModel(id: string, model: Partial<RiskModel>): Observable<RiskModel> {
    this.setLoading(true);
    return this.http.put<RiskModel>(`${this.apiUrl}/models/${id}`, model)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  deleteRiskModel(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/models/${id}`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  toggleRiskModel(id: string, active: boolean): Observable<RiskModel> {
    this.setLoading(true);
    return this.http.patch<RiskModel>(`${this.apiUrl}/models/${id}/toggle`, { active })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 2. SEUILS DE RISQUE
  // ============================================
  getRiskThresholds(): Observable<RiskThreshold[]> {
    this.setLoading(true);
    return this.http.get<RiskThreshold[]>(`${this.apiUrl}/thresholds`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateRiskThresholds(thresholds: RiskThreshold[]): Observable<RiskThreshold[]> {
    this.setLoading(true);
    return this.http.put<RiskThreshold[]>(`${this.apiUrl}/thresholds`, thresholds)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 3. RATIOS FINANCIERS
  // ============================================
  getFinancialRatios(): Observable<FinancialRatioConfig[]> {
    this.setLoading(true);
    return this.http.get<FinancialRatioConfig[]>(`${this.apiUrl}/ratios`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateFinancialRatio(id: string, ratio: Partial<FinancialRatioConfig>): Observable<FinancialRatioConfig> {
    this.setLoading(true);
    return this.http.put<FinancialRatioConfig>(`${this.apiUrl}/ratios/${id}`, ratio)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 4. RÈGLES DE DÉCISION
  // ============================================
  getDecisionRules(): Observable<DecisionRule[]> {
    this.setLoading(true);
    return this.http.get<DecisionRule[]>(`${this.apiUrl}/rules`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  addDecisionRule(rule: Partial<DecisionRule>): Observable<DecisionRule> {
    this.setLoading(true);
    return this.http.post<DecisionRule>(`${this.apiUrl}/rules`, rule)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateDecisionRule(id: string, rule: Partial<DecisionRule>): Observable<DecisionRule> {
    this.setLoading(true);
    return this.http.put<DecisionRule>(`${this.apiUrl}/rules/${id}`, rule)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  deleteDecisionRule(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/rules/${id}`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  toggleDecisionRule(id: string, active: boolean): Observable<DecisionRule> {
    this.setLoading(true);
    return this.http.patch<DecisionRule>(`${this.apiUrl}/rules/${id}/toggle`, { active })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  reorderRules(ruleIds: string[]): Observable<void> {
    this.setLoading(true);
    return this.http.post<void>(`${this.apiUrl}/rules/reorder`, { ruleIds })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 5. ALERTES
  // ============================================
  getAlertConfigs(): Observable<AlertConfig[]> {
    this.setLoading(true);
    return this.http.get<AlertConfig[]>(`${this.apiUrl}/alerts`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  addAlertConfig(alert: Partial<AlertConfig>): Observable<AlertConfig> {
    this.setLoading(true);
    return this.http.post<AlertConfig>(`${this.apiUrl}/alerts`, alert)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateAlertConfig(id: string, alert: Partial<AlertConfig>): Observable<AlertConfig> {
    this.setLoading(true);
    return this.http.put<AlertConfig>(`${this.apiUrl}/alerts/${id}`, alert)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  deleteAlertConfig(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/alerts/${id}`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  toggleAlertConfig(id: string, active: boolean): Observable<AlertConfig> {
    this.setLoading(true);
    return this.http.patch<AlertConfig>(`${this.apiUrl}/alerts/${id}/toggle`, { active })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 6. KYC / AML
  // ============================================
  getKycAmlConfigs(): Observable<KycAmlConfig[]> {
    this.setLoading(true);
    return this.http.get<KycAmlConfig[]>(`${this.apiUrl}/kyc-aml`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateKycAmlConfig(id: string, config: Partial<KycAmlConfig>): Observable<KycAmlConfig> {
    this.setLoading(true);
    return this.http.put<KycAmlConfig>(`${this.apiUrl}/kyc-aml/${id}`, config)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  toggleKycAmlCheck(configId: string, checkId: string, active: boolean): Observable<KycAmlConfig> {
    this.setLoading(true);
    return this.http.patch<KycAmlConfig>(
      `${this.apiUrl}/kyc-aml/${configId}/checks/${checkId}`, 
      { active }
    ).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // ============================================
  // 7. IA CONFIG
  // ============================================
  getAIConfig(): Observable<AIConfig> {
    this.setLoading(true);
    return this.http.get<AIConfig>(`${this.apiUrl}/ai-config`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateAIConfig(config: Partial<AIConfig>): Observable<AIConfig> {
    this.setLoading(true);
    return this.http.put<AIConfig>(`${this.apiUrl}/ai-config`, config)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 8. FRAUDE DETECTION
  // ============================================
  getFraudRules(): Observable<FraudRule[]> {
    this.setLoading(true);
    return this.http.get<FraudRule[]>(`${this.apiUrl}/fraud-rules`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  updateFraudRule(id: string, rule: Partial<FraudRule>): Observable<FraudRule> {
    this.setLoading(true);
    return this.http.put<FraudRule>(`${this.apiUrl}/fraud-rules/${id}`, rule)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  toggleFraudRule(id: string, active: boolean): Observable<FraudRule> {
    this.setLoading(true);
    return this.http.patch<FraudRule>(`${this.apiUrl}/fraud-rules/${id}/toggle`, { active })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 9. AUDIT LOGS - ✅ CORRECTION
  // ============================================
  getAuditLogs(): Observable<AuditLog[]> {
    this.setLoading(true);
    // ✅ Utiliser le bon endpoint (admin/audit-logs)
    return this.http.get<AuditLog[]>(`${this.adminApiUrl}/audit-logs`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 10. SCORING
  // ============================================
  calculateRiskScore(clientId: string, creditRequestId: string): Observable<any> {
    this.setLoading(true);
    return this.http.post(`${this.apiUrl}/calculate-score`, { clientId, creditRequestId })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 11. EXPORT / IMPORT CONFIGURATION
  // ============================================
  exportConfiguration(): Observable<any> {
    this.setLoading(true);
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  importConfiguration(file: File): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.apiUrl}/import`, formData)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 12. RESET TO DEFAULTS
  // ============================================
  resetToDefaults(): Observable<any> {
    this.setLoading(true);
    return this.http.post(`${this.apiUrl}/reset`, {})
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  // ============================================
  // 13. CLEAR ERROR
  // ============================================
  clearError(): void {
    this.errorSubject.next(null);
  }
}
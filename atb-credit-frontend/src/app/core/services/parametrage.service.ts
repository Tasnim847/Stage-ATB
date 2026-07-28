// services/parametrage.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

// ============================================
// MODELS (à déplacer dans core/models si nécessaire)
// ============================================

export interface CreditType {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'PERSONAL' | 'AUTO' | 'MORTGAGE' | 'BUSINESS' | 'STUDENT' | 'CONSUMER' | 'BRIDGE' | 'REVOLVING';
  isActive: boolean;
  minDurationMonths: number;
  maxDurationMonths: number;
  minAmount: number;
  maxAmount: number;
  baseInterestRate: number;
  requiresCollateral: boolean;
  requiresGuarantor: boolean;
  requiredDocuments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterestRate {
  id: string;
  creditTypeId: string;
  creditTypeName?: string;
  rate: number;
  minRate?: number;
  maxRate?: number;
  isDefault: boolean;
  clientCategory?: 'PREMIUM' | 'STANDARD' | 'RISK';
  rateAdjustment?: number;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DurationConfig {
  id: string;
  creditTypeId: string;
  creditTypeName?: string;
  durationMonths: number;
  label: string;
  isDefault: boolean;
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CeilingConfig {
  id: string;
  creditTypeId: string;
  creditTypeName?: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  isActive: boolean;
  approvalLevel: 'ADVISOR' | 'ANALYST' | 'MANAGER' | 'DIRECTOR';
  requiresAdditionalApproval: boolean;
  additionalApprovalLevel?: 'MANAGER' | 'DIRECTOR';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DTOs
// ============================================

export interface CreateCreditTypeDTO {
  code: string;
  name: string;
  description: string;
  category: CreditType['category'];
  minDurationMonths: number;
  maxDurationMonths: number;
  minAmount: number;
  maxAmount: number;
  baseInterestRate: number;
  requiresCollateral: boolean;
  requiresGuarantor: boolean;
  requiredDocuments: string[];
}

export interface UpdateCreditTypeDTO extends Partial<CreateCreditTypeDTO> {
  isActive?: boolean;
}

export interface CreateInterestRateDTO {
  creditTypeId: string;
  rate: number;
  minRate?: number;
  maxRate?: number;
  isDefault: boolean;
  clientCategory?: 'PREMIUM' | 'STANDARD' | 'RISK';
  rateAdjustment?: number;
  effectiveDate: string;
  expiryDate?: string;
}

export interface UpdateInterestRateDTO extends Partial<CreateInterestRateDTO> {
  isActive?: boolean;
}

export interface CreateDurationConfigDTO {
  creditTypeId: string;
  durationMonths: number;
  label: string;
  isDefault: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export interface UpdateDurationConfigDTO extends Partial<CreateDurationConfigDTO> {
  isActive?: boolean;
}

export interface CreateCeilingConfigDTO {
  creditTypeId: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  approvalLevel: CeilingConfig['approvalLevel'];
  requiresAdditionalApproval: boolean;
  additionalApprovalLevel?: CeilingConfig['additionalApprovalLevel'];
}

export interface UpdateCeilingConfigDTO extends Partial<CreateCeilingConfigDTO> {
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ParametrageService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Subjects pour les mises à jour en temps réel
  private creditTypesSubject = new BehaviorSubject<CreditType[]>([]);
  private interestRatesSubject = new BehaviorSubject<InterestRate[]>([]);
  private durationsSubject = new BehaviorSubject<DurationConfig[]>([]);
  private ceilingsSubject = new BehaviorSubject<CeilingConfig[]>([]);

  // Observables
  creditTypes$ = this.creditTypesSubject.asObservable();
  interestRates$ = this.interestRatesSubject.asObservable();
  durations$ = this.durationsSubject.asObservable();
  ceilings$ = this.ceilingsSubject.asObservable();

  // ============================================
  // TYPES DE CRÉDIT
  // ============================================
  
  getAllCreditTypes(): Observable<CreditType[]> {
    return this.http.get<CreditType[]>(`${this.apiUrl}/parametrage/credit-types`)
      .pipe(tap(data => this.creditTypesSubject.next(data)));
  }

  getActiveCreditTypes(): Observable<CreditType[]> {
    return this.http.get<CreditType[]>(`${this.apiUrl}/parametrage/credit-types/active`);
  }

  getCreditTypeById(id: string): Observable<CreditType> {
    return this.http.get<CreditType>(`${this.apiUrl}/parametrage/credit-types/${id}`);
  }

  createCreditType(data: CreateCreditTypeDTO): Observable<CreditType> {
    return this.http.post<CreditType>(`${this.apiUrl}/parametrage/credit-types`, data)
      .pipe(tap(() => this.getAllCreditTypes().subscribe()));
  }

  updateCreditType(id: string, data: UpdateCreditTypeDTO): Observable<CreditType> {
    return this.http.patch<CreditType>(`${this.apiUrl}/parametrage/credit-types/${id}`, data)
      .pipe(tap(() => this.getAllCreditTypes().subscribe()));
  }

  deleteCreditType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/parametrage/credit-types/${id}`)
      .pipe(tap(() => this.getAllCreditTypes().subscribe()));
  }

  toggleCreditTypeStatus(id: string): Observable<CreditType> {
    return this.http.patch<CreditType>(`${this.apiUrl}/parametrage/credit-types/${id}/toggle`, {})
      .pipe(tap(() => this.getAllCreditTypes().subscribe()));
  }

  // ============================================
  // TAUX D'INTÉRÊT
  // ============================================
  
  getInterestRates(): Observable<InterestRate[]> {
    return this.http.get<InterestRate[]>(`${this.apiUrl}/parametrage/interest-rates`)
      .pipe(tap(data => this.interestRatesSubject.next(data)));
  }

  getInterestRatesByCreditType(creditTypeId: string): Observable<InterestRate[]> {
    return this.http.get<InterestRate[]>(`${this.apiUrl}/parametrage/interest-rates/credit-type/${creditTypeId}`);
  }

  getDefaultInterestRate(creditTypeId: string): Observable<InterestRate> {
    return this.http.get<InterestRate>(`${this.apiUrl}/parametrage/interest-rates/default/${creditTypeId}`);
  }

  getInterestRateById(id: string): Observable<InterestRate> {
    return this.http.get<InterestRate>(`${this.apiUrl}/parametrage/interest-rates/${id}`);
  }

  createInterestRate(data: CreateInterestRateDTO): Observable<InterestRate> {
    return this.http.post<InterestRate>(`${this.apiUrl}/parametrage/interest-rates`, data)
      .pipe(tap(() => this.getInterestRates().subscribe()));
  }

  updateInterestRate(id: string, data: UpdateInterestRateDTO): Observable<InterestRate> {
    return this.http.patch<InterestRate>(`${this.apiUrl}/parametrage/interest-rates/${id}`, data)
      .pipe(tap(() => this.getInterestRates().subscribe()));
  }

  deleteInterestRate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/parametrage/interest-rates/${id}`)
      .pipe(tap(() => this.getInterestRates().subscribe()));
  }

  toggleInterestRateStatus(id: string): Observable<InterestRate> {
    return this.http.patch<InterestRate>(`${this.apiUrl}/parametrage/interest-rates/${id}/toggle`, {})
      .pipe(tap(() => this.getInterestRates().subscribe()));
  }

  // ============================================
  // DURÉES
  // ============================================
  
  getDurationConfigs(): Observable<DurationConfig[]> {
    return this.http.get<DurationConfig[]>(`${this.apiUrl}/parametrage/durations`)
      .pipe(tap(data => this.durationsSubject.next(data)));
  }

  getDurationConfigsByCreditType(creditTypeId: string): Observable<DurationConfig[]> {
    return this.http.get<DurationConfig[]>(`${this.apiUrl}/parametrage/durations/credit-type/${creditTypeId}`);
  }

  getDurationConfigById(id: string): Observable<DurationConfig> {
    return this.http.get<DurationConfig>(`${this.apiUrl}/parametrage/durations/${id}`);
  }

  getDefaultDuration(creditTypeId: string): Observable<DurationConfig> {
    return this.http.get<DurationConfig>(`${this.apiUrl}/parametrage/durations/default/${creditTypeId}`);
  }

  createDurationConfig(data: CreateDurationConfigDTO): Observable<DurationConfig> {
    return this.http.post<DurationConfig>(`${this.apiUrl}/parametrage/durations`, data)
      .pipe(tap(() => this.getDurationConfigs().subscribe()));
  }

  updateDurationConfig(id: string, data: UpdateDurationConfigDTO): Observable<DurationConfig> {
    return this.http.patch<DurationConfig>(`${this.apiUrl}/parametrage/durations/${id}`, data)
      .pipe(tap(() => this.getDurationConfigs().subscribe()));
  }

  deleteDurationConfig(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/parametrage/durations/${id}`)
      .pipe(tap(() => this.getDurationConfigs().subscribe()));
  }

  toggleDurationStatus(id: string): Observable<DurationConfig> {
    return this.http.patch<DurationConfig>(`${this.apiUrl}/parametrage/durations/${id}/toggle`, {})
      .pipe(tap(() => this.getDurationConfigs().subscribe()));
  }

  // ============================================
  // PLAFONDS
  // ============================================
  
  getCeilingConfigs(): Observable<CeilingConfig[]> {
    return this.http.get<CeilingConfig[]>(`${this.apiUrl}/parametrage/ceilings`)
      .pipe(tap(data => this.ceilingsSubject.next(data)));
  }

  getCeilingConfigsByCreditType(creditTypeId: string): Observable<CeilingConfig[]> {
    return this.http.get<CeilingConfig[]>(`${this.apiUrl}/parametrage/ceilings/credit-type/${creditTypeId}`);
  }

  getCeilingConfigById(id: string): Observable<CeilingConfig> {
    return this.http.get<CeilingConfig>(`${this.apiUrl}/parametrage/ceilings/${id}`);
  }

  getCeilingByAmount(creditTypeId: string, amount: number): Observable<CeilingConfig> {
    return this.http.get<CeilingConfig>(`${this.apiUrl}/parametrage/ceilings/amount/${creditTypeId}/${amount}`);
  }

  createCeilingConfig(data: CreateCeilingConfigDTO): Observable<CeilingConfig> {
    return this.http.post<CeilingConfig>(`${this.apiUrl}/parametrage/ceilings`, data)
      .pipe(tap(() => this.getCeilingConfigs().subscribe()));
  }

  updateCeilingConfig(id: string, data: UpdateCeilingConfigDTO): Observable<CeilingConfig> {
    return this.http.patch<CeilingConfig>(`${this.apiUrl}/parametrage/ceilings/${id}`, data)
      .pipe(tap(() => this.getCeilingConfigs().subscribe()));
  }

  deleteCeilingConfig(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/parametrage/ceilings/${id}`)
      .pipe(tap(() => this.getCeilingConfigs().subscribe()));
  }

  toggleCeilingStatus(id: string): Observable<CeilingConfig> {
    return this.http.patch<CeilingConfig>(`${this.apiUrl}/parametrage/ceilings/${id}/toggle`, {})
      .pipe(tap(() => this.getCeilingConfigs().subscribe()));
  }

  // ============================================
  // UTILITAIRES
  // ============================================
  
  getApprovalLevels(): { value: string; label: string }[] {
    return [
      { value: 'ADVISOR', label: 'Conseiller' },
      { value: 'ANALYST', label: 'Analyste' },
      { value: 'MANAGER', label: 'Responsable' },
      { value: 'DIRECTOR', label: 'Directeur' }
    ];
  }

  getCreditCategories(): { value: string; label: string }[] {
    return [
      { value: 'PERSONAL', label: 'Crédit personnel' },
      { value: 'AUTO', label: 'Crédit automobile' },
      { value: 'MORTGAGE', label: 'Crédit immobilier' },
      { value: 'BUSINESS', label: 'Crédit professionnel' },
      { value: 'STUDENT', label: 'Crédit étudiant' },
      { value: 'CONSUMER', label: 'Crédit à la consommation' },
      { value: 'BRIDGE', label: 'Prêt relais' },
      { value: 'REVOLVING', label: 'Crédit renouvelable' }
    ];
  }

  getClientCategories(): { value: string; label: string }[] {
    return [
      { value: 'PREMIUM', label: 'Client Premium (-0.5%)' },
      { value: 'STANDARD', label: 'Client Standard' },
      { value: 'RISK', label: 'Client à risque (+1%)' }
    ];
  }

  getCurrencyOptions(): { value: string; label: string }[] {
    return [
      { value: 'TND', label: 'Dinar Tunisien (DT)' },
      { value: 'EUR', label: 'Euro (€)' },
      { value: 'USD', label: 'Dollar ($)' }
    ];
  }

  getDocumentTypes(): { value: string; label: string }[] {
    return [
      { value: 'ID', label: "Pièce d'identité" },
      { value: 'PROOF_OF_ADDRESS', label: 'Justificatif de domicile' },
      { value: 'INCOME_PROOF', label: 'Justificatif de revenus' },
      { value: 'BANK_STATEMENT', label: 'Relevé bancaire' },
      { value: 'TAX_RETURN', label: 'Déclaration fiscale' },
      { value: 'EMPLOYMENT_CONTRACT', label: 'Contrat de travail' },
      { value: 'BUSINESS_REGISTRATION', label: 'Registre de commerce' },
      { value: 'FINANCIAL_STATEMENT', label: 'États financiers' }
    ];
  }

  // ✅ Ajouter cette méthode pour récupérer les types de crédit (utilisée dans les composants)
  getCreditTypes(): Observable<CreditType[]> {
    return this.http.get<CreditType[]>(`${this.apiUrl}/parametrage/credit-types`);
  }

  // ✅ Méthode pour valider un montant
  validateAmount(creditTypeId: string, amount: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/parametrage/validate/amount/${creditTypeId}/${amount}`);
  }
}
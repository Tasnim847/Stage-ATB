// core/services/kpi.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface RecentActivityDTO {
  creditRequestId: string;
  requestNumber: string;
  clientName: string;
  action: string;
  status: string;
  actionDate: string;
  amount: number;
}

export interface ManagerKPIDTO {
  // KPI Généraux
  totalCreditRequests: number;
  totalAmount: number;
  averageAmount: number;
  
  // KPI par statut
  pendingCount: number;
  pendingAmount: number;
  underReviewCount: number;
  underReviewAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  completedCount: number;
  completedAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
  
  // KPI de performance
  approvalRate: number;
  rejectionRate: number;
  averageProcessingDays: number;
  averageDecisionHours: number;
  
  // KPI de risque
  highRiskCount: number;
  highRiskAmount: number;
  averageRiskScore: number;
  
  // KPI des analystes
  totalAnalysts: number;
  activeAnalysts: number;
  averageWorkload: number;
  
  // KPI de validation manager
  pendingValidationCount: number;
  validatedCount: number;
  managerApprovalRate: number;
  
  // KPI mensuels
  monthlyKPIs: MonthlyKPIDTO[];
  
  // KPI par type de crédit
  creditTypeDistribution: CreditTypeKPI[];
  
  // KPI par analyste
  analystKPIs: AnalystKPIDTO[];
  
  // ✅ AJOUTER recentActivities
  recentActivities: RecentActivityDTO[];
}

export interface MonthlyKPIDTO {
  month: string;
  year: number;
  requestsCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalAmount: number;
  approvalRate: number;
}

export interface CreditTypeKPI {
  creditTypeId: string;
  creditTypeName: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  approvalRate: number;
}

export interface AnalystKPIDTO {
  analystId: string;
  analystName: string;
  processedCount: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
  averageProcessingTime: number;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class KPIService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/manager/kpis`;

  getManagerKPIs(): Observable<ManagerKPIDTO> {
    return this.http.get<ManagerKPIDTO>(`${this.apiUrl}/dashboard`);
  }

  getKPIsByDateRange(startDate: string, endDate: string): Observable<ManagerKPIDTO> {
    return this.http.get<ManagerKPIDTO>(`${this.apiUrl}/date-range`, {
      params: { startDate, endDate }
    });
  }

  getAnalystPerformanceKPIs(): Observable<AnalystKPIDTO[]> {
    return this.http.get<AnalystKPIDTO[]>(`${this.apiUrl}/analysts/performance`);
  }

  getManagerValidationKPIs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validation`);
  }
}
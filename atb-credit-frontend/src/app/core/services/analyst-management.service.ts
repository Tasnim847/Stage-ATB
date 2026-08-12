// services/analyst-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreditResponseDTO } from '../models';

export interface AnalystAssignmentRequest {
  creditRequestId: string;
  analystId: string;
  notes?: string;
  forceAssign: boolean;
}

export interface BatchAssignmentRequest {
  assignments: {
    creditRequestId: string;
    analystId: string;
  }[];
}

export interface AnalystPerformanceDTO {
  analystId: string;
  analystName: string;
  analystEmail: string;
  department: string;
  position: string;
  totalProcessed: number;
  pendingRequests: number;
  totalApproved: number;
  totalRejected: number;
  totalCancelled: number;
  approvalRate: number;
  rejectionRate: number;
  averageProcessingTimeDays: number;
  averageDecisionTimeHours: number;
  totalAmountApproved: number;
  totalAmountRejected: number;
  averageAmountPerRequest: number;
  requestsByStatus: { [key: string]: number };
  monthlyPerformance: MonthlyPerformanceDTO[];
  recentActivities: RecentActivityDTO[];
  rank: number;
  performanceLevel: string;
  lastActivityDate: string;
}

export interface MonthlyPerformanceDTO {
  month: string;
  year: number;
  processedCount: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
  totalAmount: number;
  averageProcessingTime: number;
}

export interface RecentActivityDTO {
  creditRequestId: string;
  requestNumber: string;
  clientName: string;
  action: string;
  status: string;
  actionDate: string;
  amount: number;
}

export interface AnalystWorkloadDTO {
  analystId: string;
  analystName: string;
  analystEmail: string;
  currentWorkload: number;
  maxCapacity: number;
  workloadPercentage: number;
  workloadLevel: string;
  assignedRequests: CreditRequestSummaryDTO[];
}

export interface CreditRequestSummaryDTO {
  id: string;
  requestNumber: string;
  clientName: string;
  amount: number;
  status: string;
  createdAt: string;
  priority: string;
  daysPending: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalystManagementService {
  private baseUrl = `${environment.apiUrl}/manager/analysts`;

  constructor(private http: HttpClient) {}

  // ============================================
  // VOIR LES DOSSIERS TRAITÉS
  // ============================================

  getAllProcessedFiles(): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.baseUrl}/processed-files`);
  }

  getProcessedFilesByAnalyst(analystId: string): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.baseUrl}/processed-files/${analystId}`);
  }

  getProcessedFilesByDateRange(startDate: string, endDate: string): Observable<CreditResponseDTO[]> {
    return this.http.get<CreditResponseDTO[]>(`${this.baseUrl}/processed-files/date-range`, {
      params: { startDate, endDate }
    });
  }

  getPendingAssignmentRequests(): Observable<CreditRequestSummaryDTO[]> {
    return this.http.get<CreditRequestSummaryDTO[]>(`${this.baseUrl}/pending-assignment`);
  }

  // ============================================
  // RÉPARTIR LES DOSSIERS
  // ============================================

  assignRequestToAnalyst(request: AnalystAssignmentRequest): Observable<CreditResponseDTO> {
    return this.http.post<CreditResponseDTO>(`${this.baseUrl}/assign`, request);
  }

  batchAssignRequests(request: BatchAssignmentRequest): Observable<CreditResponseDTO[]> {
    return this.http.post<CreditResponseDTO[]>(`${this.baseUrl}/assign/batch`, request);
  }

  autoDistributeRequests(creditRequestIds: string[]): Observable<{ [key: string]: CreditResponseDTO[] }> {
    return this.http.post<{ [key: string]: CreditResponseDTO[] }>(
      `${this.baseUrl}/distribute/auto`,
      creditRequestIds
    );
  }

  rebalanceWorkload(): Observable<{ [key: string]: CreditResponseDTO[] }> {
    return this.http.post<{ [key: string]: CreditResponseDTO[] }>(
      `${this.baseUrl}/rebalance`,
      {}
    );
  }

  reassignRequest(creditRequestId: string, newAnalystId: string, reason?: string): Observable<CreditResponseDTO> {
    return this.http.patch<CreditResponseDTO>(
      `${this.baseUrl}/reassign/${creditRequestId}`,
      null,
      { params: { newAnalystId, reason: reason || '' } }
    );
  }

  // ============================================
  // SUIVRE LES PERFORMANCES
  // ============================================

  getAllAnalystPerformance(): Observable<AnalystPerformanceDTO[]> {
    return this.http.get<AnalystPerformanceDTO[]>(`${this.baseUrl}/performance`);
  }

  getAnalystPerformance(analystId: string): Observable<AnalystPerformanceDTO> {
    return this.http.get<AnalystPerformanceDTO>(`${this.baseUrl}/performance/${analystId}`);
  }

  getAllAnalystWorkload(): Observable<AnalystWorkloadDTO[]> {
    return this.http.get<AnalystWorkloadDTO[]>(`${this.baseUrl}/workload`);
  }

  getAnalystWorkload(analystId: string): Observable<AnalystWorkloadDTO> {
    return this.http.get<AnalystWorkloadDTO>(`${this.baseUrl}/workload/${analystId}`);
  }

  getAnalystRanking(): Observable<AnalystPerformanceDTO[]> {
    return this.http.get<AnalystPerformanceDTO[]>(`${this.baseUrl}/ranking`);
  }

  generatePerformanceReport(startDate: string, endDate: string): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/report`, {
      params: { startDate, endDate },
      responseType: 'text' as 'json'
    });
  }
}
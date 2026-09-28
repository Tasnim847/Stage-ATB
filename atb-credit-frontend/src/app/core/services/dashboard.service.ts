// core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

// ============================================================
// DTOs — alignés sur le backend Java
// ============================================================

export interface RecentActivity {
  creditRequestId: string;
  requestNumber: string;
  clientName: string;
  action: string;
  status: string;          // DRAFT | PENDING_ANALYSIS | UNDER_REVIEW | ...
  actionDate: string;      // LocalDateTime sérialisé en ISO
  amount: number;
}

export interface TopAnalyst {
  analystId: string;
  name: string;            // ⚠️ Le backend envoie "name" dans TopAnalystDTO
  email: string;
  requests: number;        // ⚠️ Le backend envoie "requests" dans TopAnalystDTO
  approvedCount: number;
  rejectedCount: number;
  avgScore: number;        // ⚠️ Le backend envoie "avgScore" dans TopAnalystDTO
}

export interface AnalystPerformance {
  analystId: string;
  analystName: string;
  analystEmail: string;
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
  requestsByStatus: Record<string, number>;
  rank: number;
  performanceLevel: string;
  lastActivityDate: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEmployees: number;
  totalClients: number;
  totalCreditRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  fraudAlerts: number;
  totalAmountFinanced: number;
  highRiskRequests: number;
  totalNotifications: number;
  pendingKYCVerifications: number;
  creditStatusDistribution: Record<string, number>;
  riskLevelDistribution: Record<string, number>;
  approvalRate: number;
  recentActivities: RecentActivity[];
  topAnalysts: TopAnalyst[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getTopAnalysts(limit: number = 10): Observable<AnalystPerformance[]> {
    return this.http.get<AnalystPerformance[]>(
      `${this.apiUrl}/analysts/top?limit=${limit}`
    );
  }

  getRecentActivities(limit: number = 10): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(
      `${this.apiUrl}/activities/recent?limit=${limit}`
    );
  }
}
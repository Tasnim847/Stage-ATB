import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '@core/services/auth.service';
import {
  DashboardService,
  DashboardStats,
  RecentActivity,
  TopAnalyst
} from '@core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  isLoading = true;
  user: any = null;

  stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalEmployees: 0,
    totalClients: 0,
    totalCreditRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    fraudAlerts: 0
  };

  recentActivities: RecentActivity[] = [];
  topAnalysts: TopAnalyst[] = [];

  ngOnInit(): void {
    this.user = this.authService.getUserInfo();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.dashboardService.getStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.toastr.error('Impossible de charger les statistiques', 'Erreur');
          console.error(err);
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe((data: DashboardStats | null) => {
        if (!data) return;

        this.stats = {
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          totalEmployees: data.totalEmployees,
          totalClients: data.totalClients,
          totalCreditRequests: data.totalCreditRequests,
          pendingRequests: data.pendingRequests,
          approvedRequests: data.approvedRequests,
          rejectedRequests: data.rejectedRequests,
          fraudAlerts: data.fraudAlerts
        };

        this.recentActivities = data.recentActivities || [];
        this.topAnalysts = data.topAnalysts || [];
      });
  }

  getInitials(): string {
    if (!this.user) return 'A';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return 'Administrateur';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Administrateur';
  }

  // ============================================================
  // Helpers pour mapper le STATUT (backend) → type d'activité (UI)
  // ============================================================
  getActivityTypeFromStatus(status: string): string {
    switch (status) {
      case 'APPROVED':           return 'approval';
      case 'REJECTED':           return 'fraud';
      case 'PENDING_ANALYSIS':   return 'credit';
      case 'UNDER_REVIEW':       return 'credit';   // ✅ corrigé (était PENDING_REVIEW)
      case 'PENDING_DOCUMENTS':  return 'credit';
      case 'COMPLETED':          return 'approval';
      case 'CANCELLED':          return 'fraud';
      case 'DRAFT':              return 'system';
      default:                   return 'system';
    }
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      credit:   'assignment',
      approval: 'check_circle',
      user:     'person_add',
      fraud:    'security',
      system:   'settings'
    };
    return icons[type] || 'info';
  }

  getActivityColor(type: string): string {
    const colors: Record<string, string> = {
      credit:   '#C62828',
      approval: '#1B5E20',
      user:     '#0D47A1',
      fraud:    '#B71C1C',
      system:   '#4A148C'
    };
    return colors[type] || '#888';
  }

  // ============================================================
  // Helpers de formatage pour le template
  // ============================================================
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMs / 3600000);
      const diffD = Math.floor(diffMs / 86400000);

      if (diffMin < 1)  return "à l'instant";
      if (diffMin < 60) return `il y a ${diffMin} min`;
      if (diffH < 24)   return `il y a ${diffH} h`;
      if (diffD < 7)    return `il y a ${diffD} j`;

      return d.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
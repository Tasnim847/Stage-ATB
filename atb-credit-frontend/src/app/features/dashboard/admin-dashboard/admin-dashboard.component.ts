// features/dashboard/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { CreditRequestService } from '@core/services/credit-request.service';

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
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;

  // Statistiques
  stats = {
    totalUsers: 0,
    totalEmployees: 0,
    totalClients: 0,
    totalCreditRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    fraudAlerts: 0,
    activeUsers: 0,
    totalNotifications: 0
  };

  // Dernières activités
  recentActivities: any[] = [];
  topAnalysts: any[] = [];

  // Données utilisateur
  user: any = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private creditService: CreditRequestService
  ) {}

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
    // Simuler le chargement des données
    setTimeout(() => {
      this.stats = {
        totalUsers: 42,
        totalEmployees: 38,
        totalClients: 156,
        totalCreditRequests: 89,
        pendingRequests: 23,
        approvedRequests: 45,
        rejectedRequests: 21,
        fraudAlerts: 3,
        activeUsers: 38,
        totalNotifications: 12
      };

      this.recentActivities = [
        { user: 'Jean Dupont', action: 'a créé une demande de crédit', time: 'Il y a 5 min', type: 'credit' },
        { user: 'Marie Martin', action: 'a approuvé une demande', time: 'Il y a 15 min', type: 'approval' },
        { user: 'Pierre Durand', action: 'a rejoint la plateforme', time: 'Il y a 30 min', type: 'user' },
        { user: 'Sophie Bernard', action: 'a signalé une alerte fraude', time: 'Il y a 1h', type: 'fraud' },
        { user: 'Thomas Petit', action: 'a modifié un paramètre système', time: 'Il y a 2h', type: 'system' }
      ];

      this.topAnalysts = [
        { name: 'Marie Martin', requests: 24, avgScore: 95 },
        { name: 'Jean Dupont', requests: 18, avgScore: 88 },
        { name: 'Pierre Durand', requests: 15, avgScore: 82 }
      ];

      this.isLoading = false;
    }, 800);
  }

  getInitials(): string {
    if (!this.user) return 'A';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return 'Administrateur';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Administrateur';
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'ANALYST': 'Analyste',
      'ADVISOR': 'Conseiller',
      'MANAGER': 'Manager',
      'CLIENT': 'Client'
    };
    return labels[role] || role;
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'credit': 'assignment',
      'approval': 'check_circle',
      'user': 'person_add',
      'fraud': 'security',
      'system': 'settings'
    };
    return icons[type] || 'info';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'credit': '#C62828',
      'approval': '#1B5E20',
      'user': '#0D47A1',
      'fraud': '#B71C1C',
      'system': '#4A148C'
    };
    return colors[type] || '#888';
  }
}
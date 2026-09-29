import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-advisor-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatChipsModule, MatDividerModule
  ],
  templateUrl: './advisor-dashboard.component.html',
  styleUrls: ['./advisor-dashboard.component.css']
})
export class AdvisorDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);

  isLoading = true;
  user: any = null;

  stats = {
    totalClients: 0,
    activeClients: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalAmount: 0,
    upcomingAppointments: 0
  };

  recentClients: any[] = [];
  recentRequests: any[] = [];

  ngOnInit(): void {
    this.user = this.authService.getUserInfo();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    // TODO: remplacer par appel API réel
    setTimeout(() => {
      this.stats = {
        totalClients: 24,
        activeClients: 21,
        pendingRequests: 5,
        approvedRequests: 18,
        totalAmount: 1250000,
        upcomingAppointments: 3
      };

      this.recentClients = [
        { name: 'Jean Dupont', email: 'jean.dupont@mail.fr', status: 'active' },
        { name: 'Marie Martin', email: 'marie.martin@mail.fr', status: 'active' },
        { name: 'Pierre Durand', email: 'pierre.durand@mail.fr', status: 'pending' }
      ];

      this.recentRequests = [
        { id: 'CR-2024-001', client: 'Jean Dupont', amount: 25000, status: 'pending' },
        { id: 'CR-2024-002', client: 'Marie Martin', amount: 150000, status: 'review' },
        { id: 'CR-2024-003', client: 'Pierre Durand', amount: 75000, status: 'approved' }
      ];

      this.isLoading = false;
    }, 600);
  }

  getInitials(): string {
    if (!this.user) return 'C';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return 'Conseiller';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Conseiller';
  }

  getClientStatusClass(status: string): string {
    return { active: 'status-approved', pending: 'status-pending', inactive: 'status-rejected' }[status] || '';
  }

  getClientStatusLabel(status: string): string {
    return { active: 'Actif', pending: 'En attente', inactive: 'Inactif' }[status] || status;
  }

  getStatusClass(status: string): string {
    return {
      pending: 'status-pending',
      review: 'status-review',
      approved: 'status-approved',
      rejected: 'status-rejected'
    }[status] || '';
  }

  getStatusLabel(status: string): string {
    return {
      pending: 'En attente',
      review: 'En analyse',
      approved: 'Approuvé',
      rejected: 'Refusé'
    }[status] || status;
  }
}
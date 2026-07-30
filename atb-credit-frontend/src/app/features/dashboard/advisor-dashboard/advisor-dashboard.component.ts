// features/dashboard/advisor-dashboard/advisor-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './advisor-dashboard.component.html',
  styleUrls: ['./advisor-dashboard.component.css']
})
export class AdvisorDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  user: any = null;

  stats = {
    totalClients: 28,
    activeClients: 22,
    pendingRequests: 8,
    approvedRequests: 34,
    totalAmount: 1250000,
    upcomingAppointments: 5
  };

  recentClients: any[] = [];
  recentRequests: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUserInfo();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    setTimeout(() => {
      this.recentClients = [
        { name: 'Jean Dupont', email: 'jean.dupont@email.com', status: 'active' },
        { name: 'Marie Martin', email: 'marie.martin@email.com', status: 'active' },
        { name: 'Pierre Durand', email: 'pierre.durand@email.com', status: 'pending' },
        { name: 'Sophie Bernard', email: 'sophie.bernard@email.com', status: 'active' }
      ];

      this.recentRequests = [
        { id: 'CR-2024-001', client: 'Jean Dupont', amount: 25000, status: 'pending' },
        { id: 'CR-2024-002', client: 'Marie Martin', amount: 150000, status: 'approved' },
        { id: 'CR-2024-003', client: 'Pierre Durand', amount: 75000, status: 'review' }
      ];

      this.isLoading = false;
    }, 800);
  }

  getInitials(): string {
    if (!this.user) return 'C';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return 'Conseiller';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Conseiller';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'status-active',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'review': 'status-review'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'pending': 'En attente',
      'approved': 'Approuvé',
      'review': 'En analyse'
    };
    return labels[status] || status;
  }

  getClientStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'client-active',
      'pending': 'client-pending',
      'inactive': 'client-inactive'
    };
    return classes[status] || '';
  }

  getClientStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'pending': 'En attente',
      'inactive': 'Inactif'
    };
    return labels[status] || status;
  }
}
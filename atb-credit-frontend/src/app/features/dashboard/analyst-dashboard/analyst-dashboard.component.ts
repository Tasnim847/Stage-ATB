// features/dashboard/analyst-dashboard/analyst-dashboard.component.ts
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
  selector: 'app-analyst-dashboard',
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
  templateUrl: './analyst-dashboard.component.html',
  styleUrls: ['./analyst-dashboard.component.css']
})
export class AnalystDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  user: any = null;

  stats = {
    pendingRequests: 12,
    inProgressRequests: 8,
    completedRequests: 45,
    highRiskRequests: 5,
    totalRequests: 65,
    avgProcessingTime: '2.5 jours'
  };

  recentRequests: any[] = [];
  pendingTasks: any[] = [];

  ngOnInit(): void {
    this.user = this.authService.getUserInfo();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(private authService: AuthService) {}

  loadDashboardData(): void {
    setTimeout(() => {
      this.recentRequests = [
        { id: 'CR-2024-001', client: 'Jean Dupont', amount: 25000, status: 'pending', date: '2024-01-15' },
        { id: 'CR-2024-002', client: 'Marie Martin', amount: 150000, status: 'review', date: '2024-01-14' },
        { id: 'CR-2024-003', client: 'Pierre Durand', amount: 75000, status: 'pending', date: '2024-01-13' },
        { id: 'CR-2024-004', client: 'Sophie Bernard', amount: 45000, status: 'pending', date: '2024-01-12' }
      ];

      this.pendingTasks = [
        { title: 'Analyser documentaire', count: 3, priority: 'high' },
        { title: 'Vérification KYC', count: 2, priority: 'medium' },
        { title: 'Calcul des ratios', count: 4, priority: 'low' }
      ];

      this.isLoading = false;
    }, 800);
  }

  getInitials(): string {
    if (!this.user) return 'A';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return 'Analyste';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Analyste';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'review': 'status-review',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'review': 'En analyse',
      'approved': 'Approuvé',
      'rejected': 'Refusé'
    };
    return labels[status] || status;
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority] || '';
  }
}
// features/dashboard/manager-dashboard/manager-dashboard.component.ts
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
  selector: 'app-manager-dashboard',
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
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  user: any = null;

  stats = {
    totalRequests: 89,
    pendingValidation: 12,
    approvedRequests: 45,
    rejectedRequests: 21,
    highAmountRequests: 8,
    analysts: 6,
    fraudAlerts: 3,
    avgProcessingTime: '3.2 jours'
  };

  kpiData: any[] = [];
  pendingValidations: any[] = [];

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
      this.kpiData = [
        { label: 'Taux d\'approbation', value: 68, change: '+5%' },
        { label: 'Délai moyen', value: '3.2j', change: '-0.8j' },
        { label: 'Score IA moyen', value: 82, change: '+3%' },
        { label: 'Portefeuille total', value: '2.8M€', change: '+12%' }
      ];

      this.pendingValidations = [
        { id: 'CR-2024-001', client: 'Jean Dupont', amount: 250000, analyst: 'Marie Martin', priority: 'high' },
        { id: 'CR-2024-002', client: 'Pierre Durand', amount: 150000, analyst: 'Thomas Petit', priority: 'medium' },
        { id: 'CR-2024-003', client: 'Sophie Bernard', amount: 75000, analyst: 'Julie Robert', priority: 'low' },
        { id: 'CR-2024-004', client: 'Michel Lefebvre', amount: 180000, analyst: 'Marie Martin', priority: 'high' }
      ];

      this.isLoading = false;
    }, 800);
  }

  getInitials(): string {
    if (!this.user) return 'M';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return 'Manager';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Manager';
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority] || '';
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'high': 'Prioritaire',
      'medium': 'Normal',
      'low': 'Bas'
    };
    return labels[priority] || priority;
  }
}
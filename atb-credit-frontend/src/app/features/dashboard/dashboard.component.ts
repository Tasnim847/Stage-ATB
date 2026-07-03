import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  
  user: any = null;
  isLoading = true;
  
  stats = {
    totalClients: 0,
    totalCreditRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    highRiskRequests: 0,
    fraudAlerts: 0
  };

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDashboardStats();
  }

  loadUserInfo(): void {
    this.user = this.authService.getUserInfo();
    this.isLoading = false;
  }

  loadDashboardStats(): void {
    // Simuler le chargement
    setTimeout(() => {
      this.stats = {
        totalClients: 156,
        totalCreditRequests: 89,
        pendingRequests: 23,
        approvedRequests: 45,
        highRiskRequests: 12,
        fraudAlerts: 3
      };
    }, 1000);
  }

  getInitials(): string {
    if (!this.user) return 'U';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`;
  }

  getFullName(): string {
    if (!this.user) return 'Utilisateur';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Utilisateur';
  }
}
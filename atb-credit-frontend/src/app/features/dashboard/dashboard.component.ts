// features/dashboard/dashboard.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  private router = inject(Router);
  
  user: any = null;
  isLoading = true;
  userRole: string | null = null;

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.user = this.authService.getUserInfo();
    this.userRole = this.authService.getUserRole();
    this.isLoading = false;
    
    // ✅ Rediriger vers le dashboard approprié selon le rôle
    this.redirectToDashboard();
  }

  redirectToDashboard(): void {
    // Si l'utilisateur n'est pas authentifié, retourner
    if (!this.userRole) {
      return;
    }

    // Rediriger selon le rôle
    const roleRoutes: { [key: string]: string } = {
      'CLIENT': '/client-dashboard',
      'ADMIN': '/admin-dashboard',
      'ANALYST': '/analyst-dashboard',
      'ADVISOR': '/advisor-dashboard',
      'MANAGER': '/manager-dashboard'
    };

    const targetRoute = roleRoutes[this.userRole];
    
    if (targetRoute) {
      // Naviguer vers le dashboard spécifique
      this.router.navigate([targetRoute]);
    }
  }

  getInitials(): string {
    if (!this.user) return 'U';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return 'Utilisateur';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Utilisateur';
  }
}
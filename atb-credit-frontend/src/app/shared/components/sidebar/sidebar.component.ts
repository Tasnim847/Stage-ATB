import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  private authService = new AuthService();
  isMobile = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile && !this.collapsed) {
      this.collapsed = true;
      this.toggle.emit();
    }
  }

  menuItems = [
    { 
      path: '/dashboard', 
      icon: 'dashboard', 
      label: 'Tableau de bord',
      roles: ['ADMIN', 'ANALYST', 'ADVISOR']
    },
    { 
      path: '/clients', 
      icon: 'people', 
      label: 'Clients',
      roles: ['ADMIN', 'ANALYST', 'ADVISOR']
    },
    { 
      path: '/credit-requests', 
      icon: 'assignment', 
      label: 'Demandes de crédit',
      roles: ['ADMIN', 'ANALYST', 'ADVISOR']
    },
    { 
      path: '/financial-analysis', 
      icon: 'analytics', 
      label: 'Analyse financière',
      roles: ['ADMIN', 'ANALYST']
    },
    { 
      path: '/risk-analysis', 
      icon: 'warning', 
      label: 'Analyse des risques',
      roles: ['ADMIN', 'ANALYST']
    },
    { 
      path: '/fraud-alerts', 
      icon: 'security', 
      label: 'Alertes fraude',
      roles: ['ADMIN', 'ANALYST']
    },
    { 
      path: '/kyc', 
      icon: 'verified_user', 
      label: 'Vérification KYC',
      roles: ['ADMIN', 'ANALYST', 'ADVISOR']
    },
    { 
      path: '/copilot', 
      icon: 'smart_toy', 
      label: 'Assistant IA',
      roles: ['ADMIN', 'ANALYST']
    },
    { 
      path: '/notifications', 
      icon: 'notifications', 
      label: 'Notifications',
      roles: ['ADMIN', 'ANALYST', 'ADVISOR']
    }
  ];

  get filteredMenuItems() {
    const userRole = this.authService.getUserRole();
    if (!userRole) return this.menuItems;
    return this.menuItems.filter(item => item.roles.includes(userRole));
  }

  toggleSidebar(): void {
    this.toggle.emit();
  }
}
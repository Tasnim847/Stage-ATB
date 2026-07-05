import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'] // ✅ Garder .css
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  // ✅ Injection correcte
  constructor(private authService: AuthService) {}

  isMobile = false;

  ngOnInit() {
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

  adminMenuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    { path: '/clients', icon: 'people', label: 'Clients', badge: 0 },
    { path: '/admin/client-assignment', icon: 'swap_horiz', label: 'Affectation clients', badge: 0 }, // ✅ AJOUTÉ
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
    { path: '/financial-analysis', icon: 'analytics', label: 'Analyse financière', badge: 0 },
    { path: '/risk-analysis', icon: 'warning', label: 'Analyse des risques', badge: 3 },
    { path: '/fraud-alerts', icon: 'security', label: 'Alertes fraude', badge: 2 },
    { path: '/kyc', icon: 'verified_user', label: 'Vérification KYC', badge: 4 },
    { path: '/copilot', icon: 'smart_toy', label: 'Assistant IA', badge: 0 },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 8 },
    { path: '/employees', icon: 'people_outline', label: 'Employés', badge: 0 },
    { path: '/reports', icon: 'assessment', label: 'Rapports', badge: 0 },
    { path: '/settings', icon: 'settings', label: 'Paramètres', badge: 0 }
  ];

  analystMenuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
    { path: '/financial-analysis', icon: 'analytics', label: 'Analyse financière', badge: 3 },
    { path: '/risk-analysis', icon: 'warning', label: 'Analyse des risques', badge: 2 },
    { path: '/fraud-alerts', icon: 'security', label: 'Alertes fraude', badge: 2 },
    { path: '/kyc', icon: 'verified_user', label: 'Vérification KYC', badge: 4 },
    { path: '/copilot', icon: 'smart_toy', label: 'Assistant IA', badge: 0 },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 5 }
  ];

  advisorMenuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    { path: '/clients', icon: 'people', label: 'Mes clients', badge: 0 },
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
    { path: '/kyc', icon: 'verified_user', label: 'Vérification KYC', badge: 3 },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 4 }
  ];

  managerMenuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    { path: '/clients', icon: 'people', label: 'Clients', badge: 0 },
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
    { path: '/financial-analysis', icon: 'analytics', label: 'Analyse financière', badge: 0 },
    { path: '/risk-analysis', icon: 'warning', label: 'Analyse des risques', badge: 3 },
    { path: '/fraud-alerts', icon: 'security', label: 'Alertes fraude', badge: 2 },
    { path: '/reports', icon: 'assessment', label: 'Rapports', badge: 0 },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 6 }
  ];

  clientMenuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Mon tableau de bord', badge: 0 },
    { path: '/my-credits', icon: 'assignment', label: 'Mes demandes de crédit', badge: 2 },
    { path: '/new-credit-request', icon: 'add', label: 'Nouvelle demande', badge: 0 },    
    { path: '/profile', icon: 'person', label: 'Mon profil', badge: 0 },  // ✅ Changé de '/my-profile' à '/profile'
    { path: '/my-documents', icon: 'folder', label: 'Mes documents', badge: 0 },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 3 }
  ];

  get filteredMenuItems() {
    const userRole = this.authService.getUserRole();
    switch(userRole) {
      case 'ADMIN': return this.adminMenuItems;
      case 'ANALYST': return this.analystMenuItems;
      case 'ADVISOR': return this.advisorMenuItems;
      case 'MANAGER': return this.managerMenuItems;
      case 'CLIENT': return this.clientMenuItems;
      default: return this.adminMenuItems;
    }
  }

  toggleSidebar(): void {
    this.toggle.emit();
  }

  getUserRole(): string | null {
    return this.authService.getUserRole();
  }

  getUserInfo(): any {
    return this.authService.getUserInfo();
  }
}
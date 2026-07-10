// sidebar.component.ts
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '@core/services/auth.service';

export interface MenuItem {
  path: string;
  icon: string;
  label: string;
  badge?: number;
  children?: MenuItem[];
  divider?: boolean;
}

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
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

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

  // ============================================
  // 1. MENU ADMINISTRATEUR
  // ============================================
  adminMenuItems: MenuItem[] = [
    // Tableau de bord
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    
    // Gestion des utilisateurs
    { path: '/admin/users', icon: 'people', label: 'Utilisateurs', badge: 0 },
    { path: '/admin/employees', icon: 'badge', label: 'Employés', badge: 0 },
    { path: '/admin/client-assignment', icon: 'swap_horiz', label: 'Affectation clients', badge: 0 },
    
    // Gestion des rôles
    { path: '/admin/roles', icon: 'admin_panel_settings', label: 'Rôles & Permissions', badge: 0 },
    
    // Clients
    { path: '/clients', icon: 'people_outline', label: 'Clients', badge: 0 },
    
    // Demandes de crédit
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
    { path: '/admin/credit-requests/new', icon: 'add', label: 'Nouvelle demande (Admin)', badge: 0 },

    // Analyses
    { path: '/financial-analysis', icon: 'analytics', label: 'Analyse financière', badge: 0 },
    { path: '/risk-analysis', icon: 'warning', label: 'Analyse des risques', badge: 3 },
    { path: '/fraud-alerts', icon: 'security', label: 'Alertes fraude', badge: 2 },
    { path: '/kyc', icon: 'verified_user', label: 'Vérification KYC', badge: 4 },
    
    // Paramétrage
    { path: '/admin/credit-types', icon: 'credit_card', label: 'Types de crédit', badge: 0 },
    { path: '/admin/rates', icon: 'percent', label: 'Taux d\'intérêt', badge: 0 },
    { path: '/admin/documents', icon: 'description', label: 'Documents obligatoires', badge: 0 },
    
    // IA & Configuration
    { path: '/admin/ai-config', icon: 'smart_toy', label: 'Configuration IA', badge: 0 },
    { path: '/admin/ocr-config', icon: 'text_snippet', label: 'Configuration OCR', badge: 0 },
    
    // Rapports & Journal
    { path: '/reports', icon: 'assessment', label: 'Rapports', badge: 0 },
    { path: '/admin/audit-logs', icon: 'history', label: 'Journal d\'audit', badge: 0 },
    
    // Notifications
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 8 },
    
    // Paramètres
    { path: '/settings', icon: 'settings', label: 'Paramètres', badge: 0 }
  ];

  // ============================================
  // 2. MENU ANALYSTE DE CRÉDIT
  // ============================================
  analystMenuItems: MenuItem[] = [
    // Tableau de bord
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    
    // Demandes de crédit
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
    
    // Analyse documentaire
    { path: '/documents/analysis', icon: 'folder_open', label: 'Analyse documentaire', badge: 3 },
    { path: '/documents/ocr', icon: 'text_snippet', label: 'Lancer OCR', badge: 0 },
    { path: '/documents/ai-summary', icon: 'smart_toy', label: 'Résumé IA', badge: 0 },
    
    // Analyse financière
    { path: '/financial-analysis', icon: 'analytics', label: 'Analyse financière', badge: 3 },
    { path: '/financial-analysis/ratios', icon: 'calculate', label: 'Calcul des ratios', badge: 0 },
    { path: '/financial-analysis/debt', icon: 'trending_up', label: 'Taux d\'endettement', badge: 0 },
    
    // Analyse des risques
    { path: '/risk-analysis', icon: 'warning', label: 'Analyse des risques', badge: 2 },
    { path: '/risk-analysis/ai-score', icon: 'smart_toy', label: 'Score IA', badge: 0 },
    { path: '/risk-analysis/fraud', icon: 'security', label: 'Alertes fraude', badge: 2 },
    { path: '/risk-analysis/aml', icon: 'gavel', label: 'AML/KYC', badge: 1 },
    { path: '/kyc', icon: 'verified_user', label: 'Vérification KYC', badge: 4 },
    
    // Décision
    { path: '/decisions/pending', icon: 'pending', label: 'Décisions en attente', badge: 6 },
    { path: '/decisions/approved', icon: 'check_circle', label: 'Décisions approuvées', badge: 0 },
    { path: '/decisions/rejected', icon: 'cancel', label: 'Décisions refusées', badge: 0 },
    
    // Rapports
    { path: '/reports/analysis', icon: 'assessment', label: 'Rapport d\'analyse', badge: 0 },
    { path: '/reports/financial', icon: 'attach_money', label: 'Rapport financier', badge: 0 },
    { path: '/reports/risk', icon: 'warning', label: 'Rapport de risque', badge: 0 },
    
    // Notification
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 5 }
  ];

  // ============================================
  // 3. MENU CONSEILLER BANCAIRE
  // ============================================
  advisorMenuItems: MenuItem[] = [
    // Tableau de bord
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
  
    // Gestion des clients
    { path: '/clients', icon: 'people', label: 'Mes clients', badge: 0 },
    { path: '/clients/new', icon: 'person_add', label: 'Nouveau client', badge: 0 },
  
    // ✅ Gestion des demandes de crédit - CORRIGÉ
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
  
    // ✅ Simulation (accessible aussi pour le conseiller)
    { path: '/simulation', icon: 'calculate', label: 'Simulation de crédit', badge: 0 },
  
    // KYC
    { path: '/kyc', icon: 'verified_user', label: 'Vérification KYC', badge: 3 },
  
    // Notifications
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 4 },
  
    // Profil
    { path: '/profile', icon: 'person', label: 'Mon profil', badge: 0 }
  ];

  // ============================================
  // 4. MENU RESPONSABLE DES CRÉDITS
  // ============================================
  managerMenuItems: MenuItem[] = [
    // Tableau de bord
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    
    // Dashboard Power BI
    { path: '/manager/dashboard/powerbi', icon: 'insights', label: 'Power BI Dashboard', badge: 0 },
    { path: '/manager/dashboard/kpis', icon: 'trending_up', label: 'KPIs', badge: 0 },
    { path: '/manager/dashboard/portfolio', icon: 'folder', label: 'Portefeuille global', badge: 0 },
    
    // Validation des décisions
    { path: '/manager/validation/pending', icon: 'pending_actions', label: 'Décisions à valider', badge: 4 },
    { path: '/manager/validation/high-amount', icon: 'euro_symbol', label: 'Crédits élevés', badge: 2 },
    { path: '/manager/validation/return', icon: 'assignment_return', label: 'Dossiers retournés', badge: 1 },
    
    // Gestion des analystes
    { path: '/manager/analysts', icon: 'people', label: 'Analystes', badge: 0 },
    { path: '/manager/analysts/workload', icon: 'work', label: 'Répartition des dossiers', badge: 0 },
    { path: '/manager/analysts/performance', icon: 'speed', label: 'Performances', badge: 0 },
    
    // Centre de Décision IA
    { path: '/manager/ai/strategy', icon: 'smart_toy', label: 'Rapports stratégiques', badge: 0 },
    { path: '/manager/ai/forecast', icon: 'timeline', label: 'Prévisions', badge: 0 },
    { path: '/manager/ai/fraud', icon: 'security', label: 'Fraudes détectées', badge: 2 },
    { path: '/manager/ai/portfolio', icon: 'account_balance', label: 'Analyse portefeuille', badge: 0 },
    
    // Clients
    { path: '/clients', icon: 'people_outline', label: 'Clients', badge: 0 },
    
    // Demandes
    { path: '/credit-requests', icon: 'assignment', label: 'Demandes de crédit', badge: 5 },
    
    // Analyses
    { path: '/financial-analysis', icon: 'analytics', label: 'Analyse financière', badge: 0 },
    { path: '/risk-analysis', icon: 'warning', label: 'Analyse des risques', badge: 3 },
    { path: '/fraud-alerts', icon: 'security', label: 'Alertes fraude', badge: 2 },
    
    // Rapports
    { path: '/reports', icon: 'assessment', label: 'Rapports', badge: 0 },
    
    // Notifications
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 6 }
  ];

  // ============================================
  // 5. MENU CLIENT
  // ============================================

  clientMenuItems: MenuItem[] = [
     // Tableau de bord
    { path: '/dashboard', icon: 'dashboard', label: 'Mon tableau de bord', badge: 0 },
  
    // Gestion du profil
    { path: '/profile', icon: 'person', label: 'Mon profil', badge: 0 },
    { path: '/profile/edit', icon: 'edit', label: 'Modifier mon profil', badge: 0 },
    { path: '/profile/password', icon: 'lock', label: 'Changer mot de passe', badge: 0 },
  
    // ✅ SIMULATIONS - AJOUTER CETTE SECTION
    { path: '/simulations', icon: 'calculate', label: 'Mes simulations', badge: 0 },
    { path: '/simulation-new', icon: 'add', label: 'Nouvelle simulation', badge: 0 },
  
    // Demandes de crédit
    { path: '/my-credits', icon: 'assignment', label: 'Mes demandes', badge: 2 },
    { path: '/credit-requests/new', icon: 'add', label: 'Nouvelle demande', badge: 0 },
  
    // Gestion documentaire
    { path: '/my-documents', icon: 'folder', label: 'Mes documents', badge: 0 },
    { path: '/my-documents/upload', icon: 'upload_file', label: 'Déposer un document', badge: 0 },
  
    // Notifications
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 3 }
  ];
  // ============================================
  // 6. MENU PAR DÉFAUT
  // ============================================
  defaultMenuItems: MenuItem[] = [
    { path: '/dashboard', icon: 'dashboard', label: 'Tableau de bord', badge: 0 },
    { path: '/profile', icon: 'person', label: 'Mon profil', badge: 0 },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: 0 }
  ];

  get filteredMenuItems(): MenuItem[] {
    const userRole = this.authService.getUserRole();
    switch(userRole) {
      case 'ADMIN': return this.adminMenuItems;
      case 'ANALYST': return this.analystMenuItems;
      case 'ADVISOR': return this.advisorMenuItems;
      case 'MANAGER': return this.managerMenuItems;
      case 'CLIENT': return this.clientMenuItems;
      default: return this.defaultMenuItems;
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

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'ANALYST': 'Analyste de crédit',
      'ADVISOR': 'Conseiller bancaire',
      'MANAGER': 'Responsable des crédits',
      'CLIENT': 'Client'
    };
    return labels[role] || 'Utilisateur';
  }

  getInitials(): string {
    const user = this.getUserInfo();
    if (!user) return '';
    return (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '');
  }
}
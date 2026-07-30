// features/dashboard/client-dashboard/client-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';

// ✅ Services
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { CreditRequestService } from '@core/services/credit-request.service';
import { CreditSimulationService } from '@core/services/credit-simulation.service';

// ✅ Modèles - Importer depuis les bons fichiers
import { CreditResponseDTO, CreditStatus } from '@core/models/credit-request.model';
import { CreditSimulation } from '@core/models/credit-simulation.model';
import { NotificationResponseDTO } from '@core/models/notification.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  // Données utilisateur
  userFirstName: string = '';
  today: Date = new Date();

  // Crédits
  recentCredits: CreditResponseDTO[] = [];
  totalCredits: number = 0;
  pendingCredits: number = 0;
  approvedCredits: number = 0;
  loading: boolean = false;

  // Simulations
  recentSimulations: CreditSimulation[] = [];
  totalSimulations: number = 0;
  loadingSimulations: boolean = false;

  // Notifications - ✅ Utiliser NotificationResponseDTO
  notifications: NotificationResponseDTO[] = [];
  unreadNotifications: number = 0;
  loadingNotifications: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private creditService: CreditRequestService,
    private simulationService: CreditSimulationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserInfo();
    this.userFirstName = user?.firstName || 'Client';
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loadRecentCredits();
    this.loadRecentSimulations();
    this.loadNotifications();
  }

  // ============================================
  // CHARGEMENT DES CRÉDITS
  // ============================================

  loadRecentCredits(): void {
    this.loading = true;
    this.creditService.getMyCreditRequests()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Erreur chargement crédits:', error);
          return [];
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((credits) => {
        this.recentCredits = credits.slice(0, 5);
        this.totalCredits = credits.length;
        this.pendingCredits = credits.filter(c => 
          c.status === 'PENDING_ANALYSIS' || 
          c.status === 'UNDER_REVIEW'
        ).length;
        this.approvedCredits = credits.filter(c => c.status === 'APPROVED').length;
      });
  }

  // ============================================
  // CHARGEMENT DES SIMULATIONS
  // ============================================

  loadRecentSimulations(): void {
    this.loadingSimulations = true;
    this.simulationService.getMySimulations()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Erreur chargement simulations:', error);
          return [];
        }),
        finalize(() => this.loadingSimulations = false)
      )
      .subscribe((simulations) => {
        this.recentSimulations = simulations.slice(0, 5);
        this.totalSimulations = simulations.length;
      });
  }

  // ============================================
  // CHARGEMENT DES NOTIFICATIONS
  // ============================================

  loadNotifications(): void {
    this.loadingNotifications = true;
    this.notificationService.getMyNotifications()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Erreur chargement notifications:', error);
          return [];
        }),
        finalize(() => this.loadingNotifications = false)
      )
      .subscribe((notifications) => {
        this.notifications = notifications.slice(0, 5);
        this.unreadNotifications = notifications.filter(n => !n.read).length;
      });
  }

  // ============================================
  // MÉTHODES UTILITAIRES - CRÉDITS
  // ============================================

  getCreditStatusClass(status: CreditStatus): string {
    const classes: { [key: string]: string } = {
      'DRAFT': 'status-draft',
      'PENDING_ANALYSIS': 'status-pending',
      'UNDER_REVIEW': 'status-review',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'PENDING_DOCUMENTS': 'status-pending-docs',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return classes[status] || '';
  }

  getCreditStatusLabel(status: CreditStatus): string {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Brouillon',
      'PENDING_ANALYSIS': 'En attente d\'analyse',
      'UNDER_REVIEW': 'En analyse',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Refusé',
      'PENDING_DOCUMENTS': 'Documents requis',
      'COMPLETED': 'Complété',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  getCreditStatusIcon(status: CreditStatus): string {
    const icons: { [key: string]: string } = {
      'DRAFT': 'edit',
      'PENDING_ANALYSIS': 'hourglass_empty',
      'UNDER_REVIEW': 'search',
      'APPROVED': 'check_circle',
      'REJECTED': 'cancel',
      'PENDING_DOCUMENTS': 'description',
      'COMPLETED': 'done_all',
      'CANCELLED': 'block'
    };
    return icons[status] || 'help';
  }

  // ============================================
  // MÉTHODES UTILITAIRES - NOTIFICATIONS
  // ============================================

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'RISK_ALERT': 'warning',
      'DOCUMENT_INCOMPLETE': 'description',
      'APPROVAL_DEADLINE': 'timer',
      'FRAUD_ALERT': 'security',
      'AML_ALERT': 'gavel',
      'KYC_REMINDER': 'verified_user',
      'SYSTEM_NOTIFICATION': 'settings',
      'REGULATORY_UPDATE': 'update',
      'INFO': 'info',
      'SUCCESS': 'check_circle',
      'WARNING': 'warning',
      'ERROR': 'error',
      'CREDIT': 'assignment',
      'DOCUMENT': 'folder',
      'SYSTEM': 'computer'
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      'RISK_ALERT': '#B71C1C',
      'DOCUMENT_INCOMPLETE': '#E65100',
      'APPROVAL_DEADLINE': '#E65100',
      'FRAUD_ALERT': '#B71C1C',
      'AML_ALERT': '#4A148C',
      'KYC_REMINDER': '#0D47A1',
      'SYSTEM_NOTIFICATION': '#4A148C',
      'REGULATORY_UPDATE': '#1B5E20',
      'INFO': '#0D47A1',
      'SUCCESS': '#1B5E20',
      'WARNING': '#E65100',
      'ERROR': '#B71C1C',
      'CREDIT': '#C62828',
      'DOCUMENT': '#1565C0',
      'SYSTEM': '#4A148C'
    };
    return colors[type] || '#888';
  }

  // ============================================
  // MÉTHODES UTILITAIRES - UTILISATEUR
  // ============================================

  getInitials(): string {
    const user = this.authService.getUserInfo();
    if (!user) return '';
    return (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '');
  }

  getAvatarColor(): string {
    const colors = ['#C62828', '#D32F2F', '#B71C1C', '#E53935', '#EF5350'];
    const user = this.authService.getUserInfo();
    const index = user?.id ? user.id.length % colors.length : 0;
    return colors[index];
  }

  // ============================================
  // NAVIGATION
  // ============================================

  viewCredit(id: string): void {
    // Navigation vers le détail du crédit
    // this.router.navigate(['/credit-requests', id]);
  }

  viewSimulation(id: string): void {
    // Navigation vers le détail de la simulation
    // this.router.navigate(['/simulation-result', id]);
  }
}
// features/manager/analyst-management/analyst-management.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { AnalystManagementService } from '@core/services/analyst-management.service';
import { ManagerValidationService } from '@core/services/manager-validation.service';
import { AnalystPerformanceDTO, AnalystWorkloadDTO, CreditRequestSummaryDTO, CreditResponseDTO } from '@core/services/analyst-management.service';
import { ManagerValidationDialogComponent } from '../validation/components/manager-validation-dialog.component';

@Component({
  selector: 'app-analyst-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './analyst-management.component.html',
  styleUrls: ['./analyst-management.component.css']
})
export class AnalystManagementComponent implements OnInit {
  private analystManagementService = inject(AnalystManagementService);
  private managerValidationService = inject(ManagerValidationService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Données
  performances: AnalystPerformanceDTO[] = [];
  workloads: AnalystWorkloadDTO[] = [];
  pendingRequests: CreditRequestSummaryDTO[] = [];
  processedFiles: CreditResponseDTO[] = [];
  
  // États
  loading = false;
  selectedTab = 0;
  
  // Statistiques calculées
  totalAnalysts = 0;
  totalPending = 0;
  totalProcessed = 0;
  averageApprovalRate = 0;
  
  // Colonnes des tableaux
  performanceColumns = ['rank', 'analyst', 'processed', 'approved', 'rejected', 'approvalRate', 'avgTime', 'performance'];
  workloadColumns = ['analyst', 'workload', 'progress', 'assigned', 'level'];
  pendingColumns = ['requestNumber', 'client', 'amount', 'createdAt', 'daysPending', 'actions'];
  processedColumns = ['requestNumber', 'client', 'amount', 'status', 'analyst', 'updatedAt', 'actions'];

  ngOnInit(): void {
    // ✅ Récupérer le paramètre tab de l'URL
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'workload') {
        this.selectedTab = 1; // Onglet Charge de travail
      } else if (tab === 'pending') {
        this.selectedTab = 2; // Onglet En attente
      } else if (tab === 'processed') {
        this.selectedTab = 3; // Onglet Dossiers traités
      } else if (tab === 'performance') {
        this.selectedTab = 0; // Onglet Performance
      }
    });
    
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    Promise.all([
      this.loadPerformances(),
      this.loadWorkloads(),
      this.loadPendingRequests(),
      this.loadProcessedFiles()
    ]).finally(() => {
      this.calculateStats();
      this.loading = false;
    });
  }

  private loadPerformances(): Promise<void> {
    return new Promise((resolve) => {
      this.analystManagementService.getAllAnalystPerformance().subscribe({
        next: (data) => {
          this.performances = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des performances:', error);
          resolve();
        }
      });
    });
  }

  private loadWorkloads(): Promise<void> {
    return new Promise((resolve) => {
      this.analystManagementService.getAllAnalystWorkload().subscribe({
        next: (data) => {
          this.workloads = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des charges:', error);
          resolve();
        }
      });
    });
  }

  private loadPendingRequests(): Promise<void> {
    return new Promise((resolve) => {
      this.analystManagementService.getPendingAssignmentRequests().subscribe({
        next: (data) => {
          this.pendingRequests = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des demandes en attente:', error);
          resolve();
        }
      });
    });
  }

  private loadProcessedFiles(): Promise<void> {
    return new Promise((resolve) => {
      this.analystManagementService.getAllProcessedFiles().subscribe({
        next: (data) => {
          this.processedFiles = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des dossiers traités:', error);
          resolve();
        }
      });
    });
  }

  private calculateStats(): void {
    this.totalAnalysts = this.performances.length;
    this.totalPending = this.pendingRequests.length;
    this.totalProcessed = this.processedFiles.length;
    
    if (this.performances.length > 0) {
      const total = this.performances.reduce((acc, p) => acc + p.approvalRate, 0);
      this.averageApprovalRate = Math.round(total / this.performances.length);
    } else {
      this.averageApprovalRate = 0;
    }
  }

  // ============================================
  // NAVIGATION VERS LES ONGLETS
  // ============================================

  goToTab(tabIndex: number): void {
    this.selectedTab = tabIndex;
    // Mettre à jour l'URL avec le paramètre de requête
    const tabNames = ['performance', 'workload', 'pending', 'processed'];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabNames[tabIndex] },
      queryParamsHandling: 'merge'
    });
  }

  // ============================================
  // ACTIONS DE VALIDATION MANAGER
  // ============================================

  approveValidation(validation: any): void {
    const dialogRef = this.dialog.open(ManagerValidationDialogComponent, {
      width: '600px',
      data: { 
        validation: validation, 
        action: 'APPROVE' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.loading = true;
        this.managerValidationService.approveHighAmountCredit(
          validation.id, 
          result.comments
        ).subscribe({
          next: (response) => {
            this.snackBar.open(`✅ Crédit ${response.requestNumber} approuvé avec succès`, 'Fermer', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur lors de l\'approbation:', error);
            this.snackBar.open('❌ Erreur lors de l\'approbation', 'Fermer', {
              duration: 3000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  rejectValidation(validation: any): void {
    const dialogRef = this.dialog.open(ManagerValidationDialogComponent, {
      width: '600px',
      data: { 
        validation: validation, 
        action: 'REJECT' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.loading = true;
        this.managerValidationService.rejectDecision(
          validation.id,
          result.rejectReason || 'Rejeté par le manager',
          result.comments
        ).subscribe({
          next: (response) => {
            this.snackBar.open(`❌ Crédit ${response.requestNumber} rejeté`, 'Fermer', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur lors du rejet:', error);
            this.snackBar.open('❌ Erreur lors du rejet', 'Fermer', {
              duration: 3000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  returnToAnalyst(validation: any): void {
    const dialogRef = this.dialog.open(ManagerValidationDialogComponent, {
      width: '600px',
      data: { 
        validation: validation, 
        action: 'RETURN' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.loading = true;
        this.managerValidationService.returnToAnalyst({
          creditRequestId: validation.id,
          reason: result.comments || 'Retourné par le manager',
          additionalInstructions: result.additionalInstructions,
          requiredAction: result.requiredAction || 'REANALYZE_FINANCIALS'
        }).subscribe({
          next: (response) => {
            this.snackBar.open(`🔄 Crédit ${response.requestNumber} retourné à l'analyste`, 'Fermer', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur lors du retour:', error);
            this.snackBar.open('❌ Erreur lors du retour', 'Fermer', {
              duration: 3000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  // ============================================
  // RÉPARTITION DES DOSSIERS
  // ============================================

  assignRequest(requestId: string): void {
    // Ouvrir le dialogue d'assignation
    // Implémentez ici la logique d'assignation
  }

  autoDistribute(): void {
    const requestIds = this.pendingRequests.map(r => r.id);
    if (requestIds.length === 0) {
      this.snackBar.open('Aucun dossier en attente à distribuer', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.loading = true;
    this.analystManagementService.autoDistributeRequests(requestIds).subscribe({
      next: (result) => {
        console.log('Distribution automatique terminée:', result);
        this.snackBar.open('✅ Distribution automatique terminée avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadData();
      },
      error: (error) => {
        console.error('Erreur lors de la distribution automatique:', error);
        this.snackBar.open('❌ Erreur lors de la distribution automatique', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  rebalanceWorkload(): void {
    this.loading = true;
    this.analystManagementService.rebalanceWorkload().subscribe({
      next: (result) => {
        console.log('Rééquilibrage terminé:', result);
        this.snackBar.open('✅ Rééquilibrage terminé avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadData();
      },
      error: (error) => {
        console.error('Erreur lors du rééquilibrage:', error);
        this.snackBar.open('❌ Erreur lors du rééquilibrage', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  generateReport(): void {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    this.analystManagementService.generatePerformanceReport(
      monthAgo.toISOString(),
      today.toISOString()
    ).subscribe({
      next: (report) => {
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-performance-${today.toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('📊 Rapport généré avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur lors de la génération du rapport:', error);
        this.snackBar.open('❌ Erreur lors de la génération du rapport', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  refresh(): void {
    this.loadData();
  }

  // ============================================
  // NAVIGATION
  // ============================================

  goToAnalystDetail(analystId: string): void {
    // Naviguer vers le détail de l'analyste
    this.router.navigate(['/manager/analysts', analystId]);
  }

  goToCreditRequestDetail(requestId: string): void {
    // Naviguer vers le détail de la demande
    this.router.navigate(['/credit-requests', requestId]);
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  getPerformanceLevel(level: string): string {
    const levels: { [key: string]: string } = {
      'EXCELLENT': '🌟 Excellent',
      'GOOD': '👍 Bon',
      'AVERAGE': '📊 Moyen',
      'NEEDS_IMPROVEMENT': '🔧 À améliorer'
    };
    return levels[level] || level;
  }

  getPerformanceLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'EXCELLENT': 'primary',
      'GOOD': 'accent',
      'AVERAGE': 'warn',
      'NEEDS_IMPROVEMENT': 'warn'
    };
    return colors[level] || 'default';
  }

  getWorkloadLevel(level: string): string {
    const levels: { [key: string]: string } = {
      'LOW': '🟢 Faible',
      'MODERATE': '🟡 Modéré',
      'HIGH': '🟠 Élevé',
      'CRITICAL': '🔴 Critique'
    };
    return levels[level] || level;
  }

  getWorkloadLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'LOW': 'primary',
      'MODERATE': 'accent',
      'HIGH': 'warn',
      'CRITICAL': 'warn'
    };
    return colors[level] || 'default';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'APPROVED': 'primary',
      'REJECTED': 'warn',
      'PENDING_ANALYSIS': 'accent',
      'UNDER_REVIEW': 'accent',
      'DRAFT': 'default',
      'COMPLETED': 'primary',
      'CANCELLED': 'default'
    };
    return colors[status] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'APPROVED': '✅ Approuvé',
      'REJECTED': '❌ Rejeté',
      'PENDING_ANALYSIS': '⏳ En attente',
      'UNDER_REVIEW': '📋 En révision',
      'DRAFT': '📝 Brouillon',
      'COMPLETED': '✅ Complété',
      'CANCELLED': '❌ Annulé'
    };
    return labels[status] || status;
  }
}
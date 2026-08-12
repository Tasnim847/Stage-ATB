// features/manager/analyst-management/analyst-management.component.ts
import { Component, OnInit } from '@angular/core';
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

import { AnalystManagementService } from '@core/services/analyst-management.service';
import { AnalystPerformanceDTO, AnalystWorkloadDTO } from '@core/services/analyst-management.service';
import { CreditRequestSummaryDTO } from '@core/services/analyst-management.service';
import { CreditResponseDTO } from '@app/core/models';

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
    MatDividerModule
  ],
  templateUrl: './analyst-management.component.html',
  styleUrls: ['./analyst-management.component.css']
})
export class AnalystManagementComponent implements OnInit {
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
  workloadColumns = ['analyst', 'workload', 'progress', 'assigned', 'level', 'actions'];
  pendingColumns = ['requestNumber', 'client', 'amount', 'createdAt', 'daysPending', 'actions'];
  processedColumns = ['requestNumber', 'client', 'amount', 'status', 'analyst', 'updatedAt', 'actions'];

  constructor(
    private analystManagementService: AnalystManagementService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Charger toutes les données en parallèle
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
    
    // Calculer le taux d'approbation moyen
    if (this.performances.length > 0) {
      const total = this.performances.reduce((acc, p) => acc + p.approvalRate, 0);
      this.averageApprovalRate = Math.round(total / this.performances.length);
    } else {
      this.averageApprovalRate = 0;
    }
  }

  // ============================================
  // ACTIONS
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

  // Navigation
  goToAnalystDetail(analystId: string): void {
    // Naviguer vers le détail de l'analyste
  }

  goToCreditRequestDetail(requestId: string): void {
    // Naviguer vers le détail de la demande
  }

  assignRequest(requestId: string): void {
    // Ouvrir le dialogue d'assignation
  }

  autoDistribute(): void {
    const requestIds = this.pendingRequests.map(r => r.id);
    if (requestIds.length === 0) {
      // Afficher un message
      return;
    }

    this.loading = true;
    this.analystManagementService.autoDistributeRequests(requestIds).subscribe({
      next: (result) => {
        console.log('Distribution automatique terminée:', result);
        this.loadData();
      },
      error: (error) => {
        console.error('Erreur lors de la distribution automatique:', error);
        this.loading = false;
      }
    });
  }

  rebalanceWorkload(): void {
    this.loading = true;
    this.analystManagementService.rebalanceWorkload().subscribe({
      next: (result) => {
        console.log('Rééquilibrage terminé:', result);
        this.loadData();
      },
      error: (error) => {
        console.error('Erreur lors du rééquilibrage:', error);
        this.loading = false;
      }
    });
  }

  generateReport(): void {
    // Générer un rapport de performance
  }

  refresh(): void {
    this.loadData();
  }
}
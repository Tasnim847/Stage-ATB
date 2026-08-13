// features/manager/kpis/manager-kpis.component.ts
import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { KPIService, ManagerKPIDTO, MonthlyKPIDTO, AnalystKPIDTO, RecentActivityDTO } from '@core/services/kpi.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-manager-kpis',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './manager-kpis.component.html',
  styleUrls: ['./manager-kpis.component.css']
})
export class ManagerKPIsComponent implements OnInit, AfterViewInit {
  private kpiService = inject(KPIService);
  private snackBar = inject(MatSnackBar);

  // Données
  kpis: ManagerKPIDTO | null = null;
  analystKPIs: AnalystKPIDTO[] = [];
  
  // États
  loading = false;
  selectedPeriod: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month';
  
  // Références des graphiques
  private monthlyChart: Chart | null = null;
  private creditTypeChart: Chart | null = null;
  private analystChart: Chart | null = null;

  // ✅ MAP pour les statuts
  statusMap: { [key: string]: { count: number; amount: number } } = {
    'PENDING_ANALYSIS': { count: 0, amount: 0 },
    'UNDER_REVIEW': { count: 0, amount: 0 },
    'APPROVED': { count: 0, amount: 0 },
    'REJECTED': { count: 0, amount: 0 },
    'COMPLETED': { count: 0, amount: 0 },
    'CANCELLED': { count: 0, amount: 0 }
  };

  ngOnInit(): void {
    this.loadKPIs();
  }

  ngAfterViewInit(): void {
    // Les graphiques seront initialisés après le chargement des données
  }

  loadKPIs(): void {
    this.loading = true;
    
    this.kpiService.getManagerKPIs().subscribe({
      next: (data) => {
        this.kpis = data;
        // ✅ Mettre à jour la map des statuts
        this.updateStatusMap(data);
        this.loading = false;
        // Initialiser les graphiques après le rendu
        setTimeout(() => {
          this.initCharts();
        }, 200);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des KPIs:', error);
        this.snackBar.open('❌ Erreur lors du chargement des KPIs', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });

    // Charger les KPIs des analystes
    this.kpiService.getAnalystPerformanceKPIs().subscribe({
      next: (data) => {
        this.analystKPIs = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des KPIs analystes:', error);
      }
    });
  }

  // ✅ Mettre à jour la map des statuts
  private updateStatusMap(data: ManagerKPIDTO): void {
    this.statusMap = {
      'PENDING_ANALYSIS': { count: data.pendingCount || 0, amount: data.pendingAmount || 0 },
      'UNDER_REVIEW': { count: data.underReviewCount || 0, amount: data.underReviewAmount || 0 },
      'APPROVED': { count: data.approvedCount || 0, amount: data.approvedAmount || 0 },
      'REJECTED': { count: data.rejectedCount || 0, amount: data.rejectedAmount || 0 },
      'COMPLETED': { count: data.completedCount || 0, amount: data.completedAmount || 0 },
      'CANCELLED': { count: data.cancelledCount || 0, amount: data.cancelledAmount || 0 }
    };
  }

  // ✅ Méthodes pour les statuts
  getStatusCount(status: string): number {
    return this.statusMap[status]?.count || 0;
  }

  getStatusAmount(status: string): number {
    return this.statusMap[status]?.amount || 0;
  }

  initCharts(): void {
    if (!this.kpis) return;
    
    this.initMonthlyChart();
    this.initCreditTypeChart();
    this.initAnalystChart();
  }

  initMonthlyChart(): void {
    const ctx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const months = this.kpis?.monthlyKPIs?.map(k => `${k.month} ${k.year}`) || [];
    const approved = this.kpis?.monthlyKPIs?.map(k => k.approvedCount) || [];
    const rejected = this.kpis?.monthlyKPIs?.map(k => k.rejectedCount) || [];
    const total = this.kpis?.monthlyKPIs?.map(k => k.requestsCount) || [];

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Approuvés',
            data: approved,
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            borderColor: '#4caf50',
            borderWidth: 1
          },
          {
            label: 'Rejetés',
            data: rejected,
            backgroundColor: 'rgba(244, 67, 54, 0.7)',
            borderColor: '#f44336',
            borderWidth: 1
          },
          {
            label: 'Total',
            data: total,
            backgroundColor: 'rgba(26, 35, 126, 0.7)',
            borderColor: '#1a237e',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Évolution mensuelle des demandes'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  initCreditTypeChart(): void {
    const ctx = document.getElementById('creditTypeChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.creditTypeChart) {
      this.creditTypeChart.destroy();
    }

    const types = this.kpis?.creditTypeDistribution?.map(k => k.creditTypeName) || [];
    const counts = this.kpis?.creditTypeDistribution?.map(k => k.count) || [];

    this.creditTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: types,
        datasets: [
          {
            label: 'Nombre de demandes',
            data: counts,
            backgroundColor: [
              'rgba(26, 35, 126, 0.8)',
              'rgba(76, 175, 80, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(244, 67, 54, 0.8)',
              'rgba(156, 39, 176, 0.8)',
              'rgba(0, 188, 212, 0.8)'
            ],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Distribution par type de crédit'
          }
        }
      }
    });
  }

  initAnalystChart(): void {
    const ctx = document.getElementById('analystChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.analystChart) {
      this.analystChart.destroy();
    }

    const analysts = this.analystKPIs?.map(a => a.analystName) || [];
    const processed = this.analystKPIs?.map(a => a.processedCount) || [];
    const approvalRates = this.analystKPIs?.map(a => a.approvalRate) || [];

    this.analystChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: analysts,
        datasets: [
          {
            label: 'Dossiers traités',
            data: processed,
            backgroundColor: 'rgba(26, 35, 126, 0.7)',
            borderColor: '#1a237e',
            borderWidth: 1,
            order: 1
          },
          {
            label: "Taux d'approbation (%)",
            data: approvalRates,
            type: 'line',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            borderColor: '#ff9800',
            borderWidth: 2,
            pointBackgroundColor: '#ff9800',
            pointRadius: 4,
            tension: 0.4,
            order: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Performance des analystes'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            max: 100,
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'APPROVED': '#4caf50',
      'REJECTED': '#f44336',
      'PENDING_ANALYSIS': '#ff9800',
      'UNDER_REVIEW': '#2196f3',
      'COMPLETED': '#00838f',
      'CANCELLED': '#757575',
      'DRAFT': '#9e9e9e'
    };
    return colors[status] || '#1a237e';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'APPROVED': '✅ Approuvé',
      'REJECTED': '❌ Rejeté',
      'PENDING_ANALYSIS': '⏳ En attente',
      'UNDER_REVIEW': '📋 En révision',
      'COMPLETED': '✅ Complété',
      'CANCELLED': '❌ Annulé',
      'DRAFT': '📝 Brouillon'
    };
    return labels[status] || status;
  }

  getRiskColor(riskLevel: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#4caf50',
      'MODERATE': '#ff9800',
      'HIGH': '#f44336',
      'CRITICAL': '#c62828'
    };
    return colors[riskLevel] || '#1a237e';
  }

  refresh(): void {
    this.loadKPIs();
  }
}
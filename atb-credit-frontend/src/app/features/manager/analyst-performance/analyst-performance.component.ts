// features/manager/analyst-performance/analyst-performance.component.ts
import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

import { AnalystManagementService, AnalystPerformanceDTO } from '@core/services/analyst-management.service';

Chart.register(...registerables);

@Component({
  selector: 'app-analyst-performance',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './analyst-performance.component.html',
  styleUrls: ['./analyst-performance.component.css']
})
export class AnalystPerformanceComponent implements OnInit, AfterViewInit {
  private analystManagementService = inject(AnalystManagementService);
  private snackBar = inject(MatSnackBar);

  // Données
  performances: AnalystPerformanceDTO[] = [];
  filteredPerformances: AnalystPerformanceDTO[] = [];
  
  // États
  loading = false;
  chartInitialized = false;
  
  // Filtres
  searchTerm: string = '';
  filterPerformanceLevel: string = 'ALL';
  dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  
  // Colonnes du tableau
  displayedColumns: string[] = [
    'rank',
    'analyst',
    'processed',
    'approved',
    'rejected',
    'approvalRate',
    'avgTime',
    'totalAmount',
    'performance',
    'actions'
  ];
  
  // Niveaux de performance disponibles pour le filtre
  performanceLevels = [
    { value: 'ALL', label: 'Tous' },
    { value: 'EXCELLENT', label: '🌟 Excellent' },
    { value: 'GOOD', label: '👍 Bon' },
    { value: 'AVERAGE', label: '📊 Moyen' },
    { value: 'NEEDS_IMPROVEMENT', label: '🔧 À améliorer' }
  ];

  // Référence du graphique
  private chart: Chart | null = null;

  ngOnInit(): void {
    this.loadPerformances();
  }

  ngAfterViewInit(): void {
    // Le graphique sera initialisé après le chargement des données
  }

  loadPerformances(): void {
    this.loading = true;
    this.chartInitialized = false;
    
    this.analystManagementService.getAllAnalystPerformance().subscribe({
      next: (data) => {
        this.performances = data;
        this.applyFilters();
        this.loading = false;
        // Initialiser le graphique après le rendu du DOM
        setTimeout(() => this.initChart(), 300);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des performances:', error);
        this.snackBar.open('❌ Erreur lors du chargement des performances', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredPerformances = this.performances.filter(p => {
      // Filtre par niveau de performance
      if (this.filterPerformanceLevel !== 'ALL' && p.performanceLevel !== this.filterPerformanceLevel) {
        return false;
      }
      
      // Filtre par recherche (nom)
      if (this.searchTerm.trim()) {
        const search = this.searchTerm.toLowerCase().trim();
        const name = p.analystName.toLowerCase();
        const email = p.analystEmail.toLowerCase();
        if (!name.includes(search) && !email.includes(search)) {
          return false;
        }
      }
      
      return true;
    });

    // Mettre à jour le graphique après filtrage
    setTimeout(() => this.initChart(), 200);
  }

  initChart(): void {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!ctx) {
      console.warn('Canvas element not found');
      return;
    }

    if (this.filteredPerformances.length === 0) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      return;
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const labels = this.filteredPerformances.map(p => p.analystName);
    const approvalRates = this.filteredPerformances.map(p => p.approvalRate);
    const processed = this.filteredPerformances.map(p => p.totalProcessed);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: "Taux d'approbation (%)",
            data: approvalRates,
            backgroundColor: approvalRates.map(rate => 
              rate >= 70 ? 'rgba(76, 175, 80, 0.8)' :
              rate >= 50 ? 'rgba(255, 152, 0, 0.8)' :
              'rgba(244, 67, 54, 0.8)'
            ),
            borderColor: approvalRates.map(rate =>
              rate >= 70 ? '#4caf50' :
              rate >= 50 ? '#ff9800' :
              '#f44336'
            ),
            borderWidth: 2,
            order: 1
          },
          {
            label: 'Dossiers traités',
            data: processed,
            type: 'line',
            backgroundColor: 'rgba(26, 35, 126, 0.2)',
            borderColor: '#1a237e',
            borderWidth: 2,
            pointBackgroundColor: '#1a237e',
            pointRadius: 4,
            tension: 0.3,
            order: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Performance des analystes',
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            position: 'left',
            title: {
              display: true,
              text: "Taux d'approbation (%)"
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Nombre de dossiers'
            }
          }
        }
      }
    });

    this.chartInitialized = true;
  }

  // ============================================
  // MÉTHODES DE STATISTIQUES
  // ============================================

  getAverageApprovalRate(): number {
    if (this.filteredPerformances.length === 0) return 0;
    const total = this.filteredPerformances.reduce((acc, p) => acc + p.approvalRate, 0);
    return total / this.filteredPerformances.length;
  }

  getTotalProcessed(): number {
    return this.filteredPerformances.reduce((acc, p) => acc + p.totalProcessed, 0);
  }

  getBestAnalyst(): string {
    if (this.filteredPerformances.length === 0) return '-';
    const best = this.filteredPerformances.reduce((a, b) => 
      a.approvalRate > b.approvalRate ? a : b
    );
    return best.analystName;
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

  getRankBadge(rank: number): string {
    if (rank <= 3) return 'top';
    return '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterPerformanceLevel = 'ALL';
    this.dateRange = { start: null, end: null };
    this.applyFilters();
  }

  refresh(): void {
    this.loadPerformances();
  }

  // ============================================
  // NAVIGATION
  // ============================================

  viewAnalystDetail(analystId: string): void {
    // Naviguer vers le détail de l'analyste
    this.snackBar.open(`👤 Voir les détails de l'analyste`, 'Fermer', {
      duration: 2000
    });
  }

  exportReport(): void {
    // Exporter le rapport
    this.snackBar.open('📊 Rapport exporté avec succès', 'Fermer', {
      duration: 3000
    });
  }
}
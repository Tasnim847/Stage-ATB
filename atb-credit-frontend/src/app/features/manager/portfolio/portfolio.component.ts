// portfolio.component.ts - Version corrigée avec cdr
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';  // ✅ Ajouter ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { PortfolioService } from '@core/services/portfolio.service';
import { ManagerService } from '@core/services/manager.service';
import { PortfolioSummaryComponent } from './portfolio-summary/portfolio-summary.component';
import { PortfolioChartsComponent } from './portfolio-charts/portfolio-charts.component';
import { PortfolioRiskComponent } from './portfolio-risk/portfolio-risk.component';
import { PortfolioDetailDialogComponent } from './portfolio-detail-dialog/portfolio-detail-dialog.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    PortfolioSummaryComponent,
    PortfolioChartsComponent,
    PortfolioRiskComponent
  ],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit, OnDestroy {
  // État de chargement
  isLoading = true;
  isLoadingSummary = true;
  isLoadingCharts = true;
  isLoadingRisk = true;

  // Données du portefeuille
  portfolioData: any = null;
  summaryData: any = null;
  chartData: any = null;
  riskData: any = null;

  // Filtres
  selectedYear = new Date().getFullYear();
  selectedStatus = 'all';
  selectedType = 'all';
  selectedRiskLevel = 'all';

  // Options de filtres
  years: number[] = [];
  creditTypes: string[] = [];

  // Mise à jour automatique
  refreshInterval: any = null;
  autoRefresh = true;
  lastRefresh = new Date();

  // Tableau des crédits
  displayedColumns: string[] = [
    'client',
    'montant',
    'type',
    'date_octroi',
    'duree',
    'taux',
    'statut',
    'risque',
    'actions'
  ];

  credits: any[] = [];
  totalCredits = 0;
  pageSize = 10;
  currentPage = 0;

  // ✅ Ajout de la référence au composant enfant
  @ViewChild(PortfolioChartsComponent) chartsComponent!: PortfolioChartsComponent;

  constructor(
    private portfolioService: PortfolioService,
    private managerService: ManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef  // ✅ Injection de ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadYears();
    this.loadPortfolioData();

    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshData();
      }, 300000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push(year);
    }
  }

  loadPortfolioData(): void {
    this.isLoading = true;

    const params = {
      year: this.selectedYear,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : '',
      type: this.selectedType !== 'all' ? this.selectedType : '',
      riskLevel: this.selectedRiskLevel !== 'all' ? this.selectedRiskLevel : '',
      page: this.currentPage,
      size: this.pageSize
    };

    this.portfolioService.getGlobalPortfolio(params).subscribe({
      next: (data) => {
        console.log('📊 Portfolio data received:', data);
        
        this.portfolioData = data;
        this.credits = data.credits || data.items || data.content || [];
        this.totalCredits = data.totalCredits || data.totalItems || data.total || this.credits.length;
        this.creditTypes = data.creditTypes || [];
        
        console.log(`✅ ${this.credits.length} crédits chargés`);
        
        this.isLoading = false;
        this.lastRefresh = new Date();
        
        // Charger les autres données
        this.loadSummaryData();
        this.loadChartData();
        this.loadRiskData();
      },
      error: (error) => {
        console.error('❌ Erreur chargement portefeuille:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement du portefeuille', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        this.loadMockData();
      }
    });
  }

  loadMockData(): void {
    console.log('📊 Chargement des données de test...');
    
    this.credits = [
      {
        id: 1,
        clientName: 'Ahmed Ben Ali',
        clientId: 'CL-001',
        montant: 50000,
        type: 'Crédit Immobilier',
        dateOctroi: '2026-01-15',
        duree: 120,
        taux: 5.5,
        statut: 'en_cours',
        risque: 'faible'
      },
      {
        id: 2,
        clientName: 'Sofia Mansouri',
        clientId: 'CL-002',
        montant: 25000,
        type: 'Crédit Auto',
        dateOctroi: '2026-02-20',
        duree: 48,
        taux: 6.8,
        statut: 'APPROVED',
        risque: 'moyen'
      },
      {
        id: 3,
        clientName: 'Karim Ben Sassi',
        clientId: 'CL-003',
        montant: 75000,
        type: 'Crédit Professionnel',
        dateOctroi: '2025-12-10',
        duree: 84,
        taux: 4.9,
        statut: 'en_cours',
        risque: 'élevé'
      }
    ];
    
    this.totalCredits = this.credits.length;
    this.creditTypes = ['Crédit Immobilier', 'Crédit Auto', 'Crédit Professionnel'];
    
    this.summaryData = {
      totalEncours: 30000,
      creditsActifs: 3,
      tauxImpayes: 25,
      risqueGlobal: 'faible',
      scoreRisque: 7.5
    };
    
    this.isLoading = false;
    this.lastRefresh = new Date();
  }

  loadSummaryData(): void {
    this.isLoadingSummary = true;
    this.portfolioService.getPortfolioSummary(this.selectedYear).subscribe({
      next: (data) => {
        console.log('📊 Summary data loaded:', data);
        this.summaryData = data;
        this.isLoadingSummary = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur chargement résumé:', error);
        this.isLoadingSummary = false;
        if (!this.summaryData) {
          this.summaryData = {
            totalEncours: 30000,
            creditsActifs: this.credits.length,
            tauxImpayes: 25,
            risqueGlobal: 'faible',
            scoreRisque: 7.5
          };
        }
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ Version corrigée de loadChartData
  loadChartData(): void {
    this.isLoadingCharts = true;
    this.portfolioService.getPortfolioCharts(this.selectedYear).subscribe({
      next: (data) => {
        console.log('📊 Chart data loaded:', data);
        this.chartData = data;
        this.isLoadingCharts = false;
        
        // ✅ Forcer la détection des changements
        this.cdr.detectChanges();
        
        // ✅ Réinitialiser les graphiques après un court délai
        setTimeout(() => {
          if (this.chartsComponent) {
            console.log('🔄 Réinitialisation des graphiques...');
            this.chartsComponent.resetCharts();
          }
        }, 200);
      },
      error: (error) => {
        console.error('❌ Erreur chargement charts:', error);
        this.isLoadingCharts = false;
        this.chartData = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadRiskData(): void {
    this.isLoadingRisk = true;
    this.portfolioService.getPortfolioRisk(this.selectedYear).subscribe({
      next: (data) => {
        console.log('✅ Risk data loaded:', data);
        this.riskData = data || {};
        this.isLoadingRisk = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur chargement risques:', error);
        this.isLoadingRisk = false;
        this.riskData = null;
        this.cdr.detectChanges();
      }
    });
  }

  refreshData(): void {
    if (!this.isLoading) {
      this.loadPortfolioData();
      this.snackBar.open('Données actualisées', 'OK', {
        duration: 2000,
        panelClass: 'success-snackbar'
      });
    }
  }

  viewCreditDetails(creditId: string | number): void {
    this.dialog.open(PortfolioDetailDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { creditId: creditId }
    });
  }

  generateStrategyReport(): void {
    this.snackBar.open('Génération du rapport stratégique...', 'En cours', {
      duration: 3000
    });

    this.managerService.generateStrategyReport().subscribe({
      next: () => {
        this.snackBar.open('Rapport stratégique généré avec succès', 'Télécharger', {
          duration: 5000
        });
      },
      error: (error) => {
        console.error('Erreur génération rapport:', error);
        this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  exportPortfolioData(): void {
    this.portfolioService.exportPortfolioData(this.selectedYear).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `portefeuille_${this.selectedYear}.xlsx`;
        link.click();
        this.snackBar.open('Exportation réussie', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erreur exportation:', error);
        this.snackBar.open('Erreur lors de l\'exportation', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadPortfolioData();
  }

  resetFilters(): void {
    this.selectedYear = new Date().getFullYear();
    this.selectedStatus = 'all';
    this.selectedType = 'all';
    this.selectedRiskLevel = 'all';
    this.currentPage = 0;
    this.loadPortfolioData();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPortfolioData();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshData();
      }, 300000);
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'en_cours': 'primary',
      'termine': 'success',
      'impaye': 'danger',
      'en_retard': 'warning',
      'approuve': 'success',
      'refuse': 'danger',
      'en_attente': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'PENDING_ANALYSIS': 'warning',
      'UNDER_REVIEW': 'primary',
      'DRAFT': 'default',
      'CANCELLED': 'default'
    };
    return colors[status] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'impaye': 'Impayé',
      'en_retard': 'En retard',
      'approuve': 'Approuvé',
      'refuse': 'Refusé',
      'en_attente': 'En attente',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Refusé',
      'PENDING_ANALYSIS': 'En attente',
      'UNDER_REVIEW': 'En révision',
      'DRAFT': 'Brouillon',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  getRiskLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'faible': 'success',
      'moyen': 'warning',
      'élevé': 'danger',
      'critique': 'danger',
      'low': 'success',
      'medium': 'warning',
      'high': 'danger'
    };
    return colors[level] || 'default';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getTotalPortfolioValue(): number {
    if (!this.credits) return 0;
    return this.credits.reduce((sum, credit) => sum + (credit.montant || 0), 0);
  }
}
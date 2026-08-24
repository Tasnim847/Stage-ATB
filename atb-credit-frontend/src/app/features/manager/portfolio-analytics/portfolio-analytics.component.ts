// portfolio-analytics.component.ts - Version complète corrigée
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { PortfolioService } from '@core/services/portfolio.service';
import { ManagerService } from '@core/services/manager.service';

@Component({
  selector: 'app-portfolio-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './portfolio-analytics.component.html',
  styleUrls: ['./portfolio-analytics.component.css']
})
export class PortfolioAnalyticsComponent implements OnInit, OnDestroy {
  isLoading = false;
  analyticsData: any = null;
  selectedPeriod = 'month';
  selectedSegment = 'all';
  currentDate = new Date();  // ✅ Propriété pour la date

  // Tableau des crédits à risque
  displayedColumns: string[] = [
    'client',
    'montant',
    'type',
    'statut',
    'risque',
    'proba_defaut',
    'actions'
  ];
  creditsARisque: any[] = [];

  // Statistiques globales
  stats: any = {
    totalPortfolio: 0,
    averageRiskScore: 0,
    totalLoans: 0,
    nonPerformingLoans: 0,
    performanceRate: 0,
    concentrationRisk: 0
  };

  // Segmentation par type
  segmentData: any[] = [];

  refreshInterval: any = null;
  autoRefresh = true;

  constructor(
    private portfolioService: PortfolioService,
    private managerService: ManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();

    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.loadAnalyticsData();
      }, 300000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAnalyticsData(): void {
    this.isLoading = true;
    this.currentDate = new Date();  // ✅ Mettre à jour la date

    const params = {
      period: this.selectedPeriod,
      segment: this.selectedSegment
    };

    this.portfolioService.getPortfolioAnalytics(params).subscribe({
      next: (data: any) => {
        this.analyticsData = data;
        this.creditsARisque = data.creditsARisque || [];
        this.stats = data.stats || this.stats;
        this.segmentData = data.segmentData || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur chargement analytics:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des analyses', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        this.loadMockData();
      }
    });
  }

  loadMockData(): void {
    this.stats = {
      totalPortfolio: 35000000,
      averageRiskScore: 42,
      totalLoans: 1250,
      nonPerformingLoans: 78,
      performanceRate: 93.8,
      concentrationRisk: 35
    };

    this.creditsARisque = [
      {
        id: 1,
        client: 'Ahmed Ben Ali',
        montant: 250000,
        type: 'Crédit Immobilier',
        statut: 'En cours',
        risque: 'Élevé',
        proba_defaut: 42
      },
      {
        id: 2,
        client: 'Sofia Mansouri',
        montant: 150000,
        type: 'Crédit Professionnel',
        statut: 'En retard',
        risque: 'Critique',
        proba_defaut: 68
      },
      {
        id: 3,
        client: 'Karim Ben Sassi',
        montant: 75000,
        type: 'Crédit Auto',
        statut: 'En cours',
        risque: 'Moyen',
        proba_defaut: 28
      }
    ];

    this.segmentData = [
      { segment: 'Immobilier', montant: 15000000, credit: 450, risque_moyen: 35 },
      { segment: 'Consommation', montant: 8000000, credit: 320, risque_moyen: 45 },
      { segment: 'Professionnel', montant: 7000000, credit: 280, risque_moyen: 55 },
      { segment: 'Auto', montant: 5000000, credit: 200, risque_moyen: 30 }
    ];
  }

  refreshData(): void {
    this.currentDate = new Date();  // ✅ Mettre à jour la date
    this.loadAnalyticsData();
    this.snackBar.open('Données actualisées', 'OK', { duration: 2000 });
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadAnalyticsData();
  }

  changeSegment(segment: string): void {
    this.selectedSegment = segment;
    this.loadAnalyticsData();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.loadAnalyticsData();
      }, 300000);
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }

  viewCreditDetail(creditId: number): void {
    // Navigation vers les détails du crédit
    console.log('Voir détails du crédit:', creditId);
  }

  // portfolio-analytics.component.ts - Version corrigée avec gestion de blob
generateDetailedReport(): void {
  this.snackBar.open('Génération du rapport détaillé...', 'En cours', {
    duration: 3000
  });

  this.managerService.generateDetailedReport({
    period: this.selectedPeriod,
    segment: this.selectedSegment
  }).subscribe({
    next: (blob: Blob) => {
      // ✅ Maintenant on reçoit directement un Blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_detaille_${this.selectedPeriod}_${this.selectedSegment}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open('Rapport téléchargé avec succès', 'OK', {
        duration: 3000
      });
    },
    error: (error: any) => {
      console.error('Erreur génération rapport:', error);
      this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  });
}

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getRiskColor(risk: string): string {
    const colors: { [key: string]: string } = {
      'Faible': 'success',
      'Moyen': 'warning',
      'Élevé': 'danger',
      'Critique': 'danger'
    };
    return colors[risk] || 'default';
  }

  getRiskClass(risk: string): string {
    const classes: { [key: string]: string } = {
      'Faible': 'risk-low',
      'Moyen': 'risk-medium',
      'Élevé': 'risk-high',
      'Critique': 'risk-critical'
    };
    return classes[risk] || '';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'En cours': 'primary',
      'Approuvé': 'success',
      'Refusé': 'danger',
      'En attente': 'warning',
      'En retard': 'danger'
    };
    return colors[status] || 'default';
  }
}
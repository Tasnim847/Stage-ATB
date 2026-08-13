// features/manager/ai-fraud/ai-fraud.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';

import { AIFraudService, FraudAlert, FraudType, FraudStatistics } from '@core/services/ai-fraud.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ai-fraud',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTableModule,
    MatDialogModule,
    MatBadgeModule
  ],
  templateUrl: './ai-fraud.component.html',
  styleUrls: ['./ai-fraud.component.css']
})
export class AIFraudComponent implements OnInit {
  private fraudService = inject(AIFraudService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Données
  alerts: FraudAlert[] = [];
  filteredAlerts: FraudAlert[] = [];
  statistics: FraudStatistics | null = null;
  
  // États
  loading = false;
  
  // Filtres
  filterStatus: string = 'ALL';
  filterSeverity: string = 'ALL';
  searchTerm: string = '';
  
  // Colonnes du tableau
  displayedColumns: string[] = [
    'severity',
    'fraudType',
    'requestNumber',
    'clientName',
    'confidence',
    'status',
    'createdAt',
    'actions'
  ];

  // Options de filtrage
  statusOptions = [
    { value: 'ALL', label: 'Tous' },
    { value: 'NEW', label: '🆕 Nouveaux' },
    { value: 'UNDER_REVIEW', label: '📋 En révision' },
    { value: 'CONFIRMED', label: '✅ Confirmés' },
    { value: 'REJECTED', label: '❌ Rejetés' }
  ];

  severityOptions = [
    { value: 'ALL', label: 'Toutes' },
    { value: 'LOW', label: '🟢 Faible' },
    { value: 'MEDIUM', label: '🟡 Moyen' },
    { value: 'HIGH', label: '🟠 Élevé' },
    { value: 'CRITICAL', label: '🔴 Critique' }
  ];

  // Types de fraude pour l'affichage
  fraudTypeLabels: { [key: string]: string } = {
    'DOCUMENT_FORGERY': '📄 Falsification de documents',
    'IDENTITY_THEFT': '🆔 Usurpation d\'identité',
    'INCOME_MISMATCH': '💰 Revenus incohérents',
    'DUPLICATE_APPLICATION': '📋 Doublon de dossier',
    'SYNDICATED_FRAUD': '👥 Fraude organisée',
    'COLLUSION': '🤝 Collusion',
    'MONEY_LAUNDERING': '💵 Blanchiment d\'argent',
    'OTHER': '❓ Autre'
  };

  private chart: Chart | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    Promise.all([
      this.loadAlerts(),
      this.loadStatistics()
    ]).finally(() => {
      this.loading = false;
      setTimeout(() => this.initChart(), 300);
    });
  }

  loadAlerts(): Promise<void> {
    return new Promise((resolve) => {
      this.fraudService.getFraudAlerts().subscribe({
        next: (data) => {
          this.alerts = data;
          this.applyFilters();
          resolve();
        },
        error: (error) => {
          console.error('Erreur chargement alertes:', error);
          this.snackBar.open('❌ Erreur lors du chargement des alertes', 'Fermer', {
            duration: 3000
          });
          resolve();
        }
      });
    });
  }

  loadStatistics(): Promise<void> {
    return new Promise((resolve) => {
      this.fraudService.getFraudStatistics().subscribe({
        next: (data) => {
          this.statistics = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur chargement statistiques:', error);
          resolve();
        }
      });
    });
  }

  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      // Filtre par statut
      if (this.filterStatus !== 'ALL' && alert.status !== this.filterStatus) {
        return false;
      }
      
      // Filtre par sévérité
      if (this.filterSeverity !== 'ALL' && alert.severity !== this.filterSeverity) {
        return false;
      }
      
      // Filtre par recherche
      if (this.searchTerm.trim()) {
        const search = this.searchTerm.toLowerCase().trim();
        const requestMatch = alert.requestNumber.toLowerCase().includes(search);
        const clientMatch = alert.clientName.toLowerCase().includes(search);
        if (!requestMatch && !clientMatch) {
          return false;
        }
      }
      
      return true;
    });
  }

  initChart(): void {
    if (!this.statistics) return;

    const ctx = document.getElementById('fraudChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = Object.keys(this.statistics.byType);
    const data = Object.values(this.statistics.byType);

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.map(l => this.fraudTypeLabels[l] || l),
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(244, 67, 54, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(33, 150, 243, 0.8)',
            'rgba(156, 39, 176, 0.8)',
            'rgba(0, 188, 212, 0.8)',
            'rgba(96, 125, 139, 0.8)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Répartition des types de fraude'
          }
        }
      }
    });
  }

  // ============================================
  // ACTIONS
  // ============================================

  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      'LOW': 'Faible',
      'MEDIUM': 'Moyen',
      'HIGH': 'Élevé',
      'CRITICAL': 'Critique'
    };
    return labels[severity] || severity;
  }

  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336',
      'CRITICAL': '#c62828'
    };
    return colors[severity] || '#666';
  }

  getSeverityChipColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'LOW': 'primary',
      'MEDIUM': 'accent',
      'HIGH': 'warn',
      'CRITICAL': 'warn'
    };
    return colors[severity] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'NEW': '🆕 Nouveau',
      'UNDER_REVIEW': '📋 En révision',
      'CONFIRMED': '✅ Confirmé',
      'REJECTED': '❌ Rejeté'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'NEW': 'accent',
      'UNDER_REVIEW': 'primary',
      'CONFIRMED': 'warn',
      'REJECTED': 'default'
    };
    return colors[status] || 'default';
  }

  getConfidenceLabel(confidence: number): string {
    if (confidence >= 80) return 'Élevée';
    if (confidence >= 60) return 'Moyenne';
    return 'Faible';
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return '#4caf50';
    if (confidence >= 60) return '#ff9800';
    return '#f44336';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewDetails(alertId: string): void {
    // Naviguer vers les détails de l'alerte
    this.snackBar.open(`🔍 Affichage des détails de l'alerte`, 'Fermer', {
      duration: 2000
    });
  }

  updateStatus(alert: FraudAlert, status: string): void {
    this.loading = true;
    this.fraudService.updateFraudAlertStatus(alert.id, status).subscribe({
      next: (updated) => {
        const index = this.alerts.findIndex(a => a.id === updated.id);
        if (index !== -1) {
          this.alerts[index] = updated;
        }
        this.applyFilters();
        this.loading = false;
        this.snackBar.open(`✅ Statut mis à jour: ${this.getStatusLabel(status)}`, 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur mise à jour statut:', error);
        this.loading = false;
        this.snackBar.open('❌ Erreur lors de la mise à jour du statut', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  generateReport(): void {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    this.loading = true;
    this.fraudService.generateFraudReport(
      monthAgo.toISOString(),
      today.toISOString()
    ).subscribe({
      next: (report) => {
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-fraude-${today.toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.snackBar.open('📊 Rapport de fraude généré avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur génération rapport:', error);
        this.loading = false;
        this.snackBar.open('❌ Erreur lors de la génération du rapport', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  resetFilters(): void {
    this.filterStatus = 'ALL';
    this.filterSeverity = 'ALL';
    this.searchTerm = '';
    this.applyFilters();
  }

  refresh(): void {
    this.loadData();
  }
}
// features/manager/ai-strategy/ai-strategy.component.ts
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AIStrategyService, StrategicReportResponse, StrategicReportRequest, AIDecisionDTO } from '@core/services/ai-strategy.service';

@Component({
  selector: 'app-ai-strategy',
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
    MatSlideToggleModule,
    MatDialogModule
  ],
  templateUrl: './ai-strategy.component.html',
  styleUrls: ['./ai-strategy.component.css']
})
export class AIStrategyComponent implements OnInit {
  private aiStrategyService = inject(AIStrategyService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // États
  loading = false;
  generating = false;
  selectedReport: StrategicReportResponse | null = null;
  reports: StrategicReportResponse[] = [];
  aiDecisions: AIDecisionDTO[] = [];
  
  // Configuration du rapport
  reportConfig: StrategicReportRequest = {
    period: 'today',
    includeRiskAnalysis: true,
    includePerformance: true,
    includeForecast: true,
    language: 'fr'
  };

  // Options
  periods = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];

  languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  ngOnInit(): void {
    this.loadReports();
    this.loadAIDecisions();
  }

  loadReports(): void {
    this.loading = true;
    this.aiStrategyService.getStrategicReports(10).subscribe({
      next: (reports) => {
        this.reports = reports;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement rapports:', error);
        this.loading = false;
        this.snackBar.open('❌ Erreur lors du chargement des rapports', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  loadAIDecisions(): void {
    this.aiStrategyService.getAIDecisions().subscribe({
      next: (decisions) => {
        this.aiDecisions = decisions;
      },
      error: (error) => {
        console.error('Erreur chargement décisions IA:', error);
      }
    });
  }

  generateReport(): void {
    this.generating = true;
    this.selectedReport = null;

    this.aiStrategyService.generateStrategicReport(this.reportConfig).subscribe({
      next: (report) => {
        this.selectedReport = report;
        this.generating = false;
        // Ajouter le rapport à la liste
        this.reports = [report, ...this.reports];
        this.snackBar.open('✅ Rapport stratégique généré avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur génération rapport:', error);
        this.generating = false;
        this.snackBar.open('❌ Erreur lors de la génération du rapport', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  viewReport(report: StrategicReportResponse): void {
    this.selectedReport = report;
  }

  exportReport(format: 'pdf' | 'docx' | 'json'): void {
    if (!this.selectedReport) return;

    this.aiStrategyService.exportReport(this.selectedReport.id, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-strategique-${this.selectedReport?.date}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open(`📊 Rapport exporté au format ${format.toUpperCase()}`, 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur export:', error);
        this.snackBar.open('❌ Erreur lors de l\'export du rapport', 'Fermer', {
          duration: 3000
        });
      }
    });
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

  getTrendIcon(trend: string): string {
    const icons: { [key: string]: string } = {
      'up': 'trending_up',
      'down': 'trending_down',
      'stable': 'trending_flat'
    };
    return icons[trend] || 'trending_flat';
  }

  getTrendColor(trend: string): string {
    const colors: { [key: string]: string } = {
      'up': '#4caf50',
      'down': '#f44336',
      'stable': '#ff9800'
    };
    return colors[trend] || '#666';
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

  refresh(): void {
    this.loadReports();
    this.loadAIDecisions();
  }
}
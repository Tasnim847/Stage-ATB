import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// ✅ AJOUTER CET IMPORT
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { AlertLevel, RiskLevel, RiskThreshold } from '@app/core/models';

@Component({
  selector: 'app-risk-thresholds',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule  // ✅ AJOUTER ICI
  ],
  templateUrl: './risk-thresholds.component.html',
  styleUrls: ['./risk-thresholds.component.css']
})
export class RiskThresholdsComponent implements OnInit {
  AlertLevel = AlertLevel;
  RiskLevel = RiskLevel;
  thresholds: RiskThreshold[] = [];
  hasChanges = false;
  saved = false;
  error = false;
  loading = false;

  constructor(
    private riskService: RiskAnalysisService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadThresholds();
  }

  loadThresholds(): void {
    this.loading = true;
    this.riskService.getRiskThresholds().subscribe({
      next: (data) => {
        this.thresholds = data;
        this.hasChanges = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des seuils:', err);
        this.loading = false;
        // Données par défaut en cas d'erreur
        this.thresholds = [
          { 
            id: '1', 
            minScore: 0, 
            maxScore: 30, 
            level: RiskLevel.LOW, 
            label: 'Faible', 
            color: '#4CAF50', 
            alertLevel: AlertLevel.NONE, 
            isActive: true 
          },
          { 
            id: '2', 
            minScore: 31, 
            maxScore: 60, 
            level: RiskLevel.MEDIUM, 
            label: 'Moyen', 
            color: '#FFC107', 
            alertLevel: AlertLevel.ANALYST, 
            isActive: true 
          },
          { 
            id: '3', 
            minScore: 61, 
            maxScore: 80, 
            level: RiskLevel.HIGH, 
            label: 'Élevé', 
            color: '#FF9800', 
            alertLevel: AlertLevel.MANAGER, 
            isActive: true 
          },
          { 
            id: '4', 
            minScore: 81, 
            maxScore: 100, 
            level: RiskLevel.CRITICAL, 
            label: 'Critique', 
            color: '#F44336', 
            alertLevel: AlertLevel.ADMIN, 
            isActive: true 
          }
        ];
        this.snackBar.open('Erreur lors du chargement des seuils', 'Fermer', { duration: 3000 });
      }
    });
  }

  onChange(): void {
    this.hasChanges = true;
    this.saved = false;
    this.error = false;
  }

  onToggle(threshold: RiskThreshold): void {
    this.hasChanges = true;
    this.saved = false;
  }

  saveThresholds(): void {
    if (!this.hasChanges) {
      this.snackBar.open('Aucune modification à enregistrer', 'Fermer', { duration: 2000 });
      return;
    }

    this.loading = true;
    this.riskService.updateRiskThresholds(this.thresholds).subscribe({
      next: () => {
        this.saved = true;
        this.hasChanges = false;
        this.loading = false;
        this.snackBar.open('✅ Seuils enregistrés avec succès', 'Fermer', { duration: 3000 });
        setTimeout(() => this.saved = false, 3000);
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement:', err);
        this.error = true;
        this.loading = false;
        this.snackBar.open('❌ Erreur lors de l\'enregistrement des seuils', 'Fermer', { duration: 3000 });
        setTimeout(() => this.error = false, 3000);
      }
    });
  }

  resetDefaults(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser les seuils aux valeurs par défaut ?')) {
      this.thresholds = [
        { 
          id: '1', 
          minScore: 0, 
          maxScore: 30, 
          level: RiskLevel.LOW, 
          label: 'Faible', 
          color: '#4CAF50', 
          alertLevel: AlertLevel.NONE, 
          isActive: true 
        },
        { 
          id: '2', 
          minScore: 31, 
          maxScore: 60, 
          level: RiskLevel.MEDIUM, 
          label: 'Moyen', 
          color: '#FFC107', 
          alertLevel: AlertLevel.ANALYST, 
          isActive: true 
        },
        { 
          id: '3', 
          minScore: 61, 
          maxScore: 80, 
          level: RiskLevel.HIGH, 
          label: 'Élevé', 
          color: '#FF9800', 
          alertLevel: AlertLevel.MANAGER, 
          isActive: true 
        },
        { 
          id: '4', 
          minScore: 81, 
          maxScore: 100, 
          level: RiskLevel.CRITICAL, 
          label: 'Critique', 
          color: '#F44336', 
          alertLevel: AlertLevel.ADMIN, 
          isActive: true 
        }
      ];
      this.hasChanges = true;
      this.saved = false;
      this.error = false;
      this.snackBar.open('Seuils réinitialisés, enregistrez pour appliquer', 'Fermer', { duration: 3000 });
    }
  }

  // ✅ Méthode utilitaire pour obtenir la couleur du niveau
  getRiskLevelColor(level: string): string {
    const colors: Record<string, string> = {
      'FAIBLE': '#4CAF50',
      'MOYEN': '#FFC107',
      'ELEVE': '#FF9800',
      'CRITIQUE': '#F44336'
    };
    return colors[level] || '#6b7a8f';
  }

  // ✅ Méthode utilitaire pour obtenir le label du niveau
  getRiskLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'FAIBLE': 'Faible',
      'MOYEN': 'Moyen',
      'ELEVE': 'Élevé',
      'CRITIQUE': 'Critique'
    };
    return labels[level] || level;
  }
}
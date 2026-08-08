import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { FraudRule } from '@app/core/models';
import { FraudRuleDialogComponent } from '../fraud-rule-dialog/fraud-rule-dialog.component';

@Component({
  selector: 'app-fraud-detection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSliderModule
  ],
  templateUrl: './fraud-detection.component.html',
  styleUrls: ['./fraud-detection.component.css']
})
export class FraudDetectionComponent implements OnInit {
  rules: FraudRule[] = [];
  loading = false;
  hasChanges = false;
  saved = false;
  error = false;

  constructor(
    private riskService: RiskAnalysisService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.loading = true;
    this.riskService.getFraudRules().subscribe({
      next: (data) => {
        this.rules = data;
        this.loading = false;
        this.hasChanges = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des règles', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loadDefaultRules();
      }
    });
  }

  private loadDefaultRules(): void {
    this.rules = [
      { 
        id: '1', 
        name: 'Revenus incohérents', 
        description: 'Incohérence entre les revenus déclarés et les justificatifs', 
        weight: 20, 
        isActive: true, 
        threshold: 60 
      },
      { 
        id: '2', 
        name: 'Documents modifiés', 
        description: 'Détection de modifications suspectes sur les documents', 
        weight: 30, 
        isActive: true, 
        threshold: 50 
      },
      { 
        id: '3', 
        name: 'Dossier dupliqué', 
        description: 'Demande de crédit identique déjà soumise', 
        weight: 15, 
        isActive: true, 
        threshold: 70 
      },
      { 
        id: '4', 
        name: 'Faux relevé bancaire', 
        description: 'Relevé bancaire suspect ou falsifié', 
        weight: 40, 
        isActive: true, 
        threshold: 40 
      },
      { 
        id: '5', 
        name: 'Faux bulletin de salaire', 
        description: 'Bulletin de salaire suspect ou falsifié', 
        weight: 35, 
        isActive: true, 
        threshold: 45 
      }
    ];
  }

  onChange(): void {
    this.hasChanges = true;
    this.saved = false;
    this.error = false;
  }

  // ============================================
  // CRUD
  // ============================================

  addRule(): void {
    const dialogRef = this.dialog.open(FraudRuleDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        // Créer un nouvel ID temporaire
        const newRule = {
          ...result,
          id: 'temp_' + Date.now()
        };
        // Appeler l'API pour ajouter la règle
        this.riskService.addFraudRule(newRule).subscribe({
          next: (createdRule) => {
            this.rules.push(createdRule);
            this.loading = false;
            this.hasChanges = true;
            this.snackBar.open('Règle ajoutée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open(error.message || 'Erreur lors de l\'ajout', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  editRule(rule: FraudRule): void {
    const dialogRef = this.dialog.open(FraudRuleDialogComponent, {
      width: '600px',
      data: { rule }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.riskService.updateFraudRule(rule.id, result).subscribe({
          next: (updatedRule) => {
            const index = this.rules.findIndex(r => r.id === rule.id);
            if (index !== -1) {
              this.rules[index] = updatedRule;
            }
            this.loading = false;
            this.hasChanges = true;
            this.snackBar.open('Règle mise à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open(error.message || 'Erreur lors de la mise à jour', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteRule(rule: FraudRule): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la règle "${rule.name}" ?`)) {
      this.loading = true;
      this.riskService.deleteFraudRule(rule.id).subscribe({
        next: () => {
          this.rules = this.rules.filter(r => r.id !== rule.id);
          this.loading = false;
          this.hasChanges = true;
          this.snackBar.open('Règle supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // ============================================
  // TOGGLES
  // ============================================

  toggleRule(rule: FraudRule): void {
    const newStatus = !rule.isActive;
    this.riskService.toggleFraudRule(rule.id, newStatus).subscribe({
      next: (updatedRule) => {
        rule.isActive = updatedRule.isActive;
        this.hasChanges = true;
        this.snackBar.open(
          `Règle ${updatedRule.isActive ? 'activée' : 'désactivée'} avec succès`,
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: () => {
        rule.isActive = !newStatus;
        this.snackBar.open('Erreur lors du basculement', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // ============================================
  // SAUVEGARDE
  // ============================================

  saveRules(): void {
    this.loading = true;
    const updates = this.rules.map(r => 
      this.riskService.updateFraudRule(r.id, r).toPromise()
    );
    
    Promise.all(updates)
      .then(() => {
        this.loading = false;
        this.saved = true;
        this.hasChanges = false;
        setTimeout(() => this.saved = false, 3000);
        this.snackBar.open('Toutes les règles ont été sauvegardées', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      })
      .catch(() => {
        this.loading = false;
        this.error = true;
        setTimeout(() => this.error = false, 3000);
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      });
  }

  resetDefaults(): void {
    if (confirm('Voulez-vous réinitialiser toutes les règles par défaut ?')) {
      this.loading = true;
      this.riskService.resetFraudRules().subscribe({
        next: (defaultRules) => {
          this.rules = defaultRules;
          this.loading = false;
          this.hasChanges = true;
          this.saved = false;
          this.snackBar.open('Règles réinitialisées avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Erreur lors de la réinitialisation', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  getThresholdSeverity(threshold: number): string {
    if (threshold <= 30) return 'low';
    if (threshold <= 50) return 'medium';
    if (threshold <= 70) return 'high';
    return 'critical';
  }

  getThresholdLabel(threshold: number): string {
    if (threshold <= 30) return '🔵 Faible';
    if (threshold <= 50) return '🟡 Moyen';
    if (threshold <= 70) return '🟠 Élevé';
    return '🔴 Critique';
  }

  getThresholdColor(threshold: number): string {
    if (threshold <= 30) return '#4CAF50';
    if (threshold <= 50) return '#FFC107';
    if (threshold <= 70) return '#FF9800';
    return '#e74c3c';
  }
}
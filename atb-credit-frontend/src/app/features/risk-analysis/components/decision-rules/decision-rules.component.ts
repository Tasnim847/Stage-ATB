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
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DecisionAction, DecisionActionLabels, DecisionRule } from '@app/core/models';
import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { DecisionRuleDialogComponent } from '../decision-rule-dialog/decision-rule-dialog.component';

@Component({
  selector: 'app-decision-rules',
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
    DragDropModule
  ],
  templateUrl: './decision-rules.component.html',
  styleUrls: ['./decision-rules.component.css']
})
export class DecisionRulesComponent implements OnInit {
  rules: DecisionRule[] = [];
  loading = false;

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
    this.riskService.getDecisionRules().subscribe({
      next: (data) => {
        this.rules = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des règles', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getActionLabel(action: string): string {
    return DecisionActionLabels[action as DecisionAction] || action;
  }

  addRule(): void {
    const dialogRef = this.dialog.open(DecisionRuleDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.riskService.addDecisionRule(result).subscribe({
          next: (newRule) => {
            this.rules.push(newRule);
            this.sortRules();
            this.loading = false;
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

  editRule(rule: DecisionRule): void {
    const dialogRef = this.dialog.open(DecisionRuleDialogComponent, {
      width: '600px',
      data: { rule }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.riskService.updateDecisionRule(rule.id, result).subscribe({
          next: (updatedRule) => {
            const index = this.rules.findIndex(r => r.id === rule.id);
            if (index !== -1) {
              this.rules[index] = updatedRule;
              this.sortRules();
            }
            this.loading = false;
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

  toggleRule(rule: DecisionRule): void {
    const newStatus = !rule.isActive;
    this.riskService.toggleDecisionRule(rule.id, newStatus).subscribe({
      next: (updatedRule) => {
        rule.isActive = updatedRule.isActive;
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

  deleteRule(rule: DecisionRule): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la règle "${rule.name}" ?`)) {
      this.loading = true;
      this.riskService.deleteDecisionRule(rule.id).subscribe({
        next: () => {
          this.rules = this.rules.filter(r => r.id !== rule.id);
          this.loading = false;
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

  drop(event: CdkDragDrop<DecisionRule[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.rules, event.previousIndex, event.currentIndex);
      const ruleIds = this.rules.map(r => r.id);
      this.riskService.reorderRules(ruleIds).subscribe({
        next: () => {
          // Mettre à jour les priorités
          this.rules.forEach((rule, index) => {
            rule.priority = index + 1;
          });
          this.snackBar.open('Ordre des règles mis à jour', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: () => {
          // Recharger les règles en cas d'erreur
          this.loadRules();
          this.snackBar.open('Erreur lors de la réorganisation', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private sortRules(): void {
    this.rules.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }
}
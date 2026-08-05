import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DecisionAction, DecisionActionLabels, DecisionRule } from '@app/core/models';
import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';

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
    DragDropModule
  ],
  templateUrl: './decision-rules.component.html',
  styleUrls: ['./decision-rules.component.css']
})
export class DecisionRulesComponent implements OnInit {
  rules: DecisionRule[] = [];

  constructor(
    private riskService: RiskAnalysisService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.riskService.getDecisionRules().subscribe({
      next: (data) => this.rules = data,
      error: () => {
        this.rules = [
          {
            id: '1',
            name: 'Refus automatique - Endettement élevé',
            description: 'Refuser automatiquement si le taux d\'endettement dépasse 40%',
            condition: 'taux_endettement > 40',
            action: DecisionAction.AUTO_REJECT,
            priority: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            name: 'Acceptation automatique - Score IA faible',
            description: 'Accepter automatiquement si le score IA est inférieur à 30',
            condition: 'score_IA < 30',
            action: DecisionAction.AUTO_ACCEPT,
            priority: 2,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            name: 'Blocage - Document manquant',
            description: 'Bloquer le dossier si des documents sont manquants',
            condition: 'document_manquant',
            action: DecisionAction.BLOCK,
            priority: 3,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }
    });
  }

  getActionLabel(action: DecisionAction): string {
    return DecisionActionLabels[action] || action;
  }

  addRule(): void {
    // TODO: Ouvrir un dialogue pour ajouter une règle
  }

  editRule(rule: DecisionRule): void {
    // TODO: Ouvrir un dialogue pour modifier la règle
  }

  toggleRule(rule: DecisionRule): void {
    rule.isActive = !rule.isActive;
    this.riskService.toggleDecisionRule(rule.id, rule.isActive).subscribe({
      next: () => {},
      error: () => rule.isActive = !rule.isActive
    });
  }

  deleteRule(rule: DecisionRule): void {
    if (confirm(`Supprimer la règle "${rule.name}" ?`)) {
      this.riskService.deleteDecisionRule(rule.id).subscribe({
        next: () => {
          this.rules = this.rules.filter(r => r.id !== rule.id);
        }
      });
    }
  }

  drop(event: CdkDragDrop<DecisionRule[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.rules, event.previousIndex, event.currentIndex);
      const ruleIds = this.rules.map(r => r.id);
      this.riskService.reorderRules(ruleIds).subscribe();
    }
  }
}
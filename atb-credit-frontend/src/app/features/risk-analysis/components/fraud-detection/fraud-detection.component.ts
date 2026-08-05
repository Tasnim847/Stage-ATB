import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { FraudRule } from '@app/core/models';

@Component({
  selector: 'app-fraud-detection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule
  ],
  templateUrl: './fraud-detection.component.html',
  styleUrls: ['./fraud-detection.component.css']
})
export class FraudDetectionComponent implements OnInit {
  rules: FraudRule[] = [];
  hasChanges = false;
  saved = false;
  error = false;

  constructor(private riskService: RiskAnalysisService) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.riskService.getFraudRules().subscribe({
      next: (data) => {
        this.rules = data;
        this.hasChanges = false;
      },
      error: () => {
        this.rules = [
          { id: '1', name: 'Revenus incohérents', description: 'Incohérence entre les revenus déclarés et les justificatifs', weight: 20, isActive: true, threshold: 60 },
          { id: '2', name: 'Documents modifiés', description: 'Détection de modifications suspectes sur les documents', weight: 30, isActive: true, threshold: 50 },
          { id: '3', name: 'Dossier dupliqué', description: 'Demande de crédit identique déjà soumise', weight: 15, isActive: true, threshold: 70 },
          { id: '4', name: 'Faux relevé bancaire', description: 'Relevé bancaire suspect ou falsifié', weight: 40, isActive: true, threshold: 40 },
          { id: '5', name: 'Faux bulletin de salaire', description: 'Bulletin de salaire suspect ou falsifié', weight: 35, isActive: true, threshold: 45 }
        ];
      }
    });
  }

  onChange(): void {
    this.hasChanges = true;
    this.saved = false;
    this.error = false;
  }

  toggleRule(rule: FraudRule): void {
    this.hasChanges = true;
    this.riskService.toggleFraudRule(rule.id, rule.isActive).subscribe({
      next: () => {},
      error: () => rule.isActive = !rule.isActive
    });
  }

  addRule(): void {
    // TODO: Ouvrir dialogue d'ajout
  }

  editRule(rule: FraudRule): void {
    // TODO: Ouvrir dialogue de modification
  }

  deleteRule(rule: FraudRule): void {
    if (confirm(`Supprimer la règle "${rule.name}" ?`)) {
      this.riskService.updateFraudRule(rule.id, { isActive: false }).subscribe({
        next: () => {
          this.rules = this.rules.filter(r => r.id !== rule.id);
        }
      });
    }
  }

  saveRules(): void {
    const updates = this.rules.map(r => this.riskService.updateFraudRule(r.id, r).toPromise());
    Promise.all(updates).then(() => {
      this.saved = true;
      this.hasChanges = false;
      setTimeout(() => this.saved = false, 3000);
    }).catch(() => {
      this.error = true;
      setTimeout(() => this.error = false, 3000);
    });
  }

  resetDefaults(): void {
    this.rules = [
      { id: '1', name: 'Revenus incohérents', description: 'Incohérence entre les revenus déclarés et les justificatifs', weight: 20, isActive: true, threshold: 60 },
      { id: '2', name: 'Documents modifiés', description: 'Détection de modifications suspectes sur les documents', weight: 30, isActive: true, threshold: 50 },
      { id: '3', name: 'Dossier dupliqué', description: 'Demande de crédit identique déjà soumise', weight: 15, isActive: true, threshold: 70 },
      { id: '4', name: 'Faux relevé bancaire', description: 'Relevé bancaire suspect ou falsifié', weight: 40, isActive: true, threshold: 40 },
      { id: '5', name: 'Faux bulletin de salaire', description: 'Bulletin de salaire suspect ou falsifié', weight: 35, isActive: true, threshold: 45 }
    ];
    this.hasChanges = true;
    this.saved = false;
    this.error = false;
  }
}
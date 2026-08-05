import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { FinancialRatioConfig } from '@app/core/models';

@Component({
  selector: 'app-financial-ratios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './financial-ratios.component.html',
  styleUrls: ['./financial-ratios.component.css']
})
export class FinancialRatiosComponent implements OnInit {
  ratios: FinancialRatioConfig[] = [];
  hasChanges = false;
  saved = false;
  error = false;
  loading = false;

  constructor(
    private riskService: RiskAnalysisService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRatios();
  }

  loadRatios(): void {
    this.loading = true;
    this.riskService.getFinancialRatios().subscribe({
      next: (data) => {
        this.ratios = data;
        this.hasChanges = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ratios:', err);
        this.loading = false;
        // Données par défaut en cas d'erreur
        this.ratios = [
          { id: '1', name: "Taux d'endettement maximal", description: "Pourcentage maximum d'endettement autorisé par rapport aux revenus", key: 'debt_ratio', maxValue: 40, unit: '%', isActive: true, priority: 1 },
          { id: '2', name: 'Capacité de remboursement minimale', description: 'Pourcentage minimum de capacité de remboursement requise', key: 'repayment_capacity', minValue: 25, maxValue: 100, unit: '%', isActive: true, priority: 2 },
          { id: '3', name: 'Ratio de liquidité minimal', description: 'Ratio de liquidité générale minimum acceptable', key: 'liquidity_ratio', minValue: 1.2, maxValue: 10, unit: '', isActive: true, priority: 3 },
          { id: '4', name: 'Ratio de solvabilité minimal', description: 'Ratio de solvabilité minimum acceptable', key: 'solvency_ratio', minValue: 20, maxValue: 100, unit: '%', isActive: true, priority: 4 }
        ];
        this.snackBar.open('Erreur lors du chargement des ratios', 'Fermer', { duration: 3000 });
      }
    });
  }

  getIndicatorColor(ratio: FinancialRatioConfig): string {
    if (ratio.criticalMax && ratio.maxValue > ratio.criticalMax) return '#e74c3c';
    if (ratio.criticalMin && ratio.minValue && ratio.minValue < ratio.criticalMin) return '#e74c3c';
    return '#27ae60';
  }

  getIndicatorLabel(ratio: FinancialRatioConfig): string {
    if (ratio.criticalMax && ratio.maxValue > ratio.criticalMax) return '⚠️ Seuil critique dépassé';
    if (ratio.criticalMin && ratio.minValue && ratio.minValue < ratio.criticalMin) return '⚠️ En dessous du seuil critique';
    return '✅ Seuil respecté';
  }

  onChange(): void {
    this.hasChanges = true;
    this.saved = false;
    this.error = false;
  }

  saveRatios(): void {
    if (!this.hasChanges) {
      this.snackBar.open('Aucune modification à enregistrer', 'Fermer', { duration: 2000 });
      return;
    }

    this.loading = true;
    const updates = this.ratios.map(r => 
      this.riskService.updateFinancialRatio(r.id, r).toPromise()
    );
    
    Promise.all(updates)
      .then(() => {
        this.saved = true;
        this.hasChanges = false;
        this.loading = false;
        this.snackBar.open('✅ Ratios enregistrés avec succès', 'Fermer', { duration: 3000 });
        setTimeout(() => this.saved = false, 3000);
      })
      .catch((err) => {
        console.error('Erreur lors de l\'enregistrement:', err);
        this.error = true;
        this.loading = false;
        this.snackBar.open('❌ Erreur lors de l\'enregistrement des ratios', 'Fermer', { duration: 3000 });
        setTimeout(() => this.error = false, 3000);
      });
  }

  resetDefaults(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser les ratios aux valeurs par défaut ?')) {
      this.ratios = [
        { id: '1', name: "Taux d'endettement maximal", description: "Pourcentage maximum d'endettement autorisé par rapport aux revenus", key: 'debt_ratio', maxValue: 40, unit: '%', isActive: true, priority: 1 },
        { id: '2', name: 'Capacité de remboursement minimale', description: 'Pourcentage minimum de capacité de remboursement requise', key: 'repayment_capacity', minValue: 25, maxValue: 100, unit: '%', isActive: true, priority: 2 },
        { id: '3', name: 'Ratio de liquidité minimal', description: 'Ratio de liquidité générale minimum acceptable', key: 'liquidity_ratio', minValue: 1.2, maxValue: 10, unit: '', isActive: true, priority: 3 },
        { id: '4', name: 'Ratio de solvabilité minimal', description: 'Ratio de solvabilité minimum acceptable', key: 'solvency_ratio', minValue: 20, maxValue: 100, unit: '%', isActive: true, priority: 4 }
      ];
      this.hasChanges = true;
      this.saved = false;
      this.error = false;
      this.snackBar.open('Ratios réinitialisés, enregistrez pour appliquer', 'Fermer', { duration: 3000 });
    }
  }
}
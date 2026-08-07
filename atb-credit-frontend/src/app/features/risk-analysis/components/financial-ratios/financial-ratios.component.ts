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
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { FinancialAnalysisService } from '@app/core/services/financial-analysis.service';
import { ClientService } from '@app/core/services/client.service';
import { CreditRequestService } from '@app/core/services/credit-request.service';
import { FinancialRatioConfig } from '@app/core/models';
import { RatioCalculationRequest, RatioCalculationResponse } from '@app/core/models/financial-analysis.model';

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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './financial-ratios.component.html',
  styleUrls: ['./financial-ratios.component.css']
})
export class FinancialRatiosComponent implements OnInit {
  // ============================================
  // CONFIGURATION DES SEUILS
  // ============================================
  ratios: FinancialRatioConfig[] = [];
  hasChanges = false;
  saved = false;
  error = false;
  loading = false;

  // ============================================
  // CALCUL DES RATIOS
  // ============================================
  ratioResult: RatioCalculationResponse | null = null;
  isCalculating = false;
  clients: any[] = [];
  creditRequests: any[] = [];

  selectedClientId: string = '';
  selectedCreditRequestId: string = '';

  formData = {
    monthlyNetIncome: 0,
    otherMonthlyIncome: 0,
    monthlyCharges: 0,
    existingCreditPayments: 0,
    creditAmount: 0,
    durationMonths: 12,
    annualInterestRate: 5,
    collateralValue: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    currentAssets: 0,
    currentLiabilities: 0,
    ebit: 0,
    financialCharges: 0,
    availableCashFlow: 0,
    annualDebtService: 0
  };

  constructor(
    private riskService: RiskAnalysisService,
    private financialService: FinancialAnalysisService,
    private clientService: ClientService,
    private creditRequestService: CreditRequestService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRatios();
    this.loadClients();
  }

  // ============================================
  // CHARGEMENT DES SEUILS
  // ============================================

  loadRatios(): void {
    this.loading = true;
    this.riskService.getFinancialRatios().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.createDefaultRatios();
        } else {
          this.ratios = data;
          this.hasChanges = false;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ratios:', err);
        this.loading = false;
        this.createDefaultRatios();
      }
    });
  }

  createDefaultRatios(): void {
    this.loading = true;
    const defaultRatios = this.getDefaultRatios();
    
    const promises = defaultRatios.map(ratio => 
      this.riskService.addFinancialRatio(ratio).toPromise()
    );

    Promise.all(promises)
      .then((createdRatios) => {
        this.ratios = createdRatios.filter(r => r !== null) as FinancialRatioConfig[];
        this.hasChanges = false;
        this.loading = false;
        this.snackBar.open('✅ Ratios financiers créés avec succès', 'Fermer', { duration: 3000 });
      })
      .catch((err) => {
        console.error('Erreur lors de la création des ratios:', err);
        this.loading = false;
        this.ratios = defaultRatios as FinancialRatioConfig[];
        this.hasChanges = true;
        this.snackBar.open('⚠️ Ratios créés localement (serveur indisponible)', 'Fermer', { duration: 3000 });
      });
  }

  private getDefaultRatios(): Partial<FinancialRatioConfig>[] {
    return [
        { 
            name: "Taux d'endettement maximal", 
            description: "Pourcentage maximum d'endettement autorisé par rapport aux revenus", 
            maxValue: 40, 
            criticalMax: 45,
            unit: '%', 
            isActive: true, 
            priority: 1 
        },
        { 
            name: 'Capacité de remboursement minimale', 
            description: 'Pourcentage minimum de capacité de remboursement requise', 
            minValue: 25, 
            maxValue: 100,
            criticalMin: 20,
            unit: '%', 
            isActive: true, 
            priority: 2 
        },
        { 
            name: 'Ratio de liquidité minimal', 
            description: 'Ratio de liquidité générale minimum acceptable', 
            minValue: 1.2, 
            maxValue: 10,
            criticalMin: 1.0,
            unit: '-',  // ✅ Utiliser '-' au lieu de ''
            isActive: true, 
            priority: 3 
        },
        { 
            name: 'Ratio de solvabilité minimal', 
            description: 'Ratio de solvabilité minimum acceptable', 
            minValue: 20, 
            maxValue: 100,
            criticalMin: 15,
            unit: '%', 
            isActive: true, 
            priority: 4 
        }
    ];
  }

  // ============================================
  // CHARGEMENT DES CLIENTS
  // ============================================

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data || [];
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
      }
    });
  }

  onClientChange(): void {
    if (this.selectedClientId) {
      this.creditRequestService.getCreditRequestsByClient(this.selectedClientId).subscribe({
        next: (data) => {
          this.creditRequests = data || [];
        },
        error: () => {
          this.creditRequests = [];
        }
      });
    } else {
      this.creditRequests = [];
    }
  }

  onCreditRequestSelect(): void {
    if (this.selectedCreditRequestId) {
      this.creditRequestService.getCreditRequestById(this.selectedCreditRequestId).subscribe({
        next: (request) => {
          if (request) {
            this.formData.creditAmount = request.amount || 0;
            this.formData.durationMonths = request.durationMonths || 12;
            this.formData.annualInterestRate = request.interestRate || 5;
          }
        },
        error: () => {}
      });
    }
  }

  // ============================================
  // CALCUL DES RATIOS
  // ============================================

  calculateRatios(): void {
    if (!this.selectedClientId) {
      this.snackBar.open('Veuillez sélectionner un client', 'Fermer', { duration: 3000 });
      return;
    }

    this.isCalculating = true;
    const request: RatioCalculationRequest = {
      clientId: this.selectedClientId,
      creditRequestId: this.selectedCreditRequestId || undefined,
      monthlyNetIncome: this.formData.monthlyNetIncome,
      otherMonthlyIncome: this.formData.otherMonthlyIncome || 0,
      monthlyCharges: this.formData.monthlyCharges,
      existingCreditPayments: this.formData.existingCreditPayments,
      creditAmount: this.formData.creditAmount,
      durationMonths: this.formData.durationMonths,
      annualInterestRate: this.formData.annualInterestRate,
      collateralValue: this.formData.collateralValue || undefined,
      totalAssets: this.formData.totalAssets || undefined,
      totalLiabilities: this.formData.totalLiabilities || undefined,
      currentAssets: this.formData.currentAssets || undefined,
      currentLiabilities: this.formData.currentLiabilities || undefined,
      ebit: this.formData.ebit || undefined,
      financialCharges: this.formData.financialCharges || undefined,
      availableCashFlow: this.formData.availableCashFlow || undefined,
      annualDebtService: this.formData.annualDebtService || undefined
    };

    this.financialService.calculateRatios(request).subscribe({
      next: (response) => {
        this.ratioResult = response;
        this.isCalculating = false;
        this.snackBar.open('✅ Ratios calculés avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erreur lors du calcul:', err);
        this.isCalculating = false;
        this.snackBar.open('❌ Erreur lors du calcul des ratios', 'Fermer', { duration: 3000 });
      }
    });
  }

  // ============================================
  // GESTION DES SEUILS (Configuration)
  // ============================================

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
    
    const updatePromises = this.ratios.map(ratio => {
      const updateData: Partial<FinancialRatioConfig> = {
        name: ratio.name,
        description: ratio.description,
        minValue: ratio.minValue,
        maxValue: ratio.maxValue,
        criticalMin: ratio.criticalMin,
        criticalMax: ratio.criticalMax,
        unit: ratio.unit,
        isActive: ratio.isActive,
        priority: ratio.priority
      };
      console.log('📤 Mise à jour du ratio:', ratio.id, updateData);
      return this.riskService.updateFinancialRatio(ratio.id, updateData).toPromise();
    });

    Promise.all(updatePromises)
      .then((updatedRatios) => {
        updatedRatios.forEach((updated) => {
          if (updated) {
            const idx = this.ratios.findIndex(r => r.id === updated.id);
            if (idx !== -1) {
              this.ratios[idx] = updated;
            }
          }
        });
        
        this.saved = true;
        this.hasChanges = false;
        this.loading = false;
        this.snackBar.open('✅ Ratios enregistrés avec succès', 'Fermer', { duration: 3000 });
        setTimeout(() => this.saved = false, 3000);
      })
      .catch((err) => {
        console.error('❌ Erreur lors de l\'enregistrement:', err);
        this.error = true;
        this.loading = false;
        this.snackBar.open('❌ Erreur lors de l\'enregistrement des ratios', 'Fermer', { duration: 3000 });
        setTimeout(() => this.error = false, 3000);
      });
  }

  resetDefaults(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser les ratios aux valeurs par défaut ?')) {
      this.ratios = [
        { id: '1', name: "Taux d'endettement maximal", description: "Pourcentage maximum d'endettement autorisé par rapport aux revenus", key: 'debt_ratio', maxValue: 40, unit: '%', isActive: true, priority: 1, criticalMax: 45 },
        { id: '2', name: 'Capacité de remboursement minimale', description: 'Pourcentage minimum de capacité de remboursement requise', key: 'repayment_capacity', minValue: 25, maxValue: 100, unit: '%', isActive: true, priority: 2, criticalMin: 20 },
        { id: '3', name: 'Ratio de liquidité minimal', description: 'Ratio de liquidité générale minimum acceptable', key: 'liquidity_ratio', minValue: 1.2, maxValue: 10, unit: '-', isActive: true, priority: 3, criticalMin: 1.0 },
        { id: '4', name: 'Ratio de solvabilité minimal', description: 'Ratio de solvabilité minimum acceptable', key: 'solvency_ratio', minValue: 20, maxValue: 100, unit: '%', isActive: true, priority: 4, criticalMin: 15 }
      ];
      this.hasChanges = true;
      this.saved = false;
      this.error = false;
      this.snackBar.open('Ratios réinitialisés, enregistrez pour appliquer', 'Fermer', { duration: 3000 });
    }
  }

  // ============================================
  // MÉTHODES UTILITAIRES POUR L'AFFICHAGE
  // ============================================

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'FAIBLE': 'good',
      'ACCEPTABLE': 'good',
      'BON': 'good',
      'BONNE': 'good',
      'TRES_BONNE': 'good',
      'TRES_BON': 'good',
      'SUFFISANT': 'good',
      'EXCELLENT': 'good',
      'GOOD': 'good',
      'FAIBLE_RISQUE': 'good',
      'MOYEN': 'warning',
      'MOYENNE': 'warning',
      'MODERE': 'warning',
      'FAIR': 'warning',
      'ELEVE': 'danger',
      'CRITIQUE': 'danger',
      'INSUFFISANT': 'danger',
      'TRES_ELEVE': 'danger',
      'RISQUE': 'danger'
    };
    return classes[status] || 'info';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'FAIBLE': 'check_circle',
      'ACCEPTABLE': 'check_circle',
      'BON': 'check_circle',
      'BONNE': 'check_circle',
      'TRES_BONNE': 'check_circle',
      'TRES_BON': 'check_circle',
      'SUFFISANT': 'check_circle',
      'EXCELLENT': 'check_circle',
      'GOOD': 'check_circle',
      'FAIBLE_RISQUE': 'check_circle',
      'MOYEN': 'warning',
      'MOYENNE': 'warning',
      'MODERE': 'warning',
      'FAIR': 'warning',
      'ELEVE': 'error',
      'CRITIQUE': 'error',
      'INSUFFISANT': 'error',
      'TRES_ELEVE': 'error',
      'RISQUE': 'error'
    };
    return icons[status] || 'info';
  }

  getRiskLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'VERY_LOW': '#4caf50',
      'LOW': '#8bc34a',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336',
      'VERY_HIGH': '#d32f2f'
    };
    return colors[level] || '#9e9e9e';
  }
}
// features/financial-analysis/financial-analyzer/financial-analyzer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { FinancialAnalysisService } from '@core/services/financial-analysis.service';
import { ClientService } from '@core/services/client.service';
import { CreditRequestService } from '@core/services/credit-request.service';
import { AuthService } from '@core/services/auth.service';

// Models
import { FinancialAnalysisRequest, FinancialAnalysisResponse } from '@core/models/financial-analysis.model';

// Pipes
import { TndCurrencyPipe } from '@shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-financial-analyzer',
  standalone: true,
  templateUrl: './financial-analyzer.component.html',
  styleUrls: ['./financial-analyzer.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatChipsModule,
    TndCurrencyPipe
  ]
})
export class FinancialAnalyzerComponent implements OnInit {
  analysisForm: FormGroup;
  analysisResult: FinancialAnalysisResponse | null = null;
  isLoading = false;
  isAnalyzing = false;
  clients: any[] = [];
  creditRequests: any[] = [];
  analystId: string = '';
  clientIdFromRoute: string | null = null;

  constructor(
    private fb: FormBuilder,
    private analysisService: FinancialAnalysisService,
    private clientService: ClientService,
    private creditRequestService: CreditRequestService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.analysisForm = this.createForm();
  }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.analystId = userInfo?.id || '';
    
    // Récupérer le clientId de l'URL si présent
    this.clientIdFromRoute = this.route.snapshot.paramMap.get('clientId');
    
    this.loadClients();
    
    if (this.clientIdFromRoute) {
      this.analysisForm.patchValue({ clientId: this.clientIdFromRoute });
      this.onClientChange();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      clientId: ['', Validators.required],
      creditRequestId: [''],
      monthlyNetIncome: ['', [Validators.required, Validators.min(0)]],
      otherMonthlyIncome: [0, [Validators.min(0)]],
      monthlyCharges: ['', [Validators.required, Validators.min(0)]],
      existingCreditPayments: ['', [Validators.required, Validators.min(0)]],
      creditAmount: ['', [Validators.required, Validators.min(0)]],
      durationMonths: ['', [Validators.required, Validators.min(1)]],
      annualInterestRate: ['', [Validators.required, Validators.min(0)]],
      collateralValue: [null, [Validators.min(0)]],
      totalAssets: [null],
      totalLiabilities: [null],
      currentAssets: [null],
      currentLiabilities: [null],
      ebit: [null],
      financialCharges: [null],
      availableCashFlow: [null],
      annualDebtService: [null]
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 5000 });
      }
    });
  }

  onClientChange(): void {
    const clientId = this.analysisForm.get('clientId')?.value;
    if (clientId) {
      this.creditRequestService.getCreditRequestsByClient(clientId).subscribe({
        next: (data) => {
          this.creditRequests = data;
          // Si une demande est disponible, la sélectionner automatiquement
          if (data && data.length > 0) {
            this.analysisForm.patchValue({ creditRequestId: data[0].id });
            this.loadClientData(clientId);
          }
        },
        error: () => {
          this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  // ✅ CORRECTION: Supprimer les lignes avec monthlyCharges
  loadClientData(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        // Charger les données du client si disponibles
        if (client.monthlyIncome) {
          this.analysisForm.patchValue({ monthlyNetIncome: client.monthlyIncome });
        }
        // ❌ SUPPRIMER CES LIGNES - monthlyCharges n'existe pas sur ClientResponseDTO
        // if (client.monthlyCharges) {
        //   this.analysisForm.patchValue({ monthlyCharges: client.monthlyCharges });
        // }
      },
      error: () => {
        // Ignorer l'erreur, les champs restent vides
      }
    });
  }

  onCreditRequestSelect(): void {
    const creditRequestId = this.analysisForm.get('creditRequestId')?.value;
    if (creditRequestId) {
      this.creditRequestService.getCreditRequestById(creditRequestId).subscribe({
        next: (request) => {
          if (request) {
            this.analysisForm.patchValue({
              creditAmount: request.amount,
              durationMonths: request.durationMonths,
              annualInterestRate: request.interestRate
            });
          }
        },
        error: () => {
          // Ignorer l'erreur
        }
      });
    }
  }

  onSubmit(): void {
    if (this.analysisForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    this.isAnalyzing = true;
    const formValue = this.analysisForm.value;
    const request: FinancialAnalysisRequest = {
      clientId: formValue.clientId,
      creditRequestId: formValue.creditRequestId || undefined,
      analystId: this.analystId,
      monthlyNetIncome: formValue.monthlyNetIncome,
      otherMonthlyIncome: formValue.otherMonthlyIncome || 0,
      monthlyCharges: formValue.monthlyCharges,
      existingCreditPayments: formValue.existingCreditPayments,
      creditAmount: formValue.creditAmount,
      durationMonths: formValue.durationMonths,
      annualInterestRate: formValue.annualInterestRate,
      collateralValue: formValue.collateralValue || undefined,
      totalAssets: formValue.totalAssets || undefined,
      totalLiabilities: formValue.totalLiabilities || undefined,
      currentAssets: formValue.currentAssets || undefined,
      currentLiabilities: formValue.currentLiabilities || undefined,
      ebit: formValue.ebit || undefined,
      financialCharges: formValue.financialCharges || undefined,
      availableCashFlow: formValue.availableCashFlow || undefined,
      annualDebtService: formValue.annualDebtService || undefined
    };

    this.analysisService.analyzeFinancialSituation(request).subscribe({
      next: (response) => {
        this.analysisResult = response;
        this.isAnalyzing = false;
        this.snackBar.open('Analyse financière réalisée avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.isAnalyzing = false;
        this.snackBar.open('Erreur lors de l\'analyse financière', 'Fermer', { duration: 5000 });
        console.error('Analysis error:', error);
      }
    });
  }

  resetForm(): void {
    this.analysisForm.reset();
    this.analysisResult = null;
    this.analysisForm.patchValue({
      otherMonthlyIncome: 0,
      collateralValue: null
    });
    if (this.clientIdFromRoute) {
      this.analysisForm.patchValue({ clientId: this.clientIdFromRoute });
    }
  }

  // ============================================
  // MÉTHODES D'AFFICHAGE
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
      'FAIBLE_RISQUE': 'good',
      'EXCELLENT': 'good',
      'GOOD': 'good',
      'MOYEN': 'warning',
      'MOYENNE': 'warning',
      'MODERE': 'warning',
      'FAIR': 'warning',
      'ELEVE': 'danger',
      'CRITIQUE': 'danger',
      'INSUFFISANT': 'danger',
      'TRES_ELEVE': 'danger',
      'RISQUE': 'danger',
      'POOR': 'danger',
      'VERY_POOR': 'danger'
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
      'FAIBLE_RISQUE': 'check_circle',
      'EXCELLENT': 'check_circle',
      'GOOD': 'check_circle',
      'MOYEN': 'warning',
      'MOYENNE': 'warning',
      'MODERE': 'warning',
      'FAIR': 'warning',
      'ELEVE': 'error',
      'CRITIQUE': 'error',
      'INSUFFISANT': 'error',
      'TRES_ELEVE': 'error',
      'RISQUE': 'error',
      'POOR': 'error',
      'VERY_POOR': 'error'
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

  getRiskLevelText(level: string): string {
    const texts: { [key: string]: string } = {
      'VERY_LOW': 'Très faible',
      'LOW': 'Faible',
      'MEDIUM': 'Moyen',
      'HIGH': 'Élevé',
      'VERY_HIGH': 'Très élevé'
    };
    return texts[level] || level;
  }

  getFinancialHealthText(score: string): string {
    const texts: { [key: string]: string } = {
      'EXCELLENT': 'Excellent',
      'GOOD': 'Bon',
      'FAIR': 'Moyen',
      'POOR': 'Faible',
      'VERY_POOR': 'Très faible'
    };
    return texts[score] || score;
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'PENDING': 'En attente',
      'COMPLETED': 'Complété',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté'
    };
    return texts[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': '#ff9800',
      'COMPLETED': '#2196f3',
      'APPROVED': '#4caf50',
      'REJECTED': '#f44336'
    };
    return colors[status] || '#9e9e9e';
  }

  goBack(): void {
    this.router.navigate(['/financial-analysis/calculate']);
  }

  approveAnalysis(): void {
    if (!this.analysisResult) return;
    
    this.isLoading = true;
    this.analysisService.approveAnalysis(this.analysisResult.id, this.analystId).subscribe({
      next: (response) => {
        this.analysisResult = response;
        this.isLoading = false;
        this.snackBar.open('Analyse approuvée avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors de l\'approbation', 'Fermer', { duration: 5000 });
      }
    });
  }

  rejectAnalysis(): void {
    if (!this.analysisResult) return;
    
    const reason = prompt('Motif du rejet:');
    if (reason !== null) {
      this.isLoading = true;
      this.analysisService.rejectAnalysis(this.analysisResult.id, this.analystId, reason).subscribe({
        next: (response) => {
          this.analysisResult = response;
          this.isLoading = false;
          this.snackBar.open('Analyse rejetée', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Erreur lors du rejet', 'Fermer', { duration: 5000 });
        }
      });
    }
  }
}
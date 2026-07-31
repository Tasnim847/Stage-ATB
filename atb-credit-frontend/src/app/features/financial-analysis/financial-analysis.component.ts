// analyst-financial-analysis.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Modules
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

// Services
import { FinancialAnalysisService } from '@core/services/financial-analysis.service';
import { ClientService } from '@core/services/client.service';
import { CreditRequestService } from '@core/services/credit-request.service';
import { AuthService } from '@core/services/auth.service';

// Models
import { FinancialAnalysisResponse } from '@core/models/financial-analysis.model';

// Material Snackbar
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJS
import { finalize, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// ✅ Importer le pipe TND
import { TndCurrencyPipe } from '@shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-financial-analysis',
  standalone: true,
  templateUrl: './financial-analysis.component.html',
  styleUrls: ['./financial-analysis.component.css'],
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
    TndCurrencyPipe // ✅ Ajouter le pipe
  ]
})
export class FinancialAnalysisComponent implements OnInit {
  analysisForm: FormGroup;
  analysisResult: FinancialAnalysisResponse | null = null;
  isLoading = false;
  clients: any[] = [];
  creditRequests: any[] = [];
  analystId: string = '';

  constructor(
    private fb: FormBuilder,
    private analysisService: FinancialAnalysisService,
    private clientService: ClientService,
    private creditRequestService: CreditRequestService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.analysisForm = this.createForm();
  }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    this.analystId = userInfo?.id || '';
    console.log('Analyst ID:', this.analystId);
    this.loadClients();
  }

  createForm(): FormGroup {
    return this.fb.group({
      clientId: ['', Validators.required],
      creditRequestId: [''],
      monthlyNetIncome: ['', [Validators.required, Validators.min(0)]],
      otherMonthlyIncome: ['', [Validators.min(0)]],
      monthlyCharges: ['', [Validators.required, Validators.min(0)]],
      existingCreditPayments: ['', [Validators.required, Validators.min(0)]],
      creditAmount: ['', [Validators.required, Validators.min(0)]],
      durationMonths: ['', [Validators.required, Validators.min(1)]],
      annualInterestRate: ['', [Validators.required, Validators.min(0)]],
      collateralValue: ['', [Validators.min(0)]],
      totalAssets: [''],
      totalLiabilities: [''],
      currentAssets: [''],
      currentLiabilities: [''],
      ebit: [''],
      financialCharges: [''],
      availableCashFlow: [''],
      annualDebtService: [''],
      totalFinancialDebts: [''],
      shareholdersEquity: ['']
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        console.log('Clients loaded:', data.length);
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.snackBar.open('Erreur lors du chargement des clients: ' + err.message, 'Fermer', { duration: 5000 });
      }
    });
  }

  onClientChange(): void {
    const clientId = this.analysisForm.get('clientId')?.value;
    if (clientId) {
      this.creditRequestService.getCreditRequestsByClient(clientId).subscribe({
        next: (data) => {
          this.creditRequests = data;
          console.log('Credit requests loaded:', data.length);
        },
        error: (err) => {
          console.error('Error loading credit requests:', err);
          this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.analysisForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const formValue = this.analysisForm.value;
    const request = {
      ...formValue,
      analystId: this.analystId,
      otherMonthlyIncome: formValue.otherMonthlyIncome || 0,
      collateralValue: formValue.collateralValue || null,
      totalAssets: formValue.totalAssets || null,
      totalLiabilities: formValue.totalLiabilities || null,
      currentAssets: formValue.currentAssets || null,
      currentLiabilities: formValue.currentLiabilities || null,
      ebit: formValue.ebit || null,
      financialCharges: formValue.financialCharges || null,
      availableCashFlow: formValue.availableCashFlow || null,
      annualDebtService: formValue.annualDebtService || null,
      totalFinancialDebts: formValue.totalFinancialDebts || null,
      shareholdersEquity: formValue.shareholdersEquity || null
    };

    console.log('Sending request:', request);

    this.analysisService.calculateAnalysis(request)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError((error) => {
          console.error('Analysis error:', error);
          this.snackBar.open('Erreur lors du calcul: ' + (error.error?.message || error.message), 'Fermer', { duration: 5000 });
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Analysis response:', response);
          this.analysisResult = response;
          this.snackBar.open('Analyse financière calculée avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          // L'erreur est déjà gérée par catchError
        }
      });
  }

  approveAnalysis(): void {
    if (!this.analysisResult) return;
    
    this.isLoading = true;
    this.analysisService.approveAnalysis(this.analysisResult.id, this.analystId)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError((error) => {
          console.error('Approve error:', error);
          this.snackBar.open('Erreur lors de l\'approbation: ' + (error.error?.message || error.message), 'Fermer', { duration: 5000 });
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          this.analysisResult = response;
          this.snackBar.open('Analyse approuvée avec succès', 'Fermer', { duration: 3000 });
        }
      });
  }

  rejectAnalysis(): void {
    if (!this.analysisResult) return;
    
    const reason = prompt('Motif du rejet:');
    if (reason !== null) {
      this.isLoading = true;
      this.analysisService.rejectAnalysis(this.analysisResult.id, this.analystId, reason)
        .pipe(
          finalize(() => this.isLoading = false),
          catchError((error) => {
            console.error('Reject error:', error);
            this.snackBar.open('Erreur lors du rejet: ' + (error.error?.message || error.message), 'Fermer', { duration: 5000 });
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            this.analysisResult = response;
            this.snackBar.open('Analyse rejetée', 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  resetForm(): void {
    this.analysisForm.reset();
    this.analysisResult = null;
    this.analysisForm.patchValue({
      otherMonthlyIncome: 0,
      collateralValue: null
    });
  }

  // ===== MÉTHODES DE TRADUCTION AVEC GESTION DES UNDEFINED =====
  
  getRiskLevelColor(level: string | undefined): string {
    if (!level) return '#9e9e9e';
    const colors: { [key: string]: string } = {
      'VERY_LOW': '#4caf50',
      'LOW': '#8bc34a',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336',
      'VERY_HIGH': '#d32f2f'
    };
    return colors[level] || '#9e9e9e';
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return '#9e9e9e';
    const colors: { [key: string]: string } = {
      'PENDING': '#ff9800',
      'COMPLETED': '#2196f3',
      'APPROVED': '#4caf50',
      'REJECTED': '#f44336'
    };
    return colors[status] || '#9e9e9e';
  }

  getRiskLevelText(level: string | undefined): string {
    if (!level) return 'Non défini';
    const texts: { [key: string]: string } = {
      'VERY_LOW': 'Très faible',
      'LOW': 'Faible',
      'MEDIUM': 'Moyen',
      'HIGH': 'Élevé',
      'VERY_HIGH': 'Très élevé'
    };
    return texts[level] || level;
  }

  getStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'PENDING': 'En attente',
      'COMPLETED': 'Complété',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté'
    };
    return texts[status] || status;
  }

  getDebtRatioStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'FAIBLE': 'Faible',
      'ACCEPTABLE': 'Acceptable',
      'ELEVE': 'Élevé',
      'CRITIQUE': 'Critique'
    };
    return texts[status] || status;
  }

  getRepaymentCapacityStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'TRES_BONNE': 'Très bonne',
      'BONNE': 'Bonne',
      'MOYENNE': 'Moyenne',
      'FAIBLE': 'Faible'
    };
    return texts[status] || status;
  }

  getResidualIncomeStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'SUFFISANT': 'Suffisant',
      'ACCEPTABLE': 'Acceptable',
      'INSUFFISANT': 'Insuffisant'
    };
    return texts[status] || status;
  }

  getPaymentRatioStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'BON': 'Bon',
      'MOYEN': 'Moyen',
      'ELEVE': 'Élevé'
    };
    return texts[status] || status;
  }

  getLtiStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'BON': 'Bon',
      'ACCEPTABLE': 'Acceptable',
      'ELEVE': 'Élevé'
    };
    return texts[status] || status;
  }

  getLtvStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'FAIBLE_RISQUE': 'Risque faible',
      'MODERE': 'Modéré',
      'ELEVE': 'Élevé',
      'TRES_ELEVE': 'Très élevé'
    };
    return texts[status] || status;
  }

  getCurrentRatioStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'BONNE': 'Bonne',
      'ACCEPTABLE': 'Acceptable',
      'RISQUE': 'Risque'
    };
    return texts[status] || status;
  }

  getSolvencyRatioStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'BONNE': 'Bonne',
      'ACCEPTABLE': 'Acceptable',
      'FAIBLE': 'Faible'
    };
    return texts[status] || status;
  }

  getDscrStatusText(status: string | undefined): string {
    if (!status) return 'Non défini';
    const texts: { [key: string]: string } = {
      'TRES_BON': 'Très bon',
      'ACCEPTABLE': 'Acceptable',
      'FRAGILE': 'Fragile',
      'INSUFFISANT': 'Insuffisant'
    };
    return texts[status] || status;
  }
}
// components/ratio-calculator/ratio-calculator.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

// Services
import { FinancialAnalysisService } from '@core/services/financial-analysis.service';
import { ClientService } from '@core/services/client.service';
import { CreditRequestService } from '@core/services/credit-request.service';

// Models
import { RatioCalculationRequest, RatioCalculationResponse } from '@core/models/financial-analysis.model';

// Pipes
import { TndCurrencyPipe } from '@shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-ratio-calculator',
  standalone: true,
  templateUrl: './ratio-calculator.component.html',
  styleUrls: ['./ratio-calculator.component.css'],
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
    TndCurrencyPipe
  ]
})
export class RatioCalculatorComponent implements OnInit {
  ratioForm: FormGroup;
  ratioResult: RatioCalculationResponse | null = null;
  isLoading = false;
  clients: any[] = [];
  creditRequests: any[] = [];

  constructor(
    private fb: FormBuilder,
    private analysisService: FinancialAnalysisService,
    private clientService: ClientService,
    private creditRequestService: CreditRequestService,
    private snackBar: MatSnackBar
  ) {
    this.ratioForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();
  }

  createForm(): FormGroup {
    return this.fb.group({
      clientId: ['', Validators.required],
      creditRequestId: [''],
      monthlyNetIncome: ['', [Validators.required, Validators.min(0)]],
      otherMonthlyIncome: [0, [Validators.min(0)]],
      monthlyCharges: ['', [Validators.required, Validators.min(0)]],
      existingCreditPayments: ['', [Validators.required, Validators.min(0)]],
      creditAmount: ['', [Validators.required, Validators.min(100)]],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(360)]],
      annualInterestRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      collateralValue: [null, [Validators.min(0)]],
      // Professionnel
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
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 5000 });
      }
    });
  }

  onClientChange(): void {
    const clientId = this.ratioForm.get('clientId')?.value;
    if (clientId) {
      this.creditRequestService.getCreditRequestsByClient(clientId).subscribe({
        next: (data) => {
          this.creditRequests = data || [];
          if (data && data.length > 0) {
            this.ratioForm.patchValue({ creditRequestId: data[0].id });
          }
        },
        error: () => {
          this.creditRequests = [];
          this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.creditRequests = [];
      this.ratioForm.patchValue({ creditRequestId: '' });
    }
  }

  onCreditRequestSelect(): void {
    const creditRequestId = this.ratioForm.get('creditRequestId')?.value;
    if (creditRequestId) {
      this.creditRequestService.getCreditRequestById(creditRequestId).subscribe({
        next: (request) => {
          if (request) {
            this.ratioForm.patchValue({
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
    if (this.ratioForm.invalid) {
      // ✅ CORRECTION: Ajouter le type explicitement
      const errors: string[] = [];
      Object.keys(this.ratioForm.controls).forEach(key => {
        const control = this.ratioForm.get(key);
        if (control?.invalid && key !== 'creditRequestId' && key !== 'collateralValue') {
          errors.push(key);
        }
      });
      
      this.snackBar.open(
        `Veuillez remplir tous les champs obligatoires: ${errors.join(', ')}`, 
        'Fermer', 
        { duration: 5000 }
      );
      return;
    }

    this.isLoading = true;
    const formValue = this.ratioForm.value;
    const request: RatioCalculationRequest = {
      clientId: formValue.clientId,
      creditRequestId: formValue.creditRequestId || undefined,
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

    this.analysisService.calculateRatios(request).subscribe({
      next: (response) => {
        this.ratioResult = response;
        this.isLoading = false;
        this.snackBar.open('Ratios calculés avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du calcul des ratios', 'Fermer', { duration: 5000 });
        console.error('Calculation error:', error);
      }
    });
  }

  resetForm(): void {
    this.ratioForm.reset();
    this.ratioResult = null;
    this.ratioForm.patchValue({
      otherMonthlyIncome: 0,
      collateralValue: null
    });
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
      'MOYEN': 'warning',
      'MOYENNE': 'warning',
      'MODERE': 'warning',
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
      'FAIBLE_RISQUE': 'check_circle',
      'MOYEN': 'warning',
      'MOYENNE': 'warning',
      'MODERE': 'warning',
      'ELEVE': 'error',
      'CRITIQUE': 'error',
      'INSUFFISANT': 'error',
      'TRES_ELEVE': 'error',
      'RISQUE': 'error'
    };
    return icons[status] || 'info';
  }
}
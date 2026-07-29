import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { CreditRequestService } from '@core/services/credit-request.service';
import { AuthService } from '@core/services/auth.service';
import { ClientService } from '@core/services/client.service';
import { ParametrageService, CreditType } from '@core/services/parametrage.service';
import { CreditRequestDTO } from '@core/models';

interface CreditCategory {
  id: 'NEW' | 'REFINANCE';
  label: string;
  icon: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-add-credit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './add-credit.component.html',
  styleUrls: ['./add-credit.component.css']
})
export class AddCreditComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private fb = inject(FormBuilder);
  private creditService = inject(CreditRequestService);
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private parametrageService = inject(ParametrageService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // ✅ Catégories de crédit
  categories: CreditCategory[] = [
    {
      id: 'NEW',
      label: 'Nouveau crédit',
      icon: 'add_circle',
      description: 'Obtenez un nouveau crédit pour votre projet (immobilier, véhicule, etc.)',
      color: '#1a237e'
    },
    {
      id: 'REFINANCE',
      label: 'Rachat de crédit',
      icon: 'sync_alt',
      description: 'Regroupez et rachetez vos crédits en cours pour une meilleure gestion',
      color: '#c62828'
    }
  ];

  // ✅ Types de crédit par catégorie
  creditTypes: CreditType[] = [];
  filteredCreditTypes: CreditType[] = [];
  selectedCreditType: CreditType | null = null;
  availableDurations: number[] = [];

  // Sélection
  selectedCategory: 'NEW' | 'REFINANCE' | null = null;
  selectedCategoryLabel: string = '';

  // Forms
  categoryForm!: FormGroup;
  creditTypeForm!: FormGroup;
  personalForm!: FormGroup;
  professionalForm!: FormGroup;
  financialForm!: FormGroup;

  isLoading = false;
  isSubmitting = false;
  currentUser: any = null;
  clientId: string | null = null;
  showSpouse = false;

  // Taux d'intérêt
  calculatedInterestRate: number = 0;
  riskLevel: string = '';
  rateAdjustments: string[] = [];

  // Options
  loanPurposes = [
    'Achat immobilier',
    'Achat véhicule',
    'Travaux rénovation',
    'Création d\'entreprise',
    'Études',
    'Consommation',
    'Autre'
  ];

  collateralTypes = [
    'Bien immobilier',
    'Véhicule',
    'Épargne',
    'Garantie personnelle',
    'Aucune'
  ];

  professionalCategories = [
    'Salarié',
    'Cadre',
    'Fonctionnaire',
    'Profession libérale',
    'Commerçant',
    'Artisan',
    'Agriculteur',
    'Retraité',
    'Sans emploi',
    'Étudiant',
    'Autre'
  ];

  businessSectors = [
    'Banque / Finance',
    'Assurance',
    'Technologie / Informatique',
    'Santé / Médical',
    'Éducation / Formation',
    'BTP / Construction',
    'Industrie',
    'Commerce / Distribution',
    'Transport / Logistique',
    'Tourisme / Hôtellerie',
    'Agriculture',
    'Télécommunications',
    'Médias / Communication',
    'Autre'
  ];

  // ✅ ICÔNES PAR CATÉGORIE DE CRÉDIT
  creditTypeIcons: Record<string, string> = {
    'PERSONAL': 'person',
    'AUTO': 'directions_car',
    'MORTGAGE': 'home',
    'BUSINESS': 'business',
    'STUDENT': 'school',
    'CONSUMER': 'shopping_cart',
    'BRIDGE': 'swap_horiz',
    'REVOLVING': 'autorenew'
  };

  creditTypeColors: Record<string, string> = {
    'PERSONAL': '#1976d2',
    'AUTO': '#2e7d32',
    'MORTGAGE': '#e65100',
    'BUSINESS': '#c62828',
    'STUDENT': '#6a1b9a',
    'CONSUMER': '#bf360c',
    'BRIDGE': '#00695c',
    'REVOLVING': '#f57f17'
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getUserInfo();
    this.loadClientInfo();
    this.loadCreditTypes();
    this.initForms();
  }

  loadCreditTypes(): void {
    this.isLoading = true;
    this.parametrageService.getActiveCreditTypes().subscribe({
      next: (types) => {
        this.creditTypes = types;
        this.filterCreditTypes();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement types de crédit:', error);
        this.toastr.error('Impossible de charger les types de crédit', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  filterCreditTypes(): void {
    if (!this.selectedCategory) {
      this.filteredCreditTypes = [];
      return;
    }
    // Pour l'instant, on affiche tous les types
    // On pourrait filtrer selon la catégorie plus tard
    this.filteredCreditTypes = this.creditTypes;
  }

  loadCreditTypeParams(creditTypeId: string): void {
    this.isLoading = true;
    this.parametrageService.getCreditTypeById(creditTypeId).subscribe({
      next: (type) => {
        this.selectedCreditType = type;
        this.parametrageService.getDurationConfigsByCreditType(creditTypeId).subscribe({
          next: (durations) => {
            this.availableDurations = durations.map(d => d.durationMonths);
            this.isLoading = false;
            this.updateFinancialValidations(type);
            this.calculateInterestRate();
          },
          error: (error) => {
            console.error('Erreur chargement durées:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur chargement type:', error);
        this.toastr.error('Impossible de charger les paramètres du crédit', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  initForms(): void {
    // ✅ Formulaire de catégorie
    this.categoryForm = this.fb.group({
      category: ['', Validators.required]
    });

    // ✅ Formulaire de type de crédit
    this.creditTypeForm = this.fb.group({
      creditType: ['', Validators.required]
    });

    this.personalForm = this.fb.group({
      title: ['M'],
      fullName: ['', Validators.required],
      birthDate: [''],
      birthPlace: [''],
      nationality: [''],
      idType: [''],
      idNumber: [''],
      idExpiryDate: [''],
      maritalStatus: [''],
      dependents: [0],
      phone: [''],
      email: ['', [Validators.email]],
      spouseName: [''],
      spousePhone: [''],
      spouseProfession: [''],
      spouseIncome: ['']
    });

    this.professionalForm = this.fb.group({
      address: [''],
      city: [''],
      postalCode: [''],
      country: [''],
      addressSince: [''],
      profession: [''],
      employer: [''],
      professionalCategory: ['', Validators.required],
      businessSector: ['', Validators.required],
      yearsOfExperience: [''],
      employmentContract: ['CDI']
    });

    this.financialForm = this.fb.group({
      creditTypeId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(100)]],
      currency: ['TND', Validators.required],
      durationMonths: ['', [Validators.required, Validators.min(1)]],
      interestRate: [{ value: 0, disabled: true }],
      loanPurpose: ['', Validators.required],
      collateralType: [''],
      collateralValue: [''],
      expectedDisbursementDate: [''],
      monthlySalary: ['', [Validators.required, Validators.min(0)]],
      otherMonthlyIncome: [0],
      hasOtherCredits: [false],
      otherCreditsAmount: [0],
      monthlyExpenses: [0],
      rentAmount: [0],
      refinanceAmount: [0],
      refinanceBankName: [''],
      refinanceContractNumber: [''],
      submitImmediately: [true, Validators.required]
    });

    // ✅ Écouter les changements de catégorie
    this.categoryForm.get('category')?.valueChanges.subscribe((categoryId) => {
      if (categoryId) {
        this.selectedCategory = categoryId;
        const category = this.categories.find(c => c.id === categoryId);
        this.selectedCategoryLabel = category ? category.label : '';
        this.filterCreditTypes();
        // Réinitialiser la sélection de type
        this.creditTypeForm.patchValue({ creditType: '' });
        this.selectedCreditType = null;
        this.financialForm.patchValue({ creditTypeId: '' });
      }
    });

    // ✅ Écouter les changements de type de crédit
    this.creditTypeForm.get('creditType')?.valueChanges.subscribe((creditTypeId) => {
      if (creditTypeId) {
        this.financialForm.patchValue({ creditTypeId: creditTypeId }, { emitEvent: false });
        this.loadCreditTypeParams(creditTypeId);
      }
    });

    this.financialForm.get('creditTypeId')?.valueChanges.subscribe((creditTypeId) => {
      if (creditTypeId) {
        this.creditTypeForm.patchValue({ creditType: creditTypeId }, { emitEvent: false });
        this.loadCreditTypeParams(creditTypeId);
      }
    });

    this.financialForm.valueChanges.subscribe(() => {
      this.calculateInterestRate();
    });
  }

  updateFinancialValidations(creditType: CreditType): void {
    const amountControl = this.financialForm.get('amount');
    const durationControl = this.financialForm.get('durationMonths');

    if (creditType) {
      amountControl?.setValidators([
        Validators.required,
        Validators.min(creditType.minAmount),
        Validators.max(creditType.maxAmount)
      ]);
      
      durationControl?.setValidators([
        Validators.required,
        Validators.min(creditType.minDurationMonths),
        Validators.max(creditType.maxDurationMonths)
      ]);
    }

    amountControl?.updateValueAndValidity();
    durationControl?.updateValueAndValidity();
  }

  getCreditTypeIcon(creditType: CreditType): string {
    return this.creditTypeIcons[creditType.category] || 'credit_card';
  }

  getCreditTypeColor(creditType: CreditType): string {
    return this.creditTypeColors[creditType.category] || '#1a237e';
  }

  getCreditTypeName(id: string): string {
    const type = this.creditTypes.find(t => t.id === id);
    return type ? type.name : 'Non défini';
  }

  getCategoryLabel(): string {
    const category = this.categories.find(c => c.id === this.selectedCategory);
    return category ? category.label : 'Non défini';
  }

  selectCategory(categoryId: 'NEW' | 'REFINANCE'): void {
    this.categoryForm.get('category')?.setValue(categoryId);
  }

  selectCreditType(creditTypeId: string): void {
    this.creditTypeForm.get('creditType')?.setValue(creditTypeId);
  }

  calculateInterestRate(): void {
    if (!this.selectedCreditType) {
      this.calculatedInterestRate = 0;
      return;
    }

    const loanPurpose = this.financialForm.get('loanPurpose')?.value;
    const monthlySalary = this.financialForm.get('monthlySalary')?.value || 0;
    const durationMonths = this.financialForm.get('durationMonths')?.value || 0;
    const hasOtherCredits = this.financialForm.get('hasOtherCredits')?.value || false;
    const otherCreditsAmount = this.financialForm.get('otherCreditsAmount')?.value || 0;
    const professionalCategory = this.professionalForm.get('professionalCategory')?.value;
    const employmentContract = this.professionalForm.get('employmentContract')?.value;
    const yearsOfExperience = this.professionalForm.get('yearsOfExperience')?.value || 0;

    let baseRate = this.selectedCreditType.baseInterestRate;
    let adjustments: string[] = [];
    let totalAdjustment = 0;

    const score = this.estimateSolvencyScore();
    
    if (score >= 90) {
      totalAdjustment -= 0.50;
      adjustments.push('✅ Excellent score (-0.50%)');
    } else if (score >= 80) {
      totalAdjustment -= 0.25;
      adjustments.push('✅ Bon score (-0.25%)');
    }

    if (monthlySalary >= 5000) {
      totalAdjustment -= 0.15;
      adjustments.push('✅ Salaire élevé (-0.15%)');
    } else if (monthlySalary < 1500) {
      totalAdjustment += 0.30;
      adjustments.push('⚠️ Salaire modeste (+0.30%)');
    }

    if (employmentContract === 'CDI' || employmentContract === 'Fonctionnaire') {
      totalAdjustment -= 0.20;
      adjustments.push('✅ Contrat stable (-0.20%)');
    } else if (employmentContract === 'CDD' || employmentContract === 'Intérim') {
      totalAdjustment += 0.50;
      adjustments.push('⚠️ Contrat précaire (+0.50%)');
    }

    if (yearsOfExperience >= 5) {
      totalAdjustment -= 0.20;
      adjustments.push('✅ Ancienneté > 5 ans (-0.20%)');
    }

    if (hasOtherCredits && otherCreditsAmount > 0) {
      if (otherCreditsAmount > 1000) {
        totalAdjustment += 0.50;
        adjustments.push('⚠️ Autres crédits importants (+0.50%)');
      } else {
        totalAdjustment += 0.25;
        adjustments.push('⚠️ Autres crédits (+0.25%)');
      }
    }

    if (durationMonths > 60) {
      totalAdjustment += 0.20;
      adjustments.push('⚠️ Longue durée > 60 mois (+0.20%)');
    }

    if (professionalCategory === 'Cadre' || professionalCategory === 'Fonctionnaire') {
      totalAdjustment -= 0.15;
      adjustments.push('✅ Cadre/Fonctionnaire (-0.15%)');
    } else if (professionalCategory === 'Sans emploi' || professionalCategory === 'Étudiant') {
      totalAdjustment += 0.80;
      adjustments.push('⚠️ Sans emploi/Étudiant (+0.80%)');
    }

    const debtRatio = this.calculateDebtRatio();
    if (debtRatio > 40) {
      totalAdjustment += 0.50;
      adjustments.push('⚠️ Taux d\'endettement > 40% (+0.50%)');
    }

    let finalRate = Math.round((baseRate + totalAdjustment) * 100) / 100;
    finalRate = Math.max(3.0, Math.min(15.0, finalRate));

    this.calculatedInterestRate = finalRate;
    this.rateAdjustments = adjustments;
    this.financialForm.get('interestRate')?.setValue(finalRate, { emitEvent: false });

    if (finalRate <= 5.5) this.riskLevel = 'Très faible';
    else if (finalRate <= 6.5) this.riskLevel = 'Faible';
    else if (finalRate <= 8.0) this.riskLevel = 'Moyen';
    else if (finalRate <= 10.0) this.riskLevel = 'Élevé';
    else this.riskLevel = 'Très élevé';
  }

  estimateSolvencyScore(): number {
    let score = 0;
    const monthlySalary = this.financialForm.get('monthlySalary')?.value || 0;
    const debtRatio = this.calculateDebtRatio();
    const contract = this.professionalForm.get('employmentContract')?.value;
    const yearsOfExperience = this.professionalForm.get('yearsOfExperience')?.value || 0;

    if (monthlySalary >= 5000) score += 20;
    else if (monthlySalary >= 3000) score += 15;
    else if (monthlySalary >= 2000) score += 10;
    else if (monthlySalary >= 1000) score += 5;

    if (contract === 'CDI' || contract === 'Fonctionnaire') score += 15;
    else if (contract === 'CDD') score += 8;
    else score += 3;

    if (yearsOfExperience >= 5) score += 10;
    else if (yearsOfExperience >= 2) score += 5;

    if (debtRatio < 35) score += 25;
    else if (debtRatio < 45) score += 15;
    else score += 5;

    if (!this.financialForm.get('hasOtherCredits')?.value) score += 15;

    const resteAVivre = monthlySalary - (this.financialForm.get('rentAmount')?.value || 0);
    if (resteAVivre > 2000) score += 10;
    else if (resteAVivre > 1000) score += 5;

    return Math.min(score, 100);
  }

  calculateMonthlyPaymentFromForms(): number {
    const amount = this.financialForm.get('amount')?.value || 0;
    const rate = this.calculatedInterestRate || 0;
    const months = this.financialForm.get('durationMonths')?.value || 1;
    
    if (amount <= 0 || rate < 0 || months <= 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return amount / months;
    
    const factor = Math.pow(1 + monthlyRate, months);
    return (amount * monthlyRate * factor) / (factor - 1);
  }

  calculateDebtRatio(): number {
    const salary = this.financialForm.get('monthlySalary')?.value || 0;
    const otherIncome = this.financialForm.get('otherMonthlyIncome')?.value || 0;
    const totalIncome = salary + otherIncome;
    
    if (totalIncome === 0) return 0;
    
    const monthlyPayment = this.calculateMonthlyPaymentFromForms();
    const otherCredits = this.financialForm.get('otherCreditsAmount')?.value || 0;
    const rent = this.financialForm.get('rentAmount')?.value || 0;
    const totalMonthlyPayments = monthlyPayment + otherCredits + rent;
    
    return Math.round((totalMonthlyPayments / totalIncome) * 100);
  }

  calculateBorrowingCapacity(): number {
    const salary = this.financialForm.get('monthlySalary')?.value || 0;
    const otherIncome = this.financialForm.get('otherMonthlyIncome')?.value || 0;
    const totalIncome = salary + otherIncome;
    return Math.round(totalIncome * 0.33);
  }

  loadClientInfo(): void {
    if (this.currentUser) {
      this.clientService.getCurrentClient().subscribe({
        next: (client) => {
          this.clientId = client.id;
          this.personalForm.patchValue({
            fullName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            email: this.currentUser.email,
            phone: this.currentUser.phoneNumber || ''
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement client:', error);
          this.toastr.error('Impossible de récupérer vos informations client', 'Erreur');
          this.isLoading = false;
        }
      });
    }
  }

  toggleSpouse(): void {
    this.showSpouse = !this.showSpouse;
    if (!this.showSpouse) {
      this.personalForm.patchValue({
        spouseName: '',
        spousePhone: '',
        spouseProfession: '',
        spouseIncome: ''
      });
    }
  }

  getCreditTypeLabel(): string {
    const type = this.creditTypes.find(t => t.id === this.creditTypeForm.get('creditType')?.value);
    return type ? type.name : 'Non défini';
  }

  isFormValid(): boolean {
    return this.categoryForm.valid && 
           this.creditTypeForm.valid && 
           this.personalForm.valid && 
           this.professionalForm.valid && 
           this.financialForm.valid;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toastr.error('Veuillez compléter tous les champs obligatoires', 'Formulaire invalide');
      return;
    }

    if (!this.clientId) {
      this.toastr.error('Impossible de créer la demande: client non identifié', 'Erreur');
      return;
    }

    if (!this.selectedCreditType) {
      this.toastr.error('Veuillez sélectionner un type de crédit', 'Erreur');
      return;
    }

    const debtRatio = this.calculateDebtRatio();
    if (debtRatio > 50) {
      this.toastr.warning(
        `Votre taux d'endettement est de ${debtRatio}%. Il est recommandé de ne pas dépasser 33%.`,
        'Attention'
      );
    }

    this.isSubmitting = true;

    const personal = this.personalForm.value;
    const financial = this.financialForm.value;
    const submitImmediately = financial.submitImmediately;

    const creditData: CreditRequestDTO = {
      clientId: this.clientId,
      userId: this.currentUser?.id || '',
      creditTypeId: this.selectedCreditType.id,
      amount: financial.amount,
      currency: financial.currency,
      durationMonths: financial.durationMonths,
      monthlyPayment: this.calculateMonthlyPaymentFromForms(),
      interestRate: this.calculatedInterestRate,
      loanPurpose: financial.loanPurpose,
      collateralType: financial.collateralType || '',
      collateralValue: financial.collateralValue || 0,
      guarantorName: this.showSpouse ? personal.spouseName : '',
      guarantorPhone: this.showSpouse ? personal.spousePhone : '',
      expectedDisbursementDate: financial.expectedDisbursementDate || '',
      submitImmediately: submitImmediately
    };

    this.creditService.createCreditRequest(creditData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        if (submitImmediately) {
          this.toastr.success(
            `✅ Votre demande de crédit N°${response.requestNumber} a été soumise avec succès`,
            'Demande soumise'
          );
          this.router.navigate(['/simulation-result', response.id]);
        } else {
          this.toastr.success(
            `📝 Votre demande de crédit N°${response.requestNumber} a été sauvegardée comme brouillon.`,
            'Brouillon enregistré'
          );
          this.router.navigate(['/my-credits']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error(
          error.error?.message || 'Erreur lors de la création de la demande',
          'Erreur'
        );
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-credits']);
  }

  get f() { return this.financialForm.controls; }
}
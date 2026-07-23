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
import { CreditRequestDTO } from '@core/models';

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
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // Type de crédit
  creditType: string = 'new';

  // Forms
  creditTypeForm!: FormGroup;
  personalForm!: FormGroup;
  professionalForm!: FormGroup;
  financialForm!: FormGroup;

  isLoading = false;
  isSubmitting = false;
  currentUser: any = null;
  clientId: string | null = null;
  showSpouse = false;

  // Taux d'intérêt calculé automatiquement
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

  creditTypes = [
    { 
      id: 'new', 
      label: 'Obtenir un nouveau crédit', 
      icon: 'add_circle',
      description: 'Vous envisagez de rénover votre maison, changer de voiture ou vous avez juste besoin d\'un petit montant pour faire face à un imprévu ?',
      color: '#1a237e'
    },
    { 
      id: 'refinance', 
      label: 'Rachat de crédit(s)', 
      icon: 'sync_alt',
      description: 'Que vous soyez client de Attijari bank ou d\'une autre banque, faites racheter vos encours crédit pour vous remettre à flot et financer un nouveau projet',
      color: '#be5543'
    }
  ];

  // Taux de base par type de crédit
  baseRates: Record<string, number> = {
    'Achat immobilier': 6.20,
    'Achat véhicule': 7.50,
    'Travaux rénovation': 7.80,
    'Création d\'entreprise': 8.50,
    'Études': 6.80,
    'Consommation': 9.00,
    'Autre': 7.00
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getUserInfo();
    this.loadClientInfo();
    this.initForms();
    
    // Écouter les changements pour recalculer le taux
    this.financialForm.valueChanges.subscribe(() => {
      this.calculateInterestRate();
    });
  }

  initForms(): void {
    this.creditTypeForm = this.fb.group({
      creditType: ['new', Validators.required]
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
      email: ['', [Validators.email]]
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
      rib: ['', [Validators.required, Validators.pattern('^[0-9]{20}$')]],
      bankName: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(100)]],
      currency: ['TND', Validators.required],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      loanPurpose: ['', Validators.required],
      interestRate: [{ value: 0, disabled: true }],
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
      // ✅ AJOUTER CE CHAMP
      submitImmediately: [true, Validators.required]
    });

    this.creditTypeForm.get('creditType')?.valueChanges.subscribe((type) => {
      this.creditType = type;
      this.updateFinancialValidations(type);
      this.calculateInterestRate();
    });
  }

  updateFinancialValidations(type: string): void {
    const refinanceAmount = this.financialForm.get('refinanceAmount');
    const refinanceBankName = this.financialForm.get('refinanceBankName');
    const refinanceContractNumber = this.financialForm.get('refinanceContractNumber');

    if (type === 'refinance') {
      refinanceAmount?.setValidators([Validators.required, Validators.min(100)]);
      refinanceBankName?.setValidators([Validators.required]);
      refinanceContractNumber?.setValidators([Validators.required]);
    } else {
      refinanceAmount?.clearValidators();
      refinanceBankName?.clearValidators();
      refinanceContractNumber?.clearValidators();
    }
    refinanceAmount?.updateValueAndValidity();
    refinanceBankName?.updateValueAndValidity();
    refinanceContractNumber?.updateValueAndValidity();
  }

  // ============================================
  // CALCUL AUTOMATIQUE DU TAUX D'INTÉRÊT
  // ============================================
  calculateInterestRate(): void {
    const loanPurpose = this.financialForm.get('loanPurpose')?.value;
    const monthlySalary = this.financialForm.get('monthlySalary')?.value || 0;
    const durationMonths = this.financialForm.get('durationMonths')?.value || 0;
    const hasOtherCredits = this.financialForm.get('hasOtherCredits')?.value || false;
    const otherCreditsAmount = this.financialForm.get('otherCreditsAmount')?.value || 0;
    const professionalCategory = this.professionalForm.get('professionalCategory')?.value;
    const employmentContract = this.professionalForm.get('employmentContract')?.value;
    const yearsOfExperience = this.professionalForm.get('yearsOfExperience')?.value || 0;

    // 1. Taux de base selon l'objectif du crédit
    let baseRate = this.baseRates[loanPurpose] || 7.0;
    
    // 2. Ajustements selon le profil
    let adjustments: string[] = [];
    let totalAdjustment = 0;

    // Facteur: Score de solvabilité (estimé)
    const score = this.estimateSolvencyScore();
    
    if (score >= 90) {
      totalAdjustment -= 0.50;
      adjustments.push('✅ Excellent score (-0.50%)');
    } else if (score >= 80) {
      totalAdjustment -= 0.25;
      adjustments.push('✅ Bon score (-0.25%)');
    }

    // Facteur: Salaire
    if (monthlySalary >= 5000) {
      totalAdjustment -= 0.15;
      adjustments.push('✅ Salaire élevé (-0.15%)');
    } else if (monthlySalary < 1500) {
      totalAdjustment += 0.30;
      adjustments.push('⚠️ Salaire modeste (+0.30%)');
    }

    // Facteur: Type de contrat
    if (employmentContract === 'CDI' || employmentContract === 'Fonctionnaire') {
      totalAdjustment -= 0.20;
      adjustments.push('✅ Contrat stable (-0.20%)');
    } else if (employmentContract === 'CDD' || employmentContract === 'Intérim') {
      totalAdjustment += 0.50;
      adjustments.push('⚠️ Contrat précaire (+0.50%)');
    } else if (employmentContract === 'Freelance') {
      totalAdjustment += 0.30;
      adjustments.push('⚠️ Freelance (+0.30%)');
    }

    // Facteur: Ancienneté
    if (yearsOfExperience >= 5) {
      totalAdjustment -= 0.20;
      adjustments.push('✅ Ancienneté > 5 ans (-0.20%)');
    } else if (yearsOfExperience >= 2) {
      totalAdjustment -= 0.10;
      adjustments.push('✅ Ancienneté > 2 ans (-0.10%)');
    }

    // Facteur: Autres crédits
    if (hasOtherCredits && otherCreditsAmount > 0) {
      if (otherCreditsAmount > 1000) {
        totalAdjustment += 0.50;
        adjustments.push('⚠️ Autres crédits importants (+0.50%)');
      } else {
        totalAdjustment += 0.25;
        adjustments.push('⚠️ Autres crédits (+0.25%)');
      }
    }

    // Facteur: Durée du crédit
    if (durationMonths > 60) {
      totalAdjustment += 0.20;
      adjustments.push('⚠️ Longue durée > 60 mois (+0.20%)');
    }

    // Facteur: Catégorie professionnelle
    if (professionalCategory === 'Cadre' || professionalCategory === 'Fonctionnaire') {
      totalAdjustment -= 0.15;
      adjustments.push('✅ Cadre/Fonctionnaire (-0.15%)');
    } else if (professionalCategory === 'Sans emploi' || professionalCategory === 'Étudiant') {
      totalAdjustment += 0.80;
      adjustments.push('⚠️ Sans emploi/Étudiant (+0.80%)');
    }

    // Facteur: Taux d'endettement estimé
    const debtRatio = this.calculateDebtRatio();
    if (debtRatio > 40) {
      totalAdjustment += 0.50;
      adjustments.push('⚠️ Taux d\'endettement > 40% (+0.50%)');
    }

    // 3. Calcul du taux final
    let finalRate = Math.round((baseRate + totalAdjustment) * 100) / 100;
    
    // Limiter le taux entre 3% et 15%
    finalRate = Math.max(3.0, Math.min(15.0, finalRate));

    this.calculatedInterestRate = finalRate;
    this.rateAdjustments = adjustments;

    // Mettre à jour le champ désactivé
    this.financialForm.get('interestRate')?.setValue(finalRate, { emitEvent: false });

    // Déterminer le niveau de risque
    if (finalRate <= 5.5) {
      this.riskLevel = 'Très faible';
    } else if (finalRate <= 6.5) {
      this.riskLevel = 'Faible';
    } else if (finalRate <= 8.0) {
      this.riskLevel = 'Moyen';
    } else if (finalRate <= 10.0) {
      this.riskLevel = 'Élevé';
    } else {
      this.riskLevel = 'Très élevé';
    }
  }

  estimateSolvencyScore(): number {
    let score = 0;
    const monthlySalary = this.financialForm.get('monthlySalary')?.value || 0;
    const debtRatio = this.calculateDebtRatio();
    const contract = this.professionalForm.get('employmentContract')?.value;
    const yearsOfExperience = this.professionalForm.get('yearsOfExperience')?.value || 0;

    // Revenus
    if (monthlySalary >= 5000) score += 20;
    else if (monthlySalary >= 3000) score += 15;
    else if (monthlySalary >= 2000) score += 10;
    else if (monthlySalary >= 1000) score += 5;

    // Contrat
    if (contract === 'CDI' || contract === 'Fonctionnaire') score += 15;
    else if (contract === 'CDD') score += 8;
    else score += 3;

    // Ancienneté
    if (yearsOfExperience >= 5) score += 10;
    else if (yearsOfExperience >= 2) score += 5;

    // Taux d'endettement
    if (debtRatio < 35) score += 25;
    else if (debtRatio < 45) score += 15;
    else score += 5;

    // Autres crédits
    if (!this.financialForm.get('hasOtherCredits')?.value) score += 15;

    // Reste à vivre estimé
    const resteAVivre = monthlySalary - (this.financialForm.get('rentAmount')?.value || 0);
    if (resteAVivre > 2000) score += 10;
    else if (resteAVivre > 1000) score += 5;

    return Math.min(score, 100);
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
    const type = this.creditTypes.find(t => t.id === this.creditType);
    return type ? type.label : 'Non défini';
  }

  selectCreditType(typeId: string): void {
    this.creditTypeForm.get('creditType')?.setValue(typeId);
  }

  isFormValid(): boolean {
    return this.creditTypeForm.valid && 
           this.personalForm.valid && 
           this.professionalForm.valid && 
           this.financialForm.valid;
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

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toastr.error('Veuillez compléter tous les champs obligatoires', 'Formulaire invalide');
      return;
    }

    if (!this.clientId) {
      this.toastr.error('Impossible de créer la demande: client non identifié', 'Erreur');
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
    const professional = this.professionalForm.value;
    const financial = this.financialForm.value;

    // ✅ Récupérer la valeur de submitImmediately
    const submitImmediately = financial.submitImmediately;

    const creditData: CreditRequestDTO = {
      clientId: this.clientId,
      userId: this.currentUser?.id || '',
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
      // ✅ AJOUTER CETTE LIGNE
      submitImmediately: submitImmediately
    };

    this.creditService.createCreditRequest(creditData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        if (submitImmediately) {
          this.toastr.success(
            `✅ Votre demande de crédit N°${response.requestNumber} a été soumise avec succès et est en cours d'analyse`,
            'Demande soumise'
          );
          this.router.navigate(['/simulation-result', response.id]);
        } else {
          this.toastr.success(
            `📝 Votre demande de crédit N°${response.requestNumber} a été sauvegardée comme brouillon. Vous pourrez la modifier et la soumettre plus tard.`,
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
}
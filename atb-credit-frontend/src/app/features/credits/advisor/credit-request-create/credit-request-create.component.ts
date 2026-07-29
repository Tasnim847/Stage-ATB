// features/credits/advisor/credit-request-create/credit-request-create.component.ts
import { Component, OnInit, inject, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ClientService } from '@core/services/client.service';
import { ClientResponseDTO } from '@core/models/client.model';
import { CreditRequestService } from '@core/services/credit-request.service';
import { DocumentService } from '@core/services/document.service';
import { AuthService } from '@core/services/auth.service';
import { CreditRequestDTO, DocumentType, DocumentResponseDTO } from '@core/models';
import { ParametrageService, CreditType, DurationConfig } from '@core/services/parametrage.service';
import { DocumentUploadInlineComponent } from './components/document-upload-inline.component';

@Component({
  selector: 'app-credit-request-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatRadioModule,
    DocumentUploadInlineComponent
  ],
  templateUrl: './credit-request-create.component.html',
  styleUrls: ['./credit-request-create.component.css']
})
export class CreditRequestCreateComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private creditRequestService = inject(CreditRequestService);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private parametrageService = inject(ParametrageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  // États
  clientId: string | null = null;
  client: ClientResponseDTO | null = null;
  isLoading = false;
  isLoadingDocuments = false;
  isLoadingCreditTypes = false;
  isSubmitting = false;
  documents: DocumentResponseDTO[] = [];
  mandatoryDocuments: DocumentType[] = [];
  documentStatus: Map<DocumentType, boolean> = new Map();
  currentStep = 0;
  creditRequestId: string | null = null;
  private refreshInterval: any = null;
  private animatingDocuments: Set<DocumentType> = new Set();
  private uploadedDocumentTypes: Set<DocumentType> = new Set();

  // Recherche client
  showClientSearch = false;
  filteredClients: ClientResponseDTO[] = [];
  clientSearchControl = this.fb.control('');

  // Types de crédit
  creditTypes: CreditType[] = [];
  selectedCreditType: CreditType | null = null;
  availableDurations: DurationConfig[] = [];
  creditTypeId: string = '';

  // Taux d'intérêt calculé automatiquement
  calculatedInterestRate: number = 0;
  riskLevel: string = '';
  rateAdjustments: string[] = [];

  // Formulaires
  clientInfoForm!: FormGroup;
  creditTypeForm!: FormGroup;
  creditDetailsForm!: FormGroup;
  reviewForm!: FormGroup;

  // Types de documents
  documentTypes = DocumentType;
  documentTypeLabels: Record<DocumentType, string> = {
    [DocumentType.IDENTITY_DOCUMENT]: 'Pièce d\'identité',
    [DocumentType.BANK_STATEMENT]: 'Relevé bancaire',
    [DocumentType.FINANCIAL_STATEMENT]: 'États financiers',
    [DocumentType.INCOME_PROOF]: 'Justificatif de revenus',
    [DocumentType.TAX_RETURN]: 'Déclaration d\'impôts',
    [DocumentType.PROPERTY_DOCUMENT]: 'Titre de propriété',
    [DocumentType.CONTRACT]: 'Contrat',
    [DocumentType.PAYSLIP]: 'Bulletin de salaire',
    [DocumentType.BUSINESS_REGISTRATION]: 'Registre de commerce',
    [DocumentType.OTHER]: 'Autre document'
  };

  // Options pour les sélecteurs
  currencies = [
    { value: 'XOF', label: 'XOF - Franc CFA' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'USD', label: 'USD - Dollar' }
  ];

  collateralTypes = [
    'Véhicule',
    'Terrain',
    'Maison',
    'Appartement',
    'Équipement',
    'Marchandise',
    'Autre'
  ];

  loanPurposes = [
    'Achat immobilier',
    'Achat véhicule',
    'Travaux rénovation',
    'Création d\'entreprise',
    'Études',
    'Consommation',
    'Rachat de crédit',
    'Autre'
  ];

  // Catégories de crédit pour l'affichage
  creditCategories = [
    { 
      id: 'PERSONAL', 
      label: 'Crédit personnel', 
      icon: 'person',
      description: 'Pour vos projets personnels'
    },
    { 
      id: 'AUTO', 
      label: 'Crédit automobile', 
      icon: 'directions_car',
      description: 'Pour l\'achat d\'un véhicule'
    },
    { 
      id: 'MORTGAGE', 
      label: 'Crédit immobilier', 
      icon: 'home',
      description: 'Pour l\'achat ou la rénovation d\'un bien'
    },
    { 
      id: 'BUSINESS', 
      label: 'Crédit professionnel', 
      icon: 'business',
      description: 'Pour le développement de votre entreprise'
    },
    { 
      id: 'STUDENT', 
      label: 'Crédit étudiant', 
      icon: 'school',
      description: 'Pour financer vos études'
    },
    { 
      id: 'CONSUMER', 
      label: 'Crédit à la consommation', 
      icon: 'shopping_cart',
      description: 'Pour vos achats courants'
    },
    { 
      id: 'BRIDGE', 
      label: 'Prêt relais', 
      icon: 'swap_horiz',
      description: 'En attendant la vente d\'un bien'
    },
    { 
      id: 'REVOLVING', 
      label: 'Crédit renouvelable', 
      icon: 'autorenew',
      description: 'Crédit permanent et modulable'
    }
  ];

  // Taux de base par type de crédit (depuis le backend)
  baseRates: Record<string, number> = {};

  ngOnInit(): void {
    this.initForms();
    this.initClientSearch();
    this.loadCreditTypes();
    
    this.route.params.subscribe(params => {
      this.clientId = params['clientId'] || null;
      if (this.clientId) {
        this.loadClientInfo(this.clientId);
      } else {
        this.showClientSearch = true;
        this.snackBar.open('Veuillez sélectionner un client', 'Fermer', { duration: 3000 });
      }
    });

    this.creditDetailsForm.valueChanges.subscribe(() => {
      this.calculateInterestRate();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  initForms(): void {
    this.clientInfoForm = this.fb.group({
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      phoneNumber: [{ value: '', disabled: true }],
      profession: [{ value: '', disabled: true }],
      employer: [{ value: '', disabled: true }],
      monthlyIncome: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }]
    });

    this.creditTypeForm = this.fb.group({
      creditCategory: ['', Validators.required],
      creditTypeId: ['', Validators.required]
    });

    this.creditDetailsForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1000)]],
      currency: ['XOF', [Validators.required]],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      interestRate: [{ value: 0, disabled: true }],
      loanPurpose: ['', [Validators.required, Validators.maxLength(500)]],
      collateralType: [''],
      collateralValue: ['', [Validators.min(0)]],
      guarantorName: ['', [Validators.maxLength(200)]],
      guarantorPhone: ['', [Validators.pattern(/^[0-9+\-\s()]{8,20}$/)]],
      expectedDisbursementDate: [''],
      monthlySalary: ['', [Validators.required, Validators.min(0)]],
      otherMonthlyIncome: [0],
      hasOtherCredits: [false],
      otherCreditsAmount: [0],
      rentAmount: [0],
      refinanceAmount: [0],
      refinanceBankName: [''],
      refinanceContractNumber: ['']
    });

    this.reviewForm = this.fb.group({
      verified: [false, [Validators.requiredTrue]],
      notes: ['']
    });

    // Écouter les changements de catégorie de crédit
    this.creditTypeForm.get('creditCategory')?.valueChanges.subscribe((category) => {
      this.filterCreditTypesByCategory(category);
    });

    // Écouter les changements de type de crédit
    this.creditTypeForm.get('creditTypeId')?.valueChanges.subscribe((creditTypeId) => {
      this.creditTypeId = creditTypeId;
      this.selectedCreditType = this.creditTypes.find(t => t.id === creditTypeId) || null;
      this.loadDurationsForCreditType(creditTypeId);
      this.updateFinancialValidations();
      this.calculateInterestRate();
    });
  }

  // ============================================
  // CHARGEMENT DES TYPES DE CRÉDIT
  // ============================================

  loadCreditTypes(): void {
    this.isLoadingCreditTypes = true;
    this.parametrageService.getActiveCreditTypes().subscribe({
      next: (types) => {
        this.creditTypes = types;
        this.isLoadingCreditTypes = false;
        // Initialiser les taux de base
        types.forEach(type => {
          this.baseRates[type.id] = type.baseInterestRate;
        });
        // Sélectionner automatiquement le premier type si disponible
        if (types.length > 0) {
          this.creditTypeForm.get('creditTypeId')?.setValue(types[0].id);
        }
      },
      error: (error) => {
        console.error('Erreur chargement types de crédit:', error);
        this.isLoadingCreditTypes = false;
        this.snackBar.open('Erreur lors du chargement des types de crédit', 'Fermer', { duration: 5000 });
      }
    });
  }

  filterCreditTypesByCategory(category: string): void {
    const filtered = this.creditTypes.filter(t => t.category === category);
    if (filtered.length > 0) {
      this.creditTypeForm.get('creditTypeId')?.setValue(filtered[0].id);
    } else {
      this.creditTypeForm.get('creditTypeId')?.setValue('');
    }
  }

  loadDurationsForCreditType(creditTypeId: string): void {
    if (!creditTypeId) {
      this.availableDurations = [];
      return;
    }
    
    this.parametrageService.getDurationConfigsByCreditType(creditTypeId).subscribe({
      next: (durations) => {
        this.availableDurations = durations;
        // Sélectionner la durée par défaut
        const defaultDuration = durations.find(d => d.isDefault);
        if (defaultDuration) {
          this.creditDetailsForm.get('durationMonths')?.setValue(defaultDuration.durationMonths);
        } else if (durations.length > 0) {
          this.creditDetailsForm.get('durationMonths')?.setValue(durations[0].durationMonths);
        }
      },
      error: (error) => {
        console.error('Erreur chargement durées:', error);
        this.availableDurations = [];
      }
    });
  }

  // ============================================
  // RECHERCHE CLIENT
  // ============================================

  initClientSearch(): void {
    this.clientSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            this.filteredClients = [];
            return [];
          }
          return this.clientService.searchClients(query);
        })
      )
      .subscribe({
        next: (clients) => {
          this.filteredClients = clients || [];
        },
        error: (error) => {
          console.error('Erreur recherche clients:', error);
          this.filteredClients = [];
        }
      });
  }

  selectClient(client: ClientResponseDTO): void {
    this.clientId = client.id;
    this.loadClientInfo(client.id);
    this.showClientSearch = false;
    this.clientSearchControl.setValue(`${client.firstName} ${client.lastName} (${client.clientNumber})`, { emitEvent: false });
  }

  getSearchLength(): number {
    const value = this.clientSearchControl.value;
    return value ? value.length : 0;
  }

  // ============================================
  // CHARGEMENT DES INFORMATIONS CLIENT
  // ============================================

  loadClientInfo(clientId: string): void {
    this.isLoading = true;
    this.uploadedDocumentTypes = new Set();
    
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.clientInfoForm.patchValue({
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phoneNumber: client.phoneNumber || '',
          profession: client.profession || '',
          employer: client.employer || '',
          monthlyIncome: client.monthlyIncome || '',
          address: client.address || ''
        });
        this.isLoading = false;
        this.loadClientDocuments(clientId);
        this.loadMandatoryDocuments();
      },
      error: (error) => {
        console.error('Erreur chargement client:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des informations du client', 'Fermer', { duration: 5000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  // ============================================
  // GESTION DES DOCUMENTS
  // ============================================

  loadClientDocuments(clientId: string): void {
    this.isLoadingDocuments = true;
    this.documentService.getDocumentsByClient(clientId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.isLoadingDocuments = false;
        this.checkDocumentStatus();
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
        this.isLoadingDocuments = false;
      }
    });
  }

  loadMandatoryDocuments(): void {
    this.documentService.getMandatoryDocumentTypes().subscribe({
      next: (types) => {
        this.mandatoryDocuments = types;
        if (this.clientId) {
          this.checkDocumentStatus();
        }
      },
      error: (error) => {
        console.error('Erreur chargement documents obligatoires:', error);
      }
    });
  }

  checkDocumentStatus(): void {
    if (!this.clientId) return;
    
    this.isLoadingDocuments = true;
    this.documentService.getMandatoryDocumentStatus(this.clientId).subscribe({
      next: (status) => {
        this.documentStatus = status;
        this.isLoadingDocuments = false;
        this.updateProgress();
      },
      error: (error) => {
        console.error('Erreur vérification statut documents:', error);
        this.isLoadingDocuments = false;
      }
    });
  }

  isDocumentMandatory(type: DocumentType): boolean {
    return this.mandatoryDocuments.includes(type);
  }

  hasMandatoryDocuments(): boolean {
    if (!this.clientId) return false;
    if (this.mandatoryDocuments.length === 0) return false;
    
    return this.mandatoryDocuments.every(type => 
      this.documentStatus.get(type) === true || 
      this.uploadedDocumentTypes.has(type)
    );
  }

  getMissingDocuments(): DocumentType[] {
    return this.mandatoryDocuments.filter(type => 
      this.documentStatus.get(type) !== true && 
      !this.uploadedDocumentTypes.has(type)
    );
  }

  getMandatoryProgress(): number {
    if (this.mandatoryDocuments.length === 0) return 0;
    
    const present = this.mandatoryDocuments.filter(type => 
      this.documentStatus.get(type) === true || 
      this.uploadedDocumentTypes.has(type)
    ).length;
    
    return Math.round((present / this.mandatoryDocuments.length) * 100);
  }

  isDocumentUploaded(type: DocumentType): boolean {
    return this.documentStatus.get(type) === true || this.uploadedDocumentTypes.has(type);
  }

  isAnimating(type: DocumentType): boolean {
    return this.animatingDocuments.has(type);
  }

  refreshDocumentStatus(): void {
    if (this.clientId) {
      this.checkDocumentStatus();
    }
  }

  startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshInterval = setInterval(() => {
      if (this.clientId && this.currentStep === 3) {
        this.checkDocumentStatus();
      }
    }, 5000);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  forceRefreshDocumentStatus(): void {
    if (!this.clientId) return;
    
    console.log('🔄 Force refreshing document status...');
    this.isLoadingDocuments = true;
    
    this.documentService.getDocumentsByClient(this.clientId).subscribe({
      next: (docs) => {
        this.documentService.getMandatoryDocumentTypes().subscribe({
          next: (mandatoryTypes) => {
            this.mandatoryDocuments = mandatoryTypes;
            
            const newStatus = new Map<DocumentType, boolean>();
            mandatoryTypes.forEach(type => {
              const hasDoc = docs.some(doc => 
                doc.documentType === type && doc.verified === true
              );
              const isUploaded = this.uploadedDocumentTypes.has(type);
              newStatus.set(type, hasDoc || isUploaded);
            });
            
            this.documentStatus = newStatus;
            this.isLoadingDocuments = false;
            this.updateProgress();
          },
          error: (error) => {
            console.error('❌ Error getting mandatory types:', error);
            this.isLoadingDocuments = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error getting documents:', error);
        this.isLoadingDocuments = false;
      }
    });
  }

  updateProgress(): void {
    const progress = this.getMandatoryProgress();
    console.log('📊 Progression des documents:', progress + '%');
  }

  onDocumentUploaded(event: { documentType: DocumentType, clientId: string }): void {
    console.log('📥 Document uploaded event received:', event);
    
    if (!event.documentType) {
      console.warn('⚠️ Document type is undefined, forcing refresh');
      this.forceRefreshDocumentStatus();
      return;
    }
    
    this.uploadedDocumentTypes.add(event.documentType);
    this.documentStatus.set(event.documentType, true);
    this.animatingDocuments.add(event.documentType);
    
    this.snackBar.open(`✅ ${this.documentTypeLabels[event.documentType]} téléchargé avec succès`, 'Fermer', { duration: 3000 });
    
    this.updateProgress();
    
    setTimeout(() => {
      this.animatingDocuments.delete(event.documentType);
    }, 500);
    
    setTimeout(() => {
      this.forceRefreshDocumentStatus();
    }, 1000);
    
    if (this.hasMandatoryDocuments()) {
      this.snackBar.open('🎉 Tous les documents obligatoires sont présents !', 'Fermer', { duration: 5000 });
    }
  }

  // ============================================
  // CALCUL DU TAUX D'INTÉRÊT
  // ============================================

  calculateInterestRate(): void {
    const creditTypeId = this.creditTypeId;
    const monthlySalary = this.creditDetailsForm.get('monthlySalary')?.value || 0;
    const durationMonths = this.creditDetailsForm.get('durationMonths')?.value || 0;
    const hasOtherCredits = this.creditDetailsForm.get('hasOtherCredits')?.value || false;
    const otherCreditsAmount = this.creditDetailsForm.get('otherCreditsAmount')?.value || 0;
    const amount = this.creditDetailsForm.get('amount')?.value || 0;

    if (!creditTypeId || amount <= 0) {
      this.calculatedInterestRate = 0;
      this.rateAdjustments = [];
      return;
    }

    const baseRate = this.baseRates[creditTypeId] || 7.0;
    let adjustments: string[] = [];
    let totalAdjustment = 0;

    // Score de solvabilité
    const score = this.estimateSolvencyScore();
    
    if (score >= 90) {
      totalAdjustment -= 0.50;
      adjustments.push('✅ Excellent score (-0.50%)');
    } else if (score >= 80) {
      totalAdjustment -= 0.25;
      adjustments.push('✅ Bon score (-0.25%)');
    } else if (score < 50) {
      totalAdjustment += 0.50;
      adjustments.push('⚠️ Score faible (+0.50%)');
    }

    // Salaire
    if (monthlySalary >= 500000) {
      totalAdjustment -= 0.15;
      adjustments.push('✅ Salaire élevé (-0.15%)');
    } else if (monthlySalary < 150000) {
      totalAdjustment += 0.30;
      adjustments.push('⚠️ Salaire modeste (+0.30%)');
    }

    // Autres crédits
    if (hasOtherCredits && otherCreditsAmount > 0) {
      if (otherCreditsAmount > amount * 0.5) {
        totalAdjustment += 0.50;
        adjustments.push('⚠️ Autres crédits importants (+0.50%)');
      } else {
        totalAdjustment += 0.25;
        adjustments.push('⚠️ Autres crédits (+0.25%)');
      }
    }

    // Durée
    if (durationMonths > 60) {
      totalAdjustment += 0.20;
      adjustments.push('⚠️ Longue durée > 60 mois (+0.20%)');
    }

    // Montant
    if (amount > 10000000) {
      totalAdjustment -= 0.10;
      adjustments.push('✅ Montant élevé (-0.10%)');
    }

    let finalRate = Math.round((baseRate + totalAdjustment) * 100) / 100;
    finalRate = Math.max(3.0, Math.min(18.0, finalRate));

    this.calculatedInterestRate = finalRate;
    this.rateAdjustments = adjustments;

    this.creditDetailsForm.get('interestRate')?.setValue(finalRate, { emitEvent: false });

    // Niveau de risque
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
    const monthlySalary = this.creditDetailsForm.get('monthlySalary')?.value || 0;
    const debtRatio = this.calculateDebtRatio();

    if (monthlySalary >= 500000) score += 20;
    else if (monthlySalary >= 300000) score += 15;
    else if (monthlySalary >= 200000) score += 10;
    else if (monthlySalary >= 100000) score += 5;

    if (debtRatio < 35) score += 25;
    else if (debtRatio < 45) score += 15;
    else score += 5;

    if (!this.creditDetailsForm.get('hasOtherCredits')?.value) score += 15;

    const resteAVivre = monthlySalary - (this.creditDetailsForm.get('rentAmount')?.value || 0);
    if (resteAVivre > 200000) score += 10;
    else if (resteAVivre > 100000) score += 5;

    return Math.min(score, 100);
  }

  calculateMonthlyPayment(): number {
    const amount = this.creditDetailsForm.get('amount')?.value || 0;
    const rate = this.calculatedInterestRate || 0;
    const months = this.creditDetailsForm.get('durationMonths')?.value || 1;
    
    if (amount <= 0 || rate < 0 || months <= 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return amount / months;
    
    const factor = Math.pow(1 + monthlyRate, months);
    return (amount * monthlyRate * factor) / (factor - 1);
  }

  calculateDebtRatio(): number {
    const salary = this.creditDetailsForm.get('monthlySalary')?.value || 0;
    const otherIncome = this.creditDetailsForm.get('otherMonthlyIncome')?.value || 0;
    const totalIncome = salary + otherIncome;
    
    if (totalIncome === 0) return 0;
    
    const monthlyPayment = this.calculateMonthlyPayment();
    const otherCredits = this.creditDetailsForm.get('otherCreditsAmount')?.value || 0;
    const rent = this.creditDetailsForm.get('rentAmount')?.value || 0;
    const totalMonthlyPayments = monthlyPayment + otherCredits + rent;
    
    return Math.round((totalMonthlyPayments / totalIncome) * 100);
  }

  getTotalPayment(): number {
    const monthly = this.calculateMonthlyPayment();
    const months = this.creditDetailsForm.get('durationMonths')?.value || 0;
    return monthly * months;
  }


  updateFinancialValidations(): void {
    const refinanceAmount = this.creditDetailsForm.get('refinanceAmount');
    const refinanceBankName = this.creditDetailsForm.get('refinanceBankName');
    const refinanceContractNumber = this.creditDetailsForm.get('refinanceContractNumber');

    // ✅ Vérification correcte avec type guard
    const isRefinance = this.selectedCreditType 
      ? this.selectedCreditType.category === 'REFINANCE' 
        || (this.selectedCreditType.name && this.selectedCreditType.name.toLowerCase().includes('rachat'))
      : false;
  
    if (isRefinance) {
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
  // NAVIGATION ET SOUMISSION
  // ============================================

  canProceedToReview(): boolean {
    return this.hasMandatoryDocuments() && this.creditDetailsForm.valid;
  }

  goToStep(stepIndex: number): void {
    if (this.stepper) {
      this.stepper.selectedIndex = stepIndex;
    }
  }

  onStepChange(event: any): void {
    this.currentStep = event.selectedIndex;
    if (this.currentStep === 3 && this.clientId) {
      this.checkDocumentStatus();
    }
  }

  getCreditTypeLabel(): string {
    const type = this.creditTypes.find(t => t.id === this.creditTypeId);
    return type ? type.name : 'Non défini';
  }

  selectCreditCategory(categoryId: string): void {
    this.creditTypeForm.get('creditCategory')?.setValue(categoryId);
  }

  goBack(): void {
    window.history.back();
  }

  onSubmit(): void {
    if (this.creditDetailsForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 5000 });
      return;
    }

    if (!this.clientId) {
      this.snackBar.open('Aucun client sélectionné', 'Fermer', { duration: 5000 });
      return;
    }

    if (!this.creditTypeId) {
      this.snackBar.open('Veuillez sélectionner un type de crédit', 'Fermer', { duration: 5000 });
      return;
    }

    if (!this.reviewForm.get('verified')?.value) {
      this.snackBar.open('Veuillez confirmer la vérification des documents', 'Fermer', { duration: 5000 });
      return;
    }

    const debtRatio = this.calculateDebtRatio();
    if (debtRatio > 50) {
      this.snackBar.open(
        `⚠️ Taux d'endettement de ${debtRatio}%. Il est recommandé de ne pas dépasser 33%.`,
        'Fermer',
        { duration: 5000 }
      );
    }

    this.isSubmitting = true;
    const user = this.authService.getUserInfo();
    const formValue = this.creditDetailsForm.value;
    
    const request: CreditRequestDTO = {
      clientId: this.clientId,
      userId: user?.id || '',
      creditTypeId: this.creditTypeId, // ✅ AJOUTÉ
      amount: formValue.amount,
      currency: formValue.currency,
      durationMonths: formValue.durationMonths,
      monthlyPayment: this.calculateMonthlyPayment(),
      interestRate: this.calculatedInterestRate,
      loanPurpose: formValue.loanPurpose,
      collateralType: formValue.collateralType || undefined,
      collateralValue: formValue.collateralValue || undefined,
      guarantorName: formValue.guarantorName || undefined,
      guarantorPhone: formValue.guarantorPhone || undefined,
      expectedDisbursementDate: formValue.expectedDisbursementDate || undefined
    };

    this.creditRequestService.createCreditRequest(request).subscribe({
      next: (response) => {
        this.creditRequestId = response.id;
        this.isSubmitting = false;
        this.snackBar.open('✅ Demande de crédit créée avec succès !', 'Fermer', { duration: 5000 });
        
        if (this.hasMandatoryDocuments()) {
          this.transmitToAnalyst(response.id);
        } else {
          this.router.navigate(['/credit-requests', response.id]);
        }
      },
      error: (error) => {
        console.error('Erreur création demande:', error);
        this.isSubmitting = false;
        this.snackBar.open('❌ Erreur lors de la création de la demande', 'Fermer', { duration: 5000 });
      }
    });
  }

  transmitToAnalyst(creditRequestId: string): void {
    const notes = this.reviewForm.get('notes')?.value || '';
    
    this.creditRequestService.transmitToAnalyst(creditRequestId, notes).subscribe({
      next: () => {
        this.snackBar.open('📤 Dossier transmis à l\'analyste avec succès !', 'Fermer', { duration: 5000 });
        this.router.navigate(['/credit-requests', creditRequestId]);
      },
      error: (error) => {
        console.error('Erreur transmission:', error);
        this.snackBar.open('⚠️ Demande créée mais erreur lors de la transmission', 'Fermer', { duration: 5000 });
        this.router.navigate(['/credit-requests', creditRequestId]);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: this.creditDetailsForm.get('currency')?.value || 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getDocumentIcon(type: DocumentType): string {
    const icons: Record<DocumentType, string> = {
      [DocumentType.IDENTITY_DOCUMENT]: 'person',
      [DocumentType.BANK_STATEMENT]: 'account_balance',
      [DocumentType.FINANCIAL_STATEMENT]: 'analytics',
      [DocumentType.INCOME_PROOF]: 'attach_money',
      [DocumentType.TAX_RETURN]: 'receipt',
      [DocumentType.PROPERTY_DOCUMENT]: 'home',
      [DocumentType.CONTRACT]: 'description',
      [DocumentType.PAYSLIP]: 'receipt_long',
      [DocumentType.BUSINESS_REGISTRATION]: 'business',
      [DocumentType.OTHER]: 'file_present'
    };
    return icons[type] || 'file_present';
  }

  getCreditCategoryLabel(category: string): string {
    const cat = this.creditCategories.find(c => c.id === category);
    return cat ? cat.label : category;
  }

  getCreditTypeName(typeId: string): string {
    const type = this.creditTypes.find(t => t.id === typeId);
    return type ? type.name : 'Type inconnu';
  }
}
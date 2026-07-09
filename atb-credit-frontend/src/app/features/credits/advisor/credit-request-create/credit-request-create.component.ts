import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
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
import { MatProgressBarModule } from '@angular/material/progress-bar'; // ✅ AJOUTER CETTE LIGNE
import { finalize } from 'rxjs/operators';

import { ClientService } from '@core/services/client.service';
import { CreditRequestService } from '@core/services/credit-request.service';
import { DocumentService } from '@core/services/document.service';
import { AuthService } from '@core/services/auth.service';
import { ClientResponseDTO, CreditRequestDTO, DocumentType, DocumentResponseDTO } from '@core/models';

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
    MatProgressBarModule // ✅ AJOUTER CETTE LIGNE
  ],
  templateUrl: './credit-request-create.component.html',
  styleUrls: ['./credit-request-create.component.css']
})
export class CreditRequestCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private creditRequestService = inject(CreditRequestService);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  // États
  clientId: string | null = null;
  client: ClientResponseDTO | null = null;
  isLoading = false;
  isLoadingDocuments = false;
  isSubmitting = false;
  documents: DocumentResponseDTO[] = [];
  mandatoryDocuments: DocumentType[] = [];
  documentStatus: Map<DocumentType, boolean> = new Map();
  currentStep = 0;
  creditRequestId: string | null = null;

  // Formulaires
  clientInfoForm!: FormGroup;
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

  ngOnInit(): void {
    this.initForms();
    
    // Récupérer l'ID du client depuis les paramètres de route
    this.route.params.subscribe(params => {
      this.clientId = params['clientId'] || null;
      if (this.clientId) {
        this.loadClientInfo(this.clientId);
      } else {
        // Si pas de clientId, aller à la liste des clients
        this.snackBar.open('Veuillez sélectionner un client', 'Fermer', { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  initForms(): void {
    // Formulaire des informations client (lecture seule)
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

    // Formulaire des détails du crédit
    this.creditDetailsForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1000)]],
      currency: ['XOF', [Validators.required]],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      loanPurpose: ['', [Validators.required, Validators.maxLength(500)]],
      collateralType: [''],
      collateralValue: ['', [Validators.min(0)]],
      guarantorName: ['', [Validators.maxLength(200)]],
      guarantorPhone: ['', [Validators.pattern(/^[0-9+\-\s()]{8,20}$/)]],
      expectedDisbursementDate: ['']
    });

    // Formulaire de validation finale
    this.reviewForm = this.fb.group({
      verified: [false, [Validators.requiredTrue]],
      notes: ['']
    });
  }

  loadClientInfo(clientId: string): void {
    this.isLoading = true;
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
    
    this.documentService.getMandatoryDocumentStatus(this.clientId).subscribe({
      next: (status) => {
        this.documentStatus = status;
      },
      error: (error) => {
        console.error('Erreur vérification statut documents:', error);
      }
    });
  }

  isDocumentMandatory(type: DocumentType): boolean {
    return this.mandatoryDocuments.includes(type);
  }

  hasMandatoryDocuments(): boolean {
    if (!this.clientId) return false;
    return this.mandatoryDocuments.every(type => this.documentStatus.get(type) === true);
  }

  getMissingDocuments(): DocumentType[] {
    return this.mandatoryDocuments.filter(type => this.documentStatus.get(type) !== true);
  }

  getMandatoryProgress(): number {
    if (this.mandatoryDocuments.length === 0) return 0;
    const present = this.mandatoryDocuments.filter(type => this.documentStatus.get(type) === true).length;
    return Math.round((present / this.mandatoryDocuments.length) * 100);
  }

  canProceedToReview(): boolean {
    return this.hasMandatoryDocuments() && this.creditDetailsForm.valid;
  }

  // Navigation dans le stepper
  goToStep(stepIndex: number, stepper: any): void {
    if (stepIndex === 2 && !this.canProceedToReview()) {
      this.snackBar.open('Veuillez vérifier que tous les documents obligatoires sont présents', 'Fermer', { duration: 5000 });
      return;
    }
    stepper.selectedIndex = stepIndex;
  }

  onStepChange(event: any): void {
    this.currentStep = event.selectedIndex;
    if (this.currentStep === 2 && this.clientId) {
      this.checkDocumentStatus();
    }
  }

  // Soumission de la demande
  submitCreditRequest(): void {
    if (this.creditDetailsForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 5000 });
      return;
    }

    if (!this.clientId) {
      this.snackBar.open('Aucun client sélectionné', 'Fermer', { duration: 5000 });
      return;
    }

    if (!this.reviewForm.get('verified')?.value) {
      this.snackBar.open('Veuillez confirmer la vérification des documents', 'Fermer', { duration: 5000 });
      return;
    }

    this.isSubmitting = true;
    const user = this.authService.getUserInfo();
    
    const request: CreditRequestDTO = {
      clientId: this.clientId,
      userId: user?.id || '',
      amount: this.creditDetailsForm.get('amount')?.value,
      currency: this.creditDetailsForm.get('currency')?.value,
      durationMonths: this.creditDetailsForm.get('durationMonths')?.value,
      monthlyPayment: this.calculateMonthlyPayment(),
      interestRate: this.getInterestRate(),
      loanPurpose: this.creditDetailsForm.get('loanPurpose')?.value,
      collateralType: this.creditDetailsForm.get('collateralType')?.value || undefined,
      collateralValue: this.creditDetailsForm.get('collateralValue')?.value || undefined,
      guarantorName: this.creditDetailsForm.get('guarantorName')?.value || undefined,
      guarantorPhone: this.creditDetailsForm.get('guarantorPhone')?.value || undefined,
      expectedDisbursementDate: this.creditDetailsForm.get('expectedDisbursementDate')?.value || undefined
    };

    this.creditRequestService.createCreditRequest(request).subscribe({
      next: (response) => {
        this.creditRequestId = response.id;
        this.isSubmitting = false;
        this.snackBar.open('✅ Demande de crédit créée avec succès !', 'Fermer', { duration: 5000 });
        
        // Transmettre automatiquement à l'analyste si tous les documents sont présents
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

  calculateMonthlyPayment(): number {
    const amount = this.creditDetailsForm.get('amount')?.value || 0;
    const rate = this.getInterestRate() / 100 / 12;
    const months = this.creditDetailsForm.get('durationMonths')?.value || 1;
    
    if (rate === 0 || months === 0) return amount / months;
    
    return amount * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
  }

  getInterestRate(): number {
    // Logique pour déterminer le taux selon le montant et la durée
    const amount = this.creditDetailsForm.get('amount')?.value || 0;
    const duration = this.creditDetailsForm.get('durationMonths')?.value || 0;
    
    let rate = 6.5; // Taux de base
    
    if (amount > 10000000) rate = 5.5;
    else if (amount > 5000000) rate = 6.0;
    else if (amount > 1000000) rate = 6.5;
    else rate = 7.0;
    
    if (duration > 60) rate += 0.5;
    else if (duration > 36) rate += 0.25;
    
    return rate;
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

  getTotalPayment(): number {
    const monthly = this.calculateMonthlyPayment();
    const months = this.creditDetailsForm.get('durationMonths')?.value || 0;
    return monthly * months;
  }

  goBack(): void {
    this.router.navigate(['/clients', this.clientId]);
  }
}
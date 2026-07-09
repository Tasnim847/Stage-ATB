// features/credits/admin/credit-admin/credit-admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ToastrService } from 'ngx-toastr';
import { CreditRequestService } from '@core/services/credit-request.service';
import { ClientService, ClientResponseDTO } from '@core/services/client.service';
import { AuthService } from '@core/services/auth.service';
import { CreditRequestDTO } from '@core/models';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-credit-admin',
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
    MatDividerModule,
    MatTooltipModule,
    MatAutocompleteModule
  ],
  templateUrl: './credit-admin.component.html',
  styleUrls: ['./credit-admin.component.css']
})
export class CreditAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private creditService = inject(CreditRequestService);
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  // Formulaire
  creditForm!: FormGroup;
  
  // États
  isLoading = false;
  isSubmitting = false;
  isSearching = false;
  selectedClient: ClientResponseDTO | null = null;
  clients: ClientResponseDTO[] = [];
  filteredClients: ClientResponseDTO[] = [];
  
  // Récupérer l'ID du client depuis les paramètres (si pré-sélectionné)
  clientId: string | null = null;

  // Options
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

  collateralTypes = [
    'Bien immobilier',
    'Véhicule',
    'Épargne',
    'Garantie personnelle',
    'Aucune'
  ];

  currencies = [
    'TND',
    'EUR',
    'USD'
  ];

  ngOnInit(): void {
    // Récupérer l'ID du client depuis les paramètres de route
    this.route.params.subscribe(params => {
      this.clientId = params['clientId'] || null;
      if (this.clientId) {
        this.loadClientById(this.clientId);
      }
    });

    this.initForm();
  }

  initForm(): void {
    this.creditForm = this.fb.group({
      // Recherche client
      clientSearch: [''],
      
      // Client pré-sélectionné
      clientId: [this.clientId || '', Validators.required],
      
      // Détails du crédit
      amount: ['', [Validators.required, Validators.min(100)]],
      currency: ['TND', Validators.required],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      interestRate: ['', [Validators.required, Validators.min(0), Validators.max(30)]],
      loanPurpose: ['', Validators.required],
      collateralType: [''],
      collateralValue: [''],
      guarantorName: [''],
      guarantorPhone: [''],
      expectedDisbursementDate: [''],
      notes: ['']
    });

    // ✅ Écouter les changements de recherche client
    this.creditForm.get('clientSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (value && value.length >= 2) {
            return this.searchClients(value);
          }
          return of([]);
        })
      )
      .subscribe((clients) => {
        this.filteredClients = clients;
        this.isSearching = false;
      });
  }

  loadClientById(id: string): void {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.selectedClient = client;
        this.creditForm.patchValue({
          clientId: client.id,
          clientSearch: `${client.firstName} ${client.lastName} (${client.clientNumber})`
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement client:', error);
        this.toastr.error('Client non trouvé', 'Erreur');
        this.isLoading = false;
        this.router.navigate(['/admin/clients']);
      }
    });
  }

  searchClients(query: string): Observable<ClientResponseDTO[]> {
    if (!query || query.length < 2) {
      return of([]);
    }
    this.isSearching = true;
    return this.clientService.searchClients(query);
  }

  selectClient(client: ClientResponseDTO): void {
    this.selectedClient = client;
    this.creditForm.patchValue({
      clientId: client.id,
      clientSearch: `${client.firstName} ${client.lastName} (${client.clientNumber})`
    });
    this.filteredClients = [];
  }

  displayClientFn(client: ClientResponseDTO): string {
    return client ? `${client.firstName} ${client.lastName} (${client.clientNumber})` : '';
  }

  getClientDisplay(client: ClientResponseDTO): string {
    if (!client) return '';
    return `${client.firstName} ${client.lastName} - ${client.clientNumber}`;
  }

  calculateMonthlyPayment(): number {
    const amount = this.creditForm.get('amount')?.value || 0;
    const rate = this.creditForm.get('interestRate')?.value || 0;
    const months = this.creditForm.get('durationMonths')?.value || 1;
    
    if (amount <= 0 || rate < 0 || months <= 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return amount / months;
    
    const factor = Math.pow(1 + monthlyRate, months);
    return (amount * monthlyRate * factor) / (factor - 1);
  }

  getTotalPayment(): number {
    return this.calculateMonthlyPayment() * (this.creditForm.get('durationMonths')?.value || 0);
  }

  getTotalInterest(): number {
    const amount = this.creditForm.get('amount')?.value || 0;
    return this.getTotalPayment() - amount;
  }

  onSubmit(): void {
    if (this.creditForm.invalid) {
      this.creditForm.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les erreurs du formulaire', 'Formulaire invalide');
      return;
    }

    const formValue = this.creditForm.value;
    
    // Vérifier que le client est sélectionné
    if (!formValue.clientId) {
      this.toastr.warning('Veuillez sélectionner un client', 'Client requis');
      return;
    }

    this.isSubmitting = true;

    const creditData: CreditRequestDTO = {
      clientId: formValue.clientId,
      userId: this.authService.getUserInfo()?.id || '',
      amount: formValue.amount,
      currency: formValue.currency,
      durationMonths: formValue.durationMonths,
      monthlyPayment: this.calculateMonthlyPayment(),
      interestRate: formValue.interestRate,
      loanPurpose: formValue.loanPurpose,
      collateralType: formValue.collateralType || '',
      collateralValue: formValue.collateralValue || 0,
      guarantorName: formValue.guarantorName || '',
      guarantorPhone: formValue.guarantorPhone || '',
      expectedDisbursementDate: formValue.expectedDisbursementDate || ''
    };

    this.creditService.createCreditRequest(creditData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.toastr.success(
          `Demande de crédit N°${response.requestNumber} créée avec succès`,
          'Succès'
        );
        
        // Rediriger vers le détail de la demande
        this.router.navigate(['/credit-requests', response.id]);
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
    this.router.navigate(['/admin/clients']);
  }

  // Getters pour les erreurs
  get f() { return this.creditForm.controls; }
}
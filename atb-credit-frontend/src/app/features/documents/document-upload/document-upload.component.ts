// features/documents/document-upload/document-upload.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService } from '@core/services/document.service';
import { ClientService, ClientResponseDTO } from '@core/services/client.service';
import { CreditRequestService } from '@core/services/credit-request.service';
import { DOCUMENT_TYPE_CONFIG, DocumentType, CreditResponseDTO } from '@core/models';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatSnackBarModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  documentTypes = Object.values(DocumentType);
  documentTypeConfig = DOCUMENT_TYPE_CONFIG;
  uploading = false;
  
  // Liste des clients
  clients: ClientResponseDTO[] = [];
  filteredClients: ClientResponseDTO[] = [];
  loadingClients = false;
  clientSearchQuery = '';
  
  // Liste des crédits du client sélectionné
  clientCreditRequests: CreditResponseDTO[] = [];
  loadingCredits = false;
  selectedClientId: string = '';

  // ✅ IDs pré-remplis depuis les paramètres de route
  preSelectedClientId: string | null = null;
  preSelectedCreditRequestId: string | null = null;
  isLoadingPreSelection = false;

  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private clientService = inject(ClientService);
  private creditRequestService = inject(CreditRequestService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.initForm();
    
    // ✅ Récupérer les paramètres de route
    this.route.queryParams.subscribe(params => {
      this.preSelectedClientId = params['clientId'] || null;
      this.preSelectedCreditRequestId = params['creditRequestId'] || null;
      
      if (this.preSelectedClientId) {
        this.uploadForm.get('clientId')?.setValue(this.preSelectedClientId);
        this.selectedClientId = this.preSelectedClientId;
        this.loadClientCreditRequests(this.preSelectedClientId);
        
        if (this.preSelectedCreditRequestId) {
          this.uploadForm.get('creditRequestId')?.setValue(this.preSelectedCreditRequestId);
        }
      }
    });
    
    this.loadClients();
    
    // Écouter les changements de sélection du client
    this.uploadForm.get('clientId')?.valueChanges.subscribe((clientId) => {
      this.selectedClientId = clientId;
      if (clientId) {
        this.loadClientCreditRequests(clientId);
      } else {
        this.clientCreditRequests = [];
        this.uploadForm.get('creditRequestId')?.setValue('');
      }
    });
  }

  initForm(): void {
    this.uploadForm = this.fb.group({
      clientId: ['', Validators.required],
      creditRequestId: [''],
      documentType: ['', Validators.required],
      description: ['']
    });
  }

  loadClients(): void {
    this.loadingClients = true;
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.loadingClients = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 5000 });
        this.loadingClients = false;
      }
    });
  }

  loadClientCreditRequests(clientId: string): void {
    if (!clientId) return;
    
    this.loadingCredits = true;
    this.clientCreditRequests = [];
    
    // ✅ Si un creditRequestId est pré-sélectionné, on le garde
    const currentCreditId = this.uploadForm.get('creditRequestId')?.value;
    
    this.creditRequestService.getCreditRequestsByClient(clientId).subscribe({
      next: (credits) => {
        this.clientCreditRequests = credits || [];
        this.loadingCredits = false;
        
        // ✅ Si un creditRequestId est pré-sélectionné, le remettre
        if (this.preSelectedCreditRequestId && 
            credits.some(c => c.id === this.preSelectedCreditRequestId)) {
          this.uploadForm.get('creditRequestId')?.setValue(this.preSelectedCreditRequestId);
        } 
        // Sinon, si un seul crédit, le sélectionner automatiquement
        else if (this.clientCreditRequests.length === 1 && !currentCreditId) {
          this.uploadForm.get('creditRequestId')?.setValue(this.clientCreditRequests[0].id);
        }
      },
      error: () => {
        this.clientCreditRequests = [];
        this.loadingCredits = false;
        this.snackBar.open('Erreur lors du chargement des crédits du client', 'Fermer', { duration: 5000 });
      }
    });
  }

  onClientSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.clientSearchQuery = value;
    this.filterClients();
  }

  filterClients(): void {
    if (!this.clientSearchQuery.trim()) {
      this.filteredClients = this.clients;
      return;
    }

    const query = this.clientSearchQuery.toLowerCase().trim();
    this.filteredClients = this.clients.filter(client => 
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.clientNumber.toLowerCase().includes(query) ||
      client.phoneNumber?.includes(query)
    );
  }

  getClientDisplayName(client: ClientResponseDTO): string {
    return `${client.firstName} ${client.lastName} (${client.clientNumber}) - ${client.email}`;
  }

  getCreditDisplayName(credit: CreditResponseDTO): string {
    const statusLabels: { [key: string]: string } = {
      'PENDING_ANALYSIS': 'En attente',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté',
      'UNDER_REVIEW': 'En révision',
      'COMPLETED': 'Terminé',
      'DRAFT': 'Brouillon',
      'PENDING_DOCUMENTS': 'Documents manquants',
      'CANCELLED': 'Annulé'
    };
    const statusLabel = statusLabels[credit.status] || credit.status;
    return `Demande #${credit.requestNumber || credit.id.substring(0, 8)} - ${credit.amount} ${credit.currency || 'XOF'} - ${statusLabel}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.filePreview = reader.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.filePreview = null;
      }
    }
  }

  getDocumentTypeLabel(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.label || type;
  }

  getDocumentTypeIcon(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.icon || 'fa-file';
  }

  isMandatory(type: DocumentType): boolean {
    return DOCUMENT_TYPE_CONFIG[type]?.mandatory || false;
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 5000 });
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('clientId', this.uploadForm.get('clientId')?.value);
    formData.append('documentType', this.uploadForm.get('documentType')?.value);
    
    if (this.uploadForm.get('description')?.value) {
      formData.append('description', this.uploadForm.get('description')?.value);
    }
    
    const creditRequestId = this.uploadForm.get('creditRequestId')?.value;
    if (creditRequestId) {
      formData.append('creditRequestId', creditRequestId);
    }

    this.documentService.uploadDocument(formData)
      .pipe(finalize(() => {
        this.uploading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open('📄 Document téléchargé avec succès', 'Fermer', { duration: 3000 });
          
          // ✅ Rediriger vers la page de détail du crédit si disponible
          if (creditRequestId) {
            this.router.navigate(['/credit-requests', creditRequestId]);
          } else if (this.uploadForm.get('clientId')?.value) {
            this.router.navigate(['/clients', this.uploadForm.get('clientId')?.value]);
          } else {
            this.router.navigate(['/documents']);
          }
        },
        error: (error) => {
          console.error('Erreur upload:', error);
          this.snackBar.open('❌ Erreur lors du téléchargement du document', 'Fermer', { duration: 5000 });
        }
      });
  }

  cancel(): void {
    // ✅ Retourner à la page précédente
    const creditId = this.uploadForm.get('creditRequestId')?.value;
    const clientId = this.uploadForm.get('clientId')?.value;
    
    if (creditId) {
      this.router.navigate(['/credit-requests', creditId]);
    } else if (clientId) {
      this.router.navigate(['/clients', clientId]);
    } else {
      this.router.navigate(['/documents']);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    const fileInput = window.document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // ✅ Vérifier si le formulaire est pré-rempli
  isPreFilled(): boolean {
    return !!this.preSelectedClientId || !!this.preSelectedCreditRequestId;
  }
}
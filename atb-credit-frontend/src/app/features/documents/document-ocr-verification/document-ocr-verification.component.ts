// features/documents/document-ocr-verification/document-ocr-verification.component.ts
import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';
import { DocumentService } from '@core/services/document.service';
import { ClientService } from '@core/services/client.service';
import { OcrClientVerificationService, ClientDataVerificationResult } from '@core/services/ocr-client-verification.service';
import { DOCUMENT_TYPE_CONFIG, DocumentResponseDTO, ClientResponseDTO } from '@core/models';

@Component({
  selector: 'app-document-ocr-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  template: `
    <div class="ocr-verification-container">
      <!-- HEADER -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>auto_awesome</mat-icon>
            Vérification OCR
          </h1>
          <p class="subtitle">Extraction et vérification automatique des données du document</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Analyse du document en cours...</p>
        <p class="loading-sub">Extraction des données et vérification</p>
      </div>

      <!-- ERROR -->
      <div *ngIf="error" class="error-container">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Erreur lors de l'analyse</h3>
        <p>{{ errorMessage }}</p>
        <button mat-raised-button color="primary" (click)="retryVerification()">
          <mat-icon>refresh</mat-icon>
          Réessayer
        </button>
      </div>

      <!-- RÉSULTATS -->
      <div *ngIf="!loading && !error && result" class="result-container">
        <!-- Résumé des correspondances -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>assessment</mat-icon>
              Résumé de la vérification
            </mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Document</span>
                <span class="summary-value">{{ document?.fileName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Client</span>
                <span class="summary-value">{{ client?.firstName }} {{ client?.lastName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Statut global</span>
                <span class="summary-value">
                  <span class="status-badge" [class.success]="result.globalMatch" [class.error]="!result.globalMatch">
                    <mat-icon>{{ result.globalMatch ? 'check_circle' : 'error' }}</mat-icon>
                    {{ result.globalMatch ? 'Toutes les données correspondent ✅' : 'Des incohérences détectées ⚠️' }}
                  </span>
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Confiance</span>
                <span class="summary-value">
                  <div class="confidence-bar">
                    <mat-progress-bar mode="determinate" [value]="result.confidence * 100"></mat-progress-bar>
                    <span>{{ (result.confidence * 100).toFixed(0) }}%</span>
                  </div>
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Détail des correspondances -->
        <mat-card class="matches-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>compare_arrows</mat-icon>
              Comparaison des données
            </mat-card-title>
            <mat-card-subtitle>Vérification automatique entre le document et les données client</mat-card-subtitle>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="matches-table-container">
              <table mat-table [dataSource]="result.matches || []" class="matches-table">
                <ng-container matColumnDef="field">
                  <th mat-header-cell *matHeaderCellDef>Champ</th>
                  <td mat-cell *matCellDef="let match">{{ getFieldLabel(match.field) }}</td>
                </ng-container>

                <ng-container matColumnDef="extracted">
                  <th mat-header-cell *matHeaderCellDef>Extrait du document</th>
                  <td mat-cell *matCellDef="let match">
                    <span class="extracted-value">{{ match.extractedValue || '-' }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="client">
                  <th mat-header-cell *matHeaderCellDef>Donnée client</th>
                  <td mat-cell *matCellDef="let match">
                    <span class="client-value">{{ match.clientValue || '-' }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Correspondance</th>
                  <td mat-cell *matCellDef="let match">
                    <span class="match-status" [class.match]="match.match" [class.mismatch]="!match.match">
                      <mat-icon>{{ match.match ? 'check' : 'close' }}</mat-icon>
                      {{ match.match ? 'Correspond' : 'Ne correspond pas' }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            <!-- Avertissements et erreurs -->
            <div *ngIf="result.warnings?.length || result.errors?.length" class="messages-section">
              <div *ngIf="result.warnings?.length" class="warnings">
                <h4><mat-icon>warning</mat-icon> Avertissements</h4>
                <ul>
                  <li *ngFor="let warning of result.warnings">{{ warning }}</li>
                </ul>
              </div>
              <div *ngIf="result.errors?.length" class="errors">
                <h4><mat-icon>error</mat-icon> Erreurs</h4>
                <ul>
                  <li *ngFor="let error of result.errors">{{ error }}</li>
                </ul>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions -->
        <div class="actions-section">
          <button mat-raised-button color="primary" (click)="acceptVerification()" [disabled]="processing">
            <mat-icon>check</mat-icon>
            {{ processing ? 'Traitement...' : 'Accepter et valider' }}
          </button>
          <button mat-stroked-button color="warn" (click)="rejectVerification()" [disabled]="processing">
            <mat-icon>close</mat-icon>
            Rejeter
          </button>
          <button mat-stroked-button (click)="manualVerification()" [disabled]="processing">
            <mat-icon>edit</mat-icon>
            Vérification manuelle
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ocr-verification-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { display: flex; align-items: center; gap: 12px; margin: 0; }
    .page-header h1 mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .subtitle { color: #666; margin: 4px 0 0 0; }
    
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; }
    .loading-container p { margin-top: 16px; font-size: 16px; color: #666; }
    .loading-sub { font-size: 14px; color: #999; }
    
    .error-container { text-align: center; padding: 60px 20px; }
    .error-icon { font-size: 64px; width: 64px; height: 64px; color: #f44336; }
    .error-container h3 { margin: 16px 0 8px; }
    
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 16px 0; }
    .summary-item { display: flex; flex-direction: column; gap: 4px; }
    .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .summary-value { font-size: 16px; font-weight: 500; }
    
    .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 16px; font-size: 14px; }
    .status-badge.success { background: #e8f5e9; color: #2e7d32; }
    .status-badge.error { background: #ffebee; color: #c62828; }
    
    .confidence-bar { display: flex; align-items: center; gap: 12px; min-width: 150px; }
    .confidence-bar mat-progress-bar { flex: 1; height: 8px; border-radius: 4px; }
    
    .matches-table-container { overflow-x: auto; margin: 16px 0; }
    .matches-table { width: 100%; }
    .matches-table th { font-weight: 600; color: #333; }
    .matches-table td { padding: 12px 8px; }
    
    .extracted-value { background: #e3f2fd; padding: 2px 8px; border-radius: 4px; font-family: monospace; }
    .client-value { background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-family: monospace; }
    
    .match-status { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .match-status.match { background: #e8f5e9; color: #2e7d32; }
    .match-status.mismatch { background: #ffebee; color: #c62828; }
    
    .messages-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .messages-section h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 8px 0; }
    .warnings h4 { color: #f57c00; }
    .errors h4 { color: #c62828; }
    .messages-section ul { margin: 0; padding-left: 24px; }
    .messages-section li { margin: 4px 0; }
    
    .actions-section { display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
    .actions-section button { min-width: 150px; }
    
    @media (max-width: 768px) {
      .ocr-verification-container { padding: 16px; }
      .summary-grid { grid-template-columns: 1fr; }
      .actions-section { flex-direction: column; align-items: stretch; }
      .actions-section button { width: 100%; }
    }
  `]
})
export class DocumentOcrVerificationComponent implements OnInit {
  // Inputs
  @Input() documentId: string | null = null;
  @Input() clientId: string | null = null;

  // Données
  document: DocumentResponseDTO | null = null;
  client: ClientResponseDTO | null = null;
  result: ClientDataVerificationResult | null = null;
  
  // États
  loading = false;
  processing = false;
  error = false;
  errorMessage = '';

  // Configuration
  displayedColumns = ['field', 'extracted', 'client', 'status'];
  documentTypeConfig = DOCUMENT_TYPE_CONFIG;

  // Services
  private documentService = inject(DocumentService);
  private clientService = inject(ClientService);
  private ocrService = inject(OcrClientVerificationService);
  private toastr = inject(ToastrService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Récupérer les paramètres de route si non fournis en Input
    if (!this.documentId) {
      this.documentId = this.route.snapshot.paramMap.get('documentId') || null;
    }
    if (!this.clientId) {
      this.clientId = this.route.snapshot.queryParamMap.get('clientId') || null;
    }

    if (this.documentId) {
      this.loadDocumentAndVerify();
    } else {
      this.error = true;
      this.errorMessage = 'ID du document manquant';
    }
  }

  loadDocumentAndVerify(): void {
    if (!this.documentId) return;

    this.loading = true;
    this.error = false;
    this.errorMessage = '';

    // Charger le document
    this.documentService.getDocumentById(this.documentId).subscribe({
      next: (doc) => {
        this.document = doc;
        
        // Si clientId non fourni, utiliser celui du document
        if (!this.clientId && doc.clientId) {
          this.clientId = doc.clientId;
        }

        if (this.clientId) {
          this.loadClientAndVerify();
        } else {
          this.loading = false;
          this.error = true;
          this.errorMessage = 'Client non trouvé pour ce document';
        }
      },
      error: (err) => {
        console.error('Erreur chargement document:', err);
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Impossible de charger le document';
      }
    });
  }

  loadClientAndVerify(): void {
    if (!this.clientId) return;

    this.clientService.getClientById(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.performOcrVerification();
      },
      error: (err) => {
        console.error('Erreur chargement client:', err);
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Impossible de charger les données du client';
      }
    });
  }

  performOcrVerification(): void {
    if (!this.documentId || !this.clientId) return;

    this.loading = true;

    // Appeler l'API OCR pour extraire et vérifier
    this.ocrService.extractAndVerifyDocument(
      this.documentId,
      this.clientId,
      this.document?.documentType || ''
    ).subscribe({
      next: (result) => {
        this.result = result;
        this.loading = false;

        if (result.globalMatch) {
          this.toastr.success('Toutes les données correspondent ✅', 'Vérification réussie');
        } else {
          this.toastr.warning('Des incohérences ont été détectées ⚠️', 'Attention');
        }
      },
      error: (err) => {
        console.error('Erreur vérification OCR:', err);
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Erreur lors de la vérification OCR';
        this.toastr.error('Erreur lors de la vérification OCR', 'Erreur');
      }
    });
  }

  retryVerification(): void {
    this.error = false;
    this.errorMessage = '';
    this.result = null;
    this.loadDocumentAndVerify();
  }

  acceptVerification(): void {
    if (!this.documentId) return;

    this.processing = true;
    this.documentService.verifyDocument(this.documentId, true, 'Vérifié automatiquement par OCR')
      .subscribe({
        next: () => {
          this.processing = false;
          this.toastr.success('Document vérifié avec succès ✅', 'Succès');
          this.router.navigate(['/documents', this.documentId]);
        },
        error: (err) => {
          console.error('Erreur vérification:', err);
          this.processing = false;
          this.toastr.error('Erreur lors de la vérification du document', 'Erreur');
        }
      });
  }

  rejectVerification(): void {
    if (!this.documentId) return;

    this.processing = true;
    this.documentService.verifyDocument(this.documentId, false, 'Rejeté après vérification OCR')
      .subscribe({
        next: () => {
          this.processing = false;
          this.toastr.success('Document rejeté', 'Succès');
          this.router.navigate(['/documents', this.documentId]);
        },
        error: (err) => {
          console.error('Erreur rejet:', err);
          this.processing = false;
          this.toastr.error('Erreur lors du rejet du document', 'Erreur');
        }
      });
  }

  manualVerification(): void {
    if (this.documentId) {
      this.router.navigate(['/documents/verify', this.documentId]);
    }
  }

  goBack(): void {
    if (this.documentId) {
      this.router.navigate(['/documents', this.documentId]);
    } else {
      this.router.navigate(['/documents']);
    }
  }

  getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      'firstName': 'Prénom',
      'lastName': 'Nom',
      'email': 'Email',
      'phoneNumber': 'Téléphone',
      'address': 'Adresse',
      'city': 'Ville',
      'country': 'Pays',
      'birthDate': 'Date de naissance',
      'identityNumber': 'Numéro d\'identité',
      'identityCardNumber': 'Numéro CNI',
      'passportNumber': 'Numéro de passeport',
      'taxId': 'Numéro fiscal',
      'iban': 'IBAN',
      'accountNumber': 'Numéro de compte',
      'amount': 'Montant',
      'currency': 'Devise'
    };
    return labels[field] || field;
  }
}
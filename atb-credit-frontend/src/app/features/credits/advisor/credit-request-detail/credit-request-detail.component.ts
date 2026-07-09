import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';

import { CreditRequestService } from '@core/services/credit-request.service';
import { DocumentService } from '@core/services/document.service';
import { CreditResponseDTO, CreditStatus, DocumentResponseDTO } from '@core/models';

@Component({
  selector: 'app-credit-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatTabsModule
  ],
  templateUrl: './credit-request-detail.component.html',
  styleUrls: ['./credit-request-detail.component.css']
})
export class CreditRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private creditRequestService = inject(CreditRequestService);
  private documentService = inject(DocumentService);
  private snackBar = inject(MatSnackBar);

  creditRequest: CreditResponseDTO | null = null;
  documents: DocumentResponseDTO[] = [];
  isLoading = true;
  isProcessing = false;
  creditRequestId: string | null = null;

  statusLabels: Record<CreditStatus, string> = {
    [CreditStatus.DRAFT]: 'Brouillon',
    [CreditStatus.PENDING_ANALYSIS]: 'En attente d\'analyse',
    [CreditStatus.UNDER_REVIEW]: 'En révision',
    [CreditStatus.APPROVED]: 'Approuvé',
    [CreditStatus.REJECTED]: 'Refusé',
    [CreditStatus.PENDING_DOCUMENTS]: 'Documents manquants',
    [CreditStatus.COMPLETED]: 'Terminé',
    [CreditStatus.CANCELLED]: 'Annulé'
  };

  statusColors: Record<CreditStatus, string> = {
    [CreditStatus.DRAFT]: 'default',
    [CreditStatus.PENDING_ANALYSIS]: 'warn',
    [CreditStatus.UNDER_REVIEW]: 'accent',
    [CreditStatus.APPROVED]: 'primary',
    [CreditStatus.REJECTED]: 'warn',
    [CreditStatus.PENDING_DOCUMENTS]: 'warn',
    [CreditStatus.COMPLETED]: 'primary',
    [CreditStatus.CANCELLED]: 'default'
  };

  statusIcons: Record<CreditStatus, string> = {
    [CreditStatus.DRAFT]: 'draft',
    [CreditStatus.PENDING_ANALYSIS]: 'pending',
    [CreditStatus.UNDER_REVIEW]: 'search',
    [CreditStatus.APPROVED]: 'check_circle',
    [CreditStatus.REJECTED]: 'cancel',
    [CreditStatus.PENDING_DOCUMENTS]: 'folder',
    [CreditStatus.COMPLETED]: 'done_all',
    [CreditStatus.CANCELLED]: 'block'
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.creditRequestId = params['id'];
      if (this.creditRequestId) {
        this.loadCreditRequest();
      }
    });
  }

  loadCreditRequest(): void {
    if (!this.creditRequestId) return;
    
    this.isLoading = true;
    this.creditRequestService.getCreditRequestById(this.creditRequestId).subscribe({
      next: (request) => {
        this.creditRequest = request;
        this.isLoading = false;
        this.loadDocuments(request.id);
      },
      error: (error) => {
        console.error('Erreur chargement demande:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement de la demande', 'Fermer', { duration: 5000 });
        this.router.navigate(['/credit-requests']);
      }
    });
  }

  loadDocuments(creditRequestId: string): void {
    this.documentService.getDocumentsByCreditRequest(creditRequestId).subscribe({
      next: (docs) => {
        this.documents = docs;
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
      }
    });
  }

  getStatusLabel(status: CreditStatus): string {
    return this.statusLabels[status] || status;
  }

  getStatusColor(status: CreditStatus): string {
    return this.statusColors[status] || 'default';
  }

  getStatusIcon(status: CreditStatus): string {
    return this.statusIcons[status] || 'help';
  }

  getStatusChipClass(status: CreditStatus): string {
    const classes = {
      [CreditStatus.DRAFT]: 'status-draft',
      [CreditStatus.PENDING_ANALYSIS]: 'status-pending',
      [CreditStatus.UNDER_REVIEW]: 'status-review',
      [CreditStatus.APPROVED]: 'status-approved',
      [CreditStatus.REJECTED]: 'status-rejected',
      [CreditStatus.PENDING_DOCUMENTS]: 'status-pending-docs',
      [CreditStatus.COMPLETED]: 'status-completed',
      [CreditStatus.CANCELLED]: 'status-cancelled'
    };
    return classes[status] || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.creditRequest?.currency || 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/credit-requests']);
  }

  editRequest(): void {
    if (this.creditRequest) {
      this.router.navigate(['/credit-requests', this.creditRequest.id, 'edit']);
    }
  }

  deleteRequest(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      // TODO: Implémenter la suppression
      this.snackBar.open('Fonctionnalité en développement', 'Fermer', { duration: 3000 });
    }
  }

  cancelRequest(): void {
    if (!this.creditRequest) return;
    
    if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      this.isProcessing = true;
      this.creditRequestService.cancelCreditRequest(this.creditRequest.id).subscribe({
        next: () => {
          this.isProcessing = false;
          this.snackBar.open('✅ Demande annulée avec succès', 'Fermer', { duration: 3000 });
          this.loadCreditRequest();
        },
        error: (error) => {
          console.error('Erreur annulation:', error);
          this.isProcessing = false;
          this.snackBar.open('❌ Erreur lors de l\'annulation', 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  canEdit(): boolean {
    if (!this.creditRequest) return false;
    return this.creditRequest.status === CreditStatus.DRAFT ||
           this.creditRequest.status === CreditStatus.PENDING_DOCUMENTS;
  }

  canCancel(): boolean {
    if (!this.creditRequest) return false;
    return this.creditRequest.status === CreditStatus.PENDING_ANALYSIS ||
           this.creditRequest.status === CreditStatus.UNDER_REVIEW ||
           this.creditRequest.status === CreditStatus.DRAFT;
  }

  getDocumentStatusColor(verified: boolean): string {
    return verified ? '#4caf50' : '#ff9800';
  }

  getDocumentStatusLabel(verified: boolean): string {
    return verified ? '✅ Vérifié' : '⏳ En attente';
  }

  getLoanPurposeSummary(): string {
    if (!this.creditRequest?.loanPurpose) return 'Non spécifié';
    return this.creditRequest.loanPurpose.length > 100 
      ? this.creditRequest.loanPurpose.substring(0, 100) + '...' 
      : this.creditRequest.loanPurpose;
  }

  getRiskLevelColor(riskLevel: string): string {
    const colors: Record<string, string> = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336',
      'CRITICAL': '#d32f2f'
    };
    return colors[riskLevel] || '#999';
  }

  getRiskLevelLabel(riskLevel: string): string {
    const labels: Record<string, string> = {
      'LOW': 'Faible',
      'MEDIUM': 'Moyen',
      'HIGH': 'Élevé',
      'CRITICAL': 'Critique'
    };
    return labels[riskLevel] || riskLevel;
  }
}
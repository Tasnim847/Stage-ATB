import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { CreditResponseDTO, CreditStatus } from '@core/models';
import { CreditRequestService } from '@core/services/credit-request.service';

@Component({
  selector: 'app-credit-client',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './credit-client.component.html',
  styleUrls: ['./credit-client.component.css']
})
export class CreditClientComponent implements OnInit {
  private creditService = inject(CreditRequestService);
  private toastr = inject(ToastrService);

  credits: CreditResponseDTO[] = [];
  filteredCredits: CreditResponseDTO[] = [];
  isLoading = true;
  selectedStatus: CreditStatus | 'ALL' = 'ALL';
  
  totalCredits = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  statuses: { value: CreditStatus | 'ALL', label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: CreditStatus.DRAFT, label: 'Brouillon' },
    { value: CreditStatus.PENDING_ANALYSIS, label: 'En analyse' },
    { value: CreditStatus.UNDER_REVIEW, label: 'En révision' },
    { value: CreditStatus.APPROVED, label: 'Approuvé' },
    { value: CreditStatus.REJECTED, label: 'Rejeté' },
    { value: CreditStatus.COMPLETED, label: 'Terminé' }
  ];

  ngOnInit(): void {
    this.loadCredits();
  }

  loadCredits(): void {
    this.isLoading = true;
    this.creditService.getMyCreditRequests().subscribe({
      next: (credits) => {
        this.credits = credits;
        this.filteredCredits = credits;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des crédits', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  filterByStatus(status: CreditStatus | 'ALL'): void {
    this.selectedStatus = status;
    if (status === 'ALL') {
      this.filteredCredits = this.credits;
    } else {
      this.filteredCredits = this.credits.filter(c => c.status === status);
    }
  }

  calculateStats(): void {
    this.totalCredits = this.credits.length;
    this.pendingCount = this.credits.filter(c => 
      c.status === CreditStatus.PENDING_ANALYSIS || 
      c.status === CreditStatus.UNDER_REVIEW
    ).length;
    this.approvedCount = this.credits.filter(c => c.status === CreditStatus.APPROVED).length;
    this.rejectedCount = this.credits.filter(c => c.status === CreditStatus.REJECTED).length;
  }

  getStatusCount(status: CreditStatus | 'ALL'): number {
    if (status === 'ALL') return this.credits.length;
    return this.credits.filter(c => c.status === status).length;
  }

  getStatusLabel(status: CreditStatus): string {
    const labels: Record<CreditStatus, string> = {
      [CreditStatus.DRAFT]: 'Brouillon',
      [CreditStatus.PENDING_ANALYSIS]: 'En analyse',
      [CreditStatus.UNDER_REVIEW]: 'En révision',
      [CreditStatus.APPROVED]: 'Approuvé',
      [CreditStatus.REJECTED]: 'Rejeté',
      [CreditStatus.COMPLETED]: 'Terminé',
      [CreditStatus.PENDING_DOCUMENTS]: 'Documents en attente',
      [CreditStatus.CANCELLED]: 'Annulé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: CreditStatus): string {
    const classes: Record<CreditStatus, string> = {
      [CreditStatus.DRAFT]: 'status-draft',
      [CreditStatus.PENDING_ANALYSIS]: 'status-pending',
      [CreditStatus.UNDER_REVIEW]: 'status-review',
      [CreditStatus.APPROVED]: 'status-approved',
      [CreditStatus.REJECTED]: 'status-rejected',
      [CreditStatus.COMPLETED]: 'status-completed',
      [CreditStatus.PENDING_DOCUMENTS]: 'status-pending-docs',
      [CreditStatus.CANCELLED]: 'status-cancelled'
    };
    return classes[status] || 'status-default';
  }

  isStatusSelected(status: CreditStatus | 'ALL'): boolean {
    return this.selectedStatus === status;
  }

  // Vérifier si la demande peut être annulée
canCancel(credit: CreditResponseDTO): boolean {
  return credit.status === CreditStatus.PENDING_ANALYSIS || 
         credit.status === CreditStatus.UNDER_REVIEW;
}

// Annuler une demande
  cancelCredit(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande de crédit ?')) {
      return;
    }
  
    this.isLoading = true;
    this.creditService.cancelCreditRequest(id).subscribe({
      next: () => {
        this.toastr.success('Demande annulée avec succès', 'Succès');
        this.loadCredits(); // Recharger la liste
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Erreur lors de l\'annulation', 'Erreur');
        this.isLoading = false;
      }
    });
  }
}
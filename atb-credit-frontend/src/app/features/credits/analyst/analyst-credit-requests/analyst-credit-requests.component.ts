import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { CreditRequestService } from '@core/services/credit-request.service';
import { AuthService } from '@core/services/auth.service';
import { CreditResponseDTO, CreditStatus } from '@core/models';

type StatusFilter = CreditStatus | 'ALL';

@Component({
  selector: 'app-analyst-credit-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    DatePipe
  ],
  templateUrl: './analyst-credit-requests.component.html',
  styleUrls: ['./analyst-credit-requests.component.css']
})
export class AnalystCreditRequestsComponent implements OnInit {
  private creditRequestService = inject(CreditRequestService);
  private authService = inject(AuthService);

  // Données
  allCreditRequests: CreditResponseDTO[] = [];
  filteredRequests: CreditResponseDTO[] = [];
  
  // États
  loading = false;
  error: string | null = null;
  
  // Statistiques
  totalCount = 0;
  pendingCount = 0;
  underReviewCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  completedCount = 0;
  
  // Filtres
  selectedStatus: StatusFilter = 'ALL';
  
  // Statuts disponibles
  statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: CreditStatus.DRAFT, label: 'Brouillon' },
    { value: CreditStatus.PENDING_ANALYSIS, label: 'En attente d\'analyse' },
    { value: CreditStatus.UNDER_REVIEW, label: 'En révision' },
    { value: CreditStatus.PENDING_DOCUMENTS, label: 'Documents manquants' },
    { value: CreditStatus.APPROVED, label: 'Approuvé' },
    { value: CreditStatus.REJECTED, label: 'Refusé' },
    { value: CreditStatus.COMPLETED, label: 'Terminé' },
    { value: CreditStatus.CANCELLED, label: 'Annulé' }
  ];

  ngOnInit(): void {
    this.loadCreditRequests();
  }

  loadCreditRequests(): void {
    this.loading = true;
    this.error = null;
    
    this.creditRequestService.getCreditRequestsForAnalyst().subscribe({
      next: (data) => {
        this.allCreditRequests = data;
        this.calculateStatistics();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading credit requests:', err);
        this.error = 'Erreur lors du chargement des demandes de crédit';
        this.loading = false;
      }
    });
  }

  calculateStatistics(): void {
    this.totalCount = this.allCreditRequests.length;
    this.pendingCount = this.allCreditRequests.filter(r => r.status === CreditStatus.PENDING_ANALYSIS).length;
    this.underReviewCount = this.allCreditRequests.filter(r => r.status === CreditStatus.UNDER_REVIEW).length;
    this.approvedCount = this.allCreditRequests.filter(r => r.status === CreditStatus.APPROVED).length;
    this.rejectedCount = this.allCreditRequests.filter(r => r.status === CreditStatus.REJECTED).length;
    this.completedCount = this.allCreditRequests.filter(r => r.status === CreditStatus.COMPLETED).length;
  }

  applyFilters(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredRequests = [...this.allCreditRequests];
    } else {
      this.filteredRequests = this.allCreditRequests.filter(
        r => r.status === this.selectedStatus
      );
    }
  }

  onStatusFilterChange(status: StatusFilter): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  getStatusCount(status: StatusFilter): number {
    if (status === 'ALL') return this.totalCount;
    switch(status) {
      case CreditStatus.PENDING_ANALYSIS: return this.pendingCount;
      case CreditStatus.UNDER_REVIEW: return this.underReviewCount;
      case CreditStatus.APPROVED: return this.approvedCount;
      case CreditStatus.REJECTED: return this.rejectedCount;
      case CreditStatus.COMPLETED: return this.completedCount;
      default: return 0;
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/_/g, '_');
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'PENDING_ANALYSIS': 'En attente d\'analyse',
      'UNDER_REVIEW': 'En révision',
      'PENDING_DOCUMENTS': 'Documents manquants',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Refusé',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
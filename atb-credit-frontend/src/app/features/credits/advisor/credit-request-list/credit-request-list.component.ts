import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { CreditRequestService } from '@core/services/credit-request.service';
import { CreditResponseDTO, CreditStatus } from '@core/models';

@Component({
  selector: 'app-credit-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './credit-request-list.component.html',
  styleUrls: ['./credit-request-list.component.css']
})
export class CreditRequestListComponent implements OnInit {
  private creditRequestService = inject(CreditRequestService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Données
  creditRequests: CreditResponseDTO[] = [];
  filteredRequests: CreditResponseDTO[] = [];
  displayedColumns: string[] = [
    'requestNumber',
    'clientName',
    'amount',
    'durationMonths',
    'status',
    'createdAt',
    'actions'
  ];

  // États
  isLoading = false;
  totalItems = 0;

  // Pagination
  pageSize = 6;
  pageSizeOptions = [6, 12, 24, 48];
  currentPage = 0;

  // Filtres
  searchTerm = '';
  filterStatus: CreditStatus | 'ALL' = 'ALL';
  statusOptions = [
    { value: 'ALL', label: 'Tous' },
    { value: CreditStatus.DRAFT, label: 'Brouillon' },
    { value: CreditStatus.PENDING_ANALYSIS, label: 'En attente' },
    { value: CreditStatus.UNDER_REVIEW, label: 'En révision' },
    { value: CreditStatus.APPROVED, label: 'Approuvé' },
    { value: CreditStatus.REJECTED, label: 'Refusé' },
    { value: CreditStatus.PENDING_DOCUMENTS, label: 'Documents manquants' },
    { value: CreditStatus.COMPLETED, label: 'Terminé' },
    { value: CreditStatus.CANCELLED, label: 'Annulé' }
  ];

  statusLabels: Record<CreditStatus, string> = {
    [CreditStatus.DRAFT]: 'Brouillon',
    [CreditStatus.PENDING_ANALYSIS]: 'En attente',
    [CreditStatus.UNDER_REVIEW]: 'En révision',
    [CreditStatus.APPROVED]: 'Approuvé',
    [CreditStatus.REJECTED]: 'Refusé',
    [CreditStatus.PENDING_DOCUMENTS]: 'Docs manquants',
    [CreditStatus.COMPLETED]: 'Terminé',
    [CreditStatus.CANCELLED]: 'Annulé'
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
    this.loadCreditRequests();
  }

  loadCreditRequests(): void {
    this.isLoading = true;
    this.creditRequestService.getAllCreditRequests().subscribe({
      next: (requests) => {
        this.creditRequests = requests;
        this.totalItems = requests.length;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement demandes:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', { duration: 5000 });
      }
    });
  }

  applyFilters(): void {
    let filtered = this.creditRequests;

    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === this.filterStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.clientName.toLowerCase().includes(term) ||
        r.requestNumber.toLowerCase().includes(term) ||
        r.clientEmail.toLowerCase().includes(term)
      );
    }

    filtered = filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.filteredRequests = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 0;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'ALL';
    this.applyFilters();
  }

  getPaginatedData(): CreditResponseDTO[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredRequests.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getStatusLabel(status: CreditStatus): string {
    return this.statusLabels[status] || status;
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

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  viewRequest(id: string): void {
    this.router.navigate(['/credit-requests', id]);
  }

  editRequest(id: string): void {
    this.router.navigate(['/credit-requests', id, 'edit']);
  }

  deleteRequest(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      this.snackBar.open('Fonctionnalité en développement', 'Fermer', { duration: 3000 });
    }
  }

  createNewRequest(): void {
    this.router.navigate(['/credit-requests/new']);
  }

  getTotalAmount(): number {
    return this.filteredRequests.reduce((sum, r) => sum + r.amount, 0);
  }

  getPendingCount(): number {
    return this.filteredRequests.filter(r => 
      r.status === CreditStatus.PENDING_ANALYSIS || 
      r.status === CreditStatus.UNDER_REVIEW
    ).length;
  }
}
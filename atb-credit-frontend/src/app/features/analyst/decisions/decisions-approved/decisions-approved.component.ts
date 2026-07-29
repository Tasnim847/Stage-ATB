// src/app/features/analyst/decisions/decisions-approved/decisions-approved.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DecisionService } from '@core/services/decision.service';

export interface DecisionApproved {
  id: string;
  creditRequestId: string;
  clientName: string;
  amount: number;
  duration: number;
  type: string;
  approvalDate: Date;
  approvedBy: string;
  amountApproved: number;
  interestRate: number;
  monthlyPayment: number;
  status: 'approved' | 'pending_client' | 'pending_manager';
  observations: string;
}

@Component({
  selector: 'app-decisions-approved',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    FormsModule
  ],
  templateUrl: './decisions-approved.component.html',
  styleUrls: ['./decisions-approved.component.css']
})
export class DecisionsApprovedComponent implements OnInit {
  approvedDecisions: DecisionApproved[] = [];
  filteredDecisions: DecisionApproved[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 6;
  currentPage = 0;

  filters = {
    search: '',
    status: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    minAmount: null as number | null,
    maxAmount: null as number | null
  };

  stats = {
    total: 0,
    totalAmount: 0,
    averageRate: 0,
    pendingClient: 0,
    pendingManager: 0
  };

  constructor(
    private decisionService: DecisionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApprovedDecisions();
  }

  loadApprovedDecisions(): void {
    this.isLoading = true;
    
    this.decisionService.getApprovedDecisions(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data && data.items) {
          this.approvedDecisions = data.items;
          this.filteredDecisions = [...this.approvedDecisions];
          this.totalItems = data.total || data.items.length;
        } else {
          this.approvedDecisions = this.getMockData();
          this.filteredDecisions = [...this.approvedDecisions];
          this.totalItems = this.approvedDecisions.length;
        }
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.approvedDecisions = this.getMockData();
        this.filteredDecisions = [...this.approvedDecisions];
        this.totalItems = this.approvedDecisions.length;
        this.calculateStats();
        this.snackBar.open('Utilisation des données de test', 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  private getMockData(): DecisionApproved[] {
    return [
      {
        id: '1',
        creditRequestId: 'CR-2026-001',
        clientName: 'Jean Dupont',
        amount: 25000,
        duration: 36,
        type: 'Prêt personnel',
        approvalDate: new Date('2026-07-20'),
        approvedBy: 'Marie Martin',
        amountApproved: 25000,
        interestRate: 4.5,
        monthlyPayment: 743.25,
        status: 'approved',
        observations: 'Dossier complet, bon profil de risque'
      },
      {
        id: '2',
        creditRequestId: 'CR-2026-002',
        clientName: 'Sophie Bernard',
        amount: 150000,
        duration: 120,
        type: 'Prêt immobilier',
        approvalDate: new Date('2026-07-15'),
        approvedBy: 'Jean Dupont',
        amountApproved: 145000,
        interestRate: 3.2,
        monthlyPayment: 1412.50,
        status: 'pending_client',
        observations: 'À envoyer au client pour signature'
      },
      {
        id: '3',
        creditRequestId: 'CR-2026-003',
        clientName: 'Pierre Durand',
        amount: 5000,
        duration: 12,
        type: 'Crédit renouvelable',
        approvalDate: new Date('2026-07-10'),
        approvedBy: 'Sophie Bernard',
        amountApproved: 5000,
        interestRate: 6.8,
        monthlyPayment: 432.15,
        status: 'approved',
        observations: 'Petit montant, approbation rapide'
      },
      {
        id: '4',
        creditRequestId: 'CR-2026-004',
        clientName: 'Marie Lambert',
        amount: 75000,
        duration: 60,
        type: 'Prêt auto',
        approvalDate: new Date('2026-07-05'),
        approvedBy: 'Pierre Durand',
        amountApproved: 72000,
        interestRate: 4.2,
        monthlyPayment: 1330.80,
        status: 'pending_manager',
        observations: 'En attente validation manager'
      },
      {
        id: '5',
        creditRequestId: 'CR-2026-005',
        clientName: 'Thomas Moreau',
        amount: 120000,
        duration: 84,
        type: 'Prêt travaux',
        approvalDate: new Date('2026-06-28'),
        approvedBy: 'Marie Martin',
        amountApproved: 115000,
        interestRate: 3.8,
        monthlyPayment: 1605.75,
        status: 'approved',
        observations: 'Bon dossier, recommandé'
      }
    ];
  }

  calculateStats(): void {
    this.stats.total = this.approvedDecisions.length;
    this.stats.totalAmount = this.approvedDecisions.reduce((acc, d) => acc + d.amountApproved, 0);
    this.stats.averageRate = this.approvedDecisions.reduce((acc, d) => acc + d.interestRate, 0) / this.approvedDecisions.length || 0;
    this.stats.pendingClient = this.approvedDecisions.filter(d => d.status === 'pending_client').length;
    this.stats.pendingManager = this.approvedDecisions.filter(d => d.status === 'pending_manager').length;
  }

  applyFilters(): void {
    this.filteredDecisions = this.approvedDecisions.filter(decision => {
      if (this.filters.search && !decision.clientName.toLowerCase().includes(this.filters.search.toLowerCase())) {
        return false;
      }
      if (this.filters.status && decision.status !== this.filters.status) {
        return false;
      }
      if (this.filters.dateFrom && new Date(decision.approvalDate) < new Date(this.filters.dateFrom)) {
        return false;
      }
      if (this.filters.dateTo && new Date(decision.approvalDate) > new Date(this.filters.dateTo)) {
        return false;
      }
      if (this.filters.minAmount && decision.amountApproved < this.filters.minAmount) {
        return false;
      }
      if (this.filters.maxAmount && decision.amountApproved > this.filters.maxAmount) {
        return false;
      }
      return true;
    });
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      status: '',
      dateFrom: null,
      dateTo: null,
      minAmount: null,
      maxAmount: null
    };
    this.filteredDecisions = [...this.approvedDecisions];
  }

  viewDetails(decision: DecisionApproved): void {
    this.router.navigate(['/credit-requests', decision.id]);
  }

  generateContract(decision: DecisionApproved): void {
    this.decisionService.generateContract(decision.id).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrat_${decision.creditRequestId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Contrat généré avec succès', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Erreur lors de la génération du contrat', 'Fermer', { duration: 3000 });
      }
    });
  }

  sendToClient(decision: DecisionApproved): void {
    this.decisionService.sendToClient(decision.id).subscribe({
      next: () => {
        decision.status = 'pending_client';
        this.snackBar.open('Décision envoyée au client avec succès', 'Fermer', { duration: 3000 });
        this.calculateStats();
        this.applyFilters();
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'envoi au client', 'Fermer', { duration: 3000 });
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'approved': '✅ Approuvé',
      'pending_client': '⏳ En attente client',
      'pending_manager': '👤 En attente manager'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'approved': return 'primary';
      case 'pending_client': return 'accent';
      case 'pending_manager': return 'warn';
      default: return '';
    }
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#dc3545', '#e74c3c', '#c0392b', '#f39c12',
      '#e67e22', '#d35400', '#c0392b', '#a93226',
      '#922b21', '#7b241c', '#641e16', '#4a1a12'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadApprovedDecisions();
  }
}
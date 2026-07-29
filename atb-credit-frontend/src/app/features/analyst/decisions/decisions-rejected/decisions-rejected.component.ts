// src/app/features/analyst/decisions/decisions-rejected/decisions-rejected.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DecisionService } from '@core/services/decision.service';
import { ReviewRejectedDialogComponent } from '../dialogs/review-rejected-dialog.component';
import { AnalystNotesDialogComponent } from '../dialogs/analyst-notes-dialog.component';

export interface DecisionRejected {
  id: string;
  creditRequestId: string;
  clientName: string;
  amount: number;
  duration: number;
  type: string;
  rejectionDate: Date;
  rejectedBy: string;
  reason: string;
  riskScore: number;
  canAppeal: boolean;
  appealDeadline: Date;
  notes: string;
}

@Component({
  selector: 'app-decisions-rejected',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatPaginatorModule,
    FormsModule,
    ReviewRejectedDialogComponent,
    AnalystNotesDialogComponent
  ],
  templateUrl: './decisions-rejected.component.html',
  styleUrls: ['./decisions-rejected.component.css']
})
export class DecisionsRejectedComponent implements OnInit {
  rejectedDecisions: DecisionRejected[] = [];
  filteredDecisions: DecisionRejected[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 6;
  currentPage = 0;

  filters = {
    search: '',
    reason: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null
  };

  stats = {
    total: 0,
    totalAmount: 0,
    canAppeal: 0,
    averageRisk: 0
  };

  constructor(
    private decisionService: DecisionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRejectedDecisions();
  }

  loadRejectedDecisions(): void {
    this.isLoading = true;
    
    this.decisionService.getRejectedDecisions(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data && data.items) {
          this.rejectedDecisions = data.items;
          this.filteredDecisions = [...this.rejectedDecisions];
          this.totalItems = data.total || data.items.length;
        } else {
          this.rejectedDecisions = this.getMockData();
          this.filteredDecisions = [...this.rejectedDecisions];
          this.totalItems = this.rejectedDecisions.length;
        }
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.rejectedDecisions = this.getMockData();
        this.filteredDecisions = [...this.rejectedDecisions];
        this.totalItems = this.rejectedDecisions.length;
        this.calculateStats();
        this.snackBar.open('Utilisation des données de test', 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  private getMockData(): DecisionRejected[] {
    return [
      {
        id: '1',
        creditRequestId: 'CR-2026-001',
        clientName: 'Jean Dupont',
        amount: 25000,
        duration: 36,
        type: 'Prêt personnel',
        rejectionDate: new Date('2026-07-25'),
        rejectedBy: 'Marie Martin',
        reason: 'risk_too_high',
        riskScore: 25,
        canAppeal: true,
        appealDeadline: new Date('2026-08-25'),
        notes: 'Score de risque trop élevé pour ce montant'
      },
      {
        id: '2',
        creditRequestId: 'CR-2026-002',
        clientName: 'Sophie Bernard',
        amount: 150000,
        duration: 120,
        type: 'Prêt immobilier',
        rejectionDate: new Date('2026-07-20'),
        rejectedBy: 'Jean Dupont',
        reason: 'insufficient_income',
        riskScore: 35,
        canAppeal: true,
        appealDeadline: new Date('2026-08-20'),
        notes: 'Revenus insuffisants pour le montant demandé'
      },
      {
        id: '3',
        creditRequestId: 'CR-2026-003',
        clientName: 'Pierre Durand',
        amount: 5000,
        duration: 12,
        type: 'Crédit renouvelable',
        rejectionDate: new Date('2026-07-15'),
        rejectedBy: 'Sophie Bernard',
        reason: 'document_missing',
        riskScore: 50,
        canAppeal: false,
        appealDeadline: new Date('2026-08-15'),
        notes: 'Documents manquants, dossier incomplet'
      },
      {
        id: '4',
        creditRequestId: 'CR-2026-004',
        clientName: 'Marie Lambert',
        amount: 75000,
        duration: 60,
        type: 'Prêt auto',
        rejectionDate: new Date('2026-07-10'),
        rejectedBy: 'Pierre Durand',
        reason: 'debt_ratio',
        riskScore: 30,
        canAppeal: true,
        appealDeadline: new Date('2026-08-10'),
        notes: 'Taux d\'endettement trop élevé'
      },
      {
        id: '5',
        creditRequestId: 'CR-2026-005',
        clientName: 'Thomas Moreau',
        amount: 120000,
        duration: 84,
        type: 'Prêt travaux',
        rejectionDate: new Date('2026-07-05'),
        rejectedBy: 'Marie Martin',
        reason: 'fraud_suspicion',
        riskScore: 15,
        canAppeal: false,
        appealDeadline: new Date('2026-08-05'),
        notes: 'Suspicion de fraude sur les documents fournis'
      }
    ];
  }

  calculateStats(): void {
    this.stats.total = this.rejectedDecisions.length;
    this.stats.totalAmount = this.rejectedDecisions.reduce((acc, d) => acc + d.amount, 0);
    this.stats.canAppeal = this.rejectedDecisions.filter(d => d.canAppeal).length;
    this.stats.averageRisk = this.rejectedDecisions.reduce((acc, d) => acc + d.riskScore, 0) / this.rejectedDecisions.length || 0;
  }

  applyFilters(): void {
    this.filteredDecisions = this.rejectedDecisions.filter(decision => {
      if (this.filters.search && !decision.clientName.toLowerCase().includes(this.filters.search.toLowerCase())) {
        return false;
      }
      if (this.filters.reason && decision.reason !== this.filters.reason) {
        return false;
      }
      if (this.filters.dateFrom && new Date(decision.rejectionDate) < new Date(this.filters.dateFrom)) {
        return false;
      }
      if (this.filters.dateTo && new Date(decision.rejectionDate) > new Date(this.filters.dateTo)) {
        return false;
      }
      return true;
    });
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      reason: '',
      dateFrom: null,
      dateTo: null
    };
    this.filteredDecisions = [...this.rejectedDecisions];
  }

  viewDetails(decision: DecisionRejected): void {
    this.router.navigate(['/credit-requests', decision.id]);
  }

  viewAnalystNotes(decision: DecisionRejected): void {
    this.dialog.open(AnalystNotesDialogComponent, {
      width: '500px',
      data: { notes: decision.notes }
    });
  }

  reviewDecision(decision: DecisionRejected): void {
    const dialogRef = this.dialog.open(ReviewRejectedDialogComponent, {
      width: '600px',
      data: { 
        decision: decision,
        title: 'Réviser la décision de refus'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRejectedDecisions();
        this.snackBar.open('Décision révisée avec succès', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  initiateAppeal(decision: DecisionRejected): void {
    this.decisionService.initiateAppeal(decision.id).subscribe({
      next: () => {
        decision.canAppeal = false;
        this.snackBar.open('Appel déclenché avec succès', 'Fermer', {
          duration: 3000
        });
        this.calculateStats();
        this.applyFilters();
      },
      error: () => {
        this.snackBar.open('Erreur lors du déclenchement de l\'appel', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  getReasonLabel(reason: string): string {
    const labels: { [key: string]: string } = {
      'risk_too_high': '🔴 Risque trop élevé',
      'insufficient_income': '💰 Revenus insuffisants',
      'poor_credit_history': '📉 Mauvais historique',
      'debt_ratio': '📊 Taux d\'endettement',
      'document_missing': '📄 Documents manquants',
      'fraud_suspicion': '🚨 Suspicion de fraude',
      'policy_violation': '⚠️ Violation de politique'
    };
    return labels[reason] || reason;
  }

  getReasonColor(reason: string): string {
    const colors: { [key: string]: string } = {
      'risk_too_high': 'warn',
      'insufficient_income': 'warn',
      'poor_credit_history': 'warn',
      'debt_ratio': 'accent',
      'document_missing': 'primary',
      'fraud_suspicion': 'warn',
      'policy_violation': 'accent'
    };
    return colors[reason] || 'primary';
  }

  getRiskColor(score: number): string {
    if (score >= 70) return '#4caf50';
    if (score >= 40) return '#ff9800';
    return '#f44336';
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
    this.loadRejectedDecisions();
  }
}
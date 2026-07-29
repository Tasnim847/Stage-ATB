// src/app/features/analyst/decisions/decisions-pending/decisions-pending.component.ts
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
import { MatMenuModule } from '@angular/material/menu';
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
import { ReassignAnalystDialogComponent } from '../dialogs/reassign-analyst-dialog.component';

export interface DecisionPending {
  id: string;
  creditRequestId: string;
  clientName: string;
  amount: number;
  duration: number;
  type: string;
  submissionDate: Date;
  riskScore: number;
  priority: 'high' | 'medium' | 'low';
  documents: number;
  analysisProgress: number;
  assignedAnalyst: string;
  dueDate: Date;
}

@Component({
  selector: 'app-decisions-pending',
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
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatPaginatorModule,
    FormsModule,
    ReassignAnalystDialogComponent
  ],
  templateUrl: './decisions-pending.component.html',
  styleUrls: ['./decisions-pending.component.css']
})
export class DecisionsPendingComponent implements OnInit {
  pendingDecisions: DecisionPending[] = [];
  filteredDecisions: DecisionPending[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 6;
  currentPage = 0;

  filters = {
    search: '',
    priority: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null
  };

  stats = {
    total: 0,
    highPriority: 0,
    overdue: 0,
    averageRisk: 0
  };

  constructor(
    private decisionService: DecisionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPendingDecisions();
  }

  loadPendingDecisions(): void {
    this.isLoading = true;
    
    this.decisionService.getPendingDecisions(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data && data.items) {
          this.pendingDecisions = data.items;
          this.filteredDecisions = [...this.pendingDecisions];
          this.totalItems = data.total || data.items.length;
        } else {
          this.pendingDecisions = this.getMockData();
          this.filteredDecisions = [...this.pendingDecisions];
          this.totalItems = this.pendingDecisions.length;
        }
        this.calculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.pendingDecisions = this.getMockData();
        this.filteredDecisions = [...this.pendingDecisions];
        this.totalItems = this.pendingDecisions.length;
        this.calculateStats();
        this.snackBar.open('Utilisation des données de test', 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  private getMockData(): DecisionPending[] {
    return [
      {
        id: '1',
        creditRequestId: 'CR-2026-001',
        clientName: 'Jean Dupont',
        amount: 25000,
        duration: 36,
        type: 'Prêt personnel',
        submissionDate: new Date('2026-07-25'),
        riskScore: 65,
        priority: 'high',
        documents: 5,
        analysisProgress: 80,
        assignedAnalyst: 'Marie Martin',
        dueDate: new Date('2026-08-05')
      },
      {
        id: '2',
        creditRequestId: 'CR-2026-002',
        clientName: 'Sophie Bernard',
        amount: 150000,
        duration: 120,
        type: 'Prêt immobilier',
        submissionDate: new Date('2026-07-20'),
        riskScore: 45,
        priority: 'medium',
        documents: 8,
        analysisProgress: 30,
        assignedAnalyst: 'Jean Dupont',
        dueDate: new Date('2026-08-10')
      },
      {
        id: '3',
        creditRequestId: 'CR-2026-003',
        clientName: 'Pierre Durand',
        amount: 5000,
        duration: 12,
        type: 'Crédit renouvelable',
        submissionDate: new Date('2026-07-15'),
        riskScore: 85,
        priority: 'low',
        documents: 3,
        analysisProgress: 100,
        assignedAnalyst: 'Sophie Bernard',
        dueDate: new Date('2026-07-30')
      },
      {
        id: '4',
        creditRequestId: 'CR-2026-004',
        clientName: 'Marie Lambert',
        amount: 75000,
        duration: 60,
        type: 'Prêt auto',
        submissionDate: new Date('2026-07-10'),
        riskScore: 55,
        priority: 'high',
        documents: 6,
        analysisProgress: 60,
        assignedAnalyst: 'Pierre Durand',
        dueDate: new Date('2026-08-01')
      },
      {
        id: '5',
        creditRequestId: 'CR-2026-005',
        clientName: 'Thomas Moreau',
        amount: 120000,
        duration: 84,
        type: 'Prêt travaux',
        submissionDate: new Date('2026-07-05'),
        riskScore: 35,
        priority: 'medium',
        documents: 7,
        analysisProgress: 20,
        assignedAnalyst: 'Marie Martin',
        dueDate: new Date('2026-08-15')
      }
    ];
  }

  calculateStats(): void {
    this.stats.total = this.pendingDecisions.length;
    this.stats.highPriority = this.pendingDecisions.filter(d => d.priority === 'high').length;
    this.stats.overdue = this.pendingDecisions.filter(d => this.isOverdue(d.dueDate)).length;
    this.stats.averageRisk = this.pendingDecisions.reduce((acc, d) => acc + d.riskScore, 0) / this.pendingDecisions.length || 0;
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  applyFilters(): void {
    this.filteredDecisions = this.pendingDecisions.filter(decision => {
      if (this.filters.search && !decision.clientName.toLowerCase().includes(this.filters.search.toLowerCase())) {
        return false;
      }
      if (this.filters.priority && decision.priority !== this.filters.priority) {
        return false;
      }
      if (this.filters.dateFrom && new Date(decision.submissionDate) < new Date(this.filters.dateFrom)) {
        return false;
      }
      if (this.filters.dateTo && new Date(decision.submissionDate) > new Date(this.filters.dateTo)) {
        return false;
      }
      return true;
    });
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      priority: '',
      dateFrom: null,
      dateTo: null
    };
    this.filteredDecisions = [...this.pendingDecisions];
  }

  analyzeDecision(decision: DecisionPending): void {
    this.router.navigate(['/decisions/analyze', decision.id]);
  }

  viewDetails(decision: DecisionPending): void {
    this.router.navigate(['/credit-requests', decision.creditRequestId]);
  }

  markAsPriority(decision: DecisionPending): void {
    this.decisionService.markAsPriority(decision.id).subscribe({
      next: () => {
        decision.priority = 'high';
        this.snackBar.open('Demande marquée comme prioritaire', 'Fermer', { duration: 2000 });
        this.calculateStats();
        this.applyFilters();
      },
      error: () => {
        decision.priority = 'high';
        this.snackBar.open('Demande marquée comme prioritaire (local)', 'Fermer', { duration: 2000 });
        this.calculateStats();
        this.applyFilters();
      }
    });
  }

  reassignAnalyst(decision: DecisionPending): void {
    const dialogRef = this.dialog.open(ReassignAnalystDialogComponent, {
      width: '400px',
      data: { decisionId: decision.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.decisionService.reassignDecision(decision.id, result).subscribe({
          next: () => {
            this.snackBar.open('Décision réassignée avec succès', 'Fermer', { duration: 3000 });
            this.loadPendingDecisions();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la réassignation', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  getPriorityLabel(priority: string): string {
    switch(priority) {
      case 'high': return '🔴 Haute';
      case 'medium': return '🟡 Moyenne';
      case 'low': return '🟢 Basse';
      default: return '';
    }
  }

  getPriorityChipColor(priority: string): string {
    switch(priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return '';
    }
  }

  getRiskColor(score: number): string {
    if (score >= 70) return '#4caf50';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  }

  getProgressColor(progress: number): string {
    if (progress >= 70) return 'primary';
    if (progress >= 40) return 'accent';
    return 'warn';
  }

  getDueDateColor(dueDate: Date): string {
    const now = new Date();
    const diff = new Date(dueDate).getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) return '#f44336';
    if (days < 2) return '#ff9800';
    return '#4caf50';
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
    this.loadPendingDecisions();
  }
}
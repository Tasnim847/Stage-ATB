// simulation-list/simulation-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { CreditSimulation } from '@core/models/credit-simulation.model';
import { CreditSimulationService } from '@core/services/credit-simulation.service';

@Component({
  selector: 'app-simulation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="simulations-container">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <h1>📊 Mes simulations</h1>
          <p class="subtitle">Gérez vos simulations de crédit</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createNewSimulation()">
            <mat-icon>add</mat-icon>
            Nouvelle simulation
          </button>
          <button mat-stroked-button color="warn" (click)="deleteAllMySimulations()">
            <mat-icon>delete_sweep</mat-icon>
            Tout supprimer
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid" *ngIf="simulations.length > 0">
        <div class="stat-card">
          <h3>{{ simulations.length }}</h3>
          <p>Total simulations</p>
        </div>
        <div class="stat-card">
          <h3>{{ getTotalAmount() | currency:'TND' }}</h3>
          <p>Montant total</p>
        </div>
        <div class="stat-card">
          <h3>{{ getAverageMonthlyPayment() | currency:'TND' }}</h3>
          <p>Mensualité moyenne</p>
        </div>
      </div>

      <!-- Liste des simulations -->
      <div class="simulations-grid" *ngIf="!isLoading">
        <mat-card *ngFor="let sim of simulations" class="simulation-card">
          <mat-card-header>
            <div class="card-header-content">
              <div class="card-title">
                <h3>{{ sim.simulationName || 'Simulation' }}</h3>
                <span class="badge" [class]="getRiskClass(sim)">
                  {{ getRiskLevel(sim) }}
                </span>
              </div>
              <div class="card-date">
                {{ sim.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="card-details">
              <div class="detail-item">
                <span class="label">Montant</span>
                <span class="value">{{ sim.amount | currency:'TND' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Durée</span>
                <span class="value">{{ sim.durationMonths }} mois</span>
              </div>
              <div class="detail-item">
                <span class="label">Taux</span>
                <span class="value">{{ sim.interestRate }}%</span>
              </div>
              <div class="detail-item">
                <span class="label">Mensualité</span>
                <span class="value">{{ sim.monthlyPayment | currency:'TND' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total à payer</span>
                <span class="value">{{ sim.totalPayment | currency:'TND' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Score</span>
                <span class="value" [class]="getScoreClass(sim)">
                  {{ sim.solvencyScore || 0 }}/100
                </span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-stroked-button color="primary" (click)="viewSimulation(sim.id)">
              <mat-icon>visibility</mat-icon>
              Voir
            </button>
            <button mat-stroked-button color="accent" (click)="editSimulation(sim)">
              <mat-icon>edit</mat-icon>
              Modifier
            </button>
            <button mat-stroked-button color="primary" (click)="compareSimulation(sim.id)">
              <mat-icon>compare_arrows</mat-icon>
              Comparer
            </button>
            <button mat-stroked-button color="warn" (click)="deleteSimulation(sim.id)">
              <mat-icon>delete</mat-icon>
              Supprimer
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Empty state -->
        <div class="empty-state" *ngIf="simulations.length === 0">
          <mat-icon>analytics</mat-icon>
          <h3>Aucune simulation</h3>
          <p>Vous n'avez pas encore de simulation de crédit.</p>
          <button mat-raised-button color="primary" (click)="createNewSimulation()">
            <mat-icon>add</mat-icon>
            Créer une simulation
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-spinner" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Chargement de vos simulations...</p>
      </div>
    </div>
  `,
  styles: [`
    .simulations-container { padding: 20px; max-width: 1200px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
    .header-left h1 { margin: 0; font-size: 24px; }
    .header-left .subtitle { margin: 4px 0 0; color: #666; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-card h3 { margin: 0; font-size: 24px; color: #1a237e; }
    .stat-card p { margin: 4px 0 0; color: #666; }
    
    .simulations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
    .simulation-card { transition: transform 0.2s; }
    .simulation-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    
    .card-header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 8px; }
    .card-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .card-title h3 { margin: 0; font-size: 16px; }
    .badge { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .badge.low { background: #e8f5e9; color: #2e7d32; }
    .badge.medium { background: #fff3e0; color: #e65100; }
    .badge.high { background: #fce4ec; color: #c62828; }
    .card-date { font-size: 12px; color: #888; }
    
    .card-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
    .detail-item { text-align: center; padding: 4px; }
    .detail-item .label { display: block; font-size: 11px; color: #888; }
    .detail-item .value { display: block; font-size: 14px; font-weight: 500; color: #333; }
    
    mat-card-actions { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 16px; }
    mat-card-actions button { font-size: 12px; }
    
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .empty-state h3 { margin: 16px 0 8px; }
    .empty-state p { color: #666; margin-bottom: 16px; }
    
    .loading-spinner { text-align: center; padding: 40px; }
    .loading-spinner p { margin-top: 12px; color: #666; }
  `]
})
export class SimulationListComponent implements OnInit {
  private simulationService = inject(CreditSimulationService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  simulations: CreditSimulation[] = [];
  isLoading = true;
  selectedForComparison: string[] = [];

  ngOnInit(): void {
    this.loadSimulations();
  }

  loadSimulations(): void {
    this.isLoading = true;
    this.simulationService.getMySimulations().subscribe({
      next: (simulations) => {
        this.simulations = simulations;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des simulations', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  getTotalAmount(): number {
    return this.simulations.reduce((sum, sim) => sum + sim.amount, 0);
  }

  getAverageMonthlyPayment(): number {
    if (this.simulations.length === 0) return 0;
    const sum = this.simulations.reduce((sum, sim) => sum + sim.monthlyPayment, 0);
    return sum / this.simulations.length;
  }

  getRiskClass(sim: CreditSimulation): string {
    const debtRatio = sim.debtRatio || 0;
    if (debtRatio < 35) return 'low';
    if (debtRatio < 45) return 'medium';
    return 'high';
  }

  getRiskLevel(sim: CreditSimulation): string {
    const debtRatio = sim.debtRatio || 0;
    if (debtRatio < 35) return '✅ Faible risque';
    if (debtRatio < 45) return '⚠️ Risque modéré';
    return '❌ Risque élevé';
  }

  getScoreClass(sim: CreditSimulation): string {
    const score = sim.solvencyScore || 0;
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'bon';
    if (score >= 40) return 'moyen';
    return 'faible';
  }

  viewSimulation(id: string): void {
    this.router.navigate(['/simulation-result', id]);
  }

  editSimulation(simulation: CreditSimulation): void {
    this.router.navigate(['/simulation-edit', simulation.id]);
  }

  compareSimulation(id: string): void {
    const index = this.selectedForComparison.indexOf(id);
    if (index === -1) {
      this.selectedForComparison.push(id);
      this.toastr.info('Simulation ajoutée à la comparaison');
    } else {
      this.selectedForComparison.splice(index, 1);
      this.toastr.info('Simulation retirée de la comparaison');
    }

    if (this.selectedForComparison.length >= 2) {
      this.simulationService.compareSimulations(this.selectedForComparison).subscribe({
        next: (result) => {
          this.toastr.info('Comparaison terminée', 'Résultat');
          console.log(result);
          this.selectedForComparison = [];
        },
        error: (error) => {
          this.toastr.error('Erreur lors de la comparaison', 'Erreur');
        }
      });
    }
  }

  deleteSimulation(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette simulation ?')) {
      return;
    }

    this.simulationService.deleteSimulation(id).subscribe({
      next: () => {
        this.toastr.success('Simulation supprimée avec succès', 'Succès');
        this.loadSimulations();
      },
      error: (error) => {
        this.toastr.error('Erreur lors de la suppression', 'Erreur');
      }
    });
  }

  deleteAllMySimulations(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES vos simulations ?')) {
      return;
    }

    this.simulationService.deleteMySimulations().subscribe({
      next: (count) => {
        this.toastr.success(`${count} simulations supprimées avec succès`, 'Succès');
        this.loadSimulations();
      },
      error: (error) => {
        this.toastr.error('Erreur lors de la suppression', 'Erreur');
      }
    });
  }

  createNewSimulation(): void {
    this.router.navigate(['/simulation-new']);
  }
}
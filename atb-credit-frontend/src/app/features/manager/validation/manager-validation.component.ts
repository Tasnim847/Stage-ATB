// src/app/features/manager/validation/manager-validation.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ManagerValidationService } from '@core/services/manager-validation.service';
import { ValidationSummaryDTO, CreditResponseDTO } from '@core/models';
import { ManagerValidationDialogComponent } from './components/manager-validation-dialog.component';

@Component({
  selector: 'app-manager-validation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './manager-validation.component.html',
  styleUrls: ['./manager-validation.component.css']
})
export class ManagerValidationComponent implements OnInit {
  private validationService = inject(ManagerValidationService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Données
  pendingValidations: ValidationSummaryDTO[] = [];
  highAmountValidations: ValidationSummaryDTO[] = [];
  highRiskValidations: ValidationSummaryDTO[] = [];
  validationHistory: CreditResponseDTO[] = [];
  stats: any = {};
  
  // États
  loading = false;
  selectedTab = 0;
  
  // Colonnes des tableaux
  pendingColumns = ['priority', 'requestNumber', 'client', 'amount', 'creditType', 'riskLevel', 'analyst', 'daysPending', 'actions'];
  highAmountColumns = ['requestNumber', 'client', 'amount', 'creditType', 'analyst', 'date', 'actions'];
  highRiskColumns = ['requestNumber', 'client', 'riskScore', 'riskLevel', 'analyst', 'date', 'actions'];
  historyColumns = ['requestNumber', 'client', 'amount', 'decision', 'manager', 'date', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    Promise.all([
      this.loadPendingValidations(),
      this.loadHighAmountValidations(),
      this.loadHighRiskValidations(),
      this.loadStats()
    ]).finally(() => {
      this.loading = false;
    });
  }

  private loadPendingValidations(): Promise<void> {
    return new Promise((resolve) => {
      this.validationService.getPendingValidations().subscribe({
        next: (data) => {
          this.pendingValidations = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur chargement validations en attente:', error);
          resolve();
        }
      });
    });
  }

  private loadHighAmountValidations(): Promise<void> {
    return new Promise((resolve) => {
      this.validationService.getHighAmountValidations().subscribe({
        next: (data) => {
          this.highAmountValidations = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur chargement crédits élevés:', error);
          resolve();
        }
      });
    });
  }

  private loadHighRiskValidations(): Promise<void> {
    return new Promise((resolve) => {
      this.validationService.getHighRiskValidations().subscribe({
        next: (data) => {
          this.highRiskValidations = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur chargement crédits haut risque:', error);
          resolve();
        }
      });
    });
  }

  private loadStats(): Promise<void> {
    return new Promise((resolve) => {
      this.validationService.getValidationStats().subscribe({
        next: (data) => {
          this.stats = data;
          resolve();
        },
        error: (error) => {
          console.error('Erreur chargement statistiques:', error);
          resolve();
        }
      });
    });
  }

  // ============================================
  // ACTIONS
  // ============================================

  approveValidation(validation: ValidationSummaryDTO): void {
    const dialogRef = this.dialog.open(ManagerValidationDialogComponent, {
      width: '600px',
      data: { 
        validation: validation, 
        action: 'APPROVE' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.loading = true;
        this.validationService.approveHighAmountCredit(
          validation.id, 
          result.comments
        ).subscribe({
          next: (response) => {
            this.snackBar.open(`✅ Crédit ${response.requestNumber} approuvé avec succès`, 'Fermer', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur approbation:', error);
            this.snackBar.open('❌ Erreur lors de l\'approbation', 'Fermer', {
              duration: 3000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  rejectValidation(validation: ValidationSummaryDTO): void {
    const dialogRef = this.dialog.open(ManagerValidationDialogComponent, {
      width: '600px',
      data: { 
        validation: validation, 
        action: 'REJECT' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.loading = true;
        this.validationService.rejectDecision(
          validation.id,
          result.rejectReason || 'Rejeté par le manager',
          result.comments
        ).subscribe({
          next: (response) => {
            this.snackBar.open(`❌ Crédit ${response.requestNumber} rejeté`, 'Fermer', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur rejet:', error);
            this.snackBar.open('❌ Erreur lors du rejet', 'Fermer', {
              duration: 3000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  returnToAnalyst(validation: ValidationSummaryDTO): void {
    const dialogRef = this.dialog.open(ManagerValidationDialogComponent, {
      width: '600px',
      data: { 
        validation: validation, 
        action: 'RETURN' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.loading = true;
        this.validationService.returnToAnalyst({
          creditRequestId: validation.id,
          reason: result.comments || 'Retourné par le manager',
          additionalInstructions: result.additionalInstructions,
          requiredAction: result.requiredAction || 'REANALYZE_FINANCIALS'
        }).subscribe({
          next: (response) => {
            this.snackBar.open(`🔄 Crédit ${response.requestNumber} retourné à l'analyste`, 'Fermer', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Erreur retour:', error);
            this.snackBar.open('❌ Erreur lors du retour', 'Fermer', {
              duration: 3000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  viewDetails(id: string): void {
    this.loading = true;
    this.validationService.getValidationDetails(id).subscribe({
      next: (data) => {
        this.loading = false;
        // Ouvrir un dialogue de détails ou naviguer
        console.log('Détails de la validation:', data);
        this.snackBar.open('📋 Détails chargés avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur chargement détails:', error);
        this.loading = false;
        this.snackBar.open('❌ Erreur lors du chargement des détails', 'Fermer', { duration: 3000 });
      }
    });
  }

  generateReport(): void {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    this.loading = true;
    this.validationService.generateValidationReport(
      monthAgo.toISOString(),
      today.toISOString()
    ).subscribe({
      next: (report) => {
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-validation-${today.toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.snackBar.open('📊 Rapport généré avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erreur génération rapport:', error);
        this.loading = false;
        this.snackBar.open('❌ Erreur lors de la génération du rapport', 'Fermer', { duration: 3000 });
      }
    });
  }

  refresh(): void {
    this.loadData();
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'CRITICAL': '🔴 Critique',
      'HIGH': '🟠 Élevé',
      'NORMAL': '🟢 Normal'
    };
    return labels[priority] || priority;
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'CRITICAL': 'warn',
      'HIGH': 'accent',
      'NORMAL': 'primary'
    };
    return colors[priority] || 'default';
  }

  getRiskLevelColor(riskLevel: string): string {
    const colors: { [key: string]: string } = {
      'LOW': 'primary',
      'MODERATE': 'accent',
      'HIGH': 'warn',
      'CRITICAL': 'warn'
    };
    return colors[riskLevel] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'APPROVED': '✅ Approuvé',
      'REJECTED': '❌ Rejeté',
      'PENDING': '⏳ En attente',
      'RETURNED': '🔄 Retourné'
    };
    return labels[status] || status;
  }
}
// src/app/features/manager/portfolio/portfolio-detail-dialog/portfolio-detail-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PortfolioService } from '@core/services/portfolio.service';
import { ManagerService } from '@core/services/manager.service';

export interface DialogData {
  creditId: string;
}

@Component({
  selector: 'app-portfolio-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './portfolio-detail-dialog.component.html',
  styleUrls: ['./portfolio-detail-dialog.component.css']
})
export class PortfolioDetailDialogComponent implements OnInit {
  isLoading = true;
  creditData: any = null;

  constructor(
    private dialogRef: MatDialogRef<PortfolioDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private portfolioService: PortfolioService,
    private managerService: ManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCreditDetails();
  }

  loadCreditDetails(): void {
    this.isLoading = true;
    // ✅ Passer l'ID comme string (le service accepte string | number)
    this.portfolioService.getCreditDetails(this.data.creditId).subscribe({
      next: (data) => {
        this.creditData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement détails crédit:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des détails', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  generateReport(): void {
    this.snackBar.open('Génération du rapport en cours...', 'En cours', {
      duration: 3000
    });

    this.managerService.generateStrategyReport().subscribe({
      next: () => {
        this.snackBar.open('Rapport généré avec succès', 'Télécharger', {
          duration: 5000
        });
      },
      error: (error) => {
        console.error('Erreur génération rapport:', error);
        this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getFormattedDate(date: string | null | undefined): string {
    if (!date) return 'En attente';
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return 'En attente';
      const day = String(parsedDate.getDate()).padStart(2, '0');
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const year = parsedDate.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'En attente';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'APPROVED': 'success',
      'REJECTED': 'danger',
      'PENDING_ANALYSIS': 'warning',
      'UNDER_REVIEW': 'primary',
      'DRAFT': 'default',
      'CANCELLED': 'default',
      'en_cours': 'primary',
      'termine': 'success',
      'impaye': 'danger',
      'en_retard': 'warning',
      'approuve': 'success',
      'refuse': 'danger',
      'en_attente': 'warning'
    };
    return colors[status] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'APPROVED': 'Approuvé',
      'REJECTED': 'Refusé',
      'PENDING_ANALYSIS': 'En attente',
      'UNDER_REVIEW': 'En révision',
      'DRAFT': 'Brouillon',
      'CANCELLED': 'Annulé',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'impaye': 'Impayé',
      'en_retard': 'En retard',
      'approuve': 'Approuvé',
      'refuse': 'Refusé',
      'en_attente': 'En attente'
    };
    return labels[status] || status;
  }

  getRiskLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'faible': 'success',
      'moyen': 'warning',
      'élevé': 'danger',
      'critique': 'danger',
      'low': 'success',
      'medium': 'warning',
      'high': 'danger'
    };
    return colors[level] || 'default';
  }
}
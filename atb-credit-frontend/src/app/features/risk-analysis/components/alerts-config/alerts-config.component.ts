import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // ✅ AJOUTER CETTE IMPORTATION

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { AlertConfig, AlertEvent, AlertEventLabels, AlertPriority } from '@app/core/models';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-alerts-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule // ✅ AJOUTER ICI
  ],
  templateUrl: './alerts-config.component.html',
  styleUrls: ['./alerts-config.component.css']
})
export class AlertsConfigComponent implements OnInit {
  alerts: AlertConfig[] = [];
  loading = false;

  constructor(
    private riskService: RiskAnalysisService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.riskService.getAlertConfigs().subscribe({
      next: (data) => {
        this.alerts = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des alertes', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getAlertEventLabel(event: AlertEvent): string {
    return AlertEventLabels[event] || event;
  }

  getPriorityColor(priority: AlertPriority): string {
    const colors: Record<AlertPriority, string> = {
      [AlertPriority.LOW]: '#6b7a8f',
      [AlertPriority.MEDIUM]: '#FFC107',
      [AlertPriority.HIGH]: '#FF9800',
      [AlertPriority.CRITICAL]: '#e74c3c'
    };
    return colors[priority] || '#6b7a8f';
  }

  getPriorityLabel(priority: AlertPriority): string {
    const labels: Record<AlertPriority, string> = {
      [AlertPriority.LOW]: 'Basse',
      [AlertPriority.MEDIUM]: 'Moyenne',
      [AlertPriority.HIGH]: 'Haute',
      [AlertPriority.CRITICAL]: 'Critique'
    };
    return labels[priority] || priority;
  }

  getRecipientLabel(recipient: string): string {
    const labels: Record<string, string> = {
      'ANALYSTE': 'Analyste',
      'RESPONSABLE': 'Responsable',
      'ADMIN': 'Administrateur'
    };
    return labels[recipient] || recipient;
  }

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'EMAIL': 'Email',
      'SMS': 'SMS',
      'PUSH': 'Push',
      'TABLEAU_DE_BORD': 'Tableau de bord'
    };
    return labels[method] || method;
  }

  getMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      'EMAIL': 'email',
      'SMS': 'sms',
      'PUSH': 'notifications',
      'TABLEAU_DE_BORD': 'dashboard'
    };
    return icons[method] || 'notifications';
  }

  addAlert(): void {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.riskService.addAlertConfig(result).subscribe({
          next: (newAlert) => {
            this.alerts.push(newAlert);
            this.loading = false;
            this.snackBar.open('Alerte ajoutée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open(error.message || 'Erreur lors de l\'ajout', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  editAlert(alert: AlertConfig): void {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '600px',
      data: { alert }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.riskService.updateAlertConfig(alert.id, result).subscribe({
          next: (updatedAlert) => {
            const index = this.alerts.findIndex(a => a.id === alert.id);
            if (index !== -1) {
              this.alerts[index] = updatedAlert;
            }
            this.loading = false;
            this.snackBar.open('Alerte mise à jour avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open(error.message || 'Erreur lors de la mise à jour', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  toggleAlert(alert: AlertConfig): void {
    const newStatus = !alert.isActive;
    this.riskService.toggleAlertConfig(alert.id, newStatus).subscribe({
      next: (updatedAlert) => {
        alert.isActive = updatedAlert.isActive;
        this.snackBar.open(
          `Alerte ${updatedAlert.isActive ? 'activée' : 'désactivée'} avec succès`,
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: () => {
        alert.isActive = !newStatus;
        this.snackBar.open('Erreur lors du basculement', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteAlert(alert: AlertConfig): void {
    const eventLabel = this.getAlertEventLabel(alert.event);
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'alerte "${eventLabel}" ?`)) {
      this.loading = true;
      this.riskService.deleteAlertConfig(alert.id).subscribe({
        next: () => {
          this.alerts = this.alerts.filter(a => a.id !== alert.id);
          this.loading = false;
          this.snackBar.open('Alerte supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { AlertConfig, AlertEvent, AlertEventLabels, AlertPriority, AlertRecipient, NotificationMethod } from '@app/core/models';

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
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './alerts-config.component.html',
  styleUrls: ['./alerts-config.component.css']
})
export class AlertsConfigComponent implements OnInit {
  alerts: AlertConfig[] = [];

  constructor(private riskService: RiskAnalysisService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.riskService.getAlertConfigs().subscribe({
      next: (data) => this.alerts = data,
      error: () => {
        this.alerts = [
          {
            id: '1',
            event: AlertEvent.HIGH_SCORE,
            description: 'Envoyer une alerte au responsable quand le score dépasse 80',
            recipients: [AlertRecipient.MANAGER],
            isActive: true,
            priority: AlertPriority.HIGH,
            notificationMethods: [NotificationMethod.EMAIL, NotificationMethod.DASHBOARD]
          },
          {
            id: '2',
            event: AlertEvent.FRAUD_DETECTED,
            description: 'Alerte immédiate en cas de détection de fraude',
            recipients: [AlertRecipient.ADMIN, AlertRecipient.MANAGER],
            isActive: true,
            priority: AlertPriority.CRITICAL,
            notificationMethods: [NotificationMethod.EMAIL, NotificationMethod.SMS, NotificationMethod.PUSH]
          },
          {
            id: '3',
            event: AlertEvent.DOCUMENT_FALSIFIED,
            description: 'Notifier l\'analyste en cas de document falsifié',
            recipients: [AlertRecipient.ANALYST],
            isActive: true,
            priority: AlertPriority.HIGH,
            notificationMethods: [NotificationMethod.EMAIL, NotificationMethod.DASHBOARD]
          }
        ];
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

  addAlert(): void {
    // TODO: Ouvrir dialogue d'ajout
  }

  editAlert(alert: AlertConfig): void {
    // TODO: Ouvrir dialogue de modification
  }

  toggleAlert(alert: AlertConfig): void {
    this.riskService.toggleAlertConfig(alert.id, alert.isActive).subscribe({
      next: () => {},
      error: () => alert.isActive = !alert.isActive
    });
  }

  deleteAlert(alert: AlertConfig): void {
    if (confirm(`Supprimer l'alerte "${this.getAlertEventLabel(alert.event)}" ?`)) {
      this.riskService.deleteAlertConfig(alert.id).subscribe({
        next: () => {
          this.alerts = this.alerts.filter(a => a.id !== alert.id);
        }
      });
    }
  }
}
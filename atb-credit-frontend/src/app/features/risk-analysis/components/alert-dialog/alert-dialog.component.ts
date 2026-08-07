import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { 
  AlertConfig, 
  AlertEvent, 
  AlertEventLabels, 
  AlertPriority, 
  AlertRecipient, 
  NotificationMethod 
} from '@app/core/models';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnInit {
  alertForm!: FormGroup;
  isEditMode = false;

  // Options disponibles
  availableEvents = Object.entries(AlertEventLabels).map(([value, label]) => ({
    value,
    label
  }));

  availableRecipients = [
    { value: AlertRecipient.ANALYST, label: 'Analyste' },
    { value: AlertRecipient.MANAGER, label: 'Responsable' },
    { value: AlertRecipient.ADMIN, label: 'Administrateur' }
  ];

  availablePriorities = [
    { value: AlertPriority.LOW, label: 'Basse' },
    { value: AlertPriority.MEDIUM, label: 'Moyenne' },
    { value: AlertPriority.HIGH, label: 'Haute' },
    { value: AlertPriority.CRITICAL, label: 'Critique' }
  ];

  availableMethods = [
    { value: NotificationMethod.EMAIL, label: 'Email', icon: 'email' },
    { value: NotificationMethod.SMS, label: 'SMS', icon: 'sms' },
    { value: NotificationMethod.PUSH, label: 'Push', icon: 'notifications' },
    { value: NotificationMethod.DASHBOARD, label: 'Tableau de bord', icon: 'dashboard' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AlertDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { alert?: AlertConfig }
  ) {
    this.isEditMode = !!data?.alert;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode && this.data.alert) {
      this.patchForm(this.data.alert);
    }
  }

  private initForm(): void {
    this.alertForm = this.fb.group({
      event: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      recipients: [[], [Validators.required, Validators.minLength(1)]],
      priority: ['', [Validators.required]],
      notificationMethods: [[], [Validators.required, Validators.minLength(1)]],
      isActive: [true]
    });
  }

  private patchForm(alert: AlertConfig): void {
    this.alertForm.patchValue({
      event: alert.event,
      description: alert.description,
      recipients: alert.recipients || [],
      priority: alert.priority,
      notificationMethods: alert.notificationMethods || [],
      isActive: alert.isActive
    });
  }

  onSubmit(): void {
    if (this.alertForm.invalid) {
      this.markFormGroupTouched(this.alertForm);
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.alertForm.value;
    this.dialogRef.close(formValue);
  }

  onCancel(): void {
    if (this.alertForm.dirty) {
      // Demander confirmation si des modifications ont été faites
      const confirmClose = confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?');
      if (!confirmClose) {
        return;
      }
    }
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  hasSelections(): boolean {
    const recipients = this.alertForm.get('recipients')?.value || [];
    const methods = this.alertForm.get('notificationMethods')?.value || [];
    return recipients.length > 0 || methods.length > 0;
  }

  getEventClass(event: string): string {
    const classMap: Record<string, string> = {
      'SCORE_ELEVE': 'score-eleve',
      'FRAUDE_DETECTEE': 'fraude-detectee',
      'DOCUMENT_FALSIFIE': 'document-falsifie',
      'AML_POSITIF': 'aml-positif',
      'KYC_ECHEC': 'kyc-echec',
      'RISQUE_CRITIQUE': 'risque-critique'
    };
    return classMap[event] || '';
  }

  getEventLabel(event: string): string {
    return AlertEventLabels[event as AlertEvent] || event;
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'BASSE': '#6b7a8f',
      'MOYENNE': '#FFC107',
      'HAUTE': '#FF9800',
      'CRITIQUE': '#e74c3c'
    };
    return colors[priority] || '#6b7a8f';
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'BASSE': 'Basse',
      'MOYENNE': 'Moyenne',
      'HAUTE': 'Haute',
      'CRITIQUE': 'Critique'
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

  getRecipientIcon(recipient: string): string {
    const icons: Record<string, string> = {
      'ANALYSTE': 'person',
      'RESPONSABLE': 'person_outline',
      'ADMIN': 'admin_panel_settings'
    };
    return icons[recipient] || 'person';
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

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'EMAIL': 'Email',
      'SMS': 'SMS',
      'PUSH': 'Push',
      'TABLEAU_DE_BORD': 'Tableau de bord'
    };
    return labels[method] || method;
  }
}
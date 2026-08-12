// src/app/features/manager/validation/components/manager-validation-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ValidationSummaryDTO } from '@core/models';

export interface ManagerValidationDialogData {
  validation: ValidationSummaryDTO;
  action: 'APPROVE' | 'REJECT' | 'RETURN';
}

@Component({
  selector: 'app-manager-validation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon [color]="getIconColor()">{{ getIcon() }}</mat-icon>
      {{ getTitle() }}
    </h2>
    
    <mat-dialog-content>
      <div class="validation-summary">
        <div class="summary-item">
          <span class="label">Demande</span>
          <span class="value">{{ data.validation.requestNumber }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Client</span>
          <span class="value">{{ data.validation.clientName }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Montant</span>
          <span class="value">{{ data.validation.amount | currency:'TND' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Risque</span>
          <span class="value" [style.color]="getRiskColor(data.validation.riskLevel)">
            {{ data.validation.riskLevel || 'Non évalué' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Analyste</span>
          <span class="value">{{ data.validation.analystName || 'Non assigné' }}</span>
        </div>
        <div class="summary-item full-width">
          <span class="label">Jours en attente</span>
          <span class="value" [style.color]="(data.validation.daysPending || 0) > 5 ? '#f44336' : '#4caf50'">
            {{ data.validation.daysPending || 0 }} jours
          </span>
        </div>
      </div>

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Commentaires</mat-label>
          <textarea matInput formControlName="comments" rows="3" 
                    placeholder="Ajoutez vos commentaires..."></textarea>
        </mat-form-field>

        <div *ngIf="data.action === 'RETURN'" class="return-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Action requise</mat-label>
            <mat-select formControlName="requiredAction">
              <mat-option value="CORRECT_DOCUMENTS">Corriger les documents</mat-option>
              <mat-option value="REANALYZE_FINANCIALS">Réanalyser les finances</mat-option>
              <mat-option value="ADD_INFORMATION">Ajouter des informations</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Instructions supplémentaires</mat-label>
            <textarea matInput formControlName="additionalInstructions" rows="2"
                      placeholder="Instructions pour l'analyste..."></textarea>
          </mat-form-field>
        </div>

        <div *ngIf="data.action === 'REJECT'" class="reject-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Motif du rejet</mat-label>
            <mat-select formControlName="rejectReason">
              <mat-option value="RISK_TOO_HIGH">Risque trop élevé</mat-option>
              <mat-option value="INSUFFICIENT_INCOME">Revenus insuffisants</mat-option>
              <mat-option value="INCOMPLETE_DOCUMENTS">Documents incomplets</mat-option>
              <mat-option value="FRAUD_SUSPECTED">Fraude suspectée</mat-option>
              <mat-option value="OTHER">Autre motif</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-raised-button 
              [color]="getButtonColor()" 
              (click)="confirm()"
              [disabled]="form.invalid">
        {{ getConfirmLabel() }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .validation-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    .summary-item.full-width {
      grid-column: span 2;
    }
    .summary-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }
    .summary-item .value {
      font-size: 16px;
      font-weight: 500;
      color: #1a237e;
    }
    .full-width {
      width: 100%;
    }
    .return-section, .reject-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class ManagerValidationDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ManagerValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ManagerValidationDialogData,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      comments: [''],
      requiredAction: ['CORRECT_DOCUMENTS'],
      additionalInstructions: [''],
      rejectReason: ['RISK_TOO_HIGH']
    });
  }

  getIcon(): string {
    switch(this.data.action) {
      case 'APPROVE': return 'check_circle';
      case 'REJECT': return 'cancel';
      case 'RETURN': return 'assignment_return';
      default: return 'info';
    }
  }

  getIconColor(): string {
    switch(this.data.action) {
      case 'APPROVE': return 'primary';
      case 'REJECT': return 'warn';
      case 'RETURN': return 'accent';
      default: return 'default';
    }
  }

  getTitle(): string {
    switch(this.data.action) {
      case 'APPROVE': return 'Approuver la demande';
      case 'REJECT': return 'Rejeter la demande';
      case 'RETURN': return 'Retourner à l\'analyste';
      default: return 'Validation';
    }
  }

  getButtonColor(): string {
    switch(this.data.action) {
      case 'APPROVE': return 'primary';
      case 'REJECT': return 'warn';
      case 'RETURN': return 'accent';
      default: return 'primary';
    }
  }

  getConfirmLabel(): string {
    switch(this.data.action) {
      case 'APPROVE': return 'Approuver';
      case 'REJECT': return 'Rejeter';
      case 'RETURN': return 'Retourner';
      default: return 'Confirmer';
    }
  }

  getRiskColor(riskLevel: string): string {
    switch(riskLevel?.toUpperCase()) {
      case 'LOW': return '#4caf50';
      case 'MODERATE': return '#ff9800';
      case 'HIGH': return '#f44336';
      case 'CRITICAL': return '#c62828';
      default: return '#1a237e';
    }
  }

  confirm(): void {
    this.dialogRef.close({
      confirmed: true,
      comments: this.form.get('comments')?.value,
      requiredAction: this.form.get('requiredAction')?.value,
      additionalInstructions: this.form.get('additionalInstructions')?.value,
      rejectReason: this.form.get('rejectReason')?.value
    });
  }
}
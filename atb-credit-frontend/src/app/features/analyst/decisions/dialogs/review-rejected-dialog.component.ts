// src/app/features/analyst/decisions/dialogs/review-rejected-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DecisionService } from '@core/services/decision.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // AJOUTER

@Component({
  selector: 'app-review-rejected-dialog',
  template: `
    <h2 mat-dialog-title>Réviser la décision de refus</h2>
    <mat-dialog-content>
      <form [formGroup]="reviewForm">
        <div class="info-section">
          <p><strong>Client:</strong> {{ data.decision.clientName }}</p>
          <p><strong>Montant:</strong> {{ data.decision.amount | currency:'EUR':'symbol':'1.0-0' }}</p>
          <p><strong>Raison du refus:</strong> {{ getReasonLabel(data.decision.reason) }}</p>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nouvelle décision</mat-label>
          <mat-select formControlName="newDecision">
            <mat-option value="approve">Approuver</mat-option>
            <mat-option value="reject">Refuser (maintenir)</mat-option>
            <mat-option value="pending">En attente d'informations</mat-option>
          </mat-select>
          <mat-error *ngIf="reviewForm.get('newDecision')?.hasError('required')">
            La décision est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Commentaires de révision</mat-label>
          <textarea matInput formControlName="comments" rows="4" placeholder="Expliquez votre révision..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="reviewForm.invalid || isSubmitting">
        <mat-icon *ngIf="!isSubmitting">check</mat-icon>
        <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
        Valider la révision
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    .info-section {
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .info-section p {
      margin: 4px 0;
    }
    mat-dialog-content {
      min-width: 400px;
      padding-top: 8px;
    }
    mat-spinner {
      display: inline-block;
      margin: 0 8px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule // AJOUTER

  ]
})
export class ReviewRejectedDialogComponent {
  reviewForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<ReviewRejectedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private decisionService: DecisionService,
    private snackBar: MatSnackBar
  ) {
    this.reviewForm = this.fb.group({
      newDecision: ['', Validators.required],
      comments: ['']
    });
  }

  getReasonLabel(reason: string): string {
    const labels: { [key: string]: string } = {
      'risk_too_high': 'Risque trop élevé',
      'insufficient_income': 'Revenus insuffisants',
      'poor_credit_history': 'Mauvais historique de crédit',
      'debt_ratio': 'Taux d\'endettement trop élevé',
      'document_missing': 'Documents manquants',
      'fraud_suspicion': 'Suspicion de fraude',
      'policy_violation': 'Violation de politique'
    };
    return labels[reason] || reason;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.reviewForm.invalid) return;

    this.isSubmitting = true;
    const data = {
      decisionId: this.data.decision.id,
      newDecision: this.reviewForm.value.newDecision,
      comments: this.reviewForm.value.comments
    };

    this.decisionService.reviewDecision(this.data.decision.id, data).subscribe({
      next: () => {
        this.snackBar.open('Décision révisée avec succès', 'Fermer', {
          duration: 3000
        });
        this.dialogRef.close(true);
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la révision', error);
        this.snackBar.open('Erreur lors de la révision', 'Fermer', {
          duration: 3000
        });
        this.isSubmitting = false;
      }
    });
  }
}
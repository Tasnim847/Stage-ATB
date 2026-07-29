// src/app/features/analyst/decisions/dialogs/reassign-analyst-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

export interface ReassignDialogData {
  decisionId: string;
}

@Component({
  selector: 'app-reassign-analyst-dialog',
  template: `
    <h2 mat-dialog-title>Réassigner à un analyste</h2>
    <mat-dialog-content>
      <p>Sélectionnez un analyste pour cette décision</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Analyste</mat-label>
        <mat-select [(ngModel)]="selectedAnalyst">
          <mat-option *ngFor="let analyst of analysts" [value]="analyst.id">
            {{ analyst.name }} ({{ analyst.currentWorkload }} dossiers)
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="!selectedAnalyst">
        Réassigner
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      min-width: 300px;
      padding-top: 8px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule
  ]
})
export class ReassignAnalystDialogComponent {
  selectedAnalyst: string = '';
  analysts = [
    { id: '1', name: 'Jean Dupont', currentWorkload: 12 },
    { id: '2', name: 'Marie Martin', currentWorkload: 8 },
    { id: '3', name: 'Pierre Durand', currentWorkload: 15 },
    { id: '4', name: 'Sophie Bernard', currentWorkload: 6 }
  ];

  constructor(
    public dialogRef: MatDialogRef<ReassignAnalystDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReassignDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedAnalyst);
  }
}
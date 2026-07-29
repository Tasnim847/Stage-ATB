// src/app/features/analyst/decisions/dialogs/analyst-notes-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analyst-notes-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>note</mat-icon>
      Notes de l'analyste
    </h2>
    <mat-dialog-content>
      <div class="notes-content" *ngIf="data.notes; else noNotes">
        {{ data.notes }}
      </div>
      <ng-template #noNotes>
        <div class="no-notes">
          <mat-icon>inbox</mat-icon>
          <p>Aucune note disponible</p>
        </div>
      </ng-template>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="onClose()">
        Fermer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .notes-content {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      white-space: pre-wrap;
      line-height: 1.6;
      min-height: 100px;
    }
    .no-notes {
      text-align: center;
      padding: 32px;
      color: #6b7280;
    }
    .no-notes mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #d1d5db;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class AnalystNotesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AnalystNotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { notes: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
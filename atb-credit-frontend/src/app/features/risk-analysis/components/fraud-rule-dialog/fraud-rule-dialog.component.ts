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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-fraud-rule-dialog',
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
    MatSnackBarModule,
    MatSliderModule
  ],
  templateUrl: './fraud-rule-dialog.component.html',
  styleUrls: ['./fraud-rule-dialog.component.css']
})
export class FraudRuleDialogComponent implements OnInit {
  ruleForm!: FormGroup;
  isEditMode = false;
  thresholdValue = 50;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FraudRuleDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { rule?: any }
  ) {
    this.isEditMode = !!data?.rule;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode && this.data.rule) {
      this.patchForm(this.data.rule);
    }
  }

  private initForm(): void {
    this.ruleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      weight: [20, [Validators.required, Validators.min(1), Validators.max(100)]],
      threshold: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });

    // Mettre à jour thresholdValue quand le champ change
    this.ruleForm.get('threshold')?.valueChanges.subscribe(value => {
      this.thresholdValue = value;
    });
  }

  private patchForm(rule: any): void {
    this.ruleForm.patchValue({
      name: rule.name,
      description: rule.description,
      weight: rule.weight,
      threshold: rule.threshold,
      isActive: rule.isActive
    });
    this.thresholdValue = rule.threshold;
  }

  // ✅ AJOUTER CETTE MÉTHODE
  formatLabel(value: number): string {
    return value + '%';
  }

  onSubmit(): void {
    if (this.ruleForm.invalid) {
      this.markFormGroupTouched(this.ruleForm);
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.ruleForm.value;
    this.dialogRef.close(formValue);
  }

  onCancel(): void {
    if (this.ruleForm.dirty) {
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

  getSeverityLabel(threshold: number): string {
    if (threshold <= 30) return '🟢 Faible';
    if (threshold <= 50) return '🟡 Moyen';
    if (threshold <= 70) return '🟠 Élevé';
    return '🔴 Critique';
  }

  getSeverityColor(threshold: number): string {
    if (threshold <= 30) return '#4CAF50';
    if (threshold <= 50) return '#FFC107';
    if (threshold <= 70) return '#FF9800';
    return '#e74c3c';
  }
}
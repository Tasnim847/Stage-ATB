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
import { DecisionRule, DecisionAction, DecisionActionLabels } from '@app/core/models';

@Component({
  selector: 'app-decision-rule-dialog',
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
    MatSnackBarModule
  ],
  templateUrl: './decision-rule-dialog.component.html',
  styleUrls: ['./decision-rule-dialog.component.css']
})
export class DecisionRuleDialogComponent implements OnInit {
  ruleForm!: FormGroup;
  isEditMode = false;
  availableActions = Object.entries(DecisionActionLabels).map(([value, label]) => ({
    value,
    label
  }));

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DecisionRuleDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { rule?: DecisionRule }
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
      description: ['', [Validators.maxLength(500)]],
      condition: ['', [Validators.required, Validators.minLength(3)]],
      action: ['', [Validators.required]],
      priority: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  private patchForm(rule: DecisionRule): void {
    this.ruleForm.patchValue({
      name: rule.name,
      description: rule.description || '',
      condition: rule.condition,
      action: rule.action,
      priority: rule.priority,
      isActive: rule.isActive
    });
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
    const result = {
      ...formValue,
      priority: Number(formValue.priority)
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
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

  getActionLabel(action: string): string {
    return DecisionActionLabels[action as DecisionAction] || action;
  }
}
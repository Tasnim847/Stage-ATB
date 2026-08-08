import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { 
  KycAmlConfig, 
  KycAmlCategory, 
  KycAmlCheck 
} from '@app/core/models';

@Component({
  selector: 'app-kyc-aml-dialog',
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
    MatChipsModule
  ],
  templateUrl: './kyc-aml-dialog.component.html',
  styleUrls: ['./kyc-aml-dialog.component.css']
})
export class KycAmlDialogComponent implements OnInit {
  configForm!: FormGroup;
  isEditMode = false;

  categories = [
    { value: KycAmlCategory.KYC, label: 'KYC - Vérification d\'identité' },
    { value: KycAmlCategory.AML, label: 'AML - Anti-blanchiment' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<KycAmlDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { config?: KycAmlConfig }
  ) {
    this.isEditMode = !!data?.config;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode && this.data.config) {
      this.patchForm(this.data.config);
    }
  }

  private initForm(): void {
    this.configForm = this.fb.group({
      category: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
      required: [false],
      priority: [1, [Validators.required, Validators.min(0)]],
      autoCheck: [false],
      checks: this.fb.array([])
    });
  }

  private patchForm(config: KycAmlConfig): void {
    this.configForm.patchValue({
      category: config.category,
      name: config.name,
      description: config.description || '',
      isActive: config.isActive,
      required: config.required,
      priority: config.priority,
      autoCheck: config.autoCheck
    });

    // Ajouter les checks existants
    const checksArray = this.configForm.get('checks') as FormArray;
    if (config.checks && config.checks.length > 0) {
      config.checks.forEach(check => {
        checksArray.push(this.createCheckGroup(check));
      });
    }
  }

  createCheckGroup(check?: KycAmlCheck): FormGroup {
    return this.fb.group({
      id: [check?.id || null],
      name: [check?.name || '', [Validators.required, Validators.minLength(2)]],
      type: [check?.type || 'document'],
      isActive: [check?.isActive !== undefined ? check.isActive : true],
      weight: [check?.weight || 50, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  get checksArray(): FormArray {
    return this.configForm.get('checks') as FormArray;
  }

  addCheck(): void {
    this.checksArray.push(this.createCheckGroup());
  }

  removeCheck(index: number): void {
    if (this.checksArray.length > 1) {
      this.checksArray.removeAt(index);
    } else {
      this.snackBar.open('Vous devez avoir au moins un check', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onSubmit(): void {
    if (this.configForm.invalid) {
      this.markFormGroupTouched(this.configForm);
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.configForm.value;
    // Supprimer les IDs des nouveaux checks
    formValue.checks = formValue.checks.map((check: any) => {
      if (!check.id) {
        delete check.id;
      }
      return check;
    });

    this.dialogRef.close(formValue);
  }

  onCancel(): void {
    if (this.configForm.dirty) {
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

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'KYC': 'KYC - Vérification d\'identité',
      'AML': 'AML - Anti-blanchiment'
    };
    return labels[category] || category;
  }
}
// components/ceilings-dialog/ceilings-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ParametrageService, CeilingConfig, CreditType } from '@app/core/services/parametrage.service';

@Component({
  selector: 'app-ceilings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './ceilings-dialog.component.html',
  styleUrls: ['./ceilings-dialog.component.css']
})
export class CeilingsDialogComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  creditTypes: CreditType[] = [];
  approvalLevels = [
    { value: 'ADVISOR', label: 'Conseiller' },
    { value: 'ANALYST', label: 'Analyste' },
    { value: 'MANAGER', label: 'Responsable' },
    { value: 'DIRECTOR', label: 'Directeur' }
  ];
  currencies = [
    { value: 'TND', label: 'Dinar Tunisien (DT)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'Dollar ($)' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CeilingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; ceiling?: CeilingConfig },
    private parametrageService: ParametrageService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit() {
    this.loadCreditTypes();
    this.initForm();
    if (this.isEdit && this.data.ceiling) {
      this.patchForm(this.data.ceiling);
    }
  }

  loadCreditTypes() {
    this.parametrageService.getCreditTypes().subscribe({
      next: (data) => {
        this.creditTypes = data;
      },
      error: () => {
        this.snackBar.open('Erreur chargement types de crédit', 'Fermer', { duration: 3000 });
      }
    });
  }

  initForm() {
    this.form = this.fb.group({
      creditTypeId: ['', Validators.required],
      minAmount: ['', [Validators.required, Validators.min(0)]],
      maxAmount: ['', [Validators.required, Validators.min(0)]],
      currency: ['TND', Validators.required],
      approvalLevel: ['', Validators.required],
      requiresAdditionalApproval: [false],
      additionalApprovalLevel: ['']
    });

    // Validation: maxAmount >= minAmount
    this.form.get('maxAmount')?.valueChanges.subscribe(() => {
      this.validateAmounts();
    });
    this.form.get('minAmount')?.valueChanges.subscribe(() => {
      this.validateAmounts();
    });

    // Si requiresAdditionalApproval est false, désactiver additionalApprovalLevel
    this.form.get('requiresAdditionalApproval')?.valueChanges.subscribe(checked => {
      const field = this.form.get('additionalApprovalLevel');
      if (checked) {
        field?.enable();
        field?.setValidators(Validators.required);
      } else {
        field?.disable();
        field?.clearValidators();
        field?.setValue(null);
      }
      field?.updateValueAndValidity();
    });
  }

  validateAmounts() {
    const min = this.form.get('minAmount')?.value;
    const max = this.form.get('maxAmount')?.value;
    if (min && max && min > max) {
      this.form.get('maxAmount')?.setErrors({ min: 'Doit être >= montant min' });
    }
  }

  patchForm(item: CeilingConfig) {
    this.form.patchValue({
      creditTypeId: item.creditTypeId,
      minAmount: item.minAmount,
      maxAmount: item.maxAmount,
      currency: item.currency || 'TND',
      approvalLevel: item.approvalLevel,
      requiresAdditionalApproval: item.requiresAdditionalApproval,
      additionalApprovalLevel: item.additionalApprovalLevel || null
    });

    // Gérer l'état du champ additionalApprovalLevel
    if (item.requiresAdditionalApproval) {
      this.form.get('additionalApprovalLevel')?.enable();
    } else {
      this.form.get('additionalApprovalLevel')?.disable();
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Veuillez corriger les erreurs', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formData = this.form.value;

    if (this.isEdit && this.data.ceiling) {
      this.parametrageService.updateCeilingConfig(this.data.ceiling.id, formData).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur mise à jour:', err);
          this.loading = false;
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.parametrageService.createCeilingConfig(formData).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.loading = false;
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  get title(): string {
    return this.isEdit ? 'Modifier le plafond' : 'Nouveau plafond';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Modifier' : 'Créer';
  }
}
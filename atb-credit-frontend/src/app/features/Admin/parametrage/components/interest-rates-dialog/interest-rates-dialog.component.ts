// components/interest-rates-dialog/interest-rates-dialog.component.ts
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
import { ParametrageService, InterestRate, CreateInterestRateDTO } from '@app/core/services/parametrage.service';
import { MatIconModule } from '@angular/material/icon'; // ✅ AJOUTER CET IMPORT

@Component({
  selector: 'app-interest-rates-dialog',
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
  templateUrl: './interest-rates-dialog.component.html',
  styleUrls: ['./interest-rates-dialog.component.css']
})
export class InterestRatesDialogComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  creditTypes: any[] = [];
  clientCategories = [
    { value: 'STANDARD', label: 'Standard' },
    { value: 'PREMIUM', label: 'Premium (-0.5%)' },
    { value: 'RISK', label: 'À risque (+1%)' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InterestRatesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; interestRate?: InterestRate; creditTypes?: any[] },
    private parametrageService: ParametrageService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = data.mode === 'edit';
    this.creditTypes = data.creditTypes || [];
  }

  ngOnInit() {
    this.initForm();
    if (this.isEdit && this.data.interestRate) {
      this.patchForm(this.data.interestRate);
    }
  }

  initForm() {
    this.form = this.fb.group({
      creditTypeId: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      minRate: [''],
      maxRate: [''],
      isDefault: [false],
      clientCategory: ['STANDARD'],
      rateAdjustment: [0],
      effectiveDate: [new Date().toISOString().split('T')[0], Validators.required],
      expiryDate: ['']
    });

    // Quand la catégorie client change, ajuster le rateAdjustment
    this.form.get('clientCategory')?.valueChanges.subscribe(category => {
      const adjustments: { [key: string]: number } = {
        'PREMIUM': -0.5,
        'STANDARD': 0,
        'RISK': 1
      };
      this.form.get('rateAdjustment')?.setValue(adjustments[category] || 0);
    });
  }

  patchForm(item: InterestRate) {
    this.form.patchValue({
      creditTypeId: item.creditTypeId,
      rate: item.rate,
      minRate: item.minRate || null,
      maxRate: item.maxRate || null,
      isDefault: item.isDefault,
      clientCategory: item.clientCategory || 'STANDARD',
      rateAdjustment: item.rateAdjustment || 0,
      // ✅ Ajouter l'heure pour avoir un format LocalDateTime valide
      effectiveDate: item.effectiveDate ? new Date(item.effectiveDate).toISOString().slice(0, 16) : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 16) : ''
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Veuillez corriger les erreurs', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formData = this.form.value;

    // ✅ Convertir les dates en format LocalDateTime (avec heure)
    if (formData.effectiveDate) {
      formData.effectiveDate = formData.effectiveDate + 'T00:00:00';
    }
    if (formData.expiryDate) {
      formData.expiryDate = formData.expiryDate + 'T00:00:00';
    }

    if (this.isEdit && this.data.interestRate) {
      this.parametrageService.updateInterestRate(this.data.interestRate.id, formData).subscribe({
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
      this.parametrageService.createInterestRate(formData).subscribe({
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
    return this.isEdit ? 'Modifier le taux d\'intérêt' : 'Nouveau taux d\'intérêt';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Modifier' : 'Créer';
  }
}
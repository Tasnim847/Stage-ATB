// components/durations-dialog/durations-dialog.component.ts
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
import { ParametrageService, DurationConfig, CreditType } from '@app/core/services/parametrage.service';

@Component({
  selector: 'app-durations-dialog',
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
  templateUrl: './durations-dialog.component.html',
  styleUrls: ['./durations-dialog.component.css']
})
export class DurationsDialogComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  creditTypes: CreditType[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DurationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; duration?: DurationConfig },
    private parametrageService: ParametrageService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit() {
    this.loadCreditTypes();
    this.initForm();
    if (this.isEdit && this.data.duration) {
      this.patchForm(this.data.duration);
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
      durationMonths: ['', [Validators.required, Validators.min(1)]],
      label: ['', [Validators.required, Validators.minLength(2)]],
      isDefault: [false],
      minAmount: [''],
      maxAmount: ['']
    });
  }

  patchForm(item: DurationConfig) {
    this.form.patchValue({
      creditTypeId: item.creditTypeId,
      durationMonths: item.durationMonths,
      label: item.label,
      isDefault: item.isDefault,
      minAmount: item.minAmount || null,
      maxAmount: item.maxAmount || null
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

    if (this.isEdit && this.data.duration) {
      this.parametrageService.updateDurationConfig(this.data.duration.id, formData).subscribe({
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
      this.parametrageService.createDurationConfig(formData).subscribe({
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
    return this.isEdit ? 'Modifier la durée' : 'Nouvelle durée';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Modifier' : 'Créer';
  }
}
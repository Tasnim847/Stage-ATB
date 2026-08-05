import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ParametrageService, CreditType, CreateCreditTypeDTO } from '@app/core/services/parametrage.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-credit-types-dialog',
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
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './credit-types-dialog.component.html',
  styleUrls: ['./credit-types-dialog.component.css']
})
export class CreditTypesDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  private destroy$ = new Subject<void>();
  
  categories = this.parametrageService.getCreditCategories();
  documentTypes = this.parametrageService.getDocumentTypes();
  selectedDocuments: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreditTypesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; creditType?: CreditType },
    private parametrageService: ParametrageService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit() {
    this.initForm();
    if (this.isEdit && this.data.creditType) {
      this.patchForm(this.data.creditType);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      category: ['', Validators.required],
      minDurationMonths: [12, [Validators.required, Validators.min(1)]],
      maxDurationMonths: [84, [Validators.required, Validators.min(1)]],
      minAmount: [1000, [Validators.required, Validators.min(0)]],
      maxAmount: [50000, [Validators.required, Validators.min(0)]],
      baseInterestRate: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
      requiresCollateral: [false],
      requiresGuarantor: [false],
      requiredDocuments: [[]]
    });

    // Validation: maxDuration >= minDuration
    this.form.get('maxDurationMonths')?.valueChanges.subscribe(() => this.validateDurations());
    this.form.get('minDurationMonths')?.valueChanges.subscribe(() => this.validateDurations());

    // Validation: maxAmount >= minAmount
    this.form.get('maxAmount')?.valueChanges.subscribe(() => this.validateAmounts());
    this.form.get('minAmount')?.valueChanges.subscribe(() => this.validateAmounts());
  }

  validateDurations() {
    const min = this.form.get('minDurationMonths')?.value;
    const max = this.form.get('maxDurationMonths')?.value;
    if (min && max && min > max) {
      this.form.get('maxDurationMonths')?.setErrors({ min: 'Doit être >= durée min' });
    }
  }

  validateAmounts() {
    const min = this.form.get('minAmount')?.value;
    const max = this.form.get('maxAmount')?.value;
    if (min && max && min > max) {
      this.form.get('maxAmount')?.setErrors({ min: 'Doit être >= montant min' });
    }
  }

  patchForm(item: CreditType) {
    this.form.patchValue({
      code: item.code,
      name: item.name,
      description: item.description,
      category: item.category,
      minDurationMonths: item.minDurationMonths,
      maxDurationMonths: item.maxDurationMonths,
      minAmount: item.minAmount,
      maxAmount: item.maxAmount,
      baseInterestRate: item.baseInterestRate,
      requiresCollateral: item.requiresCollateral,
      requiresGuarantor: item.requiresGuarantor,
      requiredDocuments: item.requiredDocuments || []
    });
    this.selectedDocuments = item.requiredDocuments || [];
  }

  addDocument(doc: string) {
    if (doc && !this.selectedDocuments.includes(doc)) {
      this.selectedDocuments.push(doc);
      this.form.get('requiredDocuments')?.setValue(this.selectedDocuments);
    }
  }

  removeDocument(doc: string) {
    this.selectedDocuments = this.selectedDocuments.filter(d => d !== doc);
    this.form.get('requiredDocuments')?.setValue(this.selectedDocuments);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Veuillez corriger les erreurs', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formData = this.form.value;

    if (this.isEdit && this.data.creditType) {
      this.parametrageService.updateCreditType(this.data.creditType.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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
      this.parametrageService.createCreditType(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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
    return this.isEdit ? 'Modifier le type de crédit' : 'Nouveau type de crédit';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Modifier' : 'Créer';
  }

  getDocumentLabel(value: string): string {
    const found = this.documentTypes.find(d => d.value === value);
    return found ? found.label : value;
  }
}
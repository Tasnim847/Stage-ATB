// features/admin/employee-management/employee-form/employee-form.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { EmployeeService } from '@core/services/employee.service';
import { UserService } from '@core/services/user.service';
import { EmployeeRequestDTO, EmployeeResponseDTO } from '@core/models/employee.model';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit, OnDestroy {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  loading = false;
  submitting = false;
  private destroy$ = new Subject<void>();

  // Options pour les sélecteurs
  roles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'ANALYST', label: 'Analyste de crédit' },
    { value: 'ADVISOR', label: 'Conseiller bancaire' },
    { value: 'MANAGER', label: 'Responsable des crédits' }
  ];

  departments = [
    'Direction Générale',
    'Crédits et Financements',
    'Analyse Financière',
    'Gestion des Risques',
    'Conformité et KYC',
    'Informatique et IA',
    'Ressources Humaines',
    'Marketing et Communication',
    'Juridique',
    'Audit Interne'
  ];

  statuses = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'INACTIVE', label: 'Inactif' },
    { value: 'SUSPENDED', label: 'Suspendu' },
    { value: 'ON_LEAVE', label: 'En congé' },
    { value: 'TERMINATED', label: 'Résilié' }
  ];

  countries = [
    'Tunisie',
    'France',
    'Algérie',
    'Maroc',
    'Sénégal',
    'Côte d\'Ivoire',
    'Cameroun',
    'RDC'
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      // Informations personnelles
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern('^[0-9+ -]{8,15}$')]],
      
      // Informations professionnelles
      role: ['', Validators.required],
      department: [''],
      position: [''],
      status: ['ACTIVE'],
      
      // Adresse
      address: [''],
      city: [''],
      country: ['Tunisie'],
      postalCode: [''],
      
      // Informations supplémentaires
      hireDate: [new Date()],
      managerId: [''],
      notes: ['']
    });
  }

  checkEditMode(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.employeeId = id;
        this.loadEmployee(id);
      }
    });
  }

  loadEmployee(id: string): void {
    this.loading = true;
    this.employeeService.getEmployeeById(id)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.snackBar.open('Erreur lors du chargement de l\'employé', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erreur:', error);
          this.router.navigate(['/admin/employees']);
          return [];
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((employee) => {
        this.patchForm(employee);
      });
  }

  patchForm(employee: EmployeeResponseDTO): void {
    const roleStr = typeof employee.role === 'string' 
    ? employee.role 
    : (employee.role as any)?.toString?.() || 'ADVISOR';

  this.employeeForm.patchValue({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phoneNumber: employee.phoneNumber,
    role: roleStr,  // ✅ Utiliser la version string
    department: employee.department,
    position: employee.position,
    status: employee.status,
    address: employee.address,
    city: employee.city,
    country: employee.country,
    postalCode: employee.postalCode,
    hireDate: employee.hireDate ? new Date(employee.hireDate) : new Date(),
    managerId: employee.managerId,
    notes: employee.notes
  });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched(this.employeeForm);
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.submitting = true;
    const formData = this.employeeForm.value;

    // Convertir la date en format ISO
    if (formData.hireDate) {
      formData.hireDate = new Date(formData.hireDate).toISOString();
    }

    const request: EmployeeRequestDTO = formData;

    const operation = this.isEditMode
      ? this.employeeService.updateEmployee(this.employeeId!, request)
      : this.employeeService.createEmployee(request);

    operation.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.submitting = false)
    ).subscribe({
      next: (response) => {
        this.snackBar.open(
          this.isEditMode ? 'Employé modifié avec succès' : 'Employé créé avec succès',
          'Fermer',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.router.navigate(['/admin/employees', response.id]);
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Erreur lors de l\'opération',
          'Fermer',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
        console.error('Erreur:', error);
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.employeeForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['email']) return 'Email invalide';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['pattern']) return 'Format invalide';
    return 'Champ invalide';
  }

  goBack(): void {
    this.router.navigate(['/admin/employees']);
  }

  getTitle(): string {
    return this.isEditMode ? 'Modifier un employé' : 'Ajouter un employé';
  }
}
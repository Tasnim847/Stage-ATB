// features/auth/auth-page/auth-page.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // Modes
  isLoginMode = true;
  registrationMode: 'employee' | 'client' = 'employee';
  
  // Formulaires
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  
  // États
  isLoading = false;
  hidePassword = true;
  hideRegisterPassword = true;
  hideConfirmPassword = true;
  errorMessage = '';

  // Données
  roles = [
    { value: 'ANALYST', label: 'Analyste' },
    { value: 'ADVISOR', label: 'Conseiller' },
    { value: 'MANAGER', label: 'Responsable' },
    { value: 'ADMIN', label: 'Administrateur' }
  ];

  nationalities = [
    'Tunisienne', 'Française', 'Algérienne', 'Marocaine',
    'Libyenne', 'Egyptienne', 'Sénégalaise', 'Ivoirienne',
    'Camerounaise', 'Autre'
  ];

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.initLoginForm();
    this.initRegisterForm();
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  initRegisterForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [''],
      employeeNumber: ['', [Validators.minLength(3)]],
      role: [''],
      department: [''],
      position: [''],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      dateOfBirth: [''],
      placeOfBirth: [''],
      nationality: [''],
      profession: ['']
    }, { validators: this.passwordMatchValidator });

    this.setRegistrationMode('employee');
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  switchMode(loginMode: boolean): void {
    this.isLoginMode = loginMode;
    this.errorMessage = '';
    this.isLoading = false;
    
    if (loginMode) {
      this.loginForm.reset();
    } else {
      this.registerForm.reset();
      this.setRegistrationMode('employee');
    }
  }

  setRegistrationMode(mode: 'employee' | 'client'): void {
    this.registrationMode = mode;
    const form = this.registerForm;
    const employeeFields = ['employeeNumber', 'role', 'department', 'position'];
    const clientFields = ['dateOfBirth', 'placeOfBirth', 'nationality', 'profession'];

    if (mode === 'client') {
      // Activer champs client
      clientFields.forEach(field => {
        form.get(field)?.enable();
        form.get(field)?.setValidators([Validators.required]);
      });
      
      // Désactiver champs employé
      employeeFields.forEach(field => {
        form.get(field)?.disable();
        form.get(field)?.clearValidators();
      });
      
      form.get('role')?.setValue('CLIENT');
    } else {
      // Activer champs employé
      employeeFields.forEach(field => {
        form.get(field)?.enable();
        if (field === 'employeeNumber' || field === 'role') {
          form.get(field)?.setValidators([Validators.required]);
        }
      });
      
      // Désactiver champs client
      clientFields.forEach(field => {
        form.get(field)?.disable();
        form.get(field)?.clearValidators();
      });
    }

    // Mettre à jour les validations
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.updateValueAndValidity();
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success(
          `Bienvenue ${response.firstName} ${response.lastName} !`,
          'Connexion réussie'
        );
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Email ou mot de passe incorrect';
        this.toastr.error(this.errorMessage, 'Erreur de connexion');
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les erreurs', 'Formulaire invalide');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;

    if (this.registrationMode === 'client') {
      const clientData = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber || '',
        dateOfBirth: formValue.dateOfBirth,
        address: formValue.address,
        city: formValue.city,
        country: formValue.country,
        placeOfBirth: formValue.placeOfBirth,
        nationality: formValue.nationality,
        profession: formValue.profession
      };

      this.authService.registerClient(clientData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success(
            `Bienvenue ${response.firstName} ${response.lastName} !`,
            'Inscription réussie'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Erreur lors de l\'inscription';
          this.toastr.error(this.errorMessage, 'Erreur');
        }
      });
    } else {
      const employeeData = {
        employeeNumber: formValue.employeeNumber,
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber || '',
        role: formValue.role,
        department: formValue.department || '',
        position: formValue.position || '',
        address: formValue.address,
        city: formValue.city,
        country: formValue.country
      };

      this.authService.registerEmployee(employeeData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success(
            `Bienvenue ${response.firstName} ${response.lastName} !`,
            'Inscription réussie'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Erreur lors de l\'inscription';
          this.toastr.error(this.errorMessage, 'Erreur');
        }
      });
    }
  }

  getLoginErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control) return '';
    
    if (field === 'email') {
      if (control.hasError('required')) return 'L\'email est requis';
      if (control.hasError('email')) return 'Email valide requis';
    }
    if (field === 'password') {
      if (control.hasError('required')) return 'Le mot de passe est requis';
      if (control.hasError('minlength')) return 'Minimum 6 caractères';
    }
    return '';
  }
}
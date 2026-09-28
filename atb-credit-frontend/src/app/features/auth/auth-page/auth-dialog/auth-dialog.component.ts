// features/auth/auth-page/auth-dialog/auth-dialog.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.css']
})
export class AuthDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private dialogRef = inject(MatDialogRef<AuthDialogComponent>);

  // Onglet actif : 0 = login, 1 = register
  selectedTabIndex = 0;

  // ========== LOGIN ==========
  loginForm!: FormGroup;
  isLoadingLogin = false;
  hideLoginPassword = true;
  loginErrorMessage = '';
  isCheckingAccount = false;

  // ========== REGISTER ==========
  registerForm!: FormGroup;
  isLoadingRegister = false;
  hidePassword = true;
  hideConfirmPassword = true;
  registerErrorMessage = '';
  registrationMode: 'employee' | 'client' = 'employee';

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
    this.initLoginForm();
    this.initRegisterForm();
  }

  // ============================================
  // LOGIN
  // ============================================
  initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoadingLogin = true;
    this.loginErrorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoadingLogin = false;
        this.toastr.success(`Bienvenue ${response.firstName} ${response.lastName} !`, 'Connexion réussie');
        this.dialogRef.close(true);
        this.redirectByRole(response.role);
      },
      error: (error) => {
        this.isLoadingLogin = false;
        this.loginErrorMessage = error.message || 'Email ou mot de passe incorrect';
        this.toastr.error(this.loginErrorMessage, 'Erreur de connexion');
      }
    });
  }

  private redirectByRole(role: string): void {
    const routes: Record<string, string> = {
      'CLIENT': '/client-dashboard',
      'ADMIN': '/admin-dashboard',
      'ANALYST': '/analyst-dashboard',
      'ADVISOR': '/advisor-dashboard',
      'MANAGER': '/manager-dashboard'
    };
    this.router.navigate([routes[role] || '/dashboard']);
  }

  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }

  hasEmailError(): boolean {
    return !!(this.loginEmail?.invalid && this.loginEmail?.touched);
  }

  getEmailErrorMessage(): string {
    if (this.loginEmail?.errors?.['required']) return 'L\'email est requis';
    if (this.loginEmail?.errors?.['email']) return 'Email invalide';
    return '';
  }

  hasPasswordError(): boolean {
    return !!(this.loginPassword?.invalid && this.loginPassword?.touched);
  }

  getPasswordErrorMessage(): string {
    if (this.loginPassword?.errors?.['required']) return 'Le mot de passe est requis';
    if (this.loginPassword?.errors?.['minlength']) return 'Minimum 6 caractères';
    return '';
  }

  // ============================================
  // REGISTER
  // ============================================
  initRegisterForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [''],
      employeeNumber: ['', [Validators.minLength(3), Validators.maxLength(20)]],
      role: [''],
      department: [''],
      position: [''],
      address: [''],
      city: [''],
      country: [''],
      dateOfBirth: [''],
      placeOfBirth: [''],
      nationality: [''],
      profession: ['']
    }, { validators: this.passwordMatchValidator });

    this.toggleMode('employee');
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  toggleMode(mode: 'employee' | 'client'): void {
    this.registrationMode = mode;
    const roleControl = this.registerForm.get('role');
    const employeeNumberControl = this.registerForm.get('employeeNumber');

    const clientFields = ['dateOfBirth', 'placeOfBirth', 'nationality', 'profession'];
    const employeeFields = ['role', 'employeeNumber', 'department', 'position', 'address', 'city', 'country'];

    if (mode === 'client') {
      roleControl?.clearValidators();
      roleControl?.setValue('CLIENT');
      employeeNumberControl?.clearValidators();

      clientFields.forEach(field => {
        this.registerForm.get(field)?.enable();
        this.registerForm.get(field)?.setValidators([Validators.required]);
      });

      ['department', 'position'].forEach(field => {
        this.registerForm.get(field)?.disable();
        this.registerForm.get(field)?.clearValidators();
      });

      ['address', 'city', 'country'].forEach(field => {
        this.registerForm.get(field)?.enable();
        this.registerForm.get(field)?.setValidators([Validators.required]);
      });
    } else {
      roleControl?.setValidators([Validators.required]);
      employeeNumberControl?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(20)]);

      clientFields.forEach(field => {
        this.registerForm.get(field)?.disable();
        this.registerForm.get(field)?.clearValidators();
      });

      employeeFields.forEach(field => {
        this.registerForm.get(field)?.enable();
        if (field === 'role' || field === 'employeeNumber') {
          this.registerForm.get(field)?.setValidators([Validators.required]);
        }
      });
    }

    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.updateValueAndValidity();
    });
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les erreurs', 'Formulaire invalide');
      return;
    }

    this.isLoadingRegister = true;
    this.registerErrorMessage = '';
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
          this.isLoadingRegister = false;
          this.toastr.success(`Bienvenue ${response.firstName} !`, 'Compte créé');
          this.dialogRef.close(true);
          this.router.navigate(['/client-dashboard']);
        },
        error: (error) => {
          this.isLoadingRegister = false;
          this.registerErrorMessage = error.message || 'Erreur lors de l\'inscription';
          this.toastr.error(this.registerErrorMessage, 'Erreur');
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
        address: formValue.address || '',
        city: formValue.city || '',
        country: formValue.country || ''
      };

      this.authService.registerEmployee(employeeData).subscribe({
        next: (response) => {
          this.isLoadingRegister = false;
          this.toastr.success(`Bienvenue ${response.firstName} !`, 'Compte créé');
          this.dialogRef.close(true);
          this.redirectByRole(response.role);
        },
        error: (error) => {
          this.isLoadingRegister = false;
          this.registerErrorMessage = error.message || 'Erreur lors de l\'inscription';
          this.toastr.error(this.registerErrorMessage, 'Erreur');
        }
      });
    }
  }

  // Getters register
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get employeeNumber() { return this.registerForm.get('employeeNumber'); }
  get role() { return this.registerForm.get('role'); }
  get department() { return this.registerForm.get('department'); }
  get position() { return this.registerForm.get('position'); }
  get address() { return this.registerForm.get('address'); }
  get city() { return this.registerForm.get('city'); }
  get country() { return this.registerForm.get('country'); }
  get dateOfBirth() { return this.registerForm.get('dateOfBirth'); }
  get placeOfBirth() { return this.registerForm.get('placeOfBirth'); }
  get nationality() { return this.registerForm.get('nationality'); }
  get profession() { return this.registerForm.get('profession'); }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
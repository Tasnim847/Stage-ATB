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
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
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
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  registerForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage = '';
  
  // ✅ Mode d'inscription: 'employee' ou 'client'
  registrationMode: 'employee' | 'client' = 'employee';

  // ✅ Rôles disponibles pour les employés
  roles = [
    { value: 'ANALYST', label: 'Analyste' },
    { value: 'ADVISOR', label: 'Conseiller' },
    { value: 'MANAGER', label: 'Responsable' },
    { value: 'ADMIN', label: 'Administrateur' }
  ];

  // ✅ Champs supplémentaires pour les clients
  clientFields = ['dateOfBirth', 'address', 'city', 'country', 'placeOfBirth', 'nationality', 'profession'];
  
  // ✅ Champs supplémentaires pour les employés
  employeeFields = ['department', 'position', 'address', 'city', 'country'];

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      // Champs communs
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [''],
      
      // Champs employé
      role: ['', [Validators.required]],
      department: [''],
      position: [''],
      
      // Champs client
      dateOfBirth: [''],
      address: [''],
      city: [''],
      country: [''],
      placeOfBirth: [''],
      nationality: [''],
      profession: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // ✅ Basculer entre mode client et employé
  toggleMode(mode: 'employee' | 'client'): void {
    this.registrationMode = mode;
    const roleControl = this.registerForm.get('role');
    const clientFields = ['dateOfBirth', 'address', 'city', 'country', 'placeOfBirth', 'nationality', 'profession'];
    const employeeFields = ['department', 'position'];

    if (mode === 'client') {
      roleControl?.clearValidators();
      roleControl?.setValue('CLIENT');
      
      // Activer les champs client
      clientFields.forEach(field => {
        this.registerForm.get(field)?.enable();
      });
      
      // Désactiver les champs employé
      employeeFields.forEach(field => {
        this.registerForm.get(field)?.disable();
      });
    } else {
      roleControl?.setValidators([Validators.required]);
      roleControl?.setValue('');
      
      // Désactiver les champs client
      clientFields.forEach(field => {
        this.registerForm.get(field)?.disable();
      });
      
      // Activer les champs employé
      employeeFields.forEach(field => {
        this.registerForm.get(field)?.enable();
      });
    }
    roleControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;
    const { username, email, password, firstName, lastName, phoneNumber, role } = formValue;

    if (this.registrationMode === 'client') {
      // ✅ Inscription client
      const clientData = {
        username,
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
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
            `Bienvenue ${response.firstName} ${response.lastName} ! Votre compte client a été créé avec succès.`,
            'Inscription réussie'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
          this.toastr.error(this.errorMessage, 'Erreur d\'inscription');
        }
      });
    } else {
      // ✅ Inscription employé
      const employeeData = {
        username,
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role,
        department: formValue.department,
        position: formValue.position,
        address: formValue.address,
        city: formValue.city,
        country: formValue.country
      };

      this.authService.registerEmployee(employeeData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success(
            `Bienvenue ${response.firstName} ${response.lastName} ! Votre compte a été créé avec succès.`,
            'Inscription réussie'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
          this.toastr.error(this.errorMessage, 'Erreur d\'inscription');
        }
      });
    }
  }

  // Getters
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get role() { return this.registerForm.get('role'); }
  get department() { return this.registerForm.get('department'); }
  get position() { return this.registerForm.get('position'); }
  get dateOfBirth() { return this.registerForm.get('dateOfBirth'); }
  get address() { return this.registerForm.get('address'); }
  get city() { return this.registerForm.get('city'); }
  get country() { return this.registerForm.get('country'); }
  get placeOfBirth() { return this.registerForm.get('placeOfBirth'); }
  get nationality() { return this.registerForm.get('nationality'); }
  get profession() { return this.registerForm.get('profession'); }
}
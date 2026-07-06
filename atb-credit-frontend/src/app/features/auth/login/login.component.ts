// features/auth/login/login.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';
import { Subscription, debounceTime, distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-login',
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
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private snackBar = inject(MatSnackBar);

  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage = '';
  errorCode = '';
  isCheckingAccount = false;
  private subscriptions: Subscription = new Subscription();

  // Options pour les messages
  readonly ERROR_MESSAGES = {
    ACCOUNT_INACTIVE: {
      title: 'Compte désactivé',
      message: 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.'
    },
    ACCOUNT_LOCKED: {
      title: 'Compte verrouillé',
      message: 'Votre compte est verrouillé. Veuillez contacter l\'administrateur.'
    },
    UNAUTHORIZED: {
      title: 'Erreur de connexion',
      message: 'Email ou mot de passe incorrect'
    },
    USER_NOT_FOUND: {
      title: 'Compte inexistant',
      message: 'Aucun compte trouvé avec cet email.'
    }
  };

  ngOnInit(): void {
    // Rediriger vers le dashboard si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initForm();
    this.setupEmailValidation();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Vérifier le statut du compte en temps réel lorsque l'email change
   */
  setupEmailValidation(): void {
    const emailControl = this.loginForm.get('email');
    if (emailControl) {
      this.subscriptions.add(
        emailControl.valueChanges
          .pipe(
            debounceTime(800),
            distinctUntilChanged(),
            filter(value => value && value.length > 3 && this.email?.valid)
          )
          .subscribe(email => {
            if (email && this.email?.valid) {
              this.checkAccountStatus(email);
            }
          })
      );
    }
  }

  /**
   * Vérifier le statut du compte avant la soumission
   */
  checkAccountStatus(email: string): void {
    this.isCheckingAccount = true;
    
    this.authService.checkAccountStatus(email).subscribe({
      next: (status) => {
        this.isCheckingAccount = false;
        
        if (!status.active) {
          this.errorMessage = this.ERROR_MESSAGES.ACCOUNT_INACTIVE.message;
          this.errorCode = 'ACCOUNT_INACTIVE';
          this.snackBar.open(
            this.ERROR_MESSAGES.ACCOUNT_INACTIVE.message,
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          // Désactiver le champ mot de passe
          this.password?.disable();
        } else if (status.locked) {
          this.errorMessage = this.ERROR_MESSAGES.ACCOUNT_LOCKED.message;
          this.errorCode = 'ACCOUNT_LOCKED';
          this.snackBar.open(
            this.ERROR_MESSAGES.ACCOUNT_LOCKED.message,
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          this.password?.disable();
        } else {
          // Compte actif, réactiver le champ mot de passe
          this.password?.enable();
          this.errorMessage = '';
          this.errorCode = '';
        }
      },
      error: (error) => {
        this.isCheckingAccount = false;
        if (error.status === 404) {
          this.errorMessage = this.ERROR_MESSAGES.USER_NOT_FOUND.message;
          this.errorCode = 'USER_NOT_FOUND';
          this.password?.disable();
        } else {
          // Erreur serveur, on laisse passer pour ne pas bloquer l'utilisateur
          console.error('Erreur lors de la vérification du compte:', error);
          this.password?.enable();
        }
      }
    });
  }

  /**
   * Soumettre le formulaire de connexion
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.errorCode = '';
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
        next: (response) => {
            this.isLoading = false;
            this.toastr.success(
                `Bienvenue ${response.firstName} ${response.lastName} !`,
                'Connexion réussie',
                { timeOut: 3000 }
            );
            this.router.navigate(['/dashboard']);
        },
        error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.message || 'Email ou mot de passe incorrect';
            this.errorCode = error.errorCode || '';

            let title = 'Erreur de connexion';
            let message = this.errorMessage;

            if (this.errorCode === 'ACCOUNT_INACTIVE' || this.errorCode === 'CLIENT_INACTIVE') {
                title = 'Compte désactivé';
                message = 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.';
                this.password?.disable();
            } else if (this.errorCode === 'ACCOUNT_LOCKED') {
                title = 'Compte verrouillé';
                message = 'Votre compte est verrouillé. Veuillez contacter l\'administrateur.';
                this.password?.disable();
            }

            this.toastr.error(message, title, { timeOut: 5000 });
        }
    });
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.loginForm.reset();
    this.errorMessage = '';
    this.errorCode = '';
    this.password?.enable();
    this.email?.setErrors(null);
  }

  /**
   * Getters pour les contrôles du formulaire
   */
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  /**
   * Vérifier si le champ email a une erreur
   */
  hasEmailError(): boolean {
    const control = this.email;
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  /**
   * Vérifier si le champ password a une erreur
   */
  hasPasswordError(): boolean {
    const control = this.password;
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  /**
   * Obtenir le message d'erreur pour l'email
   */
  getEmailErrorMessage(): string {
    const control = this.email;
    if (control?.hasError('required')) {
      return 'L\'email est requis';
    }
    if (control?.hasError('email')) {
      return 'Veuillez saisir un email valide';
    }
    return '';
  }

  /**
   * Obtenir le message d'erreur pour le mot de passe
   */
  getPasswordErrorMessage(): string {
    const control = this.password;
    if (control?.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    if (control?.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }
}
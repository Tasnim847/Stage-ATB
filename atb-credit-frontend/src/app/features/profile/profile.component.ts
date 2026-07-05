import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select'; // ✅ Ajouté
import { MatTooltipModule } from '@angular/material/tooltip'; // ✅ Ajouté
import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatSelectModule,      // ✅ Ajouté
    MatTooltipModule      // ✅ Ajouté
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  skillsForm!: FormGroup;
  isLoading = true;
  isUpdating = false;
  isPasswordUpdating = false;
  userRole: string = '';
  user: any = null;
  profile: any = null;
  activeTab: number = 0;
  
  // Données de l'utilisateur
  userStats = {
    projects: 12,
    events: 8,
    completedTasks: 34,
    rating: 4.8
  };

  skills = [
    { name: 'UI/UX Design', level: 85, color: 'primary' },
    { name: 'Website Design', level: 70, color: 'accent' },
    { name: 'App Design', level: 60, color: 'warn' },
    { name: 'Frontend Development', level: 75, color: 'primary' },
    { name: 'Backend Development', level: 50, color: 'accent' }
  ];

  events = [
    { title: 'Learn UX Design', progress: 85, days: 30, color: '#4CAF50' },
    { title: 'Learn UI/UX Design', progress: 60, days: 30, color: '#FF9800' },
    { title: 'Master Angular', progress: 40, days: 30, color: '#F44336' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.loadProfile();
  }

  initializeForms() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      department: [''],
      email: [{ value: '', disabled: true }],
      phoneNumber: [''],
      address: [''],
      city: [''],
      country: [''],
      postalCode: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.skillsForm = this.fb.group({
      newSkill: [''],
      skillLevel: ['intermediate']
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  loadProfile() {
    this.isLoading = true;
    this.user = this.authService.getUserInfo();
    this.userRole = this.authService.getUserRole() || '';

    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.patchFormValues(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  patchFormValues(data: any) {
    this.profileForm.patchValue({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      department: data.department || 'Web Development',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      city: data.city || '',
      country: data.country || '',
      postalCode: data.postalCode || ''
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.isUpdating = true;
    const formData = this.profileForm.value;

    this.profileService.updateProfile(formData).subscribe({
      next: (data) => {
        this.snackBar.open('Profil mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.isUpdating = false;
        this.authService.updateUserInfo(data);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.snackBar.open('Erreur lors de la mise à jour du profil', 'Fermer', { duration: 3000 });
        this.isUpdating = false;
      }
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;

    this.isPasswordUpdating = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.profileService.updatePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Mot de passe mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.isPasswordUpdating = false;
        this.passwordForm.reset();
        this.passwordForm.markAsPristine();
        this.passwordForm.markAsUntouched();
      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.snackBar.open(error.error?.message || 'Erreur lors de la mise à jour du mot de passe', 'Fermer', { duration: 3000 });
        this.isPasswordUpdating = false;
      }
    });
  }

  addSkill() {
    const skillName = this.skillsForm.get('newSkill')?.value;
    const skillLevel = this.skillsForm.get('skillLevel')?.value;
    
    if (skillName && skillName.trim()) {
      const levelMap: { [key: string]: number } = {
        'beginner': 30,
        'intermediate': 60,
        'advanced': 85,
        'master': 95
      };
      
      this.skills.push({
        name: skillName.trim(),
        level: levelMap[skillLevel] || 50,
        color: 'primary'
      });
      
      this.skillsForm.reset({
        newSkill: '',
        skillLevel: 'intermediate'
      });
      
      this.snackBar.open('Compétence ajoutée avec succès', 'Fermer', { duration: 2000 });
    }
  }

  removeSkill(index: number) {
    this.skills.splice(index, 1);
    this.snackBar.open('Compétence supprimée', 'Fermer', { duration: 2000 });
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'ANALYST': 'Analyste',
      'ADVISOR': 'Conseiller',
      'MANAGER': 'Manager',
      'CLIENT': 'Client'
    };
    return labels[role] || role;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getInitials(): string {
    const firstName = this.profileForm.get('firstName')?.value || '';
    const lastName = this.profileForm.get('lastName')?.value || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
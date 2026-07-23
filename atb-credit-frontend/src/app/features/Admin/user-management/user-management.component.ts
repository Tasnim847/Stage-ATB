// features/admin/user-management/user-management.component.ts - Ajout de la suppression

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog'; // ✅ AJOUTER MatDialog
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { UserManagementService } from '@core/services/user-management.service';
import { UserResponseDTO } from '@core/models/user-management.model';
import { AuthService } from '@core/services/auth.service';
import { ConfirmDialogComponent } from '@app/features/clients/confirm-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserManagementService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog); // ✅ AJOUTER

  users: UserResponseDTO[] = [];
  filteredUsers: UserResponseDTO[] = [];
  isLoading = true;
  searchQuery = '';
  currentUserId: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  Math = Math;

  // Formulaire de création
  showCreateForm = false;
  createForm!: FormGroup;
  isSubmitting = false;

  // Formulaire de modification
  editingUser: UserResponseDTO | null = null;
  editForm!: FormGroup;

  roles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'ANALYST', label: 'Analyste' },
    { value: 'ADVISOR', label: 'Conseiller' },
    { value: 'MANAGER', label: 'Responsable' },
    { value: 'CLIENT', label: 'Client' }
  ];

  ngOnInit(): void {
    const currentUser = this.authService.getUserInfo();
    console.log('👤 Current user:', currentUser);
    console.log('🔑 User role:', currentUser?.role);

    if (!currentUser || currentUser.role !== 'ADMIN') {
      this.toastr.warning('Vous devez être administrateur pour accéder à cette page', 'Accès refusé');
      this.router.navigate(['/dashboard']);
      return;
    }

    if (currentUser && currentUser.id) {
      this.currentUserId = currentUser.id;
    }
    this.initForms();
    this.loadData();
  }


initForms(): void {
  this.createForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phoneNumber: [''],
    role: ['', [Validators.required]],
    // ✅ AJOUTER LES CHAMPS SUPPLÉMENTAIRES
    department: [''],
    position: [''],
    address: [''],
    city: [''],
    country: ['']
  });

  this.editForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phoneNumber: [''],
    role: ['', [Validators.required]]
  });
}

  loadData(): void {
    this.isLoading = true;

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Users loaded:', users.length);
        this.users = users;
        this.filteredUsers = users;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        this.toastr.error('Erreur lors du chargement des utilisateurs', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  // ========== RECHERCHE ==========
  searchUsers(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = this.users;
      this.updatePagination();
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
    this.updatePagination();
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredUsers = this.users;
    this.updatePagination();
    this.currentPage = 1;
  }

  // ========== PAGINATION ==========
  get paginatedUsers(): UserResponseDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredUsers.length);
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // ========== CRÉATION ==========
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset();
    }
  }

  createUser(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les erreurs du formulaire', 'Formulaire invalide');
      return;
    }

    this.isSubmitting = true;

    this.userService.createUser(this.createForm.value).subscribe({
      next: () => {
        this.toastr.success('Utilisateur créé avec succès', 'Succès');
        this.toggleCreateForm();
        this.loadData();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.toastr.error(error.error?.message || 'Erreur lors de la création', 'Erreur');
        this.isSubmitting = false;
      }
    });
  }

  // ========== MODIFICATION ==========
  openEditDialog(user: UserResponseDTO): void {
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas modifier votre propre compte', 'Action non autorisée');
      return;
    }

    this.editingUser = user;
    this.editForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      role: user.role
    });
  }

  closeEditDialog(): void {
    this.editingUser = null;
    this.editForm.reset();
  }

  updateUser(): void {
    if (this.editForm.invalid || !this.editingUser) return;

    this.isSubmitting = true;

    this.userService.updateUser(this.editingUser.id, this.editForm.value).subscribe({
      next: () => {
        this.toastr.success('Utilisateur modifié avec succès', 'Succès');
        this.closeEditDialog();
        this.loadData();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.toastr.error('Erreur lors de la modification', 'Erreur');
        this.isSubmitting = false;
      }
    });
  }

  // ========== SUPPRESSION ==========
  /**
   * ✅ Supprimer un utilisateur avec dialogue de confirmation
   */
  deleteUser(user: UserResponseDTO): void {
    // Vérifier si c'est l'utilisateur courant
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas supprimer votre propre compte', 'Action non autorisée');
      return;
    }

    // Vérifier si c'est le dernier administrateur
    const admins = this.users.filter(u => u.role === 'ADMIN' && u.active);
    if (user.role === 'ADMIN' && admins.length <= 1) {
      this.toastr.warning('Impossible de supprimer le dernier administrateur', 'Action non autorisée');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>${user.firstName} ${user.lastName}</strong> ?<br><br>
                  <span style="color: #d32f2f; font-weight: 500;">⚠️ Cette action est irréversible.</span>`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDeleteUser(user);
      }
    });
  }

  /**
   * ✅ Exécution de la suppression
   */
  private performDeleteUser(user: UserResponseDTO): void {
    this.isLoading = true;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastr.success(
          `L'utilisateur ${user.firstName} ${user.lastName} a été supprimé avec succès`,
          'Succès'
        );
        this.loadData();
      },
      error: (error) => {
        console.error('❌ Error deleting user:', error);
        let errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        this.toastr.error(errorMessage, 'Erreur');
        this.isLoading = false;
      }
    });
  }

  // ========== DÉSACTIVATION / ACTIVATION ==========
  toggleActive(user: UserResponseDTO): void {
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas modifier votre propre compte', 'Action non autorisée');
      return;
    }

    const action = user.active ? 'désactiver' : 'activer';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `Confirmer la ${action}`,
        message: `Voulez-vous ${action} l'utilisateur ${user.firstName} ${user.lastName} ?`,
        confirmText: action === 'désactiver' ? 'Désactiver' : 'Activer',
        cancelText: 'Annuler',
        confirmColor: action === 'désactiver' ? 'warn' : 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const serviceCall = user.active
          ? this.userService.deactivateUser(user.id)
          : this.userService.activateUser(user.id);

        serviceCall.subscribe({
          next: () => {
            this.toastr.success(`Utilisateur ${action}é avec succès`, 'Succès');
            this.loadData();
          },
          error: (error) => {
            console.error('Error toggling user status:', error);
            this.toastr.error('Erreur lors de l\'opération', 'Erreur');
          }
        });
      }
    });
  }

  // ========== RÉINITIALISATION DU MOT DE PASSE ==========
  resetPassword(user: UserResponseDTO): void {
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas réinitialiser votre propre mot de passe', 'Action non autorisée');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Réinitialiser le mot de passe',
        message: `Voulez-vous réinitialiser le mot de passe de ${user.firstName} ${user.lastName} ?<br><br>
                  <span style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">
                    Nouveau mot de passe: ATB2024!
                  </span>`,
        confirmText: 'Réinitialiser',
        cancelText: 'Annuler',
        confirmColor: 'primary',
        icon: 'lock_reset'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.resetPassword(user.id).subscribe({
          next: () => {
            this.toastr.success(
              `Mot de passe réinitialisé avec succès. Nouveau mot de passe: ATB2024!`,
              'Succès'
            );
            this.loadData();
          },
          error: (error) => {
            console.error('Error resetting password:', error);
            this.toastr.error('Erreur lors de la réinitialisation', 'Erreur');
          }
        });
      }
    });
  }

  // ========== VERROUILLAGE / DÉVERROUILLAGE ==========
  toggleLocked(user: UserResponseDTO): void {
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas modifier votre propre compte', 'Action non autorisée');
      return;
    }

    const action = user.locked ? 'déverrouiller' : 'verrouiller';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `Confirmer la ${action}`,
        message: `Voulez-vous ${action} l'utilisateur ${user.firstName} ${user.lastName} ?`,
        confirmText: action === 'déverrouiller' ? 'Déverrouiller' : 'Verrouiller',
        cancelText: 'Annuler',
        confirmColor: action === 'déverrouiller' ? 'primary' : 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const serviceCall = user.locked
          ? this.userService.unlockUser(user.id)
          : this.userService.lockUser(user.id);

        serviceCall.subscribe({
          next: () => {
            this.toastr.success(`Utilisateur ${action}é avec succès`, 'Succès');
            this.loadData();
          },
          error: (error) => {
            console.error('Error toggling lock status:', error);
            this.toastr.error('Erreur lors de l\'opération', 'Erreur');
          }
        });
      }
    });
  }

  // ========== UTILITAIRES ==========
  getRoleLabel(role: string): string {
    const found = this.roles.find(r => r.value === role);
    return found ? found.label : role;
  }

  getInitials(user: UserResponseDTO): string {
    return (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '');
  }

  canModifyUser(user: UserResponseDTO): boolean {
    return user.id !== this.currentUserId;
  }

  getStatusColor(user: UserResponseDTO): string {
    if (!user.active) return 'inactive';
    if (user.locked) return 'locked';
    return 'active';
  }

  getStatusLabel(user: UserResponseDTO): string {
    if (!user.active) return 'Inactif';
    if (user.locked) return 'Verrouillé';
    return 'Actif';
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': '#27ae60',
      'ANALYST': '#2980b9',
      'ADVISOR': '#8e44ad',
      'MANAGER': '#e67e22',
      'CLIENT': '#c0392b'
    };
    return colors[role] || '#95a5a6';
  }

  // ========== GESTION DU RÔLE (select natif) ==========
  updateRole(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement && selectElement.value) {
      this.createForm.patchValue({ role: selectElement.value });
      this.createForm.get('role')?.markAsTouched();
    }
  }
}
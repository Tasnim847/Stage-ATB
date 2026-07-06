// features/admin/role-management/role-management.component.ts - COMPLET AVEC PAGINATION
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { RoleManagementService } from '@core/services/role-management.service';
import { RoleResponseDTO, RoleUpdateRequest } from '@core/models/role.model';
import { UserRole } from '@core/models/user.model';
import { PERMISSIONS, PERMISSION_CATEGORIES } from '@core/models/permissions.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  private roleService = inject(RoleManagementService);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  // ✅ Exposer Math pour le template
  Math = Math;

  users: RoleResponseDTO[] = [];
  filteredUsers: RoleResponseDTO[] = [];
  isLoading = true;
  searchQuery = '';
  selectedRole: string = '';

  totalUsers = 0;
  adminCount = 0;
  analystCount = 0;
  advisorCount = 0;
  managerCount = 0;
  clientCount = 0;

  // ✅ Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  roles = [
    { value: 'ADMIN', label: 'Administrateur', color: '#e8f5e9' },
    { value: 'ANALYST', label: 'Analyste', color: '#e3f2fd' },
    { value: 'ADVISOR', label: 'Conseiller', color: '#f3e5f5' },
    { value: 'MANAGER', label: 'Responsable', color: '#fff3e0' },
    { value: 'CLIENT', label: 'Client', color: '#fce4ec' }
  ];

  permissionCategories = PERMISSION_CATEGORIES;
  allPermissions = PERMISSIONS;

  selectedUser: RoleResponseDTO | null = null;
  editMode = false;
  currentUserId: string = '';
  editUser: RoleResponseDTO | null = null;

  ngOnInit(): void {
    const currentUser = this.authService.getUserInfo();
    if (currentUser && currentUser.id) {
      this.currentUserId = currentUser.id;
    }
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.roleService.getAllUsersWithRoles().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.updateStats();
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastr.error('Erreur lors du chargement des utilisateurs', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    this.totalUsers = this.users.length;
    this.adminCount = this.users.filter(u => u.role === 'ADMIN').length;
    this.analystCount = this.users.filter(u => u.role === 'ANALYST').length;
    this.advisorCount = this.users.filter(u => u.role === 'ADVISOR').length;
    this.managerCount = this.users.filter(u => u.role === 'MANAGER').length;
    this.clientCount = this.users.filter(u => u.role === 'CLIENT').length;
  }

  searchUsers(): void {
    if (!this.searchQuery.trim() && !this.selectedRole) {
      this.filteredUsers = this.users;
      this.updatePagination();
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user => {
      const matchSearch = !query || 
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query);
      
      const matchRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchSearch && matchRole;
    });
    this.updatePagination();
    this.currentPage = 1;
  }

  filterByRole(role: string): void {
    this.selectedRole = role;
    this.searchUsers();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedRole = '';
    this.filteredUsers = this.users;
    this.updatePagination();
    this.currentPage = 1;
  }

  // ✅ Getter pour les utilisateurs paginés
  get paginatedUsers(): RoleResponseDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredUsers.length);
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  // ✅ Changer de page
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  // ✅ Page précédente
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ✅ Page suivante
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // ✅ Calculer le total des pages
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  // ✅ Obtenir les numéros de page à afficher
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

  openEditDialog(user: RoleResponseDTO): void {
    console.log('📝 Opening edit dialog for:', user.firstName, user.lastName);
    console.log('👤 Current user ID:', this.currentUserId);
    console.log('🆔 Selected user ID:', user.id);
    console.log('🔒 Can modify:', this.canModifyUser(user));
    console.log('📋 Available roles:', this.roles);
    
    this.editUser = {
      ...user,
      permissions: user.permissions ? [...user.permissions] : []
    };
    this.selectedUser = this.editUser;
    this.editMode = true;
  }

  closeEditDialog(): void {
    this.editUser = null;
    this.selectedUser = null;
    this.editMode = false;
  }

  saveUserRole(): void {
    if (!this.editUser) return;

    if (this.editUser.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas modifier votre propre rôle', 'Action non autorisée');
      return;
    }

    const request: RoleUpdateRequest = {
      userId: this.editUser.id,
      newRole: this.editUser.role,
      permissions: this.editUser.permissions || [],
      active: this.editUser.active,
      locked: this.editUser.locked
    };

    this.isLoading = true;

    this.roleService.updateUserRole(request).subscribe({
      next: (response) => {
        this.toastr.success(
          `Rôle de ${response.firstName} ${response.lastName} mis à jour vers ${this.getRoleLabel(response.role)}`,
          'Succès'
        );
        this.closeEditDialog();
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.toastr.error(error.error?.message || 'Erreur lors de la mise à jour du rôle', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  toggleActive(user: RoleResponseDTO): void {
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas modifier votre propre statut', 'Action non autorisée');
      return;
    }

    const action = user.active ? 'désactiver' : 'activer';
    if (!confirm(`Voulez-vous ${action} l'utilisateur ${user.firstName} ${user.lastName} ?`)) return;

    const request: RoleUpdateRequest = {
      userId: user.id,
      newRole: user.role,
      permissions: user.permissions || [],
      active: !user.active,
      locked: user.locked
    };

    this.isLoading = true;

    this.roleService.updateUserRole(request).subscribe({
      next: () => {
        this.toastr.success(`Utilisateur ${user.active ? 'désactivé' : 'activé'} avec succès`, 'Succès');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.toastr.error('Erreur lors du changement de statut', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  toggleLocked(user: RoleResponseDTO): void {
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas modifier votre propre verrouillage', 'Action non autorisée');
      return;
    }

    const action = user.locked ? 'déverrouiller' : 'verrouiller';
    if (!confirm(`Voulez-vous ${action} l'utilisateur ${user.firstName} ${user.lastName} ?`)) return;

    const request: RoleUpdateRequest = {
      userId: user.id,
      newRole: user.role,
      permissions: user.permissions || [],
      active: user.active,
      locked: !user.locked
    };

    this.isLoading = true;

    this.roleService.updateUserRole(request).subscribe({
      next: () => {
        this.toastr.success(`Utilisateur ${user.locked ? 'déverrouillé' : 'verrouillé'} avec succès`, 'Succès');
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error toggling lock status:', error);
        this.toastr.error('Erreur lors du changement de verrouillage', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  getRoleLabel(role: string | undefined | null): string {
    if (!role) return 'Non défini';
    const found = this.roles.find(r => r.value === role);
    return found ? found.label : role;
  }

  getRoleColor(role: string | undefined | null): string {
    if (!role) return '#e0e0e0';
    const found = this.roles.find(r => r.value === role);
    return found ? found.color : '#e0e0e0';
  }

  getInitials(user: RoleResponseDTO): string {
    return (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '');
  }

  hasPermission(user: RoleResponseDTO, permissionId: string): boolean {
    return user.permissions?.includes(permissionId) || false;
  }

  togglePermission(permissionId: string): void {
    if (!this.editUser) return;
    
    const index = this.editUser.permissions.indexOf(permissionId);
    if (index === -1) {
      this.editUser.permissions.push(permissionId);
    } else {
      this.editUser.permissions.splice(index, 1);
    }
  }

  getPermissionsForRole(role: UserRole): any[] {
    return this.allPermissions[role] || [];
  }

  getPermissionsByCategory(category: string): any[] {
    return Object.values(this.allPermissions).flat().filter(p => p.category === category);
  }

  resetUserRole(user: RoleResponseDTO): void {
    if (user.id === this.currentUserId) {
      this.toastr.warning('Vous ne pouvez pas réinitialiser votre propre rôle', 'Action non autorisée');
      return;
    }

    if (!confirm(`Voulez-vous réinitialiser le rôle de ${user.firstName} ${user.lastName} à ANALYST par défaut ?`)) {
      return;
    }

    this.isLoading = true;

    this.roleService.resetUserRole(user.id).subscribe({
      next: (response) => {
        this.toastr.success(
          `Rôle de ${response.firstName} ${response.lastName} réinitialisé à ${this.getRoleLabel(response.role)}`,
          'Succès'
        );
        this.loadData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error resetting role:', error);
        this.toastr.error('Erreur lors de la réinitialisation du rôle', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  canResetRole(user: RoleResponseDTO): boolean {
    if (user.id === this.currentUserId) return false;
    if (user.role === 'CLIENT') return false;
    return true;
  }

  canModifyUser(user: RoleResponseDTO): boolean {
    if (!user) return false;
    if (user.id === this.currentUserId) return false;
    return true;
  }
}
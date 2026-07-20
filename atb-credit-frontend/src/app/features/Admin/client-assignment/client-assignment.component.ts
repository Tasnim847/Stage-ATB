// features/admin/client-assignment/client-assignment.component.ts - CORRIGÉ
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { ClientResponseDTO } from '@core/models/client.model';
import { UserResponse } from '@core/models/user.model';
import { ClientAssignmentService, ClientService } from '@app/core/services';

@Component({
  selector: 'app-client-assignment',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatTabsModule
  ],
  templateUrl: './client-assignment.component.html',
  styleUrls: ['./client-assignment.component.css']
})
export class ClientAssignmentComponent implements OnInit {
  private clientService = inject(ClientService);
  private userService = inject(UserService);
  private assignmentService = inject(ClientAssignmentService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  // États
  isLoading = signal(false);
  selectedAdvisorId = signal<string>('');
  selectedAnalystId = signal<string>('');
  searchQuery = signal<string>('');
  showOnlyUnassigned = signal<boolean>(true);
  filterByAdvisor = signal<string>('');
  filterByAnalyst = signal<string>('');
  selectedClientIds = signal<string[]>([]);
  selectedTabIndex = signal<number>(0);

  // Données
  advisors = signal<UserResponse[]>([]);
  allAdvisors = signal<UserResponse[]>([]);
  allAnalysts = signal<UserResponse[]>([]);
  allClients = signal<ClientResponseDTO[]>([]);

  // Computed pour les conseillers
  filteredAdvisors = computed(() => {
    if (this.selectedTabIndex() === 1) {
      return this.advisors().filter(a => a.role === 'ADVISOR');
    } else if (this.selectedTabIndex() === 2) {
      return this.advisors().filter(a => a.role === 'ANALYST');
    }
    return this.advisors();
  });

  filteredClients = computed(() => {
    let clients = this.allClients();
    
    if (this.showOnlyUnassigned()) {
      clients = clients.filter(c => !c.advisorId && !c.analystId);
    }
    
    if (this.filterByAdvisor()) {
      clients = clients.filter(c => c.advisorId === this.filterByAdvisor());
    }
    
    if (this.filterByAnalyst()) {
      clients = clients.filter(c => c.analystId === this.filterByAnalyst());
    }
    
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      clients = clients.filter(client => 
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.clientNumber.toLowerCase().includes(query)
      );
    }
    
    return clients;
  });

  // Statistiques
  totalClients = computed(() => this.filteredClients().length);
  selectedCount = computed(() => this.selectedClientIds().length);
  unassignedCount = computed(() => this.allClients().filter(c => !c.advisorId && !c.analystId).length);
  assignedCount = computed(() => this.allClients().filter(c => c.advisorId || c.analystId).length);
  
  canAssignAdvisor = computed(() => 
    this.selectedAdvisorId() && 
    this.selectedClientIds().length > 0 && 
    !this.isLoading()
  );

  canAssignAnalyst = computed(() => 
    this.selectedAnalystId() && 
    this.selectedClientIds().length > 0 && 
    !this.isLoading()
  );

  canUnassign = computed(() => 
    this.selectedClientIds().length > 0 && 
    !this.isLoading()
  );

  advisorCount = computed(() => this.advisors().filter(a => a.role === 'ADVISOR').length);
  analystCount = computed(() => this.advisors().filter(a => a.role === 'ANALYST').length);

  ngOnInit(): void {
    const user = this.authService.getUserInfo();
    console.log('👤 Current user:', user);
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);
    
    this.userService.getUsersByRole('ADVISOR').subscribe({
      next: (advisors) => {
        this.allAdvisors.set(advisors.filter(a => a.active));
        
        this.userService.getUsersByRole('ANALYST').subscribe({
          next: (analysts) => {
            this.allAnalysts.set(analysts.filter(a => a.active));
            this.advisors.set([...this.allAdvisors(), ...this.allAnalysts()]);
            
            this.clientService.getAllClients().subscribe({
              next: (clients: ClientResponseDTO[]) => {
                // ✅ Typage explicite
                this.allClients.set(clients);
                this.isLoading.set(false);
              },
              error: () => {
                this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
                this.isLoading.set(false);
              }
            });
          },
          error: () => {
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des conseillers', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  // ============================================
  // GESTION DES ONGLETS
  // ============================================

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    this.selectedAdvisorId.set('');
    this.selectedAnalystId.set('');
    this.selectedClientIds.set([]);
  }

  // ============================================
  // SÉLECTION DES CLIENTS
  // ============================================

  toggleClientSelection(clientId: string): void {
    const current = this.selectedClientIds();
    const index = current.indexOf(clientId);
    
    if (index === -1) {
      this.selectedClientIds.set([...current, clientId]);
    } else {
      this.selectedClientIds.set(current.filter(id => id !== clientId));
    }
  }

  isClientSelected(clientId: string): boolean {
    return this.selectedClientIds().includes(clientId);
  }

  selectAll(): void {
    this.selectedClientIds.set(this.filteredClients().map(c => c.id));
  }

  deselectAll(): void {
    this.selectedClientIds.set([]);
  }

  // ============================================
  // AFFECTATION AU CONSEILLER
  // ============================================

  assignAdvisorToSelectedClients(): void {
    if (!this.canAssignAdvisor()) return;

    this.isLoading.set(true);

    this.assignmentService.assignAdvisorToMultipleClients({
      advisorId: this.selectedAdvisorId(),
      clientIds: this.selectedClientIds()
    }).subscribe({
      next: (updatedClients: ClientResponseDTO[]) => {
        this.snackBar.open(
          `${updatedClients.length} client(s) affecté(s) au conseiller avec succès`, 
          'Fermer', 
          { duration: 3000 }
        );
        this.selectedClientIds.set([]);
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error assigning advisor:', error);
        this.snackBar.open('Erreur lors de l\'affectation', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  assignAdvisorToClient(clientId: string, advisorId: string): void {
    if (!advisorId) return;
    
    this.isLoading.set(true);

    this.assignmentService.assignAdvisorToClient(clientId, advisorId).subscribe({
      next: () => {
        this.snackBar.open('Conseiller affecté avec succès', 'Fermer', { duration: 3000 });
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error assigning advisor to client:', error);
        this.snackBar.open('Erreur lors de l\'affectation du conseiller', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  removeAdvisorFromClient(clientId: string): void {
    if (!confirm('Voulez-vous retirer le conseiller de ce client ?')) return;
    
    this.isLoading.set(true);
    
    this.assignmentService.removeAdvisorFromClient(clientId).subscribe({
      next: () => {
        this.snackBar.open('Conseiller retiré avec succès', 'Fermer', { duration: 3000 });
        this.selectedClientIds.set([]);
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error removing advisor:', error);
        this.snackBar.open('Erreur lors du retrait du conseiller', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  removeAdvisorFromSelectedClients(): void {
    if (this.selectedClientIds().length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins un client', 'Fermer', { duration: 3000 });
      return;
    }

    if (!confirm(`Voulez-vous retirer le conseiller de ${this.selectedClientIds().length} client(s) ?`)) return;
    
    this.isLoading.set(true);
    
    const requests = this.selectedClientIds().map(id => 
      this.assignmentService.removeAdvisorFromClient(id)
    );
    
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.snackBar.open(
          `${this.selectedClientIds().length} client(s) désaffecté(s) avec succès`, 
          'Fermer', 
          { duration: 3000 }
        );
        this.selectedClientIds.set([]);
        this.loadAllData();
        this.isLoading.set(false);
      })
      .catch((error: any) => {
        console.error('Error removing advisors:', error);
        this.snackBar.open('Erreur lors de la désaffectation', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      });
  }

  // ============================================
  // AFFECTATION À L'ANALYSTE
  // ============================================

  assignAnalystToSelectedClients(): void {
    if (!this.canAssignAnalyst()) return;

    this.isLoading.set(true);

    const requests = this.selectedClientIds().map(clientId =>
      this.assignmentService.assignAnalystToClient(clientId, this.selectedAnalystId())
    );
    
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.snackBar.open(
          `${this.selectedClientIds().length} client(s) affecté(s) à l'analyste avec succès`,
          'Fermer',
          { duration: 3000 }
        );
        this.selectedClientIds.set([]);
        this.loadAllData();
        this.isLoading.set(false);
      })
      .catch((error: any) => {
        console.error('Error assigning analysts:', error);
        this.snackBar.open('Erreur lors de l\'affectation des analystes', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      });
  }

  assignAnalystToClient(clientId: string, analystId: string): void {
    if (!analystId) return;
    
    this.isLoading.set(true);

    this.assignmentService.assignAnalystToClient(clientId, analystId).subscribe({
      next: () => {
        this.snackBar.open('Analyste affecté avec succès', 'Fermer', { duration: 3000 });
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error assigning analyst:', error);
        this.snackBar.open('Erreur lors de l\'affectation de l\'analyste', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  removeAnalystFromClient(clientId: string): void {
    if (!confirm('Voulez-vous retirer l\'analyste de ce client ?')) return;
    
    this.isLoading.set(true);
    
    this.assignmentService.removeAnalystFromClient(clientId).subscribe({
      next: () => {
        this.snackBar.open('Analyste retiré avec succès', 'Fermer', { duration: 3000 });
        this.selectedClientIds.set([]);
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error removing analyst:', error);
        this.snackBar.open('Erreur lors du retrait de l\'analyste', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'ADVISOR': 'Conseiller',
      'ANALYST': 'Analyste'
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADVISOR': '#8e44ad',
      'ANALYST': '#2980b9'
    };
    return colors[role] || '#95a5a6';
  }

  getAdvisorName(advisorId: string): string {
    if (!advisorId) return 'Non assigné';
    const advisor = this.advisors().find(a => a.id === advisorId);
    return advisor ? `${advisor.firstName} ${advisor.lastName}` : 'Conseiller inconnu';
  }

  getAdvisorRole(advisorId: string): string {
    if (!advisorId) return '';
    const advisor = this.advisors().find(a => a.id === advisorId);
    return advisor ? this.getRoleLabel(advisor.role) : '';
  }

  getAdvisorColor(advisorId: string): string {
    if (!advisorId) return '#95a5a6';
    const advisor = this.advisors().find(a => a.id === advisorId);
    return advisor ? this.getRoleColor(advisor.role) : '#95a5a6';
  }

  getInitials(client: ClientResponseDTO): string {
    return (client.firstName?.charAt(0) || '') + (client.lastName?.charAt(0) || '');
  }

  getInitialsAdvisor(advisor: UserResponse): string {
    return (advisor.firstName?.charAt(0) || '') + (advisor.lastName?.charAt(0) || '');
  }

  getFullName(client: ClientResponseDTO): string {
    return `${client.firstName || ''} ${client.lastName || ''}`.trim();
  }

  refreshData(): void {
    this.loadAllData();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterByAdvisor.set('');
    this.filterByAnalyst.set('');
    this.showOnlyUnassigned.set(true);
    this.selectedAdvisorId.set('');
    this.selectedAnalystId.set('');
    this.selectedClientIds.set([]);
  }
}
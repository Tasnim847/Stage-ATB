// features/admin/client-assignment/client-assignment.component.ts - COMPLET
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
import { UserService } from '@core/services/user.service';
import { ClientService } from '@core/services/client.service';
import { AuthService } from '@core/services/auth.service';
import { ClientAssignmentService } from '@core/services/client-assignment.service';
import { ClientResponseDTO } from '@core/models/client.model';
import { UserResponse } from '@core/models/user.model';

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
    MatSlideToggleModule
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
  searchQuery = signal<string>('');
  showOnlyUnassigned = signal<boolean>(true);
  filterByAdvisor = signal<string>(''); // ✅ Filtre par advisor
  selectedClientIds = signal<string[]>([]);

  // Données
  advisors = signal<UserResponse[]>([]);
  allClients = signal<ClientResponseDTO[]>([]);
  filteredClientsList = signal<ClientResponseDTO[]>([]);

  // Computed values
  filteredClients = computed(() => {
    let clients = this.allClients();
    
    // ✅ Filtre par statut (assigné/non assigné)
    if (this.showOnlyUnassigned()) {
      clients = clients.filter(c => !c.advisorId);
    }
    
    // ✅ Filtre par advisor
    if (this.filterByAdvisor()) {
      clients = clients.filter(c => c.advisorId === this.filterByAdvisor());
    }
    
    // ✅ Filtre par recherche
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

  // ✅ Statistiques
  totalClients = computed(() => this.filteredClients().length);
  selectedCount = computed(() => this.selectedClientIds().length);
  unassignedCount = computed(() => this.allClients().filter(c => !c.advisorId).length);
  assignedCount = computed(() => this.allClients().filter(c => c.advisorId).length);
  
  canAssign = computed(() => 
    this.selectedAdvisorId() && 
    this.selectedClientIds().length > 0 && 
    !this.isLoading()
  );

  canUnassign = computed(() => 
    this.selectedClientIds().length > 0 && 
    !this.isLoading()
  );

  ngOnInit(): void {
    const user = this.authService.getUserInfo();
    console.log('👤 Current user:', user);
    console.log('🔑 User role:', user?.role);
    console.log('🛡️ Is ADMIN?', user?.role === 'ADMIN');
    
    const token = this.authService.getToken();
    console.log('🔐 Token:', token ? 'Present' : 'Missing');
    
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);
    
    // Charger tous les conseillers
    this.userService.getUsersByRole('ADVISOR').subscribe({
      next: (advisors) => {
        console.log('✅ Advisors loaded:', advisors);
        this.advisors.set(advisors.filter(a => a.active));
        
        // Charger tous les clients
        this.clientService.getAllClients().subscribe({
          next: (clients) => {
            console.log('✅ All clients loaded:', clients);
            this.allClients.set(clients);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('❌ Error loading clients:', error);
            this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error loading advisors:', error);
        let errorMessage = 'Erreur lors du chargement des conseillers';
        if (error.status === 403) {
          errorMessage = 'Accès non autorisé. Vous devez être administrateur.';
        } else if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        }
        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        this.isLoading.set(false);
      }
    });
  }

  // ✅ Désaffecter un client (retirer le conseiller)
  unassignClient(clientId: string): void {
    if (!confirm('Voulez-vous retirer le conseiller de ce client ?')) return;
    
    this.isLoading.set(true);
    
    // Appel au service pour retirer l'advisor
    this.assignmentService.removeAdvisorFromClient(clientId).subscribe({
      next: () => {
        this.snackBar.open('Conseiller retiré avec succès', 'Fermer', { duration: 3000 });
        this.selectedClientIds.set([]);
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error unassigning client:', error);
        this.snackBar.open(
          error.error?.message || 'Erreur lors du retrait du conseiller', 
          'Fermer', 
          { duration: 3000 }
        );
        this.isLoading.set(false);
      }
    });
  }

  // ✅ Désaffecter plusieurs clients
  unassignSelectedClients(): void {
    if (this.selectedClientIds().length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins un client', 'Fermer', { duration: 3000 });
      return;
    }

    if (!confirm(`Voulez-vous retirer le conseiller de ${this.selectedClientIds().length} client(s) ?`)) return;
    
    this.isLoading.set(true);
    
    // Désaffecter chaque client sélectionné
    const unassignRequests = this.selectedClientIds().map(id => 
      this.assignmentService.removeAdvisorFromClient(id)
    );
    
    // Exécuter toutes les requêtes
    Promise.all(unassignRequests.map(req => req.toPromise()))
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
      .catch((error) => {
        console.error('Error unassigning clients:', error);
        this.snackBar.open('Erreur lors de la désaffectation', 'Fermer', { duration: 3000 });
        this.isLoading.set(false);
      });
  }

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

  assignSelectedClients(): void {
    if (!this.canAssign()) return;

    this.isLoading.set(true);

    this.assignmentService.assignAdvisorToMultipleClients({
      advisorId: this.selectedAdvisorId(),
      clientIds: this.selectedClientIds()
    }).subscribe({
      next: (updatedClients) => {
        this.snackBar.open(
          `${updatedClients.length} client(s) affecté(s) avec succès`, 
          'Fermer', 
          { duration: 3000 }
        );
        this.selectedClientIds.set([]);
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error assigning clients:', error);
        this.snackBar.open(
          error.error?.message || 'Erreur lors de l\'affectation', 
          'Fermer', 
          { duration: 3000 }
        );
        this.isLoading.set(false);
      }
    });
  }

  assignSingleClient(clientId: string, advisorId: string): void {
    if (!advisorId) return;
    
    this.isLoading.set(true);

    this.assignmentService.assignAdvisorToClient(clientId, advisorId).subscribe({
      next: () => {
        this.snackBar.open('Client affecté avec succès', 'Fermer', { duration: 3000 });
        this.loadAllData();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error assigning client:', error);
        this.snackBar.open(
          error.error?.message || 'Erreur lors de l\'affectation', 
          'Fermer', 
          { duration: 3000 }
        );
        this.isLoading.set(false);
      }
    });
  }

  getAdvisorName(advisorId: string): string {
    if (!advisorId) return 'Non assigné';
    const advisor = this.advisors().find(a => a.id === advisorId);
    return advisor ? `${advisor.firstName} ${advisor.lastName}` : 'Conseiller inconnu';
  }

  getAdvisorEmail(advisorId: string): string {
    if (!advisorId) return '';
    const advisor = this.advisors().find(a => a.id === advisorId);
    return advisor ? advisor.email : '';
  }

  selectAll(): void {
    this.selectedClientIds.set(this.filteredClients().map(c => c.id));
  }

  deselectAll(): void {
    this.selectedClientIds.set([]);
  }

  refreshData(): void {
    this.loadAllData();
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

  // ✅ Réinitialiser les filtres
  resetFilters(): void {
    this.searchQuery.set('');
    this.filterByAdvisor.set('');
    this.showOnlyUnassigned.set(true);
    this.selectedAdvisorId.set('');
    this.selectedClientIds.set([]);
  }
}
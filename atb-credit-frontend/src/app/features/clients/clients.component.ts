import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // ✅ AJOUTER
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '@core/services/client.service';
import { ClientResponseDTO } from '@core/models/client.model';
import { AuthService } from '@core/services/auth.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule // ✅ AJOUTER
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private dialog = inject(MatDialog); // ✅ AJOUTER

  clients: ClientResponseDTO[] = [];
  filteredClients: ClientResponseDTO[] = [];
  isLoading = true;
  searchQuery = '';
  currentUser: any = null;
  isAdvisor = false;

  // Statistiques
  totalClients = 0;
  activeClients = 0;
  inactiveClients = 0;

  ngOnInit(): void {
    this.currentUser = this.authService.getUserInfo();
    this.isAdvisor = this.authService.hasRole('ADVISOR');
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        if (this.isAdvisor && this.currentUser) {
          this.clients = clients.filter(client => client.advisorId === this.currentUser.id);
        } else {
          this.clients = clients;
        }
        
        this.filteredClients = this.clients;
        this.updateStats();
        this.isLoading = false;
        
        if (this.clients.length === 0) {
          this.toastr.info('Aucun client trouvé', 'Information');
        }
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        this.toastr.error('Erreur lors du chargement des clients', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    this.totalClients = this.clients.length;
    this.activeClients = this.clients.filter(c => c.active).length;
    this.inactiveClients = this.clients.filter(c => !c.active).length;
  }

  searchClients(): void {
    if (!this.searchQuery.trim()) {
      this.filteredClients = this.clients;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredClients = this.clients.filter(client => 
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.clientNumber.toLowerCase().includes(query) ||
      client.phoneNumber?.includes(query)
    );
  }

  createCreditForClient(clientId: string): void {
    const userRole = this.authService.getUserRole();
    
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      this.router.navigate(['/admin/credit-requests/new', clientId]);
    } else if (userRole === 'ADVISOR') {
      this.router.navigate(['/credit-requests/new', clientId]);
    } else {
      this.toastr.warning('Vous n\'avez pas les droits pour créer une demande de crédit', 'Accès refusé');
    }
  }

  // ✅ MÉTHODE deleteClient améliorée avec Dialog
  deleteClient(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le client ${name} ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        confirmColor: 'warn',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDeleteClient(id, name);
      }
    });
  }

  // ✅ Méthode privée pour effectuer la suppression
  private performDeleteClient(id: string, name: string): void {
    this.isLoading = true;
    
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.toastr.success(`Le client ${name} a été supprimé avec succès`, 'Succès');
        // Recharger la liste après suppression
        this.loadClients();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        
        // Gestion des erreurs spécifiques
        let errorMessage = 'Erreur lors de la suppression du client';
        if (error.status === 409) {
          errorMessage = 'Impossible de supprimer ce client car il a des demandes de crédit en cours';
        } else if (error.status === 403) {
          errorMessage = 'Vous n\'avez pas les droits pour supprimer ce client';
        } else if (error.status === 404) {
          errorMessage = 'Client non trouvé';
        }
        
        this.toastr.error(errorMessage, 'Erreur');
        this.isLoading = false;
      }
    });
  }

  toggleClientStatus(id: string, currentStatus: boolean): void {
    const action = currentStatus ? 'désactiver' : 'activer';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `Confirmer la ${action}`,
        message: `Voulez-vous ${action} ce client ?`,
        confirmText: action === 'désactiver' ? 'Désactiver' : 'Activer',
        cancelText: 'Annuler',
        confirmColor: action === 'désactiver' ? 'warn' : 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performToggleStatus(id, currentStatus);
      }
    });
  }

  private performToggleStatus(id: string, currentStatus: boolean): void {
    this.isLoading = true;
    const serviceCall = currentStatus 
      ? this.clientService.deactivateClient(id)
      : this.clientService.activateClient(id);
    
    serviceCall.subscribe({
      next: () => {
        this.toastr.success(`Client ${currentStatus ? 'désactivé' : 'activé'} avec succès`, 'Succès');
        this.loadClients();
      },
      error: (error) => {
        console.error('Erreur lors de l\'opération:', error);
        this.toastr.error('Erreur lors de l\'opération', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
  }

  getFullName(firstName: string, lastName: string): string {
    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  getStatusColor(active: boolean): string {
    return active ? 'active' : 'inactive';
  }

  getStatusLabel(active: boolean): string {
    return active ? 'Actif' : 'Inactif';
  }
}
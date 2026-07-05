import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider'; // ✅ AJOUTÉ
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService, ClientResponseDTO } from '@core/services/client.service';
import { AuthService } from '@core/services/auth.service';

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
    MatDividerModule // ✅ AJOUTÉ
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

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

  deleteClient(id: string, name: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client ${name} ?`)) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.toastr.success('Client supprimé avec succès', 'Succès');
          this.loadClients();
        },
        error: (error) => {
          this.toastr.error('Erreur lors de la suppression', 'Erreur');
        }
      });
    }
  }

  toggleClientStatus(id: string, currentStatus: boolean): void {
    const action = currentStatus ? 'désactiver' : 'activer';
    if (confirm(`Voulez-vous ${action} ce client ?`)) {
      const serviceCall = currentStatus 
        ? this.clientService.deactivateClient(id)
        : this.clientService.activateClient(id);
      
      serviceCall.subscribe({
        next: () => {
          this.toastr.success(`Client ${currentStatus ? 'désactivé' : 'activé'} avec succès`, 'Succès');
          this.loadClients();
        },
        error: (error) => {
          this.toastr.error('Erreur lors de l\'opération', 'Erreur');
        }
      });
    }
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
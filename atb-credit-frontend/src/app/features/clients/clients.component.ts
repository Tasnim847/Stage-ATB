import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
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
  displayedColumns: string[] = ['clientNumber', 'name', 'email', 'phone', 'advisor', 'status', 'actions'];
  
  isLoading = true;
  searchQuery = '';
  currentUser: any = null;
  isAdvisor = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getUserInfo();
    this.isAdvisor = this.authService.hasRole('ADVISOR');
    console.log('Current user:', this.currentUser);
    console.log('Is Advisor:', this.isAdvisor);
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    
    // ✅ Utiliser getAllClients pour récupérer tous les clients
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        console.log('Tous les clients reçus:', clients);
        
        // ✅ Filtrer uniquement les clients de l'ADVISOR connecté
        if (this.isAdvisor && this.currentUser) {
          this.clients = clients.filter(client => client.advisorId === this.currentUser.id);
          console.log('Clients de l\'advisor:', this.clients);
        } else {
          this.clients = clients;
        }
        
        this.filteredClients = this.clients;
        this.isLoading = false;
        console.log('Clients chargés:', this.clients.length);
        
        if (this.clients.length === 0) {
          this.toastr.info('Aucun client trouvé pour ce conseiller', 'Information');
        }
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        this.toastr.error('Erreur lors du chargement des clients', 'Erreur');
        this.isLoading = false;
      }
    });
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

  deleteClient(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
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
    if (currentStatus) {
      this.clientService.deactivateClient(id).subscribe({
        next: () => {
          this.toastr.success('Client désactivé', 'Succès');
          this.loadClients();
        },
        error: (error) => {
          this.toastr.error('Erreur lors de la désactivation', 'Erreur');
        }
      });
    } else {
      this.clientService.activateClient(id).subscribe({
        next: () => {
          this.toastr.success('Client activé', 'Succès');
          this.loadClients();
        },
        error: (error) => {
          this.toastr.error('Erreur lors de l\'activation', 'Erreur');
        }
      });
    }
  }
}
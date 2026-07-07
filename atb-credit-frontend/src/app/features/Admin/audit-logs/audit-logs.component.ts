// features/admin/audit-logs/audit-logs.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';
import { AuditLogService } from '@core/services/audit-log.service';
import { AuditLogResponseDTO, AuditLogFilterRequest, ActionType, AuditLogStatistics } from '@core/models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css']
})
export class AuditLogsComponent implements OnInit {
  private auditLogService = inject(AuditLogService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  logs: AuditLogResponseDTO[] = [];
  isLoading = true;
  totalItems = 0;
  pageSize = 20;
  currentPage = 0;

  // Filtres
  filters: AuditLogFilterRequest = {
    page: 0,
    size: 20,
    sortBy: 'timestamp',
    sortDirection: 'DESC'
  };

  // Statistiques
  statistics: AuditLogStatistics = {
    totalLogs: 0,
    successfulLogins: 0,
    failedLogins: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  };

  // Options
  actionTypes = Object.values(ActionType);
  statusOptions = ['SUCCESS', 'FAILURE', 'WARNING'];
  modules = ['Auth', 'Users', 'Clients', 'CreditRequests', 'Roles', 'System'];

  // Affichage
  showFilters = false;
  selectedLog: AuditLogResponseDTO | null = null;
  showDetailsModal = false;

  // Pagination
  Math = Math;

  ngOnInit(): void {
    // ✅ Vérifier le rôle de l'utilisateur
    const user = this.authService.getUserInfo();
    console.log('👤 Current user:', user);
    console.log('🔑 User role:', user?.role);
    console.log('🛡️ Is ADMIN?', user?.role === 'ADMIN');
    
    if (user?.role !== 'ADMIN') {
      this.toastr.warning('Vous devez être administrateur pour accéder à cette page', 'Accès refusé');
      this.router.navigate(['/dashboard']);
      return;
    }
    
    this.loadData();
    this.loadStatistics();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.auditLogService.getAuditLogs(this.filters).subscribe({
      next: (response) => {
        console.log('✅ Logs loaded:', response);
        this.logs = response.content || [];
        this.totalItems = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading audit logs:', error);
        this.toastr.error('Erreur lors du chargement des logs', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  loadStatistics(): void {
    this.auditLogService.getStatistics().subscribe({
      next: (stats) => {
        console.log('✅ Statistics loaded:', stats);
        this.statistics = stats;
      },
      error: (error) => {
        console.error('❌ Error loading statistics:', error);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.filters.page = event.pageIndex;
    this.filters.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  applyFilters(): void {
    this.filters.page = 0;
    this.currentPage = 0;
    this.loadData();
  }

  resetFilters(): void {
    this.filters = {
      page: 0,
      size: this.pageSize,
      sortBy: 'timestamp',
      sortDirection: 'DESC'
    };
    this.currentPage = 0;
    this.loadData();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  viewDetails(log: AuditLogResponseDTO): void {
    this.selectedLog = log;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedLog = null;
  }

  getActionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'LOGIN': 'Connexion',
      'LOGOUT': 'Déconnexion',
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'VIEW': 'Consultation',
      'EXPORT': 'Export',
      'IMPORT': 'Import',
      'ASSIGN': 'Affectation',
      'REASSIGN': 'Réaffectation',
      'ACTIVATE': 'Activation',
      'DEACTIVATE': 'Désactivation',
      'LOCK': 'Verrouillage',
      'UNLOCK': 'Déverrouillage',
      'RESET_PASSWORD': 'Réinitialisation MDP',
      'APPROVE': 'Approbation',
      'REJECT': 'Rejet',
      'VERIFY': 'Vérification'
    };
    return labels[type] || type;
  }

  getActionTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'LOGIN': '#4CAF50',
      'LOGOUT': '#FF9800',
      'CREATE': '#2196F3',
      'UPDATE': '#2196F3',
      'DELETE': '#F44336',
      'VIEW': '#9E9E9E',
      'EXPORT': '#9C27B0',
      'IMPORT': '#9C27B0',
      'ASSIGN': '#00BCD4',
      'REASSIGN': '#00BCD4',
      'ACTIVATE': '#4CAF50',
      'DEACTIVATE': '#F44336',
      'LOCK': '#FF5722',
      'UNLOCK': '#4CAF50',
      'RESET_PASSWORD': '#FF9800',
      'APPROVE': '#4CAF50',
      'REJECT': '#F44336',
      'VERIFY': '#2196F3'
    };
    return colors[type] || '#9E9E9E';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'SUCCESS': '#4CAF50',
      'FAILURE': '#F44336',
      'WARNING': '#FF9800'
    };
    return colors[status] || '#9E9E9E';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'SUCCESS': 'Succès',
      'FAILURE': 'Échec',
      'WARNING': 'Avertissement'
    };
    return labels[status] || status;
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
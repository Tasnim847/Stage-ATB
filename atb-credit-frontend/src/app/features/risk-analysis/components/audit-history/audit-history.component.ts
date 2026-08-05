import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { AuditCategory, AuditLog } from '@app/core/models/risk-analysis.model';

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.css']
})
export class AuditHistoryComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  displayedColumns: string[] = ['date', 'userName', 'userRole', 'category', 'action', 'details'];
  
  categories: string[] = ['SEUIL', 'MODELE', 'RATIO', 'REGLE', 'ALERTE', 'KYC', 'AML', 'IA', 'FRAUDE'];
  selectedCategory = '';
  searchUser = '';
  selectedDate = '';
  
  loading = false;
  error = '';

  constructor(private riskService: RiskAnalysisService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.logs = [];
    this.filteredLogs = [];
    
    this.riskService.getAuditLogs().subscribe({
      next: (data) => {
        this.logs = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des logs:', err);
        this.error = 'Impossible de charger les logs d\'audit';
        this.loading = false;
        this.logs = [
          { 
            id: '1', 
            date: new Date('2026-08-03T10:30:00'), 
            userId: '1', 
            userName: 'Admin', 
            userRole: 'ADMIN', 
            action: 'Modification du seuil d\'endettement', 
            category: AuditCategory.THRESHOLD, 
            details: 'Taux d\'endettement maximal modifié de 35% à 40%', 
            ipAddress: '192.168.1.1' 
          },
          { 
            id: '2', 
            date: new Date('2026-08-03T14:20:00'), 
            userId: '1', 
            userName: 'Admin', 
            userRole: 'ADMIN', 
            action: 'Activation du modèle IA', 
            category: AuditCategory.AI, 
            details: 'Modèle OpenAI activé avec température 0.7', 
            ipAddress: '192.168.1.1' 
          },
          { 
            id: '3', 
            date: new Date('2026-08-04T09:15:00'), 
            userId: '1', 
            userName: 'Admin', 
            userRole: 'ADMIN', 
            action: 'Nouvelle règle de fraude', 
            category: AuditCategory.FRAUD, 
            details: 'Règle "Documents modifiés" ajoutée avec poids 30', 
            ipAddress: '192.168.1.1' 
          }
        ];
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    if (!Array.isArray(this.logs)) {
      this.filteredLogs = [];
      return;
    }
    
    this.filteredLogs = this.logs.filter(log => {
      const matchCategory = !this.selectedCategory || log.category === this.selectedCategory;
      const matchUser = !this.searchUser || (log.userName && log.userName.toLowerCase().includes(this.searchUser.toLowerCase()));
      const matchDate = !this.selectedDate || (log.date && new Date(log.date).toDateString() === new Date(this.selectedDate).toDateString());
      return matchCategory && matchUser && matchDate;
    });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchUser = '';
    this.selectedDate = '';
    this.applyFilters();
  }

  refreshLogs(): void {
    this.loadLogs();
  }

  exportLogs(): void {
    console.log('Export des logs...');
  }
}
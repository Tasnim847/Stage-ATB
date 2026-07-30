// components/ceilings/ceilings.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { ParametrageService, CeilingConfig } from '@app/core/services/parametrage.service';
import { CeilingsDialogComponent } from '../ceilings-dialog/ceilings-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ceilings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './ceilings.component.html',
  styleUrls: ['./ceilings.component.css']
})
export class CeilingsComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  data: CeilingConfig[] = [];
  filteredData: CeilingConfig[] = [];
  loading = true;

  selectedStatus = '';
  selectedApprovalLevel = '';
  searchTerm = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.parametrageService.getCeilingConfigs().subscribe({
      next: (data) => {
        this.data = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.data = this.getMockData();
        this.applyFilters();
        this.loading = false;
        this.snackBar.open('Utilisation des données de test', 'Fermer', { duration: 3000 });
      }
    });
  }

  private getMockData(): CeilingConfig[] {
    return [
      {
        id: '1',
        creditTypeId: '1',
        creditTypeName: 'Crédit Personnel',
        minAmount: 1000,
        maxAmount: 50000,
        currency: 'TND',
        isActive: true,
        approvalLevel: 'ADVISOR',
        requiresAdditionalApproval: false,
        additionalApprovalLevel: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        creditTypeId: '2',
        creditTypeName: 'Crédit Automobile',
        minAmount: 5000,
        maxAmount: 150000,
        currency: 'TND',
        isActive: true,
        approvalLevel: 'ANALYST',
        requiresAdditionalApproval: false,
        additionalApprovalLevel: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        creditTypeId: '3',
        creditTypeName: 'Crédit Immobilier',
        minAmount: 10000,
        maxAmount: 500000,
        currency: 'TND',
        isActive: true,
        approvalLevel: 'MANAGER',
        requiresAdditionalApproval: true,
        additionalApprovalLevel: 'DIRECTOR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        creditTypeId: '3',
        creditTypeName: 'Crédit Immobilier',
        minAmount: 500000,
        maxAmount: 1000000,
        currency: 'TND',
        isActive: false,
        approvalLevel: 'DIRECTOR',
        requiresAdditionalApproval: true,
        additionalApprovalLevel: 'DIRECTOR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        creditTypeId: '4',
        creditTypeName: 'Crédit Professionnel',
        minAmount: 5000,
        maxAmount: 500000,
        currency: 'TND',
        isActive: true,
        approvalLevel: 'MANAGER',
        requiresAdditionalApproval: false,
        additionalApprovalLevel: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getActiveCount(): number {
    return this.data.filter(item => item.isActive).length;
  }

  getApprovalLevelCount(): number {
    return new Set(this.data.map(item => item.approvalLevel)).size;
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? item.isActive : !item.isActive);
      const matchApprovalLevel = !this.selectedApprovalLevel || item.approvalLevel === this.selectedApprovalLevel;
      const matchSearch = !this.searchTerm || 
        item.creditTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.currency?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.minAmount.toString().includes(this.searchTerm) ||
        item.maxAmount.toString().includes(this.searchTerm);
      return matchStatus && matchApprovalLevel && matchSearch;
    });
  }

  getApprovalLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'ADVISOR': 'Conseiller',
      'ANALYST': 'Analyste',
      'MANAGER': 'Responsable',
      'DIRECTOR': 'Directeur'
    };
    return labels[level] || level;
  }

  getApprovalLevelClass(level: string): string {
    return level.toLowerCase();
  }

  getApprovalLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'ADVISOR': 'linear-gradient(135deg, #059669, #047857)',
      'ANALYST': 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      'MANAGER': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'DIRECTOR': 'linear-gradient(135deg, #dc2626, #b91c1c)'
    };
    return colors[level] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  getApprovalLevelIcon(level: string): string {
    const icons: { [key: string]: string } = {
      'ADVISOR': 'person',
      'ANALYST': 'analytics',
      'MANAGER': 'admin_panel_settings',
      'DIRECTOR': 'star'
    };
    return icons[level] || 'person';
  }

  toggleStatus(item: CeilingConfig) {
    this.parametrageService.toggleCeilingStatus(item.id).subscribe({
      next: (updated) => {
        const index = this.data.findIndex(d => d.id === updated.id);
        if (index !== -1) this.data[index] = updated;
        this.applyFilters();
        this.snackBar.open(
          `Plafond ${updated.isActive ? 'activé' : 'désactivé'}`,
          'Fermer',
          { duration: 3000 }
        );
      },
      error: () => {
        item.isActive = !item.isActive;
        this.applyFilters();
        this.snackBar.open(
          `Plafond ${item.isActive ? 'activé' : 'désactivé'}`,
          'Fermer',
          { duration: 3000 }
        );
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CeilingsDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Plafond créé avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  openEditDialog(item: CeilingConfig) {
    const dialogRef = this.dialog.open(CeilingsDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { mode: 'edit', ceiling: item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Plafond modifié avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteCeiling(item: CeilingConfig) {
    if (confirm(`Voulez-vous vraiment supprimer ce plafond (${item.minAmount} - ${item.maxAmount} ${item.currency}) ?`)) {
      this.parametrageService.deleteCeilingConfig(item.id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Plafond supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.data = this.data.filter(d => d.id !== item.id);
          this.applyFilters();
          this.snackBar.open('Plafond supprimé', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/parametrage']);
  }
}
// components/ceilings/ceilings.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
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
import { ParametrageService, CeilingConfig } from '@app/core/services/parametrage.service';
import { CeilingsDialogComponent } from '../ceilings-dialog/ceilings-dialog.component';
import { Router } from '@angular/router'; // ✅ AJOUTER

@Component({
  selector: 'app-ceilings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './ceilings.component.html',
  styleUrls: ['./ceilings.component.css']
})
export class CeilingsComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router); // ✅ AJOUTER

  displayedColumns: string[] = ['creditType', 'minAmount', 'maxAmount', 'currency', 'approvalLevel', 'requiresAdditional', 'status', 'actions'];
  data: CeilingConfig[] = [];
  filteredData: CeilingConfig[] = [];
  loading = true;

  selectedStatus = '';
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
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des plafonds', 'Fermer', { duration: 3000 });
      }
    });
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? item.isActive : !item.isActive);
      const matchSearch = !this.searchTerm || 
        item.creditTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.currency?.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchStatus && matchSearch;
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
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
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
    if (confirm(`Voulez-vous vraiment supprimer ce plafond ?`)) {
      this.parametrageService.deleteCeilingConfig(item.id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Plafond supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/parametrage']);
  }
}
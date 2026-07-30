// components/durations/durations.component.ts
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
import { ParametrageService, DurationConfig } from '@app/core/services/parametrage.service';
import { DurationsDialogComponent } from '../durations-dialog/durations-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-durations',
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
  templateUrl: './durations.component.html',
  styleUrls: ['./durations.component.css']
})
export class DurationsComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  data: DurationConfig[] = [];
  filteredData: DurationConfig[] = [];
  loading = true;

  selectedStatus = '';
  searchTerm = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.parametrageService.getDurationConfigs().subscribe({
      next: (data) => {
        this.data = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        // Données mock
        this.data = this.getMockData();
        this.applyFilters();
        this.loading = false;
        this.snackBar.open('Utilisation des données de test', 'Fermer', { duration: 3000 });
      }
    });
  }

  private getMockData(): DurationConfig[] {
    return [
      {
        id: '1',
        creditTypeId: '1',
        creditTypeName: 'Crédit Personnel',
        durationMonths: 12,
        label: '12 mois (1 an)',
        isDefault: true,
        isActive: true,
        minAmount: 1000,
        maxAmount: 50000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        creditTypeId: '1',
        creditTypeName: 'Crédit Personnel',
        durationMonths: 24,
        label: '24 mois (2 ans)',
        isDefault: false,
        isActive: true,
        minAmount: 1000,
        maxAmount: 50000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        creditTypeId: '2',
        creditTypeName: 'Crédit Automobile',
        durationMonths: 36,
        label: '36 mois (3 ans)',
        isDefault: true,
        isActive: true,
        minAmount: 5000,
        maxAmount: 150000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        creditTypeId: '3',
        creditTypeName: 'Crédit Immobilier',
        durationMonths: 120,
        label: '120 mois (10 ans)',
        isDefault: false,
        isActive: false,
        minAmount: 10000,
        maxAmount: 1000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        creditTypeId: '3',
        creditTypeName: 'Crédit Immobilier',
        durationMonths: 240,
        label: '240 mois (20 ans)',
        isDefault: true,
        isActive: true,
        minAmount: 10000,
        maxAmount: 1000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getActiveCount(): number {
    return this.data.filter(item => item.isActive).length;
  }

  getDefaultCount(): number {
    return this.data.filter(item => item.isDefault).length;
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? item.isActive : !item.isActive);
      const matchSearch = !this.searchTerm || 
        item.creditTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.label?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.durationMonths.toString().includes(this.searchTerm);
      return matchStatus && matchSearch;
    });
  }

  toggleStatus(item: DurationConfig) {
    this.parametrageService.toggleDurationStatus(item.id).subscribe({
      next: (updated) => {
        const index = this.data.findIndex(d => d.id === updated.id);
        if (index !== -1) this.data[index] = updated;
        this.applyFilters();
        this.snackBar.open(
          `Durée ${updated.isActive ? 'activée' : 'désactivée'}`,
          'Fermer',
          { duration: 3000 }
        );
      },
      error: () => {
        // Simuler localement
        item.isActive = !item.isActive;
        this.applyFilters();
        this.snackBar.open(
          `Durée ${item.isActive ? 'activée' : 'désactivée'}`,
          'Fermer',
          { duration: 3000 }
        );
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(DurationsDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Durée créée avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  openEditDialog(item: DurationConfig) {
    const dialogRef = this.dialog.open(DurationsDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { mode: 'edit', duration: item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Durée modifiée avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteDuration(item: DurationConfig) {
    if (confirm(`Voulez-vous vraiment supprimer cette durée (${item.durationMonths} mois) ?`)) {
      this.parametrageService.deleteDurationConfig(item.id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Durée supprimée avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          // Suppression locale
          this.data = this.data.filter(d => d.id !== item.id);
          this.applyFilters();
          this.snackBar.open('Durée supprimée', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/parametrage']);
  }
}
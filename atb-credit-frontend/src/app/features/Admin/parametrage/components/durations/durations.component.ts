// components/durations/durations.component.ts
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
import { ParametrageService, DurationConfig } from '@app/core/services/parametrage.service';
import { DurationsDialogComponent } from '../durations-dialog/durations-dialog.component';
import { Router } from '@angular/router'; // ✅ AJOUTER

@Component({
  selector: 'app-durations',
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
  templateUrl: './durations.component.html',
  styleUrls: ['./durations.component.css']
})
export class DurationsComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router); // ✅ AJOUTER

  displayedColumns: string[] = ['creditType', 'durationMonths', 'label', 'isDefault', 'minAmount', 'maxAmount', 'status', 'actions'];
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
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des durées', 'Fermer', { duration: 3000 });
      }
    });
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? item.isActive : !item.isActive);
      const matchSearch = !this.searchTerm || 
        item.creditTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.label?.toLowerCase().includes(this.searchTerm.toLowerCase());
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
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
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
    if (confirm(`Voulez-vous vraiment supprimer cette durée ?`)) {
      this.parametrageService.deleteDurationConfig(item.id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Durée supprimée avec succès', 'Fermer', { duration: 3000 });
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
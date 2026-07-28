// components/interest-rates/interest-rates.component.ts
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
import { ParametrageService, InterestRate } from '@app/core/services/parametrage.service';
import { InterestRatesDialogComponent } from '../interest-rates-dialog/interest-rates-dialog.component';
import { Router } from '@angular/router'; // ✅ AJOUTER

@Component({
  selector: 'app-interest-rates',
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
  templateUrl: './interest-rates.component.html',
  styleUrls: ['./interest-rates.component.css']
})
export class InterestRatesComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router); // ✅ AJOUTER

  displayedColumns: string[] = ['creditType', 'rate', 'minRate', 'maxRate', 'clientCategory', 'isDefault', 'effectiveDate', 'status', 'actions'];
  data: InterestRate[] = [];
  filteredData: InterestRate[] = [];
  loading = true;

  // Filtres
  selectedStatus = '';
  searchTerm = '';
  creditTypes: any[] = [];

  ngOnInit() {
    this.loadData();
    this.loadCreditTypes();
  }

  loadData() {
    this.loading = true;
    this.parametrageService.getInterestRates().subscribe({
      next: (data) => {
        this.data = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement taux:', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des taux', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadCreditTypes() {
    this.parametrageService.getCreditTypes().subscribe({
      next: (data) => {
        this.creditTypes = data;
      },
      error: () => console.error('Erreur chargement types de crédit')
    });
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? item.isActive : !item.isActive);
      const matchSearch = !this.searchTerm || 
        item.creditTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.rate.toString().includes(this.searchTerm);
      return matchStatus && matchSearch;
    });
  }

  getClientCategoryLabel(category?: string): string {
    const labels: { [key: string]: string } = {
      'PREMIUM': 'Premium',
      'STANDARD': 'Standard',
      'RISK': 'À risque'
    };
    return category ? labels[category] || category : '-';
  }

  toggleStatus(item: InterestRate) {
    this.parametrageService.toggleInterestRateStatus(item.id).subscribe({
      next: (updated) => {
        const index = this.data.findIndex(d => d.id === updated.id);
        if (index !== -1) this.data[index] = updated;
        this.applyFilters();
        this.snackBar.open(
          `Taux ${updated.isActive ? 'activé' : 'désactivé'}`,
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
    const dialogRef = this.dialog.open(InterestRatesDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { mode: 'create', creditTypes: this.creditTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Taux créé avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  openEditDialog(item: InterestRate) {
    const dialogRef = this.dialog.open(InterestRatesDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { mode: 'edit', interestRate: item, creditTypes: this.creditTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Taux modifié avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteInterestRate(item: InterestRate) {
    if (confirm(`Voulez-vous vraiment supprimer ce taux ?`)) {
      this.parametrageService.deleteInterestRate(item.id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Taux supprimé avec succès', 'Fermer', { duration: 3000 });
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
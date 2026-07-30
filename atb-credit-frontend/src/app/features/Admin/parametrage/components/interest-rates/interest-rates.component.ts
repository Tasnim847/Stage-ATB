// components/interest-rates/interest-rates.component.ts
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
import { ParametrageService, InterestRate } from '@app/core/services/parametrage.service';
import { InterestRatesDialogComponent } from '../interest-rates-dialog/interest-rates-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interest-rates',
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
  templateUrl: './interest-rates.component.html',
  styleUrls: ['./interest-rates.component.css']
})
export class InterestRatesComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  data: InterestRate[] = [];
  filteredData: InterestRate[] = [];
  loading = true;

  selectedStatus = '';
  selectedCategory = '';
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
      error: () => {
        this.data = this.getMockData();
        this.applyFilters();
        this.loading = false;
        this.snackBar.open('Utilisation des données de test', 'Fermer', { duration: 3000 });
      }
    });
  }

  private getMockData(): InterestRate[] {
    return [
      {
        id: '1',
        creditTypeId: '1',
        creditTypeName: 'Crédit Personnel',
        rate: 4.5,
        minRate: 3.5,
        maxRate: 6.5,
        isDefault: true,
        isActive: true,
        clientCategory: 'STANDARD',
        rateAdjustment: 0,
        effectiveDate: new Date('2026-01-01').toISOString(),
        expiryDate: undefined,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        creditTypeId: '1',
        creditTypeName: 'Crédit Personnel',
        rate: 4.0,
        minRate: 3.0,
        maxRate: 5.5,
        isDefault: false,
        isActive: true,
        clientCategory: 'PREMIUM',
        rateAdjustment: -0.5,
        effectiveDate: new Date('2026-01-01').toISOString(),
        expiryDate: new Date('2026-12-31').toISOString(),
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        creditTypeId: '2',
        creditTypeName: 'Crédit Automobile',
        rate: 3.8,
        minRate: 3.0,
        maxRate: 5.0,
        isDefault: true,
        isActive: true,
        clientCategory: 'STANDARD',
        rateAdjustment: 0,
        effectiveDate: new Date('2026-01-01').toISOString(),
        expiryDate: undefined,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        creditTypeId: '3',
        creditTypeName: 'Crédit Immobilier',
        rate: 3.2,
        minRate: 2.8,
        maxRate: 4.0,
        isDefault: false,
        isActive: false,
        clientCategory: 'STANDARD',
        rateAdjustment: 0,
        effectiveDate: new Date('2025-06-01').toISOString(),
        expiryDate: new Date('2025-12-31').toISOString(),
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        creditTypeId: '4',
        creditTypeName: 'Crédit Professionnel',
        rate: 5.5,
        minRate: 4.5,
        maxRate: 7.0,
        isDefault: true,
        isActive: true,
        clientCategory: 'RISK',
        rateAdjustment: 1.0,
        effectiveDate: new Date('2026-01-01').toISOString(),
        expiryDate: undefined,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  loadCreditTypes() {
    this.parametrageService.getCreditTypes().subscribe({
      next: (data) => {
        this.creditTypes = data;
      },
      error: () => console.error('Erreur chargement types de crédit')
    });
  }

  getActiveCount(): number {
    return this.data.filter(item => item.isActive).length;
  }

  getDefaultCount(): number {
    return this.data.filter(item => item.isDefault).length;
  }

  getAvgRate(): number {
    if (this.data.length === 0) return 0;
    const sum = this.data.reduce((acc, item) => acc + item.rate, 0);
    return sum / this.data.length;
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? item.isActive : !item.isActive);
      const matchCategory = !this.selectedCategory || item.clientCategory === this.selectedCategory;
      const matchSearch = !this.searchTerm || 
        item.creditTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.rate.toString().includes(this.searchTerm);
      return matchStatus && matchCategory && matchSearch;
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

  getCategoryClass(category?: string): string {
    if (!category) return '';
    return category.toLowerCase();
  }

  getCategoryColor(category?: string): string {
    const colors: { [key: string]: string } = {
      'PREMIUM': 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      'STANDARD': 'linear-gradient(135deg, #059669, #047857)',
      'RISK': 'linear-gradient(135deg, #dc2626, #b91c1c)'
    };
    return colors[category || 'STANDARD'] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  getCategoryIcon(category?: string): string {
    const icons: { [key: string]: string } = {
      'PREMIUM': 'star',
      'STANDARD': 'person',
      'RISK': 'warning'
    };
    return icons[category || 'STANDARD'] || 'person';
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
        item.isActive = !item.isActive;
        this.applyFilters();
        this.snackBar.open(
          `Taux ${item.isActive ? 'activé' : 'désactivé'}`,
          'Fermer',
          { duration: 3000 }
        );
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
    if (confirm(`Voulez-vous vraiment supprimer ce taux (${item.rate}%) ?`)) {
      this.parametrageService.deleteInterestRate(item.id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Taux supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.data = this.data.filter(d => d.id !== item.id);
          this.applyFilters();
          this.snackBar.open('Taux supprimé', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/parametrage']);
  }
}
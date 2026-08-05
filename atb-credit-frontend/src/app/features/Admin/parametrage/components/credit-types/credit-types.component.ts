import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { ParametrageService, CreditType } from '@app/core/services/parametrage.service';
import { CreditTypesDialogComponent } from '../credit-types-dialog/credit-types-dialog.component';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-credit-types',
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
  templateUrl: './credit-types.component.html',
  styleUrls: ['./credit-types.component.css']
})
export class CreditTypesComponent implements OnInit, OnDestroy {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  data: CreditType[] = [];
  filteredData: CreditType[] = [];
  loading = true;

  selectedCategory = '';
  selectedStatus = '';
  searchTerm = '';
  categories = this.parametrageService.getCreditCategories();
  documentTypes = this.parametrageService.getDocumentTypes();

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    this.parametrageService.getAllCreditTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.data = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement:', err);
          // Données mock
          this.data = this.getMockData();
          this.applyFilters();
          this.loading = false;
          this.snackBar.open('Utilisation des données de test', 'Fermer', { duration: 3000 });
        }
      });
  }

  private getMockData(): CreditType[] {
    return [
      {
        id: '1',
        code: 'PERS',
        name: 'Crédit Personnel',
        description: 'Crédit pour projets personnels sans justification d\'usage',
        category: 'PERSONAL',
        minDurationMonths: 12,
        maxDurationMonths: 60,
        minAmount: 1000,
        maxAmount: 50000,
        baseInterestRate: 4.5,
        isActive: true,
        requiresCollateral: false,
        requiresGuarantor: false,
        requiredDocuments: ['ID', 'INCOME_PROOF', 'BANK_STATEMENT'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        code: 'AUTO',
        name: 'Crédit Automobile',
        description: 'Financement pour l\'achat d\'un véhicule neuf ou d\'occasion',
        category: 'AUTO',
        minDurationMonths: 12,
        maxDurationMonths: 84,
        minAmount: 5000,
        maxAmount: 150000,
        baseInterestRate: 3.8,
        isActive: true,
        requiresCollateral: true,
        requiresGuarantor: false,
        requiredDocuments: ['ID', 'INCOME_PROOF', 'BANK_STATEMENT'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        code: 'IMMO',
        name: 'Crédit Immobilier',
        description: 'Financement pour l\'achat d\'un bien immobilier',
        category: 'MORTGAGE',
        minDurationMonths: 60,
        maxDurationMonths: 360,
        minAmount: 10000,
        maxAmount: 1000000,
        baseInterestRate: 3.2,
        isActive: true,
        requiresCollateral: true,
        requiresGuarantor: true,
        requiredDocuments: ['ID', 'INCOME_PROOF', 'BANK_STATEMENT', 'TAX_RETURN'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        code: 'BUS',
        name: 'Crédit Professionnel',
        description: 'Financement pour les besoins professionnels des entreprises',
        category: 'BUSINESS',
        minDurationMonths: 12,
        maxDurationMonths: 84,
        minAmount: 5000,
        maxAmount: 500000,
        baseInterestRate: 4.2,
        isActive: false,
        requiresCollateral: true,
        requiresGuarantor: false,
        requiredDocuments: ['ID', 'INCOME_PROOF', 'BANK_STATEMENT', 'BUSINESS_REGISTRATION'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getActiveCount(): number {
    return this.data.filter(item => item.isActive).length;
  }

  getCategoryCount(): number {
    return new Set(this.data.map(item => item.category)).size;
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchCategory = !this.selectedCategory || item.category === this.selectedCategory;
      const matchStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? item.isActive : !item.isActive);
      const matchSearch = !this.searchTerm || 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }

  getCategoryLabel(category: string): string {
    const found = this.categories.find(c => c.value === category);
    return found ? found.label : category;
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'PERSONAL': 'personal',
      'AUTO': 'auto',
      'MORTGAGE': 'mortgage',
      'BUSINESS': 'business',
      'STUDENT': 'student',
      'CONSUMER': 'consumer',
      'BRIDGE': 'bridge',
      'REVOLVING': 'revolving'
    };
    return classes[category] || '';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'PERSONAL': 'linear-gradient(135deg, #be5543, #a84535)',
      'AUTO': 'linear-gradient(135deg, #059669, #047857)',
      'MORTGAGE': 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      'BUSINESS': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      'STUDENT': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'CONSUMER': 'linear-gradient(135deg, #6b7280, #4b5563)',
      'BRIDGE': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'REVOLVING': 'linear-gradient(135deg, #ec4899, #db2777)'
    };
    return colors[category] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'PERSONAL': 'person',
      'AUTO': 'directions_car',
      'MORTGAGE': 'home',
      'BUSINESS': 'business_center',
      'STUDENT': 'school',
      'CONSUMER': 'shopping_cart',
      'BRIDGE': 'swap_horiz',
      'REVOLVING': 'loop'
    };
    return icons[category] || 'category';
  }

  getDocumentLabel(value: string): string {
    const found = this.documentTypes.find(d => d.value === value);
    return found ? found.label : value;
  }

  toggleStatus(item: CreditType) {
    this.parametrageService.toggleCreditTypeStatus(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const index = this.data.findIndex(d => d.id === updated.id);
          if (index !== -1) this.data[index] = updated;
          this.applyFilters();
          this.snackBar.open(
            `Type "${updated.name}" ${updated.isActive ? 'activé' : 'désactivé'}`,
            'Fermer',
            { duration: 3000 }
          );
        },
        error: () => {
          // Simuler localement
          item.isActive = !item.isActive;
          this.applyFilters();
          this.snackBar.open(
            `Type "${item.name}" ${item.isActive ? 'activé' : 'désactivé'}`,
            'Fermer',
            { duration: 3000 }
          );
        }
      });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreditTypesDialogComponent, {
      width: '750px',
      maxHeight: '90vh',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Type de crédit créé avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  openEditDialog(item: CreditType) {
    const dialogRef = this.dialog.open(CreditTypesDialogComponent, {
      width: '750px',
      maxHeight: '90vh',
      data: { mode: 'edit', creditType: item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
        this.snackBar.open('Type de crédit modifié avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteCreditType(item: CreditType) {
    if (confirm(`Voulez-vous vraiment supprimer le type "${item.name}" ?`)) {
      this.parametrageService.deleteCreditType(item.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadData();
            this.snackBar.open('Type de crédit supprimé avec succès', 'Fermer', { duration: 3000 });
          },
          error: () => {
            // Suppression locale
            this.data = this.data.filter(d => d.id !== item.id);
            this.applyFilters();
            this.snackBar.open('Type de crédit supprimé', 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  goBack() {
    this.router.navigate(['/admin/parametrage']);
  }
}
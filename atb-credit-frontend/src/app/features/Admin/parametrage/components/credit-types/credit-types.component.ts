// components/credit-types/credit-types.component.ts
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
import { ParametrageService, CreditType } from '@app/core/services/parametrage.service';
import { CreditTypesDialogComponent } from '../credit-types-dialog/credit-types-dialog.component';
import { Router } from '@angular/router'; // ✅ AJOUTER

@Component({
  selector: 'app-credit-types',
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
  templateUrl: './credit-types.component.html',
  styleUrls: ['./credit-types.component.css']
})
export class CreditTypesComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router); // ✅ AJOUTER

  displayedColumns: string[] = ['code', 'name', 'category', 'duration', 'amount', 'baseRate', 'status', 'actions'];
  data: CreditType[] = [];
  filteredData: CreditType[] = [];
  loading = true;

  // Filtres
  selectedCategory = '';
  selectedStatus = '';
  searchTerm = '';
  categories = this.parametrageService.getCreditCategories();

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.parametrageService.getAllCreditTypes().subscribe({
      next: (data) => {
        this.data = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement types de crédit:', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des types de crédit', 'Fermer', { duration: 3000 });
      }
    });
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

  toggleStatus(item: CreditType) {
    this.parametrageService.toggleCreditTypeStatus(item.id).subscribe({
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
      error: (err) => {
        console.error('Erreur changement statut:', err);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
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
      this.parametrageService.deleteCreditType(item.id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Type de crédit supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/parametrage']);
  }
}
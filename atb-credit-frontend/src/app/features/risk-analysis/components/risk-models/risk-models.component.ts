import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// ✅ AJOUTER CE IMPORT
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { RiskModel, RiskModelType, RiskModelTypeIcons, RiskModelTypeLabels } from '@app/core/models';

@Component({
  selector: 'app-risk-models',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule  // ✅ AJOUTER ICI
  ],
  templateUrl: './risk-models.component.html',
  styleUrls: ['./risk-models.component.css']
})
export class RiskModelsComponent implements OnInit {
  models: RiskModel[] = [];
  loading = false;

  // Pour le formulaire d'ajout/modification
  showForm = false;
  isEditing = false;
  editingModelId: string | null = null;
  
  formData: Partial<RiskModel> = {
    name: '',
    type: RiskModelType.CREDIT,
    description: '',
    isActive: true,
    priority: 0,
    configuration: {}
  };

  riskModelTypes = Object.values(RiskModelType);

  constructor(
    private riskService: RiskAnalysisService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.loading = true;
    this.riskService.getRiskModels().subscribe({
      next: (data) => {
        this.models = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des modèles:', err);
        this.loading = false;
        // Données par défaut en cas d'erreur
        this.models = [
          {
            id: '1',
            type: RiskModelType.CREDIT,
            name: 'Modèle Risque de Crédit',
            description: 'Analyse du risque de crédit basée sur IA et règles métier',
            isActive: true,
            priority: 1,
            configuration: {},
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            type: RiskModelType.FINANCIAL,
            name: 'Modèle Risque Financier',
            description: 'Analyse des ratios financiers et capacité de remboursement',
            isActive: true,
            priority: 2,
            configuration: {},
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            type: RiskModelType.KYC,
            name: 'Vérification KYC',
            description: 'Vérification d\'identité et des documents',
            isActive: true,
            priority: 3,
            configuration: {},
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }
    });
  }

  getModelTypeLabel(type: RiskModelType): string {
    return RiskModelTypeLabels[type] || type;
  }

  getModelIcon(type: RiskModelType): string {
    return RiskModelTypeIcons[type] || 'model_training';
  }

  getModelColor(type: RiskModelType): string {
    const colors: Record<RiskModelType, string> = {
      [RiskModelType.CREDIT]: '#2d7bf6',
      [RiskModelType.FINANCIAL]: '#27ae60',
      [RiskModelType.KYC]: '#9b59b6',
      [RiskModelType.AML]: '#e67e22',
      [RiskModelType.FRAUD]: '#e74c3c'
    };
    return colors[type] || '#6b7a8f';
  }

  // ============================================
  // FORMULAIRE
  // ============================================

  openAddForm(): void {
    this.isEditing = false;
    this.editingModelId = null;
    this.formData = {
      name: '',
      type: RiskModelType.CREDIT,
      description: '',
      isActive: true,
      priority: 0,
      configuration: {}
    };
    this.showForm = true;
  }

  openEditForm(model: RiskModel): void {
    this.isEditing = true;
    this.editingModelId = model.id;
    this.formData = {
      name: model.name,
      type: model.type,
      description: model.description || '',
      isActive: model.isActive,
      priority: model.priority,
      configuration: model.configuration || {}
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingModelId = null;
    this.formData = {
      name: '',
      type: RiskModelType.CREDIT,
      description: '',
      isActive: true,
      priority: 0,
      configuration: {}
    };
  }

  saveModel(): void {
    if (!this.formData.name) {
      this.snackBar.open('Le nom du modèle est obligatoire', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.isEditing && this.editingModelId) {
      // Mise à jour
      this.riskService.updateRiskModel(this.editingModelId, this.formData).subscribe({
        next: (updated) => {
          const index = this.models.findIndex(m => m.id === updated.id);
          if (index !== -1) {
            this.models[index] = updated;
          }
          this.loading = false;
          this.closeForm();
          this.snackBar.open('Modèle mis à jour avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.loading = false;
          this.snackBar.open('Erreur lors de la mise à jour du modèle', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      // Création
      this.riskService.addRiskModel(this.formData).subscribe({
        next: (created) => {
          this.models.push(created);
          this.loading = false;
          this.closeForm();
          this.snackBar.open('Modèle créé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.loading = false;
          this.snackBar.open('Erreur lors de la création du modèle', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  // ============================================
  // ACTIONS SUR LES MODÈLES
  // ============================================

  addModel(): void {
    this.openAddForm();
  }

  editModel(model: RiskModel): void {
    this.openEditForm(model);
  }

  duplicateModel(model: RiskModel): void {
    this.loading = true;
    const newModel: Partial<RiskModel> = {
      name: `${model.name} (copie)`,
      type: model.type,
      description: model.description,
      isActive: true,
      priority: model.priority + 1,
      configuration: model.configuration || {}
    };
    
    this.riskService.addRiskModel(newModel).subscribe({
      next: (created) => {
        this.models.push(created);
        this.loading = false;
        this.snackBar.open('Modèle dupliqué avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erreur lors de la duplication:', err);
        this.loading = false;
        this.snackBar.open('Erreur lors de la duplication du modèle', 'Fermer', { duration: 3000 });
      }
    });
  }

  toggleModel(model: RiskModel): void {
    const newStatus = !model.isActive;
    this.riskService.toggleRiskModel(model.id, newStatus).subscribe({
      next: (updated) => {
        const index = this.models.findIndex(m => m.id === updated.id);
        if (index !== -1) {
          this.models[index] = updated;
        }
        this.snackBar.open(
          `Modèle ${updated.isActive ? 'activé' : 'désactivé'} avec succès`,
          'Fermer',
          { duration: 3000 }
        );
      },
      error: () => {
        model.isActive = !newStatus; // Réinitialiser en cas d'erreur
        this.snackBar.open('Erreur lors du basculement du modèle', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteModel(model: RiskModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${model.name}" ?`)) {
      this.loading = true;
      this.riskService.deleteRiskModel(model.id).subscribe({
        next: () => {
          this.models = this.models.filter(m => m.id !== model.id);
          this.loading = false;
          this.snackBar.open('Modèle supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.loading = false;
          this.snackBar.open('Erreur lors de la suppression du modèle', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}
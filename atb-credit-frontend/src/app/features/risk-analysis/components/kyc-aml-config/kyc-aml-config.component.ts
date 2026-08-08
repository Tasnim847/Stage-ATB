import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { KycAmlCategory, KycAmlConfig } from '@app/core/models/risk-analysis.model';

@Component({
  selector: 'app-kyc-aml-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './kyc-aml-config.component.html',
  styleUrls: ['./kyc-aml-config.component.css']
})
export class KycAmlConfigComponent implements OnInit {
  // Exposer l'énumération au template
  KycAmlCategory = KycAmlCategory;
  
  kycConfigs: KycAmlConfig[] = [];
  amlConfigs: KycAmlConfig[] = [];
  loading = false;

  constructor(
    private riskService: RiskAnalysisService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.loading = true;
    this.riskService.getKycAmlConfigs().subscribe({
      next: (data) => {
        this.kycConfigs = data.filter(c => c.category === KycAmlCategory.KYC);
        this.amlConfigs = data.filter(c => c.category === KycAmlCategory.AML);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des configurations', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loadDefaultData();
      }
    });
  }

  private loadDefaultData(): void {
    this.kycConfigs = [
      {
        id: 'kyc1',
        category: KycAmlCategory.KYC,
        name: 'Vérification CIN',
        description: 'Vérification de la carte d\'identité nationale',
        isActive: true,
        required: true,
        priority: 1,
        autoCheck: true,
        checks: [
          { id: 'c1', name: 'Authenticité du document', type: 'document', isActive: true, weight: 30 },
          { id: 'c2', name: 'Date d\'expiration', type: 'date', isActive: true, weight: 20 },
          { id: 'c3', name: 'Photo d\'identité', type: 'document', isActive: true, weight: 25 }
        ]
      },
      {
        id: 'kyc2',
        category: KycAmlCategory.KYC,
        name: 'Vérification Passeport',
        description: 'Vérification du passeport pour les clients étrangers',
        isActive: true,
        required: false,
        priority: 2,
        autoCheck: true,
        checks: [
          { id: 'c4', name: 'Authenticité du passeport', type: 'document', isActive: true, weight: 30 },
          { id: 'c5', name: 'Visa et tampons', type: 'document', isActive: true, weight: 15 }
        ]
      },
      {
        id: 'kyc3',
        category: KycAmlCategory.KYC,
        name: 'Justificatif de domicile',
        description: 'Vérification de l\'adresse du client',
        isActive: true,
        required: true,
        priority: 3,
        autoCheck: false,
        checks: [
          { id: 'c6', name: 'Facture récente', type: 'document', isActive: true, weight: 20 },
          { id: 'c7', name: 'Contrat de location', type: 'document', isActive: false, weight: 15 }
        ]
      }
    ];
    
    this.amlConfigs = [
      {
        id: 'aml1',
        category: KycAmlCategory.AML,
        name: 'Liste noire nationale',
        description: 'Vérification dans les listes de personnes interdites au niveau national',
        isActive: true,
        required: true,
        priority: 1,
        autoCheck: true,
        checks: [
          { id: 'a1', name: 'Liste des terroristes', type: 'database', isActive: true, weight: 50 },
          { id: 'a2', name: 'Liste des criminels', type: 'database', isActive: true, weight: 40 }
        ]
      },
      {
        id: 'aml2',
        category: KycAmlCategory.AML,
        name: 'Listes internationales',
        description: 'Vérification dans les listes internationales de sanctions',
        isActive: true,
        required: true,
        priority: 2,
        autoCheck: true,
        checks: [
          { id: 'a3', name: 'ONU - Liste des sanctions', type: 'database', isActive: true, weight: 50 },
          { id: 'a4', name: 'UE - Liste des sanctions', type: 'database', isActive: true, weight: 45 }
        ]
      },
      {
        id: 'aml3',
        category: KycAmlCategory.AML,
        name: 'PEP - Personnes Politiquement Exposées',
        description: 'Détection des Personnes Politiquement Exposées',
        isActive: true,
        required: true,
        priority: 3,
        autoCheck: true,
        checks: [
          { id: 'a5', name: 'PEP National', type: 'database', isActive: true, weight: 50 },
          { id: 'a6', name: 'PEP International', type: 'database', isActive: true, weight: 40 }
        ]
      }
    ];
  }

  // ============================================
  // TOGGLES
  // ============================================

  toggleConfig(config: KycAmlConfig): void {
    const newStatus = !config.isActive;
    this.riskService.updateKycAmlConfig(config.id, { isActive: newStatus }).subscribe({
      next: (updatedConfig) => {
        config.isActive = updatedConfig.isActive;
        this.snackBar.open(
          `Configuration ${updatedConfig.isActive ? 'activée' : 'désactivée'} avec succès`,
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: () => {
        config.isActive = !newStatus;
        this.snackBar.open('Erreur lors du basculement', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleCheck(config: KycAmlConfig, check: any): void {
    const newStatus = !check.isActive;
    this.riskService.toggleKycAmlCheck(config.id, check.id, newStatus).subscribe({
      next: () => {
        check.isActive = newStatus;
        this.snackBar.open(
          `Vérification ${newStatus ? 'activée' : 'désactivée'} avec succès`,
          'Fermer',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: () => {
        check.isActive = !newStatus;
        this.snackBar.open('Erreur lors du basculement', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  getTotalWeight(checks: any[]): number {
    return checks.reduce((sum, check) => sum + check.weight, 0);
  }

  getActiveChecksCount(checks: any[]): number {
    return checks.filter(c => c.isActive).length;
  }

  getCheckTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'document': '📄 Document',
      'database': '💾 Base de données',
      'date': '📅 Date',
      'manual': '👤 Manuel'
    };
    return labels[type] || type;
  }
}
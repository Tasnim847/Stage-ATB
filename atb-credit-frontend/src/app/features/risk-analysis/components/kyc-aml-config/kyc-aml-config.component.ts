import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { KycAmlCategory, KycAmlConfig } from '@app/core/models';

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
    MatExpansionModule
  ],
  templateUrl: './kyc-aml-config.component.html',
  styleUrls: ['./kyc-aml-config.component.css']
})
export class KycAmlConfigComponent implements OnInit {
  kycConfigs: KycAmlConfig[] = [];
  amlConfigs: KycAmlConfig[] = [];
  hasChanges = false;
  saved = false;
  error = false;

  constructor(private riskService: RiskAnalysisService) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.riskService.getKycAmlConfigs().subscribe({
      next: (data) => {
        this.kycConfigs = data.filter(c => c.category === KycAmlCategory.KYC);
        this.amlConfigs = data.filter(c => c.category === KycAmlCategory.AML);
        this.hasChanges = false;
      },
      error: () => {
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
              { id: 'c1', name: 'Authenticité', type: 'document', isActive: true, weight: 30 },
              { id: 'c2', name: 'Expiration', type: 'date', isActive: true, weight: 20 }
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
              { id: 'c3', name: 'Authenticité', type: 'document', isActive: true, weight: 30 }
            ]
          }
        ];
        this.amlConfigs = [
          {
            id: 'aml1',
            category: KycAmlCategory.AML,
            name: 'Liste noire',
            description: 'Vérification dans les listes de personnes interdites',
            isActive: true,
            required: true,
            priority: 1,
            autoCheck: true,
            checks: [
              { id: 'a1', name: 'Liste nationale', type: 'database', isActive: true, weight: 40 },
              { id: 'a2', name: 'Liste internationale', type: 'database', isActive: true, weight: 40 }
            ]
          },
          {
            id: 'aml2',
            category: KycAmlCategory.AML,
            name: 'PEP',
            description: 'Détection des Personnes Politiquement Exposées',
            isActive: true,
            required: true,
            priority: 2,
            autoCheck: true,
            checks: [
              { id: 'a3', name: 'PEP National', type: 'database', isActive: true, weight: 50 }
            ]
          }
        ];
      }
    });
  }

  toggleConfig(config: KycAmlConfig): void {
    this.hasChanges = true;
    this.saved = false;
    this.riskService.updateKycAmlConfig(config.id, config).subscribe({
      next: () => {
        this.saved = true;
        setTimeout(() => this.saved = false, 2000);
      },
      error: () => {
        config.isActive = !config.isActive;
        this.error = true;
        setTimeout(() => this.error = false, 2000);
      }
    });
  }

  toggleCheck(config: KycAmlConfig, check: any): void {
    this.hasChanges = true;
    this.saved = false;
    this.riskService.toggleKycAmlCheck(config.id, check.id, check.isActive).subscribe({
      next: () => {
        this.saved = true;
        setTimeout(() => this.saved = false, 2000);
      },
      error: () => {
        check.isActive = !check.isActive;
        this.error = true;
        setTimeout(() => this.error = false, 2000);
      }
    });
  }

  saveConfigs(): void {
    const allConfigs = [...this.kycConfigs, ...this.amlConfigs];
    const updates = allConfigs.map(config => 
      this.riskService.updateKycAmlConfig(config.id, config).toPromise()
    );
    
    Promise.all(updates).then(() => {
      this.saved = true;
      this.hasChanges = false;
      setTimeout(() => this.saved = false, 3000);
    }).catch(() => {
      this.error = true;
      setTimeout(() => this.error = false, 3000);
    });
  }

  resetDefaults(): void {
    this.loadConfigs();
  }
}
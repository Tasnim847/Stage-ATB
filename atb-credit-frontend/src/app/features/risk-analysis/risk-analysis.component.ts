import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';

// Import des sous-composants
import { RiskThresholdsComponent } from './components/risk-thresholds/risk-thresholds.component';
import { DecisionRulesComponent } from './components/decision-rules/decision-rules.component';
import { AlertsConfigComponent } from './components/alerts-config/alerts-config.component';
import { KycAmlConfigComponent } from './components/kyc-aml-config/kyc-aml-config.component';
import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { RiskModelsComponent } from './components/risk-models/risk-models.component';
import { FinancialRatiosComponent } from './components/financial-ratios/financial-ratios.component';
import { AiModelConfigComponent } from './components/ai-model-config/ai-model-config.component';
import { FraudDetectionComponent } from './components/fraud-detection/fraud-detection.component';
import { AuditHistoryComponent } from './components/audit-history/audit-history.component';

interface TabConfig {
  key: string;
  label: string;
  icon: string;
  badge?: number;
  component: any;
}

@Component({
  selector: 'app-risk-analysis',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RiskModelsComponent,
    RiskThresholdsComponent,
    FinancialRatiosComponent,
    DecisionRulesComponent,
    AlertsConfigComponent,
    KycAmlConfigComponent,
    AiModelConfigComponent,
    FraudDetectionComponent,
    AuditHistoryComponent
  ],
  templateUrl: './risk-analysis.component.html',
  styleUrls: ['./risk-analysis.component.css']
})
export class RiskAnalysisComponent implements OnInit, OnDestroy {
  selectedTab = 0;
  loading = false;
  private subscriptions: Subscription = new Subscription();

  tabs: TabConfig[] = [
    {
      key: 'models',
      label: 'Modèles de risque',
      icon: 'model_training',
      component: RiskModelsComponent
    },
    {
      key: 'thresholds',
      label: 'Seuils de risque',
      icon: 'speed',
      component: RiskThresholdsComponent
    },
    {
      key: 'ratios',
      label: 'Ratios financiers',
      icon: 'calculate',
      component: FinancialRatiosComponent
    },
    {
      key: 'rules',
      label: 'Règles de décision',
      icon: 'rule',
      badge: 3,
      component: DecisionRulesComponent
    },
    {
      key: 'alerts',
      label: 'Alertes',
      icon: 'notifications_active',
      component: AlertsConfigComponent
    },
    {
      key: 'kyc-aml',
      label: 'KYC / AML',
      icon: 'verified_user',
      component: KycAmlConfigComponent
    },
    {
      key: 'ai',
      label: 'Modèle IA',
      icon: 'smart_toy',
      component: AiModelConfigComponent
    },
    {
      key: 'fraud',
      label: 'Détection fraude',
      icon: 'security',
      component: FraudDetectionComponent
    },
    {
      key: 'history',
      label: 'Historique',
      icon: 'history',
      component: AuditHistoryComponent
    }
  ];

  constructor(
    private riskService: RiskAnalysisService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.riskService.loading$.subscribe(loading => this.loading = loading)
    );

    this.subscriptions.add(
      this.riskService.error$.subscribe(error => {
        if (error) {
          this.snackBar.open(error, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  refreshAll(): void {
    this.snackBar.open('Rafraîchissement en cours...', 'Fermer', {
      duration: 2000
    });
  }

  exportConfiguration(): void {
    this.riskService.exportConfiguration().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `risk-configuration-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Configuration exportée avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'exportation', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  importConfiguration(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.riskService.importConfiguration(file).subscribe({
          next: () => {
            this.snackBar.open('Configuration importée avec succès', 'Fermer', {
              duration: 3000
            });
            window.location.reload();
          },
          error: () => {
            this.snackBar.open('Erreur lors de l\'importation', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    };
    
    input.click();
  }

  resetToDefaults(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les configurations ?')) {
      this.riskService.resetToDefaults().subscribe({
        next: () => {
          this.snackBar.open('Configuration réinitialisée avec succès', 'Fermer', {
            duration: 3000
          });
          window.location.reload();
        },
        error: () => {
          this.snackBar.open('Erreur lors de la réinitialisation', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }
}
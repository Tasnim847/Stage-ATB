// portfolio-risk.component.ts - Version ultra sécurisée
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-portfolio-risk',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule
  ],
  templateUrl: './portfolio-risk.component.html',
  styleUrls: ['./portfolio-risk.component.css']
})
export class PortfolioRiskComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any = null;
  @Input() isLoading: boolean = false;
  @Input() selectedYear: number = new Date().getFullYear();

  riskTableColumns: string[] = ['client', 'montant', 'type', 'risque', 'score', 'actions'];

  // ✅ Données par défaut sécurisées
  safeData: any = {
    risqueGlobal: 'En attente',
    scoreGlobal: 0,
    risqueCredit: 'En attente',
    scoreCredit: 0,
    risqueFinancier: 'En attente',
    scoreFinancier: 0,
    risqueOperationnel: 'En attente',
    scoreOperationnel: 0,
    descriptionCredit: 'Analyse en cours...',
    descriptionFinancier: 'Analyse en cours...',
    descriptionOperationnel: 'Analyse en cours...',
    impactCredit: 0,
    impactFinancier: 0,
    impactOperationnel: 0,
    probabiliteCredit: 0,
    probabiliteFinancier: 0,
    probabiliteOperationnel: 0,
    creditsARisque: [],
    recommandations: []
  };

  hasError = false;
  errorMessage = '';
  private isAlive = true;

  constructor(private cdr: ChangeDetectorRef) {
    console.log('✅ PortfolioRiskComponent constructor');
  }

  ngOnInit(): void {
    console.log('✅ PortfolioRiskComponent ngOnInit');
    // ✅ Ne rien faire ici, attendre ngOnChanges
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isAlive) return;
    
    console.log('🔄 PortfolioRiskComponent ngOnChanges:', changes);

    if (changes['data']) {
      console.log('📊 Risk data changed:', this.data);
      this.processDataSafely();
    }

    if (changes['isLoading']) {
      console.log('⏳ Risk loading changed:', this.isLoading);
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  // ✅ Méthode sécurisée pour traiter les données
  private processDataSafely(): void {
    try {
      // ✅ Si en chargement, on garde les valeurs par défaut
      if (this.isLoading) {
        console.log('⏳ En chargement, pas de traitement');
        this.cdr.detectChanges();
        return;
      }

      // ✅ Si pas de données, on garde les valeurs par défaut
      if (!this.data) {
        console.log('📭 Pas de données, valeurs par défaut');
        this.safeData = { ...this.getDefaultData() };
        this.hasError = false;
        this.cdr.detectChanges();
        return;
      }

      // ✅ Si les données sont valides, on les traite
      if (typeof this.data === 'object') {
        console.log('📊 Traitement des données reçues');
        this.safeData = {
          risqueGlobal: this.data.risqueGlobal || 'N/A',
          scoreGlobal: Number(this.data.scoreGlobal) || 0,
          risqueCredit: this.data.risqueCredit || 'N/A',
          scoreCredit: Number(this.data.scoreCredit) || 0,
          risqueFinancier: this.data.risqueFinancier || 'N/A',
          scoreFinancier: Number(this.data.scoreFinancier) || 0,
          risqueOperationnel: this.data.risqueOperationnel || 'N/A',
          scoreOperationnel: Number(this.data.scoreOperationnel) || 0,
          descriptionCredit: this.data.descriptionCredit || 'Analyse du risque de défaut de paiement',
          descriptionFinancier: this.data.descriptionFinancier || 'Analyse de la santé financière',
          descriptionOperationnel: this.data.descriptionOperationnel || 'Analyse des risques opérationnels',
          impactCredit: Number(this.data.impactCredit) || 5,
          impactFinancier: Number(this.data.impactFinancier) || 5,
          impactOperationnel: Number(this.data.impactOperationnel) || 5,
          probabiliteCredit: Number(this.data.probabiliteCredit) || 5,
          probabiliteFinancier: Number(this.data.probabiliteFinancier) || 5,
          probabiliteOperationnel: Number(this.data.probabiliteOperationnel) || 5,
          creditsARisque: Array.isArray(this.data.creditsARisque) ? this.data.creditsARisque : [],
          recommandations: Array.isArray(this.data.recommandations) ? this.data.recommandations : []
        };
        this.hasError = false;
        console.log('✅ Données traitées avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement:', error);
      this.hasError = true;
      this.errorMessage = 'Erreur lors du traitement des données';
      this.safeData = { ...this.getDefaultData() };
    } finally {
      this.cdr.detectChanges();
    }
  }

  // ✅ Données par défaut
  private getDefaultData(): any {
    return {
      risqueGlobal: 'N/A',
      scoreGlobal: 0,
      risqueCredit: 'N/A',
      scoreCredit: 0,
      risqueFinancier: 'N/A',
      scoreFinancier: 0,
      risqueOperationnel: 'N/A',
      scoreOperationnel: 0,
      descriptionCredit: 'Analyse du risque de défaut de paiement',
      descriptionFinancier: 'Analyse de la santé financière',
      descriptionOperationnel: 'Analyse des risques opérationnels',
      impactCredit: 5,
      impactFinancier: 5,
      impactOperationnel: 5,
      probabiliteCredit: 5,
      probabiliteFinancier: 5,
      probabiliteOperationnel: 5,
      creditsARisque: [],
      recommandations: []
    };
  }

  // ✅ Méthodes publiques
  retryLoad(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.processDataSafely();
  }

  getRiskColor(level: string): string {
    if (!level) return 'primary';
    const colors: { [key: string]: string } = {
      'faible': 'primary',
      'moyen': 'accent',
      'élevé': 'warn',
      'critique': 'warn',
      'low': 'primary',
      'medium': 'accent',
      'high': 'warn'
    };
    return colors[level.toLowerCase()] || 'primary';
  }

  getScoreColor(score: number): string {
    const value = Number(score) || 0;
    if (value >= 70) return 'primary';
    if (value >= 40) return 'accent';
    return 'warn';
  }

  formatCurrency(amount: number): string {
    const value = Number(amount) || 0;
    try {
      return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } catch {
      return `${value} TND`;
    }
  }

  getRiskDetails(): any[] {
    return [
      {
        label: 'Risque de crédit',
        niveau: this.safeData.risqueCredit || 'N/A',
        description: this.safeData.descriptionCredit || 'Analyse du risque de défaut de paiement',
        impact: this.safeData.impactCredit || 5,
        probabilite: this.safeData.probabiliteCredit || 5,
        score: this.safeData.scoreCredit || 0
      },
      {
        label: 'Risque financier',
        niveau: this.safeData.risqueFinancier || 'N/A',
        description: this.safeData.descriptionFinancier || 'Analyse de la santé financière',
        impact: this.safeData.impactFinancier || 5,
        probabilite: this.safeData.probabiliteFinancier || 5,
        score: this.safeData.scoreFinancier || 0
      },
      {
        label: 'Risque opérationnel',
        niveau: this.safeData.risqueOperationnel || 'N/A',
        description: this.safeData.descriptionOperationnel || 'Analyse des risques opérationnels',
        impact: this.safeData.impactOperationnel || 5,
        probabilite: this.safeData.probabiliteOperationnel || 5,
        score: this.safeData.scoreOperationnel || 0
      }
    ];
  }

  applyRecommendation(recommendation: any): void {
    console.log('Application de la recommandation:', recommendation);
  }

  trackByFn(index: number, item: any): any {
    return item?.id || index;
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // ✅ AJOUTER
import { ToastrService } from 'ngx-toastr';
import { CreditSimulationService } from '@core/services/credit-simulation.service';
import { CreditSimulation } from '@app/core/models/credit-simulation.model';

@Component({
  selector: 'app-simulation-result',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule // ✅ AJOUTER
  ],
  templateUrl: './simulation-result.component.html',
  styleUrls: ['./simulation-result.component.css']
})
export class SimulationResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationService = inject(CreditSimulationService);
  private toastr = inject(ToastrService);

  simulation: CreditSimulation | null = null;
  isLoading = true;
  creditRequestId: string | null = null;

  // Résultats calculés
  revenusMensuels: number = 0;
  chargesMensuelles: number = 0;
  tauxEndettement: number = 0;
  resteAVivre: number = 0;
  mensualite: number = 0;
  nouveauTauxEndettement: number = 0;
  scoreSolvabilite: number = 0;
  risqueIA: number = 0;
  decision: string = '';
  recommandation: string = '';
  motifs: string[] = [];

  ngOnInit(): void {
    this.creditRequestId = this.route.snapshot.paramMap.get('id');
    if (this.creditRequestId) {
      this.loadSimulation();
    } else {
      this.toastr.error('ID de demande de crédit manquant', 'Erreur');
      this.router.navigate(['/my-credits']);
    }
  }

  loadSimulation(): void {
    this.isLoading = true;
    this.simulationService.getSimulationByCreditRequestId(this.creditRequestId!).subscribe({
      next: (simulation) => {
        this.simulation = simulation;
        this.calculateResults();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement simulation:', error);
        this.toastr.error('Erreur lors du chargement de la simulation', 'Erreur');
        this.isLoading = false;
        this.router.navigate(['/my-credits']);
      }
    });
  }

  calculateResults(): void {
    if (!this.simulation) return;

    // Revenus mensuels (estimation basée sur le salaire)
    this.revenusMensuels = 3700;

    // Charges mensuelles
    this.chargesMensuelles = 1200;

    // Taux d'endettement actuel
    this.tauxEndettement = Math.round((this.chargesMensuelles / this.revenusMensuels) * 100);

    // Reste à vivre
    this.resteAVivre = this.revenusMensuels - this.chargesMensuelles;

    // Mensualité
    this.mensualite = this.simulation.monthlyPayment;

    // Nouveau taux d'endettement
    const nouvellesCharges = this.chargesMensuelles + this.mensualite;
    this.nouveauTauxEndettement = Math.round((nouvellesCharges / this.revenusMensuels) * 100);

    // Score de solvabilité
    this.scoreSolvabilite = this.calculateScoreSolvabilite();

    // Risque IA
    this.risqueIA = this.calculateRisqueIA();

    // Décision et recommandation
    this.generateDecision();
  }

  calculateScoreSolvabilite(): number {
    let score = 0;

    if (this.revenusMensuels >= 3000) {
      score += 20;
    } else if (this.revenusMensuels >= 2000) {
      score += 15;
    } else if (this.revenusMensuels >= 1000) {
      score += 10;
    } else {
      score += 5;
    }

    score += 15; // CDI
    score += 10; // Ancienneté > 2 ans

    if (this.tauxEndettement < 35) {
      score += 25;
    } else if (this.tauxEndettement < 45) {
      score += 15;
    } else {
      score += 5;
    }

    if (this.nouveauTauxEndettement < 35) {
      score += 5;
    } else if (this.nouveauTauxEndettement < 45) {
      score += 3;
    }

    if (this.resteAVivre > 2000) {
      score += 10;
    } else if (this.resteAVivre > 1000) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  calculateRisqueIA(): number {
    let risque = 0;

    if (this.tauxEndettement < 35) {
      risque += 10;
    } else if (this.tauxEndettement < 45) {
      risque += 30;
    } else {
      risque += 50;
    }

    if (this.scoreSolvabilite >= 80) {
      risque += 5;
    } else if (this.scoreSolvabilite >= 60) {
      risque += 20;
    } else {
      risque += 35;
    }

    if (this.resteAVivre > 2000) {
      risque += 5;
    } else if (this.resteAVivre > 1000) {
      risque += 15;
    } else {
      risque += 25;
    }

    return Math.min(Math.round(risque), 100);
  }

  generateDecision(): void {
    const tauxOk = this.nouveauTauxEndettement < 35;
    const scoreOk = this.scoreSolvabilite >= 75;
    const resteOk = this.resteAVivre > 1000;
    const risqueOk = this.risqueIA < 40;

    this.motifs = [];

    if (tauxOk && scoreOk && resteOk && risqueOk) {
      this.decision = 'approuve';
      this.recommandation = '✅ Crédit recommandé';
      this.motifs = [
        '✅ Taux d\'endettement maîtrisé',
        '✅ Bon score de solvabilité',
        '✅ Reste à vivre confortable',
        '✅ Risque faible'
      ];
    } else if (tauxOk && scoreOk) {
      this.decision = 'approuve_conditionnel';
      this.recommandation = '⚠️ Crédit recommandé sous conditions';
      this.motifs = [
        '⚠️ Taux d\'endettement acceptable',
        '⚠️ Score de solvabilité correct'
      ];
      if (!resteOk) this.motifs.push('⚠️ Reste à vivre faible');
      if (!risqueOk) this.motifs.push('⚠️ Risque modéré');
    } else {
      this.decision = 'refuse';
      this.recommandation = '❌ Crédit non recommandé';
      if (!tauxOk) this.motifs.push('❌ Taux d\'endettement trop élevé');
      if (!scoreOk) this.motifs.push('❌ Score de solvabilité insuffisant');
      if (!resteOk) this.motifs.push('❌ Reste à vivre insuffisant');
      if (!risqueOk) this.motifs.push('❌ Risque élevé');
    }
  }

  getDecisionClass(): string {
    if (this.decision === 'approuve') return 'approved';
    if (this.decision === 'approuve_conditionnel') return 'conditional';
    return 'rejected';
  }

  getDecisionLabel(): string {
    if (this.decision === 'approuve') return 'Approuvé ✅';
    if (this.decision === 'approuve_conditionnel') return 'Approuvé sous conditions ⚠️';
    return 'Refusé ❌';
  }

  getScoreClass(): string {
    if (this.scoreSolvabilite >= 90) return 'excellent';
    if (this.scoreSolvabilite >= 75) return 'bon';
    if (this.scoreSolvabilite >= 60) return 'moyen';
    if (this.scoreSolvabilite >= 40) return 'faible';
    return 'tres_risque';
  }

  getScoreLabel(): string {
    if (this.scoreSolvabilite >= 90) return 'Excellent';
    if (this.scoreSolvabilite >= 75) return 'Bon';
    if (this.scoreSolvabilite >= 60) return 'Moyen';
    if (this.scoreSolvabilite >= 40) return 'Faible';
    return 'Très risqué';
  }

  getRisqueClass(): string {
    if (this.risqueIA < 30) return 'faible';
    if (this.risqueIA < 60) return 'moyen';
    return 'eleve';
  }

  getRisqueLabel(): string {
    if (this.risqueIA < 30) return 'Faible';
    if (this.risqueIA < 60) return 'Moyen';
    return 'Élevé';
  }

  getTauxEndettementClass(): string {
    if (this.nouveauTauxEndettement < 35) return 'excellent';
    if (this.nouveauTauxEndettement < 45) return 'acceptable';
    return 'critique';
  }

  goBack(): void {
    this.router.navigate(['/my-credits']);
  }
}
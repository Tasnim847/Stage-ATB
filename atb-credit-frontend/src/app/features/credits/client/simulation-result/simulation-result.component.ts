import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { CreditSimulationService } from '@core/services/credit-simulation.service';
import { CreditSimulation } from '@app/core/models/credit-simulation.model';

@Component({
  selector: 'app-simulation-result',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './simulation-result.component.html',
  styleUrls: ['./simulation-result.component.css']
})
export class SimulationResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
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

  // ✅ Gestion de l'édition
  showEditForm: boolean = false;
  editSubmitting: boolean = false;
  editForm!: FormGroup;

  // ✅ Gestion de la comparaison
  showComparison: boolean = false;
  comparisonResult: string = '';
  selectedForComparison: string[] = [];

  ngOnInit(): void {
    this.creditRequestId = this.route.snapshot.paramMap.get('id');
    if (this.creditRequestId) {
      this.loadSimulation();
    } else {
      // Si l'ID est un ID de simulation directe
      const simulationId = this.route.snapshot.paramMap.get('id');
      if (simulationId) {
        this.loadSimulationById(simulationId);
      } else {
        this.toastr.error('ID de simulation manquant', 'Erreur');
        this.router.navigate(['/my-credits']);
      }
    }
    this.initEditForm();
  }

  initEditForm(): void {
    this.editForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(100)]],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      interestRate: ['', [Validators.required, Validators.min(0.1), Validators.max(20)]],
      simulationName: ['']
    });
  }

  loadSimulation(): void {
    this.isLoading = true;
    this.simulationService.getSimulationByCreditRequestId(this.creditRequestId!).subscribe({
      next: (simulation) => {
        this.simulation = simulation;
        this.calculateResults();
        this.populateEditForm();
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

  loadSimulationById(id: string): void {
    this.isLoading = true;
    this.simulationService.getSimulationById(id).subscribe({
      next: (simulation) => {
        this.simulation = simulation;
        this.calculateResults();
        this.populateEditForm();
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

  populateEditForm(): void {
    if (this.simulation) {
      this.editForm.patchValue({
        amount: this.simulation.amount,
        durationMonths: this.simulation.durationMonths,
        interestRate: this.simulation.interestRate,
        simulationName: this.simulation.simulationName || ''
      });
    }
  }

  calculateResults(): void {
    if (!this.simulation) return;

    // Utiliser les données de la simulation si disponibles
    this.revenusMensuels = 3700; // À remplacer par les vraies données
    this.chargesMensuelles = 1200; // À remplacer par les vraies données

    this.tauxEndettement = Math.round((this.chargesMensuelles / this.revenusMensuels) * 100);
    this.resteAVivre = this.revenusMensuels - this.chargesMensuelles;
    this.mensualite = this.simulation.monthlyPayment;

    const nouvellesCharges = this.chargesMensuelles + this.mensualite;
    this.nouveauTauxEndettement = Math.round((nouvellesCharges / this.revenusMensuels) * 100);

    this.scoreSolvabilite = this.calculateScoreSolvabilite();
    this.risqueIA = this.calculateRisqueIA();
    this.generateDecision();
  }

  calculateScoreSolvabilite(): number {
    let score = 0;
    if (this.revenusMensuels >= 3000) score += 20;
    else if (this.revenusMensuels >= 2000) score += 15;
    else if (this.revenusMensuels >= 1000) score += 10;
    else score += 5;

    score += 15; // CDI
    score += 10; // Ancienneté > 2 ans

    if (this.tauxEndettement < 35) score += 25;
    else if (this.tauxEndettement < 45) score += 15;
    else score += 5;

    if (this.nouveauTauxEndettement < 35) score += 5;
    else if (this.nouveauTauxEndettement < 45) score += 3;

    if (this.resteAVivre > 2000) score += 10;
    else if (this.resteAVivre > 1000) score += 5;

    return Math.min(score, 100);
  }

  calculateRisqueIA(): number {
    let risque = 0;

    if (this.tauxEndettement < 35) risque += 10;
    else if (this.tauxEndettement < 45) risque += 30;
    else risque += 50;

    if (this.scoreSolvabilite >= 80) risque += 5;
    else if (this.scoreSolvabilite >= 60) risque += 20;
    else risque += 35;

    if (this.resteAVivre > 2000) risque += 5;
    else if (this.resteAVivre > 1000) risque += 15;
    else risque += 25;

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

  // ============================================================
  // ✅ MÉTHODES UPDATE
  // ============================================================

  editSimulation(): void {
    this.showEditForm = !this.showEditForm;
    if (this.showEditForm) {
      this.populateEditForm();
    }
  }

  saveEdit(): void {
    if (!this.editForm.valid || !this.simulation) {
      this.toastr.error('Veuillez corriger les erreurs du formulaire', 'Erreur');
      return;
    }

    this.editSubmitting = true;
    const data = this.editForm.value;

    this.simulationService.updateSimulation(this.simulation.id, {
      amount: data.amount,
      durationMonths: data.durationMonths,
      interestRate: data.interestRate
    }).subscribe({
      next: (updated) => {
        // Mettre à jour le nom si changé
        if (data.simulationName && data.simulationName !== this.simulation?.simulationName) {
          this.simulationService.updateSimulationName(this.simulation!.id, data.simulationName)
            .subscribe({
              next: () => {
                this.toastr.success('Simulation mise à jour avec succès', 'Succès');
                this.showEditForm = false;
                this.editSubmitting = false;
                this.reloadSimulation();
              },
              error: () => {
                this.toastr.success('Simulation mise à jour (nom inchangé)', 'Succès');
                this.showEditForm = false;
                this.editSubmitting = false;
                this.reloadSimulation();
              }
            });
        } else {
          this.toastr.success('Simulation mise à jour avec succès', 'Succès');
          this.showEditForm = false;
          this.editSubmitting = false;
          this.reloadSimulation();
        }
      },
      error: (error) => {
        this.toastr.error('Erreur lors de la mise à jour', 'Erreur');
        this.editSubmitting = false;
      }
    });
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.populateEditForm();
  }

  reloadSimulation(): void {
    if (this.simulation) {
      this.simulationService.getSimulationById(this.simulation.id).subscribe({
        next: (simulation) => {
          this.simulation = simulation;
          this.calculateResults();
          this.populateEditForm();
        },
        error: (error) => {
          this.toastr.error('Erreur lors du rechargement', 'Erreur');
        }
      });
    }
  }

  // ============================================================
  // 🗑️ MÉTHODES DELETE
  // ============================================================

  deleteSimulation(): void {
    if (!this.simulation) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette simulation ? Cette action est irréversible.')) {
      return;
    }
    
    this.isLoading = true;
    this.simulationService.deleteSimulation(this.simulation.id).subscribe({
      next: () => {
        this.toastr.success('Simulation supprimée avec succès', 'Succès');
        this.isLoading = false;
        this.router.navigate(['/simulations']);
      },
      error: (error) => {
        this.toastr.error('Erreur lors de la suppression', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  // ============================================================
  // 📊 MÉTHODES COMPARAISON
  // ============================================================

  compareWith(compareId: string): void {
    if (!this.simulation) return;
    
    const index = this.selectedForComparison.indexOf(compareId);
    if (index === -1) {
      this.selectedForComparison.push(compareId);
      this.toastr.info('Simulation ajoutée à la comparaison');
    } else {
      this.selectedForComparison.splice(index, 1);
      this.toastr.info('Simulation retirée de la comparaison');
    }

    if (this.selectedForComparison.length >= 2) {
      this.simulationService.compareSimulations(this.selectedForComparison).subscribe({
        next: (result) => {
          this.comparisonResult = result;
          this.showComparison = true;
          this.selectedForComparison = [];
          this.toastr.success('Comparaison terminée', 'Succès');
        },
        error: (error) => {
          this.toastr.error('Erreur lors de la comparaison', 'Erreur');
        }
      });
    }
  }

  closeComparison(): void {
    this.showComparison = false;
    this.comparisonResult = '';
  }

  // ============================================================
  // 🎨 MÉTHODES D'AFFICHAGE
  // ============================================================

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
    // Retourner à la page précédente ou à la liste des simulations
    this.router.navigate(['/simulations']);
  }
}
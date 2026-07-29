// src/app/features/analyst/decisions/decision-analyze/decision-analyze.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DecisionService } from '@core/services/decision.service';

@Component({
  selector: 'app-decision-analyze',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './decision-analyze.component.html',
  styleUrls: ['./decision-analyze.component.css']
})
export class DecisionAnalyzeComponent implements OnInit {
  decisionId: string;
  isLoading = true;
  isSubmitting = false;
  decision: any;
  analysisForm: FormGroup;
  
  analysisResult = {
    score: 0,
    recommendation: '',
    riskFactors: [] as string[],
    strengths: [] as string[],
    documents: [] as string[]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private decisionService: DecisionService,
    private snackBar: MatSnackBar
  ) {
    this.decisionId = this.route.snapshot.params['id'];
    
    this.analysisForm = this.fb.group({
      recommendation: ['', Validators.required],
      notes: [''],
      riskLevel: ['', Validators.required],
      amountApproved: ['', [Validators.required, Validators.min(0)]],
      interestRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      duration: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadDecision();
  }

  loadDecision(): void {
    this.isLoading = true;
    this.decisionService.getDecisionById(this.decisionId).subscribe({
      next: (data) => {
        this.decision = data;
        this.loadAnalysisData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        this.router.navigate(['/decisions/pending']);
      }
    });
  }

  loadAnalysisData(): void {
    this.decisionService.getAnalysisData(this.decisionId).subscribe({
      next: (data) => {
        this.analysisResult = data;
        this.analysisForm.patchValue({
          amountApproved: this.decision.amount * 0.8,
          interestRate: 4.5,
          duration: this.decision.duration
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données d\'analyse', error);
        // Données mock
        this.analysisResult = {
          score: 75,
          recommendation: 'Ce dossier présente un bon profil de risque. Une approbation est recommandée.',
          riskFactors: ['Aucun facteur de risque majeur identifié'],
          strengths: ['Bon historique de crédit', 'Revenus stables', 'Taux d\'endettement maîtrisé'],
          documents: []
        };
      }
    });
  }

  submitApproval(): void {
    if (this.analysisForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isSubmitting = true;
    const data = {
      decisionId: this.decisionId,
      ...this.analysisForm.value,
      analysisResult: this.analysisResult
    };

    this.decisionService.approveDecision(data).subscribe({
      next: () => {
        this.snackBar.open('✅ Décision approuvée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/decisions/approved']);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.snackBar.open('❌ Erreur lors de l\'approbation', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  submitRejection(): void {
    this.isSubmitting = true;
    const data = {
      decisionId: this.decisionId,
      reason: this.analysisForm.get('notes')?.value || 'Non conforme aux critères',
      notes: this.analysisForm.get('notes')?.value
    };

    this.decisionService.rejectDecision(data).subscribe({
      next: () => {
        this.snackBar.open('❌ Décision refusée', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/decisions/rejected']);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.snackBar.open('❌ Erreur lors du refus', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'APPROVED': return 'primary';
      case 'REJECTED': return 'warn';
      case 'PENDING_ANALYSIS': return 'accent';
      default: return '';
    }
  }

  getRiskColor(score: number): string {
    if (score >= 70) return '#4caf50';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/decisions/pending']);
  }
}
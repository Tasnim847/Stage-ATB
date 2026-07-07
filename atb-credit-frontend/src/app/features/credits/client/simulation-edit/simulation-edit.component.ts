// simulation-edit/simulation-edit.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { CreditSimulationService } from '@core/services/credit-simulation.service';
import { CreditSimulation } from '@core/models/credit-simulation.model';

@Component({
  selector: 'app-simulation-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="edit-container">
      <mat-card class="edit-card">
        <mat-card-header>
          <mat-card-title>
            <div class="header">
              <button mat-icon-button (click)="goBack()" class="back-btn">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <div class="header-content">
                <h1>✏️ Modifier la simulation</h1>
                <p *ngIf="simulation">Simulation: {{ simulation.simulationName }}</p>
              </div>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Loading -->
          <div *ngIf="isLoading" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Chargement de la simulation...</p>
          </div>

          <!-- Formulaire -->
          <div *ngIf="!isLoading && simulation">
            <form [formGroup]="simulationForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <!-- Montant -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Montant (TND)</mat-label>
                  <input matInput type="number" formControlName="amount" placeholder="Ex: 50000" />
                  <mat-icon matSuffix>attach_money</mat-icon>
                  <mat-error *ngIf="simulationForm.get('amount')?.invalid && simulationForm.get('amount')?.touched">
                    Le montant est requis (minimum 100 TND)
                  </mat-error>
                </mat-form-field>

                <!-- Durée -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Durée (mois)</mat-label>
                  <input matInput type="number" formControlName="durationMonths" placeholder="Ex: 36" />
                  <mat-icon matSuffix>calendar_today</mat-icon>
                  <mat-error *ngIf="simulationForm.get('durationMonths')?.invalid && simulationForm.get('durationMonths')?.touched">
                    La durée est requise (1-120 mois)
                  </mat-error>
                </mat-form-field>

                <!-- Taux d'intérêt -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Taux d'intérêt (%)</mat-label>
                  <input matInput type="number" formControlName="interestRate" placeholder="Ex: 6.5" step="0.1" />
                  <mat-icon matSuffix>percent</mat-icon>
                  <mat-error *ngIf="simulationForm.get('interestRate')?.invalid && simulationForm.get('interestRate')?.touched">
                    Le taux d'intérêt est requis
                  </mat-error>
                </mat-form-field>

                <!-- Nom de la simulation -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nom de la simulation</mat-label>
                  <input matInput formControlName="simulationName" placeholder="Ex: Mon projet immobilier" />
                  <mat-icon matSuffix>label</mat-icon>
                </mat-form-field>
              </div>

              <!-- Résumé des indicateurs -->
              <div class="indicators-preview" *ngIf="showPreview">
                <h4>📈 Aperçu des indicateurs</h4>
                <div class="indicators-grid">
                  <div class="indicator">
                    <span class="label">Mensualité</span>
                    <span class="value">{{ calculateMonthlyPayment() | currency:'TND' }}</span>
                  </div>
                  <div class="indicator">
                    <span class="label">Total intérêts</span>
                    <span class="value">{{ calculateTotalInterest() | currency:'TND' }}</span>
                  </div>
                  <div class="indicator">
                    <span class="label">Total à payer</span>
                    <span class="value">{{ calculateTotalPayment() | currency:'TND' }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="goBack()">
                  <mat-icon>cancel</mat-icon> Annuler
                </button>
                <button mat-stroked-button type="button" (click)="togglePreview()">
                  <mat-icon>visibility</mat-icon> {{ showPreview ? 'Cacher' : 'Aperçu' }}
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting || !simulationForm.valid">
                  <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
                  <span *ngIf="!isSubmitting">
                    <mat-icon>save</mat-icon> Enregistrer
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- Pas de simulation -->
          <div *ngIf="!isLoading && !simulation" class="not-found">
            <mat-icon>error</mat-icon>
            <h3>Simulation non trouvée</h3>
            <p>La simulation que vous cherchez n'existe pas.</p>
            <button mat-raised-button color="primary" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon> Retour
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .edit-container { padding: 20px; max-width: 700px; margin: auto; }
    .header { display: flex; align-items: center; gap: 12px; }
    .header-content h1 { margin: 0; font-size: 24px; }
    .header-content p { margin: 4px 0 0; color: #666; }
    
    .loading { text-align: center; padding: 40px; }
    .loading p { margin-top: 12px; color: #666; }
    
    .form-grid { display: grid; gap: 20px; }
    .full-width { width: 100%; }
    
    .indicators-preview { margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px; }
    .indicators-preview h4 { margin: 0 0 12px; }
    .indicators-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .indicator { text-align: center; }
    .indicator .label { display: block; font-size: 12px; color: #888; }
    .indicator .value { display: block; font-size: 18px; font-weight: 500; color: #1a237e; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    
    .not-found { text-align: center; padding: 40px; }
    .not-found mat-icon { font-size: 48px; width: 48px; height: 48px; color: #f44336; }
    .not-found h3 { margin: 16px 0 8px; }
    .not-found p { color: #666; margin-bottom: 16px; }
  `]
})
export class SimulationEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationService = inject(CreditSimulationService);
  private toastr = inject(ToastrService);

  simulationId!: string;
  simulation: CreditSimulation | null = null;
  simulationForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  showPreview = false;

  ngOnInit(): void {
    this.simulationId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.simulationId) {
      this.toastr.error('ID de simulation manquant', 'Erreur');
      this.goBack();
      return;
    }
    this.initForm();
    this.loadSimulation();
  }

  initForm(): void {
    this.simulationForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(100)]],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      interestRate: ['', [Validators.required, Validators.min(0.1), Validators.max(20)]],
      simulationName: ['']
    });

    // Recalculer l'aperçu à chaque changement
    this.simulationForm.valueChanges.subscribe(() => {
      if (this.showPreview) {
        // Mettre à jour l'aperçu
      }
    });
  }

  loadSimulation(): void {
    this.isLoading = true;
    this.simulationService.getSimulationById(this.simulationId).subscribe({
      next: (simulation) => {
        this.simulation = simulation;
        this.simulationForm.patchValue({
          amount: simulation.amount,
          durationMonths: simulation.durationMonths,
          interestRate: simulation.interestRate,
          simulationName: simulation.simulationName || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement de la simulation', 'Erreur');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  calculateMonthlyPayment(): number {
    const amount = this.simulationForm.get('amount')?.value || 0;
    const rate = this.simulationForm.get('interestRate')?.value || 0;
    const months = this.simulationForm.get('durationMonths')?.value || 1;
    
    if (amount <= 0 || rate <= 0 || months <= 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return amount / months;
    
    const factor = Math.pow(1 + monthlyRate, months);
    return (amount * monthlyRate * factor) / (factor - 1);
  }

  calculateTotalInterest(): number {
    const monthlyPayment = this.calculateMonthlyPayment();
    const months = this.simulationForm.get('durationMonths')?.value || 0;
    const amount = this.simulationForm.get('amount')?.value || 0;
    return (monthlyPayment * months) - amount;
  }

  calculateTotalPayment(): number {
    const monthlyPayment = this.calculateMonthlyPayment();
    const months = this.simulationForm.get('durationMonths')?.value || 0;
    return monthlyPayment * months;
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  onSubmit(): void {
    if (!this.simulationForm.valid) {
      this.toastr.error('Veuillez corriger les erreurs du formulaire', 'Erreur');
      return;
    }

    this.isSubmitting = true;
    const data = this.simulationForm.value;

    this.simulationService.updateSimulation(this.simulationId, {
      amount: data.amount,
      durationMonths: data.durationMonths,
      interestRate: data.interestRate
    }).subscribe({
      next: (updatedSimulation) => {
        // Si le nom a été modifié, le mettre à jour
        if (data.simulationName && data.simulationName !== this.simulation?.simulationName) {
          this.simulationService.updateSimulationName(this.simulationId, data.simulationName)
            .subscribe({
              next: () => {
                this.toastr.success('Simulation mise à jour avec succès', 'Succès');
                this.isSubmitting = false;
                this.goBack();
              },
              error: () => {
                this.toastr.success('Simulation mise à jour (nom inchangé)', 'Succès');
                this.isSubmitting = false;
                this.goBack();
              }
            });
        } else {
          this.toastr.success('Simulation mise à jour avec succès', 'Succès');
          this.isSubmitting = false;
          this.goBack();
        }
      },
      error: (error) => {
        this.toastr.error('Erreur lors de la mise à jour', 'Erreur');
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/simulations']);
  }
}
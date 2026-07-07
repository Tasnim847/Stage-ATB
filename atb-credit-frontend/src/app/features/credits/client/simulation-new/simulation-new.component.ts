// features/credits/client/simulation-new/simulation-new.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { CreditSimulationService } from '@core/services/credit-simulation.service';
import { AuthService } from '@core/services/auth.service';
import { ClientService } from '@core/services/client.service';

@Component({
  selector: 'app-simulation-new',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="simulation-new-container">
      <mat-card class="form-card">
        <!-- Header -->
        <mat-card-header>
          <mat-card-title>
            <div class="header">
              <button mat-icon-button (click)="goBack()" class="back-btn">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <div class="header-content">
                <h1>📊 Nouvelle simulation</h1>
                <p>Simulez votre crédit avant de faire une demande</p>
              </div>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Loading -->
          <div *ngIf="isLoading" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Chargement...</p>
          </div>

          <!-- Formulaire -->
          <div *ngIf="!isLoading">
            <form [formGroup]="simulationForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <!-- Montant -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Montant (TND)</mat-label>
                  <input matInput type="number" formControlName="amount" placeholder="Ex: 50000" />
                  <mat-icon matSuffix>attach_money</mat-icon>
                  <mat-error *ngIf="simulationForm.get('amount')?.invalid && simulationForm.get('amount')?.touched">
                    <span *ngIf="simulationForm.get('amount')?.errors?.['required']">Le montant est requis</span>
                    <span *ngIf="simulationForm.get('amount')?.errors?.['min']">Minimum 100 TND</span>
                  </mat-error>
                </mat-form-field>

                <!-- Durée -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Durée (mois)</mat-label>
                  <input matInput type="number" formControlName="durationMonths" placeholder="Ex: 36" />
                  <mat-icon matSuffix>calendar_today</mat-icon>
                  <mat-error *ngIf="simulationForm.get('durationMonths')?.invalid && simulationForm.get('durationMonths')?.touched">
                    <span *ngIf="simulationForm.get('durationMonths')?.errors?.['required']">La durée est requise</span>
                    <span *ngIf="simulationForm.get('durationMonths')?.errors?.['min']">Minimum 1 mois</span>
                    <span *ngIf="simulationForm.get('durationMonths')?.errors?.['max']">Maximum 120 mois</span>
                  </mat-error>
                </mat-form-field>

                <!-- Taux d'intérêt -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Taux d'intérêt (%)</mat-label>
                  <input matInput type="number" formControlName="interestRate" placeholder="Ex: 6.5" step="0.1" />
                  <mat-icon matSuffix>percent</mat-icon>
                  <mat-error *ngIf="simulationForm.get('interestRate')?.invalid && simulationForm.get('interestRate')?.touched">
                    <span *ngIf="simulationForm.get('interestRate')?.errors?.['required']">Le taux est requis</span>
                    <span *ngIf="simulationForm.get('interestRate')?.errors?.['min']">Minimum 0.1%</span>
                    <span *ngIf="simulationForm.get('interestRate')?.errors?.['max']">Maximum 20%</span>
                  </mat-error>
                </mat-form-field>

                <!-- Client (optionnel) -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Client (optionnel)</mat-label>
                  <mat-select formControlName="clientId">
                    <mat-option [value]="null">Sans client</mat-option>
                    <mat-option *ngFor="let client of clients" [value]="client.id">
                      {{ client.firstName }} {{ client.lastName }} - {{ client.email }}
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>person</mat-icon>
                </mat-form-field>

                <!-- Nom de la simulation -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nom de la simulation (optionnel)</mat-label>
                  <input matInput formControlName="simulationName" placeholder="Ex: Projet immobilier" />
                  <mat-icon matSuffix>label</mat-icon>
                </mat-form-field>
              </div>

              <!-- Résultats en temps réel -->
              <div *ngIf="showPreview && simulationForm.valid" class="preview-section">
                <mat-divider></mat-divider>
                <h4>📈 Aperçu de la simulation</h4>
                <div class="preview-grid">
                  <div class="preview-item">
                    <span class="label">Mensualité</span>
                    <span class="value">{{ calculateMonthlyPayment() | currency:'TND' }}</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">Total intérêts</span>
                    <span class="value">{{ calculateTotalInterest() | currency:'TND' }}</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">Total à payer</span>
                    <span class="value">{{ calculateTotalPayment() | currency:'TND' }}</span>
                  </div>
                  <div class="preview-item" *ngIf="monthlyIncome > 0">
                    <span class="label">Taux d'endettement</span>
                    <span class="value" [class.warning]="calculateDebtRatio() > 33">
                      {{ calculateDebtRatio() }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="togglePreview()">
                  <mat-icon>visibility</mat-icon>
                  {{ showPreview ? 'Cacher aperçu' : 'Afficher aperçu' }}
                </button>
                <button mat-stroked-button type="button" (click)="goBack()">
                  <mat-icon>cancel</mat-icon> Annuler
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting || !simulationForm.valid">
                  <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
                  <span *ngIf="!isSubmitting">
                    <mat-icon>calculate</mat-icon> Simuler
                  </span>
                </button>
              </div>
            </form>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .simulation-new-container { padding: 20px; max-width: 700px; margin: auto; }
    
    .header { display: flex; align-items: center; gap: 12px; }
    .header-content h1 { margin: 0; font-size: 24px; }
    .header-content p { margin: 4px 0 0; color: #666; }
    
    .loading { text-align: center; padding: 40px; }
    .loading p { margin-top: 12px; color: #666; }
    
    .form-grid { display: grid; gap: 20px; }
    .full-width { width: 100%; }
    
    .preview-section { margin-top: 24px; }
    .preview-section h4 { margin: 16px 0 12px; }
    
    .preview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .preview-item { background: #f5f5f5; padding: 12px; border-radius: 8px; text-align: center; }
    .preview-item .label { display: block; font-size: 12px; color: #888; }
    .preview-item .value { display: block; font-size: 18px; font-weight: 500; color: #1a237e; }
    .preview-item .value.warning { color: #c62828; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
  `]
})
export class SimulationNewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private simulationService = inject(CreditSimulationService);
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private toastr = inject(ToastrService);

  simulationForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  showPreview = false;
  clients: any[] = [];
  monthlyIncome: number = 0;

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm(): void {
    this.simulationForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(100)]],
      durationMonths: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      interestRate: ['', [Validators.required, Validators.min(0.1), Validators.max(20)]],
      clientId: [null],
      simulationName: ['']
    });

    // Recalculer l'aperçu à chaque changement
    this.simulationForm.valueChanges.subscribe(() => {
      if (this.showPreview) {
        // Mettre à jour l'aperçu
      }
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        this.isLoading = false;
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

  calculateDebtRatio(): number {
    const monthlyPayment = this.calculateMonthlyPayment();
    if (this.monthlyIncome <= 0) return 0;
    return Math.round((monthlyPayment / this.monthlyIncome) * 100);
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
    const formData = this.simulationForm.value;

    this.simulationService.createStandaloneSimulation({
      amount: formData.amount,
      durationMonths: formData.durationMonths,
      interestRate: formData.interestRate,
      clientId: formData.clientId || undefined
    }).subscribe({
      next: (simulation) => {
        this.isSubmitting = false;
        
        // Si un nom a été saisi, le mettre à jour
        if (formData.simulationName) {
          this.simulationService.updateSimulationName(simulation.id, formData.simulationName)
            .subscribe({
              next: () => {
                this.toastr.success('Simulation créée avec succès', 'Succès');
                this.router.navigate(['/simulation-result', simulation.id]);
              },
              error: () => {
                this.toastr.success('Simulation créée avec succès', 'Succès');
                this.router.navigate(['/simulation-result', simulation.id]);
              }
            });
        } else {
          this.toastr.success('Simulation créée avec succès', 'Succès');
          this.router.navigate(['/simulation-result', simulation.id]);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error('Erreur lors de la création de la simulation', 'Erreur');
        console.error('Erreur:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/simulations']);
  }
}
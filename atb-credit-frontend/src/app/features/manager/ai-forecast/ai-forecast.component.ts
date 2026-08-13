// features/manager/ai-forecast/ai-forecast.component.ts
import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';

import { AIForecastService, ForecastResponse, ForecastRequest, ScenarioSimulation } from '@core/services/ai-forecast.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ai-forecast',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTabsModule
  ],
  templateUrl: './ai-forecast.component.html',
  styleUrls: ['./ai-forecast.component.css']
})
export class AIForecastComponent implements OnInit, AfterViewInit {
  private forecastService = inject(AIForecastService);
  private snackBar = inject(MatSnackBar);

  // États
  loading = false;
  generating = false;
  selectedForecast: ForecastResponse | null = null;
  forecasts: ForecastResponse[] = [];
  scenarios: ScenarioSimulation[] = [];
  
  // Configuration des prévisions
  forecastConfig: ForecastRequest = {
    period: 'month',
    metric: 'approval_rate',
    confidenceLevel: 95
  };

  // Configuration des scénarios
  scenarioConfig = {
    economicGrowth: 2.5,
    interestRate: 7.5,
    unemployment: 12,
    inflation: 6
  };

  // Métriques disponibles
  metrics = [
    { value: 'approval_rate', label: "Taux d'approbation" },
    { value: 'volume', label: 'Volume de demandes' },
    { value: 'risk_score', label: 'Score de risque' },
    { value: 'default_rate', label: 'Taux de défaut' }
  ];

  periods = [
    { value: 'month', label: '1 mois' },
    { value: 'quarter', label: '3 mois' },
    { value: 'year', label: '12 mois' }
  ];

  // Référence du graphique
  private chart: Chart | null = null;

  ngOnInit(): void {
    this.loadForecasts();
  }

  ngAfterViewInit(): void {
    // Le graphique sera initialisé après la génération
  }

  loadForecasts(): void {
    this.loading = true;
    this.forecastService.getForecasts(5).subscribe({
      next: (forecasts) => {
        this.forecasts = forecasts;
        if (forecasts.length > 0) {
          this.selectedForecast = forecasts[0];
          setTimeout(() => this.initChart(), 300);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement prévisions:', error);
        this.loading = false;
        this.snackBar.open('❌ Erreur lors du chargement des prévisions', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  generateForecast(): void {
    this.generating = true;
    this.selectedForecast = null;

    this.forecastService.generateForecast(this.forecastConfig).subscribe({
      next: (forecast) => {
        this.selectedForecast = forecast;
        this.forecasts = [forecast, ...this.forecasts];
        this.generating = false;
        setTimeout(() => this.initChart(), 300);
        this.snackBar.open('✅ Prévisions générées avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur génération prévisions:', error);
        this.generating = false;
        this.snackBar.open('❌ Erreur lors de la génération des prévisions', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  simulateScenarios(): void {
    this.loading = true;
    this.forecastService.simulateScenarios(this.scenarioConfig).subscribe({
      next: (scenarios) => {
        this.scenarios = scenarios;
        this.loading = false;
        this.snackBar.open('📊 Scénarios simulés avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur simulation:', error);
        this.loading = false;
        this.snackBar.open('❌ Erreur lors de la simulation', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  initChart(): void {
    if (!this.selectedForecast) return;

    const ctx = document.getElementById('forecastChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.selectedForecast.forecastValues.map(f => f.period);
    const values = this.selectedForecast.forecastValues.map(f => f.value);
    const upperBounds = this.selectedForecast.forecastValues.map(f => f.upperBound);
    const lowerBounds = this.selectedForecast.forecastValues.map(f => f.lowerBound);

    const currentValue = this.selectedForecast.currentValue;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Actuel', ...labels],
        datasets: [
          {
            label: this.getMetricLabel(this.selectedForecast.metric),
            data: [currentValue, ...values],
            borderColor: '#1a237e',
            backgroundColor: 'rgba(26, 35, 126, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#1a237e',
            pointRadius: 4,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Intervalle de confiance (sup)',
            data: [currentValue, ...upperBounds],
            borderColor: 'rgba(26, 35, 126, 0.2)',
            backgroundColor: 'rgba(26, 35, 126, 0.05)',
            borderWidth: 0,
            pointRadius: 0,
            fill: '+1'
          },
          {
            label: 'Intervalle de confiance (inf)',
            data: [currentValue, ...lowerBounds],
            borderColor: 'rgba(26, 35, 126, 0.2)',
            backgroundColor: 'rgba(26, 35, 126, 0.05)',
            borderWidth: 0,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: `Prévisions - ${this.getMetricLabel(this.selectedForecast.metric)}`,
            font: {
              size: 16
            }
          },
          // ✅ CORRECTION DU TOOLTIP
          tooltip: {
            callbacks: {
              label: function(context) {
                // ✅ Vérification que parsed.y n'est pas null
                if (context.parsed.y === null || context.parsed.y === undefined) {
                  return context.dataset.label + ': N/A';
                }
                return context.dataset.label + ': ' + context.parsed.y.toFixed(2);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.getMetricLabel(this.selectedForecast.metric)
            }
          }
        }
      }
    });
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  getMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      'approval_rate': "Taux d'approbation (%)",
      'volume': 'Volume de demandes',
      'risk_score': 'Score de risque',
      'default_rate': 'Taux de défaut (%)'
    };
    return labels[metric] || metric;
  }

  getTrendIcon(trend: string): string {
    const icons: { [key: string]: string } = {
      'up': 'trending_up',
      'down': 'trending_down',
      'stable': 'trending_flat'
    };
    return icons[trend] || 'trending_flat';
  }

  getTrendColor(trend: string): string {
    const colors: { [key: string]: string } = {
      'up': '#4caf50',
      'down': '#f44336',
      'stable': '#ff9800'
    };
    return colors[trend] || '#666';
  }

  getRiskColor(riskLevel: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#4caf50',
      'MODERATE': '#ff9800',
      'HIGH': '#f44336',
      'CRITICAL': '#c62828'
    };
    return colors[riskLevel] || '#1a237e';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2
    }).format(value);
  }

  selectForecast(forecast: ForecastResponse): void {
    this.selectedForecast = forecast;
    setTimeout(() => this.initChart(), 300);
  }

  refresh(): void {
    this.loadForecasts();
  }
}
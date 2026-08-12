// portfolio-charts.component.ts - Ajout de la gestion d'erreur
import { Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-portfolio-charts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './portfolio-charts.component.html',
  styleUrls: ['./portfolio-charts.component.css']
})
export class PortfolioChartsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() data: any = null;
  @Input() isLoading: boolean = false;
  @Input() selectedYear: number = new Date().getFullYear();

  @ViewChild('evolutionChart') evolutionCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distributionChart') distributionCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('acceptanceChart') acceptanceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskChart') riskCanvas!: ElementRef<HTMLCanvasElement>;

  charts: Chart[] = [];
  private initializing = false;
  private isDestroyed = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // ✅ Attendre que le DOM soit prêt
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.initCharts();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroyCharts();
  }

  destroyCharts(): void {
    this.charts.forEach(chart => {
      try {
        chart.destroy();
      } catch (e) {
        // Ignorer les erreurs de destruction
      }
    });
    this.charts = [];
  }

  resetCharts(): void {
    if (this.isDestroyed) return;
    this.destroyCharts();
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.initCharts();
      }
    }, 100);
  }

  initCharts(): void {
    // ✅ Vérifier si le composant est détruit
    if (this.isDestroyed) {
      console.log('⛔ Composant détruit, arrêt de l\'initialisation');
      return;
    }

    // ✅ Vérifier les données
    if (!this.data || this.isLoading) {
      console.log('⏳ Attente des données pour les graphiques...');
      return;
    }

    // ✅ Éviter les initialisations multiples
    if (this.initializing) {
      console.log('🔄 Initialisation déjà en cours...');
      return;
    }

    this.initializing = true;

    try {
      // ✅ Vérifier que les canvas existent
      if (!this.evolutionCanvas?.nativeElement || 
          !this.distributionCanvas?.nativeElement ||
          !this.acceptanceCanvas?.nativeElement ||
          !this.riskCanvas?.nativeElement) {
        console.warn('⚠️ Canvas non disponibles');
        this.initializing = false;
        return;
      }

      console.log('📊 Données reçues pour les graphiques:', this.data);

      // ==========================================
      // 1. Graphique d'évolution (Line Chart)
      // ==========================================
      const evolutionData = this.data.evolution || { labels: [], values: [] };
      const defaultMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      // ✅ S'assurer que les données sont des nombres
      const evolutionValues = evolutionData.values?.map((v: any) => Number(v) || 0) || Array(12).fill(0);
      
      const evolutionChart = new Chart(this.evolutionCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: evolutionData.labels?.length ? evolutionData.labels : defaultMonths,
          datasets: [{
            label: 'Crédits accordés (TND)',
            data: evolutionValues,
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3f51b5',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top', labels: { font: { size: 12 } } },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y || 0;
                  return new Intl.NumberFormat('fr-TN', {
                    style: 'currency',
                    currency: 'TND',
                    minimumFractionDigits: 0
                  }).format(value);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  const numValue = typeof value === 'number' ? value : 0;
                  return new Intl.NumberFormat('fr-TN', {
                    style: 'currency',
                    currency: 'TND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(numValue);
                }
              }
            }
          }
        }
      });
      this.charts.push(evolutionChart);
      console.log('✅ Graphique évolution créé');

      // ==========================================
      // 2. Graphique de distribution (Doughnut)
      // ==========================================
      const distributionData = this.data.distribution || { labels: [], values: [] };
      const defaultLabels = ['Personnel', 'Auto', 'Immobilier', 'Professionnel'];
      const defaultValues = [30, 25, 35, 10];
      const colors = ['#3f51b5', '#4caf50', '#ff9800', '#f44336'];

      // ✅ S'assurer que les valeurs sont des nombres
      const distValues = distributionData.values?.map((v: any) => Number(v) || 0) || defaultValues;
      const distLabels = distributionData.labels?.length ? distributionData.labels : defaultLabels;

      const distributionChart = new Chart(this.distributionCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: distLabels,
          datasets: [{
            data: distValues,
            backgroundColor: colors.slice(0, distLabels.length),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 20 } },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const value = typeof context.parsed === 'number' ? context.parsed : 0;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${context.label}: ${percentage}%`;
                }
              }
            }
          }
        }
      });
      this.charts.push(distributionChart);
      console.log('✅ Graphique distribution créé');

      // ==========================================
      // 3. Graphique d'acceptation (Bar)
      // ==========================================
      const acceptationData = this.data.acceptation || { acceptes: 0, refuses: 0, enAttente: 0 };

      const acceptanceChart = new Chart(this.acceptanceCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Acceptés', 'Refusés', 'En attente'],
          datasets: [{
            label: 'Nombre de crédits',
            data: [
              Number(acceptationData.acceptes) || 0,
              Number(acceptationData.refuses) || 0,
              Number(acceptationData.enAttente) || 0
            ],
            backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
            borderColor: ['#388e3c', '#d32f2f', '#f57c00'],
            borderWidth: 2,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y || 0} crédits`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
      this.charts.push(acceptanceChart);
      console.log('✅ Graphique acceptation créé');

      // ==========================================
      // 4. Graphique de risque (Stacked Bar)
      // ==========================================
      const riskData = this.data.riskByType || { labels: [], low: [], medium: [], high: [] };
      const riskLabels = riskData.labels?.length ? riskData.labels : ['Personnel', 'Auto', 'Immobilier', 'Professionnel'];
      const riskLength = riskLabels.length;

      // ✅ S'assurer que les données sont des tableaux de nombres
      const lowData = riskData.low?.map((v: any) => Number(v) || 0) || Array(riskLength).fill(0);
      const mediumData = riskData.medium?.map((v: any) => Number(v) || 0) || Array(riskLength).fill(0);
      const highData = riskData.high?.map((v: any) => Number(v) || 0) || Array(riskLength).fill(0);

      const riskChart = new Chart(this.riskCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: riskLabels,
          datasets: [
            { 
              label: 'Faible', 
              data: lowData,
              backgroundColor: '#4caf50',
              borderColor: '#388e3c',
              borderWidth: 1
            },
            { 
              label: 'Moyen', 
              data: mediumData,
              backgroundColor: '#ff9800',
              borderColor: '#f57c00',
              borderWidth: 1
            },
            { 
              label: 'Élevé', 
              data: highData,
              backgroundColor: '#f44336',
              borderColor: '#d32f2f',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 15 } },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y || 0}`;
                }
              }
            }
          },
          scales: {
            x: { stacked: true },
            y: { 
              stacked: true, 
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
      this.charts.push(riskChart);
      console.log('✅ Graphique risque créé');

      console.log(`✅ ${this.charts.length} graphiques initialisés avec succès`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des graphiques:', error);
    } finally {
      this.initializing = false;
      this.cdr.detectChanges();
    }
  }
}
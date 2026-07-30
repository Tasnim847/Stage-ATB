// components/parametrage-dashboard/parametrage-dashboard.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ParametrageService } from '@app/core/services/parametrage.service';

type StatsKey = 'creditTypes' | 'interestRates' | 'durations' | 'ceilings';

@Component({
  selector: 'app-parametrage-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './parametrage-dashboard.component.html',
  styleUrls: ['./parametrage-dashboard.component.css']
})
export class ParametrageDashboardComponent implements OnInit {
  private parametrageService = inject(ParametrageService);
  private router = inject(Router);

  stats = {
    creditTypes: 0,
    interestRates: 0,
    durations: 0,
    ceilings: 0
  };

  loading = true;

  modules: Array<{
    path: string;
    icon: string;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    countKey: StatsKey;
  }> = [
    {
      path: 'credit-types',
      icon: 'credit_card',
      title: 'Types de crédit',
      description: 'Gérer les catégories et caractéristiques des crédits',
      color: '#be5543',
      bgColor: 'rgba(190, 85, 67, 0.12)',
      countKey: 'creditTypes'
    },
    {
      path: 'interest-rates',
      icon: 'percent',
      title: "Taux d'intérêt",
      description: 'Configurer les taux de base et personnalisés',
      color: '#d9776b',
      bgColor: 'rgba(217, 119, 107, 0.15)',
      countKey: 'interestRates'
    },
    {
      path: 'durations',
      icon: 'schedule',
      title: 'Durées',
      description: 'Définir les durées disponibles par type de crédit',
      color: '#c9614c',
      bgColor: 'rgba(201, 97, 76, 0.12)',
      countKey: 'durations'
    },
    {
      path: 'ceilings',
      icon: 'euro_symbol',
      title: 'Plafonds',
      description: 'Gérer les montants maximums et niveaux d\'approbation',
      color: '#c62828',
      bgColor: 'rgba(198, 40, 40, 0.12)',
      countKey: 'ceilings'
    }
  ];

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    Promise.all([
      this.parametrageService.getAllCreditTypes().toPromise(),
      this.parametrageService.getInterestRates().toPromise(),
      this.parametrageService.getDurationConfigs().toPromise(),
      this.parametrageService.getCeilingConfigs().toPromise()
    ]).then(([creditTypes, interestRates, durations, ceilings]) => {
      this.stats.creditTypes = creditTypes?.length || 0;
      this.stats.interestRates = interestRates?.length || 0;
      this.stats.durations = durations?.length || 0;
      this.stats.ceilings = ceilings?.length || 0;
      this.loading = false;
    }).catch(() => {
      // Données mock en cas d'erreur
      this.stats.creditTypes = 4;
      this.stats.interestRates = 6;
      this.stats.durations = 5;
      this.stats.ceilings = 3;
      this.loading = false;
    });
  }

  navigateTo(path: string) {
    this.router.navigate(['/admin/parametrage', path]);
  }
}
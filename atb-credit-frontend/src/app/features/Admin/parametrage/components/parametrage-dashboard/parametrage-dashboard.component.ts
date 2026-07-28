// components/parametrage-dashboard/parametrage-dashboard.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ParametrageService } from '@app/core/services/parametrage.service';

// ✅ Définir un type pour les clés possibles
type StatsKey = 'creditTypes' | 'interestRates' | 'durations' | 'ceilings';

@Component({
  selector: 'app-parametrage-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule
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
  
  // ✅ Typer modules avec StatsKey
  modules: Array<{
    path: string;
    icon: string;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    countKey: StatsKey;  // ← Utiliser le type
  }> = [
    {
      path: 'credit-types',
      icon: 'credit_card',
      title: 'Types de crédit',
      description: 'Gérer les catégories et caractéristiques des crédits',
      color: '#1976d2',
      bgColor: '#e3f2fd',
      countKey: 'creditTypes'
    },
    {
      path: 'interest-rates',
      icon: 'percent',
      title: 'Taux d\'intérêt',
      description: 'Configurer les taux de base et personnalisés',
      color: '#388e3c',
      bgColor: '#e8f5e9',
      countKey: 'interestRates'
    },
    {
      path: 'durations',
      icon: 'schedule',
      title: 'Durées',
      description: 'Définir les durées disponibles par type de crédit',
      color: '#e65100',
      bgColor: '#fff3e0',
      countKey: 'durations'
    },
    {
      path: 'ceilings',
      icon: 'euro_symbol',
      title: 'Plafonds',
      description: 'Gérer les montants maximums et niveaux d\'approbation',
      color: '#c62828',
      bgColor: '#fce4ec',
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
      this.loading = false;
    });
  }

  navigateTo(path: string) {
    this.router.navigate(['/admin/parametrage', path]);
  }
}
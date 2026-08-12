import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-portfolio-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './portfolio-summary.component.html',
  styleUrls: ['./portfolio-summary.component.css']
})
export class PortfolioSummaryComponent {
  @Input() data: any = null;
  @Input() isLoading: boolean = false;
  @Input() selectedYear: number = new Date().getFullYear();

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getRiskClass(risk: string): string {
    const classes: { [key: string]: string } = {
      'faible': 'risk-low',
      'moyen': 'risk-medium',
      'élevé': 'risk-high',
      'critique': 'risk-high'
    };
    return classes[risk] || '';
  }
}
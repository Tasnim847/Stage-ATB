// features/financial-analysis/financial-analysis.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-analysis',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="financial-analysis-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1>
            <mat-icon>analytics</mat-icon>
            Analyse Financière
          </h1>
          <p class="subtitle">Choisissez une option pour commencer l'analyse</p>
        </div>
      </div>

      <!-- Cartes de navigation -->
      <div class="navigation-cards">
        <!-- Carte 1: Calcul des ratios -->
        <a 
          mat-raised-button 
          color="primary" 
          routerLink="/financial-analysis/calculate" 
          class="nav-card card-calculate"
        >
          <div class="card-icon">
            <mat-icon>calculate</mat-icon>
          </div>
          <div class="card-content">
            <span class="card-title">Calcul des ratios</span>
            <span class="card-description">
              Calculez automatiquement les ratios financiers du client
            </span>
            <span class="card-action">
              Commencer <mat-icon>arrow_forward</mat-icon>
            </span>
          </div>
        </a>

        <!-- Carte 2: Analyse financière -->
        <a 
          mat-raised-button 
          color="accent" 
          routerLink="/financial-analysis/analyze" 
          class="nav-card card-analyze"
        >
          <div class="card-icon">
            <mat-icon>analytics</mat-icon>
          </div>
          <div class="card-content">
            <span class="card-title">Analyse financière</span>
            <span class="card-description">
              Analysez la situation financière du client
            </span>
            <span class="card-action">
              Commencer <mat-icon>arrow_forward</mat-icon>
            </span>
          </div>
        </a>
      </div>

      <!-- Informations supplémentaires -->
      <div class="info-section">
        <div class="info-card">
          <mat-icon>info</mat-icon>
          <div>
            <h4>À propos de l'analyse financière</h4>
            <p>
              L'analyse financière permet d'évaluer la capacité de remboursement 
              d'un client à travers le calcul de ratios financiers et une analyse 
              approfondie de sa situation financière.
            </p>
          </div>
        </div>
        <div class="info-card">
          <mat-icon>trending_up</mat-icon>
          <div>
            <h4>Ratios calculés</h4>
            <p>
              Taux d'endettement, capacité de remboursement, revenu résiduel, 
              LTI, LTV, ratios de liquidité et solvabilité.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .financial-analysis-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeInUp 0.5s ease;
    }

    /* ===== HEADER ===== */
    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header-content h1 {
      font-size: 32px;
      font-weight: 700;
      color: #2c2c2c;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px;
    }

    .header-content h1 mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #c9614c;
    }

    .header-content .subtitle {
      font-size: 16px;
      color: #757575;
      margin: 0;
    }

    /* ===== NAVIGATION CARDS ===== */
    .navigation-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }

    .nav-card {
      padding: 32px 28px !important;
      border-radius: 16px !important;
      text-decoration: none !important;
      display: flex !important;
      align-items: center !important;
      gap: 24px !important;
      background: #ffffff !important;
      border: 1px solid rgba(0, 0, 0, 0.06) !important;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06) !important;
      transition: all 0.3s ease !important;
      height: auto !important;
      min-height: 140px;
      text-align: left !important;
      position: relative;
      overflow: hidden;
    }

    .nav-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      transition: all 0.3s ease;
    }

    .nav-card.card-calculate::before {
      background: linear-gradient(90deg, #c9614c, #e57373);
    }

    .nav-card.card-analyze::before {
      background: linear-gradient(90deg, #2196f3, #64b5f6);
    }

    .nav-card:hover {
      transform: translateY(-6px) !important;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12) !important;
      border-color: transparent !important;
    }

    .nav-card .card-icon {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      transition: all 0.3s ease;
    }

    .nav-card.card-calculate .card-icon {
      background: rgba(193, 97, 76, 0.12);
      color: #c9614c;
    }

    .nav-card.card-analyze .card-icon {
      background: rgba(33, 150, 243, 0.12);
      color: #2196f3;
    }

    .nav-card:hover .card-icon {
      transform: scale(1.05);
    }

    .nav-card .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-card .card-title {
      font-size: 20px;
      font-weight: 600;
      color: #2c2c2c;
    }

    .nav-card .card-description {
      font-size: 14px;
      color: #757575;
      line-height: 1.5;
    }

    .nav-card .card-action {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 8px;
      transition: all 0.3s ease;
    }

    .nav-card.card-calculate .card-action {
      color: #c9614c;
    }

    .nav-card.card-analyze .card-action {
      color: #2196f3;
    }

    .nav-card .card-action mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      transition: transform 0.3s ease;
    }

    .nav-card:hover .card-action mat-icon {
      transform: translateX(4px);
    }

    /* ===== INFO SECTION ===== */
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px 24px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
    }

    .info-card:hover {
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }

    .info-card mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #c9614c;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .info-card h4 {
      font-size: 14px;
      font-weight: 600;
      color: #2c2c2c;
      margin: 0 0 4px;
    }

    .info-card p {
      font-size: 13px;
      color: #757575;
      margin: 0;
      line-height: 1.5;
    }

    /* ===== ANIMATIONS ===== */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 992px) {
      .navigation-cards {
        grid-template-columns: 1fr;
      }

      .info-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .financial-analysis-container {
        padding: 20px;
      }

      .header-content h1 {
        font-size: 24px;
      }

      .header-content h1 mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .header-content .subtitle {
        font-size: 14px;
      }

      .nav-card {
        flex-direction: column;
        text-align: center !important;
        padding: 24px 20px !important;
        min-height: auto;
      }

      .nav-card .card-icon {
        width: 56px;
        height: 56px;
        font-size: 28px;
      }

      .nav-card .card-title {
        font-size: 18px;
      }

      .nav-card .card-description {
        font-size: 13px;
      }

      .nav-card .card-action {
        justify-content: center;
      }

      .info-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 16px 20px;
      }
    }

    @media (max-width: 480px) {
      .financial-analysis-container {
        padding: 16px;
      }

      .header-content h1 {
        font-size: 20px;
      }

      .nav-card {
        padding: 20px 16px !important;
      }

      .nav-card .card-icon {
        width: 48px;
        height: 48px;
        font-size: 24px;
      }

      .nav-card .card-title {
        font-size: 16px;
      }
    }
  `]
})
export class FinancialAnalysisComponent {}
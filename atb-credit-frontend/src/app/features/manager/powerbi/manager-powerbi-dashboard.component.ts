// manager-powerbi-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-manager-powerbi-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="powerbi-container">
      <h2>📊 Tableau de bord Power BI</h2>
      
      <!-- Si nous avons l'URL, on affiche l'iframe -->
      <iframe 
        *ngIf="powerBiUrl"
        [src]="powerBiUrl"
        width="100%" 
        height="600px"
        frameborder="0"
        allowFullScreen>
      </iframe>
      
      <!-- Message si pas d'URL -->
      <div *ngIf="!powerBiUrl" class="info-message">
        <p>⚠️ Configuration Power BI non disponible</p>
        <p>Contactez l'administrateur</p>
      </div>
    </div>
  `,
  styles: [`
    .powerbi-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
    .powerbi-container h2 {
      margin-bottom: 20px;
      color: #1a2332;
    }
    iframe {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    .info-message {
      text-align: center;
      padding: 50px;
      background: #f5f7fa;
      border-radius: 8px;
    }
    .info-message p {
      margin: 10px 0;
      color: #6b7a8f;
    }
  `]
})
export class ManagerPowerbiDashboardComponent implements OnInit {
  
  powerBiUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // URL de votre rapport Power BI (à remplacer par la vraie URL)
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiVOTRE_RAPPORT_ID';
    
    // Sécuriser l'URL
    this.powerBiUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
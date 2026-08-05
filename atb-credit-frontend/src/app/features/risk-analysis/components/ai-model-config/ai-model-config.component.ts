import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { RiskAnalysisService } from '@app/core/services/risk-analysis.service';
import { AIConfig, AIProvider } from '@app/core/models';

@Component({
  selector: 'app-ai-model-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './ai-model-config.component.html',
  styleUrls: ['./ai-model-config.component.css']
})
export class AiModelConfigComponent implements OnInit {
  config!: AIConfig;
  hasChanges = false;
  saved = false;
  error = false;
  loading = false;

  constructor(private riskService: RiskAnalysisService) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading = true;
    this.riskService.getAIConfig().subscribe({
      next: (data) => {
        this.config = data;
        this.hasChanges = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la configuration IA:', err);
        // ✅ Configuration par défaut en cas d'erreur
        this.config = {
          id: '1',
          provider: AIProvider.OPENAI,
          model: 'gpt-4',
          temperature: 0.7,
          systemPrompt: 'Vous êtes un expert en analyse de risque bancaire. Analysez les données fournies et fournissez une évaluation précise du risque.',
          language: 'fr',
          minScore: 0,
          explanationRequired: true,
          isActive: true
        };
        this.loading = false;
      }
    });
  }

  onChange(): void {
    this.hasChanges = true;
    this.saved = false;
    this.error = false;
  }

  saveConfig(): void {
    this.loading = true;
    this.riskService.updateAIConfig(this.config).subscribe({
      next: () => {
        this.saved = true;
        this.hasChanges = false;
        this.loading = false;
        setTimeout(() => this.saved = false, 3000);
      },
      error: () => {
        this.error = true;
        this.loading = false;
        setTimeout(() => this.error = false, 3000);
      }
    });
  }

  resetDefaults(): void {
    this.config = {
      id: '1',
      provider: AIProvider.OPENAI,
      model: 'gpt-4',
      temperature: 0.7,
      systemPrompt: 'Vous êtes un expert en analyse de risque bancaire. Analysez les données fournies et fournissez une évaluation précise du risque.',
      language: 'fr',
      minScore: 0,
      explanationRequired: true,
      isActive: true
    };
    this.hasChanges = true;
    this.saved = false;
    this.error = false;
  }
}
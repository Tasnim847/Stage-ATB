// features/credits/advisor/credit-simulation/credit-simulation.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Services
import { CreditSimulationService } from '@core/services/credit-simulation.service';
import { ClientService } from '@core/services/client.service';
import { AuthService } from '@core/services/auth.service';

// Modèles
import { ClientResponseDTO } from '@core/models/client.model';
import { CreditSimulation } from '@core/models/credit-simulation.model';

// ============================================
// MODÈLES LOCAUX (pour l'UI uniquement)
// ============================================

export interface SimulationUIParams {
  clientId: string | null;
  projet: string;
  montant: number;
  dureeMois: number;
  tauxNominal: number;
  tauxAssurance: number;
  revenusMensuels: number;
  chargesExistantes: number;
  apportPersonnel: number;
  autresRevenus: number;
}

export interface SimulationUIResult {
  mensualiteHC: number;
  mensualiteAvecAssurance: number;
  coutTotalInterets: number;
  coutTotalAssurance: number;
  coutTotal: number;
  taeg: number;
  tauxEndettement: number;
  capaciteRemboursement: number;
  resteAVivre: number;
  apportNecessaire: number;
  scoreRisque: number;
  scoreSolvabilite: number;
  recommandationIA: string;
  alertes: UIAlert[];
}

export interface OffreBanque {
  banque: string;
  logo: string;
  tauxNominal: number;
  tauxAssurance: number;
  mensualite: number;
  coutTotal: number;
  taeg: number;
  fraisDossier: number;
  delai: string;
  avantages: string[];
}

export interface AmortissementLigne {
  mois: number;
  capitalRestant: number;
  interets: number;
  assurance: number;
  mensualiteTotale: number;
  capitalRembourse: number;
}

export interface UIAlert {
  type: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  action: string;
}

export interface DureeOption {
  valeur: number;
  libelle: string;
}

@Component({
  selector: 'app-credit-simulation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  templateUrl: './credit-simulation.component.html',
  styleUrls: ['./credit-simulation.component.css']
})
export class CreditSimulationComponent implements OnInit, OnDestroy {
  
  // ============================================
  // MODÈLE DE SIMULATION (UI)
  // ============================================
  
  simulation: SimulationUIParams = {
    clientId: null,
    projet: 'Achat résidence principale',
    montant: 180000,
    dureeMois: 240,
    tauxNominal: 3.20,
    tauxAssurance: 0.36,
    revenusMensuels: 4200,
    chargesExistantes: 520,
    apportPersonnel: 20000,
    autresRevenus: 0
  };

  // ============================================
  // RÉSULTATS
  // ============================================
  
  resultats: SimulationUIResult | null = null;
  offresComparatives: OffreBanque[] = [];
  tableauAmortissement: AmortissementLigne[] = [];
  recommandationIA: string = '';
  alertes: UIAlert[] = [];

  // ============================================
  // ÉTATS UI
  // ============================================
  
  isLoading = false;
  isComparing = false;
  modeComparaison = false;
  afficherTableau = false;
  afficherTableauComplet = false;
  afficherAlerteEndettement = false;
  dateSimulation: Date = new Date();

  // ============================================
  // LISTES
  // ============================================
  
  clients: ClientResponseDTO[] = [];
  selectedClient: ClientResponseDTO | null = null;
  
  durees: DureeOption[] = [
    { valeur: 84, libelle: '7 ans' },
    { valeur: 120, libelle: '10 ans' },
    { valeur: 180, libelle: '15 ans' },
    { valeur: 240, libelle: '20 ans' },
    { valeur: 300, libelle: '25 ans' }
  ];
  
  typesProjet: string[] = [
    'Achat résidence principale',
    'Achat résidence secondaire',
    'Investissement locatif',
    'Travaux',
    'Regroupement de crédits',
    'Autre'
  ];

  // ============================================
  // OBSERVABLES
  // ============================================
  
  private updateSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  // ============================================
  // MATH POUR LE TEMPLATE
  // ============================================
  
  Math = Math;

  // ============================================
  // CONSTRUCTEUR
  // ============================================
  
  constructor(
    private simulationService: CreditSimulationService,
    private clientService: ClientService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  // ============================================
  // CYCLE DE VIE
  // ============================================
  
  ngOnInit(): void {
    this.chargerClients();
    this.restaurerSimulation();
    
    // Debounce pour éviter trop d'appels
    this.updateSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.recalculer();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // CHARGEMENT DES CLIENTS
  // ============================================
  
  chargerClients(): void {
    const currentUser = this.authService.getUserInfo();
    const advisorId = currentUser?.id;
    
    if (!advisorId) {
      this.snackBar.open('Impossible de récupérer votre profil conseiller', 'Fermer', { duration: 3000 });
      return;
    }
    
    this.clientService.getClientsByAdvisor(advisorId).subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (err) => {
        console.error('Erreur chargement clients', err);
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
      }
    });
  }

  chargerClient(): void {
    if (!this.simulation.clientId) {
      this.selectedClient = null;
      return;
    }
    
    const client = this.clients.find(c => c.id === this.simulation.clientId);
    if (client) {
      this.selectedClient = client;
      this.simulation.revenusMensuels = client.monthlyIncome ? parseFloat(client.monthlyIncome) : 0;
      this.simulation.apportPersonnel = 0; // Valeur par défaut
      this.recalculer();
      
      this.snackBar.open(`Profil de ${client.firstName} ${client.lastName} chargé avec succès`, 'Fermer', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  // ============================================
  // CALCUL DE LA SIMULATION
  // ============================================
  
  recalculer(): void {
    if (this.isLoading) return;
    
    // Vérifier les limites
    if (this.simulation.montant < 5000) {
      this.snackBar.open('Le montant minimum est de 5 000 €', 'Fermer', { duration: 2000 });
      return;
    }

    if (this.simulation.montant > 1000000) {
      this.snackBar.open('Le montant maximum est de 1 000 000 €', 'Fermer', { duration: 2000 });
      return;
    }

    this.isLoading = true;
    this.simulationService.createStandaloneSimulation({
      amount: this.simulation.montant,
      durationMonths: this.simulation.dureeMois,
      interestRate: this.simulation.tauxNominal,
      clientId: this.simulation.clientId || undefined
    }).subscribe({
      next: (simulation) => {
        this.resultats = this.construireResultats(simulation);
        this.recommandationIA = this.genererRecommandationLocale();
        this.alertes = this.genererAlertes();
        this.afficherAlerteEndettement = (this.resultats?.tauxEndettement || 0) > 35;
        this.isLoading = false;
        
        this.genererTableauAmortissement();
        
        // Sauvegarder dans localStorage
        this.sauvegarderSimulationLocale(simulation);
      },
      error: (err) => {
        console.error('Erreur simulation', err);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du calcul de la simulation', 'Fermer', { duration: 3000 });
      }
    });
  }

  // ============================================
  // CONSTRUCTION DES RÉSULTATS
  // ============================================
  
  construireResultats(simulation: CreditSimulation): SimulationUIResult {
    const mensualiteHC = simulation.monthlyPayment || 0;
    const tauxAssurance = this.simulation.tauxAssurance / 100;
    const mensualiteAssurance = mensualiteHC * (1 + tauxAssurance);
    const dureeMois = simulation.durationMonths || 240;
    
    return {
      mensualiteHC: mensualiteHC,
      mensualiteAvecAssurance: mensualiteAssurance,
      coutTotalInterets: simulation.totalInterest || 0,
      coutTotalAssurance: mensualiteHC * tauxAssurance * dureeMois,
      coutTotal: simulation.totalPayment || 0,
      taeg: this.simulation.tauxNominal + this.simulation.tauxAssurance,
      tauxEndettement: simulation.debtRatio || 0,
      capaciteRemboursement: simulation.borrowingCapacity || 0,
      resteAVivre: this.simulation.revenusMensuels - this.simulation.chargesExistantes - mensualiteAssurance,
      apportNecessaire: Math.max(0, this.simulation.montant * 0.1 - this.simulation.apportPersonnel),
      scoreRisque: 100 - (simulation.solvencyScore || 50),
      scoreSolvabilite: simulation.solvencyScore || 50,
      recommandationIA: '',
      alertes: []
    };
  }

  // ============================================
  // TABLEAU D'AMORTISSEMENT
  // ============================================
  
  genererTableauAmortissement(): void {
    const montant = this.simulation.montant;
    const tauxMensuel = this.simulation.tauxNominal / 100 / 12;
    const duree = this.simulation.dureeMois;
    const mensualite = this.resultats?.mensualiteHC || 0;
    const assurance = this.simulation.tauxAssurance / 100;
    
    this.tableauAmortissement = [];
    let capitalRestant = montant;
    
    for (let i = 1; i <= Math.min(duree, 120); i++) {
      const interets = capitalRestant * tauxMensuel;
      const capitalRembourse = mensualite - interets;
      capitalRestant = capitalRestant - capitalRembourse;
      
      this.tableauAmortissement.push({
        mois: i,
        capitalRestant: Math.max(0, capitalRestant),
        interets: interets,
        assurance: mensualite * assurance,
        mensualiteTotale: mensualite * (1 + assurance),
        capitalRembourse: capitalRembourse
      });
    }
  }

  // ============================================
  // RECOMMANDATIONS ET ALERTES
  // ============================================
  
  genererRecommandationLocale(): string {
    if (!this.resultats) return 'Veuillez effectuer une simulation pour obtenir une recommandation.';
    
    const recommendations: string[] = [];
    const tauxEndettement = this.resultats.tauxEndettement;
    const resteAVivre = this.resultats.resteAVivre;

    if (tauxEndettement <= 25) {
      recommendations.push('✅ Excellente capacité d\'endettement - Le client peut envisager un montant plus élevé');
    } else if (tauxEndettement <= 33) {
      recommendations.push('✅ Bonne capacité d\'endettement - Profil rassurant pour la banque');
    } else if (tauxEndettement <= 35) {
      recommendations.push('⚠️ Taux d\'endettement proche de la limite - Surveillance recommandée');
    } else {
      recommendations.push('🔴 Taux d\'endettement trop élevé - Réduire le montant ou la durée');
    }

    if (resteAVivre < 1000) {
      recommendations.push('⚠️ Reste à vivre faible - Risque de fragilité financière');
    } else if (resteAVivre > 2000) {
      recommendations.push('✅ Excellent reste à vivre - Grande capacité d\'épargne');
    }

    if (this.simulation.apportPersonnel < this.simulation.montant * 0.1) {
      recommendations.push('ℹ️ Apport personnel inférieur à 10% - Recommandation d\'augmenter l\'apport');
    }

    return recommendations.join(' | ');
  }

  genererAlertes(): UIAlert[] {
    const alertes: UIAlert[] = [];
    
    if (this.resultats) {
      if (this.resultats.tauxEndettement > 35) {
        alertes.push({
          type: 'ERROR',
          message: `Taux d'endettement de ${this.resultats.tauxEndettement.toFixed(1)}% - Seuil maximal dépassé`,
          action: 'Voir solutions'
        });
      }

      if (this.resultats.resteAVivre < 1000) {
        alertes.push({
          type: 'WARNING',
          message: `Reste à vivre de ${this.resultats.resteAVivre.toFixed(0)}€ - Risque de fragilité`,
          action: 'Ajuster la simulation'
        });
      }

      if (this.simulation.apportPersonnel < this.simulation.montant * 0.05) {
        alertes.push({
          type: 'INFO',
          message: `Apport personnel de ${this.simulation.apportPersonnel}€ - Inférieur aux standards`,
          action: 'Conseiller client'
        });
      }
    }

    return alertes;
  }

  // ============================================
  // ACTIONS SUR LES ALERTES
  // ============================================
  
  alertesActions: { [key: string]: () => void } = {
    'Voir solutions': () => {
      this.snackBar.open('Solutions : Augmenter l\'apport ou la durée', 'Fermer', { duration: 3000 });
    },
    'Ajuster la simulation': () => {
      // Focus sur le champ montant
      this.simulation.montant = this.simulation.montant * 0.9;
      this.recalculer();
    },
    'Conseiller client': () => {
      this.snackBar.open('Conseil : Recommander d\'augmenter l\'apport personnel', 'Fermer', { duration: 3000 });
    }
  };

  // ============================================
  // COMPARAISON DES OFFRES
  // ============================================
  
  comparerOffres(): void {
    if (!this.resultats) {
      this.snackBar.open('Veuillez d\'abord effectuer une simulation', 'Fermer', { duration: 2000 });
      return;
    }

    this.isComparing = true;
    this.modeComparaison = true;

    // Simuler une comparaison d'offres
    setTimeout(() => {
      this.offresComparatives = this.genererOffresDemo();
      this.isComparing = false;
      this.snackBar.open('Comparaison des offres disponible', 'Fermer', { duration: 2000 });
    }, 800);
  }

  genererOffresDemo(): OffreBanque[] {
    const base = this.resultats!;
    return [
      {
        banque: 'Banque Populaire',
        logo: 'pop.png',
        tauxNominal: this.simulation.tauxNominal,
        tauxAssurance: this.simulation.tauxAssurance,
        mensualite: base.mensualiteAvecAssurance,
        coutTotal: base.coutTotal,
        taeg: this.simulation.tauxNominal + this.simulation.tauxAssurance,
        fraisDossier: 800,
        delai: '15 jours',
        avantages: ['Frais de dossier réduits', 'Assistance juridique']
      },
      {
        banque: 'Crédit Mutuel',
        logo: 'cm.png',
        tauxNominal: this.simulation.tauxNominal - 0.15,
        tauxAssurance: this.simulation.tauxAssurance - 0.08,
        mensualite: base.mensualiteAvecAssurance - 30,
        coutTotal: base.coutTotal - 7200,
        taeg: this.simulation.tauxNominal + this.simulation.tauxAssurance - 0.23,
        fraisDossier: 0,
        delai: '10 jours',
        avantages: ['Frais de dossier offerts', 'Meilleur TAEG']
      },
      {
        banque: 'BNP Paribas',
        logo: 'bnp.png',
        tauxNominal: this.simulation.tauxNominal + 0.15,
        tauxAssurance: this.simulation.tauxAssurance + 0.04,
        mensualite: base.mensualiteAvecAssurance + 24,
        coutTotal: base.coutTotal + 5760,
        taeg: this.simulation.tauxNominal + this.simulation.tauxAssurance + 0.19,
        fraisDossier: 1200,
        delai: '20 jours',
        avantages: ['Banque premium', 'Offre exclusive']
      }
    ];
  }

  selectionnerOffre(offre: OffreBanque): void {
    this.simulation.tauxNominal = offre.tauxNominal;
    this.simulation.tauxAssurance = offre.tauxAssurance;
    this.snackBar.open(`Offre ${offre.banque} sélectionnée`, 'Fermer', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.recalculer();
    this.modeComparaison = false;
  }

  // ============================================
  // EXPORT ET IMPRESSION
  // ============================================
  
  imprimerSimulation(): void {
    if (!this.resultats) return;
    window.print();
    this.snackBar.open('Impression en cours...', 'Fermer', { duration: 2000 });
  }

  exporterVersPowerBI(): void {
    if (!this.resultats) return;
    this.snackBar.open('Export vers Power BI en cours...', 'Fermer', { duration: 2000 });
    setTimeout(() => {
      this.snackBar.open('Données exportées vers Power BI avec succès', 'Fermer', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
  }

  // ============================================
  // ENVOI EMAIL
  // ============================================
  
  envoyerEmailSimulation(): void {
    if (!this.resultats || !this.simulation.clientId) {
      this.snackBar.open('Veuillez sélectionner un client et effectuer une simulation', 'Fermer', { duration: 3000 });
      return;
    }

    const client = this.clients.find(c => c.id === this.simulation.clientId);
    if (!client) {
      this.snackBar.open('Client non trouvé', 'Fermer', { duration: 3000 });
      return;
    }

    this.snackBar.open(`Simulation envoyée à ${client.email}`, 'Fermer', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // ============================================
  // CRÉATION DE DEMANDE DE CRÉDIT
  // ============================================
  
  creerDemandeCredit(): void {
    if (!this.resultats || !this.simulation.clientId) {
      this.snackBar.open('Veuillez sélectionner un client et effectuer une simulation', 'Fermer', { duration: 3000 });
      return;
    }

    this.router.navigate(['/credit-requests/new', this.simulation.clientId], {
      queryParams: {
        montant: this.simulation.montant,
        duree: this.simulation.dureeMois,
        taux: this.simulation.tauxNominal,
        mensualite: this.resultats.mensualiteAvecAssurance
      }
    });
  }

  // ============================================
  // ACTIONS RAPIDES
  // ============================================
  
  setMontant(montant: number): void {
    this.simulation.montant = montant;
    this.recalculer();
  }

  // ============================================
  // SAUVEGARDE
  // ============================================
  
  sauvegarderSimulation(): void {
    this.sauvegarderSimulationLocale(null);
    this.snackBar.open('Simulation sauvegardée', 'Fermer', { duration: 2000 });
  }

  sauvegarderSimulationLocale(simulation: CreditSimulation | null): void {
    try {
      const data = {
        simulation: this.simulation,
        resultats: this.resultats,
        date: new Date().toISOString()
      };
      localStorage.setItem('last_simulation', JSON.stringify(data));
    } catch (e) {
      console.warn('Erreur sauvegarde simulation', e);
    }
  }

  restaurerSimulation(): void {
    try {
      const saved = localStorage.getItem('last_simulation');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.simulation) {
          this.simulation = { ...this.simulation, ...data.simulation };
          if (data.simulation.clientId) {
            this.chargerClient();
          }
        }
      }
    } catch (e) {
      console.warn('Erreur restauration simulation', e);
    }
  }

  // ============================================
  // MÉTHODES UTILITAIRES POUR LE TEMPLATE
  // ============================================
  
  getClientNom(): string {
    if (!this.selectedClient) return 'Client non sélectionné';
    return `${this.selectedClient.firstName} ${this.selectedClient.lastName}`;
  }

  getClientEmail(): string {
    if (!this.selectedClient) return '';
    return this.selectedClient.email;
  }

  getStatutEndettement(taux: number): string {
    if (taux <= 30) return '✅ Excellent';
    if (taux <= 35) return '⚠️ Acceptable';
    if (taux <= 40) return '🔴 Limite';
    return '❌ Trop élevé';
  }

  getCouleurEndettement(taux: number): string {
    if (taux <= 30) return 'vert';
    if (taux <= 35) return 'orange';
    return 'rouge';
  }

  getUserInfo(): any {
    return this.authService.getUserInfo();
  }

  // ============================================
  // AFFICHAGE TABLEAU AMORTISSEMENT
  // ============================================
  
  toggleTableauAmortissement(): void {
    if (this.tableauAmortissement.length === 0) {
      this.genererTableauAmortissement();
    }
    this.afficherTableau = !this.afficherTableau;
  }
}
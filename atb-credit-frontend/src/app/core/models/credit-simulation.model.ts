// core/models/credit-simulation.model.ts

/**
 * Modèle de simulation de crédit
 */
export interface CreditSimulation {
  id: string;
  creditRequestId: string;
  userId: string;
  clientId: string;
  amount: number;
  durationMonths: number;
  interestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  borrowingCapacity: number;
  debtRatio: number;          // ✅ AJOUTÉ
  solvencyScore: number;      // ✅ AJOUTÉ
  simulationResults: string;
  comparisonResults: string;
  simulationName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO pour la création d'une simulation
 */
export interface CreateSimulationDTO {
  amount: number;
  durationMonths: number;
  interestRate: number;
  clientId?: string;
}

/**
 * DTO pour la mise à jour d'une simulation
 */
export interface UpdateSimulationDTO {
  amount: number;
  durationMonths: number;
  interestRate: number;
}

/**
 * DTO pour la mise à jour partielle
 */
export interface PartialUpdateSimulationDTO {
  amount?: number;
  durationMonths?: number;
  interestRate?: number;
  simulationName?: string;
}

/**
 * Résumé de la simulation
 */
export interface SimulationSummary {
  revenusMensuels: number;
  chargesMensuelles: number;
  tauxEndettement: number;
  resteAVivre: number;
  mensualite: number;
  nouveauTauxEndettement: number;
  scoreSolvabilite: number;
  risqueIA: number;
  decision: 'approuve' | 'approuve_conditionnel' | 'refuse';
  recommandation: string;
  motifs: string[];
}

/**
 * Score de solvabilité
 */
export interface SolvabiliteScore {
  score: number;
  niveau: 'Excellent' | 'Bon' | 'Moyen' | 'Faible' | 'Très risqué';
  details: {
    revenusStables: number;
    cdi: number;
    anciennete: number;
    tauxEndettement: number;
    incidentBancaire: number;
    historiqueBancaire: number;
  };
}

/**
 * Statistiques des simulations
 */
export interface SimulationStatistics {
  total: number;
  totalAmount: number;
  averageMonthlyPayment: number;
  averageInterestRate: number;
  averageDuration: number;
  minAmount: number;
  maxAmount: number;
}

/**
 * Filtres pour les simulations
 */
export interface SimulationFilters {
  minAmount?: number;
  maxAmount?: number;
  minDuration?: number;
  maxDuration?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Résultat de comparaison
 */
export interface ComparisonResult {
  simulations: ComparisonItem[];
  bestOption: string;
  savings?: number;
}

export interface ComparisonItem {
  id: string;
  name: string;
  amount: number;
  durationMonths: number;
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  isBest: boolean;
}
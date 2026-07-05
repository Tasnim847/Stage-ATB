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
  simulationResults: string;
  comparisonResults: string;
  simulationName: string;
  createdAt: string;
  updatedAt: string;
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
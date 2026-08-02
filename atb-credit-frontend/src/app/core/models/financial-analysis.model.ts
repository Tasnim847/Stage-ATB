// models/financial-analysis.model.ts
export interface RatioCalculationRequest {
  clientId: string;
  creditRequestId?: string;
  monthlyNetIncome: number;
  otherMonthlyIncome?: number;
  monthlyCharges: number;
  existingCreditPayments: number;
  creditAmount: number;
  durationMonths: number;
  annualInterestRate: number;
  collateralValue?: number;
  // Données professionnelles
  totalAssets?: number;
  totalLiabilities?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  ebit?: number;
  financialCharges?: number;
  availableCashFlow?: number;
  annualDebtService?: number;
}

// models/financial-analysis.model.ts
export interface RatioCalculationResponse {
  // ✅ Ajouter ces propriétés manquantes
  totalMonthlyIncome: number;
  clientId: string;
  
  // Ratios calculés
  debtRatio: number;
  debtRatioStatus: 'FAIBLE' | 'ACCEPTABLE' | 'ELEVE' | 'CRITIQUE';
  repaymentCapacity: number;
  repaymentCapacityStatus: 'TRES_BONNE' | 'BONNE' | 'MOYENNE' | 'FAIBLE';
  residualIncome: number;
  residualIncomeStatus: 'SUFFISANT' | 'ACCEPTABLE' | 'INSUFFISANT';
  monthlyPaymentRatio: number;
  monthlyPaymentRatioStatus: 'BON' | 'MOYEN' | 'ELEVE';
  lti: number;
  ltiStatus: 'BON' | 'ACCEPTABLE' | 'ELEVE';
  ltv: number;
  ltvStatus: 'FAIBLE_RISQUE' | 'MODERE' | 'ELEVE' | 'TRES_ELEVE';
  chargesToIncomeRatio: number;
  coverageRatio: number;
  incomeToPaymentRatio: number;
  // Ratios professionnels
  currentRatio?: number;
  currentRatioStatus?: 'BONNE' | 'ACCEPTABLE' | 'RISQUE';
  solvencyRatio?: number;
  solvencyRatioStatus?: 'BONNE' | 'ACCEPTABLE' | 'FAIBLE';
  dscr?: number;
  dscrStatus?: 'TRES_BON' | 'ACCEPTABLE' | 'FRAGILE' | 'INSUFFISANT';
  financialAutonomyRatio?: number;
  debtToAssetRatio?: number;
  interestCoverageRatio?: number;
  // Informations crédit
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
}

export interface FinancialAnalysisRequest {
  clientId: string;
  creditRequestId?: string;
  analystId?: string;
  // Données de base
  monthlyNetIncome: number;
  otherMonthlyIncome?: number;
  monthlyCharges: number;
  existingCreditPayments: number;
  creditAmount: number;
  durationMonths: number;
  annualInterestRate: number;
  collateralValue?: number;
  // Données professionnelles
  totalAssets?: number;
  totalLiabilities?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  ebit?: number;
  financialCharges?: number;
  availableCashFlow?: number;
  annualDebtService?: number;
}

export interface FinancialAnalysisResponse {
  id: string;
  creditRequestId: string;
  clientId: string;
  clientName: string;
  analystName?: string;
  // Données de base
  totalMonthlyIncome: number;
  monthlyCharges: number;
  existingCreditPayments: number;
  newMonthlyPayment: number;
  // Tous les ratios (hérités de RatioCalculationResponse)
  debtRatio: number;
  debtRatioStatus: string;
  repaymentCapacity: number;
  repaymentCapacityStatus: string;
  residualIncome: number;
  residualIncomeStatus: string;
  monthlyPaymentRatio: number;
  monthlyPaymentRatioStatus: string;
  chargesToIncomeRatio: number;
  lti: number;
  ltiStatus: string;
  ltv: number;
  ltvStatus: string;
  coverageRatio: number;
  incomeToPaymentRatio: number;
  currentRatio?: number;
  currentRatioStatus?: string;
  solvencyRatio?: number;
  solvencyRatioStatus?: string;
  dscr?: number;
  dscrStatus?: string;
  // Analyse crédit
  totalCost: number;
  totalInterest: number;
  monthlyPayment: number;
  // Score et décision
  overallScore: number;
  riskLevel: string;
  recommendation: string;
  financialHealthScore: string;
  // Métadonnées
  status: string;
  analyzedBy: string;
  approvedByAnalyst: boolean;
  createdAt: string;
  updatedAt: string;
}
// models/financial-analysis.model.ts
export interface FinancialAnalysisRequest {
  creditRequestId?: string;
  clientId: string;
  analystId?: string;
  
  // Données de base
  monthlyNetIncome: number;
  otherMonthlyIncome?: number;
  monthlyCharges: number;
  existingCreditPayments: number;
  
  // Données du crédit
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
  totalFinancialDebts?: number;
  shareholdersEquity?: number;
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
  
  // Ratios particuliers
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
  
  // Ratios professionnels
  currentRatio?: number;
  currentRatioStatus?: string;
  solvencyRatio?: number;
  solvencyRatioStatus?: string;
  financialAutonomyRatio?: number;
  financialDebtRatio?: number;
  debtToAssetRatio?: number;
  interestCoverageRatio?: number;
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
/**
 * Statut d'une demande de crédit
 */
export enum CreditStatus {
  DRAFT = 'DRAFT',
  PENDING_ANALYSIS = 'PENDING_ANALYSIS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * Requête de création/modification de demande de crédit
 */
export interface CreditRequestDTO {
  clientId: string;
  userId: string; // ✅ AJOUTER CETTE LIGNE
  amount: number;
  currency: string;
  durationMonths: number;
  monthlyPayment: number;
  interestRate: number;
  loanPurpose?: string;
  collateralType?: string;
  collateralValue?: number;
  guarantorName?: string;
  guarantorPhone?: string;
  expectedDisbursementDate?: string;
}

/**
 * Réponse d'une demande de crédit
 */
export interface CreditResponseDTO {
  id: string;
  requestNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  durationMonths: number;
  monthlyPayment: number;
  interestRate: number;
  loanPurpose: string;
  status: CreditStatus;
  rejectionReason: string;
  approvalDate: string;
  expectedDisbursementDate: string;
  createdAt: string;
  analystName: string;
  riskLevel: string;
  riskScore: number;
  decisionRecommendation: string;
  financialHealthScore: string;
  debtRatio: number;
}
// core/models/credit-request.model.ts
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

export interface CreditRequestDTO {
  clientId: string;
  userId: string;
  creditTypeId: string;
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
  submitImmediately?: boolean;
  // ✅ NOUVEAUX CHAMPS
  managerValidationRequired?: boolean;
  managerComments?: string;
  validationReason?: string;
}

export interface CreditResponseDTO {
  id: string;
  requestNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  creditTypeId: string;
  creditTypeName: string;
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
  // ✅ NOUVEAUX CHAMPS
  managerValidationRequired: boolean;
  managerValidationDate: string;
  managerComments: string;
  validationReason: string;
  managerName: string;
  managerDecision: string;
  managerDecisionDate: string;
}

// ✅ MODÈLES POUR LA VALIDATION MANAGER
export interface ManagerValidationRequest {
  creditRequestId: string;
  decision: 'APPROVED' | 'REJECTED' | 'RETURN_TO_ANALYST';
  comments?: string;
  maxAmountLimit: number;
  overrideLimit: boolean;
  overrideReason?: string;
}

export interface DecisionReturnRequest {
  creditRequestId: string;
  reason: string;
  additionalInstructions?: string;
  requiredAction: 'CORRECT_DOCUMENTS' | 'REANALYZE_FINANCIALS' | 'ADD_INFORMATION';
}

export interface ValidationSummaryDTO {
  id: string;
  requestNumber: string;
  clientName: string;
  amount: number;
  creditType: string;
  riskLevel: string;
  analystName: string;
  analystDecision: string;
  analystDecisionDate: string;
  requiresManagerValidation: boolean;
  managerName: string;
  managerDecision: string;
  managerDecisionDate: string;
  daysPending: number;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  riskScore?: number;
}
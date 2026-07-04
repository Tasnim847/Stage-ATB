import { RiskLevel } from "./risk.model";

/**
 * Requête d'alerte fraude
 */
export interface FraudAlertRequestDTO {
  clientId: string;
  creditRequestId?: string;
  alertType: string;
  description: string;
  severity: RiskLevel;
  evidence?: string;
  aiAnalysis?: string;
  actionNotes?: string;
}

/**
 * Réponse d'alerte fraude
 */
export interface FraudAlertResponseDTO {
  id: string;
  clientId: string;
  clientName: string;
  creditRequestId: string;
  alertType: string;
  description: string;
  severity: RiskLevel;
  evidence: string;
  aiAnalysis: string;
  reviewed: boolean;
  confirmed: boolean;
  actionTaken: boolean;
  reviewedBy: string;
  createdAt: string;
}
/**
 * Niveau de risque
 */
export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Requête d'analyse de risque
 */
export interface RiskAnalysisRequestDTO {
  creditRequestId: string;
  creditRisk?: RiskLevel;
  financialRisk?: RiskLevel;
  operationalRisk?: RiskLevel;
  overallRisk?: RiskLevel;
  riskScore?: number;
  riskFactors?: string;
  riskDescription?: string;
  anomalyDetected?: boolean;
  anomalyDetails?: string;
  mitigationMeasures?: string;
  riskReport?: string;
}

/**
 * Réponse d'analyse de risque
 */
export interface RiskAnalysisResponseDTO {
  id: string;
  creditRequestId: string;
  analystName: string;
  creditRisk: RiskLevel;
  financialRisk: RiskLevel;
  operationalRisk: RiskLevel;
  overallRisk: RiskLevel;
  riskScore: number;
  riskFactors: string;
  riskDescription: string;
  anomalyDetected: boolean;
  anomalyDetails: string;
  mitigationMeasures: string;
  riskReport: string;
  createdAt: string;
}
/**
 * Requête de vérification KYC
 */
export interface KYCVerificationRequestDTO {
  clientId: string;
  documentId?: string;
  verificationType?: string;
  identityVerified?: boolean;
  addressVerified?: boolean;
  documentAuthentic?: boolean;
  verificationNotes?: string;
}

/**
 * Réponse de vérification KYC
 */
export interface KYCVerificationResponseDTO {
  id: string;
  clientId: string;
  clientName: string;
  documentId: string;
  documentName: string;
  verificationType: string;
  identityVerified: boolean;
  addressVerified: boolean;
  documentAuthentic: boolean;
  fraudDetected: boolean;
  fraudDetails: string;
  verificationStatus: string;
  verificationNotes: string;
  aiAnalysis: string;
  verifiedBy: string;
  verifiedByName: string;
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
}
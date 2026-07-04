/**
 * Type de document
 */
export enum DocumentType {
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  BANK_STATEMENT = 'BANK_STATEMENT',
  FINANCIAL_STATEMENT = 'FINANCIAL_STATEMENT',
  INCOME_PROOF = 'INCOME_PROOF',
  TAX_RETURN = 'TAX_RETURN',
  PROPERTY_DOCUMENT = 'PROPERTY_DOCUMENT',
  CONTRACT = 'CONTRACT',
  PAYSLIP = 'PAYSLIP',
  BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION',
  OTHER = 'OTHER'
}

/**
 * Requête de téléchargement de document
 */
export interface DocumentUploadRequestDTO {
  clientId: string;
  creditRequestId?: string;
  documentType: DocumentType;
  description?: string;
  file: File;
}

/**
 * Réponse de document
 */
export interface DocumentResponseDTO {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  description: string;
  clientId: string;
  clientName: string;
  creditRequestId: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  verified: boolean;
  complete: boolean;
  ocrResult: string;
  extractedData: string;
}
// core/models/document.model.ts
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
  creditRequestId: string | null;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  verified: boolean;
  complete: boolean;
  ocrResult: string;
  extractedData: string;
  verificationNotes?: string;
}

export interface DocumentUploadRequestDTO {
  clientId: string;
  creditRequestId?: string;
  documentType: DocumentType;
  description?: string;
  file: File;
}

export interface DocumentVerificationRequestDTO {
  verified: boolean;
  verificationNotes?: string;
}

export interface DocumentTypeConfig {
  label: string;
  icon: string;
  color: string;
  mandatory: boolean;
}

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, DocumentTypeConfig> = {
  [DocumentType.IDENTITY_DOCUMENT]: {
    label: 'Pièce d\'identité',
    icon: 'fa-id-card',
    color: 'primary',
    mandatory: true
  },
  [DocumentType.BANK_STATEMENT]: {
    label: 'Relevé bancaire',
    icon: 'fa-university',
    color: 'success',
    mandatory: true
  },
  [DocumentType.FINANCIAL_STATEMENT]: {
    label: 'États financiers',
    icon: 'fa-chart-bar',
    color: 'info',
    mandatory: false
  },
  [DocumentType.INCOME_PROOF]: {
    label: 'Justificatif de revenus',
    icon: 'fa-money-bill-wave',
    color: 'warning',
    mandatory: true
  },
  [DocumentType.TAX_RETURN]: {
    label: 'Déclaration d\'impôts',
    icon: 'fa-file-invoice',
    color: 'info',
    mandatory: false
  },
  [DocumentType.PROPERTY_DOCUMENT]: {
    label: 'Titre de propriété',
    icon: 'fa-home',
    color: 'primary',
    mandatory: false
  },
  [DocumentType.CONTRACT]: {
    label: 'Contrat',
    icon: 'fa-file-signature',
    color: 'secondary',
    mandatory: false
  },
  [DocumentType.PAYSLIP]: {
    label: 'Bulletin de salaire',
    icon: 'fa-file-invoice-dollar',
    color: 'warning',
    mandatory: false
  },
  [DocumentType.BUSINESS_REGISTRATION]: {
    label: 'Registre de commerce',
    icon: 'fa-building',
    color: 'info',
    mandatory: false
  },
  [DocumentType.OTHER]: {
    label: 'Autre document',
    icon: 'fa-file',
    color: 'secondary',
    mandatory: false
  }
};
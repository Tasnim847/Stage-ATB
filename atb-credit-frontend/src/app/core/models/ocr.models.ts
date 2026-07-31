// src/app/core/models/ocr.models.ts

export interface OcrConfig {
  id?: number;
  provider: OcrProvider;
  apiKey: string;
  endpoint: string;
  languages: string[];
  minConfidence: number;
  enabled: boolean;
  maxRetries: number;
  timeout: number;
  autoSync: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type OcrProvider = 
  | 'TESSERACT' 
  | 'AZURE' 
  | 'GOOGLE_VISION' 
  | 'AMAZON_TEXTTRACT' 
  | 'ABBYY';

export interface OcrDocumentType {
  id?: number;
  name: string;
  code: string;
  description?: string;
  ocrEnabled: boolean;
  required: boolean;
  maxSize: number;
  allowedFormats: string[];
  fields?: OcrField[];
  validationRules?: ValidationRule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OcrField {
  id?: number;
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'iban' | 'amount' | 'boolean';
  required: boolean;
  regex?: string;
  description?: string;
}

export interface ValidationRule {
  id?: number;
  name: string;
  condition: ValidationCondition;
  value: string;
  value2?: string;
  action: ValidationAction;
  message: string;
  active: boolean;
}

export type ValidationCondition = 
  | 'CONTAINS' 
  | 'NOT_CONTAINS' 
  | 'EQUALS' 
  | 'NOT_EQUALS' 
  | 'GREATER_THAN' 
  | 'LESS_THAN' 
  | 'BETWEEN' 
  | 'REGEX' 
  | 'DATE_EXPIRED' 
  | 'DATE_FRESHER_THAN' 
  | 'AGE_OLDER_THAN';

export type ValidationAction = 
  | 'ALERT' 
  | 'WARNING' 
  | 'ERROR' 
  | 'REJECT' 
  | 'REQUEST_NEW';

export interface OcrLog {
  id?: number;
  date: Date;
  user?: string;
  documentType: string;
  documentId?: number;
  result: 'SUCCESS' | 'ERROR' | 'WARNING' | 'PENDING';
  confidence?: number;
  message?: string;
  extractedData?: any;
  duration?: number;
  createdAt?: string;
}

export interface OcrConnectionStatus {
  success: boolean;
  message: string;
  provider?: string;
  version?: string;
  timestamp?: Date;
}

export interface OcrExtractionResult {
  success: boolean;
  documentType: string;
  extractedFields: Record<string, any>;
  confidence: number;
  warnings: string[];
  errors: string[];
  rawText?: string;
  processingTimeMs?: number;
}

export interface OcrStatistics {
  totalDocuments: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  averageConfidence: number;
  averageProcessingTime: number;
}
// ============================================
// 1. MODÈLES DE RISQUE
// ============================================
export interface RiskModel {
  id: string;
  type: RiskModelType;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  configuration: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum RiskModelType {
  CREDIT = 'RISQUE_DE_CREDIT',
  FINANCIAL = 'RISQUE_FINANCIER',
  KYC = 'RISQUE_KYC',
  AML = 'RISQUE_AML',
  FRAUD = 'FRAUDE'
}

export const RiskModelTypeLabels: Record<RiskModelType, string> = {
  [RiskModelType.CREDIT]: 'Risque de crédit',
  [RiskModelType.FINANCIAL]: 'Risque financier',
  [RiskModelType.KYC]: 'Risque KYC',
  [RiskModelType.AML]: 'Risque AML',
  [RiskModelType.FRAUD]: 'Fraude'
};

export const RiskModelTypeIcons: Record<RiskModelType, string> = {
  [RiskModelType.CREDIT]: 'account_balance',
  [RiskModelType.FINANCIAL]: 'analytics',
  [RiskModelType.KYC]: 'verified_user',
  [RiskModelType.AML]: 'gavel',
  [RiskModelType.FRAUD]: 'security'
};

// ============================================
// 2. SEUILS DE RISQUE
// ============================================
export interface RiskThreshold {
  id: string;
  minScore: number;
  maxScore: number;
  level: RiskLevel;
  label: string;
  color: string;
  alertLevel: AlertLevel;
  isActive: boolean;
}

export enum RiskLevel {
  LOW = 'FAIBLE',
  MEDIUM = 'MOYEN',
  HIGH = 'ELEVE',
  CRITICAL = 'CRITIQUE'
}

export const RiskLevelColors: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: '#4CAF50', // Vert
  [RiskLevel.MEDIUM]: '#FFC107', // Jaune
  [RiskLevel.HIGH]: '#FF9800', // Orange
  [RiskLevel.CRITICAL]: '#F44336' // Rouge
};

export const RiskLevelLabels: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Faible',
  [RiskLevel.MEDIUM]: 'Moyen',
  [RiskLevel.HIGH]: 'Élevé',
  [RiskLevel.CRITICAL]: 'Critique'
};

export enum AlertLevel {
  NONE = 'AUCUNE',
  ANALYST = 'ANALYSTE',
  MANAGER = 'RESPONSABLE',
  ADMIN = 'ADMIN',
  ALL = 'TOUS'
}

// ============================================
// 3. RATIOS FINANCIERS
// ============================================
export interface FinancialRatioConfig {
  id: string;
  name: string;
  description: string;
  key: string;
  minValue?: number;
  maxValue: number;
  criticalMin?: number;
  criticalMax?: number;
  unit: string;
  isActive: boolean;
  priority: number;
}

// ============================================
// 4. RÈGLES DE DÉCISION
// ============================================
export interface DecisionRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: DecisionAction;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum DecisionAction {
  AUTO_ACCEPT = 'ACCEPTER_AUTOMATIQUEMENT',
  AUTO_REJECT = 'REFUSER_AUTOMATIQUEMENT',
  BLOCK = 'BLOQUER_LE_DOSSIER',
  SEND_TO_MANAGER = 'ENVOYER_AU_RESPONSABLE',
  SEND_TO_ANALYST = 'ENVOYER_A_L_ANALYSTE',
  MARK_CRITICAL = 'MARQUER_CRITIQUE'
}

export const DecisionActionLabels: Record<DecisionAction, string> = {
  [DecisionAction.AUTO_ACCEPT]: 'Accepter automatiquement',
  [DecisionAction.AUTO_REJECT]: 'Refuser automatiquement',
  [DecisionAction.BLOCK]: 'Bloquer le dossier',
  [DecisionAction.SEND_TO_MANAGER]: 'Envoyer au responsable',
  [DecisionAction.SEND_TO_ANALYST]: 'Envoyer à l\'analyste',
  [DecisionAction.MARK_CRITICAL]: 'Marquer critique'
};

// ============================================
// 5. ALERTES
// ============================================
export interface AlertConfig {
  id: string;
  event: AlertEvent;
  description: string;
  recipients: AlertRecipient[];
  isActive: boolean;
  priority: AlertPriority;
  notificationMethods: NotificationMethod[];
}

export enum AlertEvent {
  HIGH_SCORE = 'SCORE_ELEVE',
  FRAUD_DETECTED = 'FRAUDE_DETECTEE',
  DOCUMENT_FALSIFIED = 'DOCUMENT_FALSIFIE',
  AML_POSITIVE = 'AML_POSITIF',
  KYC_FAILED = 'KYC_ECHEC',
  CRITICAL_RISK = 'RISQUE_CRITIQUE'
}

export const AlertEventLabels: Record<AlertEvent, string> = {
  [AlertEvent.HIGH_SCORE]: 'Score > 80',
  [AlertEvent.FRAUD_DETECTED]: 'Fraude détectée',
  [AlertEvent.DOCUMENT_FALSIFIED]: 'Document falsifié',
  [AlertEvent.AML_POSITIVE]: 'AML positif',
  [AlertEvent.KYC_FAILED]: 'Échec KYC',
  [AlertEvent.CRITICAL_RISK]: 'Risque critique'
};

export enum AlertRecipient {
  ANALYST = 'ANALYSTE',
  MANAGER = 'RESPONSABLE',
  ADMIN = 'ADMIN'
}

export enum AlertPriority {
  LOW = 'BASSE',
  MEDIUM = 'MOYENNE',
  HIGH = 'HAUTE',
  CRITICAL = 'CRITIQUE'
}

export enum NotificationMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  DASHBOARD = 'TABLEAU_DE_BORD'
}

// ============================================
// 6. KYC / AML CONFIG
// ============================================
export interface KycAmlConfig {
  id: string;
  category: KycAmlCategory;
  name: string;
  description: string;
  isActive: boolean;
  required: boolean;
  priority: number;
  autoCheck: boolean;
  checks: KycAmlCheck[];
}

export enum KycAmlCategory {
  KYC = 'KYC',
  AML = 'AML'
}

export interface KycAmlCheck {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  weight: number;
}

// ============================================
// 7. IA CONFIG
// ============================================
export interface AIConfig {
  id: string;
  provider: AIProvider;
  model: string;
  temperature: number;
  systemPrompt: string;
  language: string;
  minScore: number;
  explanationRequired: boolean;
  isActive: boolean;
}

export enum AIProvider {
  OPENAI = 'OpenAI',
  AZURE_OPENAI = 'Azure OpenAI',
  OLLAMA = 'Ollama',
  LOCAL = 'Modèle local'
}

// ============================================
// 8. FRAUDE DETECTION
// ============================================
export interface FraudRule {
  id: string;
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
  threshold: number;
}

// ============================================
// 9. AUDIT LOG
// ============================================
export interface AuditLog {
  id: string;
  date: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: AuditCategory;
  details: string;
  ipAddress: string;
}

export enum AuditCategory {
  THRESHOLD = 'SEUIL',
  MODEL = 'MODELE',
  RATIO = 'RATIO',
  RULE = 'REGLE',
  ALERT = 'ALERTE',
  KYC = 'KYC',
  AML = 'AML',
  AI = 'IA',
  FRAUD = 'FRAUDE'
}
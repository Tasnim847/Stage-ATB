/**
 * Type de notification
 */
export enum NotificationType {
  RISK_ALERT = 'RISK_ALERT',
  DOCUMENT_INCOMPLETE = 'DOCUMENT_INCOMPLETE',
  APPROVAL_DEADLINE = 'APPROVAL_DEADLINE',
  FRAUD_ALERT = 'FRAUD_ALERT',
  AML_ALERT = 'AML_ALERT',
  KYC_REMINDER = 'KYC_REMINDER',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  REGULATORY_UPDATE = 'REGULATORY_UPDATE'
}

/**
 * Requête de notification
 */
export interface NotificationRequestDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Réponse de notification
 */
export interface NotificationResponseDTO {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}
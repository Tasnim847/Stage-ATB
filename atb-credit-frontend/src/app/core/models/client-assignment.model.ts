// core/models/client-assignment.model.ts
import { UserRole } from './user.model';

/**
 * DTO pour l'affectation d'un conseiller à un client
 */
export interface ClientAssignRequest {
  clientId: string;
  advisorId: string;
  clientIds?: string[];  // Pour l'affectation multiple
  removeAdvisor?: boolean;  // Pour retirer l'advisor
}

/**
 * DTO pour l'affectation multiple
 */
export interface AdvisorAssignmentDTO {
  advisorId: string;
  clientIds: string[];
  action?: 'ASSIGN' | 'REASSIGN' | 'REMOVE';
}

/**
 * Réponse d'affectation
 */
export interface AssignmentResponse {
  success: boolean;
  message: string;
  assignedCount: number;
  failedCount: number;
  errors?: string[];
}

/**
 * Statistiques d'affectation
 */
export interface AssignmentStats {
  totalAdvisors: number;
  totalUnassignedClients: number;
  totalAssignedClients: number;
  clientsPerAdvisor: {
    advisorId: string;
    advisorName: string;
    count: number;
  }[];
}
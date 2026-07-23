// core/models/user-management.model.ts - VERSION CORRIGÉE (sans doublon)

import { UserRole } from './user.model';

/**
 * Requête de création d'utilisateur
 */
export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole | string;
  department?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * Requête de mise à jour d'utilisateur
 */
export interface UserUpdateRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole | string;
  active?: boolean;
  locked?: boolean;
}

/**
 * ✅ Réponse utilisateur (UNIQUE DÉCLARATION)
 */
export interface UserResponseDTO {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  phoneNumber: string;
  active: boolean;
  locked: boolean;
  lastLoginAt: string;
  createdAt: string;
  totalCreditRequests: number;
  totalNotifications: number;
  // Champs optionnels pour les employés
  department?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
}
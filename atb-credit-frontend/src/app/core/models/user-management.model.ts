// core/models/user-management.model.ts - MODIFIÉ
import { UserRole } from './user.model';

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole | string;
  // ✅ AJOUTER CES CHAMPS
  department?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UserUpdateRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole | string;
  active?: boolean;
  locked?: boolean;
}

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
  // ✅ AJOUTER CES CHAMPS OPTIONNELS
  department?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
}
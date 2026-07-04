import { User } from "./user.model";

/**
 * Statut de l'employé
 */
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED'
}

/**
 * Modèle pour la requête de création/modification d'employé
 */
export interface EmployeeRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  role: User;
  status?: EmployeeStatus;
  department?: string;
  position?: string;
  hireDate?: string;
  managerId?: string;
  notes?: string;
}

/**
 * Modèle pour la réponse de l'employé
 */
export interface EmployeeResponseDTO {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  role: User;
  status: EmployeeStatus;
  department: string;
  position: string;
  hireDate: string;
  managerId: string;
  managerName: string;
  notes: string;
  active: boolean;
  createdAt: string;
  userId: string;
}

/**
 * Modèle pour l'inscription d'un employé
 */
export interface EmployeeRegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  department?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
}
/**
 * Rôles utilisateur
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  ADVISOR = 'ADVISOR',
  MANAGER = 'MANAGER',
  CLIENT = 'CLIENT'
}

/**
 * Modèle utilisateur
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  phoneNumber?: string;
  active: boolean;
  locked: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * Réponse utilisateur (avec statistiques)
 */
export interface UserResponse {
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
}

/**
 * Requête de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Requête d'inscription (employé)
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole | string;
}

/**
 * Réponse d'authentification
 */
export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  accessToken: string;
  refreshToken: string;
  expirationDate: string;
  message?: string;
}

/**
 * Réponse d'erreur
 */
export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  path?: string;
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
}
/**
 * Modèle pour la requête de création/modification de client
 */
export interface ClientRequestDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  gender?: string;
  identityNumber?: string;
  identityType?: string;
  profession?: string;
  employer?: string;
  monthlyIncome?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  advisorId?: string;
}

/**
 * Modèle pour la réponse du client
 */
export interface ClientResponseDTO {
  id: string;
  clientNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality: string;
  profession: string;
  employer: string;
  monthlyIncome: string;
  address: string;
  city: string;
  country: string;
  advisorName: string;
  advisorId: string;
  active: boolean;
  createdAt: string;
  totalCreditRequests: number;
  averageCreditScore: number;
  riskCategory: string;
  overallScore: number;
}

/**
 * Modèle pour l'inscription client
 */
export interface ClientRegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  placeOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  gender?: string;
  identityNumber?: string;
  identityType?: string;
  profession?: string;
  employer?: string;
  monthlyIncome?: string;
  postalCode?: string;
  notes?: string;
}
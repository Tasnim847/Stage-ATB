export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

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

export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expirationDate: string;
  message?: string;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  path?: string;
}
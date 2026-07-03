export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  active: boolean;
  locked: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  active: boolean;
  locked: boolean;
  lastLoginAt: string;
  createdAt: string;
  totalCreditRequests: number;
  totalNotifications: number;
}
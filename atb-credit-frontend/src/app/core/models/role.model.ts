import { UserRole } from './user.model';

export interface RoleResponseDTO {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  active: boolean;
  locked: boolean;
  createdAt: string;
  lastLoginAt: string;
  employeeNumber?: string;
  department?: string;
  position?: string;
}

export interface RoleUpdateRequest {
  userId: string;
  newRole: UserRole;
  permissions: string[];
  active: boolean;
  locked: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}
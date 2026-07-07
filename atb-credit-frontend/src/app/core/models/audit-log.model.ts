// core/models/audit-log.model.ts
export enum ActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  ASSIGN = 'ASSIGN',
  REASSIGN = 'REASSIGN',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  RESET_PASSWORD = 'RESET_PASSWORD',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  VERIFY = 'VERIFY'
}

export interface AuditLogResponseDTO {
  id: string;
  userId: string;
  username: string;
  email: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  module: string;
  actionType: ActionType;
  status: string;
  errorMessage: string;
  timestamp: string;
}

export interface AuditLogFilterRequest {
  userId?: string;
  username?: string;
  actionType?: ActionType;
  status?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface AuditLogStatistics {
  totalLogs: number;
  successfulLogins: number;
  failedLogins: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}
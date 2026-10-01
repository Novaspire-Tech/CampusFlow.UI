export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  module: string;
  role: string;
  entityId?: number;
  description: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string;
  createdBy?: string;
  createdDate?: string;
  isActive?: boolean;
  modifiedBy?: string | null;
  modifiedDate?: string | null;
}

export interface AuditLogListResponse {
  auditLogs: AuditLog[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
}

export interface AuditLogFilterOptions {
  auditActions: string[];
  auditModules: string[];
}

export interface FilterAuditLogsDto {
  search?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

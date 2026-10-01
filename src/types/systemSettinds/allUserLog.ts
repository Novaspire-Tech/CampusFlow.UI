export interface AllUserLog {
  id: string | number;
  createdBy: string;
  role: string;
  createdDate: string;
  action: string;
  module: string;
  status: string;
  description: string;
}

export interface FilterAllUserLogsDto {
  search?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
  module?: string;
  status?: string;
}

export interface AllUserLogQueryParams {
  page: number;
  size: number;
  sortDirection?: "asc" | "desc";
}

export interface AllUserLogPageResponse {
  auditLogs: AllUserLog[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface AllUserLogFilterOptions {
  auditActions: string[];
  auditModules: string[];
  statuses: string[];
}
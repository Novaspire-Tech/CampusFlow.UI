import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditLogService } from '../../../services/systemSettinds/userActivityServices';
import type {
  AuditLogQueryParams,
  FilterAuditLogsDto,
} from '../../../types/systemSettinds/userActivity';

export const auditLogKeys = {
  all: ['auditLogs'] as const,
  detail: (id: number) => ['auditLogs', id] as const,
  list: (params: AuditLogQueryParams) => ['auditLogs', 'list', params] as const,
  staff: (staffId: number, params: AuditLogQueryParams) => ['auditLogs', 'staff', staffId, params] as const,
  filter: (dto: FilterAuditLogsDto, params: AuditLogQueryParams) => ['auditLogs', 'filter', dto, params] as const,
  filterOptions: ['auditLogs', 'filterOptions'] as const,
};

export const useAuditLogs = (params: AuditLogQueryParams = {}) => {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogService.getAll(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useStaffAuditLogs = (
  staffId?: number,
  params: AuditLogQueryParams = {}
) => {
  return useQuery({
    queryKey: staffId ? auditLogKeys.staff(staffId, params) : ['auditLogs', 'staff', 'empty'],
    queryFn: async () => {
      if (!staffId) return null;
      return auditLogService.getByStaffId(staffId, params);
    },
    enabled: !!staffId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useFilterAuditLogs = (
  dto: FilterAuditLogsDto,
  params: AuditLogQueryParams = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: auditLogKeys.filter(dto, params),
    queryFn: () => auditLogService.filter(dto, params),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};

export const useAuditLogFilterOptions = () => {
  return useQuery({
    queryKey: auditLogKeys.filterOptions,
    queryFn: () => auditLogService.getFilterOptions(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

export const useFilterAuditLogsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      params = {},
    }: {
      dto: FilterAuditLogsDto;
      params?: AuditLogQueryParams;
    }) => auditLogService.filter(dto, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
};
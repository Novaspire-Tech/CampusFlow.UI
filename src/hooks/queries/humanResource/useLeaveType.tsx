import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveTypeService } from '../../../services/hr/LeaveTypeService';
import type { LeaveType } from '../../../types/humanResource/leaveType';

export const LeaveTypeKeys = {
  all: ['leaveType'] as const,
  detail: (id: string) => ['leaveType', id] as const,
  stats: ['leaveType', 'stats'] as const,
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: LeaveTypeKeys.all,
    queryFn: leaveTypeService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useLeaveType = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? LeaveTypeKeys.detail(id) : ['leaveType', 'empty'],
    queryFn: () => (id ? leaveTypeService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useLeaveTypestats = () => {
  return useQuery({
    queryKey: LeaveTypeKeys.stats,
    queryFn: leaveTypeService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useAddLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<LeaveType, 'id' | 'createdDate'>) => leaveTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.stats });
    },
  });
};

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeaveType }) => leaveTypeService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.stats });
    },
  });
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.stats });
    },
  });
};

export const useDeleteMultipleLeaveTypes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveTypeService.deleteMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: LeaveTypeKeys.stats });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepartmentService } from '../../../services/hr/DepartmentService';
import type { Department } from '../../../types/humanResource/department';


export const DepartmentKeys = {
  all: ['Departments'] as const,
  detail: (id: string) => ['Departments', id] as const,
  stats: ['Departments', 'stats'] as const,
};

export const useDepartments = () => {
  return useQuery({
    queryKey: DepartmentKeys.all,
    queryFn: DepartmentService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useDepartment = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? DepartmentKeys.detail(id) : ['Departments', 'empty'],
    queryFn: () => (id ? DepartmentService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useDepartmentStats = () => {
  return useQuery({
    queryKey: DepartmentKeys.stats,
    queryFn: DepartmentService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useAddDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Department, 'id' | 'createdDate'>) => DepartmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.all });
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.stats });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Department }) => DepartmentService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.all });
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.stats });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DepartmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.all });
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.stats });
    },
  });
};

export const useDeleteMultipleDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DepartmentService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.all });
      queryClient.invalidateQueries({ queryKey: DepartmentKeys.stats });
    },
  });
};

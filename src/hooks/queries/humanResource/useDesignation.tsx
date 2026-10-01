import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DesignationService } from '../../../services/hr/DesignationService';
import type { Designation } from '../../../types/humanResource/designation';

export const DesignationKeys = {
  all: ['Designations'] as const,
  detail: (id: string) => ['Designations', id] as const,
  stats: ['Designations', 'stats'] as const,
};

export const useDesignations = () => {
  return useQuery({
    queryKey: DesignationKeys.all,
    queryFn: DesignationService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useDesignation = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? DesignationKeys.detail(id) : ['Designations', 'empty'],
    queryFn: () => (id ? DesignationService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useDesignationstats = () => {
  return useQuery({
    queryKey: DesignationKeys.stats,
    queryFn: DesignationService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useAddDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Designation, 'id' | 'createdDate'>) => DesignationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DesignationKeys.all });
      queryClient.invalidateQueries({ queryKey: DesignationKeys.stats });
    },
  });
};

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Designation }) => DesignationService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: DesignationKeys.all });
      queryClient.invalidateQueries({ queryKey: DesignationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: DesignationKeys.stats });
    },
  });
};

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DesignationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DesignationKeys.all });
      queryClient.invalidateQueries({ queryKey: DesignationKeys.stats });
    },
  });
};

export const useDeleteMultipleDesignations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DesignationService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DesignationKeys.all });
      queryClient.invalidateQueries({ queryKey: DesignationKeys.stats });
    },
  });
};

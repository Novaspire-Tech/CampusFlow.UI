import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeHeadService } from '../../../services/income/incomeHeadService';
import type { IncomeHead } from '../../../types/income/incomeHead';

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

export const incomeHeadKeys = {
  all: ['incomeHeads'] as const,
  detail: (id: string) => ['incomeHeads', id] as const,
  stats: ['incomeHeads', 'stats'] as const,
};

export const useIncomeHeads = () => {
  return useQuery({
    queryKey: [...incomeHeadKeys.all, isAllSchools()],
    queryFn: incomeHeadService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useIncomeHead = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? incomeHeadKeys.detail(id) : ['incomeHeads', 'empty'],
    queryFn: () => (id ? incomeHeadService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useIncomeHeadStats = () => {
  return useQuery({
    queryKey: incomeHeadKeys.stats,
    queryFn: incomeHeadService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useAddIncomeHead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IncomeHead, 'id' | 'createdDate'>) => incomeHeadService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.all });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
  });
};

export const useUpdateIncomeHead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncomeHead }) => incomeHeadService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.all });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
  });
};

export const useDeleteIncomeHead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incomeHeadService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.all });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
  });
};

export const useDeleteMultipleIncomeHeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incomeHeadService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.all });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
  });
};

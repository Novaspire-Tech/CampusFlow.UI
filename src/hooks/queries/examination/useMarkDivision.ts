import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { markDivisionService } from '../../../services/examination/markDivisionService';
import type { MarkDivisionFormData } from '../../../types/examination/MarkDivision';

export const markDivisionKeys = {
  all: ['markDivisions'] as const,
  list: (page?: number, size?: number) =>
    ['markDivisions', 'list', page, size] as const,
};

export const useMarkDivisions = (
  page: number = 0,
  size: number = 1000,
  sortDirection: string = 'asc'
) => {
  return useQuery({
    queryKey: markDivisionKeys.list(page, size),
    queryFn: () => markDivisionService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateMarkDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarkDivisionFormData) =>
      markDivisionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markDivisionKeys.all });
    },
    onError: (error: any) => {
      console.error('Error creating mark division:', error);
      throw error;
    },
  });
};

export const useUpdateMarkDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkDivisionFormData }) =>
      markDivisionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markDivisionKeys.all });
    },
    onError: (error: any) => {
      console.error('Error updating mark division:', error);
      throw error;
    },
  });
};

export const useDeleteMarkDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markDivisionService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: markDivisionKeys.all });
      const previousData = queryClient.getQueryData(markDivisionKeys.all);
      return { previousData };
    },
    onError: (error: any, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(markDivisionKeys.all, context.previousData);
      }
      console.error('Error deleting mark division:', error);
      throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: markDivisionKeys.all });
    },
  });
};

export const useDeleteMultipleMarkDivisions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      markDivisionService.deleteMultiple(ids),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: markDivisionKeys.all });
      const previousData = queryClient.getQueryData(markDivisionKeys.all);
      return { previousData };
    },
    onError: (error: any, _ids, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(markDivisionKeys.all, context.previousData);
      }
      console.error('Error deleting mark divisions:', error);
      throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: markDivisionKeys.all });
    },
  });
};

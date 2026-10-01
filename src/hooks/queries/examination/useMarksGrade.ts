import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marksGradeService } from '../../../services/examination/marksGradeService';
import type { MarksGradeFormData } from '../../../types/examination/MarksGrades';

export const marksGradeKeys = {
  all: ['marksGrades'] as const,
};

export const useMarksGrades = () => {
  return useQuery({
    queryKey: marksGradeKeys.all,
    queryFn: marksGradeService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateMarksGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarksGradeFormData) => marksGradeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marksGradeKeys.all });
    },
    onError: (error: any) => {
      console.error('Error creating marks grade:', error);
      throw error;
    },
  });
};

export const useUpdateMarksGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarksGradeFormData }) =>
      marksGradeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marksGradeKeys.all });
    },
    onError: (error: any) => {
      console.error('Error updating marks grade:', error);
      throw error;
    },
  });
};

export const useDeleteMarksGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marksGradeService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: marksGradeKeys.all });
      const previousData = queryClient.getQueryData(marksGradeKeys.all);
      return { previousData };
    },
    onError: (error: any, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(marksGradeKeys.all, context.previousData);
      }
      console.error('Error deleting marks grade:', error);
      throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marksGradeKeys.all });
    },
  });
};

export const useDeleteMultipleMarksGrades = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => marksGradeService.deleteMultiple(ids),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: marksGradeKeys.all });
      const previousData = queryClient.getQueryData(marksGradeKeys.all);
      return { previousData };
    },
    onError: (error: any, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(marksGradeKeys.all, context.previousData);
      }
      console.error('Error deleting marks grades:', error);
      throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marksGradeKeys.all });
    },
  });
};

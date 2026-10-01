import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examTypeService } from '../../../services/examination/examTypeService';
import type { ExamType, ExamTypeFormData } from '../../../types/examination/examType';

export const examTypeKeys = {
  all: ['examTypes'] as const,
  detail: (id: string) => ['examTypes', id] as const,
};

export const useExamTypes = () => {
  return useQuery({
    queryKey: examTypeKeys.all,
    queryFn: examTypeService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useExamType = (id?: string) => {
  return useQuery({
    queryKey: id ? examTypeKeys.detail(id) : ['examTypes', 'empty'],
    queryFn: () => (id ? examTypeService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateExamType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExamTypeFormData) => examTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examTypeKeys.all });
    },
    onError: (error: any) => {
      console.error('Error creating exam type:', error);
      alert(error.message || 'Failed to create exam type');
    },
  });
};

export const useUpdateExamType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExamTypeFormData }) =>
      examTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examTypeKeys.all });
    },
    onError: (error: any) => {
      console.error('Error updating exam type:', error);
      alert(error.message || 'Failed to update exam type');
    },
  });
};

export const useDeleteExamType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examTypeService.delete,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: examTypeKeys.all });

      const previousExamTypes =
        queryClient.getQueryData<ExamType[]>(examTypeKeys.all);

      queryClient.setQueryData<ExamType[]>(examTypeKeys.all, (old = []) =>
        old.filter((type) => type.id !== id)
      );

      return { previousExamTypes };
    },
    onError: (error: any, _id, context) => {
      if (context?.previousExamTypes) {
        queryClient.setQueryData(examTypeKeys.all, context.previousExamTypes);
      }
      console.error('Error deleting exam type:', error);
      alert(error.message || 'Failed to delete exam type');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: examTypeKeys.all });
    },
  });
};

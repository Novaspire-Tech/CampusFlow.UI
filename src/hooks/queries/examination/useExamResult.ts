import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examResultService } from "../../../services/examination/ExamResultService";
import type { ExamResultDto } from "../../../types/examination/ExamResult";

export const examResultKeys = {
  all: ["examResults"] as const,
  detail: (id: string) => ["examResults", id] as const,
};

export const useExamResults = (
  page: number = 0,
  size: number = 10,
  sortDirection: string = "asc"
) => {
  return useQuery({
    queryKey: [...examResultKeys.all, page, size, sortDirection],
    queryFn: () => examResultService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useCreateExamResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examResultService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examResultKeys.all });
    },
  });
};

export const useUpdateExamResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: ExamResultDto }) =>
      examResultService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examResultKeys.all });
    },
  });
};

export const useDeleteExamResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examResultService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examResultKeys.all });
    },
  });
};

export const useDeleteMultipleExamResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examResultService.deleteMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examResultKeys.all });
    },
  });
};
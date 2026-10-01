import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academicTaskService } from "../../../services/homework/academicTaskService";
import type {
  AcademicTask,
  AcademicTaskFormData,
  AcademicTaskFilters,
} from "../../../types/homework/academicTask";
import { toast } from "react-toastify";

export const academicTaskKeys = {
  all: ["academicTasks"] as const,
  paginated: (page: number, size: number, filters?: AcademicTaskFilters) =>
    ["academicTasks", "paginated", page, size, filters] as const,
  filtered: (filters: AcademicTaskFilters, page: number, size: number) =>
    ["academicTasks", "filtered", filters, page, size] as const,
  detail: (id: string) => ["academicTasks", id] as const,
};

export const useAcademicTasks = (
  page = 0,
  size = 10,
  filters?: AcademicTaskFilters
) =>
  useQuery({
    queryKey: academicTaskKeys.paginated(page, size, filters),
    queryFn: () => academicTaskService.getAll(page, size, filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const useFilteredAcademicTasks = (
  filters: AcademicTaskFilters,
  page = 0,
  size = 10
) =>
  useQuery({
    queryKey: academicTaskKeys.filtered(filters, page, size),
    queryFn: () => academicTaskService.filter(filters, page, size),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled:
      !!filters.search ||
      !!filters.sectionId ||
      !!filters.subjectId ||
      !!filters.teacherId,
  });

  export const useCreateAcademicTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcademicTaskFormData) =>
      academicTaskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicTaskKeys.all });
    },
    onError: (error: any) => {
      console.error("Error creating academic task:", error);
      toast.error(error?.message ?? "Failed to create academic task");
    },
  });
};

export const useUpdateAcademicTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcademicTaskFormData }) =>
      academicTaskService.update(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: academicTaskKeys.all });
      queryClient.invalidateQueries({
        queryKey: academicTaskKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      console.error("Error updating academic task:", error);
      toast.error(error?.message ?? "Failed to update academic task");
    },
  });
};

export const useDeleteAcademicTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaskService.delete(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: academicTaskKeys.all });

      const previousPaginated = queryClient.getQueriesData({
        queryKey: ["academicTasks", "paginated"],
      });
      const previousFiltered = queryClient.getQueriesData({
        queryKey: ["academicTasks", "filtered"],
      });

      const removeTask = (old: any) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: AcademicTask) => t.id !== id),
          totalItems: Math.max(0, (old.totalItems ?? 0) - 1),
        };
      };

      queryClient.setQueriesData(
        { queryKey: ["academicTasks", "paginated"] },
        removeTask
      );
      queryClient.setQueriesData(
        { queryKey: ["academicTasks", "filtered"] },
        removeTask
      );

      return { previousPaginated, previousFiltered };
    },

    onError: (error: any, _id, context) => {
      context?.previousPaginated?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      context?.previousFiltered?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      console.error("Error deleting academic task:", error);
      toast.error(error?.message ?? "Failed to delete academic task");
    },

    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: academicTaskKeys.all });
      queryClient.removeQueries({ queryKey: academicTaskKeys.detail(id) });
    },
  });
};

export const useDeleteMultipleAcademicTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => academicTaskService.delete(id))),

    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: academicTaskKeys.all });

      const previousPaginated = queryClient.getQueriesData({
        queryKey: ["academicTasks", "paginated"],
      });
      const previousFiltered = queryClient.getQueriesData({
        queryKey: ["academicTasks", "filtered"],
      });

      const removeTasks = (old: any) => {
        if (!old?.tasks) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: AcademicTask) => !ids.includes(t.id)),
          totalItems: Math.max(0, (old.totalItems ?? 0) - ids.length),
        };
      };

      queryClient.setQueriesData(
        { queryKey: ["academicTasks", "paginated"] },
        removeTasks
      );
      queryClient.setQueriesData(
        { queryKey: ["academicTasks", "filtered"] },
        removeTasks
      );

      return { previousPaginated, previousFiltered };
    },

    onError: (error: any, _ids, context) => {
      context?.previousPaginated?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      context?.previousFiltered?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      console.error("Error deleting academic tasks:", error);
      toast.error(error?.message ?? "Failed to delete academic tasks");
    },

    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: academicTaskKeys.all });
      ids.forEach((id) =>
        queryClient.removeQueries({ queryKey: academicTaskKeys.detail(id) })
      );
    },
  });
};
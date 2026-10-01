import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examGroupService } from "../../../services/examination/examGroupService";
import type {
  ExamGroup,
  ExamGroupFormData,
} from "../../../types/examination/ExamGroup";

export const examGroupKeys = {
  all: ["examGroups"] as const,
  allByClass: (schoolClassId: number) => ["examGroups", schoolClassId] as const,
  detail: (id: number) => ["examGroups", id] as const,
};

export const useExamGroups = () => {
  return useQuery({
    queryKey: examGroupKeys.all,
    queryFn: examGroupService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useExamGroupsByClass = (schoolClassId: number | undefined) => {
  return useQuery({
    queryKey: examGroupKeys.allByClass(schoolClassId || 0),
    queryFn: () => examGroupService.getAllByClass(schoolClassId || 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useExamGroup = (id?: number) => {
  return useQuery({
    queryKey: id ? examGroupKeys.detail(id) : ["examGroups", "empty"],
    queryFn: () => (id ? examGroupService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateExamGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExamGroupFormData) => examGroupService.create(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: examGroupKeys.all });
    },
    onError: (error: any) => {
      console.error("Error creating exam group:", error);
    },
  });
};

export const useUpdateExamGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExamGroupFormData }) =>
      examGroupService.update(id, data),
    onSuccess: (updatedGroup, { id }) => {
      queryClient.setQueryData<ExamGroup[]>(examGroupKeys.all, (old = []) =>
        old.map((group) =>
          group.examGroupId === id ? { ...group, ...updatedGroup } : group
        )
      );
      queryClient.refetchQueries({ queryKey: examGroupKeys.all });
    },
    onError: (error: any) => {
      console.error("Error updating exam group:", error);
    },
  });
};

export const useDeleteExamGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examGroupService.delete,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: examGroupKeys.all });
      const previousGroups = queryClient.getQueryData<ExamGroup[]>(
        examGroupKeys.all,
      );

      queryClient.setQueryData<ExamGroup[]>(examGroupKeys.all, (old = []) =>
        old.filter((group) => group.examGroupId !== id),
      );

      return { previousGroups };
    },
    onError: (error: any, _id, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(examGroupKeys.all, context.previousGroups);
      }
      console.error("Error deleting exam group:", error);
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: examGroupKeys.all });
    },
  });
};

export const useDeleteMultipleExamGroups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examGroupService.deleteMultiple,
    onMutate: async (ids: number[]) => {
      await queryClient.cancelQueries({ queryKey: examGroupKeys.all });
      const previousGroups = queryClient.getQueryData<ExamGroup[]>(
        examGroupKeys.all,
      );

      queryClient.setQueryData<ExamGroup[]>(examGroupKeys.all, (old = []) =>
        old.filter((group) => !ids.includes(group.examGroupId!)),
      );

      return { previousGroups };
    },
    onError: (error: any, _ids, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(examGroupKeys.all, context.previousGroups);
      }
      console.error("Error deleting multiple exam groups:", error);
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: examGroupKeys.all });
    },
  });
};
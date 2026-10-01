import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examScheduleService } from "../../../services/examination/examScheduleService";
import { toast } from "react-toastify";
import type {
  CreateExamScheduleRequestDTO,
  ExamScheduleFilters,
} from "../../../types/examination/examSchedule";

const QUERY_KEY = "examSchedules";

export const useExamSchedules = (filters?: ExamScheduleFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => {
      if (!filters?.examGroupId || !filters?.schoolClassId) {
        return Promise.resolve([]);
      }
      return examScheduleService.getAll(filters);
    },
    enabled: !!filters?.examGroupId && !!filters?.schoolClassId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


export const useAddExamSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamScheduleRequestDTO) =>
      examScheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add exam schedule";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateExamSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamScheduleRequestDTO) =>
      examScheduleService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update exam schedule";
      toast.error(errorMessage);
    },
  });
};


export const useDeleteExamSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      schoolClassId,
      examGroupId,
      examScheduleId,
    }: {
      schoolClassId: number;
      examGroupId: number;
      examScheduleId: number;
    }) => examScheduleService.delete(schoolClassId, examGroupId, examScheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
   
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete exam schedule";
      toast.error(errorMessage);
    },
  });
};
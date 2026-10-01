// src/hooks/queries/humanResource/useStaffLeave.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  staffLeaveService,
  type FilterStaffLeaveDTO,
  type PaginatedLeaveResponse,
} from "../../../services/hr/staffLeaveService";
import type {
  StaffLeave,
  StaffLeaveFormInputs,
} from "../../../types/humanResource/StaffLeave";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const staffLeaveKeys = {
  all:       ["staffLeaves"] as const,
  lists:     () => ["staffLeaves", "list"] as const,
  list:      (params: object) => ["staffLeaves", "list", params] as const,
  filters:   () => ["staffLeaves", "filter"] as const,
  filter:    (dto: FilterStaffLeaveDTO, params: object) =>
               ["staffLeaves", "filter", dto, params] as const,
  byStaffId: (staffId: number) =>
               ["staffLeaves", "staff", staffId] as const,
  balance:   (staffId: number, leaveType: string) =>
               ["staffLeaves", "balance", staffId, leaveType] as const,
};

// ─── Pagination Params Type ───────────────────────────────────────────────────

interface PaginationParams {
  page?:          number;
  size?:          number;
  sortDirection?: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** GET /all — paginated list of all leave requests */
export const useStaffLeaves = (params: PaginationParams = {}) => {
  const normalized: PaginationParams = {
    page:          params.page          ?? 0,
    size:          params.size          ?? 10,
    sortDirection: params.sortDirection ?? "asc",
  };

  return useQuery<PaginatedLeaveResponse>({
    queryKey: staffLeaveKeys.list(normalized),
    queryFn:  () => staffLeaveService.getAll(normalized),
    staleTime: 5  * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: 1,
  });
};

/** POST /filter — paginated + filtered leave requests */
export const useFilterStaffLeaves = (
  dto:     FilterStaffLeaveDTO,
  params:  PaginationParams = {},
  enabled: boolean = true
) => {
  const normalized: PaginationParams = {
    page:          params.page          ?? 0,
    size:          params.size          ?? 10,
    sortDirection: params.sortDirection ?? "asc",
  };

  return useQuery<PaginatedLeaveResponse>({
    queryKey: staffLeaveKeys.filter(dto, normalized),
    queryFn:  () => staffLeaveService.filter(dto, normalized),
    staleTime: 5  * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    enabled,
    retry: 1,
  });
};

/** GET /staff/:staffId — all leaves for a specific staff member */
export const useStaffLeavesByStaffId = (
  staffId: number,
  enabled: boolean = true
) => {
  return useQuery<StaffLeave[]>({
    queryKey: staffLeaveKeys.byStaffId(staffId),
    queryFn:  () => staffLeaveService.findByStaffId(staffId),
    staleTime: 5  * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    enabled:   enabled && staffId > 0,
    retry: 1,
  });
};

/** GET /balance/:staffId?leaveType= — remaining balance for a leave type */
export const useLeaveBalance = (staffId: number, leaveType: string) => {
  return useQuery({
    queryKey: staffLeaveKeys.balance(staffId, leaveType),
    queryFn:  () => staffLeaveService.getBalance(staffId, leaveType),
    staleTime: 5  * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    enabled:   staffId > 0 && !!leaveType,
    retry: 1,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/** POST /apply — submit a new leave application */
export const useCreateStaffLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffLeaveFormInputs) => staffLeaveService.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffLeaveKeys.all });
    },
  });
};

/** PUT /status/:leaveId — approve / reject / update leave status */
export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveId, status }: { leaveId: number; status: string }) =>
      staffLeaveService.updateStatus(leaveId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffLeaveKeys.all });
    },
  });
};

/** DELETE /delete/:leaveId */
export const useDeleteStaffLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveId: number) => staffLeaveService.delete(leaveId),

    onMutate: async (leaveId) => {
      // Cancel any in-flight paginated list queries
      await queryClient.cancelQueries({ queryKey: staffLeaveKeys.lists() });

      // Snapshot every cached paginated page for rollback
      const previousData = queryClient.getQueriesData<PaginatedLeaveResponse>({
        queryKey: staffLeaveKeys.lists(),
      });

      // Optimistically remove the leave from every cached page
      previousData.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData<PaginatedLeaveResponse>(key, {
          ...data,
          leaves:     data.leaves.filter((l) => l.staffLeaveId !== leaveId),
          totalItems: Math.max(0, data.totalItems - 1),
        });
      });

      return { previousData };
    },

    onError: (_error, _leaveId, context) => {
      // Roll back all optimistically updated pages
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: staffLeaveKeys.all });
    },
  });
};
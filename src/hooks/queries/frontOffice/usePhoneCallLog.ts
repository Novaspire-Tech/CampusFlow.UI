import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  phoneCallLogService,
  type PhoneCallLogSearchParams,
  EMPTY_PHONE_SEARCH_PARAMS,
} from "../../../services/frontOffice/phoneCallLogService";
import type { PhoneCallLogFormData } from "../../../types/frontOffice/phoneCallLog";

// Query Keys 

export const phoneCallLogKeys = {
  all: ["phoneCallLogs"] as const,

  list: (page: number, size: number, sortDirection: string) =>
    ["phoneCallLogs", "list", { page, size, sortDirection }] as const,

  filter: (
    params: PhoneCallLogSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ) =>
    ["phoneCallLogs", "filter", { ...params, page, size, sortBy, sortDirection }] as const,

  detail: (id: string) => ["phoneCallLogs", id] as const,
};

//  Queries 
export const usePhoneCallLogs = (
  page = 0,
  size = 10,
  sortDirection: "asc" | "desc" = "desc"
) => {
  return useQuery({
    queryKey: phoneCallLogKeys.list(page, size, sortDirection),
    queryFn: () => phoneCallLogService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useFilterPhoneCallLogs = (
  params: PhoneCallLogSearchParams = EMPTY_PHONE_SEARCH_PARAMS,
  page = 0,
  size = 10,
  sortBy = "date",
  sortDirection: "asc" | "desc" = "desc"
) => {
  const hasFilters = !!(params.callType || params.search);

  return useQuery({
    queryKey: phoneCallLogKeys.filter(params, page, size, sortBy, sortDirection),
    queryFn: () =>
      hasFilters
        ? phoneCallLogService.filter(params, page, size, sortBy, sortDirection)
        : phoneCallLogService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

// Single record
export const usePhoneCallLog = (id?: string) => {
  return useQuery({
    queryKey: id ? phoneCallLogKeys.detail(id) : ["phoneCallLogs", "empty"],
    queryFn: () => (id ? phoneCallLogService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

//  Mutations 

export const useCreatePhoneCallLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PhoneCallLogFormData) => phoneCallLogService.create(data),
    onSuccess: (newLog) => {
      queryClient.invalidateQueries({ queryKey: ["phoneCallLogs"] });
      queryClient.setQueryData(phoneCallLogKeys.detail(newLog.id), newLog);
    },
    onError: (error: any) => {
      console.error("Error creating phone call log:", error);
    },
  });
};

export const useUpdatePhoneCallLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PhoneCallLogFormData }) =>
      phoneCallLogService.update(id, data),
    onSuccess: (updatedLog) => {
      queryClient.invalidateQueries({ queryKey: ["phoneCallLogs"] });
      queryClient.setQueryData(phoneCallLogKeys.detail(updatedLog.id), updatedLog);
    },
    onError: (error: any) => {
      console.error("Error updating phone call log:", error);
    },
  });
};

export const useDeletePhoneCallLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: phoneCallLogService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["phoneCallLogs"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["phoneCallLogs"] });
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ["phoneCallLogs"] });
      queryClient.removeQueries({ queryKey: phoneCallLogKeys.detail(id) });
    },
  });
};

export const useDeleteMultiplePhoneCallLogs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: phoneCallLogService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["phoneCallLogs"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["phoneCallLogs"] });
      return { snapshot };
    },
    onError: (_error, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: ["phoneCallLogs"] });
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: phoneCallLogKeys.detail(id) });
      });
    },
  });
};
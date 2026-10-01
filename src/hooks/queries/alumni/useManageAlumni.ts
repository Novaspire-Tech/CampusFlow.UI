import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  manageAlumniService,
  type ManageAlumniSearchParams,
} from "../../../services/alumni/manageAlumniService";

export const manageAlumniKeys = {
  all: ["manage-alumni"] as const,
  list: (page: number, size: number, sortDirection: string) =>
    ["manage-alumni", "list", { page, size, sortDirection }] as const,
  filter: (
    params: ManageAlumniSearchParams,
    page: number,
    size: number,
    sortDirection: string,
  ) =>
    [
      "manage-alumni",
      "filter",
      { ...params, page, size, sortDirection },
    ] as const,
};

export const useManageAlumni = (
  page: number = 0,
  size: number = 10,
  sortDirection: string = "asc",
) => {
  return useQuery({
    queryKey: manageAlumniKeys.list(page, size, sortDirection),
    queryFn: () => manageAlumniService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useFilterManageAlumni = (
  params: ManageAlumniSearchParams,
  page: number = 0,
  size: number = 10,
  sortDirection: string = "asc",
) => {
  const hasFilters = !!(params.sessionId || params.search?.trim());

  return useQuery({
    queryKey: manageAlumniKeys.filter(params, page, size, sortDirection),
    queryFn: () =>
      hasFilters
        ? manageAlumniService.filter(params, page, size, sortDirection)
        : manageAlumniService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useDeleteAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: manageAlumniService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: manageAlumniKeys.all });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: manageAlumniKeys.all,
      });
      return { snapshot };
    },
    onError: (error: any, _id, context: any) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
      console.error("Error deleting alumni:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: manageAlumniKeys.all });
    },
  });
};

export const useDeleteMultipleAlumni = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: manageAlumniService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: manageAlumniKeys.all });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: manageAlumniKeys.all,
      });
      return { snapshot };
    },
    onError: (error: any, _ids, context: any) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
      console.error("Error deleting multiple alumni:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: manageAlumniKeys.all });
    },
  });
};

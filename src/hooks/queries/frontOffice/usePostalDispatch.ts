import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postalDispatchService,
  type PostalDispatchSearchParams,
  EMPTY_POSTAL_SEARCH_PARAMS,
} from "../../../services/frontOffice/postalDispatchService";
import type { PostalDispatchFormData } from "../../../types/frontOffice/postalDispatch";

const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

export const postalDispatchKeys = {
  all: ["postalDispatches"] as const,

  list: (page: number, size: number, sortDirection: string, allSchools: boolean) =>
    ["postalDispatches", "list", { page, size, sortDirection, allSchools }] as const,

  filter: (
    params: PostalDispatchSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
    allSchools: boolean
  ) =>
    ["postalDispatches", "filter", { ...params, page, size, sortBy, sortDirection, allSchools }] as const,

  detail: (id: string) => ["postalDispatches", id] as const,
};

export const usePostalDispatches = (
  page = 0,
  size = 10,
  sortDirection: "asc" | "desc" = "asc"
) => {
  return useQuery({
    queryKey: postalDispatchKeys.list(page, size, sortDirection, isAllSchools()),
    queryFn: () => postalDispatchService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useFilterPostalDispatches = (
  params: PostalDispatchSearchParams = EMPTY_POSTAL_SEARCH_PARAMS,
  page = 0,
  size = 10,
  sortBy = "date",
  sortDirection: "asc" | "desc" = "asc"
) => {
  const hasFilters = !!params.search;

  return useQuery({
    queryKey: postalDispatchKeys.filter(params, page, size, sortBy, sortDirection, isAllSchools()),
    queryFn: () =>
      hasFilters
        ? postalDispatchService.filter(params, page, size, sortBy, sortDirection)
        : postalDispatchService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const usePostalDispatch = (id?: string) => {
  return useQuery({
    queryKey: id ? postalDispatchKeys.detail(id) : ["postalDispatches", "empty"],
    queryFn: () => (id ? postalDispatchService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePostalDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostalDispatchFormData) => postalDispatchService.create(data),
    onSuccess: (newDispatch) => {
      queryClient.invalidateQueries({ queryKey: ["postalDispatches"] });
      queryClient.setQueryData(postalDispatchKeys.detail(newDispatch.id), newDispatch);
    },
    onError: (error: any) => {
      console.error("Error creating postal dispatch:", error);
    },
  });
};

export const useUpdatePostalDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostalDispatchFormData }) =>
      postalDispatchService.update(id, data),
    onSuccess: (updatedDispatch) => {
      queryClient.invalidateQueries({ queryKey: ["postalDispatches"] });
      queryClient.setQueryData(postalDispatchKeys.detail(updatedDispatch.id), updatedDispatch);
    },
    onError: (error: any) => {
      console.error("Error updating postal dispatch:", error);
    },
  });
};

export const useUpdateAddPostalDispatchDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      postalDispatchService.updateDocument(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postalDispatches"] });
    },
    onError: (error: any) => {
      console.error("Error updating postal dispatch document:", error);
    },
  });
};

export const useDeletePostalDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postalDispatchService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postalDispatches"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["postalDispatches"] });
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ["postalDispatches"] });
      queryClient.removeQueries({ queryKey: postalDispatchKeys.detail(id) });
    },
  });
};

export const useDeleteMultiplePostalDispatches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postalDispatchService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postalDispatches"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["postalDispatches"] });
      return { snapshot };
    },
    onError: (_error, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: ["postalDispatches"] });
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: postalDispatchKeys.detail(id) });
      });
    },
  });
};
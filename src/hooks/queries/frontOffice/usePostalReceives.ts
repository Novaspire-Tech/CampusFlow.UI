import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postalReceiveService,
  type PostalReceiveSearchParams,
  EMPTY_POSTAL_RECEIVE_SEARCH_PARAMS,
} from "../../../services/frontOffice/postalReceiveService";
import type { PostalReceiveFormData } from "../../../types/frontOffice/postalReceive";

//  Query Keys 
export const postalReceiveKeys = {
  all: ["postalReceives"] as const,

  list: (page: number, size: number, sortDirection: string) =>
    ["postalReceives", "list", { page, size, sortDirection }] as const,

  filter: (
    params: PostalReceiveSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ) =>
    ["postalReceives", "filter", { ...params, page, size, sortBy, sortDirection }] as const,

  detail: (id: string) => ["postalReceives", id] as const,
};

//  Queries 
export const usePostalReceives = (
  page = 0,
  size = 10,
  sortDirection: "asc" | "desc" = "asc"
) => {
  return useQuery({
    queryKey: postalReceiveKeys.list(page, size, sortDirection),
    queryFn: () => postalReceiveService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useFilterPostalReceives = (
  params: PostalReceiveSearchParams = EMPTY_POSTAL_RECEIVE_SEARCH_PARAMS,
  page = 0,
  size = 10,
  sortBy = "date",
  sortDirection: "asc" | "desc" = "asc"
) => {
  const hasFilters = !!params.search;

  return useQuery({
    queryKey: postalReceiveKeys.filter(params, page, size, sortBy, sortDirection),
    queryFn: () =>
      hasFilters
        ? postalReceiveService.filter(params, page, size, sortBy, sortDirection)
        : postalReceiveService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const usePostalReceive = (id?: string) => {
  return useQuery({
    queryKey: id ? postalReceiveKeys.detail(id) : ["postalReceives", "empty"],
    queryFn: () => (id ? postalReceiveService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

//  Mutations 

export const useCreatePostalReceive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostalReceiveFormData) => postalReceiveService.create(data),
    onSuccess: (newReceive) => {
      queryClient.invalidateQueries({ queryKey: ["postalReceives"] });
      queryClient.setQueryData(postalReceiveKeys.detail(newReceive.id), newReceive);
    },
    onError: (error: any) => {
      console.error("Error creating postal receive:", error);
    },
  });
};

export const useUpdatePostalReceive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostalReceiveFormData }) =>
      postalReceiveService.update(id, data),
    onSuccess: (updatedReceive) => {
      queryClient.invalidateQueries({ queryKey: ["postalReceives"] });
      queryClient.setQueryData(postalReceiveKeys.detail(updatedReceive.id), updatedReceive);
    },
    onError: (error: any) => {
      console.error("Error updating postal receive:", error);
    },
  });
};

export const useUpdateAddPostalReceiveDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      postalReceiveService.updateDocument(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postalReceives"] });
    },
    onError: (error: any) => {
      console.error("Error updating postal receive document:", error);
    },
  });
};

export const useDeletePostalReceive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postalReceiveService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postalReceives"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["postalReceives"] });
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ["postalReceives"] });
      queryClient.removeQueries({ queryKey: postalReceiveKeys.detail(id) });
    },
  });
};

export const useDeleteMultiplePostalReceives = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postalReceiveService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postalReceives"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["postalReceives"] });
      return { snapshot };
    },
    onError: (_error, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: ["postalReceives"] });
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: postalReceiveKeys.detail(id) });
      });
    },
  });
};
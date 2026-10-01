import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  complainService,
  type ComplainSearchParams,
  EMPTY_COMPLAIN_SEARCH_PARAMS,
} from "../../../services/frontOffice/complainService";
import type { ComplainFormData } from "../../../types/frontOffice/complain";

//  Query Keys 
export const complainKeys = {
  all: ["complains"] as const,

  list: (page: number, size: number) =>
    ["complains", "list", { page, size }] as const,

  filter: (
    params: ComplainSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ) =>
    ["complains", "filter", { ...params, page, size, sortBy, sortDirection }] as const,

  detail: (id: string) => ["complains", id] as const,
};

//  Queries 
export const useComplains = (page = 0, size = 10) => {
  return useQuery({
    queryKey: complainKeys.list(page, size),
    queryFn:  () => complainService.getAll(page, size),
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};

export const useFilterComplains = (
  params: ComplainSearchParams = EMPTY_COMPLAIN_SEARCH_PARAMS,
  page = 0,
  size = 10,
  sortBy = "date",
  sortDirection: "asc" | "desc" = "asc"
) => {
  const hasFilters = !!(params.search || params.complaintTypeId || params.sourceId);

  return useQuery({
    queryKey: complainKeys.filter(params, page, size, sortBy, sortDirection),
    queryFn: () =>
      hasFilters
        ? complainService.filter(params, page, size, sortBy, sortDirection)
        : complainService.getAll(page, size),
    staleTime: 2 * 60 * 1000,
    gcTime:    5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};

export const useComplain = (id?: string) => {
  return useQuery({
    queryKey: id ? complainKeys.detail(id) : ["complains", "empty"],
    queryFn:  () => (id ? complainService.getById(id) : null),
    enabled:  !!id,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  });
};

//  Mutations 

export const useCreateComplain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ComplainFormData) => complainService.create(data),
    onSuccess: (newComplain) => {
      queryClient.invalidateQueries({ queryKey: ["complains"] });
      queryClient.setQueryData(complainKeys.detail(newComplain.id), newComplain);
    },
    onError: (error: any) => console.error("Error creating complain:", error),
  });
};

export const useUpdateComplain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ComplainFormData }) =>
      complainService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["complains"] });
      queryClient.setQueryData(complainKeys.detail(updated.id), updated);
    },
    onError: (error: any) => console.error("Error updating complain:", error),
  });
};

export const useUpdateComplainDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      complainService.updateDocument(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["complains"] }),
    onError: (error: any) => console.error("Error updating complain document:", error),
  });
};

export const useDeleteComplain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complainService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["complains"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["complains"] });
      return { snapshot };
    },
    onError: (_err, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: ["complains"] });
      queryClient.removeQueries({ queryKey: complainKeys.detail(id) });
    },
  });
};

export const useDeleteMultipleComplains = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complainService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["complains"] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ["complains"] });
      return { snapshot };
    },
    onError: (_err, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _err, ids) => {
      queryClient.invalidateQueries({ queryKey: ["complains"] });
      ids.forEach((id) =>
        queryClient.removeQueries({ queryKey: complainKeys.detail(id) })
      );
    },
  });
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issuesItemService } from "../../../services/inventory/issuesItemService";
import type { IssuesItemFormData } from "../../../types/inventory/IssuesItem";

export const issuesItemKeys = {
  all: ["issuesItems"] as const,

  filter: (search: string, page: number, size: number) =>
    ["issuesItems", "filter", { search, page, size }] as const,
  detail: (id: number) => ["issuesItems", id] as const,
};

export const useFilterIssuesItems = (search = "", page = 0, size = 10) => {
  return useQuery({
    queryKey: issuesItemKeys.filter(search, page, size),
    queryFn: () => issuesItemService.filter(search, page, size),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useIssuesItems = () => {
  return useQuery({
    queryKey: issuesItemKeys.all,
    queryFn: issuesItemService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateIssuesItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IssuesItemFormData) => issuesItemService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issuesItems"] });
    },
    onError: (error: any) => {
      console.error("Error creating issue item:", error);
    },
  });
};

export const useUpdateIssuesItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssuesItemFormData }) =>
      issuesItemService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issuesItems"] });
    },
    onError: (error: any) => {
      console.error("Error updating issue item:", error);
    },
  });
};

export const useDeleteIssuesItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => issuesItemService.delete(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["issuesItems"] });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: ["issuesItems"],
      });
      return { snapshot };
    },
    onError: (error: any, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
      console.error("Error deleting issue item:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issuesItems"] });
    },
  });
};

export const useDeleteMultipleIssuesItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => issuesItemService.deleteMultiple(ids),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["issuesItems"] });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: ["issuesItems"],
      });
      return { snapshot };
    },
    onError: (error: any, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
      console.error("Error deleting multiple issue items:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issuesItems"] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addIncomeService,
  type AddIncomeSearchParams,
  type SearchIncomesParams,
} from "../../../services/income/addIncomeService ";
import type { AddIncomeFormData } from "../../../types/income/addIncome";
import { incomeHeadKeys } from "./useIncomeHeads";

export const addIncomeKeys = {
  all: ["addIncomes"] as const,

  list: (page: number, size: number, sortDirection: string) =>
    ["addIncomes", "list", { page, size, sortDirection }] as const,

  filter: (
    params: AddIncomeSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
  ) =>
    [
      "addIncomes",
      "filter",
      { ...params, page, size, sortBy, sortDirection },
    ] as const,

  search: (
    params: SearchIncomesParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
  ) =>
    [
      "addIncomes",
      "search",
      { ...params, page, size, sortBy, sortDirection },
    ] as const,

  byName: (name: string) => ["addIncomes", "name", name] as const,
};

export const useAddIncomes = (
  page = 0,
  size = 10,
  sortDirection: "asc" | "desc" = "asc",
) => {
  return useQuery({
    queryKey: addIncomeKeys.list(page, size, sortDirection),
    queryFn: () => addIncomeService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useSearchAddIncomes = (
  params: SearchIncomesParams,
  page = 0,
  size = 10,
  sortBy = "date",
  sortDirection: "asc" | "desc" = "asc",
  enabled = false,
) => {
  return useQuery({
    queryKey: addIncomeKeys.search(params, page, size, sortBy, sortDirection),
    queryFn: () =>
      addIncomeService.search(params, page, size, sortBy, sortDirection),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useFilterAddIncomes = (
  params: AddIncomeSearchParams,
  page = 0,
  size = 10,
  sortBy = "date",
  sortDirection: "asc" | "desc" = "asc",
) => {
  const hasFilters = !!(
    params.incomeHeadId ||
    params.incomeGroupId ||
    params.search
  );

  return useQuery({
    queryKey: addIncomeKeys.filter(params, page, size, sortBy, sortDirection),
    queryFn: () =>
      hasFilters
        ? addIncomeService.filter(params, page, size, sortBy, sortDirection)
        : addIncomeService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useAddIncomeByName = (name?: string) => {
  return useQuery({
    queryKey: name ? addIncomeKeys.byName(name) : ["addIncomes", "empty"],
    queryFn: () => (name ? addIncomeService.findByName(name) : null),
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateAddIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddIncomeFormData) => addIncomeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addIncomes"] });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
    onError: (error: any) => {
      console.error("Error creating income:", error);
    },
  });
};

export const useUpdateAddIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddIncomeFormData }) =>
      addIncomeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addIncomes"] });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
    onError: (error: any) => {
      console.error("Error updating income:", error);
    },
  });
};

export const useUpdateAddIncomeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      addIncomeService.updateDocument(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addIncomes"] });
    },
    onError: (error: any) => {
      console.error("Error updating income document:", error);
    },
  });
};

export const useDeleteAddIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addIncomeService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["addIncomes"] });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: ["addIncomes"],
      });
      return { snapshot };
    },
    onError: (_error: any, _id, context: any) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["addIncomes"] });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
  });
};

export const useDeleteMultipleAddIncomes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addIncomeService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["addIncomes"] });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: ["addIncomes"],
      });
      return { snapshot };
    },
    onError: (_error: any, _ids, context: any) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["addIncomes"] });
      queryClient.invalidateQueries({ queryKey: incomeHeadKeys.stats });
    },
  });
};
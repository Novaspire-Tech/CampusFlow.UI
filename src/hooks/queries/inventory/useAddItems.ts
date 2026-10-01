import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addItemsService,
  type AddItemsFilterParams,
} from "../../../services/inventory/addItemsService";
import type { AddItemsFormData } from "../../../types/inventory/AddItems";

export const addItemsKeys = {
  all: ["addItems"] as const,
  detail: (id: number) => ["addItems", id] as const,
  filter: (params: AddItemsFilterParams) => ["addItems", "filter", params] as const,
};

export const useItems = () => {
  return useQuery({
    queryKey: addItemsKeys.all,
    queryFn: addItemsService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useItem = (id?: number) => {
  return useQuery({
    queryKey: id ? addItemsKeys.detail(id) : ["addItems", "empty"],
    queryFn: async () => {
      if (!id) return null;
      const list = await addItemsService.getAll();
      return list.find((item) => item.addItemId === id) ?? null;
    },
    enabled: !!id,
  });
};

export const useFilterItems = (params: AddItemsFilterParams) => {
  return useQuery({
    queryKey: addItemsKeys.filter(params),
    queryFn: () => addItemsService.filter(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};

export const useAddItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddItemsFormData) => addItemsService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["addItems"] });
    },
  });
};

export const useUpdateItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddItemsFormData }) =>
      addItemsService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["addItems"] });
      queryClient.invalidateQueries({ queryKey: addItemsKeys.detail(variables.id) });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => addItemsService.delete(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["addItems"] });
    },
  });
};

export const useDeleteMultipleItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => addItemsService.deleteMultiple(ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["addItems"] });
    },
  });
};
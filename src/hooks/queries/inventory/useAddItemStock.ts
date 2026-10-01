import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addItemStockService,
} from "../../../services/inventory/addItemStockService";
import type { AddItemStock, AddItemStockFormData } from "../../../types/inventory/AddItemStock";

export const addItemStockKeys = {
  all: ["addItemStocks"] as const,
};

export const useAddItemStocks = () => {
  return useQuery({
    queryKey: addItemStockKeys.all,
    queryFn: addItemStockService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateAddItemStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddItemStockFormData) => addItemStockService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addItemStockKeys.all }),
  });
};

export const useUpdateAddItemStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddItemStockFormData }) =>
      addItemStockService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addItemStockKeys.all }),
  });
};

export const useUpdateAddItemStockDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      addItemStockService.updateDocument(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addItemStockKeys.all }),
  });
};

export const useDeleteAddItemStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => addItemStockService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: addItemStockKeys.all });
      const prev = queryClient.getQueryData<AddItemStock[]>(addItemStockKeys.all);
      queryClient.setQueryData<AddItemStock[]>(
        addItemStockKeys.all,
        (old = []) => old.filter((s) => s.addItemStockId !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(addItemStockKeys.all, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: addItemStockKeys.all }),
  });
};

export const useDeleteMultipleAddItemStocks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => addItemStockService.deleteMultiple(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: addItemStockKeys.all });
      const prev = queryClient.getQueryData<AddItemStock[]>(addItemStockKeys.all);
      queryClient.setQueryData<AddItemStock[]>(
        addItemStockKeys.all,
        (old = []) => old.filter((s) => !ids.includes(s.addItemStockId))
      );
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(addItemStockKeys.all, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: addItemStockKeys.all }),
  });
};
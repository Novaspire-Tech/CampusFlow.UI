import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemStoreService } from '../../../services/inventory/itemStoreService';
import type { ItemStoreFormData } from '../../../types/inventory/ItemStore';

export const itemStoreKeys = {
  all: ['itemStores'] as const,
  detail: (id: number) => ['itemStores', id] as const,
};

export const useItemStores = () => {
  return useQuery({
    queryKey: itemStoreKeys.all,
    queryFn: itemStoreService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAddItemStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ItemStoreFormData) => itemStoreService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemStoreKeys.all });
    },
  });
};

export const useUpdateItemStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemStoreFormData }) =>
      itemStoreService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: itemStoreKeys.all });
      queryClient.invalidateQueries({
        queryKey: itemStoreKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteItemStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemStoreService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemStoreKeys.all });
    },
  });
};

export const useDeleteMultipleItemStores = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemStoreService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemStoreKeys.all });
    },
  });
};

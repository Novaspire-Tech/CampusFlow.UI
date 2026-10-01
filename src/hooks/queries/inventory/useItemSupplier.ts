import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemSupplierService } from '../../../services/inventory/itemSupplierService';
import type { ItemSupplier } from '../../../types/inventory/ItemSupplier';

export const itemSupplierKeys = {
  all: ['itemSuppliers'] as const,
  detail: (id: string) => ['itemSuppliers', id] as const,
};

export const useItemSuppliers = () => {
  return useQuery({
    queryKey: itemSupplierKeys.all,
    queryFn: itemSupplierService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useItemSupplier = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? itemSupplierKeys.detail(id) : ['itemSuppliers', 'empty'],
    queryFn: () => (id ? itemSupplierService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAddItemSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ItemSupplier, 'itemSupplierId'>) =>
      itemSupplierService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemSupplierKeys.all });
    },
  });
};

export const useUpdateItemSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemSupplier }) =>
      itemSupplierService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: itemSupplierKeys.all });
      queryClient.invalidateQueries({
        queryKey: itemSupplierKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteItemSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemSupplierService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemSupplierKeys.all });
    },
  });
};

export const useDeleteMultipleItemSuppliers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemSupplierService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemSupplierKeys.all });
    },
  });
};

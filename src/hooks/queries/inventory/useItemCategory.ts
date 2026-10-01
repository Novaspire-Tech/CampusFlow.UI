import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemCategoryService } from '../../../services/inventory/itemCategoryService';
import type { ItemCategoryFormData } from '../../../types/inventory/ItemCategory';

export const itemCategoryKeys = {
  all: ['itemCategories'] as const,
  detail: (id: number) => ['itemCategories', id] as const,
};

export const useItemCategories = () => {
  return useQuery({
    queryKey: itemCategoryKeys.all,
    queryFn: itemCategoryService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useItemCategory = (id?: number) => {
  return useQuery({
    queryKey: id ? itemCategoryKeys.detail(id) : ['itemCategories', 'empty'],
    queryFn: () => (id ? itemCategoryService.getAll().then(list => list.find(cat => cat.itemCategoryId === id) ?? null) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAddItemCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ItemCategoryFormData) => itemCategoryService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemCategoryKeys.all });
    },
  });
};

export const useUpdateItemCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemCategoryFormData }) =>
      itemCategoryService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: itemCategoryKeys.all });
      queryClient.invalidateQueries({ queryKey: itemCategoryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteItemCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemCategoryService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemCategoryKeys.all });
    },
  });
};

export const useDeleteMultipleItemCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemCategoryService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemCategoryKeys.all });
    },
  });
};

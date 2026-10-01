import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  classFeesService,
  type ClassFeesSearchParams,
  EMPTY_CLASS_FEES_SEARCH_PARAMS,
} from '../../../services/feesCollection/classFeesService';
import type { ClassFeesDTO, GetClassFeesParams } from '../../../types/feesCollection/classFees';

//  Query Keys 

export const classFeesKeys = {
  all: ['classFees'] as const,

  list: (page: number, size: number, sortDirection: string) =>
    ['classFees', 'list', { page, size, sortDirection }] as const,

  filter: (
    params: ClassFeesSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ) =>
    ['classFees', 'filter', { ...params, page, size, sortBy, sortDirection }] as const,

  detail: (params: GetClassFeesParams) =>
    ['classFees', 'detail', params] as const,
};

//  Queries 

export const useClassFees = (page = 0, size = 10, sortDirection = 'asc') => {
  return useQuery({
    queryKey: classFeesKeys.list(page, size, sortDirection),
    queryFn:  () => classFeesService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};

export const useFilterClassFees = (
  params: ClassFeesSearchParams = EMPTY_CLASS_FEES_SEARCH_PARAMS,
  page = 0,
  size = 10,
  sortBy = 'classFeesId',
  sortDirection = 'asc'
) => {
  const hasFilters = !!(params.schoolClassId || params.feeTypeId);

  return useQuery({
    queryKey: classFeesKeys.filter(params, page, size, sortBy, sortDirection),
    queryFn:  () =>
      hasFilters
        ? classFeesService.filter(params, page, size, sortBy, sortDirection)
        : classFeesService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime:    5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};

export const useGetClassFees = (params: GetClassFeesParams, enabled = true) => {
  return useQuery({
    queryKey: classFeesKeys.detail(params),
    queryFn: async () => {
      try {
        return await classFeesService.get(params);
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: enabled && params.feeTypeIds.length > 0 && params.schoolClassId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    retry: (failureCount, error: any) =>
      error.response?.status === 404 ? false : failureCount < 3,
  });
};

//  Mutations 

export const useAddClassFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClassFeesDTO) => classFeesService.add(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classFees'] }),
  });
};

export const useUpdateClassFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClassFeesDTO }) =>
      classFeesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classFees'] }),
  });
};

export const useDeleteClassFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classFeesService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['classFees'] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ['classFees'] });
      return { snapshot };
    },
    onError: (_err, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['classFees'] }),
  });
};

export const useDeleteMultipleClassFees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classFeesService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['classFees'] });
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ['classFees'] });
      return { snapshot };
    },
    onError: (_err, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['classFees'] }),
  });
};
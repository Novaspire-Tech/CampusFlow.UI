import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookIssueReturnService } from '../../../services/library/bookIssueReturnService';
import type { BookIssueReturnFormData } from '../../../types/library/bookIssueReturn';

export const bookIssueReturnKeys = {
  all: ['bookIssueReturns'] as const,

  list: (page: number, size: number, sortDirection: string) =>
    [...bookIssueReturnKeys.all, 'list', { page, size, sortDirection }] as const,

  filter: (search: string, page: number, size: number, sortBy: string, sortDirection: string) =>
    [...bookIssueReturnKeys.all, 'filter', { search, page, size, sortBy, sortDirection }] as const,
};

export const useBookIssueReturns = (
  page = 0,
  size = 10,
  sortDirection: 'asc' | 'desc' = 'desc'
) =>
  useQuery({
    queryKey: bookIssueReturnKeys.list(page, size, sortDirection),
    queryFn: () => bookIssueReturnService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

export const useFilterBookIssueReturns = (
  search: string,
  page = 0,
  size = 10,
  sortBy = 'issueDate',
  sortDirection: 'asc' | 'desc' = 'desc'
) => {
  const hasSearch = search.trim().length > 0;

  return useQuery({
    queryKey: bookIssueReturnKeys.filter(search, page, size, sortBy, sortDirection),
    queryFn: () =>
      hasSearch
        ? bookIssueReturnService.filter(search, page, size, sortBy, sortDirection)
        : bookIssueReturnService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useAddBookIssueReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookIssueReturnFormData) =>
      bookIssueReturnService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookIssueReturnKeys.all });
    },
  });
};

export const useUpdateBookIssueReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BookIssueReturnFormData }) =>
      bookIssueReturnService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookIssueReturnKeys.all });
    },
  });
};

export const useDeleteBookIssueReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookIssueReturnService.delete(id),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: bookIssueReturnKeys.all });
      const snapshot = qc.getQueriesData<any>({ queryKey: bookIssueReturnKeys.all });
      return { snapshot };
    },

    onError: (_error, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: bookIssueReturnKeys.all });
    },
  });
};

export const useDeleteMultipleBookIssueReturns = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => bookIssueReturnService.deleteMultiple(ids),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: bookIssueReturnKeys.all });
      const snapshot = qc.getQueriesData<any>({ queryKey: bookIssueReturnKeys.all });
      return { snapshot };
    },

    onError: (_error, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: bookIssueReturnKeys.all });
    },
  });
};
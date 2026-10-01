import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { visitorBookService } from '../../../services/frontOffice/visitorBookService'
import type {
  VisitorBookFormData,
  VisitorBookSearchParams,
} from '../../../types/frontOffice/visitorBook'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const visitorBookKeys = {
  all: ['visitorBooks'] as const,

  list: (page: number, size: number, sortDirection: string, allSchool: boolean) =>
    ['visitorBooks', 'list', { page, size, sortDirection, allSchool }] as const,

  filter: (
    params: VisitorBookSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
  ) => ['visitorBooks', 'filter', { ...params, page, size, sortBy, sortDirection }] as const,

  detail: (id: string) => ['visitorBooks', id] as const,
}

// Paginated list
export const useVisitorBooks = (page = 0, size = 10, sortDirection: 'asc' | 'desc' = 'desc') => {
  return useQuery({
    queryKey: visitorBookKeys.list(page, size, sortDirection, isAllSchools()),
    queryFn: () => visitorBookService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

// Filter
export const useFilterVisitorBooks = (
  params: VisitorBookSearchParams,
  page = 0,
  size = 10,
  sortBy = 'date',
  sortDirection: 'asc' | 'desc' = 'desc',
) => {
  const hasFilters = !!(params.purposeId || params.search)

  return useQuery({
    queryKey: visitorBookKeys.filter(params, page, size, sortBy, sortDirection),
    queryFn: () =>
      hasFilters
        ? visitorBookService.filter(params, page, size, sortBy, sortDirection)
        : visitorBookService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

// Single record
export const useVisitorBook = (id?: string) => {
  return useQuery({
    queryKey: id ? visitorBookKeys.detail(id) : ['visitorBooks', 'empty'],
    queryFn: () => (id ? visitorBookService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Mutations
export const useCreateVisitorBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: VisitorBookFormData) => visitorBookService.create(data),
    onSuccess: (newVisitor) => {
      queryClient.invalidateQueries({ queryKey: ['visitorBooks'] })
      queryClient.setQueryData(visitorBookKeys.detail(newVisitor.id), newVisitor)
    },
    onError: (error: any) => {
      console.error('Error creating visitor book:', error)
    },
  })
}

export const useUpdateVisitorBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VisitorBookFormData }) =>
      visitorBookService.update(id, data),
    onSuccess: (updatedVisitor) => {
      queryClient.invalidateQueries({ queryKey: ['visitorBooks'] })
      queryClient.setQueryData(visitorBookKeys.detail(updatedVisitor.id), updatedVisitor)
    },
    onError: (error: any) => {
      console.error('Error updating visitor book:', error)
    },
  })
}

export const useDeleteVisitorBook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: visitorBookService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['visitorBooks'] })
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ['visitorBooks'] })
      return { snapshot }
    },
    onError: (_error, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['visitorBooks'] })
      queryClient.removeQueries({ queryKey: visitorBookKeys.detail(id) })
    },
  })
}

export const useDeleteMultipleVisitorBooks = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: visitorBookService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['visitorBooks'] })
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ['visitorBooks'] })
      return { snapshot }
    },
    onError: (_error, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: ['visitorBooks'] })
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: visitorBookKeys.detail(id) })
      })
    },
  })
}

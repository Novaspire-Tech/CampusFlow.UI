import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marksManagementService } from '../../../services/academics/marksManagementServices'

export const marksManagementKeys = {
  all: ['marksManagement'] as const,
  list: (page?: number, size?: number, sortDirection?: string) =>
    ['marksManagement', 'list', page, size, sortDirection] as const,
  detail: (id: number) => ['marksManagement', 'detail', id] as const,
}

export const useMarksManagements = (
  page: number = 0,
  size: number = 500,
  sortDirection: string = 'asc',
) => {
  return useQuery({
    queryKey: marksManagementKeys.list(page, size, sortDirection),
    queryFn: () => marksManagementService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  })
}

export const useCreateMarksManagement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => marksManagementService.create(data),
    onSuccess: () => {
      // Invalidate all marks queries so the list re-fetches immediately
      queryClient.invalidateQueries({ queryKey: marksManagementKeys.all })
    },
    onError: (error: any) => {
      console.error('Failed to create marks:', error)
    },
  })
}

export const useUpdateMarksManagement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      marksManagementService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: marksManagementKeys.all })
      queryClient.invalidateQueries({
        queryKey: marksManagementKeys.detail(Number(variables.id)),
      })
    },
    onError: (error: any) => {
      console.error('Failed to update marks:', error)
    },
  })
}

export const useDeleteMarksManagement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => marksManagementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marksManagementKeys.all })
    },
    onError: (error: any) => {
      console.error('Failed to delete marks:', error)
    },
  })
}

export const useDeleteMultipleMarksManagements = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => marksManagementService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marksManagementKeys.all })
    },
    onError: (error: any) => {
      console.error('Failed to delete multiple marks:', error)
    },
  })
}

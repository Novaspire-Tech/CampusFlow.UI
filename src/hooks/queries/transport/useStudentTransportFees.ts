import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentTransportFeesService } from '../../../services/transport/studentTransportFeesService'
import type {
  StudentTransportFees,
  StudentTransportFeesFormData,
  UpdateStudentTransportFeeFormData,
  UpdateTransportPaymentData,
  StudentTransportFeesFilterCriteria,
} from '../../../types/transport/studentTransportFees'

export const studentTransportFeesKeys = {
  all: ['studentTransportFees'] as const,
  lists: () => [...studentTransportFeesKeys.all, 'list'] as const,
  list: (page: number, size: number, sortBy?: string, sortDirection?: string) =>
    [...studentTransportFeesKeys.lists(), { page, size, sortBy, sortDirection }] as const,
  filtered: (
    criteria: StudentTransportFeesFilterCriteria,
    page: number,
    size: number,
    sortBy?: string,
    sortDirection?: string,
  ) =>
    [
      ...studentTransportFeesKeys.all,
      'filtered',
      { criteria, page, size, sortBy, sortDirection },
    ] as const,
}

export const useStudentTransportFees = (
  page = 0,
  size = 10,
  sortBy?: string,
  sortDirection: 'asc' | 'desc' = 'asc',
  enabled = true,
) => {
  return useQuery({
    queryKey: studentTransportFeesKeys.list(page, size, sortBy, sortDirection),
    queryFn: () => studentTransportFeesService.getAll(page, size, sortBy, sortDirection),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAllStudentTransportFees = (
  sortBy?: string,
  sortDirection: 'asc' | 'desc' = 'asc',
) =>
  useQuery({
    queryKey: [...studentTransportFeesKeys.all, 'all-pages', sortBy, sortDirection],
    queryFn: () => studentTransportFeesService.getAllPages(sortBy, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

export const useFilteredStudentTransportFees = (
  criteria: StudentTransportFeesFilterCriteria,
  page = 0,
  size = 10,
  sortBy?: string,
  sortDirection: 'asc' | 'desc' = 'asc',
  enabled = true,
) => {
  return useQuery({
    queryKey: studentTransportFeesKeys.filtered(criteria, page, size, sortBy, sortDirection),
    queryFn: () => studentTransportFeesService.filter(criteria, page, size, sortBy, sortDirection),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCreateStudentTransportFees = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StudentTransportFeesFormData) => studentTransportFeesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentTransportFeesKeys.all })
    },
  })
}

export const useDownloadStudentTemplate = () => {
  return useMutation({
    mutationFn: () => studentTransportFeesService.downloadExcelTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'students_template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: (error: any) => {
      console.error('Template download error:', error)
      throw error
    },
  })
}

export const useBulkUploadStudents = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => studentTransportFeesService.bulkUploadFromExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentTransportFeesKeys.all })
    },
  })
}

export const useUpdateTransportPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdateTransportPaymentData }) =>
      studentTransportFeesService.updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentTransportFeesKeys.all })
    },
  })
}

export const useUpdateStudentTransportFee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdateStudentTransportFeeFormData }) =>
      studentTransportFeesService.updateFee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentTransportFeesKeys.all })
    },
  })
}

export const useDeleteStudentTransportFees = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number | string) => studentTransportFeesService.delete(id),
    onMutate: async () => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: studentTransportFeesKeys.all,
      })
      const snapshot = queryClient.getQueriesData<{
        data: StudentTransportFees[]
      }>({ queryKey: studentTransportFeesKeys.lists() })
      return { snapshot }
    },
    onError: (_error, _id, context) => {
      // Rollback all list queries on failure
      context?.snapshot?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentTransportFeesKeys.all })
    },
  })
}

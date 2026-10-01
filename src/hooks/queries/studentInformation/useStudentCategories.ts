import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentCategoryService } from '../../../services/studentInformation/studentCategoryService'
import type { StudentCategory } from '../../../types/studentInformation/studentCategory'

export const studentCategoryKeys = {
  all: ['studentCategories'] as const,
  stats: ['studentCategories', 'stats'] as const,
}

export const useStudentCategories = () => {
  return useQuery({
    queryKey: studentCategoryKeys.all,
    queryFn: studentCategoryService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentCategoryStats = () => {
  return useQuery({
    queryKey: studentCategoryKeys.stats,
    queryFn: studentCategoryService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddStudentCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<StudentCategory, 'id' | 'createdDate'>) =>
      studentCategoryService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.stats })
    },
  })
}

export const useUpdateStudentCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentCategory }) =>
      studentCategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.stats })
    },
  })
}

export const useDeleteStudentCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn:  studentCategoryService.delete,


   onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.stats })
    },
  })
}

export const useDeleteMultipleStudentCategories = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn:  studentCategoryService.deleteMultiple,

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: studentCategoryKeys.stats })
    },
  })
}
 

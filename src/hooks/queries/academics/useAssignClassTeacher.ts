import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  assignClassTeacherService,
  type AssignClassTeacherSearchParams,
} from '../../../services/academics/assignClassTeacherService'
import type { AssignClassTeacherFormData } from '../../../types/academics/assignClassTeacher'

//  Query keys

export const assignClassTeacherKeys = {
  all: ['assignClassTeachers'] as const,

  list: (page: number, size: number, sortDirection: string) =>
    ['assignClassTeachers', 'list', { page, size, sortDirection }] as const,

  filter: (
    params: AssignClassTeacherSearchParams,
    page: number,
    size: number,
    sortDirection: string,
  ) => ['assignClassTeachers', 'filter', { ...params, page, size, sortDirection }] as const,

  detail: (id: string) => ['assignClassTeachers', 'detail', id] as const,
}

//  Queries

export const useAssignClassTeachers = (
  page = 0,
  size = 10,
  sortDirection: 'asc' | 'desc' = 'asc',
) =>
  useQuery({
    queryKey: assignClassTeacherKeys.list(page, size, sortDirection),
    queryFn: () => assignClassTeacherService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  })

export const useFilterAssignClassTeachers = (
  params: AssignClassTeacherSearchParams,
  page = 0,
  size = 10,
  sortDirection: 'asc' | 'desc' = 'asc',
) => {
  const hasFilters = !!(params.classId || params.sectionId || params.teacherId || params.search)

  return useQuery({
    queryKey: hasFilters
      ? assignClassTeacherKeys.filter(params, page, size, sortDirection)
      : assignClassTeacherKeys.list(page, size, sortDirection),

    queryFn: () =>
      hasFilters
        ? assignClassTeacherService.filter(params, page, size, '', sortDirection)
        : assignClassTeacherService.getAll(page, size, sortDirection),

    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  })
}

//  Mutations

export const useCreateAssignClassTeacher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignClassTeacherFormData) => assignClassTeacherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignClassTeacherKeys.all })
    },
    onError: (error: Error) => {
      console.error('Error assigning class teacher:', error.message)
    },
  })
}

export const useUpdateAssignClassTeacher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignClassTeacherFormData }) =>
      assignClassTeacherService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignClassTeacherKeys.all })
    },
    onError: (error: Error) => {
      console.error('Error updating class teacher:', error.message)
    },
  })
}

export const useDeleteAssignClassTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => assignClassTeacherService.delete(id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: assignClassTeacherKeys.all })
      return {
        snapshot: queryClient.getQueriesData<any>({ queryKey: assignClassTeacherKeys.all }),
      }
    },
    onError: (_err: Error, _id: string, ctx) => {
      ctx?.snapshot?.forEach(([key, data]: [any, any]) => queryClient.setQueryData(key, data))
    },
    onSettled: (_data: any, _err: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: assignClassTeacherKeys.all })
      queryClient.removeQueries({ queryKey: assignClassTeacherKeys.detail(id) })
    },
  })
}

export const useDeleteMultipleAssignClassTeachers = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => assignClassTeacherService.deleteMultiple(ids),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: assignClassTeacherKeys.all })
      return {
        snapshot: queryClient.getQueriesData<any>({ queryKey: assignClassTeacherKeys.all }),
      }
    },
    onError: (_err: Error, _ids: string[], ctx) => {
      ctx?.snapshot?.forEach(([key, data]: [any, any]) => queryClient.setQueryData(key, data))
    },
    onSettled: (_data: any, _err: any, ids: string[]) => {
      queryClient.invalidateQueries({ queryKey: assignClassTeacherKeys.all })
      ids.forEach((id) =>
        queryClient.removeQueries({ queryKey: assignClassTeacherKeys.detail(id) }),
      )
    },
  })
}

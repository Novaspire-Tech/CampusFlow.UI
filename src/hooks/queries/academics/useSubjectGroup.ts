import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  subjectGroupService,
  type SubjectGroupSearchParams,
} from '../../../services/academics/subjectGroupService'
import type { SubjectGroupFormData } from '../../../types/academics/subjectGroup'

export const subjectGroupKeys = {
  all: ['subjectGroups'] as const,

  list: (page: number, size: number, sortDirection: string) =>
    ['subjectGroups', 'list', { page, size, sortDirection }] as const,

  filter: (params: SubjectGroupSearchParams, page: number, size: number, sortDirection: string) =>
    ['subjectGroups', 'filter', { ...params, page, size, sortDirection }] as const,

  byClass: (classId: string) => ['subjectGroups', 'byClass', classId] as const,

  subjectsByGroup: (subjectGroupId: string) =>
    ['subjectGroups', 'subjects', subjectGroupId] as const,

  detail: (id: string) => ['subjectGroups', id] as const,
}

export const useSubjectGroups = (page = 0, size = 10, sortDirection: 'asc' | 'desc' = 'asc') => {
  return useQuery({
    queryKey: subjectGroupKeys.list(page, size, sortDirection),
    queryFn: () => subjectGroupService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

export const useFilterSubjectGroups = (
  params: SubjectGroupSearchParams,
  page = 0,
  size = 10,
  sortDirection: 'asc' | 'desc' = 'asc',
) => {
  const hasFilters = !!(
    params.classId ||
    params.subjectGroupName ||
    params.subjectId ||
    params.search
  )

  return useQuery({
    queryKey: subjectGroupKeys.filter(params, page, size, sortDirection),
    queryFn: () =>
      hasFilters
        ? subjectGroupService.filter(params, page, size, '', sortDirection)
        : subjectGroupService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

// Get all subject groups for a specific class
export const useSubjectGroupsByClass = (classId: string | undefined) => {
  return useQuery({
    queryKey: subjectGroupKeys.byClass(classId ?? ''),
    queryFn: () => subjectGroupService.getByClass(classId!),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Get subjects belonging to a specific subject group
export const useSubjectsByGroup = (subjectGroupId: string | undefined) => {
  return useQuery({
    queryKey: subjectGroupKeys.subjectsByGroup(subjectGroupId ?? ''),
    queryFn: () => subjectGroupService.getSubjectsByGroup(subjectGroupId!),
    enabled: !!subjectGroupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export const useCreateSubjectGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubjectGroupFormData) => subjectGroupService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectGroups'] })
    },
    onError: (error: any) => {
      console.error('Error creating subject group:', error)
    },
  })
}

export const useUpdateSubjectGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubjectGroupFormData }) =>
      subjectGroupService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectGroups'] })
    },
    onError: (error: any) => {
      console.error('Error updating subject group:', error)
    },
  })
}

export const useDeleteSubjectGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subjectGroupService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['subjectGroups'] })
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ['subjectGroups'] })
      return { snapshot }
    },
    onError: (_error: any, _id, context: any) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['subjectGroups'] })
      queryClient.removeQueries({ queryKey: subjectGroupKeys.detail(id) })
    },
  })
}

export const useDeleteMultipleSubjectGroups = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subjectGroupService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['subjectGroups'] })
      const snapshot = queryClient.getQueriesData<any>({ queryKey: ['subjectGroups'] })
      return { snapshot }
    },
    onError: (_error: any, _ids, context: any) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: ['subjectGroups'] })
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: subjectGroupKeys.detail(id) })
      })
    },
  })
}

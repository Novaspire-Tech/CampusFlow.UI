import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolClassService } from '../../../services/academics/classService'
import type { SchoolClass, SchoolClassFormData } from '../../../types/academics/class'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const schoolClassKeys = {
  all: ['schoolClasses'] as const,
  detail: (id: string) => ['schoolClasses', id] as const,
  bySession: (sessionId: string) => ['schoolClasses', 'session', sessionId] as const,
}

export const useSchoolClasses = () => {
  return useQuery({
    queryKey: [...schoolClassKeys.all, isAllSchools()],
    queryFn: schoolClassService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useSchoolClassesBySession = (sessionId?: string) => {
  return useQuery({
    queryKey: sessionId
      ? schoolClassKeys.bySession(sessionId)
      : [...schoolClassKeys.all, 'session', 'empty'],
    queryFn: () => (sessionId ? schoolClassService.getAllBySession(sessionId) : []),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useSchoolClassesSubjects = (id?: string) => {
  return useQuery({
    queryKey: id ? schoolClassKeys.detail(id) : ['schoolClasses', 'empty'],
    queryFn: () => (id ? schoolClassService.getAllSubjects(id) : []),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useSchoolClass = (id?: string) => {
  return useQuery({
    queryKey: id ? schoolClassKeys.detail(id) : ['schoolClasses', 'empty'],
    queryFn: () => (id ? schoolClassService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCreateSchoolClass = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SchoolClassFormData) => schoolClassService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolClassKeys.all })
    },

    onError: (error: any) => {
      console.error('Error creating class:', error)
    },
  })
}

export const useUpdateSchoolClass = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SchoolClassFormData }) =>
      schoolClassService.update(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: schoolClassKeys.all })
      queryClient.invalidateQueries({
        queryKey: schoolClassKeys.detail(variables.id),
      })
    },

    onError: (error: any) => {
      console.error('Error updating class:', error)
    },
  })
}

export const useDeleteSchoolClass = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: schoolClassService.delete,

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: schoolClassKeys.all })

      const previousClasses = queryClient.getQueryData<SchoolClass[]>(schoolClassKeys.all)

      queryClient.setQueryData<SchoolClass[]>(schoolClassKeys.all, (old = []) =>
        old.filter((item) => item.id !== id),
      )

      return { previousClasses }
    },

    onError: (error: any, _id, context) => {
      if (context?.previousClasses) {
        queryClient.setQueryData(schoolClassKeys.all, context.previousClasses)
      }
      console.error('Error deleting class:', error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: schoolClassKeys.all })
    },
  })
}

export const useDeleteMultipleSchoolClasses = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => schoolClassService.deleteMultiple(ids),

    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: schoolClassKeys.all })
      const previousClasses = queryClient.getQueryData<SchoolClass[]>(schoolClassKeys.all)

      queryClient.setQueryData<SchoolClass[]>(schoolClassKeys.all, (old = []) =>
        old.filter((item) => !ids.includes(item.id)),
      )

      return { previousClasses }
    },

    onSuccess: (data) => {
      return data
    },

    onError: (error: any, _ids, context) => {
      if (context?.previousClasses) {
        queryClient.setQueryData(schoolClassKeys.all, context.previousClasses)
      }
      console.error('Error deleting classes:', error)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: schoolClassKeys.all })
    },
  })
}

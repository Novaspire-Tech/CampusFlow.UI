import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '../../../services/academics/subjectService'
import type { SubjectListResponse } from '../../../services/academics/subjectService'
import type { SubjectFormData } from '../../../types/academics/subject'
import { toast } from 'react-toastify'

export const subjectKeys = {
  all: ['subjects'] as const,
  detail: (id: string) => ['subjects', id] as const,
}

export const useSubjects = () =>
  useQuery({
    queryKey: subjectKeys.all,
    queryFn: () => subjectService.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data: SubjectListResponse) => data.subjects,
  })

export const useCreateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubjectFormData) => subjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
      toast.success('Subject created successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating subject:', error)
      toast.error(error?.message ?? 'Failed to create subject')
    },
  })
}

export const useUpdateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubjectFormData }) =>
      subjectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
      toast.success('Subject updated successfully!')
    },
    onError: (error: any) => {
      console.error('Error updating subject:', error)
      toast.error(error?.message ?? 'Failed to update subject')
    },
  })
}

export const useDeleteSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => subjectService.delete(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: subjectKeys.all })
      const previousData = queryClient.getQueryData<SubjectListResponse>(subjectKeys.all)

      queryClient.setQueryData<SubjectListResponse>(subjectKeys.all, (old) => {
        if (!old) return old
        return {
          ...old,
          subjects: old.subjects.filter((s) => s.id !== id),
        }
      })

      return { previousData }
    },

    onSuccess: () => {
      toast.success('Subject deleted successfully!')
    },

    onError: (error: any, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(subjectKeys.all, context.previousData)
      }
      console.error('Error deleting subject:', error)
      toast.error(error?.message ?? 'Failed to delete subject')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
    },
  })
}

export const useDeleteMultipleSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => subjectService.deleteMultiple(ids),

    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: subjectKeys.all })
      const previousData = queryClient.getQueryData<SubjectListResponse>(subjectKeys.all)

      queryClient.setQueryData<SubjectListResponse>(subjectKeys.all, (old) => {
        if (!old) return old
        return {
          ...old,
          subjects: old.subjects.filter((s) => !ids.includes(s.id)),
        }
      })

      return { previousData }
    },

    onSuccess: () => {
      toast.success('Selected subjects deleted successfully!')
    },

    onError: (error: any, _ids, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(subjectKeys.all, context.previousData)
      }
      console.error('Error deleting subjects:', error)
      toast.error(error?.message ?? 'Failed to delete subjects')
    },

    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
      ids.forEach((id) => queryClient.removeQueries({ queryKey: subjectKeys.detail(id) }))
    },
  })
}

export const useDeleteAllSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => subjectService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
      toast.success('All subjects deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Error deleting all subjects:', error)
      toast.error(error?.message ?? 'Failed to delete all subjects')
    },
  })
}

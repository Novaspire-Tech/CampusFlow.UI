import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { referenceService } from '../../../../services/frontOffice/setupFrontOffice/referenceService'
import type { Reference } from '../../../../types/frontOffice/setupFrontOffice/reference'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const referenceKeys = {
  all: (isAll: boolean) => ['references', isAll] as const,
  detail: (id: string) => ['references', id] as const,
}

export const useReferences = () => {
  const allSchools = isAllSchools()

  return useQuery({
    queryKey: referenceKeys.all(allSchools),
    queryFn: referenceService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useReference = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? referenceKeys.detail(id) : ['references', 'empty'],
    queryFn: () => (id ? referenceService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
export const useAddReference = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Reference, 'id' | 'createdDate'>) => referenceService.create(data),

    onSuccess: (newData) => {
      const allSchools = isAllSchools()

      queryClient.setQueryData(referenceKeys.all(allSchools), (old: Reference[] = []) => [
        ...old,
        newData,
      ])

      queryClient.invalidateQueries({
        queryKey: referenceKeys.all(allSchools),
      })
    },

    onError: (error: any) => {
      console.error('Error creating reference:', error)
    },
  })
}

export const useUpdateReference = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Reference }) =>
      referenceService.update(id, data),

    onSuccess: (_data, variables) => {
      const allSchools = isAllSchools()

      queryClient.invalidateQueries({
        queryKey: referenceKeys.all(allSchools),
      })

      queryClient.invalidateQueries({
        queryKey: referenceKeys.detail(variables.id),
      })
    },

    onError: (error: any) => {
      console.error('Error updating reference:', error)
    },
  })
}

export const useDeleteReference = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: referenceService.delete,

    onMutate: async (id: string) => {
      const allSchools = isAllSchools()

      await queryClient.cancelQueries({
        queryKey: referenceKeys.all(allSchools),
      })

      const previousReferences = queryClient.getQueryData<Reference[]>(
        referenceKeys.all(allSchools),
      )

      queryClient.setQueryData<Reference[]>(referenceKeys.all(allSchools), (old = []) =>
        old.filter((reference) => reference.id !== id),
      )

      return { previousReferences, allSchools }
    },

    onError: (error: any, _id, context) => {
      if (context?.previousReferences) {
        queryClient.setQueryData(referenceKeys.all(context.allSchools), context.previousReferences)
      }
      console.error('Error deleting reference:', error)
    },

    onSettled: (_data, _error, _id, context) => {
      if (context?.allSchools !== undefined) {
        queryClient.invalidateQueries({
          queryKey: referenceKeys.all(context.allSchools),
        })
      }
    },
  })
}

export const useDeleteMultipleReferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: referenceService.deleteMultiple,

    onMutate: async (ids: string[]) => {
      const allSchools = isAllSchools()

      await queryClient.cancelQueries({
        queryKey: referenceKeys.all(allSchools),
      })

      const previousReferences = queryClient.getQueryData<Reference[]>(
        referenceKeys.all(allSchools),
      )

      queryClient.setQueryData<Reference[]>(referenceKeys.all(allSchools), (old = []) =>
        old.filter((reference) => !ids.includes(reference.id)),
      )

      return { previousReferences, allSchools }
    },

    onError: (error: any, _ids, context) => {
      if (context?.previousReferences) {
        queryClient.setQueryData(referenceKeys.all(context.allSchools), context.previousReferences)
      }
      console.error('Error deleting references:', error)
    },

    onSettled: (_data, _error, _ids, context) => {
      if (context?.allSchools !== undefined) {
        queryClient.invalidateQueries({
          queryKey: referenceKeys.all(context.allSchools),
        })
      }
    },
  })
}

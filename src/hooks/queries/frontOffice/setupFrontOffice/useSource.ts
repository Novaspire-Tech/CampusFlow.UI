import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sourceService } from '../../../../services/frontOffice/setupFrontOffice/sourceService'
import type { Source } from '../../../../types/frontOffice/setupFrontOffice/source'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const sourceKeys = {
  all: (isAll: boolean) => ['sources', isAll] as const,
  detail: (id: string) => ['sources', id] as const,
}

export const useSources = () => {
  const allSchools = isAllSchools()

  return useQuery({
    queryKey: sourceKeys.all(allSchools),
    queryFn: sourceService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
export const useSource = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? sourceKeys.detail(id) : ['sources', 'empty'],
    queryFn: () => (id ? sourceService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddSource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Source, 'id' | 'createdDate'>) => sourceService.create(data),

    onSuccess: (newData) => {
      const allSchools = isAllSchools()

      queryClient.setQueryData(sourceKeys.all(allSchools), (old: Source[] = []) => [
        ...old,
        newData,
      ])

      queryClient.invalidateQueries({
        queryKey: sourceKeys.all(allSchools),
      })
    },

    onError: (error: any) => {
      console.error('Error creating source:', error)
    },
  })
}
export const useUpdateSource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Source }) => sourceService.update(id, data),

    onSuccess: (_data, variables) => {
      const allSchools = isAllSchools()

      queryClient.invalidateQueries({
        queryKey: sourceKeys.all(allSchools),
      })

      queryClient.invalidateQueries({
        queryKey: sourceKeys.detail(variables.id),
      })
    },

    onError: (error: any) => {
      console.error('Error updating source:', error)
    },
  })
}

export const useDeleteSource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sourceService.delete,

    onMutate: async (id: string) => {
      const allSchools = isAllSchools()

      await queryClient.cancelQueries({
        queryKey: sourceKeys.all(allSchools),
      })

      const previousSources = queryClient.getQueryData<Source[]>(sourceKeys.all(allSchools))
      queryClient.setQueryData<Source[]>(sourceKeys.all(allSchools), (old = []) =>
        old.filter((source) => source.id !== id),
      )

      return { previousSources, allSchools }
    },

    onError: (error: any, _id, context) => {
      if (context?.previousSources) {
        queryClient.setQueryData(sourceKeys.all(context.allSchools), context.previousSources)
      }
      console.error('Error deleting source:', error)
    },

    onSettled: (_data, _error, _id, context) => {
      if (context?.allSchools !== undefined) {
        queryClient.invalidateQueries({
          queryKey: sourceKeys.all(context.allSchools),
        })
      }
    },
  })
}
export const useDeleteMultipleSources = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sourceService.deleteMultiple,

    onMutate: async (ids: string[]) => {
      const allSchools = isAllSchools()

      await queryClient.cancelQueries({
        queryKey: sourceKeys.all(allSchools),
      })

      const previousSources = queryClient.getQueryData<Source[]>(sourceKeys.all(allSchools))

      queryClient.setQueryData<Source[]>(sourceKeys.all(allSchools), (old = []) =>
        old.filter((source) => !ids.includes(source.id)),
      )

      return { previousSources, allSchools }
    },

    onError: (error: any, _ids, context) => {
      if (context?.previousSources) {
        queryClient.setQueryData(sourceKeys.all(context.allSchools), context.previousSources)
      }
      console.error('Error deleting sources:', error)
    },

    onSettled: (_data, _error, _ids, context) => {
      if (context?.allSchools !== undefined) {
        queryClient.invalidateQueries({
          queryKey: sourceKeys.all(context.allSchools),
        })
      }
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { disableReasonService } from '../../../services/studentInformation/disableReasonService'
import type { DisableReason } from '../../../types/studentInformation/disableReason'

export const disableReasonKeys = {
  all: ['disableReasons'] as const,
  stats: ['disableReasons', 'stats'] as const,
}

export const useDisableReasons = () => {
  return useQuery({
    queryKey: disableReasonKeys.all,
    queryFn: disableReasonService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useDisableReasonStats = () => {
  return useQuery({
    queryKey: disableReasonKeys.stats,
    queryFn: disableReasonService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddDisableReason = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<DisableReason, 'id' | 'createdDate'>) =>
      disableReasonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.all })
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.stats })
    },
  })
}

export const useUpdateDisableReason = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DisableReason }) =>
      disableReasonService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.all })
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.stats })
    },
  })
}

export const useDeleteDisableReason = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => disableReasonService.delete(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: disableReasonKeys.all })
      const previousReasons = queryClient.getQueryData<DisableReason[]>(disableReasonKeys.all)
      queryClient.setQueryData<DisableReason[]>(disableReasonKeys.all, (old = []) =>
        old.filter((r) => r.id !== id),
      )
      return { previousReasons }
    },

    onError: (_error, _id, context) => {
      if (context?.previousReasons) {
        queryClient.setQueryData(disableReasonKeys.all, context.previousReasons)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.all })
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.stats })
    },
  })
}

export const useDeleteMultipleDisableReasons = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => disableReasonService.deleteMultiple(ids),

    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: disableReasonKeys.all })
      const previousReasons = queryClient.getQueryData<DisableReason[]>(disableReasonKeys.all)
      queryClient.setQueryData<DisableReason[]>(disableReasonKeys.all, (old = []) =>
        old.filter((r) => !ids.includes(r.id)),
      )
      return { previousReasons }
    },

    onError: (_error, _ids, context) => {
      if (context?.previousReasons) {
        queryClient.setQueryData(disableReasonKeys.all, context.previousReasons)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.all })
      queryClient.invalidateQueries({ queryKey: disableReasonKeys.stats })
    },
  })
}
 

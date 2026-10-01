import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../../../services/systemSettinds/SessionSettingServices'
import type { Session } from '../../../types/systemSettinds/SessionSetting'

export const sessionKeys = {
  all: ['sessions'] as const,
  detail: (id: string) => ['sessions', id] as const,
  stats: ['sessions', 'stats'] as const,
}

export const useSessions = () => {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: () => sessionService.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useSessionStats = () => {
  return useQuery({
    queryKey: sessionKeys.stats,
    queryFn: sessionService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Session, 'sessionId'>) => sessionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats })
    },
  })
}

export const useUpdateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Session }) => sessionService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats })
    },
  })
}

export const useChangeCurrentSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionService.changeCurrentSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats })
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats })
    },
  })
}

export const useDeleteMultipleSessions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => sessionService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats })
    },
  })
}
 

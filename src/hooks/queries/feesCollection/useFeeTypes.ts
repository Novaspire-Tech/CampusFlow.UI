import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feeTypeService } from '../../../services/feesCollection/feeTypeService'
import type { FeeType, FeeTypeCreateInput } from '../../../types/feesCollection/feeType'

export const feeTypeKeys = {
  all: ['feeTypes'] as const,
  detail: (id: string) => ['feeTypes', id] as const,
  stats: ['feeTypes', 'stats'] as const,
}


export const useFeeTypes = () => {
  return useQuery<FeeType[]>({
    queryKey: feeTypeKeys.all,
    queryFn: () => feeTypeService.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useFeeType = (id: string | undefined) => {
  return useQuery<FeeType | null>({

    queryKey: feeTypeKeys.detail(id ?? ''),
    queryFn: () => feeTypeService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useFeeTypeStats = () => {
  return useQuery({
    queryKey: feeTypeKeys.stats,
    queryFn: feeTypeService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddFeeType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FeeTypeCreateInput) => feeTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.all })
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.stats })
    },
  })
}

export const useUpdateFeeType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeeType }) =>
      feeTypeService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.all })
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.stats })
    },
  })
}

export const useDeleteFeeType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => feeTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.all })
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.stats })
    },
  })
}

export const useDeleteMultipleFeeTypes = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => feeTypeService.deleteMultiple(ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.all })
      queryClient.invalidateQueries({ queryKey: feeTypeKeys.stats })
    },
  })
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pickupPointService } from '../../../services/transport/pickupPointService'
import type { PickupPointFormData } from '../../../types/transport/pickupPoint'

export const pickupPointKeys = {
  all: ['pickupPoints'] as const,
  detail: (id: string) => ['pickupPoints', id] as const,
}

export const usePickupPoints = () => {
  return useQuery({
    queryKey: pickupPointKeys.all,
    queryFn: pickupPointService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Mutation for adding a pickup point
export const useAddPickupPoint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PickupPointFormData) => pickupPointService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.all })
    },
  })
}

export const useUpdatePickupPoint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PickupPointFormData }) =>
      pickupPointService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.all })
    },
  })
}

export const useDeletePickupPoint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pickupPointService.delete(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.all })
    },
  })
}

export const useDeleteMultiplePickupPoints = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: pickupPointService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.all })
    },
  })
}

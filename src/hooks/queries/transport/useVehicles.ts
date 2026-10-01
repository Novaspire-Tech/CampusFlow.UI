import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehicleService } from '../../../services/transport/vehicleService'
import type { VehicleFormData } from '../../../types/transport/vehicle'
// import { toast } from 'react-toastify';

export const vehicleKeys = {
  all: ['vehicles'] as const,
  detail: (id: string) => ['vehicles', id] as const,
}

export const useVehicles = () => {
  return useQuery({
    queryKey: vehicleKeys.all,
    queryFn: vehicleService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export const useAddVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VehicleFormData) => vehicleService.create(data),
    onSuccess: (newVehicle) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      console.log('Vehicle created successfully:', newVehicle)
    },
    onError: (error: any) => {
      console.error('Failed to create vehicle:', error)
      // const errorMessage = error?.message || 'Failed to create vehicle';
      // toast.error(errorMessage);
    },
  })
}

// Mutation for updating a vehicle
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VehicleFormData }) =>
      vehicleService.update(id, data),
    onSuccess: (updatedVehicle, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) })
      console.log('Vehicle updated successfully:', updatedVehicle)
    },
    onError: (error: any) => {
      console.error('Failed to update vehicle:', error)
      // const errorMessage = error?.message || 'Failed to update vehicle';
      // toast.error(errorMessage);
    },
  })
}

export const useUpdateDriverDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      vehicleService.updateDocument(id, file),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) })
      console.log('Document updated successfully for vehicle:', variables.id)
    },

    onError: (error: any) => {
      console.error('Failed to update driver document:', error)
      // const errorMessage = error?.message || 'Failed to update driver document';
      // toast.error(errorMessage);
    },
  })
}

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vehicleService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      queryClient.removeQueries({ queryKey: vehicleKeys.detail(deletedId) })
      console.log('Vehicle deleted successfully:', deletedId)
    },
    onError: (error: any) => {
      console.error('Failed to delete vehicle:', error)
      // const errorMessage = error?.message || 'Failed to delete vehicle';
      // toast.error(errorMessage);
    },
  })
}

// Mutation for deleting multiple vehicles
export const useDeleteMultipleVehicles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vehicleService.deleteMultiple,
    onSuccess: (_, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      deletedIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: vehicleKeys.detail(id) })
      })
      console.log('Multiple vehicles deleted successfully:', deletedIds)
    },
    onError: (error: any) => {
      console.error('Failed to delete multiple vehicles:', error)
      // const errorMessage = error?.message || 'Failed to delete multiple vehicles';
      // toast.error(errorMessage);
    },
  })
}

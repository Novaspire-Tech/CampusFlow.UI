import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignVehicleService } from '../../../services/transport/assignVehicleService'
import type { AssignVehicle, AssignVehicleFormData } from '../../../types/transport/assignVehicle'

export const assignVehicleKeys = {
  all: ['assignVehicles'] as const,
  detail: (id: string) => ['assignVehicles', id] as const,
}

// QUERIES
export const useAssignVehicles = () => {
  return useQuery({
    queryKey: assignVehicleKeys.all,
    queryFn: assignVehicleService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// MUTATIONS
export const useCreateAssignVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AssignVehicleFormData) => assignVehicleService.create(data),
    onSuccess: () => {
      // Invalidate to refetch from server with correct data
      queryClient.invalidateQueries({ queryKey: assignVehicleKeys.all })
    },
    onError: (error: any) => {
      console.error('Error assigning vehicle:', error)
      // alert(error.message || 'Failed to assign vehicle');
    },
  })
}

export const useUpdateAssignVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignVehicleFormData }) =>
      assignVehicleService.update(id, data),
    onSuccess: () => {
      // Invalidate to refetch from server with correct data
      queryClient.invalidateQueries({ queryKey: assignVehicleKeys.all })
    },
    onError: (error: any) => {
      console.error('Error updating vehicle assignment:', error)
      alert(error.message || 'Failed to update vehicle assignment')
    },
  })
}

export const useDeleteAssignVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignVehicleService.delete,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: assignVehicleKeys.all })

      const previousAssignments = queryClient.getQueryData<AssignVehicle[]>(assignVehicleKeys.all)

      queryClient.setQueryData<AssignVehicle[]>(assignVehicleKeys.all, (old = []) =>
        old.filter((assignment) => assignment.id !== id),
      )

      return { previousAssignments }
    },
    onError: (error: any, _id, context) => {
      if (context?.previousAssignments) {
        queryClient.setQueryData(assignVehicleKeys.all, context.previousAssignments)
      }
      console.error('Error deleting vehicle assignment:', error)
      alert(error.message || 'Failed to delete vehicle assignment')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: assignVehicleKeys.all })
    },
  })
}

export const useDeleteMultipleAssignVehicles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignVehicleService.deleteMultiple,
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: assignVehicleKeys.all })

      const previousAssignments = queryClient.getQueryData<AssignVehicle[]>(assignVehicleKeys.all)

      queryClient.setQueryData<AssignVehicle[]>(assignVehicleKeys.all, (old = []) =>
        old.filter((assignment) => !ids.includes(assignment.id)),
      )

      return { previousAssignments }
    },
    onError: (error: any, _ids, context) => {
      if (context?.previousAssignments) {
        queryClient.setQueryData(assignVehicleKeys.all, context.previousAssignments)
      }
      console.error('Error deleting vehicle assignments:', error)
      alert(error.message || 'Failed to delete vehicle assignments')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: assignVehicleKeys.all })
    },
  })
}

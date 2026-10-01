import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purposeService } from '../../../../services/frontOffice/setupFrontOffice/purposeService'
import type { Purpose } from '../../../../types/frontOffice/setupFrontOffice/purpose'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const purposeKeys = {
  all: ['purposes'] as const,
  detail: (id: string) => ['purposes', id] as const,
}

export const usePurposes = () => {
  return useQuery({
    queryKey: [...purposeKeys.all, isAllSchools()],
    queryFn: purposeService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const usePurpose = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? purposeKeys.detail(id) : ['purposes', 'empty'],
    queryFn: () => (id ? purposeService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddPurpose = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Purpose, 'id' | 'createdDate'>) => purposeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purposeKeys.all })
    },
    onError: (error: any) => {
      console.error('Error creating purpose:', error)
    },
  })
}

export const useUpdatePurpose = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Purpose }) => purposeService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: purposeKeys.all })
      queryClient.invalidateQueries({ queryKey: purposeKeys.detail(variables.id) })
    },
    onError: (error: any) => {
      console.error('Error updating purpose:', error)
    },
  })
}

export const useDeletePurpose = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purposeService.delete,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: purposeKeys.all })
      const previousPurposes = queryClient.getQueryData<Purpose[]>(purposeKeys.all)
      queryClient.setQueryData<Purpose[]>(purposeKeys.all, (old = []) =>
        old.filter((purpose) => purpose.id !== id),
      )
      return { previousPurposes }
    },
    onError: (error: any, _id, context) => {
      if (context?.previousPurposes) {
        queryClient.setQueryData(purposeKeys.all, context.previousPurposes)
      }
      console.error('Error deleting purpose:', error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: purposeKeys.all })
    },
  })
}

export const useDeleteMultiplePurposes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purposeService.deleteMultiple,
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: purposeKeys.all })
      const previousPurposes = queryClient.getQueryData<Purpose[]>(purposeKeys.all)
      queryClient.setQueryData<Purpose[]>(purposeKeys.all, (old = []) =>
        old.filter((purpose) => !ids.includes(purpose.id)),
      )
      return { previousPurposes }
    },
    onError: (error: any, _ids, context) => {
      if (context?.previousPurposes) {
        queryClient.setQueryData(purposeKeys.all, context.previousPurposes)
      }
      console.error('Error deleting purposes:', error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: purposeKeys.all })
    },
  })
}

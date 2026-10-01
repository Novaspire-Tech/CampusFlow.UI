import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complaintTypeService } from '../../../../services/frontOffice/setupFrontOffice/complaintTypeService'
import type { ComplaintType } from '../../../../types/frontOffice/setupFrontOffice'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const complaintTypeKeys = {
  all: (isAll: boolean) => ['complaintTypes', isAll] as const,
  detail: (id: string) => ['complaintTypes', id] as const,
}

export const useComplaintTypes = () => {
  const allSchools = isAllSchools()

  return useQuery({
    queryKey: complaintTypeKeys.all(allSchools),
    queryFn: complaintTypeService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useComplaintType = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? complaintTypeKeys.detail(id) : ['complaintTypes', 'empty'],
    queryFn: () => (id ? complaintTypeService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
export const useAddComplaintType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<ComplaintType, 'id' | 'createdDate'>) =>
      complaintTypeService.create(data),

    onSuccess: (newData) => {
      const allSchools = isAllSchools()

      queryClient.setQueryData(complaintTypeKeys.all(allSchools), (old: ComplaintType[] = []) => [
        ...old,
        newData,
      ])

      queryClient.invalidateQueries({
        queryKey: complaintTypeKeys.all(allSchools),
      })
    },

    onError: (error: any) => {
      console.error('Error creating complaint type:', error)
    },
  })
}
export const useUpdateComplaintType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ComplaintType }) =>
      complaintTypeService.update(id, data),

    onSuccess: (_data, variables) => {
      const allSchools = isAllSchools()

      queryClient.invalidateQueries({
        queryKey: complaintTypeKeys.all(allSchools),
      })

      queryClient.invalidateQueries({
        queryKey: complaintTypeKeys.detail(variables.id),
      })
    },

    onError: (error: any) => {
      console.error('Error updating complaint type:', error)
    },
  })
}

export const useDeleteComplaintType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: complaintTypeService.delete,

    onMutate: async (id: string) => {
      const allSchools = isAllSchools()

      await queryClient.cancelQueries({
        queryKey: complaintTypeKeys.all(allSchools),
      })

      const previousTypes = queryClient.getQueryData<ComplaintType[]>(
        complaintTypeKeys.all(allSchools),
      )

      queryClient.setQueryData<ComplaintType[]>(complaintTypeKeys.all(allSchools), (old = []) =>
        old.filter((type) => type.id !== id),
      )

      return { previousTypes, allSchools }
    },

    onError: (error: any, _id, context) => {
      if (context?.previousTypes) {
        queryClient.setQueryData(complaintTypeKeys.all(context.allSchools), context.previousTypes)
      }
      console.error('Error deleting complaint type:', error)
    },

    onSettled: (_data, _error, _id, context) => {
      if (context?.allSchools !== undefined) {
        queryClient.invalidateQueries({
          queryKey: complaintTypeKeys.all(context.allSchools),
        })
      }
    },
  })
}

export const useDeleteMultipleComplaintTypes = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: complaintTypeService.deleteMultiple,

    onMutate: async (ids: string[]) => {
      const allSchools = isAllSchools()

      await queryClient.cancelQueries({
        queryKey: complaintTypeKeys.all(allSchools),
      })

      const previousTypes = queryClient.getQueryData<ComplaintType[]>(
        complaintTypeKeys.all(allSchools),
      )

      queryClient.setQueryData<ComplaintType[]>(complaintTypeKeys.all(allSchools), (old = []) =>
        old.filter((type) => !ids.includes(type.id)),
      )

      return { previousTypes, allSchools }
    },

    onError: (error: any, _ids, context) => {
      if (context?.previousTypes) {
        queryClient.setQueryData(complaintTypeKeys.all(context.allSchools), context.previousTypes)
      }
      console.error('Error deleting complaint types:', error)
    },

    onSettled: (_data, _error, _ids, context) => {
      if (context?.allSchools !== undefined) {
        queryClient.invalidateQueries({
          queryKey: complaintTypeKeys.all(context.allSchools),
        })
      }
    },
  })
}

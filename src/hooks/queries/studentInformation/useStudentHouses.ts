import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentHouseService } from '../../../services/studentInformation/studentHouseService'
import type { StudentHouse } from '../../../types/studentInformation/studentHouse'

export const studentHouseKeys = {
  all: ['studentHouses'] as const,
  detail: (id: string) => ['studentHouses', id] as const,
  stats: ['studentHouses', 'stats'] as const,
}

export const useStudentHouses = () => {
  return useQuery({
    queryKey: studentHouseKeys.all,
    queryFn: studentHouseService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentHouse = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? studentHouseKeys.detail(id) : ['studentHouses', 'empty'],
    queryFn: () => (id ? studentHouseService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentHouseStats = () => {
  return useQuery({
    queryKey: studentHouseKeys.stats,
    queryFn: studentHouseService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddStudentHouse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<StudentHouse, 'id' | 'createdDate'>) =>
      studentHouseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.all })
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.stats })
    },
  })
}

export const useUpdateStudentHouse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentHouse }) =>
      studentHouseService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.all })
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.stats })
    },
  })
}

export const useDeleteStudentHouse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentHouseService.delete,

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: studentHouseKeys.all })
      const previousHouses = queryClient.getQueryData<StudentHouse[]>(studentHouseKeys.all)
      queryClient.setQueryData<StudentHouse[]>(studentHouseKeys.all, (old = []) =>
        old.filter((h) => h.id !== id),
      )
      return { previousHouses }
    },

    onError: (_error, _id, context) => {
      if (context?.previousHouses) {
        queryClient.setQueryData(studentHouseKeys.all, context.previousHouses)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.all })
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.stats })
    },
  })
}

export const useDeleteMultipleStudentHouses = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentHouseService.deleteMultiple,

    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: studentHouseKeys.all })
      const previousHouses = queryClient.getQueryData<StudentHouse[]>(studentHouseKeys.all)
      queryClient.setQueryData<StudentHouse[]>(studentHouseKeys.all, (old = []) =>
        old.filter((h) => !ids.includes(h.id)),
      )
      return { previousHouses }
    },

    onError: (_error, _ids, context) => {
      if (context?.previousHouses) {
        queryClient.setQueryData(studentHouseKeys.all, context.previousHouses)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.all })
      queryClient.invalidateQueries({ queryKey: studentHouseKeys.stats })
    },
  })
}
 

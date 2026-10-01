import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentService } from '../../../services/academics/departmentsService'
import type { DepartmentFormData } from '../../../types/academics/departments'
const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'
const getCodesAvailable = (): boolean => !!localStorage.getItem('schoolGroupCode')

export const departmentKeys = {
  all: ['departments'] as const,

  list: (allSchools: boolean, page: number, size: number) =>
    ['departments', 'list', allSchools, page, size] as const,
  detail: (id: string) => ['departments', id] as const,
  byClass: (classId: number) => ['departments', 'byClass', classId] as const,
}

export const useDepartments = (page = 0, size = 10) => {
  return useQuery({
    queryKey: departmentKeys.list(isAllSchools(), page, size),

    queryFn: () => departmentService.getAll(page, size),

    enabled: getCodesAvailable(),

    staleTime: 5 * 60 * 1000,

    gcTime: 10 * 60 * 1000,

    retry: 2,

    refetchOnWindowFocus: false,
  })
}

export const useDepartment = (id?: string) => {
  return useQuery({
    queryKey: id ? departmentKeys.detail(id) : ['departments', 'empty'],

    queryFn: () => (id ? departmentService.getById(id) : null),

    enabled: !!id && getCodesAvailable(),

    staleTime: 5 * 60 * 1000,

    gcTime: 10 * 60 * 1000,

    retry: 2,

    refetchOnWindowFocus: false,
  })
}

export const useDepartmentsByClassId = (classId?: number) => {
  return useQuery({
    queryKey: classId ? departmentKeys.byClass(classId) : ['departments', 'byClass', null],

    queryFn: () => departmentService.getByClassId(classId!),

    enabled: !!classId && getCodesAvailable(),

    staleTime: 5 * 60 * 1000,

    gcTime: 10 * 60 * 1000,

    retry: 2,

    refetchOnWindowFocus: false,
  })
}

export const useCreateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DepartmentFormData) => departmentService.create(data),

    onSuccess: (newDepartment) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })

      if (newDepartment?.id) {
        queryClient.setQueryData(departmentKeys.detail(newDepartment.id), newDepartment)
      }
    },
  })
}

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormData }) =>
      departmentService.update(id, data),

    onSuccess: (_updatedDepartment, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })

      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) })
    },
  })
}

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: departmentService.delete,

    onError: (_error, _id, context: any) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(['departments'], context.previousDepartments)
      }
    },

    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })

      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) })
    },
  })
}

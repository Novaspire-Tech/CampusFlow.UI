import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolService } from '../../../services/superAdmin/schoolservice'
import type {
  SchoolCompleteRegistrationRequest,
  UpdateSchoolRequestDto,
  FilterSchoolRequest,
  AddSchoolToGroupRequest,
} from '../../../types/superAdmin/School'

export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  filtered: (dto: object) => [...schoolKeys.all, 'filter', dto] as const,
  detail: (groupCode: string, code: string) =>
    [...schoolKeys.all, 'detail', groupCode, code] as const,
  byGroup: (groupCode: string, page: number, size: number) =>
    [...schoolKeys.all, 'byGroup', groupCode, page, size] as const,
}

export const useSchoolsByGroup = (schoolGroupCode: string, page: number = 0, size: number = 10) =>
  useQuery({
    queryKey: schoolKeys.byGroup(schoolGroupCode, page, size),
    queryFn: () => schoolService.getAllByGroup(schoolGroupCode),
    enabled: Boolean(schoolGroupCode),
    staleTime: 2 * 60 * 1000,
  })

export const useSchool = (schoolGroupCode: string, schoolCode: string) =>
  useQuery({
    queryKey: schoolKeys.detail(schoolGroupCode, schoolCode),
    queryFn: () => schoolService.getByCode(schoolGroupCode, schoolCode),
    enabled: Boolean(schoolGroupCode) && Boolean(schoolCode),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

export const useSchools = () =>
  useQuery({
    queryKey: schoolKeys.lists(),
    queryFn: () => schoolService.getAll(),
    staleTime: 2 * 60 * 1000,
  })

export const useFilterSchools = (dto: FilterSchoolRequest) =>
  useQuery({
    queryKey: schoolKeys.filtered(dto),
    queryFn: () => schoolService.filter(dto),
    staleTime: 60 * 1000,
  })

export const useAddSchoolToGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      schoolGroupCode,
      data,
    }: {
      schoolGroupCode: string
      data: AddSchoolToGroupRequest
    }) => schoolService.addToGroup(schoolGroupCode, data),
    onSuccess: (_result, { schoolGroupCode }) => {
      qc.invalidateQueries({ queryKey: [...schoolKeys.all, 'byGroup', schoolGroupCode] })
      qc.invalidateQueries({ queryKey: schoolKeys.lists() })
    },
    onError: (err: any) => console.error('[useAddSchoolToGroup]', err?.message ?? err),
  })
}

export const useRegisterSchool = () => {
  const qc = useQueryClient()
  const schoolGroupCode = localStorage.getItem('schoolGroupCode') ?? ''
  return useMutation({
    mutationFn: (data: SchoolCompleteRegistrationRequest) => schoolService.register(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...schoolKeys.all, 'byGroup', schoolGroupCode] })
      qc.invalidateQueries({ queryKey: schoolKeys.lists() })
    },
    onError: (err: any) => console.error('[useRegisterSchool]', err?.message ?? err),
  })
}

export const useUpdateSchool = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      schoolGroupCode,
      schoolCode,
      data,
    }: {
      schoolGroupCode: string
      schoolCode: string
      data: UpdateSchoolRequestDto
    }) => schoolService.update(schoolGroupCode, schoolCode, data),
    onSuccess: (_result, { schoolGroupCode, schoolCode }) => {
      qc.invalidateQueries({ queryKey: schoolKeys.lists() })
      qc.invalidateQueries({ queryKey: [...schoolKeys.all, 'byGroup', schoolGroupCode] })
      qc.invalidateQueries({ queryKey: schoolKeys.detail(schoolGroupCode, schoolCode) })
      qc.invalidateQueries({ queryKey: [...schoolKeys.all, 'byGroup', schoolGroupCode] })
    },
    onError: (err: any) => console.error('[useUpdateSchool]', err?.message ?? err),
  })
}

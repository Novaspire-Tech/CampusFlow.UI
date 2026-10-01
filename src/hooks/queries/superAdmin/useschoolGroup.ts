import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { schoolGroupService } from '../../../services/superAdmin/schoolGroupService'
import type {
  CreateSchoolGroupRequest,
  UpdateSchoolGroupRequestDto,
  FilterSchoolGroupRequestDTO,
  AssignSubscriptionRequestDto,
} from '../../../types/superAdmin/SchoolGroup'

export const schoolGroupKeys = {
  all: ['schoolGroups'] as const,
  lists: () => [...schoolGroupKeys.all, 'list'] as const,
  list: (params: object) => [...schoolGroupKeys.lists(), params] as const,
  filtered: (dto: object, p: object) => [...schoolGroupKeys.all, 'filter', dto, p] as const,
  detail: (code: string) => [...schoolGroupKeys.all, 'detail', code] as const,
  schools: (code: string, p: object) => [...schoolGroupKeys.all, 'schools', code, p] as const,
  featureCodes: (code: string) => [...schoolGroupKeys.all, 'featureCodes', code] as const,
  analytics: () => [...schoolGroupKeys.all, 'analytics'] as const,
  dashboard: () => [...schoolGroupKeys.all, 'dashboard'] as const,
  byYear: (year: number) => [...schoolGroupKeys.all, 'byYear', year] as const,
  summary: () => [...schoolGroupKeys.all, 'summary'] as const,
}

export interface PageParams {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export const useSchoolGroup = (schoolGroupCode: string) =>
  useQuery({
    queryKey: schoolGroupKeys.detail(schoolGroupCode),
    queryFn: () => schoolGroupService.getByCode(schoolGroupCode),
    enabled: Boolean(schoolGroupCode),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

export const useSchoolGroups = (params: PageParams = {}) =>
  useQuery({
    queryKey: schoolGroupKeys.list(params),
    queryFn: () => schoolGroupService.getAll(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

export const useFilterSchoolGroups = (
  dto: FilterSchoolGroupRequestDTO,
  params: PageParams = {},
  enabled = false,
) =>
  useQuery({
    queryKey: schoolGroupKeys.filtered(dto, params),
    queryFn: () => schoolGroupService.filter(dto, params),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 1,
  })

export const useSchoolsByGroup = (schoolGroupCode: string, params: PageParams = {}) =>
  useQuery({
    queryKey: schoolGroupKeys.schools(schoolGroupCode, params),
    queryFn: () => schoolGroupService.getSchoolsByGroup(schoolGroupCode, params),
    enabled: Boolean(schoolGroupCode),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

export const useTenantRegistry = () =>
  useQuery({
    queryKey: [...schoolGroupKeys.all, 'tenantRegistry'] as const,
    queryFn: () => schoolGroupService.getTenantRegistry(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

export const useFeatureCodes = (schoolGroupCode: string) =>
  useQuery({
    queryKey: schoolGroupKeys.featureCodes(schoolGroupCode),
    queryFn: () => schoolGroupService.getFeatureCodes(schoolGroupCode),
    enabled: Boolean(schoolGroupCode),
    staleTime: 5 * 60 * 1000,
  })

export const useSchoolGroupAnalytics = () =>
  useQuery({
    queryKey: schoolGroupKeys.analytics(),
    queryFn: () => schoolGroupService.getAnalytics(),
    staleTime: 60 * 1000,
  })

export const useSuperAdminDashboard = () =>
  useQuery({
    queryKey: schoolGroupKeys.dashboard(),
    queryFn: () => schoolGroupService.getDashboard(),
    staleTime: 60 * 1000,
  })

export const useSchoolGroupsByYear = (year: number) =>
  useQuery({
    queryKey: schoolGroupKeys.byYear(year),
    queryFn: () => schoolGroupService.getByYear(year),
    enabled: Boolean(year),
    staleTime: 5 * 60 * 1000,
  })

export const useSchoolGroupSummary = () =>
  useQuery({
    queryKey: schoolGroupKeys.summary(),
    queryFn: () => schoolGroupService.getSummary(),
    staleTime: 2 * 60 * 1000,
  })

export const useRegisterSchoolGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSchoolGroupRequest) => schoolGroupService.register(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolGroupKeys.lists() })
      qc.invalidateQueries({ queryKey: schoolGroupKeys.analytics() })
      qc.invalidateQueries({ queryKey: schoolGroupKeys.dashboard() })
      qc.invalidateQueries({ queryKey: schoolGroupKeys.summary() })
    },
    onError: (err: any) => console.error('[useRegisterSchoolGroup]', err?.message ?? err),
  })
}

export const useUpdateSchoolGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      schoolGroupCode,
      dto,
    }: {
      schoolGroupCode: string
      dto: UpdateSchoolGroupRequestDto
    }) => schoolGroupService.updateName(schoolGroupCode, dto),
    onSuccess: (_r, { schoolGroupCode }) => {
      qc.invalidateQueries({ queryKey: schoolGroupKeys.lists() })
      qc.invalidateQueries({ queryKey: schoolGroupKeys.detail(schoolGroupCode) })
    },
    onError: (err: any) => console.error('[useUpdateSchoolGroup]', err?.message ?? err),
  })
}

export const useUpdateSchoolGroupLogo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ schoolGroupCode, logo }: { schoolGroupCode: string; logo: File }) =>
      schoolGroupService.updateLogo(schoolGroupCode, logo),
    onSuccess: (_r, { schoolGroupCode }) => {
      qc.invalidateQueries({ queryKey: schoolGroupKeys.detail(schoolGroupCode) })
      qc.invalidateQueries({ queryKey: schoolGroupKeys.lists() })
    },
    onError: (err: any) => console.error('[useUpdateSchoolGroupLogo]', err?.message ?? err),
  })
}

export const useSubscribePackage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      schoolGroupCode,
      packageId,
      dto,
      isPaid,
    }: {
      schoolGroupCode: string
      packageId: number
      dto: AssignSubscriptionRequestDto
      isPaid?: boolean
    }) => schoolGroupService.subscribePackage(schoolGroupCode, packageId, dto, isPaid),

    onSuccess: (_r, { schoolGroupCode }) => {
      qc.invalidateQueries({ queryKey: schoolGroupKeys.detail(schoolGroupCode) })
      qc.invalidateQueries({ queryKey: schoolGroupKeys.lists() })
      qc.invalidateQueries({ queryKey: schoolGroupKeys.dashboard() })
    },

    // Re-throw so the calling component's catch block / error state receives
    // the human-readable message (including "Paid date cannot be in the future").
    onError: (err: any) => {
      console.error('[useSubscribePackage]', err?.message ?? err)
      // Do NOT swallow — let it bubble to the component's try/catch.
      throw err
    },
  })
}

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { packageService } from '../../../services/superAdmin/packageServices'
import type {
  CreatePackageRequestDTO,
  FilterPackageRequestDTO,
} from '../../../types/superAdmin/Package'

export const packageKeys = {
  all: ['packages'] as const,
  count: ['packages', 'count'] as const,
  paginated: (page: number, size: number, sortBy?: string, sortDirection?: string) =>
    ['packages', 'paginated', page, size, sortBy, sortDirection] as const,
  filtered: (filter: FilterPackageRequestDTO, page: number, size: number) =>
    ['packages', 'filtered', filter, page, size] as const,
  filteredCount: (filter: FilterPackageRequestDTO) =>
    ['packages', 'filtered-count', filter] as const,
  detail: (id: number) => ['packages', 'detail', id] as const,
  subscriptionSummary: ['packages', 'subscription-summary'] as const,
  packageSummary: ['packages', 'package-summary'] as const,
  dropdownOptions: ['packages', 'enum-values'] as const,
}

// Step 1: fetch totalItems with size=1 (lightweight)
// Step 2: fetch all records using totalItems as size
// This avoids hardcoding 100/999999 — uses real count from backend
export const usePackages = (sortBy?: string, sortDirection?: string) => {
  // First call — just to get totalItems count
  const countQuery = useQuery({
    queryKey: packageKeys.count,
    queryFn: () => packageService.getAll(0, 1, sortBy, sortDirection),
    staleTime: 5 * 60 * 1000,
  })

  const totalItems = countQuery.data?.totalItems ?? 0

  // Second call — fetch all records using real totalItems as page size
  const allQuery = useQuery({
    queryKey: packageKeys.paginated(0, totalItems, sortBy, sortDirection),
    queryFn: () => packageService.getAll(0, totalItems, sortBy, sortDirection),
    enabled: totalItems > 0, // only run after we know the count
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    data: allQuery.data ?? countQuery.data,
    isLoading: countQuery.isLoading || (totalItems > 0 && allQuery.isLoading),
    isFetching: countQuery.isFetching || allQuery.isFetching,
    isError: countQuery.isError || allQuery.isError,
    error: countQuery.error ?? allQuery.error,
  }
}

// Same 2-step pattern for filtered packages
export const useFilteredPackages = (
  filter: FilterPackageRequestDTO,
  sortBy?: string,
  sortDirection?: string,
  enabled = true,
) => {
  // First call — get totalItems for this filter
  const countQuery = useQuery({
    queryKey: packageKeys.filteredCount(filter),
    queryFn: () => packageService.filterPackages(filter, 0, 1, sortBy, sortDirection),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const totalItems = countQuery.data?.totalItems ?? 0

  // Second call — fetch all filtered records
  const allQuery = useQuery({
    queryKey: packageKeys.filtered(filter, 0, totalItems),
    queryFn: () => packageService.filterPackages(filter, 0, totalItems, sortBy, sortDirection),
    enabled: enabled && totalItems > 0,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  return {
    data: totalItems > 0 ? allQuery.data : countQuery.data,
    isLoading: countQuery.isLoading || (totalItems > 0 && allQuery.isLoading),
    isFetching: countQuery.isFetching || allQuery.isFetching,
    isError: countQuery.isError || allQuery.isError,
    error: countQuery.error ?? allQuery.error,
  }
}

export const usePackage = (packageId: number) =>
  useQuery({
    queryKey: packageKeys.detail(packageId),
    queryFn: () => packageService.getById(packageId),
    enabled: !!packageId,
    staleTime: 5 * 60 * 1000,
  })

export const usePackageDropdownOptions = () =>
  useQuery({
    queryKey: packageKeys.dropdownOptions,
    queryFn: () => packageService.getDropdownOptions(),
    staleTime: 30 * 60 * 1000,
  })

export const useCreatePackage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePackageRequestDTO) => packageService.create(data),
    onSuccess: () => {
      // Invalidate all package queries including count so size recalculates
      queryClient.invalidateQueries({ queryKey: packageKeys.all })
    },
  })
}

export const useUpdatePackage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ packageId, data }: { packageId: number; data: CreatePackageRequestDTO }) =>
      packageService.update(packageId, data),
    onSuccess: (_result, { packageId }) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all })
      queryClient.removeQueries({ queryKey: packageKeys.detail(packageId) })
    },
  })
}

export const useDeletePackage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (packageId: number) => packageService.delete(packageId),
    onSuccess: (_result, packageId) => {
      // Invalidate count too so next fetch recalculates total
      queryClient.invalidateQueries({ queryKey: packageKeys.all })
      queryClient.removeQueries({ queryKey: packageKeys.detail(packageId) })
    },
  })
}

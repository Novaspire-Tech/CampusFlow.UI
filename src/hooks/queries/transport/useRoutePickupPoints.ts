import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  routePickupPointService,
  type FilterRoutePickupPointDto,
} from '../../../services/transport/routePickupPointService'
import type { RoutePickupPointFormData } from '../../../types/transport/routePickupPoint'

export const routePickupPointKeys = {
  all: ['routePickupPoints'] as const,
  paginated: (page: number, size: number, sortDirection: string) =>
    ['routePickupPoints', 'all', { page, size, sortDirection }] as const,
  filter: (dto: FilterRoutePickupPointDto, page: number, size: number, sortDirection: string) =>
    ['routePickupPoints', 'filter', { dto, page, size, sortDirection }] as const,
}

export const useRoutePickupPoints = (
  page = 0,
  size = 10,
  sortDirection: 'asc' | 'desc' = 'asc',
) => {
  return useQuery({
    queryKey: routePickupPointKeys.paginated(page, size, sortDirection),
    queryFn: () => routePickupPointService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAllRoutePickupPoints = (sortDirection: 'asc' | 'desc' = 'asc') =>
  useQuery({
    queryKey: ['routePickupPoints', 'all-pages', sortDirection],
    queryFn: () => routePickupPointService.getAllPages(sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

export const useFilterRoutePickupPoints = (
  dto: FilterRoutePickupPointDto,
  page = 0,
  size = 10,
  sortDirection: 'asc' | 'desc' = 'asc',
  enabled = true,
) => {
  return useQuery({
    queryKey: routePickupPointKeys.filter(dto, page, size, sortDirection),
    queryFn: () => routePickupPointService.filter(dto, page, size, sortDirection),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddRoutePickupPoint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoutePickupPointFormData) => routePickupPointService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routePickupPointKeys.all })
    },
  })
}

export const useUpdateRoutePickupPoint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoutePickupPointFormData }) =>
      routePickupPointService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routePickupPointKeys.all })
    },
  })
}

export const useDeleteRoutePickupPoint = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => routePickupPointService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routePickupPointKeys.all })
    },
  })
}

export const useDeleteMultipleRoutePickupPoints = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => routePickupPointService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routePickupPointKeys.all })
    },
  })
}

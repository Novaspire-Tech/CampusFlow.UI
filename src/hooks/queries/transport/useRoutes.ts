import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routesService } from '../../../services/transport/routesService'
import type { RouteFormData } from '../../../types/transport/routes'

export const routeKeys = {
  all: ['routes'] as const,
  detail: (id: string) => ['routes', id] as const,
}

export const useRoutes = () => {
  return useQuery({
    queryKey: routeKeys.all,
    queryFn: () => routesService.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddRoute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RouteFormData) => routesService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all })
    },
  })
}

export const useUpdateRoute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RouteFormData }) =>
      routesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all })
    },
  })
}

export const useDeleteRoute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: routesService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all })
    },
  })
}

export const useDeleteMultipleRoutes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: routesService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all })
    },
  })
}

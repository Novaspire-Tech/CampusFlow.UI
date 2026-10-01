import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupRoleService } from '../../../services/systemSettinds/groupRoleService'
import type { RoleFormData } from '../../../types/systemSettinds/groupRole'

export const groupRoleKeys = {
  all: ['group-roles'] as const,
  single: (id: string) => ['group-roles', id] as const,
  stats: ['group-roles', 'stats'] as const,
  titles: ['group-roles', 'titles'] as const,
  scopes: ['group-roles', 'scopes'] as const,
  operations: (scope?: string) => ['group-roles', 'operations', scope ?? ''] as const,
}

export const useGroupRoles = () =>
  useQuery({
    queryKey: groupRoleKeys.all,
    queryFn: groupRoleService.getAll,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })

export const useGroupRole = (roleId: string) =>
  useQuery({
    queryKey: groupRoleKeys.single(roleId),
    queryFn: () => groupRoleService.getSingle(roleId),
    enabled: !!roleId,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })

export const useGroupRoleStats = () =>
  useQuery({
    queryKey: groupRoleKeys.stats,
    queryFn: groupRoleService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

export const useGroupRoleTitles = () =>
  useQuery({
    queryKey: groupRoleKeys.titles,
    queryFn: groupRoleService.getTitles,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

export const useGroupRoleScopes = () =>
  useQuery({
    queryKey: groupRoleKeys.scopes,
    queryFn: groupRoleService.getScopes,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

export const useGroupRoleOperations = (scope?: string) =>
  useQuery({
    queryKey: groupRoleKeys.operations(scope),
    queryFn: () => groupRoleService.getOperations(scope),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

export const useCreateGroupRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleFormData) => groupRoleService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: groupRoleKeys.all })
      qc.invalidateQueries({ queryKey: groupRoleKeys.stats })
      qc.refetchQueries({ queryKey: groupRoleKeys.all })
    },
  })
}

export const useUpdateGroupRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: RoleFormData }) =>
      groupRoleService.update(roleId, data),
    onSuccess: (updated, { roleId }) => {
      qc.invalidateQueries({ queryKey: groupRoleKeys.all })
      qc.invalidateQueries({ queryKey: groupRoleKeys.single(roleId) })
      qc.invalidateQueries({ queryKey: groupRoleKeys.stats })
      qc.refetchQueries({ queryKey: groupRoleKeys.all })
      qc.setQueryData(groupRoleKeys.single(roleId), updated)
    },
    onError: (err) => console.error('useUpdateGroupRole error:', err),
  })
}

export const useDeleteGroupRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => groupRoleService.delete(roleId),
    onSuccess: (_, roleId) => {
      qc.invalidateQueries({ queryKey: groupRoleKeys.all })
      qc.invalidateQueries({ queryKey: groupRoleKeys.stats })
      qc.removeQueries({ queryKey: groupRoleKeys.single(roleId) })
      qc.refetchQueries({ queryKey: groupRoleKeys.all })
    },
  })
}

export const useAssignGroupRoleToUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
      groupRoleService.assignToUser(roleId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: groupRoleKeys.all })
      qc.refetchQueries({ queryKey: groupRoleKeys.all })
    },
  })
}
 
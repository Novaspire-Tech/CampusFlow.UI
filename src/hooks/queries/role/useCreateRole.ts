import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  roleService,
  userService,
  type UserFilterParams,
} from '../../../services/role/createRoleService';
import type { RoleFormData } from '../../../types/role/createRole';

export const roleKeys = {
  all: ['roles'] as const,
  single: (id: string) => ['roles', id] as const,
  stats: ['roles', 'stats'] as const,
  titles: ['roles', 'titles'] as const,
  scopes: ['roles', 'scopes'] as const,
  operations: ['roles', 'operations'] as const,
};

export const userKeys = {
  all: ['users', 'all'] as const,
  filter: (params: Record<string, any>) =>
    ['users', 'filter', params] as const,
};

export const useRoles = () =>
  useQuery({
    queryKey: roleKeys.all,
    queryFn: roleService.getAll,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });

export const useRole = (roleId: string) =>
  useQuery({
    queryKey: roleKeys.single(roleId),
    queryFn: () => roleService.getSingle(roleId),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    enabled: !!roleId,
    retry: 1,
  });

export const useRoleStats = () =>
  useQuery({
    queryKey: roleKeys.stats,
    queryFn: roleService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useRoleTitles = () =>
  useQuery({
    queryKey: roleKeys.titles,
    queryFn: roleService.getTitles,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

export const useRoleScopes = () =>
  useQuery({
    queryKey: roleKeys.scopes,
    queryFn: roleService.getScopes,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

export const useRoleOperations = () =>
  useQuery({
    queryKey: roleKeys.operations,
    queryFn: roleService.getOperations,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleFormData) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats });
      queryClient.refetchQueries({ queryKey: roleKeys.all });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: RoleFormData }) =>
      roleService.update(roleId, data),
    onSuccess: (updatedRole, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      queryClient.invalidateQueries({ queryKey: roleKeys.single(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats });
      queryClient.refetchQueries({ queryKey: roleKeys.all });
      queryClient.setQueryData(roleKeys.single(variables.roleId), updatedRole);
    },
    onError: (error) => console.error('Update role mutation error:', error),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => roleService.delete(roleId),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      queryClient.invalidateQueries({ queryKey: roleKeys.stats });
      queryClient.removeQueries({ queryKey: roleKeys.single(roleId) });
      queryClient.refetchQueries({ queryKey: roleKeys.all });
    },
  });
};

export const useAssignRoleToStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, staffCode }: { roleId: string; staffCode: string }) =>
      roleService.assignToStaff(roleId, staffCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      queryClient.refetchQueries({ queryKey: roleKeys.all });
    },
  });
};


export const useUsers = () =>
  useQuery({
    queryKey: userKeys.all,
    queryFn: userService.getAll,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });

export const useFilterUsers = (
  params: UserFilterParams & { enabled?: boolean } = {}
) => {
  const { roleTitle, search, enabled = true } = params;
  const hasFilter = !!(roleTitle?.trim() || search?.trim());

  return useQuery({
    queryKey: userKeys.filter({
      roleTitle: roleTitle ?? '',
      search: search ?? '',
    }),
    queryFn: () =>
      userService.filterUsers({ roleTitle, search }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled: enabled && hasFilter,
  });
};
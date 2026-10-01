import AxiosFunc from '../../utils/axios'
import type { Role, RoleFormData, RoleStats } from '../../types/systemSettinds/groupRole'

const getSchoolGroupCode = (): string => localStorage.getItem('schoolGroupCode') ?? ''

const base = () => `/school-group/${getSchoolGroupCode()}/group-role`

const SCHOOL_CODE_SEG = 'default'

const EP = {
  GET_ALL: () => `${base()}/getAll`,
  GET_SINGLE: (roleId: string) => `${base()}/${roleId}/get`,
  CREATE: () => `${base()}/create`,
  UPDATE: (roleId: string) => `${base()}/${roleId}/update`,
  DELETE: (roleId: string) => `${base()}/${roleId}/delete`,
  GET_TITLES: () => `${base()}/titles`,
  GET_SCOPES: () => `${base()}/${SCHOOL_CODE_SEG}/role/scopes`,
  GET_OPERATIONS: (scope?: string) => {
    const url = `${base()}/${SCHOOL_CODE_SEG}/role/operations`
    return scope?.trim() ? `${url}?scope=${encodeURIComponent(scope.trim())}` : url
  },
  ASSIGN_USER: (roleId: string, userId: string) =>
    `${base()}/${roleId}/assign/group-user/${userId}`,
}

const toFrontend = (raw: any): Role => ({
  roleId: String(raw.roleId ?? raw.id ?? `tmp-${Date.now()}`),
  name: raw.name ?? '',
  description: raw.description ?? '',
  title: raw.title ?? '',
  crudPermissions: (raw.crudPermissions ?? []).map((p: any) => ({
    scope: p.scope ?? '',
    operations: p.operations ?? [],
  })),
})

const toBackend = (data: RoleFormData) => {
  const payload = {
    name: data.name.trim(),
    description: data.description.trim(),
    title: data.title,
    crudPermissions: data.crudPermissions.map((p) => ({
      scope: p.scope,
      operations: p.operations,
    })),
  }
  console.debug('[groupRoleService] request payload →', JSON.stringify(payload, null, 2))
  return payload
}

const ZERO_STATS: RoleStats[] = [
  { title: 'Total Roles', value: '0', change: '+0%', icon: 'Shield' },
  { title: 'Active Roles', value: '0', change: '+0%', icon: 'CheckCircle' },
  { title: 'Custom Roles', value: '0', change: '+0%', icon: 'Settings' },
]

export const groupRoleService = {
  getAll: async (): Promise<Role[]> => {
    try {
      const res = await AxiosFunc.Get(EP.GET_ALL())
      console.debug('groupRoleService.getAll response →', res)
      if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Failed to fetch roles')
      const data: any[] = res.data?.data ?? []
      return data.filter((r) => r.roleId || r.id).map(toFrontend)
    } catch (err: any) {
      console.error('groupRoleService.getAll:', err)
      return []
    }
  },

  getSingle: async (roleId: string): Promise<Role | null> => {
    const res = await AxiosFunc.Get(EP.GET_SINGLE(roleId))
    if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Failed to fetch role')
    return toFrontend(res.data?.data)
  },

  create: async (data: RoleFormData): Promise<Role> => {
    const payload = toBackend(data)
    const res = await AxiosFunc.Post(EP.CREATE(), payload)
    if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Failed to create role')
    return res.data?.data ? toFrontend(res.data.data) : { roleId: `tmp-${Date.now()}`, ...data }
  },

  update: async (roleId: string, data: RoleFormData): Promise<Role> => {
    const payload = toBackend(data)
    const res = await AxiosFunc.Put(EP.UPDATE(roleId), payload)
    if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Failed to update role')
    return res.data?.data ? toFrontend(res.data.data) : { roleId, ...data }
  },

  delete: async (roleId: string): Promise<void> => {
    const res = await AxiosFunc.Delete(EP.DELETE(roleId))
    if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Failed to delete role')
  },

  getTitles: async (): Promise<string[]> => {
    try {
      const res = await AxiosFunc.Get(EP.GET_TITLES())
      if (res.data?.status !== 200) throw new Error('Failed to fetch titles')
      return res.data?.data ?? []
    } catch (err: any) {
      console.error('groupRoleService.getTitles:', err)
      return []
    }
  },

  getScopes: async (): Promise<string[]> => {
    try {
      const res = await AxiosFunc.Get(EP.GET_SCOPES())
      if (res.data?.status !== 200) throw new Error('Failed to fetch scopes')
      return res.data?.data ?? []
    } catch (err: any) {
      console.error('groupRoleService.getScopes:', err)
      return []
    }
  },

  getOperations: async (scope?: string): Promise<string[]> => {
    try {
      const res = await AxiosFunc.Get(EP.GET_OPERATIONS(scope))
      if (res.data?.status !== 200) throw new Error('Failed to fetch operations')
      return res.data?.data ?? []
    } catch (err: any) {
      console.error('groupRoleService.getOperations:', err)
      return []
    }
  },

  getStats: async (): Promise<RoleStats[]> => {
    try {
      const roles = await groupRoleService.getAll()
      const custom = roles.filter((r) => r.title === 'GROUP_ADMIN').length
      return [
        { title: 'Total Roles', value: String(roles.length), change: '+0%', icon: 'Shield' },
        { title: 'Active Roles', value: String(roles.length), change: '+0%', icon: 'CheckCircle' },
        { title: 'Custom Roles', value: String(custom), change: '+0%', icon: 'Settings' },
      ]
    } catch {
      return ZERO_STATS
    }
  },

  assignToUser: async (roleId: string, userId: string): Promise<void> => {
    const res = await AxiosFunc.Put(EP.ASSIGN_USER(roleId, userId), {})
    if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Failed to assign role')
  },
}

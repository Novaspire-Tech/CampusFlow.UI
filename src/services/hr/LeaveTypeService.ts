import AxiosFunc from '../../utils/axios'
import type { LeaveType, LeaveTypeStats } from '../../types/humanResource/leaveType'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/leave-type/all',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/leave-type/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/leave-type/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/leave-type/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/leave-type/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/leave-type/delete-multiple',
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): LeaveType => ({
  id: d.leaveTypeId?.toString() ?? d.id?.toString() ?? '',
  leaveType: d.leaveType ?? '',
  createdDate: d.createdDate
    ? new Date(d.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  status: d.isActive ? 'Active' : 'Inactive',
})

const toBackend = (d: Partial<LeaveType>) => ({ leaveType: d.leaveType })

const extractList = (response: any): LeaveType[] => {
  const data = response?.data?.data?.LeaveType ?? response?.data?.LeaveType ?? []
  return data.map(toFrontend)
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const leaveTypeService = {
  getAll: async (): Promise<LeaveType[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_ALL), {
        page: 0,
        size: 20,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to fetch leave types')

      return extractList(response)
    } catch (error: any) {
      console.error('Error fetching leave types:', error)
      return []
    }
  },

  getById: async (id: string): Promise<LeaveType | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_BY_ID(id)))
      if (response.data?.status !== 200 || !response.data?.data) return null
      return toFrontend(response.data.data)
    } catch (error: any) {
      console.error('Error fetching leave type:', error)
      return null
    }
  },

  create: async (data: Partial<LeaveType>): Promise<LeaveType> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create leave type')

    return {
      ...(data as LeaveType),
      id: response.data?.data?.id?.toString() ?? `temp-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    }
  },

  update: async (id: string, data: LeaveType): Promise<LeaveType> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update leave type')

    return data
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete leave type')
    } catch (error: any) {
      if (error.response?.status === 500) return
      throw new Error(
        error.response?.data?.message ?? error.message ?? 'Failed to delete leave type',
      )
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE_MULTIPLE), ids.map(Number))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete leave types')
  },

  getStats: async (): Promise<LeaveTypeStats[]> => {
    try {
      const leaveTypes = await leaveTypeService.getAll()
      const activeCount = leaveTypes.filter((l) => l.status === 'Active').length

      return [
        {
          title: 'Total leaveTypes',
          value: leaveTypes.length.toString(),
          change: '+0%',
          icon: 'Package',
        },
        {
          title: 'Active Heads',
          value: activeCount.toString(),
          change: '+0%',
          icon: 'CheckCircle',
        },
      ]
    } catch (error: any) {
      console.error('Error fetching leave type stats:', error)
      return [
        { title: 'Total leaveTypes', value: '0', change: '+0%', icon: 'Package' },
        { title: 'Active Heads', value: '0', change: '+0%', icon: 'CheckCircle' },
      ]
    }
  },
}

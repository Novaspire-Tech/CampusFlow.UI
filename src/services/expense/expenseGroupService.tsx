import AxiosFunc from '../../utils/axios'
import type { ExpenseGroup, ExpenseGroupStats } from '../../types/expense/expenseGroup'

const getSchoolGroupCode = (): string => {
  const schoolGroupCode = localStorage.getItem('schoolGroupCode')
  if (!schoolGroupCode) {
    console.error('School group code not found')
    return 'default'
  }
  return schoolGroupCode
}

const getSchoolCode = (): string => {
  const schoolCode = localStorage.getItem('schoolCode')
  if (!schoolCode) {
    console.error('School code not found')
    return 'default'
  }
  return schoolCode
}

const buildUrl = (endpoint: string, expenseHeadId?: number | string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroup = getSchoolGroupCode()

  let url = endpoint.replace('{schoolGroupCode}', schoolGroup).replace('{schoolCode}', schoolCode)

  if (expenseHeadId !== undefined) {
    url = url.replace('{expenseHeadId}', expenseHeadId.toString())
    url = url.replace('{expenseGroupId}', expenseHeadId.toString())
  }

  return url
}

const EXPENSE_GROUP_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/expense-group/all/{expenseGroupId}',
  GET_ALL_School: '/school-group/{schoolGroupCode}/school/expense-group/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/expense-group/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/expense-group/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/expense-group/delete/${id}`,
  DELETE_MULTIPLE: (ids: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/expense-group/delete-multiple/${ids}`,
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const DEFAULT_ZERO_STATS: ExpenseGroupStats[] = [
  {
    title: 'Total Expense Groups',
    value: '0',
    change: '+0%',
    icon: 'Package',
  },
]

const transformBackendToFrontend = (
  backendData: any,
  expenseHeadId?: number,
  expenseHeadName?: string,
): ExpenseGroup => ({
  id: backendData.expanseGroupId?.toString() || '',
  expenseGroupId: backendData.expanseGroupId?.toString() || '',
  groupName: backendData.expanseGroupName || '',
  expenseHeadId: expenseHeadId || 0,
  expenseHeadName: expenseHeadName || '',
})

const transformFrontendToBackend = (frontendData: any): any => ({
  expenseHeadId: Number(frontendData.expenseHeadId),
  groupName: frontendData.groupName,
})

export const expenseGroupService = {
  getAll: async (expenseHeadId: number, expenseHeadName?: string): Promise<ExpenseGroup[]> => {
    if (!expenseHeadId || expenseHeadId === 0) return []

    try {
    
      const url = isAllSchools()
        ? buildUrl(EXPENSE_GROUP_ENDPOINTS.GET_ALL_School)
        : buildUrl(EXPENSE_GROUP_ENDPOINTS.GET_ALL, expenseHeadId)

      const response = await AxiosFunc.Get(url, {
        ...(isAllSchools() ? { expenseHeadId } : {}),
        page: 0,
        size: 100,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch expense groups')
      }

      const data: any[] = response.data?.data?.expenseGroups || response.data?.data || []

      return data.map((item) => transformBackendToFrontend(item, expenseHeadId, expenseHeadName))
    } catch (error: any) {
      console.error('Error fetching expense groups:', error)

      if (error.response?.status === 404 || error.response?.data?.status === 404) {
        return []
      }

      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch expense groups',
      )
    }
  },

  create: async (data: any): Promise<ExpenseGroup> => {
    if (!data.expenseHeadId) throw new Error('Expense Head ID is required')
    if (!data.groupName || data.groupName.trim() === '') throw new Error('Group name is required')

    try {
      const backendData = transformFrontendToBackend(data)
      const url = buildUrl(EXPENSE_GROUP_ENDPOINTS.CREATE)
      const response = await AxiosFunc.Post(url, backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to create expense group')
      }

      return {
        id: `temp-${Date.now()}`,
        expenseGroupId: '',
        groupName: data.groupName,
        expenseHeadId: Number(data.expenseHeadId),
        expenseHeadName: '',
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create expense group',
      )
    }
  },

  update: async (expenseGroupId: string, data: any): Promise<ExpenseGroup> => {
    if (!expenseGroupId) throw new Error('Expense Group ID is required')
    if (!data.expenseHeadId) throw new Error('Expense Head ID is required')
    if (!data.groupName || data.groupName.trim() === '') throw new Error('Group name is required')

    try {
      const backendData = transformFrontendToBackend(data)
      const url = buildUrl(EXPENSE_GROUP_ENDPOINTS.UPDATE(expenseGroupId))
      const response = await AxiosFunc.Put(url, backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update expense group')
      }

      return {
        id: expenseGroupId,
        expenseGroupId,
        groupName: data.groupName,
        expenseHeadId: Number(data.expenseHeadId),
        expenseHeadName: '',
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update expense group',
      )
    }
  },

  delete: async (expenseGroupId: string): Promise<void> => {
    if (!expenseGroupId) throw new Error('Expense Group ID is required')

    try {
      const url = buildUrl(EXPENSE_GROUP_ENDPOINTS.DELETE(expenseGroupId))
      const response = await AxiosFunc.Delete(url)

      if (response.data?.status === 200) return

      throw new Error(response.data?.message || 'Failed to delete expense group')
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete expense group',
      )
    }
  },

  deleteMultiple: async (expenseGroupIds: string[]): Promise<void> => {
    if (!expenseGroupIds || expenseGroupIds.length === 0) {
      throw new Error('Expense Group IDs are required')
    }

    try {
      const commaSeparatedIds = expenseGroupIds.join(',')
      const url = buildUrl(EXPENSE_GROUP_ENDPOINTS.DELETE_MULTIPLE(commaSeparatedIds))
      const response = await AxiosFunc.Delete(url)

      if (response.data?.status && response.data.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete expense groups')
      }
    } catch (error: any) {
      console.error('Error deleting multiple expense groups:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete expense groups',
      )
    }
  },

  getStats: async (expenseHeadId: number): Promise<ExpenseGroupStats[]> => {
    try {
      if (!expenseHeadId || expenseHeadId === 0) return DEFAULT_ZERO_STATS

      const groups = await expenseGroupService.getAll(expenseHeadId)
      return [
        {
          title: 'Total Expense Groups',
          value: groups.length.toString(),
          change: '+0%',
          icon: 'Package',
        },
      ]
    } catch (error: any) {
      console.error('Error fetching expense group stats:', error)
      return DEFAULT_ZERO_STATS
    }
  },
}

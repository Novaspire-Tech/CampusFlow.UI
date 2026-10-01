import AxiosFunc from '../../utils/axios'
import type { ExpenseHead, ExpenseHeadStats } from '../../types/expense/expenseHead'

const getSchoolCode = (): string => {
  const schoolCode = localStorage.getItem('schoolCode')
  if (!schoolCode) {
    console.error('School code not found')
    return 'default'
  }
  return schoolCode
}
const getSchoolGroupCode = (): string => {
  const schoolGroupCode = localStorage.getItem('schoolGroupCode')
  if (!schoolGroupCode) {
    console.error('School group code not found')
    return 'default'
  }
  return schoolGroupCode
}

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode).replace('{schoolCode}', schoolCode)
}
// Api Endpoints
const EXPENSE_HEAD_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/expense-head/all',
  GET_ALL_School: '/school-group/{schoolGroupCode}/school/expense-head/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/expense-head/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/expense-head/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/expense-head/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/expense-head/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

// DEFAULT STATS
const DEFAULT_ZERO_STATS: ExpenseHeadStats[] = [
  {
    title: 'Total Expense Heads',
    value: '0',
    change: '+0%',
    icon: 'Package',
  },
  {
    title: 'Active Heads',
    value: '0',
    change: '+0%',
    icon: 'CheckCircle',
  },
]

const transformBackendToFrontend = (backendData: any): ExpenseHead => {
  return {
    id: backendData.expenseHeadId?.toString() || '',
    name: backendData.expenseHead || '',
    description: backendData.description || '',
    createdDate: backendData.createdDate
      ? new Date(backendData.createdDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: 'Active',
  }
}

const transformFrontendToBackend = (frontendData: Partial<ExpenseHead>): any => {
  return {
    expenseHead: frontendData.name,
    description: frontendData.description || '',
  }
}

// Service
export const expenseHeadService = {
  getAll: async (): Promise<ExpenseHead[]> => {
    try {
      const endpoint = isAllSchools()
        ? EXPENSE_HEAD_ENDPOINTS.GET_ALL_School
        : EXPENSE_HEAD_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 100,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch expense heads')
      }

      const expenseHeads = response.data?.data?.expenseHeads || []
      return expenseHeads.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('Error fetching expense heads:', error)
      return []
    }
  },

  create: async (data: Partial<ExpenseHead>): Promise<ExpenseHead> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Post(buildUrl(EXPENSE_HEAD_ENDPOINTS.CREATE), backendData)

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to create expense head'
        throw new Error(errorMessage)
      }

      const createdData = response.data?.data
      return transformBackendToFrontend(createdData)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create expense head'
      throw new Error(errorMessage)
    }
  },

  update: async (id: string, data: ExpenseHead): Promise<ExpenseHead> => {
    try {
      const backendData = transformFrontendToBackend(data)

      const response = await AxiosFunc.Put(buildUrl(EXPENSE_HEAD_ENDPOINTS.UPDATE(id)), backendData)

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to update expense head'
        throw new Error(errorMessage)
      }

      const updatedData = response.data?.data
      return transformBackendToFrontend(updatedData)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update expense head'
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EXPENSE_HEAD_ENDPOINTS.DELETE(id)))

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to delete expense head'
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete expense head'
      throw new Error(errorMessage)
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id, 10))
      const response = await AxiosFunc.Delete(
        buildUrl(EXPENSE_HEAD_ENDPOINTS.DELETE_MULTIPLE),
        numericIds,
      )

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete expense heads')
      }
    } catch (error: any) {
      console.error('Error deleting multiple expense heads:', error)
      throw error
    }
  },

  getStats: async (): Promise<ExpenseHeadStats[]> => {
    try {
      const expenseHeads = await expenseHeadService.getAll()
      const activeCount = expenseHeads.filter((h) => h.status === 'Active').length

      return [
        {
          title: 'Total Expense Heads',
          value: expenseHeads.length.toString(),
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
      console.error('Error fetching expense head stats:', error)
      return DEFAULT_ZERO_STATS
    }
  },
}

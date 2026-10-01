import AxiosFunc from '../../utils/axios'
import type { AddIncome, AddIncomeFormData } from '../../types/income/addIncome'
import { openDocument } from '../../hooks/useBlobImage'

const ADD_INCOME_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/add-income/getAll',
  FIND_BY_NAME: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/find-income',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/update/${id}`,
  UPDATE_DOCUMENT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/${id}/update-document`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/delete-multiple',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/filter',
  FILTER_PAGINATED: '/school-group/{schoolGroupCode}/school/add-income/filter',
  SEARCH: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/search',
  openDocument,
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const transformToDTO = (data: AddIncomeFormData) => {
  return {
    name: data.name,
    invoiceNo: data.invoiceNumber || null,
    date: formatDate(data.date),
    amount: String(data.amount),
    description: data.description ?? null,
    incomeHeadId: data.incomeHeadId ? Number(data.incomeHeadId) : null,
    incomeGroupId: data.incomeGroupId ? Number(data.incomeGroupId) : null,
  }
}

const transformFromBackend = (item: any): AddIncome => {
  return {
    id: item.addIncomeId?.toString() || '',
    addIncomeId: item.addIncomeId?.toString() || '',
    incomeHeadId: item.incomeHead?.incomeHeadId?.toString() || '',
    incomeHead: {
      id: item.incomeHead?.incomeHeadId?.toString() || '',
      name: item.incomeHead?.incomeHead || '',
    },
    incomeGroup: {
      id: item.incomeGroup?.incomeGroupId?.toString() || '',
      name: item.incomeGroup?.groupName || '',
    },
    incomeGroupId: item.incomeGroup?.incomeGroupId?.toString() || '',
    groupName: item.incomeGroup?.groupName || '',
    incomeHeadName: item.incomeHead?.incomeHead || '',
    name: item.name || '',
    invoiceNumber: item.invoiceNo || '',
    date: item.date || '',
    amount: Number(item.amount) || 0,
    document: item.document || null,
    description: item.description || '',
  }
}

export interface AddIncomeListResponse {
  addIncomes: AddIncome[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface AddIncomeSearchParams {
  incomeHeadId?: string
  incomeGroupId?: string
  search?: string
}

export interface SearchIncomesParams {
  period?: string
  search?: string
}

export const addIncomeService = {
  getAll: async (
    page = 0,
    size = 10,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<AddIncomeListResponse> => {
    try {
      const endpoint = isAllSchools()
        ? ADD_INCOME_ENDPOINTS.GET_ALL_SCHOOL
        : ADD_INCOME_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch incomes')
      }

      const raw = response.data?.data
      return {
        addIncomes: (raw?.addIncomes || []).map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error fetching incomes:', error)
      throw error
    }
  },

  search: async (
    params: SearchIncomesParams,
    page = 0,
    size = 10,
    sortBy = 'date',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<AddIncomeListResponse> => {
    try {
      const body: Record<string, any> = {}
      if (params.period) body.period = params.period
      if (params.search?.trim()) body.search = params.search.trim()

      const baseUrl = ADD_INCOME_ENDPOINTS.SEARCH
      const qs = `page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
      const url = `${baseUrl}?${qs}`

      const response = await AxiosFunc.Post(url, body)

      if (!response?.data) throw new Error('No response data received from server')
      if (response.data.status !== 200)
        throw new Error(response.data.message || 'Failed to search incomes')

      const raw = response.data?.data
      return {
        addIncomes: (raw?.addIncomes || []).map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error searching incomes:', error)
      throw error
    }
  },

  filter: async (
    params: AddIncomeSearchParams,
    page = 0,
    size = 10,
    sortBy = 'date',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<AddIncomeListResponse> => {
    try {
      const body: Record<string, any> = {}
      if (params.incomeHeadId) body.incomeHeadId = Number(params.incomeHeadId)
      if (params.incomeGroupId) body.incomeGroupId = Number(params.incomeGroupId)
      if (params.search?.trim()) body.search = params.search.trim()

      const baseEndpoint = isAllSchools()
        ? ADD_INCOME_ENDPOINTS.FILTER_PAGINATED
        : ADD_INCOME_ENDPOINTS.FILTER

      const baseUrl = baseEndpoint
      const qs = `page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
      const url = `${baseUrl}?${qs}`

      const response = await AxiosFunc.Post(url, body)

      if (!response?.data) throw new Error('No response data received from server')
      if (response.data.status !== 200)
        throw new Error(response.data.message || 'Failed to filter incomes')

      const raw = response.data?.data
      return {
        addIncomes: (raw?.addIncomes || []).map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error filtering incomes:', error)
      throw error
    }
  },

  findByName: async (name: string): Promise<AddIncome | null> => {
    try {
      const response = await AxiosFunc.Get(ADD_INCOME_ENDPOINTS.FIND_BY_NAME, { name })
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch income')
      }
      return transformFromBackend(response.data?.data)
    } catch (error: any) {
      console.error('Error fetching income by name:', error)
      throw error
    }
  },

  create: async (data: AddIncomeFormData): Promise<AddIncome> => {
    try {
      const formData = new FormData()
      const incomeData = transformToDTO(data)
      formData.append('data', JSON.stringify(incomeData))
      if (data.document instanceof File) {
        formData.append('document', data.document)
      }
      const response = await AxiosFunc.PostFormData(ADD_INCOME_ENDPOINTS.CREATE, formData)
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to create income')
      }
      return transformFromBackend(response.data?.data)
    } catch (error: any) {
      console.error('Error creating income:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to create income')
    }
  },

  update: async (id: string, data: AddIncomeFormData): Promise<AddIncome> => {
    try {
      const incomeData = transformToDTO(data)
      const response = await AxiosFunc.Put(ADD_INCOME_ENDPOINTS.UPDATE(id), incomeData)
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update income')
      }
      return transformFromBackend(response.data?.data)
    } catch (error: any) {
      console.error('Error updating income:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to update income')
    }
  },

  updateDocument: async (incomeId: string, file: File): Promise<void> => {
    if (!(file instanceof File)) throw new Error('Invalid document file')
    const formData = new FormData()
    formData.append('document', file)
    const response = await AxiosFunc.PutFormData(
      ADD_INCOME_ENDPOINTS.UPDATE_DOCUMENT(incomeId),
      formData,
    )
    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to update income document')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ADD_INCOME_ENDPOINTS.DELETE(id))
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete income')
      }
    } catch (error: any) {
      console.error('Error deleting income:', error)
      throw error
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id))
      const response = await AxiosFunc.Delete(ADD_INCOME_ENDPOINTS.DELETE_MULTIPLE, numericIds)
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete incomes')
      }
    } catch (error: any) {
      console.error('Error deleting multiple incomes:', error)
      throw error
    }
  },
}

import AxiosFunc from '../../utils/axios'
import type { AddExpense, AddExpenseFormData } from '../../types/expense/addExpense'

export const openExpenseDocument = async (documentPath: string) => {
  if (!documentPath) throw new Error('Document path is missing')

  const response = await AxiosFunc.GetFile(`/${documentPath}`)
  const blob = new Blob([response.data], {
    type: response.data.type || 'application/pdf',
  })

  const url = window.URL.createObjectURL(blob)
  window.open(url)
  setTimeout(() => window.URL.revokeObjectURL(url), 10_000)
}

const ADD_EXPENSE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/all',
  GET_ALL_School: '/school-group/{schoolGroupCode}/school/add-expense/getAll',
  SEARCH: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/search',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/filter',
  FILTER_PAGINATED: '/school-group/{schoolGroupCode}/school/add-expense/filter',
  FIND_BY_NAME: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/find-expense',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/update/${id}`,
  UPDATE_DOCUMENT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/${id}/update-document`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const transformExpenseFrontendToBackend = (data: AddExpenseFormData) => {
  return {
    name: data.name,
    invoiceNo: data.invoiceNumber ?? null,
    date: formatDate(data.date),
    amount: data.amount,
    description: data.description ?? null,
    expenseHeadId: data.expenseHeadId ? String(data.expenseHeadId) : null,
    expenseGroupId: data.expenseGroupId ? String(data.expenseGroupId) : null,
  }
}

export const transformFromBackend = (item: any): AddExpense => {
  return {
    id: item.addExpenseId?.toString() || '',
    addExpenseId: item.addExpenseId?.toString() || '',
    expenseHeadId: item.expenseHead?.expenseHeadId?.toString() || '',
    expenseHead: {
      id: item.expenseHead?.expenseHeadId?.toString() || '',
      name: item.expenseHead?.expenseHead || '',
    },
    expenseGroup: {
      id: item.expenseGroup?.expenseGroupId?.toString() || '',
      name: item.expenseGroup?.groupName || '',
    },
    expenseHeadName: item.expenseHead?.expenseHead || '',
    expenseGroupId: item.expenseGroup?.expenseGroupId?.toString() || '',
    expenseGroupName: item.expenseGroup?.groupName || '',
    name: item.name || '',
    invoiceNumber: item.invoiceNo || '',
    date: item.date || '',
    amount: Number(item.amount) || 0,
    document: item.document || null,
    description: item.description || '',
  }
}

export interface ExpenseFilterParams {
  expenseHeadId?: number
  expenseGroupId?: number
  search?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ExpenseFilterResponse {
  expenses: AddExpense[]
  totalElements: number
  totalPages: number
  currentPage: number
}

export interface ExpenseSearchParams {
  search?: string
  period?: string
  page?: number
  size?: number
  sortDirection?: 'asc' | 'desc'
}

export const addExpenseService = {
  getAll: async (
    page = 0,
    size = 10,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<ExpenseFilterResponse> => {
    try {
      const endpoint = isAllSchools()
        ? ADD_EXPENSE_ENDPOINTS.GET_ALL_School
        : ADD_EXPENSE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection,
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch expenses')
      }

      const data = response.data?.data
      const expenses = data?.addExpenses || []

      return {
        expenses: expenses.map(transformFromBackend),
        totalElements: data?.totalItems ?? data?.totalElements ?? expenses.length,
        totalPages: data?.totalPages ?? 1,
        currentPage: data?.currentPage ?? page,
      }
    } catch (error: any) {
      console.error('Error fetching expenses:', error)
      throw error
    }
  },

  search: async (params: ExpenseSearchParams): Promise<ExpenseFilterResponse> => {
    const { search = '', period = '', page = 0, size = 10, sortDirection = 'asc' } = params

    const body: Record<string, string> = {}
    if (search) body.search = search
    if (period) body.period = period

    try {
      const response = await AxiosFunc.Post(ADD_EXPENSE_ENDPOINTS.SEARCH, body, {
        params: { page, size, sortDirection },
      })

      const responseData = response.data

      if (responseData?.status !== 200) {
        throw new Error(responseData?.message || 'Failed to search expenses')
      }

      const data = responseData?.data
      const rawExpenses = data?.addExpenses ?? data?.expenses ?? []

      return {
        expenses: rawExpenses.map(transformFromBackend),
        totalElements: data?.totalItems ?? data?.totalElements ?? rawExpenses.length,
        totalPages: data?.totalPages ?? 1,
        currentPage: data?.currentPage ?? page,
      }
    } catch (error: any) {
      console.error('Error searching expenses:', error)
      throw error
    }
  },

  filter: async (params: ExpenseFilterParams): Promise<ExpenseFilterResponse> => {
    const {
      expenseHeadId = 0,
      expenseGroupId = 0,
      search = '',
      page = 0,
      size = 10,
      sortBy = 'date',
      sortDirection = 'asc',
    } = params

    const body: Record<string, any> = {}
    if (expenseHeadId > 0) body.expenseHeadId = expenseHeadId
    if (expenseGroupId > 0) body.expenseGroupId = expenseGroupId
    if (search?.trim()) body.search = search.trim()

    const baseEndpoint = isAllSchools()
      ? ADD_EXPENSE_ENDPOINTS.FILTER_PAGINATED
      : ADD_EXPENSE_ENDPOINTS.FILTER

    const url = `${baseEndpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

    try {
      const response = await AxiosFunc.Post(url, body)

      if (!response?.data)
        return { expenses: [], totalElements: 0, totalPages: 0, currentPage: page }

      if (response.data?.status !== 200)
        return { expenses: [], totalElements: 0, totalPages: 0, currentPage: page }

      const data = response.data?.data

      let rawExpenses: any[] = []
      if (Array.isArray(data)) {
        rawExpenses = data
      } else if (data?.addExpenses && Array.isArray(data.addExpenses)) {
        rawExpenses = data.addExpenses
      } else if (data?.expenses && Array.isArray(data.expenses)) {
        rawExpenses = data.expenses
      } else if (data?.content && Array.isArray(data.content)) {
        rawExpenses = data.content
      }

      return {
        expenses: rawExpenses.map(transformFromBackend),
        totalElements: data?.totalElements ?? data?.totalItems ?? rawExpenses.length,
        totalPages: data?.totalPages ?? 1,
        currentPage: data?.currentPage ?? data?.number ?? page,
      }
    } catch (error: any) {
      console.error(' filter error:', error.message)
      return { expenses: [], totalElements: 0, totalPages: 0, currentPage: page }
    }
  },

  findByName: async (name: string): Promise<AddExpense | null> => {
    try {
      const response = await AxiosFunc.Get(ADD_EXPENSE_ENDPOINTS.FIND_BY_NAME, { name })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch expense')
      }

      return transformFromBackend(response.data?.data)
    } catch (error: any) {
      console.error('Error fetching expense by name:', error)
      throw error
    }
  },

  create: async (data: AddExpenseFormData): Promise<AddExpense> => {
    try {
      const formData = new FormData()
      const expenseData = transformExpenseFrontendToBackend(data)
      formData.append('data', JSON.stringify(expenseData))

      if (data.document instanceof File) {
        formData.append('document', data.document)
      }

      const response = await AxiosFunc.PostFormData(ADD_EXPENSE_ENDPOINTS.CREATE, formData)

      if (response.data?.status !== 200 && response.data?.status !== 201) {
        throw new Error(response.data?.message || 'Failed to create expense')
      }

      return transformFromBackend(response.data.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create expense')
    }
  },

  updateData: async (id: string, data: AddExpenseFormData): Promise<AddExpense> => {
    const expenseData = transformExpenseFrontendToBackend(data)

    const response = await AxiosFunc.Put(ADD_EXPENSE_ENDPOINTS.UPDATE(id), expenseData)

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to update expense data')
    }

    return transformFromBackend(response.data.data)
  },

  updateDocument: async (expenseId: string, file: File): Promise<void> => {
    if (!(file instanceof File)) throw new Error('Invalid document file')

    const formData = new FormData()
    formData.append('document', file)

    const response = await AxiosFunc.PutFormData(
      ADD_EXPENSE_ENDPOINTS.UPDATE_DOCUMENT(expenseId),
      formData,
    )

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to update expense document')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ADD_EXPENSE_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete expense')
      }
    } catch (error: any) {
      console.error('Error deleting expense:', error)
      throw error
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id))

      const response = await AxiosFunc.Delete(ADD_EXPENSE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete expenses')
      }
    } catch (error: any) {
      console.error('Error deleting multiple expenses:', error)
      throw error
    }
  },
}

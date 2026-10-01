import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

const getSchoolCode = (): string => localStorage.getItem('schoolCode') || 'default'

const getSchoolGroupCode = (): string => localStorage.getItem('schoolGroupCode') || 'default'

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getSchoolGroupCode())
    .replace('{schoolCode}', getSchoolCode())

const FINANCE_ENDPOINTS = {
  INCOME_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/all',
  EXPENSE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/all',
  INCOME_YEAR: (year: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-income/year/${year}`,
  EXPENSE_YEAR: (year: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/add-expense/year/${year}`,
}

export const financeApi = {
  getIncome: async () => {
    try {
      const response = await apiClient.get(buildUrl(FINANCE_ENDPOINTS.INCOME_ALL), {
        params: { page: 0, size: 100, sortDirection: 'desc' },
      })
      return response.data
    } catch (error) {
      console.error('Income API Error:', error)
      throw error
    }
  },

  getExpenses: async () => {
    try {
      const response = await apiClient.get(buildUrl(FINANCE_ENDPOINTS.EXPENSE_ALL), {
        params: { page: 0, size: 100, sortDirection: 'desc' },
      })
      return response.data
    } catch (error) {
      console.error('Expense API Error:', error)
      throw error
    }
  },

  getFinanceData: async () => {
    try {
      const [incomeResponse, expenseResponse] = await Promise.all([
        apiClient.get(buildUrl(FINANCE_ENDPOINTS.INCOME_ALL), {
          params: { page: 0, size: 100, sortDirection: 'desc' },
        }),
        apiClient.get(buildUrl(FINANCE_ENDPOINTS.EXPENSE_ALL), {
          params: { page: 0, size: 100, sortDirection: 'desc' },
        }),
      ])
      return { income: incomeResponse.data, expenses: expenseResponse.data }
    } catch (error) {
      console.error('Finance Data API Error:', error)
      throw error
    }
  },

  getYearlyIncome: async (year: number) => {
    try {
      const response = await apiClient.get(buildUrl(FINANCE_ENDPOINTS.INCOME_YEAR(year)), {
        params: { page: 0, size: 100, sortDirection: 'desc' },
      })
      return response.data
    } catch (error) {
      console.error('Yearly Income API Error:', error)
      throw error
    }
  },

  getYearlyExpenses: async (year: number) => {
    try {
      const response = await apiClient.get(buildUrl(FINANCE_ENDPOINTS.EXPENSE_YEAR(year)), {
        params: { page: 0, size: 100, sortDirection: 'desc' },
      })
      return response.data
    } catch (error) {
      console.error('Yearly Expense API Error:', error)
      throw error
    }
  },

  getYearlyFinanceData: async (year: number) => {
    try {
      const [incomeResponse, expenseResponse] = await Promise.all([
        apiClient.get(buildUrl(FINANCE_ENDPOINTS.INCOME_YEAR(year)), {
          params: { page: 0, size: 100, sortDirection: 'desc' },
        }),
        apiClient.get(buildUrl(FINANCE_ENDPOINTS.EXPENSE_YEAR(year)), {
          params: { page: 0, size: 100, sortDirection: 'desc' },
        }),
      ])
      return { income: incomeResponse.data, expenses: expenseResponse.data }
    } catch (error) {
      console.error('Yearly Finance Data API Error:', error)
      throw error
    }
  },
}

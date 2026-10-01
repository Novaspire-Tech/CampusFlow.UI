import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export interface FeeRecord {
  feesId: number
  totalFees: string
  paid: string
  pending: string
  fine: string | null
  feeTypeId: number
  feeTypeName: string
  studentId: number
  studentName: string
  admissionNo: string
  rollNo: string
  classId: number
  className: string
  sectionId: number
  sectionName: string
  date?: string
  createdAt?: string
}

interface FeesApiResponse {
  status: number
  message: string
  data: {
    fees: FeeRecord[]
    totalItems: number
    totalPages: number
    currentPage: number
  }
}

export const feesApi = {
  getAllFees: async (
    schoolCode: string,
    page: number = 0,
    size: number = 100,
    sortDirection: string = 'desc',
  ): Promise<FeesApiResponse> => {
    try {
      const response = await apiClient.get<FeesApiResponse>(`/school/${schoolCode}/fees/all`, {
        params: {
          page,
          size,
          sortDirection,
        },
      })
      return response.data
    } catch (error) {
      console.error('Fees API Error:', error)
      throw error
    }
  },
}

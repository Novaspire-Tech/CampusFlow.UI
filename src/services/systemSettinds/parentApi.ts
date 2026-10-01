import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const schoolCode = localStorage.getItem('schoolCode')
    if (schoolCode) {
      config.headers['School-Code'] = schoolCode
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('schoolCode')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export interface ParentDashboardData {
  dueFees: number
  totalResults: number
  totalExpenses: number
  students?: Array<{
    studentId: number
    name: string
    class: string
    section: string
  }>
}

// Match the exact backend ParentResponse structure
export interface ParentResponse {
  parentId: number
  guardianName: string
  guardianPhone: string | null
  guardianRelation: string | null
  isActive: boolean | null
}

export interface PaginatedParentsResponse {
  totalItems: number
  totalPages: number
  currentPage: number
  parents: ParentResponse[]
}

export interface CommonResponse<T = any> {
  status: number
  message: string
  data: T
}

export const parentService = {
  // Get Parent Dashboard Analytics
  getParentDashboard: async (): Promise<ParentDashboardData> => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(`/school/${schoolCode}/parent/dashboard`)

      const apiResponse = response.data as CommonResponse<ParentDashboardData>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch parent dashboard')
      }

      return (
        apiResponse.data || {
          dueFees: 0,
          totalResults: 0,
          totalExpenses: 0,
        }
      )
    } catch (error) {
      console.error('Parent Dashboard API Error:', error)
      throw error
    }
  },

  // Get Parents List with Pagination - UPDATED ENDPOINT
  getParentsList: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<PaginatedParentsResponse> => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(
        `/school/${schoolCode}/student/parent`, // UPDATED ENDPOINT
        {
          params: {
            page,
            size,
            sortDirection,
          },
        },
      )

      const apiResponse = response.data as CommonResponse<PaginatedParentsResponse>

      console.log('Parents API Response:', apiResponse)

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch parents list')
      }

      // Ensure parents array exists even if empty
      const data = apiResponse.data || {
        totalItems: 0,
        totalPages: 1,
        currentPage: 0,
        parents: [],
      }

      return data
    } catch (error: any) {
      console.error('Parents List API Error:', error)
      console.error('Error details:', error.response?.data)
      throw error
    }
  },

  // Get Parent Details by ID - UPDATED ENDPOINT
  getParentById: async (parentId: number): Promise<ParentResponse> => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(
        `/school/${schoolCode}/student/parent/${parentId}`, // UPDATED ENDPOINT
      )

      const apiResponse = response.data as CommonResponse<ParentResponse>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch parent details')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Parent Details API Error:', error)
      throw error
    }
  },

  // Update Parent Status (Toggle) - UPDATED ENDPOINT
  updateParentStatus: async (parentId: number, isActive: boolean): Promise<void> => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.put(
        `/school/${schoolCode}/student/parent/${parentId}/status`, // UPDATED ENDPOINT
        { isActive },
      )

      const apiResponse = response.data as CommonResponse

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to update parent status')
      }
    } catch (error) {
      console.error('Update Parent Status API Error:', error)
      throw error
    }
  },

  // Delete Multiple Parents - UPDATED ENDPOINT
  deleteParents: async (parentIds: number[]): Promise<void> => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.delete(
        `/school/${schoolCode}/student/parent`, // UPDATED ENDPOINT
        {
          data: { parentIds },
        },
      )

      const apiResponse = response.data as CommonResponse

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to delete parents')
      }
    } catch (error) {
      console.error('Delete Parents API Error:', error)
      throw error
    }
  },

  // Get Parent's Students - UPDATED ENDPOINT
  getParentStudents: async (parentId: number) => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(
        `/school/${schoolCode}/student/parent/${parentId}/students`, // UPDATED ENDPOINT
      )

      const apiResponse = response.data as CommonResponse

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || "Failed to fetch parent's students")
      }

      return apiResponse.data
    } catch (error) {
      console.error('Parent Students API Error:', error)
      throw error
    }
  },

  // Create new parent - ADDED NEW METHOD
  createParent: async (parentData: Partial<ParentResponse>): Promise<ParentResponse> => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.post(
        `/school/${schoolCode}/student/parent`, // UPDATED ENDPOINT
        parentData,
      )

      const apiResponse = response.data as CommonResponse<ParentResponse>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to create parent')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Create Parent API Error:', error)
      throw error
    }
  },

  // Update parent - ADDED NEW METHOD
  updateParent: async (
    parentId: number,
    parentData: Partial<ParentResponse>,
  ): Promise<ParentResponse> => {
    try {
      const schoolCode = localStorage.getItem('schoolCode')
      if (!schoolCode) {
        throw new Error('School code not found')
      }

      const response = await apiClient.put(
        `/school/${schoolCode}/student/parent/${parentId}`, // UPDATED ENDPOINT
        parentData,
      )

      const apiResponse = response.data as CommonResponse<ParentResponse>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to update parent')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Update Parent API Error:', error)
      throw error
    }
  },
}

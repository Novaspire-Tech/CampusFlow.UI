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

const getSchoolCode = (): string =>
  localStorage.getItem('schoolCode') || 'default'

const getSchoolGroupCode = (): string =>
  localStorage.getItem('schoolGroupCode') || 'default'

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getSchoolGroupCode())
    .replace('{schoolCode}', getSchoolCode())

const STAFF_ENDPOINTS = {
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/all',
  GET_BY_ID: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff/${id}`,
  GET_BY_CODE:     '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/find',
  ADD:             '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/add',
  UPDATE: (staffCode: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff/update/${staffCode}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/delete-multiple',
  STATUS: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff/${id}/status`,
  ROLES:           '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/roles',
  DESIGNATIONS:    '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/designations',
  DEPARTMENTS:     '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/departments',
}

interface CommonResponse<T = any> {
  status: number
  message: string
  data: T
}

export interface Staff {
  id: number
  staffId: string
  staffCode: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  designation: string
  department: string
  status: 'active' | 'inactive'
  dateOfJoining?: string
  photo?: string
}

export interface StaffListResponse {
  data: any
  staffList: Staff[]
  currentPage: number
  totalElements: number
  totalPages: number
}

export const staffService = {
  // Get All Staff with Pagination
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<StaffListResponse> => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found. Please select a school first.')
      }

      const response = await apiClient.get(buildUrl(STAFF_ENDPOINTS.GET_ALL), {
        params: { page, size, sortDirection },
      })

      const apiResponse = response.data as CommonResponse<any>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch staff')
      }

      const pageData = apiResponse.data || {}

      const staffArray =
        pageData.staffList || pageData.Staff || pageData.staffs || pageData.data || []

      const staffList: Staff[] = staffArray.map((item: any, index: number) => ({
        id: item.id || item.staffId || index + 1,
        staffId: item.staffId?.toString() || `STAFF-${index + 1}`,
        staffCode: item.staffCode || item.employeeCode || item.staffId?.toString() || '',
        name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A',
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        email: item.email || 'N/A',
        phone: item.phone || item.phoneNumber || item.mobile || 'N/A',
        role: item.role || item.staffRole || 'N/A',
        designation: item.designation?.name || item.designation || 'N/A',
        department: item.department?.name || item.department || 'N/A',
        status: (item.status || 'active').toLowerCase() === 'active' ? 'active' : 'inactive',
        dateOfJoining: item.dateOfJoining || item.joiningDate,
        photo: item.photo || item.profilePicture || item.imageUrl,
      }))

      return {
        data: apiResponse.data,
        staffList,
        currentPage: pageData.currentPage || pageData.page || page,
        totalElements:
          pageData.totalElements || pageData.totalItems || pageData.totalCount || staffList.length,
        totalPages:
          pageData.totalPages ||
          Math.ceil((pageData.totalElements || staffList.length) / size) ||
          1,
      }
    } catch (error: any) {
      console.error('Staff API Error:', error)

      if (error.response) {
        console.error('API Response Error:', error.response.data)
        throw new Error(error.response.data?.message || `API Error: ${error.response.status}`)
      } else if (error.request) {
        console.error('No response received:', error.request)
        throw new Error('No response from server. Please check your network connection.')
      } else {
        throw error
      }
    }
  },

  // Get Staff by ID
  getById: async (staffId: string | number) => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(buildUrl(STAFF_ENDPOINTS.GET_BY_ID(staffId)))

      const apiResponse = response.data as CommonResponse<Staff>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch staff details')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Staff Details API Error:', error)
      throw error
    }
  },

  // Get Staff by Code
  getByCode: async (staffCode: string) => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(buildUrl(STAFF_ENDPOINTS.GET_BY_CODE), {
        params: { staffCode },
      })

      const apiResponse = response.data as CommonResponse<Staff>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to find staff')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Staff by Code API Error:', error)
      throw error
    }
  },

  // Add New Staff
  add: async (staffData: any) => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.post(buildUrl(STAFF_ENDPOINTS.ADD), staffData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const apiResponse = response.data as CommonResponse

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to add staff')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Add Staff API Error:', error)
      throw error
    }
  },

  // Update Staff
  update: async (staffCode: string, staffData: any) => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.put(
        buildUrl(STAFF_ENDPOINTS.UPDATE(staffCode)),
        staffData,
      )

      const apiResponse = response.data as CommonResponse

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to update staff')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Update Staff API Error:', error)
      throw error
    }
  },

  // Delete Staff
  delete: async (staffId: number | number[]) => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const ids = Array.isArray(staffId) ? staffId : [staffId]
      const response = await apiClient.delete(buildUrl(STAFF_ENDPOINTS.DELETE_MULTIPLE), {
        data: { ids },
      })

      const apiResponse = response.data as CommonResponse

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to delete staff')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Delete Staff API Error:', error)
      throw error
    }
  },

  // Update Staff Status (Toggle)
  updateStatus: async (staffId: number, status: 'active' | 'inactive') => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.put(buildUrl(STAFF_ENDPOINTS.STATUS(staffId)), {
        status,
      })

      const apiResponse = response.data as CommonResponse

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to update staff status')
      }

      return apiResponse.data
    } catch (error) {
      console.error('Update Staff Status API Error:', error)
      throw error
    }
  },

  // Get Staff Roles
  getRoles: async () => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(buildUrl(STAFF_ENDPOINTS.ROLES))

      const apiResponse = response.data as CommonResponse<string[]>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch staff roles')
      }

      return apiResponse.data || []
    } catch (error) {
      console.error('Staff Roles API Error:', error)
      throw error
    }
  },

  // Get Staff Designations
  getDesignations: async () => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(buildUrl(STAFF_ENDPOINTS.DESIGNATIONS))

      const apiResponse = response.data as CommonResponse<string[]>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch staff designations')
      }

      return apiResponse.data || []
    } catch (error) {
      console.error('Staff Designations API Error:', error)
      throw error
    }
  },

  // Get Staff Departments
  getDepartments: async () => {
    try {
      const schoolCode = getSchoolCode()
      if (!schoolCode || schoolCode === 'default') {
        throw new Error('School code not found')
      }

      const response = await apiClient.get(buildUrl(STAFF_ENDPOINTS.DEPARTMENTS))

      const apiResponse = response.data as CommonResponse<string[]>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch staff departments')
      }

      return apiResponse.data || []
    } catch (error) {
      console.error('Staff Departments API Error:', error)
      throw error
    }
  },
}
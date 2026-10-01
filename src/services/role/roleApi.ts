import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ================= INTERCEPTORS =================
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
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('schoolCode')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ================= COMMON HELPERS =================
const getSchoolCode = (): string =>
  localStorage.getItem('schoolCode') || 'default'

const getSchoolGroupCode = (): string =>
  localStorage.getItem('schoolGroupCode') || 'default'

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true'

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getSchoolGroupCode())
    .replace('{schoolCode}', getSchoolCode())

// ================= ENDPOINTS =================
const ROLE_ENDPOINTS = {
  GET_COUNT: '/school-group/{schoolGroupCode}/school/{schoolCode}/role/count',
  GET_COUNT_ALL: '/school-group/{schoolGroupCode}/school/role/count',

  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/role/getAll',
  GET_ALL_School: '/school-group/{schoolGroupCode}/school/role/getAll',

  GET_BY_ID: (roleId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/role/${roleId}/get`,
}

// ================= TYPES =================
interface CommonResponse<T = any> {
  status: number
  message: string
  data: T
}

export interface RoleCountData {
  adminCount?: number
  teacherCount?: number
  parentCount?: number
  studentCount?: number
  staffCount?: number
  [key: string]: number | undefined
}

// ================= SERVICE =================
export const roleApi = {

  // ✅ GET ROLE COUNT
  getRolesCount: async (): Promise<CommonResponse<RoleCountData>> => {
    try {
      const endpoint = isAllSchools()
        ? ROLE_ENDPOINTS.GET_COUNT_ALL
        : ROLE_ENDPOINTS.GET_COUNT

      const response = await apiClient.get(buildUrl(endpoint))

      const apiResponse = response.data as CommonResponse<any>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch role counts')
      }

      const data = apiResponse.data || {}

      let roleCounts: RoleCountData = {
        adminCount: 0,
        teacherCount: 0,
        parentCount: 0,
        studentCount: 0,
        staffCount: 0,
      }

      // ✅ ARRAY FORMAT SUPPORT
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const roleName = (item.roleName || item.title || '').toUpperCase()
          const count = item.count || item.userCount || 0

          switch (roleName) {
            case 'ADMIN':
              roleCounts.adminCount = count
              break
            case 'TEACHER':
              roleCounts.teacherCount = count
              break
            case 'PARENT':
              roleCounts.parentCount = count
              break
            case 'STUDENT':
              roleCounts.studentCount = count
              break
            case 'STAFF':
              roleCounts.staffCount = count
              break
          }
        })
      } else {
        // ✅ OBJECT FORMAT SUPPORT
        roleCounts = {
          adminCount: data.adminCount || data.ADMIN || 0,
          teacherCount: data.teacherCount || data.TEACHER || 0,
          parentCount: data.parentCount || data.PARENT || 0,
          studentCount: data.studentCount || data.STUDENT || 0,
          staffCount: data.staffCount || data.STAFF || 0,
        }
      }

      return {
        status: apiResponse.status,
        message: apiResponse.message,
        data: roleCounts,
      }

    } catch (error: any) {
      console.error('Role Counts API Error:', error)
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch role counts'
      )
    }
  },

  // ✅ GET ALL ROLES
  getAllRoles: async () => {
    try {
      const endpoint = isAllSchools()
        ? ROLE_ENDPOINTS.GET_ALL_School
        : ROLE_ENDPOINTS.GET_ALL

      const response = await apiClient.get(buildUrl(endpoint))

      const apiResponse = response.data as CommonResponse<any[]>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch roles')
      }

      return apiResponse.data || []
    } catch (error: any) {
      console.error('Get All Roles API Error:', error)
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch roles'
      )
    }
  },

  // ✅ GET ROLE BY ID
  getRoleById: async (roleId: number) => {
    try {
      const response = await apiClient.get(
        buildUrl(ROLE_ENDPOINTS.GET_BY_ID(roleId))
      )

      const apiResponse = response.data as CommonResponse<any>

      if (apiResponse.status !== 200 && apiResponse.status !== 201) {
        throw new Error(apiResponse.message || 'Failed to fetch role')
      }

      return apiResponse.data
    } catch (error: any) {
      console.error('Get Role API Error:', error)
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch role'
      )
    }
  },
}
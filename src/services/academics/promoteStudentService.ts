import AxiosFunc from '../../utils/axios'
import type { PromoteStudentRequest } from '../../types/academics/promoteStudentTypes'

const getSchoolGroupCode = (): string => {
  const schoolGroupCode = localStorage.getItem('schoolGroupCode')
  if (!schoolGroupCode) {
    console.error('School group code not found')
    return 'default'
  }
  return schoolGroupCode
}

const getSchoolCode = (): string => {
  return localStorage.getItem('schoolCode') || 'default'
}

const buildUrl = (endpoint: string) => {
  const schoolGroupCode = getSchoolGroupCode()
  const schoolCode = getSchoolCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode).replace('{schoolCode}', schoolCode)
}

const STUDENT_PROMOTION_ENDPOINTS = {
  PROMOTE: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-promotion/promote',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/student/all',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/student/filter',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const studentPromotionService = {
  getAll: async (page = 0, size = 10, sortDirection = 'asc') => {
    const endpoint = isAllSchools()
      ? STUDENT_PROMOTION_ENDPOINTS.GET_ALL_SCHOOL
      : '/school-group/{schoolGroupCode}/school/{schoolCode}/student/all'

    const response = await AxiosFunc.Get(buildUrl(endpoint), {
      page,
      size,
      sortDirection,
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch students')

    return {
      students: response.data?.data?.students || [],
      currentPage: response.data?.data?.currentPage || 0,
      totalItems: response.data?.data?.totalItems || 0,
      totalPages: response.data?.data?.totalPages || 0,
    }
  },

  search: async (
    params: {
      schoolClassId?: string
      sectionId?: string
      searchQuery?: string
      sessionStatus?: string
    },
    page = 0,
    size = 10,
    sortBy = 'admissionNo',
    sortDirection: 'asc' | 'desc' = 'asc',
  ) => {
    const body: Record<string, any> = {}
    if (params.schoolClassId) body.schoolClassId = Number(params.schoolClassId)
    if (params.sectionId) body.sectionId = Number(params.sectionId)
    if (params.searchQuery?.trim()) body.searchQuery = params.searchQuery.trim()
    if (params.sessionStatus) body.sessionStatus = params.sessionStatus

    const endpoint = isAllSchools()
      ? STUDENT_PROMOTION_ENDPOINTS.FILTER_SCHOOL
      : '/school-group/{schoolGroupCode}/school/{schoolCode}/student/filter'

    const qs = `page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    const response = await AxiosFunc.Post(`${buildUrl(endpoint)}?${qs}`, body)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to search students')

    return {
      students: response.data?.data?.students || [],
      currentPage: response.data?.data?.currentPage || 0,
      totalItems: response.data?.data?.totalItems || 0,
      totalPages: response.data?.data?.totalPages || 0,
    }
  },

  promoteStudents: async (data: PromoteStudentRequest): Promise<void> => {
    try {
      console.log('Promoting students with data:', JSON.stringify(data, null, 2))

      const requestData = {
        classId: data.classId,
        classDepartmentId: data.departmentId,
        sectionId: data.sectionId,
        sessionName: data.sessionName,
        fees: data.fees,
        isFeesForward: data.isFeesForward,
        students: data.students,
      }

      console.log('Sending to backend:', JSON.stringify(requestData, null, 2))

      const response = await AxiosFunc.Post(
        buildUrl(STUDENT_PROMOTION_ENDPOINTS.PROMOTE),
        requestData,
      )

      console.log('Promotion response:', response.data)

      if (response.data?.status === 200) {
        return response.data.data
      }

      const errorMsg =
        response.data?.message || `Failed to process students (Status: ${response.data?.status})`
      console.error('Backend returned error:', response.data)
      throw new Error(errorMsg)
    } catch (error: any) {
      console.error('Error in student promotion:', error)
      console.error('Error response:', error.response?.data)

      let errorMessage = 'Failed to process students'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
        if (errorMessage.includes('%s')) {
          errorMessage = errorMessage.replace('%s', '').trim()
          if (errorMessage.endsWith('not found')) {
            errorMessage = errorMessage.replace('not found', '').trim() + ' not found'
          }
        }
      } else if (error.response?.data?.data) {
        if (Array.isArray(error.response.data.data)) {
          errorMessage = `Invalid student IDs: ${error.response.data.data.join(', ')}`
        } else if (typeof error.response.data.data === 'string') {
          errorMessage = error.response.data.data
        } else {
          errorMessage = `Invalid data: ${JSON.stringify(error.response.data.data)}`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      throw new Error(errorMessage)
    }
  },
}

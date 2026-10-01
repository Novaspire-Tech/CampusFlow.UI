import AxiosFunc from '../../utils/axios'
import type { ExamType, ExamTypeFormData } from '../../types/examination/examType'

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

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode).replace('{schoolCode}', schoolCode)
}

const EXAM_TYPE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/examination/exam-type',
  GET_BY_ID: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/examination/exam-type/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/examination/exam-type',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/examination/exam-type/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/examination/exam-type/${id}`,
}

const transformBackendToFrontend = (item: any): ExamType => ({
  id: item.examTypeId?.toString() || '',
  examTypeId: item.examTypeId?.toString() || '',
  examType: item.examType || '',
  description: item.description || '',
})

const transformFrontendToBackend = (data: ExamTypeFormData) => ({
  examType: data.examType,
  description: data.description || '',
})
export const examTypeService = {
  getAll: async (): Promise<ExamType[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EXAM_TYPE_ENDPOINTS.GET_ALL), {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
      })

      const backendList = response.data?.data?.source || [] // <-- use 'source'

      return backendList.map((item: any) => ({
        id: item.examTypeId?.toString(),
        examTypeId: item.examTypeId?.toString(),
        examType: item.examType,
        description: item.description || '',
      }))
    } catch (error: any) {
      console.error('Error fetching exam types:', error)
      return []
    }
  },

  getById: async (id: string): Promise<ExamType | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EXAM_TYPE_ENDPOINTS.GET_BY_ID(id)))

      if (!response?.data?.data) return null

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      console.error('Error fetching exam type:', error)
      return null
    }
  },

  create: async (data: ExamTypeFormData): Promise<ExamType> => {
    try {
      const payload = transformFrontendToBackend(data)

      const response = await AxiosFunc.Post(buildUrl(EXAM_TYPE_ENDPOINTS.CREATE), payload)

      if (!response?.data?.data) {
        throw new Error('Invalid create response')
      }

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create exam type',
      )
    }
  },

  update: async (id: string, data: ExamTypeFormData): Promise<ExamType> => {
    try {
      const payload = transformFrontendToBackend(data)

      const response = await AxiosFunc.Put(buildUrl(EXAM_TYPE_ENDPOINTS.UPDATE(id)), payload)

      if (!response?.data?.data) {
        throw new Error('Invalid update response')
      }

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update exam type',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await AxiosFunc.Delete(buildUrl(EXAM_TYPE_ENDPOINTS.DELETE(id)))
    } catch (error: any) {
      if (error.response?.status === 500) return

      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete exam type',
      )
    }
  },
}

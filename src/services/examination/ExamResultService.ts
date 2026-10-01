import AxiosFunc from '../../utils/axios'
import type { ExamResultDto } from '../../types/examination/ExamResult'
const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/exam-results/all',

  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/exam-results/get-all-by-group',

  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/exam-results/add',

  UPDATE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/exam-results/update/${id}`,

  DELETE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/exam-results/delete/${id}`,

  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/exam-results/delete-multiple',
}

const transformToDTO = (data: ExamResultDto) => ({
  templateName: String(data.templateName),
  school: String(data.school),
  schoolClassId: Number(data.schoolClassId),
  sessionId: Number(data.sessionId),
})

const transformFromBackend = (item: any): ExamResultDto => ({
  examResultID: item.examResultID,
  templateName: item.templateName || '',
  school: item.school || '',
  schoolClassId: item.schoolClass?.classId || item.schoolClassId,
  sessionId: item.session?.sessionId || item.sessionId,
})

export const examResultService = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<ExamResultDto[]> => {
    try {
      const endpoint = isAllSchools() ? ENDPOINTS.GET_ALL_SCHOOL : ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection,
      })

      if (response.data?.status !== 200) return []

      const raw = response.data?.data?.content || response.data?.data || []

      if (!Array.isArray(raw)) return []

      return raw.map(transformFromBackend)
    } catch (error: any) {
      console.error('Error fetching exam results:', error)
      return []
    }
  },
  create: async (data: ExamResultDto) => {
    try {
      const response = await AxiosFunc.Post(ENDPOINTS.CREATE, transformToDTO(data))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }

      return transformFromBackend(response.data?.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  update: async (id: string | number, data: ExamResultDto) => {
    try {
      const response = await AxiosFunc.Put(ENDPOINTS.UPDATE(id), transformToDTO(data))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }

      return transformFromBackend(response.data?.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  delete: async (id: string | number) => {
    try {
      const response = await AxiosFunc.Delete(ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ENDPOINTS.DELETE_MULTIPLE, ids)

      if (response.data?.status !== 200) {
        throw new Error('Failed to delete exam results')
      }

      if (
        response.data?.message &&
        response.data.message.toLowerCase() !== 'success' &&
        response.data.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      console.error('Delete multiple error:', error)
      throw new Error(error.response?.data?.message || error.message)
    }
  },
}

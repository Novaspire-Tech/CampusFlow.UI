import AxiosFunc from '../../utils/axios'
import type { MarksGrade, MarksGradeFormData } from '../../types/examination/MarksGrades'

const getSchoolCode = (): string => {
  return localStorage.getItem('schoolCode') || 'default'
}

const getSchoolGroupCode = (): string => {
  const schoolGroupCode = localStorage.getItem('schoolGroupCode')
  if (!schoolGroupCode) {
    console.error('School group code not found')
    return 'default'
  }
  return schoolGroupCode
}

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode).replace('{schoolCode}', schoolCode)
}

const MARKS_GRADE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/marks-grade/all',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/marks-grade/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/marks-grade/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/marks-grade/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/marks-grade/delete-multiple',
}

const transformBackendToFrontend = (item: any): MarksGrade => {
  return {
    id: item.marksGradeId?.toString() || '',
    marksGradeId: item.marksGradeId?.toString() || '',
    gradePoint: item.gradePoint || '',
    gradeName: item.gradeName || '',
    markDivision: item.markDivision
      ? {
          markDivisionId: item.markDivision.markDivisionId?.toString() || '',
          divisionName: item.markDivision.divisionName || '',
          percentFrom: item.markDivision.percentFrom || '',
          percentUpTo: item.markDivision.percentUpTo || '',
        }
      : undefined,
    markDivisionId: item.markDivision?.markDivisionId?.toString() || '',
    examGroup: item.examGroup
      ? {
          examGroupId: item.examGroup.examGroupId?.toString() || '',
          name: item.examGroup.name || '',
        }
      : undefined,
    examGroupId: item.examGroup?.examGroupId?.toString() || '',
  }
}

const transformFrontendToBackend = (data: MarksGradeFormData) => ({
  gradePoint: data.gradePoint,
  gradeName: data.gradeName || '',
  markDivisionId: Number(data.markDivisionId),
  examGroupId: Number(data.examGroupId),
})

export const marksGradeService = {
  getAll: async (): Promise<MarksGrade[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(MARKS_GRADE_ENDPOINTS.GET_ALL))

      const backendList = response.data?.data || []

      return backendList.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('Error fetching marks grades:', error)
      return []
    }
  },

  create: async (data: MarksGradeFormData): Promise<MarksGrade> => {
    try {
      const payload = transformFrontendToBackend(data)

      const response = await AxiosFunc.Post(buildUrl(MARKS_GRADE_ENDPOINTS.CREATE), payload)

      if (!response?.data?.data) {
        throw new Error('Invalid create response')
      }

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create marks grade',
      )
    }
  },

  update: async (id: string, data: MarksGradeFormData): Promise<MarksGrade> => {
    try {
      const payload = transformFrontendToBackend(data)

      const response = await AxiosFunc.Put(buildUrl(MARKS_GRADE_ENDPOINTS.UPDATE(id)), payload)

      if (!response?.data?.data) {
        throw new Error('Invalid update response')
      }

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update marks grade',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await AxiosFunc.Delete(buildUrl(MARKS_GRADE_ENDPOINTS.DELETE(id)))
    } catch (error: any) {
      if (error.response?.status === 500) return
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete marks grade',
      )
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      await AxiosFunc.Delete(buildUrl(MARKS_GRADE_ENDPOINTS.DELETE_MULTIPLE), ids)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete marks grades',
      )
    }
  },
}

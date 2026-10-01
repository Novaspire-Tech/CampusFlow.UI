import AxiosFunc from '../../utils/axios'
import type { SchoolClass, SchoolClassFormData } from '../../types/academics/class'
import type { SubjectFromBackend } from '../../types/academics/subject'

const SCHOOL_CLASS_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/class/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/class/all',
  GET_ALL_BY_SESSION: (sessionId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/session/${sessionId}/class/all`,

  GET_ALL_SUBJECTS: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/class/${id}/get-all-subjects`,

  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/class/${id}`,

  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/class',

  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/class/${id}`,

  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/class/${id}`,

  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/class',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformToDTO = (data: SchoolClassFormData) => ({
  className: data.className,
})

const transformFromBackend = (item: any): SchoolClass => {
  const sections = Array.isArray(item.sections)
    ? item.sections.map((section: any) => ({
        sectionId: section.sectionId,
        sectionName: section.sectionName,
      }))
    : []

  return {
    id: item.schoolClassId?.toString() || '',
    schoolClassId: item.schoolClassId,
    className: item.className || '',
    sections,
    name: item.className || '',
  }
}

const transformFromBackendToSubject = (item: any): SubjectFromBackend => ({
  subjectId: item.subjectId?.toString() || '',
  subjectName: item.subjectName || '',
  subjectCode: item.subjectCode || '',
  subjectType: item.subjectType || '',
})

export const schoolClassService = {
  getAll: async (): Promise<SchoolClass[]> => {
    try {
      const endpoint = isAllSchools()
        ? SCHOOL_CLASS_ENDPOINTS.GET_ALL_SCHOOL
        : SCHOOL_CLASS_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
        sortBy: 'className',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch classes')
      }

      const classes = response.data?.data?.classes || response.data?.data || []

      if (!Array.isArray(classes)) {
        console.warn('Expected array but got:', classes)
        return []
      }

      return classes.map(transformFromBackend)
    } catch (error: any) {
      console.error('Error fetching classes:', error)
      return []
    }
  },

  getAllBySession: async (sessionId: string): Promise<SchoolClass[]> => {
    try {
      const response = await AxiosFunc.Get(SCHOOL_CLASS_ENDPOINTS.GET_ALL_BY_SESSION(sessionId), {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
        sortBy: 'className',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch classes by session')
      }

      const classes = response.data?.data?.classes || response.data?.data || []

      if (!Array.isArray(classes)) {
        console.warn('Expected array but got:', classes)
        return []
      }

      return classes.map(transformFromBackend)
    } catch (error: any) {
      console.error('Error fetching classes by session:', error)
      return []
    }
  },

  getAllSubjects: async (id: string): Promise<SubjectFromBackend[]> => {
    try {
      const response = await AxiosFunc.Get(SCHOOL_CLASS_ENDPOINTS.GET_ALL_SUBJECTS(id))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch subjects')
      }

      const subjects = response.data?.data || []

      if (!Array.isArray(subjects)) {
        console.warn('Expected array but got:', subjects)
        return []
      }

      return subjects.map(transformFromBackendToSubject)
    } catch (error: any) {
      console.error('Error fetching subjects:', error)
      return []
    }
  },

  getById: async (id: string): Promise<SchoolClass | null> => {
    try {
      const response = await AxiosFunc.Get(SCHOOL_CLASS_ENDPOINTS.GET_BY_ID(id))

      if (response.data?.status !== 200) {
        return null
      }

      const item = response.data?.data
      if (!item) return null

      return transformFromBackend(item)
    } catch (error: any) {
      console.error('Error fetching class:', error)
      return null
    }
  },

  create: async (data: SchoolClassFormData): Promise<SchoolClass> => {
    try {
      const dto = transformToDTO(data)

      const response = await AxiosFunc.Post(SCHOOL_CLASS_ENDPOINTS.CREATE, dto)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to create class')
      }

      const item = response.data?.data
      if (!item) throw new Error('No data returned from server')

      return transformFromBackend(item)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create class')
    }
  },

  update: async (id: string, data: SchoolClassFormData): Promise<SchoolClass> => {
    try {
      const dto = transformToDTO(data)

      const response = await AxiosFunc.Put(SCHOOL_CLASS_ENDPOINTS.UPDATE(id), dto)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update class')
      }

      const item = response.data?.data
      if (!item) throw new Error('No data returned from server')

      return transformFromBackend(item)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update class')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(SCHOOL_CLASS_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete class')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete class')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id))

      const response = await AxiosFunc.Delete(SCHOOL_CLASS_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete classes')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete classes')
    }
  },
}

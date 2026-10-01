import AxiosFunc from '../../utils/axios'
import type { Subject, SubjectFormData } from '../../types/academics/subject'

const SUBJECT_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject/all',
  GET_ALL_PAGINATED: '/school-group/{schoolGroupCode}/school/subject/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject/filter',
  FILTER_PAGINATED: '/school-group/{schoolGroupCode}/school/subject/filter',
  FIND_BY_NAME: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject/find',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject/add',
  UPDATE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/subject/update/${id}`,
  DELETE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/subject/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject/delete-multiple',
  DELETE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject/delete-all',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export interface SubjectListResponse {
  subjects: Subject[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface SubjectSearchParams {
  search?: string
  subjectType?: string
}

const transformBackendToFrontend = (item: any): Subject => ({
  id: item.subjectId?.toString() ?? '',
  subjectName: item.subjectName ?? '',
  subjectType: item.subjectType ?? '',
  subjectCode: item.subjectCode ?? '',
  subjectGroupId: undefined,
  name: '',
  subjectId: '',
})

const transformFrontendToBackend = (data: SubjectFormData) => ({
  subjectName: data.subjectName.trim(),
  subjectType: data.subjectType,
  subjectCode: data.subjectCode?.trim() ?? '',
})

export const subjectService = {
  getAll: async (
    page = 0,
    size = 1000,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<SubjectListResponse> => {
    try {
      const endpoint = isAllSchools()
        ? SUBJECT_ENDPOINTS.GET_ALL_PAGINATED
        : SUBJECT_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection,
        sortBy: 'subjectName',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch subjects')
      }

      const raw = response.data?.data

      // isAllSchools = true  → paginated response { subjects: [...], currentPage, totalItems, totalPages }
      // isAllSchools = false → direct array
      if (isAllSchools()) {
        return {
          subjects: (raw?.subjects || raw?.Subject || []).map(transformBackendToFrontend),
          currentPage: raw?.currentPage ?? page,
          totalItems: raw?.totalItems ?? 0,
          totalPages: raw?.totalPages ?? 0,
        }
      } else {
        const list: any[] = Array.isArray(raw) ? raw : (raw?.Subject ?? raw?.subjects ?? [])
        return {
          subjects: list.map(transformBackendToFrontend),
          currentPage: page,
          totalItems: list.length,
          totalPages: Math.ceil(list.length / size),
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      return { subjects: [], currentPage: 0, totalItems: 0, totalPages: 0 }
    }
  },

  filter: async (
    params: SubjectSearchParams,
    page = 0,
    size = 10,
    sortBy = 'subjectName',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<SubjectListResponse> => {
    try {
      const body: Record<string, any> = {}
      if (params.search?.trim()) body.search = params.search.trim()
      if (params.subjectType) body.subjectType = params.subjectType

      const baseEndpoint = isAllSchools()
        ? SUBJECT_ENDPOINTS.FILTER_PAGINATED
        : SUBJECT_ENDPOINTS.FILTER

      const url = `${baseEndpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

      const response = await AxiosFunc.Post(url, body)

      if (!response?.data) return { subjects: [], currentPage: page, totalItems: 0, totalPages: 0 }

      if (response.data.status !== 200)
        return { subjects: [], currentPage: page, totalItems: 0, totalPages: 0 }

      const raw = response.data?.data
      return {
        subjects: (raw?.subjects || raw?.Subject || []).map(transformBackendToFrontend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error filtering subjects:', error)
      return { subjects: [], currentPage: page, totalItems: 0, totalPages: 0 }
    }
  },

  findByName: async (name: string): Promise<Subject[]> => {
    try {
      const response = await AxiosFunc.Get(SUBJECT_ENDPOINTS.FIND_BY_NAME, { name })
      const raw = response.data?.data
      const list: any[] = Array.isArray(raw) ? raw : raw ? [raw] : []
      return list.map(transformBackendToFrontend)
    } catch (error) {
      console.error('Error finding subject:', error)
      return []
    }
  },

  create: async (data: SubjectFormData): Promise<Subject> => {
    try {
      const payload = transformFrontendToBackend(data)
      const response = await AxiosFunc.Post(SUBJECT_ENDPOINTS.CREATE, payload)
      if (!response?.data?.data) throw new Error('Invalid response from server')
      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to create subject')
    }
  },

  update: async (id: string, data: SubjectFormData): Promise<Subject> => {
    try {
      const payload = transformFrontendToBackend(data)
      const response = await AxiosFunc.Put(SUBJECT_ENDPOINTS.UPDATE(id), payload)
      if (!response?.data?.data) throw new Error('Invalid response from server')
      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to update subject')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(SUBJECT_ENDPOINTS.DELETE(id))
      const resData = response?.data
      if (
        resData?.data === null &&
        resData?.message &&
        !resData.message.toLowerCase().includes('success')
      ) {
        throw new Error(resData.message)
      }
    } catch (error: any) {
      if (error instanceof Error) throw error
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to delete subject')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map(Number)
      const response = await AxiosFunc.Delete(SUBJECT_ENDPOINTS.DELETE_MULTIPLE, numericIds)
      const resData = response?.data
      if (
        resData?.data === null &&
        resData?.message &&
        !resData.message.toLowerCase().includes('success')
      ) {
        throw new Error(resData.message)
      }
    } catch (error: any) {
      if (error instanceof Error) throw error
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to delete subjects')
    }
  },

  deleteAll: async (): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(SUBJECT_ENDPOINTS.DELETE_ALL)
      const resData = response?.data
      if (
        resData?.data === null &&
        resData?.message &&
        !resData.message.toLowerCase().includes('success')
      ) {
        throw new Error(resData.message)
      }
    } catch (error: any) {
      if (error instanceof Error) throw error
      throw new Error(
        error.response?.data?.message ?? error.message ?? 'Failed to delete all subjects',
      )
    }
  },
}

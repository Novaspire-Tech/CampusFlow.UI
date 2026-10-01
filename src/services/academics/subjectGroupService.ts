import AxiosFunc from '../../utils/axios'
import type { SubjectGroup, SubjectGroupFormData } from '../../types/academics/subjectGroup'

const SUBJECT_GROUP_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/all',
  GET_ALL_PAGINATED: '/school-group/{schoolGroupCode}/school/subject-group/all',
  GET_BY_SUBJECT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/${id}/subject`,
  GET_BY_CLASS: (classId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/get-by/school-class/${classId}`,
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/filter',
  FILTER_PAGINATED: '/school-group/{schoolGroupCode}/school/subject-group/filter',
  FIND_BY_NAME: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/find',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/subject-group/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export interface SubjectGroupListResponse {
  data?: SubjectGroup[]
  subjectGroups: SubjectGroup[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface SubjectGroupSearchParams {
  classId?: string
  subjectGroupName?: string
  subjectId?: string
  search?: string
}

export interface SubjectInfo {
  id: string
  subjectId: string
  subjectName: string
  subjectType?: string
  subjectCode?: string
}

const transformToDTO = (data: SubjectGroupFormData) => {
  let subjectIds: number[]
  if (Array.isArray(data.subjectIds)) {
    subjectIds = data.subjectIds.map((id) => Number(id))
  } else if (data.subjectIds) {
    subjectIds = [Number(data.subjectIds)]
  } else if (data.subjectId) {
    subjectIds = [Number(data.subjectId)]
  } else {
    subjectIds = []
  }
  return {
    subjectGroup: data.subjectGroup.trim(),
    description: data.description?.trim() || '',
    classId: Number(data.schoolClassId),
    subjectIds,
  }
}

const transformFromBackend = (item: any): SubjectGroup => {
  const subjects =
    item.subjects?.map((subject: any) => ({
      id: subject.subjectId?.toString(),
      subjectId: subject.subjectId?.toString(),
      subjectName: subject.subjectName,
      subjectType: subject.subjectType,
      subjectCode: subject.subjectCode,
    })) || []

  return {
    id: item.subjectGroupId?.toString(),
    subjectGroupId: item.subjectGroupId?.toString(),
    subjectGroup: item.subjectGroup,
    description: item.description,
    schoolClass: {
      id: item.classId?.toString(),
      schoolClassId: item.classId?.toString(),
      className: item.className,
    },
    subjects,
    subject: subjects[0] || undefined,
    name: item.subjectGroup || '',
  }
}

const transformSubjectFromBackend = (item: any): SubjectInfo => ({
  id: item.subjectId?.toString(),
  subjectId: item.subjectId?.toString(),
  subjectName: item.subjectName,
  subjectType: item.subjectType,
  subjectCode: item.subjectCode,
})

export const subjectGroupService = {
  getAll: async (
    page = 0,
    size = 10,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<SubjectGroupListResponse> => {
    try {
      const endpoint = isAllSchools()
        ? SUBJECT_GROUP_ENDPOINTS.GET_ALL_PAGINATED
        : SUBJECT_GROUP_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })

      if (!response?.data)
        return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }

      if (response.data?.status !== 200)
        return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }

      const raw = response.data?.data
      const list: any[] = Array.isArray(raw?.subjectGroups)
        ? raw.subjectGroups
        : Array.isArray(raw?.subjectGroup)
          ? raw.subjectGroup
          : []

      return {
        subjectGroups: list.map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? list.length,
        totalPages: raw?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('❌ getAll error:', error.message)
      return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }
    }
  },

  getByClass: async (classId: string): Promise<SubjectGroup[]> => {
    try {
      const response = await AxiosFunc.Get(SUBJECT_GROUP_ENDPOINTS.GET_BY_CLASS(classId))
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch subject groups by class')
      }
      const data = response.data?.data
      if (!data) return []
      return Array.isArray(data) ? data.map(transformFromBackend) : [transformFromBackend(data)]
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch subject groups by class',
      )
    }
  },

  getSubjectsByGroup: async (subjectGroupId: string): Promise<SubjectInfo[]> => {
    try {
      const response = await AxiosFunc.Get(SUBJECT_GROUP_ENDPOINTS.GET_BY_SUBJECT(subjectGroupId))
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch subjects by group')
      }
      const data = response.data?.data
      if (!data) return []
      return Array.isArray(data)
        ? data.map(transformSubjectFromBackend)
        : [transformSubjectFromBackend(data)]
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch subjects by group',
      )
    }
  },

  filter: async (
    params: SubjectGroupSearchParams,
    page = 0,
    size = 10,
    sortBy = '',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<SubjectGroupListResponse> => {
    try {
      const body: Record<string, any> = {}
      if (params.classId) body.classId = Number(params.classId)
      if (params.subjectId) body.subjectId = Number(params.subjectId)

      const searchTerm = params.subjectGroupName?.trim() || params.search?.trim()
      if (searchTerm) body.search = searchTerm

      const baseEndpoint = isAllSchools()
        ? SUBJECT_GROUP_ENDPOINTS.FILTER_PAGINATED
        : SUBJECT_GROUP_ENDPOINTS.FILTER

      const qs = `page=${page}&size=${size}&sortDirection=${sortDirection}${sortBy ? `&sortBy=${sortBy}` : ''}`
      const url = `${baseEndpoint}?${qs}`

      const response = await AxiosFunc.Post(url, body)

      if (!response?.data)
        return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }

      if (response.data.status === 404 || response.data.status === 204)
        return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }

      if (response.data.status !== 200)
        return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }

      const raw = response.data?.data
      const list: any[] = Array.isArray(raw?.subjectGroups)
        ? raw.subjectGroups
        : Array.isArray(raw?.subjectGroup)
          ? raw.subjectGroup
          : []

      return {
        subjectGroups: list.map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? list.length,
        totalPages: raw?.totalPages ?? 0,
      }
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.data?.status === 404)
        return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }

      console.error('❌ filter error:', error.message)
      return { subjectGroups: [], currentPage: page, totalItems: 0, totalPages: 0 }
    }
  },

  findByName: async (name: string): Promise<SubjectGroup[]> => {
    try {
      const response = await AxiosFunc.Get(SUBJECT_GROUP_ENDPOINTS.FIND_BY_NAME, { name })
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to find subject group')
      }
      const data = response.data?.data
      if (!data) return []
      return Array.isArray(data) ? data.map(transformFromBackend) : [transformFromBackend(data)]
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to find subject group',
      )
    }
  },

  create: async (data: SubjectGroupFormData): Promise<SubjectGroup | null> => {
    try {
      const dto = transformToDTO(data)
      if (!dto.subjectIds || dto.subjectIds.length === 0)
        throw new Error('At least one subject is required')

      const response = await AxiosFunc.Post(SUBJECT_GROUP_ENDPOINTS.CREATE, dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create subject group')

      if (!response.data.data) return null
      return transformFromBackend(response.data.data)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to create subject group',
      )
    }
  },

  update: async (id: string, data: SubjectGroupFormData): Promise<SubjectGroup | null> => {
    try {
      const dto = transformToDTO(data)
      if (!dto.subjectIds || dto.subjectIds.length === 0)
        throw new Error('At least one subject is required')

      const response = await AxiosFunc.Put(SUBJECT_GROUP_ENDPOINTS.UPDATE(id), dto)
      if (!response.data || response.data.status !== 200)
        throw new Error(response.data?.message || 'Failed to update subject group')

      if (!response.data.data) return null
      return transformFromBackend(response.data.data)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to update subject group',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(SUBJECT_GROUP_ENDPOINTS.DELETE(id))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete subject group')
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete subject group',
      )
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id))
      const response = await AxiosFunc.Delete(SUBJECT_GROUP_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete subject groups')

      if (
        response.data?.message &&
        response.data?.message.toLowerCase() !== 'success' &&
        response.data?.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete subject groups',
      )
    }
  },
}

import AxiosFunc from '../../utils/axios'
import type { Topic, TopicFormData } from '../../types/lessonPlan/topic'

const TOPIC_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/topic/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/topic/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/topic/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/topic/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/topic/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/topic/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/topic/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/topic/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export interface FilterTopicDto {
  schoolClassId?: number | null
  sectionId?: number | null
  subjectGroupId?: number | null
  subjectId?: number | null
  search?: string | null
}

export interface PaginatedTopicsResponse {
  topics: Topic[]
  currentPage: number
  totalItems: number
  totalPages: number
}

const transformBackendToFrontend = (b: any): Topic => ({
  id: b.topicId?.toString() || '',
  topicId: b.topicId?.toString() || '',
  topicName: b.topicName || '',
  className: b.className || '',
  section: b.sectionName || '',
  subjectGroup: b.subjectGroupName || '',
  subject: b.subjectName || '',
  schoolClassId: b.schoolClassId?.toString() || '',
  sectionId: b.sectionId?.toString() || '',
  subjectGroupId: b.subjectGroupId?.toString() || '',
  subjectId: b.subjectId?.toString() || '',
})

const extractPaginatedTopics = (response: any): PaginatedTopicsResponse => {
  const data = response?.data?.data
  const topics = data?.topics

  if (!Array.isArray(topics)) {
    console.warn('Topics array not found in response')
    return { topics: [], currentPage: 0, totalItems: 0, totalPages: 0 }
  }

  return {
    topics: topics.map(transformBackendToFrontend),
    currentPage: data.currentPage ?? 0,
    totalItems: data.totalItems ?? 0,
    totalPages: data.totalPages ?? 0,
  }
}

const transformFrontendToBackendDto = (data: TopicFormData) => ({
  schoolClassId: Number(data.schoolClassId),
  sectionId: Number(data.sectionId),
  subjectGroupId: Number(data.subjectGroupId),
  subjectId: Number(data.subjectId),
  topicName: data.topicName,
})

export const topicService = {
  getAll: async (
    page = 0,
    size = 10,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedTopicsResponse> => {
    const endpoint = isAllSchools() ? TOPIC_ENDPOINTS.GET_ALL_SCHOOL : TOPIC_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, {
      page,
      size,
      sortDirection,
    })

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to fetch topics')
    }

    return extractPaginatedTopics(response)
  },

  filter: async (
    dto: FilterTopicDto,
    page = 0,
    size = 10,
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedTopicsResponse> => {
    const baseEndpoint = isAllSchools() ? TOPIC_ENDPOINTS.FILTER_SCHOOL : TOPIC_ENDPOINTS.FILTER

    const qs = `page=${page}&size=${size}&sortDirection=${sortDirection}${sortBy ? `&sortBy=${sortBy}` : ''}`
    const url = `${baseEndpoint}?${qs}`

    const response = await AxiosFunc.Post(url, dto)

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to filter topics')
    }

    return extractPaginatedTopics(response)
  },

  create: async (data: TopicFormData): Promise<null> => {
    const dto = transformFrontendToBackendDto(data)
    const response = await AxiosFunc.Post(TOPIC_ENDPOINTS.CREATE, dto)

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Create failed')
    }

    return null
  },

  update: async (id: string, data: TopicFormData): Promise<null> => {
    const dto = transformFrontendToBackendDto(data)
    const response = await AxiosFunc.Put(TOPIC_ENDPOINTS.UPDATE(id), dto)

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Update failed')
    }

    return null
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(TOPIC_ENDPOINTS.DELETE(id))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Delete failed')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(TOPIC_ENDPOINTS.DELETE_MULTIPLE, ids.map(Number))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Delete multiple failed')
    }
  },
}

import AxiosFunc from '../../utils/axios'
import type {
  Lesson,
  LessonFormData,
  FilterLessonParams,
  LessonPagedResponse,
} from '../../types/lessonPlan/lesson'

const LESSON_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/lesson/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/lesson/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/lesson/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/lesson/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/lesson/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/lesson/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/lesson/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/lesson/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (b: any): Lesson => ({
  id: b.id?.toString() || '',
  lessonId: b.id?.toString() || '',
  lessonName: b.lessonName || '',
  lesson: b.lesson || b.lessonName || '',
  className: b.className || '',
  section: b.sectionName || '',
  subjectGroup: b.subjectGroupName || '',
  subject: b.subjectName || '',
  schoolClassId: b.classNameId?.toString() || '',
  sectionId: b.sectionId?.toString() || '',
  subjectGroupId: b.subjectGroupId?.toString() || '',
  subjectId: b.subjectId?.toString() || '',
})

const extractPagedResponse = (response: any): LessonPagedResponse => {
  const d = response?.data?.data
  return {
    lessons: Array.isArray(d?.lessons) ? d.lessons.map(transformBackendToFrontend) : [],
    currentPage: d?.currentPage ?? 0,
    totalItems: d?.totalItems ?? 0,
    totalPages: d?.totalPages ?? 0,
  }
}

const transformToBackendDto = (data: LessonFormData) => ({
  classNameId: Number(data.schoolClassId),
  sectionId: Number(data.sectionId),
  subjectGroupId: Number(data.subjectGroupId),
  subjectId: Number(data.subjectId),
  lessonName: data.lessonName,
  lesson: data.lesson || data.lessonName,
})

export const lessonService = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<LessonPagedResponse> => {
    const endpoint = isAllSchools() ? LESSON_ENDPOINTS.GET_ALL_SCHOOL : LESSON_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, {
      page,
      size,
      sortDirection,
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch lessons')

    return extractPagedResponse(response)
  },

  filter: async ({
    dto,
    page = 0,
    size = 10,
    sortBy,
    sortDirection = 'asc',
  }: FilterLessonParams): Promise<LessonPagedResponse> => {
    const body: Record<string, any> = {}
    if (dto.schoolClassId != null) body.schoolClassId = dto.schoolClassId
    if (dto.sectionId != null) body.sectionId = dto.sectionId
    if (dto.subjectGroupId != null) body.subjectGroupId = dto.subjectGroupId
    if (dto.subjectId != null) body.subjectId = dto.subjectId
    if (dto.search?.trim()) body.search = dto.search.trim()

    const baseEndpoint = isAllSchools() ? LESSON_ENDPOINTS.FILTER_SCHOOL : LESSON_ENDPOINTS.FILTER

    const qs = `page=${page}&size=${size}&sortDirection=${sortDirection}${sortBy ? `&sortBy=${sortBy}` : ''}`
    const url = `${baseEndpoint}?${qs}`

    const response = await AxiosFunc.Post(url, body)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to filter lessons')

    return extractPagedResponse(response)
  },

  create: async (data: LessonFormData): Promise<null> => {
    const response = await AxiosFunc.Post(LESSON_ENDPOINTS.CREATE, transformToBackendDto(data))
    if (response.data?.status !== 200) throw new Error(response.data?.message || 'Create failed')
    return null
  },

  update: async (id: string, data: LessonFormData): Promise<null> => {
    const response = await AxiosFunc.Put(LESSON_ENDPOINTS.UPDATE(id), transformToBackendDto(data))
    if (response.data?.status !== 200) throw new Error(response.data?.message || 'Update failed')
    return null
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(LESSON_ENDPOINTS.DELETE(id))
    if (response.data?.status !== 200) throw new Error(response.data?.message || 'Delete failed')
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(LESSON_ENDPOINTS.DELETE_MULTIPLE, ids.map(Number))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Delete multiple failed')
  },
}

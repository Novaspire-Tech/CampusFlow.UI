import AxiosFunc from '../../utils/axios'
import type {
  AssignClassTeacher,
  AssignClassTeacherFormData,
} from '../../types/academics/assignClassTeacher'

const EP = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-class-teacher/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/assign-class-teacher/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-class-teacher/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/assign-class-teacher/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-class-teacher/add',
  UPDATE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/assign-class-teacher/update/${id}`,
  DELETE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/assign-class-teacher/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-class-teacher/delete-multiple',
  DELETE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-class-teacher/delete-all',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export interface AssignClassTeacherListResponse {
  classTeachers: AssignClassTeacher[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface AssignClassTeacherSearchParams {
  classId?: string
  sectionId?: string
  teacherId?: string
  search?: string
}

const toDTO = (data: AssignClassTeacherFormData) => ({
  classTeacher: Number(data.teacherId),
  sectionId: Number(data.sectionId),
})

const fromBackend = (item: any): AssignClassTeacher => {
  const classId =
    item.teacherClass?.classId?.toString() ||
    item.schoolClass?.classId?.toString() ||
    item.schoolClass?.schoolClassId?.toString() ||
    ''

  const className = item.teacherClass?.className || item.schoolClass?.className || ''

  const teacherName = item.classTeacher || ''

  return {
    id: item.classTeacherId?.toString() || '',
    assignClassTeacherId: item.classTeacherId?.toString() || '',
    classTeacher: teacherName,

    teacher: {
      id: '',
      teacherId: '',
      name: teacherName,
      teacherName: teacherName,
    },

    schoolClass: {
      id: classId,
      schoolClassId: classId,
      className,
    },

    section: {
      id: item.section?.sectionId?.toString() || '',
      sectionId: item.section?.sectionId?.toString() || '',
      sectionName: item.section?.sectionName || '',
    },
  }
}

const extractList = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.classTeachers)) return raw.classTeachers
  if (Array.isArray(raw?.AssignTeacher)) return raw.AssignTeacher
  if (Array.isArray(raw?.addExpenses)) return raw.addExpenses
  if (Array.isArray(raw?.content)) return raw.content
  return []
}

export const assignClassTeacherService = {
  getAll: async (
    page = 0,
    size = 10,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<AssignClassTeacherListResponse> => {
    try {
      const endpoint = isAllSchools() ? EP.GET_ALL_SCHOOL : EP.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        params: { page, size, sortDirection },
      })

      if (!response?.data) throw new Error('No response data received')

      const raw = response.data?.data
      const list = extractList(raw)

      return {
        classTeachers: list.map(fromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? raw?.totalElements ?? list.length,
        totalPages: raw?.totalPages ?? 1,
      }
    } catch (error: any) {
      console.error('getAll assign class teacher error:', error)
      throw new Error(error.response?.data?.message || error.message)
    }
  },

  filter: async (
    params: AssignClassTeacherSearchParams,
    page = 0,
    size = 10,
    sortBy = '',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<AssignClassTeacherListResponse> => {
    try {
      const body: Record<string, any> = {}
      if (params.classId) body.classId = Number(params.classId)
      if (params.sectionId) body.sectionId = Number(params.sectionId)
      if (params.teacherId) body.teacherId = Number(params.teacherId)
      if (params.search?.trim()) body.search = params.search.trim()

      const qs = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortDirection,
        ...(sortBy ? { sortBy } : {}),
      }).toString()

      const filterEndpoint = isAllSchools() ? EP.FILTER_SCHOOL : EP.FILTER

      const response = await AxiosFunc.Post(`${filterEndpoint}?${qs}`, body)

      if (!response?.data) throw new Error('No response data received')

      if (response.data.status !== 200)
        throw new Error(response.data.message || 'Failed to filter class teachers')

      const raw = response.data?.data
      const list = extractList(raw)

      return {
        classTeachers: list.map(fromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? raw?.totalElements ?? list.length,
        totalPages: raw?.totalPages ?? 1,
      }
    } catch (error: any) {
      console.error('filter assign class teacher error:', error)
      throw new Error(error.response?.data?.message || error.message)
    }
  },

  create: async (data: AssignClassTeacherFormData): Promise<void> => {
    try {
      const response = await AxiosFunc.Post(EP.CREATE, toDTO(data))

      if (!response?.data) throw new Error('No response data received')

      if (response.data.status !== 200) {
        throw new Error(
          response.data.message || response.data.error || 'Failed to assign class teacher',
        )
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to assign class teacher'
      throw new Error(message)
    }
  },

  update: async (id: string, data: AssignClassTeacherFormData): Promise<void> => {
    try {
      const response = await AxiosFunc.Put(EP.UPDATE(id), toDTO(data))

      if (!response?.data) throw new Error('No response data received')

      if (response.data.status !== 200) {
        throw new Error(
          response.data.message || response.data.error || 'Failed to update class teacher',
        )
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update class teacher'
      throw new Error(message)
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(EP.DELETE(id))

      if (!response?.data) throw new Error('No response data received')

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to delete class teacher')
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete class teacher'
      throw new Error(message)
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(EP.DELETE_MULTIPLE, ids.map(Number))

      if (!response?.data) throw new Error('No response data received')

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to delete class teachers')
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete class teachers'
      throw new Error(message)
    }
  },

  deleteAll: async (): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(EP.DELETE_ALL)

      if (!response?.data) throw new Error('No response data received')

      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to delete all class teachers')
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete all class teachers'
      throw new Error(message)
    }
  },
}

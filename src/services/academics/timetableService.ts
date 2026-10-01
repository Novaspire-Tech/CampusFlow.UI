import AxiosFunc from '../../utils/axios'
import type {
  ClassTimetable,
  TimetableStats,
  TimetableFormData,
} from '../../types/academics/timetabletypes'

const TIMETABLE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-timetable/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/class-timetable/getAll',
  GET_BY_SECTION: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-timetable/find',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-timetable/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/class-timetable/update/${id}`,
  DELETE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/class-timetable/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-timetable/delete-multiple',

  DELETE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-timetable/delete-all',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const DEFAULT_ZERO_STATS: TimetableStats[] = [
  {
    title: 'Total Timetables',
    value: '0',
    change: '+0%',
    icon: 'Calendar',
  },
]

const transformBackendToFrontend = (data: any): ClassTimetable => ({
  id: data.timetableId?.toString() || '',
  timetableId: data.timetableId?.toString() || '',
  teacherId: data.teacherId || 0,
  teacherName: data.teacherName || '',
  subjectId: data.subjectId || 0,
  subjectName: data.subjectName || '',
  sectionId: data.sectionId || 0,
  sectionName: data.sectionName || '',
  schoolClassId: data.schoolClassId || 0,
  schoolClassName: data.schoolClassName || '',
  day: data.day || '',
  startTime: data.startTime || '',
  endTime: data.endTime || '',
})

const transformFrontendToBackend = (data: TimetableFormData) => ({
  teacherId: data.teacherId,
  subjectId: data.subjectId,
  sectionId: data.sectionId,
  schoolClassId: data.schoolClassId,
  day: data.day,
  startTime: data.startTime,
  endTime: data.endTime,
})

const extractData = (res: any): ClassTimetable[] => {
  const raw = res?.data?.data

  if (Array.isArray(raw)) {
    return raw.map(transformBackendToFrontend)
  }

  if (Array.isArray(raw?.timetables)) {
    return raw.timetables.map(transformBackendToFrontend)
  }

  if (Array.isArray(raw?.content)) {
    return raw.content.map(transformBackendToFrontend)
  }

  return []
}

export const timetableService = {
  getAll: async (page = 0, size = 100, sortDirection = 'asc'): Promise<ClassTimetable[]> => {
    try {
      const endpoint = isAllSchools()
        ? TIMETABLE_ENDPOINTS.GET_ALL_SCHOOL
        : TIMETABLE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection,
      })

      if (response.data?.status !== 200) return []

      return extractData(response)
    } catch (error: any) {
      console.error('getAll error:', error)
      return []
    }
  },

  getBySection: async (sectionId: number): Promise<ClassTimetable[]> => {
    if (!sectionId) return []

    try {
      const response = await AxiosFunc.Get(TIMETABLE_ENDPOINTS.GET_BY_SECTION, { sectionId })

      if (response.data?.status !== 200) return []

      return extractData(response)
    } catch (error: any) {
      console.error('getBySection error:', error)
      return []
    }
  },

  create: async (data: TimetableFormData): Promise<ClassTimetable> => {
    try {
      const response = await AxiosFunc.Post(
        TIMETABLE_ENDPOINTS.CREATE,
        transformFrontendToBackend(data),
      )

      if (response.data?.status !== 200) throw new Error(response.data?.message)

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create timetable')
    }
  },

  update: async (id: string, data: TimetableFormData): Promise<ClassTimetable> => {
    try {
      const response = await AxiosFunc.Put(
        TIMETABLE_ENDPOINTS.UPDATE(id),
        transformFrontendToBackend(data),
      )

      if (response.data?.status !== 200) throw new Error(response.data?.message)

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update timetable')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(TIMETABLE_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200) throw new Error(response.data?.message)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete timetable')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map(Number)

      const response = await AxiosFunc.Delete(TIMETABLE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) throw new Error(response.data?.message)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete multiple timetables')
    }
  },

  deleteAll: async (): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(TIMETABLE_ENDPOINTS.DELETE_ALL)

      if (response.data?.status !== 200) throw new Error(response.data?.message)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete all timetables')
    }
  },

  getStats: async (sectionId?: number): Promise<TimetableStats[]> => {
    try {
      const data = sectionId
        ? await timetableService.getBySection(sectionId)
        : await timetableService.getAll()

      return [
        {
          title: 'Total Timetables',
          value: data.length.toString(),
          change: '+0%',
          icon: 'Calendar',
        },
      ]
    } catch {
      return DEFAULT_ZERO_STATS
    }
  },
}

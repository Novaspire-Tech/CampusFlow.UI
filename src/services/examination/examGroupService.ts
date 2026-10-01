import AxiosFunc from '../../utils/axios'
import type { ExamGroup, ExamGroupFormData } from '../../types/examination/ExamGroup'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const EXAM_GROUP_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/exam-group/all',

  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/exam-group/get-all-by-group',

  GET_ALL_BY_CLASS: (classId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/exam-group/school-class/${classId}/all`,

  GET_BY_ID: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/exam-group/${id}`,

  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/exam-group/add',

  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/exam-group/update/${id}`,

  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/exam-group/delete/${id}`,

  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/exam-group/delete-multiple',
}

const transformToDTO = (data: ExamGroupFormData) => ({
  name: data.name,
  description: data.description || '',
  schoolClassId: Number(data.schoolClassId),
})

const transformBackendToFrontend = (item: any): ExamGroup => ({
  id: item.examGroupId,
  examGroupId: item.examGroupId,
  name: item.name,
  description: item.description || '',
  examGroupName: item.name,
  schoolClass: item.className
    ? {
        id: item.schoolClassId,
        className: item.className,
      }
    : undefined,
  schoolClassId: item.schoolClassId,
  className: item.className,
  totalSubjects: item.totalSubjects,
})

export const examGroupService = {
  getAll: async (): Promise<ExamGroup[]> => {
    try {
      const endpoint = isAllSchools()
        ? EXAM_GROUP_ENDPOINTS.GET_ALL_SCHOOL
        : EXAM_GROUP_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        params: {
          page: 0,
          size: 1000,
          sortDirection: 'asc',
        },
      })

      if (response.data?.status !== 200) return []

      const raw = response.data?.data
      const list = raw?.examGroups || raw?.content || raw || []

      return list.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('getAll error:', error)
      return []
    }
  },

  getAllByClass: async (schoolClassId: number): Promise<ExamGroup[]> => {
    try {
      const response = await AxiosFunc.Get(EXAM_GROUP_ENDPOINTS.GET_ALL_BY_CLASS(schoolClassId))

      if (response.data?.status !== 200) return []

      return (response.data?.data || []).map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('getAllByClass error:', error)
      return []
    }
  },

  getById: async (id: number): Promise<ExamGroup | null> => {
    try {
      const response = await AxiosFunc.Get(EXAM_GROUP_ENDPOINTS.GET_BY_ID(id))

      if (response.data?.status !== 200) return null

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      console.error('getById error:', error)
      return null
    }
  },

  create: async (data: ExamGroupFormData): Promise<ExamGroup> => {
    try {
      const response = await AxiosFunc.Post(EXAM_GROUP_ENDPOINTS.CREATE, transformToDTO(data))

      if (response.data?.status !== 200) throw new Error(response.data?.message)

      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error?.message || 'Failed to create exam group',
      )
    }
  },

  update: async (id: number, data: ExamGroupFormData): Promise<ExamGroup> => {
    try {
      const response = await AxiosFunc.Put(EXAM_GROUP_ENDPOINTS.UPDATE(id), transformToDTO(data))

      if (response.data?.status !== 200) throw new Error(response.data?.message)

      const returnedData = response.data.data
      if (returnedData) {
        return transformBackendToFrontend(returnedData)
      }

      return {
        id: id,
        examGroupId: id,
        name: data.name,
        description: data.description || '',
        examGroupName: data.name,
        schoolClassId: Number(data.schoolClassId),
      } as ExamGroup
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error?.message || 'Failed to update exam group',
      )
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(EXAM_GROUP_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200) throw new Error(response.data?.message)
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error?.message || 'Failed to delete exam group',
      )
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(EXAM_GROUP_ENDPOINTS.DELETE_MULTIPLE, ids)

      if (response.data?.status !== 200) throw new Error(response.data?.message)

      if (
        response.data?.message &&
        !['success', 'ok'].includes(response.data.message.toLowerCase())
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error?.message || 'Failed to delete exam groups',
      )
    }
  },
}

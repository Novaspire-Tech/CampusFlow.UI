import AxiosFunc from '../../utils/axios'

const ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/marks-management',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/marks-management',
  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/marks-management/${id}`,
  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/marks-management/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/marks-management/bulk',

  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/marks-management/all',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'
const normalizeMarksRecord = (item: any) => ({
  marksManagementId: item.marksManagementId,
  id: String(item.marksManagementId),

  studentId: item.studentId ?? null,
  examGroupId: item.examGroupId ?? null,
  examGroupName: item.examGroupName || '',

  studentName: item.studentName || '',
  className: item.className || '',
  rollNo: item.rollNo || '',
  admissionNo: item.admissionNo || '',

  marks: (item.marks || []).map((m: any) => ({
    subjectId: m.subjectId,
    subjectName: m.subjectName || 'Unknown',
    subjectType: m.subjectType || 'Theory',

    totalMarks: Number(m.totalMarks ?? m.total_marks ?? 0),
    totalObtainMarks: Number(
      m.totalObtainMarks ??
        m.marksObtained ??
        m.marks_obtained ??
        m.obtainMarks ??
        m.obtained_marks ??
        0,
    ),
  })),
})

const transformToDTO = (data: any) => ({
  studentId: Number(data.studentId),
  examGroupId: Number(data.examGroupId),
  marks: (data.marks || []).map((m: any) => ({
    subjectId: Number(m.subjectId),
    totalMarks: Number(m.totalMarks || 0),
    totalObtainMarks: Number(m.totalObtainMarks || m.obtainMarks || 0),
  })),
})

export const marksManagementService = {
  getAll: async (
    page: number = 0,
    size: number = 500,
    sortDirection: string = 'asc',
  ): Promise<any[]> => {
    const endpoint = isAllSchools() ? ENDPOINTS.GET_ALL_SCHOOL : ENDPOINTS.GET_ALL
    const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to fetch marks')
    }

    const items: any[] = response.data?.data?.marks || []
    return items.map(normalizeMarksRecord)
  },

  create: async (data: any): Promise<any> => {
    const response = await AxiosFunc.Post(ENDPOINTS.CREATE, transformToDTO(data))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to add marks')
    }

    return response.data?.data
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await AxiosFunc.Put(ENDPOINTS.UPDATE(Number(id)), transformToDTO(data))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to update marks')
    }

    return response.data?.data
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(ENDPOINTS.DELETE(Number(id)))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to delete marks')
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const response = await AxiosFunc.Delete(ENDPOINTS.DELETE_MULTIPLE, ids)

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to delete marks records')
    }
  },
}

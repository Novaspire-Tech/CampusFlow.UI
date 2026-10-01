import AxiosFunc from '../../utils/axios'
import type { AddStudentMemberDto } from '../../types/library/addStudent'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true'

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/student-member/all',
  GET_ALL_Schools: '/school-group/{schoolGroupCode}/school/student-member/getAll',
  CREATE:          '/school-group/{schoolGroupCode}/school/{schoolCode}/student-member/add',
  UPDATE: (id: string | number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-member/update/${id}`,
  DELETE: (id: string | number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-member/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-member/delete-multiple',
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toBackend = (data: AddStudentMemberDto) => ({
  libraryCardNo: String(data.libraryCardNo),
  studentId:     Number(data.studentId),
})

const toFrontend = (item: any): AddStudentMemberDto => ({
  addStudentMemberId: item.addStudentMemberId,
  id:            item.addStudentMemberId?.toString() ?? item.studentId?.toString(),
  libraryCardNo: item.libraryCardNo ?? '',
  studentId:     item.studentId,
  studentName:   `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim(),
  admissionNo:   item.admissionNo ?? '',
  firstName:     item.firstName ?? '',
  lastName:      item.lastName ?? '',
  gender:        item.gender ?? '',
  phoneNumber:   item.phoneNumber ?? '',
  email:         item.email ?? '',
  className:     item.className ?? '',
})

const extractList = (response: any): AddStudentMemberDto[] => {
  const data =
    response?.data?.data?.studentMembers ??
    response?.data?.data?.studentMember  ??
    response?.data?.studentMember        ??
    response?.data?.data                 ??
    []

  if (!Array.isArray(data)) {
    console.warn('Unexpected response shape:', data)
    return []
  }
  return data.map(toFrontend)
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const addStudentMemberService = {

  getAll: async (): Promise<AddStudentMemberDto[]> => {
    try {
      const url = isAllSchools() ? buildUrl(EP.GET_ALL_Schools) : buildUrl(EP.GET_ALL)
      const response = await AxiosFunc.Get(url, { page: 0, size: 1000, sortDirection: 'asc' })

      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to fetch library members')

      return extractList(response)
    } catch (error: any) {
      console.error('Error fetching student members:', error)
      return []
    }
  },

  create: async (data: AddStudentMemberDto): Promise<AddStudentMemberDto> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to add library member')

    return {
      ...data,
      addStudentMemberId: response.data?.data?.addStudentMemberId,
      id: response.data?.data?.addStudentMemberId?.toString() ?? `temp-${Date.now()}`,
    }
  },

  update: async (id: string | number, data: AddStudentMemberDto): Promise<AddStudentMemberDto> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update library member')

    return data
  },

  delete: async (id: string | number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete library member')
    } catch (error: any) {
      if (error?.response?.status === 500) return
      throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to delete library member')
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE_MULTIPLE), ids)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete library members')
  },
}
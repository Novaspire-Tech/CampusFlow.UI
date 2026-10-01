import AxiosFunc from '../../utils/axios'
import type { AddStaffMemberDto } from '../../types/library/addStaff'

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
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-member/all',
  GET_ALL_Schools: '/school-group/{schoolGroupCode}/school/staff-member/getAll',
  CREATE:          '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-member/add',
  UPDATE: (id: string | number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-member/update/${id}`,
  DELETE: (id: string | number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-member/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-member/delete-multiple',
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toBackend = (data: AddStaffMemberDto) => ({
  libraryCardNo: String(data.libraryCardNo),
  staffId:       Number(data.staffId),
})

const toFrontend = (item: any): AddStaffMemberDto => ({
  addStaffMemberId: item.addStaffMemberId,
  id: item.addStaffMemberId?.toString() ?? item.staffId?.toString(),
  libraryCardNo: item.libraryCardNo ?? '',
  staffId: item.staffId,
  firstName: item.name ?? '',
  role: item.role ?? '',
  email: item.email ?? '',
  phoneNumber: item.phoneNumber ?? '',
  staffName: undefined
})

// ─── Service ─────────────────────────────────────────────────────────────────

export const addStaffMemberService = {

  getAll: async (): Promise<AddStaffMemberDto[]> => {
    const url = isAllSchools() ? buildUrl(EP.GET_ALL_Schools) : buildUrl(EP.GET_ALL)
    const response = await AxiosFunc.Get(url, { page: 0, size: 1000, sortDirection: 'asc' })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to fetch staff library members')

    return (response.data?.data?.staffMember ?? []).map(toFrontend)
  },

  create: async (data: AddStaffMemberDto) => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to add staff library member')

    return response.data?.data
  },

  update: async (id: string | number, data: AddStaffMemberDto) => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update staff library member')

    return response.data?.data
  },

  delete: async (id: string | number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete staff library member')
    } catch (error: any) {
      if (error?.response?.status === 500) return
      throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to delete staff library member')
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE_MULTIPLE), ids)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete staff library members')
  },
}
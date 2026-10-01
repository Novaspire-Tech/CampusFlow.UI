import AxiosFunc from '../../utils/axios'
import type {
  StaffLeave,
  StaffLeaveFormInputs,
  LeaveBalanceResponse,
} from '../../types/humanResource/StaffLeave'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterStaffLeaveDTO {
  search?: string
}

export interface PaginatedLeaveResponse {
  leaves: StaffLeave[]
  currentPage: number
  totalItems: number
  totalPages: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const toBackendDate = (date: string): string => {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

const toFrontendDate = (date: string): string => {
  if (!date) return ''
  const [day, month, year] = date.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-leave/all',
  GET_ALL_Schools: '/school-group/{schoolGroupCode}/school/staff-leave/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-leave/filter',
  FILTER_ALL_SCHOOLS: '/school-group/{schoolGroupCode}/school/staff-leave/filter',
  FIND_BY_STAFF: (staffId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-leave/staff/${staffId}`,
  APPLY: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-leave/apply',
  UPDATE_STATUS: (leaveId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-leave/status/${leaveId}`,
  GET_BALANCE: (staffId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-leave/balance/${staffId}`,
  DELETE: (leaveId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-leave/delete/${leaveId}`,
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toBackend = (data: StaffLeaveFormInputs) => ({
  staffId: data.staffId,
  staffAssignedLeaveId: data.staffAssignedLeaveId,
  leaveFromDate: toBackendDate(data.leaveFromDate),
  leaveToDate: toBackendDate(data.leaveToDate),
  leaveType: data.leaveType.toUpperCase(),
  reason: data.reason ?? '',
  leaveDays: data.leaveDays,
})

const toFrontend = (item: any): StaffLeave => {
  let staffName = ''
  let staffId = 0
  let staffCode = ''

  if (item.staffName?.trim()) {
    staffName = item.staffName
  } else if (item.staff) {
    if (item.staff.firstName && item.staff.lastName)
      staffName = `${item.staff.firstName} ${item.staff.lastName}`
    staffId = item.staff.staffId ?? 0
    staffCode = item.staff.staffCode ?? ''
  }

  if (!staffId) staffId = item.staffId ?? 0
  if (!staffCode) staffCode = item.staffCode ?? ''

  let leaveType: 'SICK' | 'CASUAL' | 'MATERNITY' | 'ANNUAL' = 'SICK'
  if (item.leaveType) leaveType = item.leaveType.toUpperCase() as typeof leaveType
  else if (item.casualLeaveCount > 0) leaveType = 'CASUAL'
  else if (item.maternityLeaveCount > 0) leaveType = 'MATERNITY'
  else if (item.annualLeaveCount > 0) leaveType = 'ANNUAL'

  return {
    staffLeaveId: item.staffLeaveId,
    id: item.staffLeaveId?.toString() ?? '',
    staffId,
    staffCode,
    staffName,
    staffAssignedLeaveId:
      item.staffAssignedLeave?.staffAssignedLeaveId ?? item.staffAssignedLeaveId ?? 0,
    leaveType,
    leaveFromDate: toFrontendDate(item.leaveFromDate ?? ''),
    leaveToDate: toFrontendDate(item.leaveToDate ?? ''),
    leaveDays: item.leaveDays ?? 0,
    reason: item.reason ?? '',
    status: (item.status ?? 'PENDING').toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED',
    sickLeaveCount: item.sickLeaveCount ?? 0,
    casualLeaveCount: item.casualLeaveCount ?? 0,
    maternityLeaveCount: item.maternityLeaveCount ?? 0,
    annualLeaveCount: item.annualLeaveCount ?? 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

const parsePaginated = (data: any): PaginatedLeaveResponse => {
  const leaves = data?.staffLeaves ?? data?.leaves ?? data ?? []
  return {
    leaves: Array.isArray(leaves) ? leaves.map(toFrontend) : [],
    currentPage: data?.currentPage ?? 0,
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

const defaultParams = { page: 0, size: 10, sortDirection: 'asc' }

export const staffLeaveService = {
  getAll: async (
    params: { page?: number; size?: number; sortDirection?: string } = {},
  ): Promise<PaginatedLeaveResponse> => {
    const { page, size, sortDirection } = { ...defaultParams, ...params }
    const url = isAllSchools() ? buildUrl(EP.GET_ALL_Schools) : buildUrl(EP.GET_ALL)
    const response = await AxiosFunc.Get(url, { page, size, sortDirection })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to fetch staff leaves')

    return parsePaginated(response.data?.data)
  },

  filter: async (
    dto: FilterStaffLeaveDTO,
    params: { page?: number; size?: number; sortDirection?: string } = {},
  ): Promise<PaginatedLeaveResponse> => {
    const { page, size, sortDirection } = { ...defaultParams, ...params }
    const url = isAllSchools() ? buildUrl(EP.FILTER_ALL_SCHOOLS) : buildUrl(EP.FILTER)
    const response = await AxiosFunc.Post(url, dto, { page, size, sortDirection })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to filter staff leaves')

    return parsePaginated(response.data?.data)
  },

  findByStaffId: async (staffId: number): Promise<StaffLeave[]> => {
    const response = await AxiosFunc.Get(buildUrl(EP.FIND_BY_STAFF(staffId)))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to find staff leaves')

    const leaves = response.data?.data ?? []
    return Array.isArray(leaves) ? leaves.map(toFrontend) : []
  },

  apply: async (data: StaffLeaveFormInputs): Promise<any> => {
    if (!data.staffAssignedLeaveId || data.staffAssignedLeaveId === 0)
      throw new Error(
        'Staff Assigned Leave ID is required. Please ensure the staff member has a leave assignment.',
      )

    const response = await AxiosFunc.Post(buildUrl(EP.APPLY), toBackend(data))

    if (response.data?.status !== 200 && response.data?.status !== 201)
      throw new Error(response.data?.message ?? 'Failed to apply for leave')

    return response.data?.data
  },

  updateStatus: async (leaveId: number, status: string): Promise<void> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE_STATUS(leaveId)), null, {
      status: status.toUpperCase(),
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update leave status')
  },

  getBalance: async (staffId: number, leaveType: string): Promise<LeaveBalanceResponse> => {
    const response = await AxiosFunc.Get(buildUrl(EP.GET_BALANCE(staffId)), {
      leaveType: leaveType.toUpperCase(),
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to get leave balance')

    return response.data?.data
  },

  delete: async (leaveId: number): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(leaveId)))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete staff leave')
  },
}

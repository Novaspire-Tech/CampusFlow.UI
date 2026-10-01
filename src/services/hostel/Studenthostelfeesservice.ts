import AxiosFunc from '../../utils/axios'
import type {
  StudentHostelFeeDTO,
  UpdateStudentHostelFeeDTO,
  FilterStudentHostelFee,
  StudentHostelFeePage,
} from '../../types/hostel/HostelfeesType'

const getSchoolCode = (): string => localStorage.getItem('schoolCode') || 'default'
const getSchoolGroupCode = (): string => {
  return localStorage.getItem('schoolGroupCode') || 'default'
}

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode).replace('{schoolCode}', schoolCode)
}

const STUDENT_HOSTEL_FEE_ENDPOINTS = {
  ADD: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/add',
  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/${id}/update`,
  UPDATE_FEE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/${id}/update-fee`,
  CHECKOUT: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/${id}/checkout`,
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/filter',
  GET_BY_ID: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/${id}`,
  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/${id}/delete`,
}

const toBackendDate = (raw: string): string => {
  if (!raw) return ''
  // already dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw
  // yyyy-MM-dd  →  dd/MM/yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [yyyy, mm, dd] = raw.split('-')
    return `${dd}/${mm}/${yyyy}`
  }
  // fallback: try parsing
  try {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
  } catch {
    /* ignore */
  }
  return raw
}

const safeNumber = (val: any, fallback = 0): number => {
  const n = Number(val)
  return isFinite(n) ? n : fallback
}

const extractAllocations = (axiosResponse: any): StudentHostelFeePage => {
  const envelope = axiosResponse?.data?.data
  const items: any[] = Array.isArray(envelope?.data) ? envelope.data : []
  return {
    content: items,
    currentPage: envelope?.currentPage ?? 0,
    totalItems: envelope?.totalItems ?? items.length,
    totalPages: envelope?.totalPages ?? 1,
  } as StudentHostelFeePage
}

const assertOk = (response: any, fallback: string): void => {
  const status = response.data?.status ?? response.status
  if (status !== 200 && status !== 201) {
    const err: any = new Error(response.data?.message || fallback)
    err.response = { data: response.data }
    throw err
  }
}

export const studentHostelFeesService = {
  add: async (dto: StudentHostelFeeDTO): Promise<void> => {
    const studentId = safeNumber(dto.studentId, 0)
    const hostelRoomId = safeNumber(dto.hostelRoomId, 0)
    const totalMonths = safeNumber(dto.totalMonths, 0)
    const paid = safeNumber(dto.paid, 0)

    if (studentId <= 0) {
      const err: any = new Error('Invalid student selected')
      err.response = { data: { message: 'Invalid student selected' } }
      throw err
    }
    if (hostelRoomId <= 0) {
      const err: any = new Error('Please select a valid hostel room')
      err.response = { data: { message: 'Please select a valid hostel room' } }
      throw err
    }
    if (totalMonths < 1) {
      const err: any = new Error('Total months must be at least 1')
      err.response = { data: { message: 'Total months must be at least 1' } }
      throw err
    }

    const startDate = toBackendDate(dto.startDate)
    if (!startDate) {
      const err: any = new Error('Please enter a valid start date')
      err.response = { data: { message: 'Please enter a valid start date' } }
      throw err
    }

    const payload = {
      studentId,
      hostelRoomId,
      startDate,
      totalMonths,
      paid,
    }

    console.debug('[studentHostelFeesService.add] payload →', payload)

    const response = await AxiosFunc.Post(buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.ADD), payload)
    assertOk(response, 'Failed to add hostel fee')
  },

  update: async (allocationId: number, dto: UpdateStudentHostelFeeDTO): Promise<void> => {
    const response = await AxiosFunc.Put(
      buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.UPDATE(allocationId)),
      dto,
    )
    assertOk(response, 'Failed to update hostel fee')
  },

  updateFee: async (allocationId: number, fee: number): Promise<void> => {
    const url = `${buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.UPDATE_FEE(allocationId))}?fee=${fee}`
    const response = await AxiosFunc.Put(url, null)
    assertOk(response, 'Failed to record fee payment')
  },

  checkout: async (allocationId: number): Promise<void> => {
    const response = await AxiosFunc.Put(
      buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.CHECKOUT(allocationId)),
      null,
    )
    assertOk(response, 'Failed to checkout student')
  },

  getAll: async (page = 0, size = 10): Promise<StudentHostelFeePage> => {
    const response = await AxiosFunc.Get(buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.GET_ALL), {
      page,
      size,
      sortDirection: 'asc',
    })
    assertOk(response, 'Failed to fetch hostel fees')
    return extractAllocations(response) // ← pass response
  },

  getById: async (id: number): Promise<any> => {
    const response = await AxiosFunc.Get(buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.GET_BY_ID(id)), {})
    assertOk(response, 'Failed to fetch hostel fee')
    return response.data?.data ?? null
  },

  filter: async (
    dto: FilterStudentHostelFee,
    page = 0,
    size = 10,
  ): Promise<StudentHostelFeePage> => {
    const baseUrl = buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.FILTER)
    const qs = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortDirection: 'asc',
    }).toString()
    const response = await AxiosFunc.Post(`${baseUrl}?${qs}`, dto)
    assertOk(response, 'Failed to filter hostel fees')
    return extractAllocations(response) // ← pass response (not response.data)
  },

  delete: async (id: number): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(STUDENT_HOSTEL_FEE_ENDPOINTS.DELETE(id)))
    assertOk(response, 'Failed to delete hostel fee')
  },
}

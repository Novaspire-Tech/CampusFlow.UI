import AxiosFunc from '../../utils/axios'
import { axiosInstance } from '../../utils/axios'
import type {
  FineTransactionDto,
  FineTransactionCreateRequest,
  FineTransactionsPaginatedResponse,
  FilterStudentParams,
  StudentListResponse,
} from '../../types/feesCollection/addFineType'

const FINE_TRANSACTION_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/fine-transaction/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/fine-transaction/getAll',
  GET_BY_ID: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fine-transaction/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/fine-transaction/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fine-transaction/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fine-transaction/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/fine-transaction/delete-multiple',
}

const STUDENT_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/student/all',

  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/filter',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const buildSchoolUrl = (template: string): string => {
  const schoolGroupCode =
    localStorage.getItem('schoolGroupCode') || 'default'
  const schoolCode =
    localStorage.getItem('schoolCode') || 'default'
  return template
    .replace('{schoolGroupCode}', schoolGroupCode)
    .replace('{schoolCode}', schoolCode)
}

const formatDateForBackend = (date: string | Date): string => {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date

  let d: Date
  if (typeof date === 'string') {
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split('-')
      d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else {
      d = new Date(date)
    }
  } else {
    d = date
  }

  if (isNaN(d.getTime())) return ''

  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}/${d.getFullYear()}`
}

const transformToDTO = (data: FineTransactionCreateRequest) => ({
  amount: Number(data.amount),
  reason: data.reason,
  date: formatDateForBackend(data.date),
  feesId: Number(data.feesId),
  studentId: Number(data.studentId),
  feeTypeId: Number(data.feeTypeId),
})

const transformFineResponse = (item: any): FineTransactionDto => ({
  fineTransactionId: item.fineTransactionId,
  amount: item.amount,
  reason: item.reason,
  date: item.date,
  feesId: item.feesId,
  studentId: item.studentId,
  feeTypeId: item.feeTypeId,
  feesTotalFees: item.feesTotalFees,
  feesPaid: item.feesPaid,
  feesPending: item.feesPending,
  studentName: item.studentName,
  admissionNo: item.admissionNo,
  rollNo: item.rollNo,
  classId: item.classId,
  className: item.className,
  sectionId: item.sectionId,
  sectionName: item.sectionName,
  feeTypeName: item.feeTypeName,
  feeTypeDescription: item.feeTypeDescription,
})

export const fineTransactionService = {
  getAll: async (
    page = 0,
    size = 10,
    sortDirection = 'asc',
  ): Promise<FineTransactionsPaginatedResponse> => {
    try {
      const endpoint = isAllSchools()
        ? FINE_TRANSACTION_ENDPOINTS.GET_ALL_SCHOOL
        : FINE_TRANSACTION_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection,
      })
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch fine transactions')
      return {
        fineTransactions: (response.data?.data?.fineTransactions || []).map(transformFineResponse),
        currentPage: response.data?.data?.currentPage || 0,
        totalItems: response.data?.data?.totalItems || 0,
        totalPages: response.data?.data?.totalPages || 0,
      }
    } catch (error: any) {
      console.error('Error fetching fee transactions:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<FineTransactionDto> => {
    const response = await AxiosFunc.Get(FINE_TRANSACTION_ENDPOINTS.GET_BY_ID(id))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch fine transaction')
    return transformFineResponse(response.data?.data)
  },

  create: async (data: FineTransactionCreateRequest): Promise<FineTransactionDto> => {
    const response = await AxiosFunc.Post(FINE_TRANSACTION_ENDPOINTS.CREATE, transformToDTO(data))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to create fine transaction')
    return transformFineResponse(response.data?.data)
  },

  update: async (id: string, data: FineTransactionCreateRequest): Promise<FineTransactionDto> => {
    const response = await AxiosFunc.Put(
      FINE_TRANSACTION_ENDPOINTS.UPDATE(id),
      transformToDTO(data),
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update fine transaction')
    return transformFineResponse(response.data?.data)
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(FINE_TRANSACTION_ENDPOINTS.DELETE(id))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to delete fine transaction')
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const response = await AxiosFunc.Delete(FINE_TRANSACTION_ENDPOINTS.DELETE_MULTIPLE, ids)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to delete fine transactions')
  },
}

export const studentFilterService = {


  getAll: async (page = 0, size = 10, sortDirection = 'asc'): Promise<StudentListResponse> => {
    const url = isAllSchools()
      ? STUDENT_ENDPOINTS.GET_ALL_SCHOOL
      : STUDENT_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(url, { page, size, sortDirection })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch students')

    return {
      students: response.data?.data?.students || [],
      currentPage: response.data?.data?.currentPage || 0,
      totalItems: response.data?.data?.totalItems || 0,
      totalPages: response.data?.data?.totalPages || 0,
    }
  },


  filter: async ({
    dto,
    page = 0,
    size = 10,
    sortBy,
    sortDirection = 'asc',
  }: FilterStudentParams): Promise<StudentListResponse> => {
    const queryParams: Record<string, any> = { page, size, sortDirection }
    if (sortBy) queryParams.sortBy = sortBy

    const backendDto: Record<string, any> = {
      sessionStatus: dto.sessionStatus || 'ACTIVE',
    }

    if (dto.search?.trim()) backendDto.searchQuery = dto.search.trim()
    if (dto.schoolClassId) backendDto.schoolClassId = dto.schoolClassId
    if (dto.sectionId) backendDto.sectionId = dto.sectionId
    if (dto.rollNo?.trim()) backendDto.rollNo = dto.rollNo.trim()

    const url = buildSchoolUrl(STUDENT_ENDPOINTS.FILTER)

    console.log('[studentFilterService.filter] URL:', url)

    const token = localStorage.getItem('accessToken')
    const response = await axiosInstance.post(url, backendDto, {
      params: queryParams,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to filter students')

    return {
      students: response.data?.data?.students || [],
      currentPage: response.data?.data?.currentPage || 0,
      totalItems: response.data?.data?.totalItems || 0,
      totalPages: response.data?.data?.totalPages || 0,
    }
  },
}
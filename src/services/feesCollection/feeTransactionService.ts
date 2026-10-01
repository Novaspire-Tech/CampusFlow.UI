import AxiosFunc from '../../utils/axios'
import { axiosInstance } from '../../utils/axios'
import type {
  FeeTransactionDto,
  FeeTransactionCreateRequest,
  FeeTransactionUpdateRequest,
  FeeTransactionsPaginatedResponse,
  FilterFeeTransactionsDto,
  FilterFeeTransactionsParams,
  AddTransaction,
} from '../../types/feesCollection/searchDueFeesType'


const FEE_TRANSACTION_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/fee-transaction/getAll',
  GET_BY_ID: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/${id}`,
  GET_BY_STUDENT: (studentId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/student/${studentId}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/add',
  ADD_TRANSACTION: '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/restore-deleted-records',
  CREATE_MULTI: '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/add',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/fee-transaction/filter',
  UPDATE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/update/${id}`,
  // DELETE: (id: string) =>
  //   `/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/delete-multiple',

  // ── Report ──
  REPORT: '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/report',
   DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fee-transaction/${id}`,
 
}


const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

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

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const todayForBackend = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}
const htmlDateToBackend = (d: string): string => {
  if (!d) return ''
  const [year, month, day] = d.split('-')
  return `${day}/${month}/${year}`
}

const triggerFileDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const transformCreateToDTO = (data: FeeTransactionCreateRequest) => ({
  feesId: Number(data.feesId),
  studentId: Number(data.studentId),
  feeTypeId: Number(data.feeTypeId),
  discountAmount: Number(data.discountAmount || 0),
  fine: Number(data.fine || 0),
  date: formatDateForBackend(data.date) || todayForBackend(),
  note: data.note || null,
  subs: (data.paymentModes || []).map((pm) => ({
    mode: pm.mode,
    amount: Number(pm.amount),
    receiptNo: pm.receiptNo || null,
  })),
})

const transformAddTransactionToDTO = (data: AddTransaction) => ({
  feesId: Number(data.feesId),
  studentId: Number(data.studentId),
  feeTypeId: Number(data.feeTypeId),
  discountAmount: Number(data.discountAmount || 0),
  fine: Number(data.fine || 0),
  date: formatDateForBackend(data.date) || todayForBackend(),
  note: data.note || null,
  amount: Number(data.amount || 0),
  mode: data.mode,
  receiptNo: data.receiptNo || null,
})

const transformAddTransactionResponse = (data: any): AddTransaction => ({
  feesId: Number(data.feesId),
  studentId: Number(data.studentId),
  feeTypeId: Number(data.feeTypeId),
  discountAmount: String(data.discountAmount ?? '0'),
  fine: data.fine !== undefined && data.fine !== null ? String(data.fine) : undefined,
  date: formatDateForBackend(data.date) || todayForBackend(),
  note: data.note || undefined,
  amount: Number(data.amount || 0),
  mode: String(data.mode),     
  receiptNo: data.receiptNo || null,
})

export interface MultiPaymentTransaction {
  feesId: number
  studentId: number
  feeTypeId: number
  discountAmount: number
  fine: number
  note?: string
  date?: string
  subs: {
    mode: string
    amount: number
    receiptNo?: string
  }[]
}

export interface MultiPaymentRequest {
  transactions: MultiPaymentTransaction[]
}

const transformMultiCreateToDTO = (data: MultiPaymentRequest) => ({
  transactions: data.transactions.map((tx) => ({
    feesId: Number(tx.feesId),
    studentId: Number(tx.studentId),
    feeTypeId: Number(tx.feeTypeId),
    discountAmount: Number(tx.discountAmount || 0),
    fine: Number(tx.fine || 0),
    date: tx.date ? formatDateForBackend(tx.date) : todayForBackend(),
    note: tx.note || null,
    subs: (tx.subs || []).map((s) => ({
      mode: s.mode,
      amount: Number(s.amount),
      receiptNo: s.receiptNo || null,
    })),
  })),
})

const transformUpdateToDTO = (data: FeeTransactionUpdateRequest) => ({
  feesId: Number(data.feesId),
  studentId: Number(data.studentId),
  feeTypeId: Number(data.feeTypeId),
  amount: Number(data.amount),
  discountAmount: Number(data.discountAmount || 0),
  fine: Number(data.fine || 0),
  date: formatDateForBackend(data.date) || todayForBackend(),
  mode: data.mode,
  receiptNo: data.receiptNo || null,
  note: data.note || null,
})

const transformResponse = (item: any): FeeTransactionDto => ({
  feeTransactionId: item.feeTransactionId,
  amount: item.amount,
  discountAmount: item.discountAmount || 0,
  date: item.date,
  fine: item.fine || 0,
  mode: item.mode,
  receiptNo: item.receiptNo,
  note: item.note,
  feesId: item.feesId,
  studentId: item.studentId,
  feeTypeId: item.feeTypeId,
  feesTotalFees: item.feesTotalFees,
  feesPaid: item.feesPaid,
  feesPending: item.feesPending,
  feesFine: item.feesFine,
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

export type ReportDownloadResult =
  | { downloaded: true }
  | { downloaded: false; message: string }

export const feeTransactionService = {

  getAll: async (
    page = 0,
    size = 1000,
    sortDirection = 'asc',
  ): Promise<FeeTransactionsPaginatedResponse> => {
    try {
      const endpoint = isAllSchools()
        ? FEE_TRANSACTION_ENDPOINTS.GET_ALL_SCHOOL
        : FEE_TRANSACTION_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch fee transactions')
      return {
        feeTransactions: (response.data?.data?.feeTransactions || []).map(transformResponse),
        currentPage: response.data?.data?.currentPage || 0,
        totalItems: response.data?.data?.totalItems || 0,
        totalPages: response.data?.data?.totalPages || 0,
      }
    } catch (error: any) {
      console.error('Error fetching fee transactions:', error)
      throw error
    }
  },

  filter: async (
    _params: Record<string, any>,
    _p0: number,
    _p1: number,
    _p2: string,
    { dto, page = 0, size = 10, sortBy, sortDirection = 'asc' }: FilterFeeTransactionsParams,
  ): Promise<FeeTransactionsPaginatedResponse> => {
    try {
      const params: Record<string, any> = { page, size, sortDirection }
      if (sortBy) params.sortBy = sortBy

      const cleanDto: FilterFeeTransactionsDto = Object.fromEntries(
        Object.entries(dto).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      )

      const filterEndpoint = isAllSchools()
        ? FEE_TRANSACTION_ENDPOINTS.FILTER_SCHOOL
        : FEE_TRANSACTION_ENDPOINTS.FILTER

      const response = await AxiosFunc.Post(filterEndpoint, cleanDto, { params })
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to filter fee transactions')
      return {
        feeTransactions: (response.data?.data?.feeTransactions || []).map(transformResponse),
        currentPage: response.data?.data?.currentPage || 0,
        totalItems: response.data?.data?.totalItems || 0,
        totalPages: response.data?.data?.totalPages || 0,
      }
    } catch (error: any) {
      console.error('Error filtering fee transactions:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<FeeTransactionDto> => {
    try {
      const endpoint = isAllSchools()
        ? FEE_TRANSACTION_ENDPOINTS.GET_ALL_SCHOOL
        : FEE_TRANSACTION_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 100000,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch fee transactions')

      const all = response.data?.data?.feeTransactions || []
      const found = all.find(
        (tx: any) => String(tx.feeTransactionId) === String(id),
      )

      if (!found) throw new Error('Fee transaction not found')

      return transformResponse(found)
    } catch (error: any) {
      console.error('Error fetching fee transaction:', error)
      throw error
    }
  },

  getByStudentId: async (studentId: string): Promise<FeeTransactionDto[]> => {
    try {
      const response = await AxiosFunc.Get(FEE_TRANSACTION_ENDPOINTS.GET_BY_STUDENT(studentId))
      if (response.data?.status === 200) return (response.data?.data || []).map(transformResponse)
    } catch (error: any) {
      console.warn('Student endpoint failed:', error.response?.status || error.message)
    }

    try {
      const response = await AxiosFunc.Get(FEE_TRANSACTION_ENDPOINTS.GET_ALL, {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
      })
      if (response.data?.status === 200) {
        const all = response.data?.data?.feeTransactions || []
        return all
          .filter((tx: any) => String(tx.studentId) === String(studentId))
          .map(transformResponse)
      }
    } catch (error: any) {
      console.warn('Fallback getAll failed:', error.message)
    }

    return []
  },

  create: async (data: FeeTransactionCreateRequest): Promise<FeeTransactionDto> => {
    try {
      const dto = transformCreateToDTO(data)
      console.log('[FeeTransaction] CREATE (single) payload:', JSON.stringify(dto, null, 2))
      const response = await AxiosFunc.Post(FEE_TRANSACTION_ENDPOINTS.CREATE, dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create fee transaction')
      return transformResponse(response.data?.data || {})
    } catch (error: any) {
      console.error('Error creating fee transaction:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create fee transaction',
      )
    }
  },
  Add_transaction: async (data: AddTransaction): Promise<AddTransaction> => {
    try {
      const dto = transformAddTransactionToDTO(data)
      console.log('[FeeTransaction] ADD (single) payload:', JSON.stringify(dto, null, 2))
      const response = await AxiosFunc.Post(FEE_TRANSACTION_ENDPOINTS.ADD_TRANSACTION, dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to add fee transaction')
      return transformAddTransactionResponse(response.data?.data || {})
    } catch (error: any) {
      console.error('Error adding fee transaction:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to add fee transaction',
      )
    }
  },

  createMulti: async (data: MultiPaymentRequest): Promise<number[]> => {
    try {
      const dto = transformMultiCreateToDTO(data)
      console.log('[FeeTransaction] CREATE (multi) payload:', JSON.stringify(dto, null, 2))
      const response = await AxiosFunc.Post(FEE_TRANSACTION_ENDPOINTS.CREATE_MULTI, dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create fee transactions')

      const created: any[] = response.data?.data || []
      const ids: number[] = created
        .map((item: any) => item?.feeTransactionId)
        .filter((id: any): id is number => typeof id === 'number' && id > 0)

      console.log('[FeeTransaction] CREATE (multi) returned IDs:', ids)
      return ids
    } catch (error: any) {
      console.error('Error creating multi fee transaction:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create fee transactions',
      )
    }
  },

  update: async (
    feeTransactionId: number | string,
    data: FeeTransactionUpdateRequest,
  ): Promise<FeeTransactionDto> => {
    try {
      const dto = transformUpdateToDTO(data)
      console.log('[FeeTransaction] UPDATE payload:', JSON.stringify(dto, null, 2))
      const response = await AxiosFunc.Put(FEE_TRANSACTION_ENDPOINTS.UPDATE(feeTransactionId), dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update fee transaction')
      return transformResponse(response.data?.data || {})
    } catch (error: any) {
      console.error('Error updating fee transaction:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update fee transaction',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(FEE_TRANSACTION_ENDPOINTS.DELETE(id))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete fee transaction')
    } catch (error: any) {
      console.error('Error deleting fee transaction:', error)
      throw error
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(FEE_TRANSACTION_ENDPOINTS.DELETE_MULTIPLE, ids)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete fee transactions')
    } catch (error: any) {
      console.error('Error deleting fee transactions:', error)
      throw error
    }
  },


  downloadReport: async (
    startDate: string,   
    endDate: string,     
  ): Promise<ReportDownloadResult> => {
    try {
      const payload = {
        startDate: htmlDateToBackend(startDate),
        endDate:   htmlDateToBackend(endDate),
      }

      console.log('[FeeTransaction] REPORT payload:', payload)

      const response = await axiosInstance.post(
        FEE_TRANSACTION_ENDPOINTS.REPORT,
        payload,
        { responseType: 'blob' },
      )

      const contentType: string        = response.headers['content-type'] ?? ''
      const contentDisposition: string = response.headers['content-disposition'] ?? ''


      if (
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/vnd.openxmlformats') ||
        contentDisposition.includes('attachment')
      ) {
        triggerFileDownload(response.data as Blob, 'fee_transactions_report.xlsx')
        return { downloaded: true }
      }


      const text = await (response.data as Blob).text()
      let message = 'No data found for the selected date range.'
      
        const json = JSON.parse(text)
        message = json?.message || message
    
      return { downloaded: false, message }

    } catch (error: any) {

      throw new Error(
        error.response?.data?.message || error.message || 'Failed to download report',
      )
    }
  },
}
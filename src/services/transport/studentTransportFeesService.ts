import AxiosFunc, { API_BASE_URL } from '../../utils/axios'
import type {
  StudentTransportFees,
  StudentTransportFeesFormData,
  UpdateStudentTransportFeeFormData,
  UpdateTransportPaymentData,
  StudentTransportFeesFilterCriteria,
  PaginatedResponse,
} from '../../types/transport/studentTransportFees'

const STUDENT_TRANSPORT_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/student-transport-fees/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/add',
  UPLOAD_XL:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/add/xl-sheet',
  DOWNLOAD_TEMPLATE_XL: '/templates/xl-sheets/transport_fees.xlsx',
  UPDATE_PAYMENT: (id: number | string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/update/${id}`,
  UPDATE_FEE: (id: number | string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/update-fee/${id}`,
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/student-transport-fees/filter',
  DELETE: (id: number | string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/delete/${id}`,
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const formatDate = (date: string | Date): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return ''
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }
  return dateStr
}

const transformToCreateDTO = (data: StudentTransportFeesFormData) => ({
  studentId: Number(data.studentId),
  routeId: Number(data.routeId),
  pickUpPointId: Number(data.pickUpPointId),
  paid: Number(data.paid),
  totalMonths: Number(data.totalMonths),
  startDate: formatDate(data.startDate),
})

const transformToUpdateFeeDTO = (data: UpdateStudentTransportFeeFormData) => ({
  newTotalMonths: Number(data.newTotalMonths),
  routeId: data.routeId != null ? Number(data.routeId) : null,
  pickUpPointId: data.pickUpPointId != null ? Number(data.pickUpPointId) : null,
})

const transformFromBackend = (item: any): StudentTransportFees => ({
  studentTransportFeesId: item.studentTransportFeeId,
  studentId: item.studentId,
  firstName: item.firstName ?? '',
  lastName: item.lastName ?? '',
  admissionNo: item.admissionNo ?? '',
  studentClass: item.studentClass ?? '',
  section: item.section ?? '',
  parentName: item.parentName ?? '',
  parentPhone: item.parentPhone ?? '',
  startDate: formatDisplayDate(item.startDate ?? ''),
  endDate: formatDisplayDate(item.endDate ?? ''),
  totalMonths: item.totalMonths ?? 0,
  totalFees: item.totalFees ?? 0,
  paidFees: item.paidFees ?? 0.0,
  routeId: item.routeId,
  routeName: item.routeName ?? '',
  pickUpPointId: item.pickUpPointId,
  pickUpPointName: item.pickUpPointName ?? '',
  vehicleId: item.vehicleId,
  vehicleName: item.vehicleName ?? '',
})

export const studentTransportFeesService = {
  getAll: async (
    page = 0,
    size = 20,
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedResponse<StudentTransportFees>> => {
    const params: Record<string, any> = { page, size, sortDirection }
    if (sortBy) params.sortBy = sortBy

    const endpoint = isAllSchools()
      ? STUDENT_TRANSPORT_ENDPOINTS.GET_ALL_SCHOOL
      : STUDENT_TRANSPORT_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, params)
    console.log('Raw response data:', response.data)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch student transport fees')

    const { data, currentPage, totalItems, totalPages } = response.data.data
    return {
      data: (data ?? []).map(transformFromBackend),
      currentPage,
      totalItems,
      totalPages,
    }
  },

 filter: async (
    criteria: StudentTransportFeesFilterCriteria,
    page = 0,
    size = 10,
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedResponse<StudentTransportFees>> => {
    const baseEndpoint = isAllSchools()
      ? STUDENT_TRANSPORT_ENDPOINTS.FILTER_SCHOOL
      : STUDENT_TRANSPORT_ENDPOINTS.FILTER

    const qs = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortDirection,
      ...(sortBy ? { sortBy } : {}),
    }).toString()

    const response = await AxiosFunc.Post(`${baseEndpoint}?${qs}`, criteria)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to filter student transport fees')

    const { data, currentPage, totalItems, totalPages } = response.data.data
    return {
      data: (data ?? []).map(transformFromBackend),
      currentPage,
      totalItems,
      totalPages,
    }
  },

  create: async (data: StudentTransportFeesFormData): Promise<void> => {
    const dto = transformToCreateDTO(data)
    console.log('JSON being sent:', JSON.stringify(dto, null, 2))

    try {
      const response = await AxiosFunc.Post(STUDENT_TRANSPORT_ENDPOINTS.CREATE, dto)

      console.log('Response status:', response.status)
      console.log('Response data:', response.data)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to assign transport to student')
    } catch (error: any) {
      if (error.response) {
        console.error('=== ERROR DETAILS ===')
        console.error('Status:', error.response.status)
        console.error('Headers:', error.response.headers)
        console.error('Data:', error.response.data)
        if (error.response.data?.message)
          console.error('Error message:', error.response.data.message)
        if (error.response.data?.errors)
          console.error('Validation errors:', error.response.data.errors)
        if (error.response.data?.details)
          console.error('Error details:', error.response.data.details)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error message:', error.message)
      }
      throw error
    }
  },

  bulkUploadFromExcel: async (
    file: File,
  ): Promise<{
    success: number
    failed: number
    message: string
    errors?: string[]
    errorFile?: Blob
  }> => {
    if (!file) throw new Error('Excel file is required')

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i))
      throw new Error('Invalid file type. Please upload an Excel file (.xlsx or .xls)')

    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('accessToken') || ''
    const url = `${API_BASE_URL}${STUDENT_TRANSPORT_ENDPOINTS.UPLOAD_XL}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const contentType = response.headers.get('content-type') || ''
    const contentDisposition = response.headers.get('content-disposition') || ''
    if (
      contentType.includes('application/octet-stream') ||
      contentDisposition.includes('attachment')
    ) {
      const blob = await response.blob()
      return {
        success: 0,
        failed: -1,
        message: 'Some records failed. Download the error file for details.',
        errorFile: blob,
      }
    }

    const json = await response.json()
    if (json?.status !== 200)
      throw new Error(json?.message || 'Failed to upload student Excel sheet')

    return {
      success: json?.data?.successCount ?? 0,
      failed: json?.data?.failureCount ?? 0,
      message: json?.message || 'All records uploaded successfully',
      errors: json?.data?.errors ?? [],
    }
  },

  downloadExcelTemplate: async (): Promise<Blob> => {
    try {
      console.log('Downloading student Excel template...')
      const response = await AxiosFunc.GetFile(STUDENT_TRANSPORT_ENDPOINTS.DOWNLOAD_TEMPLATE_XL)

      if (!(response.data instanceof Blob)) throw new Error('Invalid file response from server')

      console.log('Template downloaded successfully')
      return response.data
    } catch (error: any) {
      console.error('Error downloading Excel template:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to download Excel template',
      )
    }
  },


  updatePayment: async (id: number | string, data: UpdateTransportPaymentData): Promise<void> => {
    console.log(`Updating transport payment for ID: ${id} with data:`, data)
    const response = await AxiosFunc.Put(STUDENT_TRANSPORT_ENDPOINTS.UPDATE_PAYMENT(id), null, {
      params: { fee: data.fee },
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update transport fee payment')
  },

  updateFee: async (
    id: number | string,
    data: UpdateStudentTransportFeeFormData,
  ): Promise<void> => {
    const dto = transformToUpdateFeeDTO(data)
    const response = await AxiosFunc.Put(STUDENT_TRANSPORT_ENDPOINTS.UPDATE_FEE(id), dto)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update student transport fee')
  },

  delete: async (id: number | string): Promise<void> => {
    console.log(`Attempting to delete student transport fee with ID: ${id}`)
    const response = await AxiosFunc.Delete(STUDENT_TRANSPORT_ENDPOINTS.DELETE(id))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to delete student transport fee')
  },
}
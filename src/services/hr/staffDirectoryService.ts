import AxiosFunc from '../../utils/axios'
import { API_BASE_URL } from '../../utils/axios'
import type {
  Staff,
  StaffFormData,
  StaffListResponse,
  StaffSearchParams,
  StaffStats,
} from '../../types/humanResource/Staff'
import { openExpenseDocument } from '../expense/addExpenseService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/all',
  GET_ALL_Schools: '/school-group/{schoolGroupCode}/school/staff/all',
  FIND_BY_CODE: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/find',
  ADD: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/add',
  UPDATE: (staffCode: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff/update/${staffCode}`,
  UPDATE_DOCUMENT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff/update-document/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/staff/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/delete-multiple',
  DELETE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/delete-all',
  GET_ROLES: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/roles',
  GET_DESIGNATIONS: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/designations',
  GET_DEPARTMENTS: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/departments',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/filter',
  FILTER_ALL_SCHOOLS: '/school-group/{schoolGroupCode}/school/staff/filter',
  BULK_UPLOAD_XL: '/school-group/{schoolGroupCode}/school/{schoolCode}/staff/add/xl-sheet',
  DOWNLOAD_TEMPLATE_XL: '/templates/xl-sheets/staffs.xlsx',
  GET_PROFILE_PICTURE: '/uploads/schools',
  openExpenseDocument,
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): Staff => ({
  id: d.staffId?.toString() ?? d.id?.toString() ?? '',
  staffCode: d.staffCode ?? '',
  role: d.role ?? '',
  firstName: d.firstName ?? '',
  lastName: d.lastName ?? '',
  fatherName: d.fatherName ?? '',
  motherName: d.motherName ?? '',
  email: d.email ?? '',
  phone: d.phone ?? '',
  dateOfBirth: d.dateOfBirth ?? '',
  bloodGroup: d.bloodGroup ?? '',
  dateOfJoining: d.dateOfJoining ?? '',
  gender: d.gender ?? '',
  currentAddress: d.currentAddress ?? '',
  permanentAddress: d.permanentAddress ?? '',
  emergencyContactNo: d.emergencyContactNo ?? '',
  maritalStatus: d.maritalStatus ?? '',
  qualification: d.qualification ?? '',
  workExperience: d.workExperience ?? '',
  note: d.note ?? '',
  photo: d.photo ?? '',
  department: d.department,
  designation: d.designation,
  staffAssignedLeave: d.staffAssignedLeave,
  staffBankAccountDetails: d.staffBankAccountDetails,
  payRoll: d.payRoll,
  socialMediaLink: d.socialMediaLink,
  staffDocuments: d.staffDocuments,
  profilePicture: null,
  resume: null,
  joiningLetter: null,
  otherDocument: null,
  staffId: '',
  classDepartment: d.classDepartment ?? d.classDepartmentId ?? undefined,
})

const toBackend = (data: StaffFormData): any => {
  const payload: Record<string, any> = {
    role: data.role,
    firstName: data.firstName,
    phone: data.phone,
    dateOfJoining: data.dateOfJoining,
    gender: data.gender,
    departmentId: data.departmentId,
    designationId: data.designationId,
  }

  const rawClassDeptId = data.classDepartmentId
  const parsedClassDeptId =
    typeof rawClassDeptId === 'number'
      ? rawClassDeptId
      : rawClassDeptId != null
        ? parseInt(String(rawClassDeptId), 10)
        : NaN

  if (!isNaN(parsedClassDeptId) && parsedClassDeptId > 0)
    payload.classDepartmentId = parsedClassDeptId
  else
    console.warn(
      '[staffService] classDepartmentId missing or invalid — value received:',
      rawClassDeptId,
    )

  const optionalFields: (keyof StaffFormData)[] = [
    'lastName',
    'fatherName',
    'motherName',
    'email',
    'dateOfBirth',
    'bloodGroup',
    'currentAddress',
    'permanentAddress',
    'emergencyContactNo',
    'maritalStatus',
    'qualification',
    'workExperience',
    'note',
  ]

  for (const field of optionalFields) {
    const value = data[field]
    if (hasValue(value)) payload[field] = typeof value === 'string' ? value.trim() : value
  }

  if (data.leaves) payload.leaves = data.leaves
  if (data.bankDetails) payload.bankDetails = data.bankDetails
  if (data.payroll) {
    payload.payroll = {
      basicSalary: data.payroll.basicSalary,
      employmentType: data.payroll.employmentType,
      workLocation: data.payroll.workLocation?.trim() ?? null,
    }
  }
  if (data.socialMediaLinks) payload.socialMediaLinks = data.socialMediaLinks

  return payload
}

const extractList = (response: any): Staff[] => {
  const data = response?.data?.data?.Staff ?? response?.data?.staff ?? []
  return data.map(toFrontend)
}

const emptyListResponse = (page: number): StaffListResponse => ({
  staffList: [],
  currentPage: page,
  totalItems: 0,
  totalPages: 0,
})

// ─── Service ─────────────────────────────────────────────────────────────────

export const staffService = {
  getAll: async (page = 0, size = 100, sortDirection = 'asc'): Promise<Staff[]> => {
    try {
      const url = isAllSchools() ? buildUrl(EP.GET_ALL_Schools) : buildUrl(EP.GET_ALL)
      const response = await AxiosFunc.Get(url, { page, size, sortDirection })

      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to fetch staff')

      return extractList(response)
    } catch (error: any) {
      console.error('Error fetching staff:', error)
      return []
    }
  },

  filter: async (
    params: StaffSearchParams,
    page = 0,
    size = 10,
    sortBy = 'firstName',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<StaffListResponse> => {
    try {
      const body: Record<string, any> = {}
      if (params.role?.trim()) body.role = params.role.trim()
      if (params.designationId) body.designationId = Number(params.designationId)
      if (params.departmentId) body.departmentId = Number(params.departmentId)
      if (params.search?.trim()) body.search = params.search.trim()

      const base = isAllSchools() ? buildUrl(EP.FILTER_ALL_SCHOOLS) : buildUrl(EP.FILTER)
      const url = `${base}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

      const response = await AxiosFunc.Post(url, body)
      if (!response?.data || response.data?.status !== 200) return emptyListResponse(page)

      const raw = response.data?.data
      return {
        staffList: (raw?.Staff ?? raw?.staff ?? []).map(toFrontend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Filter staff error:', error.message)
      return emptyListResponse(page)
    }
  },

  findByStaffCode: async (staffCode: string): Promise<Staff | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.FIND_BY_CODE), { staffCode })
      if (response.data?.status !== 200 || !response.data?.data) return null
      return toFrontend(response.data.data)
    } catch (error: any) {
      console.error('Error fetching staff by code:', error)
      return null
    }
  },

  getProfilePicture: async (imagePath: string): Promise<Blob> => {
    if (!imagePath) throw new Error('Image path is required')
    const response = await AxiosFunc.GetFile(imagePath)
    if (!(response.data instanceof Blob)) throw new Error('Invalid image response')
    return response.data
  },

  create: async (data: StaffFormData): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('data', JSON.stringify(toBackend(data)))
      if (data.profilePicture instanceof File)
        formData.append('profilePicture', data.profilePicture)
      if (data.resume instanceof File) formData.append('resume', data.resume)
      if (data.joiningLetter instanceof File) formData.append('joiningLetter', data.joiningLetter)
      if (data.otherDocument instanceof File) formData.append('otherDocument', data.otherDocument)

      const response = await AxiosFunc.PostFormData(buildUrl(EP.ADD), formData)
      if (response.data?.status !== 201 && response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to create staff')

      return response.data?.data ?? 'Staff created successfully'
    } catch (error: any) {
      console.error('Create staff error:', error)
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to create staff')
    }
  },

  updateDocument: async (
    staffCode: string,
    profilePicture?: File,
    resume?: File,
    joiningLetter?: File,
    otherDocument?: File,
  ): Promise<void> => {
    const formData = new FormData()
    if (profilePicture instanceof File) formData.append('profilePicture', profilePicture)
    if (resume instanceof File) formData.append('resume', resume)
    if (joiningLetter instanceof File) formData.append('joiningLetter', joiningLetter)
    if (otherDocument instanceof File) formData.append('otherDocument', otherDocument)

    const response = await AxiosFunc.PutFormData(buildUrl(EP.UPDATE_DOCUMENT(staffCode)), formData)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update staff documents')
  },

  update: async (staffCode: string, data: StaffFormData): Promise<void> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(staffCode)), toBackend(data))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update staff data')
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete staff')
    } catch (error: any) {
      if (error.response?.status === 500) return
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to delete staff')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE_MULTIPLE), ids.map(Number))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete staff')
  },

  deleteAll: async (): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE_ALL))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete all staff')
  },

  getRoles: async (): Promise<string[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_ROLES))
      return response.data?.status === 200 ? (response.data?.data ?? []) : []
    } catch (error: any) {
      console.error('Error fetching staff roles:', error)
      return []
    }
  },

  getDesignations: async (): Promise<string[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_DESIGNATIONS))
      return response.data?.status === 200 ? (response.data?.data ?? []) : []
    } catch (error: any) {
      console.error('Error fetching staff designations:', error)
      return []
    }
  },

  getDepartments: async (): Promise<string[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_DEPARTMENTS))
      return response.data?.status === 200 ? (response.data?.data ?? []) : []
    } catch (error: any) {
      console.error('Error fetching staff departments:', error)
      return []
    }
  },

  getStats: async (): Promise<StaffStats[]> => {
    try {
      const staff = await staffService.getAll()
      const teacherCount = staff.filter((s) => s.role === 'TEACHER').length
      return [
        { title: 'Total Staff', value: staff.length.toString(), change: '+0%', icon: 'Users' },
        { title: 'Teachers', value: teacherCount.toString(), change: '+0%', icon: 'GraduationCap' },
      ]
    } catch (error: any) {
      console.error('Error fetching staff stats:', error)
      return [
        { title: 'Total Staff', value: '0', change: '+0%', icon: 'Users' },
        { title: 'Teachers', value: '0', change: '+0%', icon: 'GraduationCap' },
      ]
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

    const token = localStorage.getItem('accessToken') ?? ''
    const url = `${API_BASE_URL}${buildUrl(EP.BULK_UPLOAD_XL)}`

    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const contentDisposition = response.headers.get('content-disposition') ?? ''

    if (
      contentType.includes('application/octet-stream') ||
      contentDisposition.includes('attachment')
    ) {
      return {
        success: 0,
        failed: -1,
        message: 'Some records failed. Download the error file for details.',
        errorFile: await response.blob(),
      }
    }

    const json = await response.json()
    if (json?.status !== 200) throw new Error(json?.message ?? 'Failed to upload staff Excel sheet')

    return {
      success: json?.data?.successCount ?? 0,
      failed: json?.data?.failureCount ?? 0,
      message: json?.message ?? 'All records uploaded successfully',
      errors: json?.data?.errors ?? [],
    }
  },

  downloadExcelTemplate: async (): Promise<Blob> => {
    try {
      const response = await AxiosFunc.GetFile(EP.DOWNLOAD_TEMPLATE_XL)
      if (!(response.data instanceof Blob)) throw new Error('Invalid file response from server')
      return response.data
    } catch (error: any) {
      console.error('Error downloading staff Excel template:', error)
      throw new Error(
        error.response?.data?.message ?? error.message ?? 'Failed to download Excel template',
      )
    }
  },
}

import AxiosFunc from '../../utils/axios'

interface CommonResponse<T = any> {
  status: number
  message: string
  data: T
}

const getSchoolCode = (): string => {
  const schoolCode = localStorage.getItem('schoolCode')
  if (!schoolCode) {
    console.error('schoolCode not found in localStorage')
    return ''
  }
  return schoolCode
}

const getSchoolGroupCode = (): string => {
  const schoolGroupCode =
    localStorage.getItem('schoolGroupCode') ||
    localStorage.getItem('groupCode') ||
    localStorage.getItem('school_group_code') ||
    localStorage.getItem('schoolGroup')

  if (!schoolGroupCode) {
    console.error(
      'schoolGroupCode not found in localStorage. Available keys:',
      Object.keys(localStorage),
    )
    return ''
  }
  return schoolGroupCode
}

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroupCode = getSchoolGroupCode()

  if (!schoolCode || !schoolGroupCode) {
    console.error('Missing schoolCode or schoolGroupCode. schoolCode:', schoolCode, 'schoolGroupCode:', schoolGroupCode)
  }

  return endpoint
    .replace('{schoolGroupCode}', schoolGroupCode)
    .replace('{schoolCode}', schoolCode)
}

const PARENT_DASHBOARD_ENDPOINTS = {
  ANALYTICS: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/analytics',
  CHILDREN: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/children',
  TRANSACTIONS: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/transactions',
  RESULTS: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/results',
  TIME_TABLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/time-table',
  TASKS: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/academic-tasks',
  UPLOAD_CONTENT: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/upload-content',
  EVENTS: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/events',
  ATTENDANCE: '/school-group/{schoolGroupCode}/school/{schoolCode}/parent/dashboard/attendance',
} as const

export interface AnalyticsResponse {
  dueFees: number
  totalResults: number
  totalExpenses: number
}

export interface Child {
  studentId: number
  admissionNo: string
  firstName: string
  middleName?: string
  lastName: string
  gender: string
  dob: string
  religion?: string
  castName?: string
  phoneNumber?: string
  email?: string
  photo?: string
  admissionDate: string
  className: string
  section: string
  rollNo: string
}

export interface Transaction {
  studentId: number
  studentName: string
  feeTransactionId: number
  amount: string
  discountAmount: string
  fine: string
  date: string
  receiptNo: string
  mode: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface MarksDto {
  subjectId: number
  subjectName: string
  totalMarks: number
  subjectType: string
  totalObtainMarks: number
}

export interface ResultResponseParentDTO {
  marksManagementId: number
  studentId: number
  examGroupId: number
  studentName: string
  examGroupName: string
  rollNumber: number
  studentClass: string
  studentSection: string
  grade: string
  percentage: number
  marks: MarksDto[]
}

export interface TaskResponseParentDTO {
  taskId: number
  title: string
  description: string
  taskType: string
  assignedDate: string
  submissionDate: string
  evaluationDate: string
  maxMarks: number
  attachmentPath: string
  status: string
  classId: number
  className: string
  sectionId: number
  sectionName: string
  studentId: number
  studentName: string
  teacherId: number
  teacherName: string
  subjectId: number
  subjectName: string
}

export interface TaskResponse {
  tasks: TaskResponseParentDTO[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface UploadContentResponseParentDTO {
  contentTypeId: number;
  name: string;
  description?: string;
}
export interface UploadContentResponse {
  tasks: UploadContentResponseParentDTO[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface EventResponseParentDTO {
  contentTypeId: number;
  name: string;
  description?: string;
}
export interface EventResponse {
  tasks: EventResponseParentDTO[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface AttendanceRecord {
  date: string
  attendanceStatus: string
}

export interface AttendanceResponseDTO {
  studentName: string
  className: string
  section: string
  rollNumber: string
  attendance: AttendanceRecord[]
}

export interface TimeTable {
  [key: string]: any
}

const formatDate = (date: string | Date): string => {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) {
    console.error('Invalid date:', date)
    return ''
  }
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const parentDashboardService = {
  getAnalytics: async (_schoolCode?: string): Promise<AnalyticsResponse> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.ANALYTICS))
    return (response.data as CommonResponse<AnalyticsResponse>).data
  },

  getChildren: async (_schoolCode?: string): Promise<Child[]> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.CHILDREN))
    return (response.data as CommonResponse<Child[]>).data
  },

  getTransactions: async (
    studentId: number = 0,
    page: number = 0,
    size: number = 10,
  ): Promise<TransactionsResponse> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.TRANSACTIONS), {
      studentId,
      page,
      size,
    })
    return (response.data as CommonResponse<TransactionsResponse>).data
  },

  getResults: async (_schoolCode?: string): Promise<ResultResponseParentDTO[]> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.RESULTS))
    return (response.data as CommonResponse<ResultResponseParentDTO[]>).data
  },

  getTimeTable: async (): Promise<TimeTable> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.TIME_TABLE))
    return (response.data as CommonResponse<TimeTable>).data
  },

  getTasks: async (
    _schoolCode: string, studentId: number = 0, page: number = 0, size: number = 10,
  ): Promise<TaskResponse> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.TASKS), {
      studentId,
      page,
      size,
    })
    return (response.data as CommonResponse<TaskResponse>).data
  },
  getUploadContent: async (
    _schoolCode: string, studentId: number = 0, page: number = 0, size: number = 10,
  ): Promise<UploadContentResponse> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.UPLOAD_CONTENT), {
      studentId,
      page,
      size,
    })
    return (response.data as CommonResponse<UploadContentResponse>).data
  },
  getEvent: async (
    _schoolCode: string, studentId: number = 0, page: number = 0, size: number = 10,
  ): Promise<EventResponse> => {
    const response = await AxiosFunc.Get(buildUrl(PARENT_DASHBOARD_ENDPOINTS.EVENTS), {
      studentId,
      page,
      size,
    })
    return (response.data as CommonResponse<EventResponse>).data
  },
  getAttendance: async (
  startDate?: string, // 'dd/MM/yyyy'
  endDate?: string,   // 'dd/MM/yyyy'
): Promise<AttendanceResponseDTO[]> => {
  const response = await AxiosFunc.Post(buildUrl(PARENT_DASHBOARD_ENDPOINTS.ATTENDANCE), {
    startDate: startDate ? formatDate(startDate) : undefined,
    endDate: endDate ? formatDate(endDate) : undefined,
  })
  return (response.data as CommonResponse<AttendanceResponseDTO[]>).data
},
}
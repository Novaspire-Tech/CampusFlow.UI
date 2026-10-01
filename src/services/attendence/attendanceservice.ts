import AxiosFunc from '../../utils/axios'
import type {
  BulkAttendanceDto,
  StudentAttendanceDto,
} from '../../types/attendence/attendancetypes'

const getSchoolCode = (): string => {
  return localStorage.getItem('schoolCode') || 'default'
}

const getSchoolGroupCode = (): string => {
  return localStorage.getItem('schoolGroupCode') || 'default'
}

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode).replace('{schoolCode}', schoolCode)
}

const buildUrlWithoutSchoolCode = (endpoint: string): string => {
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode)
}

const getSession = (): string => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  if (currentMonth >= 3) {
    return `${currentYear}-${currentYear + 1}`
  } else {
    return `${currentYear - 1}-${currentYear}`
  }
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const ATTENDANCE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/attendance/getAll',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/${id}`,
  GET_BY_STUDENT: (studentId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/student/${studentId}`,
  GET_BY_CLASS_SECTION_DATE: (classId: number, sectionId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/class/${classId}/section/${sectionId}`,
  GET_MONTHLY_REPORT: (classId: number, sectionId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/monthly-report/class/${classId}/section/${sectionId}`,
  ADD_SINGLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/add',
  ADD_BULK: '/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/add-bulk',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/attendance/delete-multiple',
  GET_TEACHER_DASHBOARD_ANALYTICS:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/teacher/dashboard/analytics',
  GET_SCHOOL_DASHBOARD: '/school-group/{schoolGroupCode}/schools/{schoolCode}/dashboard',
}

const formatDateForBackend = (date: string | Date): string => {
  if (!date) return ''

  let d: Date
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [day, month, year] = date.split('/')
      d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [month, day, year] = date.split('-')
      d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else {
      d = new Date(date)
    }
  } else {
    d = date
  }

  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const transformResponse = (item: any): StudentAttendanceDto => {
  return {
    studentAttendanceId: item.studentAttendanceId,
    attendance: item.attendance,
    note: item.note,
    attendanceDate: item.attendanceDate,
    studentId: item.studentId,
    studentName: item.studentName,
    admissionNo: item.admissionNo,
    rollNo: item.rollNo,
    classId: item.classId,
    className: item.className,
    sectionId: item.sectionId,
    sectionName: item.sectionName,
  }
}

export interface TeacherDashboardAnalytics {
  attendance: {
    presentStudentToday: number
    absentStudentToday: number
    lateStudentToday: number
    totalStudent: number
    presentPercentage: number
  }
  fees: {
    fullyPaidStudents: number
    partiallyPaidStudents: number
    unpaidStudents: number
  }
}

export interface SchoolDashboardData {
  role?: any
  financialReports?: any
  fees: {
    fullyPaidStudents: number
    partiallyPaidStudents: number
    unpaidStudents: number
  }
  totalStudent: number
  attendance: {
    lateStudentToday: number
    totalStudent: number
    presentStudentToday: number
    presentPercentage: number
    absentStudentToday: number
  }
}

export const attendanceService = {
  getAll: async (
    page = 0,
    size = 10000,
    sortDirection = 'asc',
  ): Promise<{
    attendance: StudentAttendanceDto[]
    currentPage: number
    totalItems: number
    totalPages: number
  }> => {
    try {
      const endpoint = isAllSchools()
        ? buildUrlWithoutSchoolCode(ATTENDANCE_ENDPOINTS.GET_ALL_SCHOOL)
        : buildUrl(ATTENDANCE_ENDPOINTS.GET_ALL)

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection,
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch attendance')
      }

      return {
        attendance: (response.data?.data?.attendance || []).map(transformResponse),
        currentPage: response.data?.data?.currentPage || 0,
        totalItems: response.data?.data?.totalItems || 0,
        totalPages: response.data?.data?.totalPages || 0,
      }
    } catch (error: any) {
      throw error
    }
  },

  getById: async (id: string): Promise<StudentAttendanceDto> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(ATTENDANCE_ENDPOINTS.GET_BY_ID(id)))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch attendance')
      }

      return transformResponse(response.data?.data)
    } catch (error: any) {
      throw error
    }
  },

  getByStudentAndDateRange: async (
    studentId: string,
    startDate: string,
    endDate: string,
  ): Promise<StudentAttendanceDto[]> => {
    try {
      const response = await AxiosFunc.Get(
        buildUrl(ATTENDANCE_ENDPOINTS.GET_BY_STUDENT(studentId)),
        {
          startDate: formatDateForBackend(startDate),
          endDate: formatDateForBackend(endDate),
        },
      )

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch attendance')
      }

      return (response.data?.data || []).map(transformResponse)
    } catch (error: any) {
      throw error
    }
  },

  getByClassSectionAndDate: async (
    classId: number,
    sectionId: number,
    date: string,
  ): Promise<StudentAttendanceDto[]> => {
    try {
      const formattedDate = formatDateForBackend(date)

      const response = await AxiosFunc.Get(
        buildUrl(ATTENDANCE_ENDPOINTS.GET_BY_CLASS_SECTION_DATE(classId, sectionId)),
        { date: formattedDate },
      )

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch attendance')
      }

      return (response.data?.data || []).map(transformResponse)
    } catch (error: any) {
      throw error
    }
  },

  getMonthlyReport: async (
    classId: number,
    sectionId: number,
    dateFrom: string,
    dateTo: string,
  ): Promise<any[]> => {
    try {
      const schoolCode = getSchoolCode()

      if (schoolCode === 'default') {
        console.error('schoolCode is missing from localStorage')
        throw new Error('School not selected. Please select a school first.')
      }

      const response = await AxiosFunc.Get(
        buildUrl(ATTENDANCE_ENDPOINTS.GET_MONTHLY_REPORT(classId, sectionId)),
        {
          dateFrom: formatDateForBackend(dateFrom),
          dateTo: formatDateForBackend(dateTo),
        },
      )

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch monthly report')
      }

      return response.data?.data || []
    } catch (error: any) {
      throw error
    }
  },

  getSchoolDashboard: async (): Promise<SchoolDashboardData> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(ATTENDANCE_ENDPOINTS.GET_SCHOOL_DASHBOARD))

      const data = response.data?.data || response.data || {}

      return {
        fees: {
          fullyPaidStudents: data.fees?.fullyPaidStudents || 0,
          partiallyPaidStudents: data.fees?.partiallyPaidStudents || 0,
          unpaidStudents: data.fees?.unpaidStudents || 0,
        },
        totalStudent: data.totalStudent || 0,
        attendance: {
          lateStudentToday: data.attendance?.lateStudentToday || 0,
          totalStudent: data.attendance?.totalStudent || 0,
          presentStudentToday: data.attendance?.presentStudentToday || 0,
          presentPercentage: data.attendance?.presentPercentage || 0,
          absentStudentToday: data.attendance?.absentStudentToday || 0,
        },
      }
    } catch (error) {
      console.error('Error fetching school dashboard:', error)
      return {
        fees: {
          fullyPaidStudents: 0,
          partiallyPaidStudents: 0,
          unpaidStudents: 0,
        },
        totalStudent: 0,
        attendance: {
          lateStudentToday: 0,
          totalStudent: 0,
          presentStudentToday: 0,
          presentPercentage: 0,
          absentStudentToday: 0,
        },
      }
    }
  },

  getTeacherDashboardAnalytics: async (): Promise<TeacherDashboardAnalytics> => {
    try {
      const session = getSession()
      const response = await AxiosFunc.Get(
        buildUrl(ATTENDANCE_ENDPOINTS.GET_TEACHER_DASHBOARD_ANALYTICS),
        { session },
      )

      if (response.data?.status === 200) {
        const data = response.data.data || {}
        return {
          attendance: {
            presentStudentToday: data.attendance?.presentStudentToday || 0,
            absentStudentToday: data.attendance?.absentStudentToday || 0,
            lateStudentToday: data.attendance?.lateStudentToday || 0,
            totalStudent: data.attendance?.totalStudent || 0,
            presentPercentage: data.attendance?.presentPercentage || 0,
          },
          fees: {
            fullyPaidStudents: data.fees?.fullyPaidStudents || 0,
            partiallyPaidStudents: data.fees?.partiallyPaidStudents || 0,
            unpaidStudents: data.fees?.unpaidStudents || 0,
          },
        }
      }

      throw new Error(response.data?.message || 'Failed to fetch teacher dashboard analytics')
    } catch (error) {
      console.error('Error fetching teacher dashboard analytics:', error)
      return {
        attendance: {
          presentStudentToday: 0,
          absentStudentToday: 0,
          lateStudentToday: 0,
          totalStudent: 0,
          presentPercentage: 0,
        },
        fees: {
          fullyPaidStudents: 0,
          partiallyPaidStudents: 0,
          unpaidStudents: 0,
        },
      }
    }
  },

  addSingle: async (attendance: StudentAttendanceDto): Promise<StudentAttendanceDto> => {
    try {
      const dto = {
        studentId: Number(attendance.studentId),
        attendance: attendance.attendance,
        note: attendance.note || '',
        attendanceDate: formatDateForBackend(attendance.attendanceDate!),
      }

      const response = await AxiosFunc.Post(buildUrl(ATTENDANCE_ENDPOINTS.ADD_SINGLE), dto)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to add attendance')
      }

      return transformResponse(response.data?.data)
    } catch (error: any) {
      throw error
    }
  },

  addBulk: async (bulkData: BulkAttendanceDto): Promise<StudentAttendanceDto[]> => {
    try {
      const dto = {
        attendanceDate: formatDateForBackend(bulkData.attendanceDate),
        classId: Number(bulkData.classId),
        sectionId: Number(bulkData.sectionId),
        attendanceRecords: bulkData.attendanceRecords.map((record) => ({
          studentId: Number(record.studentId),
          attendance: record.attendance,
          note: record.note || '',
        })),
      }

      const response = await AxiosFunc.Post(buildUrl(ATTENDANCE_ENDPOINTS.ADD_BULK), dto)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to add bulk attendance')
      }

      return (response.data?.data || []).map(transformResponse)
    } catch (error: any) {
      throw error
    }
  },

  update: async (id: string, attendance: StudentAttendanceDto): Promise<StudentAttendanceDto> => {
    try {
      const dto = {
        studentId: Number(attendance.studentId),
        attendance: attendance.attendance,
        note: attendance.note || '',
        attendanceDate: formatDateForBackend(attendance.attendanceDate!),
      }

      const response = await AxiosFunc.Put(buildUrl(ATTENDANCE_ENDPOINTS.UPDATE(id)), dto)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update attendance')
      }

      return transformResponse(response.data?.data)
    } catch (error: any) {
      throw error
    }
  },

  updateBulk: async (
    attendanceRecords: Array<{ id: number; data: StudentAttendanceDto }>,
  ): Promise<StudentAttendanceDto[]> => {
    try {
      const results: StudentAttendanceDto[] = []
      const errors: any[] = []

      for (const record of attendanceRecords) {
        try {
          const updated = await attendanceService.update(String(record.id), record.data)
          results.push(updated)
        } catch (error: any) {
          errors.push({ id: record.id, error: error.message })
        }
      }

      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} records`)
      }

      return results
    } catch (error: any) {
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(ATTENDANCE_ENDPOINTS.DELETE(id)))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete attendance')
      }
    } catch (error: any) {
      throw error
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(ATTENDANCE_ENDPOINTS.DELETE_MULTIPLE), ids)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete attendance records')
      }
    } catch (error: any) {
      throw error
    }
  },
}

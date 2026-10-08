import AxiosFunc from '../../utils/axios'
import type { StudentFeeRecord, FeeRowData } from '../../types/feesCollection/addStudentFeeTypes'

const getSchoolCode = (): string => {
  const schoolCode = localStorage.getItem('schoolCode')
  if (!schoolCode) {
    console.error('School code not found')
    return 'default'
  }
  return schoolCode
}

const getSchoolGroupCode = (): string => {
  const schoolGroupCode = localStorage.getItem('schoolGroupCode')
  if (!schoolGroupCode) {
    console.error('School group code not found')
    return 'default'
  }
  return schoolGroupCode
}

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode()
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode).replace('{schoolCode}', schoolCode)
}

const ENDPOINTS = {
  SEARCH_STUDENTS: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/filter',
  ADD_FEE: '/school-group/{schoolGroupCode}/school/{schoolCode}/fees/add',
  UPDATE_FEE: (feesId: number | string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fees/update/${feesId}`,
  DELETE_STUDENT_FEES: (studentId: number | string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/${studentId}/fees/all`,
  DELETE_FEE: (feesId: number | string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/fees/${feesId}`,
}

const extractStudentId = (student: any): string => {
  if (student.studentId && student.studentId !== '') return String(student.studentId)
  if (student.id && student.id !== '') return String(student.id)
  if (student._id && student._id !== '') return String(student._id)
  console.error('Could not extract ID from student:', student)
  return ''
}

const calcTotals = (feesList: FeeRowData[]) => {
  const totalFees = feesList.reduce((a, f) => a + (parseFloat(f.totalFees) || 0), 0)
  const totalPaid = feesList.reduce((a, f) => a + (parseFloat(f.paid) || 0), 0)
  const totalPending = feesList.reduce((a, f) => a + (parseFloat(f.pending) || 0), 0)
  return {
    totalFees: totalFees.toFixed(2),
    totalPaid: totalPaid.toFixed(2),
    totalPending: totalPending.toFixed(2),
  }
}

export const mapRawToStudentFeeRecord = (s: any): StudentFeeRecord => {
  const studentId = extractStudentId(s)

  if (!studentId) {
    console.error('Student missing ID:', s)
    throw new Error('Invalid student data: missing ID')
  }

  const feesList: FeeRowData[] = (s.feesList || []).map((f: any) => ({
    feeTypeId: String(f.feeTypeId || f.feeType?.feeTypeId || ''),
    feeTypeName: f.feeTypeName || f.feeType?.name || 'Unknown',
    totalFees: String(f.totalFees || '0'),
    paid: String(f.paid || '0'),
    pending: String(f.pending || '0'),
    classFeesId: String(f.classFeesId || ''),
    feesId: String(f.feesId || ''),
  }))

  const totals = calcTotals(feesList)

  return {
    id: studentId,
    admissionNo: s.admissionNo || s.uid || '',
    studentName: `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim(),
    class: s.className || '',
    classId: String(s.classId || ''),
    section: s.sectionName || '',
    sectionId: String(s.sectionId || ''),
    rollNo: s.rollNo || '',
    fatherName: s.fatherName || s.parent?.fatherName || 'N/A',
    gender: s.gender || '',
    mobile: s.phoneNumber || '',
    ...totals,
    feesList,
    hasFees: feesList.length > 0,
    _raw: s,
  }
}

export interface SearchStudentsParams {
  schoolClassId: number
  sectionId?: number
  searchQuery?: string
}
export interface AddFeeListItem {
  feeTypeId: number
  totalFees: string
  paid: string
  fine?: number | null
  classFeesId?: number | null
}

export interface AddFeePayload {
  studentId: number
  feeLists: AddFeeListItem[]
}

export interface UpdateFeePayload {
  studentId: number
  feeTypeId: number
  totalFees: number
  paid: number
  fine?: number | null
  classFeesId?: number | null
}

export interface SaveSingleFeeParams {
  studentId: string
  feeTypeId: number
  totalFees: number
  paid: number
  fine?: number | null
  classFeesId?: number | null
  feesId?: number | null
}

export interface SaveFeesParams {
  studentId: string
  fees: SaveSingleFeeParams[]
}

export const addStudentFeeService = {
  searchStudents: async (
    params: SearchStudentsParams,
    page = 0,
    size = 10,
    sortBy = 'admissionNo',
    sortDirection = 'asc',
  ): Promise<StudentFeeRecord[]> => {
    try {
      const body: any = {}
      if (params.schoolClassId) body.schoolClassId = params.schoolClassId
      if (params.sectionId) body.sectionId = params.sectionId
      if (params.searchQuery?.trim()) body.searchQuery = params.searchQuery.trim()

      const url = buildUrl(ENDPOINTS.SEARCH_STUDENTS)
      const qs = `page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
      const response = await AxiosFunc.Post(`${url}?${qs}`, body)

      if (response.data?.status !== 200) return []

      const raw: any[] = response.data?.data?.students || []
      if (!Array.isArray(raw)) return []

      return raw
        .map((s: any) => {
          try {
            return mapRawToStudentFeeRecord(s)
          } catch {
            return null
          }
        })
        .filter((s): s is StudentFeeRecord => s !== null && s.id !== '')
    } catch (error: any) {
      console.error('searchStudents error:', error)
      return []
    }
  },

  searchAllStudents: async (params: SearchStudentsParams): Promise<StudentFeeRecord[]> => {
    const pageSize = 10
    const students: StudentFeeRecord[] = []
    let page = 0
    let totalPages = 1

    do {
      const body: Record<string, number | string> = {}
      if (params.schoolClassId) body.schoolClassId = params.schoolClassId
      if (params.sectionId) body.sectionId = params.sectionId
      if (params.searchQuery?.trim()) body.searchQuery = params.searchQuery.trim()

      const url = buildUrl(ENDPOINTS.SEARCH_STUDENTS)
      const qs = `page=${page}&size=${pageSize}&sortBy=admissionNo&sortDirection=asc`
      const response = await AxiosFunc.Post(`${url}?${qs}`, body)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to search students')

      const data = response.data?.data
      const raw = data?.students
      if (!Array.isArray(raw)) throw new Error('Invalid student search response')
      students.push(...raw.map(mapRawToStudentFeeRecord))
      totalPages = Number(data?.totalPages ?? 1)
      page += 1
    } while (page < totalPages)

    return students
  },

  saveSingleFee: async (params: SaveSingleFeeParams): Promise<void> => {
    const isUpdate = params.feesId != null && params.feesId > 0

    let url: string
    let response: any

    if (isUpdate) {
      const updatePayload: UpdateFeePayload = {
        studentId: parseInt(params.studentId, 10),
        feeTypeId: params.feeTypeId,
        totalFees: params.totalFees,
        paid: params.paid,
        fine: params.fine ?? null,
        classFeesId: params.classFeesId ?? null,
      }

      url = buildUrl(ENDPOINTS.UPDATE_FEE(params.feesId!))
      response = await AxiosFunc.Put(url, updatePayload)
    } else {
      const addPayload: AddFeePayload = {
        studentId: parseInt(params.studentId, 10),
        feeLists: [
          {
            feeTypeId: params.feeTypeId,
            totalFees: String(params.totalFees),
            paid: String(params.paid),
            fine: params.fine ?? null,
            classFeesId: params.classFeesId ?? null,
          },
        ],
      }

      url = buildUrl(ENDPOINTS.ADD_FEE)
      response = await AxiosFunc.Post(url, addPayload)
    }

    const status = response?.data?.status
    if (status !== 200 && status !== 201) {
      throw new Error(
        response?.data?.message ||
          `Failed to ${isUpdate ? 'update' : 'add'} fee (status ${status})`,
      )
    }
  },

  saveFees: async ({
    studentId,
    fees,
  }: SaveFeesParams): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const fee of fees) {
      try {
        await addStudentFeeService.saveSingleFee({ ...fee, studentId })
        successCount++
      } catch (error: any) {
        errorCount++
        errors.push(error.message || `Failed for feeTypeId ${fee.feeTypeId}`)
        console.error(`[FeesService] saveSingleFee failed for feeTypeId=${fee.feeTypeId}:`, error)
      }
    }

    return { successCount, errorCount, errors }
  },

  deleteSingleFee: async (feesId: string | number): Promise<void> => {
    const url = buildUrl(ENDPOINTS.DELETE_FEE(feesId))
    console.log('[FeesService] DELETE single fee', url)
    const response = await AxiosFunc.Delete(url)

    const status = response?.data?.status
    if (status !== 200 && status !== 201) {
      throw new Error(
        response?.data?.message || `Failed to delete fee (status ${status})`,
      )
    }
  },

  deleteStudentFees: async (studentId: string | number): Promise<void> => {
    const url = buildUrl(ENDPOINTS.DELETE_STUDENT_FEES(studentId))
    console.log('[FeesService] DELETE all fees for student', url)
    const response = await AxiosFunc.Delete(url)

    const status = response?.data?.status
    if (status !== 200 && status !== 201) {
      throw new Error(
        response?.data?.message || `Failed to delete fees for student (status ${status})`,
      )
    }
  },
}
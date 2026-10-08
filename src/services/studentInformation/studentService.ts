import AxiosFunc from '../../utils/axios'
import { API_BASE_URL } from '../../utils/axios'
import type {
  Student,
  StudentFormData,
  StudentSearchParams,
  StudentsPaginatedResponse,
  UpdateCurrentStudentSessionRequestDTO,
} from '../../types/studentInformation/student'
import { openExpenseDocument } from '../expense/addExpenseService'

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

const buildUrlWithoutSchoolCode = (endpoint: string): string => {
  const schoolGroupCode = getSchoolGroupCode()
  return endpoint.replace('{schoolGroupCode}', schoolGroupCode)
}

const STUDENT_ENDPOINTS = {
  GET_ALL_WITH_SCHOOL: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/all',

  GET_ALL: '/school-group/{schoolGroupCode}/school/student/all',

  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student/${id}`,

  GET_SESSION_HISTORY: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/${id}/student-session/getAll`,
  UPDATE_CURRENT_STUDENT_SESSION: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/${id}/update-current/student-session`,

  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/update/${id}`,
  UPDATE_PHOTO: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/update/${id}/update/photo`,
  UPDATE_AADHAAR: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/update/${id}/update/documents`,
  UPDATE_PARENT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/update/${id}/update/parent-aadhaar`,
  UPDATE_BIRTHCERTIFICATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/update/${id}/update/birth-certificate`,
  DELETE: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/delete',
  DELETE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/deleteAll',
  BULK_UPLOAD_XL: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/add/xl-sheet',
  BULK_UPLOAD_STUDENT_SESSION_XL:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/student/add/student-session/xl-sheet',
  GET_PARENT: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/parent',
  GET_BY_CLASS: (schoolClassId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/get-by/school-class/${schoolClassId}`,
  GET_BY_CLASS_AND_EXAM_GROUP: (schoolClassId: string, examGroupId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/get-by/school-class/${schoolClassId}/exam-group/${examGroupId}`,
  GENERATE_ROLL_NUMBERS: (classId: string, sectionId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student/class/${classId}/section/${sectionId}/generate-roll-numbers`,

  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/filter',
  FILTER_ALL_SCHOOLS: '/school-group/{schoolGroupCode}/school/student/filter',

  DOWNLOAD_TEMPLATE_XL: '/templates/xl-sheets/students.xlsx',
  DOWNLOAD_SESSION_TEMPLATE_XL: '/templates/xl-sheets/student_sessions.xlsx',

  openExpenseDocument,
}

export interface StudentSessionHistoryRow {
  studentSessionId: number
  session: string
  className: string
  sectionName: string
  rollNo: string | null
  status: string
  startDate: string | null
  endDate: string | null
  departmentName: string | null
  stsNumber?: string | null
  grNumber?: string | null
}

export const formatDate = (date: string | Date): string => {
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

const updateStudentSessionRequestDTO = (data: UpdateCurrentStudentSessionRequestDTO) => {
  return {
    classId: Number(data.classId),
    sectionId: Number(data.sectionId),
    sessionId: data.sessionId ? Number(data.sessionId) : undefined,
    rollNumber: Number(data.rollNumber),
    ...(data.departmentId ? { classDepartmentId: Number(data.departmentId) } : {}),
 
  }
}

const transformToDTO = async (data: StudentFormData, classFeesData?: any[]) => {
  const dto: any = {
    stsNumber: data.stsNumber || '',
    grNumber: data.grNumber || '',
    udiseNumber: data.udiseNumber || '',
    rollNo: data.rollNo || null,
    startSession: data.startSession || '',
    firstName: data.firstName,
    lastName: data.lastName || null,
    ...(data.middleName ? { middleName: data.middleName } : {}),
    gender: data.gender,
    dob: formatDate(data.dob),
    aadhaarNumber: data.aadhaarNumber || null,
    departmentId: data.departmentId ? Number(data.departmentId) : undefined,
    classId: Number(data.classId),
    sectionId: Number(data.sectionId),
  }

  if (data.placeOfBirth) dto.placeOfBirth = data.placeOfBirth
  if (data.taluk) dto.taluk = data.taluk
  if (data.district) dto.district = data.district
  if (data.state) dto.state = data.state
  if (data.nationality) dto.nationality = data.nationality
  if (data.bloodGroup) dto.bloodGroup = data.bloodGroup
  if (data.religion) dto.religion = data.religion
  if (data.castName) dto.castName = data.castName
  if (data.rte) dto.rte = data.rte

  if (data.studentCategoryId) dto.studentCategoryId = Number(data.studentCategoryId)
  if (data.studentHouseId) dto.studentHouseId = Number(data.studentHouseId)
  if (data.isDisabled && data.disableReasonId) {
    dto.disableReasonId = Number(data.disableReasonId)
  }

  if (data.permanentAddress) dto.permanentAddress = data.permanentAddress
  if (data.previousSchool) dto.previousSchool = data.previousSchool
  if (data.previousSchoolClass) dto.previousSchoolClass = data.previousSchoolClass

  if (data.admissionDate) {
    const f = formatDate(data.admissionDate)
    if (f) dto.admissionDate = f
  }

  if (data.sslcData) dto.sslcData = data.sslcData

  const hasFatherName = !!data.fatherName?.trim()
  const hasParentPhone = !!data.parentPhone?.trim()

  if (hasFatherName || hasParentPhone) {
    const p = data.parent || ({} as any)
    const parentData: any = {}
    parentData.fatherName = data.fatherName || p.fatherName
    parentData.motherName = data.motherName || p.motherName
    parentData.defaultParent = data.parentDefaultParent || p.defaultParent
    parentData.name = data.parentName || p.name
    parentData.phoneNumber = data.parentPhone || p.parentPhone || p.phoneNumber
    parentData.alternatePhoneNumber = data.parentAlternatePhoneNumber || p.alternatePhoneNumber
    parentData.email = data.parentEmail || p.email
    parentData.qualification = data.parentQualification || p.qualification
    parentData.occupation = data.parentOccupation || p.occupation
    parentData.annualIncome = data.parentAnnualIncome || p.annualIncome
    parentData.incomeCertificateNumber =
      data.parentIncomeCertificateNumber || p.incomeCertificateNumber
    parentData.noOfDependents = data.parentNoOfDependents || p.noOfDependents
    dto.parentData = parentData
  }

  if (
    data.bankDetails?.bankAccountNumber ||
    data.bankDetails?.bankName ||
    data.bankDetails?.ifscCode
  ) {
    const bankData: any = {}
    if (data.bankDetails.bankAccountNumber)
      bankData.bankAccountNumber = data.bankDetails.bankAccountNumber
    if (data.bankDetails.bankName) bankData.bankName = data.bankDetails.bankName
    if (data.bankDetails.ifscCode) bankData.ifscCode = data.bankDetails.ifscCode
    dto.bankData = bankData
  }

  if (Array.isArray(data.siblingsList) && data.siblingsList.length > 0) {
    const mapped = data.siblingsList
      .filter((s) => s.siblingName || s.className)
      .map((s) => ({
        siblingName: s.siblingName || '',
        className: s.className || '',
      }))
    if (mapped.length > 0) dto.siblingData = mapped
  }

  const transport = data.transport && typeof data.transport === 'object' ? data.transport : data
  if ((transport as any).routeId) dto.routeId = Number((transport as any).routeId)
  if ((transport as any).pickupPointId) dto.pickupPointId = Number((transport as any).pickupPointId)
  const vehicleId = (transport as any).vehicleId || (transport as any).vehiclesId || data.vehicleId
  if (vehicleId) dto.vehiclesId = Number(vehicleId)

  const hostel = data.hostel && typeof data.hostel === 'object' ? data.hostel : data
  if ((hostel as any).hostelId) dto.hostelId = Number((hostel as any).hostelId)
  if ((hostel as any).roomTypeId) dto.roomTypeId = Number((hostel as any).roomTypeId)
  const roomId = (hostel as any).roomId || (hostel as any).hostelRoomId || (data as any).roomId
  if (roomId) dto.hostelRoomId = Number(roomId)

  let feesListToProcess: any[] = []

  if (Array.isArray(data.feesList) && data.feesList.length > 0) {
    feesListToProcess = data.feesList
  } else if (data.fees && typeof data.fees === 'object' && !Array.isArray(data.fees)) {
    const feesObj = data.fees as any
    for (const feeTypeId in feesObj) {
      if (!Object.prototype.hasOwnProperty.call(feesObj, feeTypeId)) continue
      const feeData = feesObj[feeTypeId]
      if (!feeData) continue
      const numericFeeTypeId = parseInt(feeTypeId, 10)
      if (isNaN(numericFeeTypeId)) continue
      feesListToProcess.push({
        feeTypeId: numericFeeTypeId,
        totalFees: feeData.totalFees || '0',
        paid: feeData.paid || '0',
        classFeesId: feeData.classFeesId || null,
        feesId: feeData.feesId || null,
      })
    }
  }

  if (feesListToProcess.length > 0) {
    const processedFees = feesListToProcess
      .map((fee) => {
        if (!fee.feeTypeId) return null
        const feeEntry: any = {
          feeTypeId: Number(fee.feeTypeId),
          totalFees: fee.totalFees || '0',
          paid: fee.paid || '0',
        }
        const classFeesIdNum = fee.classFeesId ? parseInt(fee.classFeesId, 10) : null
        const feesIdNum = fee.feesId ? parseInt(fee.feesId, 10) : null
        if (feesIdNum !== null && !isNaN(feesIdNum)) feeEntry.feesId = feesIdNum
        if (classFeesIdNum !== null && !isNaN(classFeesIdNum)) {
          feeEntry.classFeesId = classFeesIdNum
        } else if (classFeesData && Array.isArray(classFeesData)) {
          const match = classFeesData.find(
            (cf: any) => cf.feesTypeId === fee.feeTypeId && cf.schoolClassId === dto.classId,
          )
          if (match?.classFeesId) feeEntry.classFeesId = match.classFeesId
        }
        return feeEntry
      })
      .filter((f): f is NonNullable<typeof f> => f !== null)

    dto.feesList = processedFees.length > 0 ? processedFees : undefined
  } else {
    dto.feesList = undefined
  }
  return dto
}

const transformResponseToStudent = (item: any): Student => {
  const student: Student = {
    studentId: item.studentId?.toString(),
    admissionNo: item.admissionNo,
    rollNo: item.rollNo || '',
    stsNumber: item.stsNumber || '',
    grNumber: item.grNumber || '',
    udiseNumber: item.udiseNumber || '',
    firstName: item.firstName,
    middleName: item.middleName,
    lastName: item.lastName,
    gender: item.gender,
    dob: item.dob,
    classId: item.classId?.toString() || '',
    className: item.className || '',
    sectionId: item.sectionId?.toString() || '',
    sectionName: item.sectionName || '',
    departmentId: item.departmentId?.toString() || '',
    departmentName: item.departmentName || '',
    studentCategoryId: item.studentCategoryId?.toString() || null,
    studentCategoryName: item.studentCategoryName || null,
    studentHouseId: item.studentHouseId?.toString() || null,
    studentHouseName: item.studentHouseName || null,
    phoneNumber: item.phoneNumber,
    email: item.email,
    religion: item.religion,
    castName: item.castName,
    admissionDate: item.admissionDate,
    photo: item.photo,
    aadhaarNumber: item.aadhaarNumber || '',
    aadhaarFile: item.aadhaarFile || '',

    
    
    incomeCasteCertificate: item.incomeCasteCertificateFile || '',
    migrationBonafide: item.migrationBonafideFile || '',
    transferCertificate: item.transferCertificateFile || '',
    sslcMarksSheet: item.sslcMarksSheetFile || '',

    birthCertificateFile: item.birthCertificateFile || '',
    bloodGroup: item.bloodGroup,
    height: item.height,
    weight: item.weight,
    measurementDate: item.measurementDate,
    placeOfBirth: item.placeOfBirth || '',
    taluk: item.taluk || '',
    district: item.district || '',
    state: item.state || '',
    nationality: item.nationality || '',
    currentAddress: item.currentAddress,
    permanentAddress: item.permanentAddress,
    previousSchool: item.previousSchool,
    previousSchoolClass: item.previousSchoolClass,
    uid: item.uid,
    isDisabled: item.disableReasonId != null && item.disableReasonId !== '',
    disableReasonId: item.disableReasonId?.toString() || null,
    disableReasonName: item.disableReasonName || null,
    startSession: item.startSession || '',
    session: item.startSession || '',
    sessionId: '',
    studentSessions: undefined,
    fatherName: item.parent?.fatherName || item.fatherName || '',
    parentPhone: item.parent?.phoneNumber || item.parentPhone || '',
    motherName: item.parent?.motherName || item.motherName || '',
    fatherOccupation: item.parent?.fatherOccupation || item.fatherOccupation || '',
    fatherPhone: item.parent?.fatherPhone || item.fatherPhone || '',
    motherOccupation: item.parent?.motherOccupation || item.motherOccupation || '',
    motherPhone: item.parent?.motherPhone || item.motherPhone || '',
    parentName: item.parent?.name || '',
    parentAadhaarNumber: item.parent?.aadhaarNumber || '',
    fatherAadhaar: item.parent?.fatherAadhaar || '',
    motherAadhaar: item.parent?.motherAadhaar || '',
    parentQualification: item.parent?.qualification || '',
    parentOccupation: item.parent?.occupation || '',
    parentAnnualIncome: item.parent?.annualIncome || '',
    parentIncomeCertificateNumber: item.parent?.incomeCertificateNumber || '',
    parentNoOfDependents: item.parent?.noOfDependents || '',
    parentAlternatePhoneNumber: item.parent?.alternatePhoneNumber || '',
    parentEmail: item.parent?.email || '',
    parentDefaultParent: item.parent?.defaultParent || '',
    guardianName: item.parent?.guardianName || item.guardianName || '',
    guardianRelation: item.parent?.guardianRelation || item.guardianRelation || '',
    guardianEmail: item.parent?.guardianEmail || item.guardianEmail || '',
    guardianPhone: item.parent?.guardianPhone || item.guardianPhone || '',
    guardianOccupation: item.parent?.guardianOccupation || item.guardianOccupation || '',
    guardianAddress: item.parent?.guardianAddress || item.guardianAddress || '',
    siblingsList: (item.siblingsList || []).map((s: any) => ({
      siblingsId: s.siblingsId?.toString(),
      siblingName: s.siblingName || '',
      siblingClassName: s.siblingClassName || '',
    })),
    description: item.description,
    bankAccountNumber: item.bankDetails?.bankAccountNumber || item.bankAccountNumber || '',
    bankPassbook:item.bankDetails?.bankPassbookFile || '',
    bankName: item.bankDetails?.bankName || item.bankName || '',
    ifscCode: item.bankDetails?.ifscCode || item.ifscCode || '',
    nationalIdentification: item.nationalIdentification || '',
    localIdentification: item.localIdentification || '',
    rte: item.rte || '',
    note: item.note || '',
    documentTitle: item.documentTitle || '',
    document: item.document || '',
    sslcData: item.sslcDetailsResponse
      ? {
          schoolNameWithAddress: item.sslcDetailsResponse.schoolNameWithAddress || '',
          registrationNo: item.sslcDetailsResponse.registrationNo || '',
          firstLanguage: item.sslcDetailsResponse.firstLanguage || '',
          secondLanguage: item.sslcDetailsResponse.secondLanguage || '',
          thirdLanguage: item.sslcDetailsResponse.thirdLanguage || '',
          percentage: item.sslcDetailsResponse.percentage || '',
          result: item.sslcDetailsResponse.result || '',
          sslcHallTicket: item.sslcDetailsResponse.sslcHallTicketFile || '',
          sslcMarksSheetFile: item.sslcDetailsResponse.sslcMarksSheetFile || '',
          marksList: (item.sslcDetailsResponse.sslcMarks || []).map((m: any) => ({
            subjectName: m.subjectName || '',
            maxMarks: m.maxMarks || '',
            obtainMarks: m.obtainMarks || '',
          })),
        }
      : undefined,
    feesList: (Array.isArray(item.feesList) ? item.feesList : [])
      .map((fee: any) => {
        const feeTypeId = fee.feeTypeId ?? fee.feeType?.feeTypeId
        if (!feeTypeId) return null
        return {
          feesId: fee.feesId?.toString(),
          classFeesId: fee.classFeesId?.toString(),
          feeTypeId: feeTypeId.toString(),
          feeTypeName: fee.feeTypeName || fee.feeType?.name || '',
          totalFees: fee.totalFees || '0',
          paid: fee.paid || '0',
          pending: fee.pending || '0',
        }
      })
      .filter(Boolean),
    routeId: item.routeId?.toString() || null,
    routeName: item.routeTitle || item.routeName || null,
    vehicleId: item.vehicleId?.toString() || null,
    vehicleNumber: item.vehicleNumber || null,
    pickupPointId: item.pickupPointId?.toString() || null,
    pickupPointName: item.pickupPointName || null,
    hostelId: item.hostelId?.toString() || null,
    hostelName: item.hostelName || null,
    roomId: item.hostelRoomId?.toString() || null,
    roomNumber: item.roomNumber || null,
    roomTypeId: item.roomTypeId?.toString() || null,
    roomTypeName: item.roomTypeName || null,
    data: undefined,
    id: '',
  }

  if (item.routeId || item.vehicleId || item.pickupPointId) {
    student.transport = {
      routeId: item.routeId?.toString() || '',
      routeName: item.routeTitle || item.routeName || '',
      vehicleId: item.vehicleId?.toString() || '',
      vehicleNumber: item.vehicleNumber || '',
      pickupPointId: item.pickupPointId?.toString() || '',
      pickupPointName: item.pickupPointName || '',
      fareAmount: item.fareAmount || '0',
    }
  }
  if (item.hostelId || item.hostelRoomId || item.roomTypeId) {
    student.hostel = {
      hostelId: item.hostelId?.toString() || '',
      hostelName: item.hostelName || '',
      roomId: item.hostelRoomId?.toString() || '',
      roomNumber: item.roomNumber || '',
      roomTypeId: item.roomTypeId?.toString() || '',
      roomTypeName: item.roomTypeName || '',
      costPerBed: item.costPerBed || '0',
    }
  }

  return student
}

export const studentService = {
  getAllPages: async (sortDirection = 'asc'): Promise<StudentsPaginatedResponse> => {
    const pageSize = 10
    const firstPage = await studentService.getAll(0, pageSize, sortDirection)
    const students = [...firstPage.students]
    for (let page = 1; page < firstPage.totalPages; page += 1) {
      const response = await studentService.getAll(page, pageSize, sortDirection)
      students.push(...response.students)
    }
    return { ...firstPage, students, currentPage: 0 }
  },

  getAll: async (
    page = 0,
    size = 10,
    sortDirection = 'asc',
  ): Promise<StudentsPaginatedResponse> => {
    try {
      const schoolCode = getSchoolCode()
      let url = ''
      if (schoolCode === 'default') {
        url = buildUrlWithoutSchoolCode(STUDENT_ENDPOINTS.GET_ALL)
      } else {
        url = buildUrl(STUDENT_ENDPOINTS.GET_ALL_WITH_SCHOOL)
      }
      const response = await AxiosFunc.Get(url, { page, size, sortDirection })
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch students')
      const rawList: any[] = response.data?.data?.students || response.data?.data?.addExpenses || []
      const students = rawList.map(transformResponseToStudent)
      return {
        students,
        currentPage: response.data?.data?.currentPage ?? 0,
        totalItems: response.data?.data?.totalItems ?? 0,
        totalPages: response.data?.data?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error fetching students:', error)
      throw error
    }
  },

  search: async (
    params: StudentSearchParams,
    page = 0,
    size = 10,
    sortBy = 'admissionNo',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<StudentsPaginatedResponse> => {
    try {
      const body: Record<string, any> = {}

      const schoolClassId = Number(params.schoolClassId)
      if (!isNaN(schoolClassId) && schoolClassId > 0) {
        body.schoolClassId = schoolClassId
      }
      const sectionId = Number(params.sectionId)
      if (!isNaN(sectionId) && sectionId > 0) {
        body.sectionId = sectionId
      }

      if (params.searchQuery?.trim()) body.searchQuery = params.searchQuery.trim()
      if (params.sessionStatus) body.sessionStatus = params.sessionStatus

      const schoolCode = getSchoolCode()

      const baseUrl =
        schoolCode === 'default'
          ? buildUrlWithoutSchoolCode(STUDENT_ENDPOINTS.FILTER_ALL_SCHOOLS)
          : buildUrl(STUDENT_ENDPOINTS.FILTER)

      const qs = `page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

      const response = await AxiosFunc.Post(`${baseUrl}?${qs}`, body)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to search students')
      const students = (response.data?.data?.students || []).map(transformResponseToStudent)
      return {
        students,
        currentPage: response.data?.data?.currentPage ?? 0,
        totalItems: response.data?.data?.totalItems ?? 0,
        totalPages: response.data?.data?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error searching students:', error)
      throw error
    }
  },

  searchAllPages: async (
    params: StudentSearchParams,
    sortBy = 'admissionNo',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<StudentsPaginatedResponse> => {
    const pageSize = 10
    const firstPage = await studentService.search(params, 0, pageSize, sortBy, sortDirection)
    const students = [...firstPage.students]
    for (let page = 1; page < firstPage.totalPages; page += 1) {
      const response = await studentService.search(params, page, pageSize, sortBy, sortDirection)
      students.push(...response.students)
    }
    return { ...firstPage, students, currentPage: 0 }
  },

  getProfilePicture: async (imagePath: string): Promise<Blob> => {
    if (!imagePath) throw new Error('Image path is required')
    const response = await AxiosFunc.GetFile(imagePath)
    if (!(response.data instanceof Blob)) throw new Error('Invalid image response')
    return response.data
  },

  getById: async (id: string): Promise<Student> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(STUDENT_ENDPOINTS.GET_BY_ID(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch student')
      return transformResponseToStudent(response.data?.data)
    } catch (error: any) {
      console.error('Error fetching student:', error)
      throw error
    }
  },

  getSessionHistory: async (id: string): Promise<StudentSessionHistoryRow[]> => {
    try {
      const url = buildUrl(STUDENT_ENDPOINTS.GET_SESSION_HISTORY(id))
      const response = await AxiosFunc.Get(url)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch session history')
      const raw: any[] = response.data?.data ?? []
      return raw.map(
        (item: any): StudentSessionHistoryRow => ({
          studentSessionId: item.studentSessionId ?? item.id ?? 0,
          session: item.session || item.sessionName || '—',
          className: item.className || '—',
          sectionName: item.sectionName || '—',
          rollNo: item.rollNo ?? null,
          status: item.status || '—',
          startDate: item.startDate ?? null,
          endDate: item.endDate ?? null,
          departmentName: item.departmentName ?? null,
          stsNumber: item.stsNumber ?? null,
          grNumber: item.grNumber ?? null,
        }),
      )
    } catch (error: any) {
      console.error('Error fetching student session history:', error)
      throw error
    }
  },

  updateCurrentSession: async (
    id: string,
    data: UpdateCurrentStudentSessionRequestDTO,
  ): Promise<void> => {
    try {
      const dto = updateStudentSessionRequestDTO(data)
      const response = await AxiosFunc.Put(
        buildUrl(STUDENT_ENDPOINTS.UPDATE_CURRENT_STUDENT_SESSION(id)),
        dto,
      )
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update student session')
    } catch (error: any) {
      console.error('Error updating student session:', error)
      const msg =
        error.response?.data?.message || error.message || 'Failed to update student session'
      throw new Error(msg)
    }
  },

  getParents: async (page = 0, size = 10, sortDirection = 'asc'): Promise<any> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(STUDENT_ENDPOINTS.GET_PARENT), {
        page,
        size,
        sortDirection,
      })
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch parents')
      return {
        parents: response.data?.data?.parents || [],
        currentPage: response.data?.data?.currentPage ?? 0,
        totalItems: response.data?.data?.totalItems ?? 0,
        totalPages: response.data?.data?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error fetching parents:', error)
      throw error
    }
  },

  getByClass: async (
    schoolClassId: string,
    sectionId?: string,
    page = 0,
    size = 10,
    sortDirection = 'asc',
  ): Promise<StudentsPaginatedResponse> => {
    try {
      const params: any = { page, size, sortDirection }
      if (sectionId) params.sectionId = sectionId
      const response = await AxiosFunc.Get(
        buildUrl(STUDENT_ENDPOINTS.GET_BY_CLASS(schoolClassId)),
        params,
      )
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch students by class')
      const students = (response.data?.data?.students || []).map(transformResponseToStudent)
      return {
        students,
        currentPage: response.data?.data?.currentPage ?? 0,
        totalItems: response.data?.data?.totalItems ?? 0,
        totalPages: response.data?.data?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error fetching students by class:', error)
      throw error
    }
  },

  getByClassAndExamGroup: async (
    schoolClassId: string,
    examGroupId: string,
    page = 0,
    size = 10,
    sortDirection = 'asc',
  ): Promise<StudentsPaginatedResponse> => {
    try {
      const response = await AxiosFunc.Get(
        buildUrl(STUDENT_ENDPOINTS.GET_BY_CLASS_AND_EXAM_GROUP(schoolClassId, examGroupId)),
        { page, size, sortDirection },
      )      
      if (response.data?.status !== 200)
        throw new Error(
          response.data?.message || 'Failed to fetch students by class and exam group',
        )
      const students = (response.data?.data?.students || []).map(transformResponseToStudent)
      return {
        students,
        currentPage: response.data?.data?.currentPage ?? 0,
        totalItems: response.data?.data?.totalItems ?? 0,
        totalPages: response.data?.data?.totalPages ?? 0,
      }
    } catch (error: any) {
      console.error('Error fetching students by class and exam group:', error)
      throw error
    }
  },

  create: async (data: StudentFormData, classFeesData?: any[]): Promise<Student> => {
    try {
      const dto = await transformToDTO(data, classFeesData)
      const formData = new FormData()
      formData.append('data', JSON.stringify(dto))
      if (data.photo instanceof File) formData.append('photo', data.photo)
      if ((data as any).studentAadhaar instanceof File)
        formData.append('studentAadhaar', (data as any).studentAadhaar)

      if ((data as any).fatherAadhaar instanceof File)
        formData.append('fatherAadhaar', (data as any).fatherAadhaar)
      if ((data as any).motherAadhaar instanceof File)
        formData.append('motherAadhaar', (data as any).motherAadhaar)
      if ((data as any).bankPassbook instanceof File)
        formData.append('bankPassbook', (data as any).bankPassbook)
      if ((data as any).sslcHallTicket instanceof File)
        formData.append('sslcHallTicket', (data as any).sslcHallTicket)
      if ((data as any).incomeCasteCertificate instanceof File)
        formData.append('incomeCasteCertificate', (data as any).incomeCasteCertificate)
      if ((data as any).migrationBonafide instanceof File)
        formData.append('migrationBonafide', (data as any).migrationBonafide)
      if ((data as any).transferCertificate instanceof File)
        formData.append('transferCertificate', (data as any).transferCertificate)
      if ((data as any).sslcMarksSheet instanceof File)
        formData.append('sslcMarksSheet', (data as any).sslcMarksSheet)
      if ((data as any).birthCertificate instanceof File)

        formData.append('birthCertificate', (data as any).birthCertificate)
      const response = await AxiosFunc.PostFormData(buildUrl(STUDENT_ENDPOINTS.CREATE), formData)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create student')
      return transformResponseToStudent(response.data?.data)
    } catch (error: any) {
      console.error('Error creating student:', error)
      const msg = error.response?.data?.message || error.message || 'Failed to create student'
      throw new Error(msg)
    }
  },

  update: async (id: string, data: StudentFormData, classFeesData?: any[]): Promise<Student> => {
    
    try {
      const dto = await transformToDTO(data, classFeesData)
      const response = await AxiosFunc.Put(buildUrl(STUDENT_ENDPOINTS.UPDATE(id)), dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update student')
      return transformResponseToStudent(response.data?.data)
    } catch (error: any) {
      console.error('Error updating student:', error)
      const msg = error.response?.data?.message || error.message || 'Failed to update student'
      throw new Error(msg)
    }
  },

  updateDocument: async (studentId: string, photo: File): Promise<void> => {
    const formData = new FormData()
    if (photo instanceof File) formData.append('photo', photo)
    const response = await AxiosFunc.PutFormData(
      buildUrl(STUDENT_ENDPOINTS.UPDATE_PHOTO(studentId)),
      formData,
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update student document')
  },

  updateOtherDocuments: async (studentId: string, aadhaar: File, birthCertificate: File, incomeCasteCertificateFile: File, migrationBonafide: File, transferCertificateFile: File, bankPassbookFile: File, sslcHallTicketFile: File, sslcMarksSheetFile: File): Promise<void> => {
    const formData = new FormData()
    if (aadhaar instanceof File) formData.append('aadhaar', aadhaar)
    if (birthCertificate instanceof File) formData.append('birthCertificate', birthCertificate)
    if (incomeCasteCertificateFile instanceof File) formData.append('incomeCasteCertificateFile', incomeCasteCertificateFile)
    if (migrationBonafide instanceof File) formData.append('migrationBonafideFile', migrationBonafide)
    if (transferCertificateFile instanceof File) formData.append('transferCertificateFile', transferCertificateFile)
    if (bankPassbookFile instanceof File) formData.append('bankPassbookFile', bankPassbookFile)
    if (sslcHallTicketFile instanceof File) formData.append('sslcHallTicketFile', sslcHallTicketFile)
    if (sslcMarksSheetFile instanceof File) formData.append('sslcMarksSheetFile', sslcMarksSheetFile)
    const response = await AxiosFunc.PutFormData(
      buildUrl(STUDENT_ENDPOINTS.UPDATE_AADHAAR(studentId)),
      formData,
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update student document')
  },

  updateParentAadhaar: async (
    studentId: string,
    fatherAadhaar: File,
    motherAadhaar: File,
  ): Promise<void> => {
    const formData = new FormData()
    if (motherAadhaar instanceof File) formData.append('motherAadhaar', motherAadhaar)
    if (fatherAadhaar instanceof File) formData.append('fatherAadhaar', fatherAadhaar)
    const response = await AxiosFunc.PutFormData(
      buildUrl(STUDENT_ENDPOINTS.UPDATE_PARENT(studentId)),
      formData,
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update mother aadhaar document')
  },

  updateBirthCertificate: async (studentId: string, birthCertificate: File): Promise<void> => {
    const formData = new FormData()
    if (birthCertificate instanceof File) formData.append('birthCertificate', birthCertificate)
    
    const response = await AxiosFunc.PutFormData(
      buildUrl(STUDENT_ENDPOINTS.UPDATE_BIRTHCERTIFICATE(studentId)),
      formData,
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update birth certificate')
  },

  generateRollNumbers: async (
    classId: string,
    sectionId: string,
    rollNumberType: string,
  ): Promise<void> => {
    try {
      const response = await AxiosFunc.Put(
        `${buildUrl(STUDENT_ENDPOINTS.GENERATE_ROLL_NUMBERS(classId, sectionId))}?rollNumberType=${rollNumberType}`,
        null,
      )
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to generate roll numbers')
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to generate roll numbers'
      throw new Error(msg)
    }
  },

  delete: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id))
      const response = await AxiosFunc.Delete(buildUrl(STUDENT_ENDPOINTS.DELETE), numericIds)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete students')
    } catch (error: any) {
      console.error('Error deleting students:', error)
      throw error
    }
  },

  deleteAll: async (): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(STUDENT_ENDPOINTS.DELETE_ALL))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete all students')
    } catch (error: any) {
      console.error('Error deleting all students:', error)
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
    const url = `${API_BASE_URL}${buildUrl(STUDENT_ENDPOINTS.BULK_UPLOAD_XL)}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
    if (json?.status !== 200) throw new Error(json?.message || 'Failed to upload student Excel')
    return {
      success: json?.data?.successCount ?? 0,
      failed: json?.data?.failureCount ?? 0,
      message: json?.message || 'All records uploaded successfully',
      errors: json?.data?.errors ?? [],
    }
  },

  bulkUploadStudentSessionFromExcel: async (
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
    const url = `${API_BASE_URL}${buildUrl(STUDENT_ENDPOINTS.BULK_UPLOAD_STUDENT_SESSION_XL)}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
      throw new Error(json?.message || 'Failed to upload student session Excel')
    return {
      success: json?.data?.successCount ?? 0,
      failed: json?.data?.failureCount ?? 0,
      message: json?.message || 'All student session records uploaded successfully',
      errors: json?.data?.errors ?? [],
    }
  },

  downloadExcelTemplate: async (): Promise<Blob> => {
    try {
      const response = await AxiosFunc.GetFile(buildUrl(STUDENT_ENDPOINTS.DOWNLOAD_TEMPLATE_XL))
      if (!(response.data instanceof Blob)) throw new Error('Invalid file response from server')
      return response.data
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to download Excel template'
      throw new Error(msg)
    }
  },

  downloadSessionExcelTemplate: async (): Promise<Blob> => {
    try {
      const response = await AxiosFunc.GetFile(
        buildUrl(STUDENT_ENDPOINTS.DOWNLOAD_SESSION_TEMPLATE_XL),
      )
      if (!(response.data instanceof Blob)) throw new Error('Invalid file response from server')
      return response.data
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to download Excel template'
      throw new Error(msg)
    }
  },
}

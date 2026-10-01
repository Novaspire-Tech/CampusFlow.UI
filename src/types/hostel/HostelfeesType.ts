export interface StudentHostelFeeDTO {
  studentId: number
  hostelRoomId: number
  startDate: string
  totalMonths: number
  paid: number
}

export interface UpdateStudentHostelFeeDTO {
  newTotalMonths: number
  additionalPayment: number
  hostelRoomId?: number
}

export interface FilterStudentHostelFee {
  hostelId?: number
  roomTypeId?: number
  classId?: number
  gender?: string
  search?: string
}

export interface StudentHostelFeeResponse {
  id: number
  studentHostelFeeId: number
  studentId: number
  firstName: string
  lastName: string
  admissionNo: string
  studentClass?: string
  section?: string
  startDate: string
  endDate: string
  totalMonths: number
  totalFees: number
  paidFees: number
  hostelId?: number
  hostelName?: string
  roomId?: number
  roomName?: string
  roomTypeId?: number
  roomTypeName?: string
}

export interface StudentHostelFeeRow {
  id: number
  admissionNo: string
  studentName: string
  className: string
  classId: number
  sectionName: string
  sectionId: number
  rollNo: string
  fatherName: string
  gender: string
  mobile: string
  allocation: StudentHostelFeeResponse | null
  hasHostelFee: boolean
  hostelName: string
  roomName: string
  _raw: any
}

export interface StudentHostelFeePage {
  totalElements: number
  content: StudentHostelFeeResponse[]
  currentPage: number
  totalItems: number
  totalPages: number
}

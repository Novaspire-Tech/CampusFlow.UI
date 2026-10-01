export type SessionStatus = 'CONTINUE' | 'LEAVE'
export type StudentStatusType = 'PASS' | 'FAIL'

export interface PromotionFee {
  feeTypeId: number
  classFeeId: number
  totalFees: string
  paid: string
}

export interface StudentStatus {
  studentId: number
  status: StudentStatusType
  nextSessionStatus: SessionStatus
}

export interface PromoteStudentRequest {
  classId?: number | null
  departmentId?: number | null
  sectionId?: number | null
  sessionName?: string | null
  fees?: PromotionFee[] | null
  isFeesForward: boolean
  students: StudentStatus[]
}

export interface FeeTypeOption {
  feeTypeId: number
  feeTypeName: string
  amount: string
  selected: boolean
  classFeeId?: number
}

export interface StudentForPromotion {
  studentId: number
  admissionNo: string
  firstName: string
  lastName: string
  fatherName: string
  dob: string
}

export interface StudentWithStatus extends StudentForPromotion {
  currentResult: StudentStatusType
  nextSessionStatus: SessionStatus
}

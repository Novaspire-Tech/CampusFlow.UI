export interface StudentTransportFees {
  studentTransportFeesId: number
  content?: string

  // Student
  studentId: number
  firstName: string
  lastName: string
  admissionNo: string
  studentClass: string
  section: string

  // Parent
  parentName: string
  parentPhone: string

  // Duration
  startDate: string
  endDate: string
  totalMonths: number

  // Fees
  totalFees: number
  paidFees: number

  // Route
  routeId: number
  routeName: string

  // Pickup Point
  pickUpPointId: number
  pickUpPointName: string

  // Vehicle
  vehicleId: number
  vehicleName: string
}

export interface StudentTransportFeesFormData {
  studentId: number | string
  routeId: number | string
  pickUpPointId: number | string
  paid: number | string
  totalMonths: number | string
  startDate: string
}

export interface UpdateTransportPaymentData {
  fee: number // BigDecimal on backend
}

export interface UpdateStudentTransportFeeFormData {
  newTotalMonths: number | string
  routeId?: number | string | null
  pickUpPointId?: number | string | null
}

export interface StudentTransportFeesFilterCriteria {
  studentId?: number | null
  routeId?: number | null
  pickUpPointId?: number | null
  classId?: number | null
  gender?: string | null
  search?: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  totalItems: number
  totalPages: number
}
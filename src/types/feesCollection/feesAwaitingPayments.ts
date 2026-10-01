export interface StudentFeeSummaryRequestDTO {
    schoolClassId?: number | null
    sectionId?: number | null
    classDepartmentId?: number | null
    search?: string | null
    feePaymentStatus?: FeePaymentStatus | null
}

export type FeePaymentStatus = 'PAID' | 'UNPAID' | 'PARTIALLY_PAID'

export interface FeeTypeSummary {
    totalFees: number
    paid: number
    pending: number
}

export interface StudentFeeSummaryResponseDTO {
    studentSessionId: number
    studentName: string
    className: string
    sectionName: string
    admissionNumber: string
    fatherName: string
    phone: string
    rte: boolean
    feeSummaryByType: Record<string, FeeTypeSummary>
}

export interface FlatFeeSummaryRow {
    id: string
    studentSessionId: number
    studentName: string
    className: string
    sectionName: string
    admissionNumber: string
    fatherName: string
    phone: string
    rte: boolean | undefined
    feeName: string
    totalFee: number
    paid: number
    pending: number
    isFirstRow: boolean
    feeCount: number
}

export interface FeesAwaitingSearchForm {
    classId: string
    sectionId: string
    departmentId: string
    feeStatus: FeePaymentStatus | ''
    search: string
}

export interface FetchFeeSummaryParams {
    schoolClassId?: number | null
    sectionId?: number | null
    classDepartmentId?: number | null
    search?: string | null
    feePaymentStatus?: FeePaymentStatus | null
}
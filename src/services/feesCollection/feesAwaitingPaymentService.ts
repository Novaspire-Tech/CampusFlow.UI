import AxiosFunc from '../../utils/axios'
import type {
    StudentFeeSummaryResponseDTO,
    FetchFeeSummaryParams,
} from '../../types/feesCollection/feesAwaitingPayments'

const ENDPOINTS = {
    FEES_SUMMARY: '/school-group/{schoolGroupCode}/school/{schoolCode}/student/fees/summary',
}

const transformFeeSummaryResponse = (raw: any): StudentFeeSummaryResponseDTO => ({
    studentSessionId: raw.studentSessionId,
    studentName: raw.studentName ?? '',
    className: raw.className ?? '',
    sectionName: raw.sectionName ?? '',
    admissionNumber: raw.admissionNumber ?? '',
    fatherName: raw.fatherName ?? '',
    phone: raw.phone ?? '',
    rte: raw.rte ?? false,
    feeSummaryByType: raw.feeSummaryByType ?? {},
})

export const feesAwaitingPaymentService = {
    fetchSummary: async (
        params: FetchFeeSummaryParams,
    ): Promise<StudentFeeSummaryResponseDTO[]> => {
        const body: Record<string, any> = {}

        if (params.schoolClassId != null) body.schoolClassId = params.schoolClassId
        if (params.sectionId != null) body.sectionId = params.sectionId
        if (params.classDepartmentId != null) body.classDepartmentId = params.classDepartmentId
        if (params.search?.trim()) body.search = params.search.trim()
        if (params.feePaymentStatus) body.feePaymentStatus = params.feePaymentStatus

        const response = await AxiosFunc.Post(ENDPOINTS.FEES_SUMMARY, body)

        if (response.data?.status === 200) {
            const raw: any[] = Array.isArray(response.data?.data) ? response.data.data : []
            return raw.map(transformFeeSummaryResponse)
        }
        if (response.data?.status === 404) {
            return []
        }

        throw new Error(response.data?.message ?? 'Failed to fetch fee summary')
    },
}
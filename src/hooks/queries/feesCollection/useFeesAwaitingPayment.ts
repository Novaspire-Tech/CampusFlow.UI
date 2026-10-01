import { useState, useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import { feesAwaitingPaymentService } from '../../../services/feesCollection/feesAwaitingPaymentService'
import type {
    StudentFeeSummaryResponseDTO,
    FlatFeeSummaryRow,
    FetchFeeSummaryParams,
} from '../../../types/feesCollection/feesAwaitingPayments'

export const feesAwaitingPaymentKeys = {
    all: ['feesAwaitingPayment'] as const,
    summary: (params: FetchFeeSummaryParams) =>
        ['feesAwaitingPayment', 'summary', params] as const,
}

function flattenSummary(records: StudentFeeSummaryResponseDTO[]): FlatFeeSummaryRow[] {
    const rows: FlatFeeSummaryRow[] = []

    for (const record of records) {
        const feeEntries = Object.entries(record.feeSummaryByType)
        const feeCount = feeEntries.length

        if (feeCount === 0) {
            rows.push({
                id: `${record.studentSessionId}-empty`,
                studentSessionId: record.studentSessionId,
                studentName: record.studentName,
                className: record.className,
                sectionName: record.sectionName,
                admissionNumber: record.admissionNumber,
                fatherName: record.fatherName ?? '',
                phone: record.phone ?? '',
                rte: record.rte ?? false,
                feeName: '—',
                totalFee: 0,
                paid: 0,
                pending: 0,
                isFirstRow: true,
                feeCount: 1,
            })
            continue
        }

        feeEntries.forEach(([feeName, summary], idx) => {
            rows.push({
                id: `${record.studentSessionId}-${idx}`,
                studentSessionId: record.studentSessionId,
                studentName: record.studentName,
                className: record.className,
                sectionName: record.sectionName,
                admissionNumber: record.admissionNumber,
                fatherName: idx === 0 ? (record.fatherName ?? '') : '',
                phone: idx === 0 ? (record.phone ?? '') : '',
                rte: idx === 0 ? (record.rte ?? false) : undefined,
                feeName,
                totalFee: summary.totalFees ?? 0,
                paid: summary.paid ?? 0,
                pending: summary.pending ?? 0,
                isFirstRow: idx === 0,
                feeCount,
            })
        })
    }

    return rows
}

export interface UseFeesAwaitingPaymentReturn {
    summaryRecords: StudentFeeSummaryResponseDTO[]
    flatRows: FlatFeeSummaryRow[]
    isLoading: boolean
    hasSearched: boolean
    fetchSummary: (params: FetchFeeSummaryParams) => Promise<void>
    clearResults: () => void
    totals: {
        totalFees: number
        totalPaid: number
        totalPending: number
    }
}

export const useFeesAwaitingPayment = (): UseFeesAwaitingPaymentReturn => {
    const [summaryRecords, setSummaryRecords] = useState<StudentFeeSummaryResponseDTO[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const fetchSummary = useCallback(async (params: FetchFeeSummaryParams) => {
        setIsLoading(true)
        setHasSearched(true)
        try {
            const result = await feesAwaitingPaymentService.fetchSummary(params)
            if (result.length === 0) {
                toast.info('No students found for the selected criteria.')
            }
            setSummaryRecords(result)
        } catch (error: any) {
            console.error('Fee summary fetch error:', error)
            toast.error(error?.message ?? 'Failed to fetch fee summary')
            setSummaryRecords([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clearResults = useCallback(() => {
        setSummaryRecords([])
        setHasSearched(false)
    }, [])

    const flatRows = useMemo(() => flattenSummary(summaryRecords), [summaryRecords])

    const totals = useMemo(() => {
        return flatRows.reduce(
            (acc, row) => ({
                totalFees: acc.totalFees + row.totalFee,
                totalPaid: acc.totalPaid + row.paid,
                totalPending: acc.totalPending + row.pending,
            }),
            { totalFees: 0, totalPaid: 0, totalPending: 0 },
        )
    }, [flatRows])

    return {
        summaryRecords,
        flatRows,
        isLoading,
        hasSearched,
        fetchSummary,
        clearResults,
        totals,
    }
}
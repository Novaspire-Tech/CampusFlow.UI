import { useState, useEffect, useMemo, useCallback } from 'react'
import { useFeeTypes } from '../../../hooks/queries/feesCollection/useFeeTypes'
import { feeTransactionService } from '../../../services/feesCollection/feeTransactionService'
import type { MultiPaymentRequest } from '../../../services/feesCollection/feeTransactionService'
import { fineTransactionService } from '../../../services/feesCollection/fineTransactionService'
import { studentFilterService } from '../../../services/feesCollection/fineTransactionService'
import type {
  StudentFeesData,
  SearchFormData,
  PaymentFormData,
  FeeTransactionCreateRequest,
  FeeTransactionUpdateRequest,
  TransactionDisplayData,
  MessageState,
  ModalState,
  FeeDetail,
  AddTransaction,
} from '../../../types/feesCollection/searchDueFeesType'
import type { FilterStudentDto } from '../../../types/feesCollection/addFineType'

interface UseSearchDueFeesOptions {
  page?: number
  size?: number
  autoLoadStudents?: boolean
}

const formatDateForBackend = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

function transformRawStudent(
  student: any,
  feeTypes: any[],
  getNetFine: (studentId: number, feeTypeId: number) => number,
): StudentFeesData {
  const feesList: FeeDetail[] = (student.feesList || []).map((fee: any) => {
    const feeType = (feeTypes || []).find(
      (ft: any) => Number(ft.id || ft.feeTypeId) === Number(fee.feeTypeId),
    )
    const feeTypeName =
      (feeType as any)?.name || (feeType as any)?.feeTypeName || fee.feeTypeName || 'Unknown'
    return {
      feesId: fee.feesId || 0,
      feeTypeId: fee.feeTypeId || 0,
      feeTypeName,
      totalFees: Number(fee.totalFees || 0),
      paid: Number(fee.paid || 0),
      pending: Number(fee.pending || 0),
      fine: getNetFine(student.studentId, fee.feeTypeId),
      discount: Number(fee.discount || 0),
    }
  })
  return {
    id: student.studentId,
    studentId: student.studentId,
    class: student.className || '',
    classId: student.classId || 0,
    section: student.sectionName || '',
    sectionId: student.sectionId || 0,
    admissionNo: student.admissionNo || '',
    studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
    rollNo: student.rollNo || '',
    email: student.email,
    phoneNumber: student.phoneNumber,
    parent: student.parent || null,
    feesList,
    totalFees: feesList.reduce((s, f) => s + f.totalFees, 0),
    totalPaid: feesList.reduce((s, f) => s + f.paid, 0),
    totalPending: feesList.reduce((s, f) => s + f.pending, 0),
    totalFine: feesList.reduce((s, f) => s + f.fine, 0),
    totalDiscount: feesList.reduce((s, f) => s + f.discount, 0),
    transport: student.transport,
    hostel: student.hostel,
  }
}

function applyLocalFilters(list: StudentFeesData[], f: SearchFormData): StudentFeesData[] {
  return list.filter((s) => {
    if (f.class && String(s.classId) !== String(f.class)) return false
    if (f.section && String(s.sectionId) !== String(f.section)) return false
    if (f.rollNo?.trim()) {
      if (!s.rollNo.toLowerCase().includes(f.rollNo.trim().toLowerCase())) return false
      console.log(s.rollNo, f.rollNo)
    }
    if (f.search) {
      const q = f.search.toLowerCase()
      const matches =
        s.studentName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q)
      if (!matches) return false
    }
    if (
      f.minPending !== undefined &&
      f.minPending !== null &&
      (f.minPending as any) !== '' &&
      s.totalPending < Number(f.minPending)
    )
      return false
    if (
      f.maxPending !== undefined &&
      f.maxPending !== null &&
      (f.maxPending as any) !== '' &&
      s.totalPending > Number(f.maxPending)
    )
      return false
    return true
  })
}

export const useSearchDueFees = (options: UseSearchDueFeesOptions = {}) => {
  const { page: initialPage = 0, size: initialSize = 10, autoLoadStudents = true } = options

  const { data: feeTypes, isLoading: isLoadingFeeTypes } = useFeeTypes()

  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialSize)
  const [activeFilters, setActiveFilters] = useState<SearchFormData>({})
  const [isFilterActive, setIsFilterActive] = useState(false)
  const [isBackendFiltering, setIsBackendFiltering] = useState(false)
  const [allStudents, setAllStudents] = useState<StudentFeesData[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentFeesData[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [allFines, setAllFines] = useState<any[]>([])
  const [allFeeTransactions, setAllFeeTransactions] = useState<any[]>([])
  const [finesLoaded, setFinesLoaded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentFeesData | null>(null)
  const [transactions, setTransactions] = useState<TransactionDisplayData[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [modal, setModal] = useState<ModalState>({ isOpen: false, selectedStudent: null })
  const [messages, setMessages] = useState<MessageState>({ success: '', error: '' })
  const [, setLastPaymentTransactionIds] = useState<number[]>([])

  const getNetFine = useCallback(
    (studentId: number, feeTypeId: number): number => {
      const added = allFines
        .filter(
          (f) =>
            Number(f.studentId) === Number(studentId) && Number(f.feeTypeId) === Number(feeTypeId),
        )
        .reduce((s, f) => s + Number(f.amount || 0), 0)
      const paid = allFeeTransactions
        .filter(
          (tx) =>
            Number(tx.studentId) === Number(studentId) &&
            Number(tx.feeTypeId) === Number(feeTypeId),
        )
        .reduce((s, tx) => s + Number(tx.fine || 0), 0)
      return Math.max(0, added - paid)
    },
    [allFines, allFeeTransactions],
  )

  const transformStudents = useCallback(
    (raw: any[]): StudentFeesData[] =>
      raw.map((student) => transformRawStudent(student, feeTypes || [], getNetFine)),
    [feeTypes, getNetFine],
  )

  useEffect(() => {
    if (finesLoaded) return
    ;(async () => {
      const [finesRes, txnsRes] = await Promise.all([
        fineTransactionService.getAll(0, 100, 'asc'),
        feeTransactionService.getAll(0, 100, 'asc'),
      ])
      setAllFines(finesRes.fineTransactions || [])
      setAllFeeTransactions(txnsRes.feeTransactions || [])
      setFinesLoaded(true)
    })()
  }, [finesLoaded])

  const loadAllStudents = useCallback(async () => {
    if (!autoLoadStudents || !feeTypes) return
    setIsLoadingStudents(true)
    try {
      const res = await studentFilterService.filter({
        dto: { sessionStatus: 'ACTIVE' },
        page: 0,
        size: 1000,
        sortBy: 'admissionNo',
        sortDirection: 'asc',
      })
      const transformed = transformStudents(res.students)
      setAllStudents(transformed)
      setFilteredStudents(transformed)
    } catch (err) {
      console.error('Failed to load students:', err)
    } finally {
      setIsLoadingStudents(false)
    }
  }, [autoLoadStudents, feeTypes, transformStudents])

  useEffect(() => {
    if (!isFilterActive) loadAllStudents()
  }, [loadAllStudents, isFilterActive])

  useEffect(() => {
    if (!finesLoaded || allStudents.length === 0) return
    const retransformed = transformStudents(
      allStudents.map((s) => ({
        studentId: s.studentId,
        className: s.class,
        classId: s.classId,
        sectionName: s.section,
        sectionId: s.sectionId,
        admissionNo: s.admissionNo,
        firstName: s.studentName.split(' ')[0] || '',
        lastName: s.studentName.split(' ').slice(1).join(' ') || '',
        rollNo: s.rollNo,
        email: s.email,
        phoneNumber: s.phoneNumber,

        parent: (s as any).parent,
        feesList: s.feesList,
        transport: s.transport,
        hostel: s.hostel,
      })),
    )
    setAllStudents(retransformed)
    if (!isFilterActive) setFilteredStudents(retransformed)
  }, [finesLoaded, allFines, allFeeTransactions])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(allStudents)
      return
    }
    const q = searchTerm.toLowerCase()
    setFilteredStudents(
      allStudents.filter((s) => Object.values(s).some((v) => String(v).toLowerCase().includes(q))),
    )
  }, [searchTerm, allStudents])

  const totalItems = filteredStudents.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const handlePageChange = useCallback((newPage: number) => setPage(newPage), [])
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }, [])

  const searchStudents = useCallback(
    async (filters: SearchFormData) => {
      const hasAny = Object.values(filters).some((v) => v !== undefined && v !== null && v !== '')
      if (!hasAny) {
        setActiveFilters({})
        setIsFilterActive(false)
        setPage(0)
        setFilteredStudents(allStudents)
        return
      }

      setActiveFilters(filters)
      setIsFilterActive(true)
      setIsBackendFiltering(true)
      setPage(0)

      try {
        const filterDto: FilterStudentDto = { sessionStatus: filters.session || 'ACTIVE' }
        if (filters.search?.trim()) filterDto.search = filters.search.trim()
        if (filters.class) filterDto.schoolClassId = Number(filters.class)
        if (filters.section) filterDto.sectionId = Number(filters.section)
        if (filters.rollNo?.trim()) filterDto.rollNo = filters.rollNo.trim()

        const shouldCallBackend =
          !!filterDto.search ||
          !!filterDto.schoolClassId ||
          !!filterDto.sectionId ||
          !!filterDto.rollNo

        let baseStudents: StudentFeesData[]

        if (shouldCallBackend) {
          const res = await studentFilterService.filter({
            dto: filterDto,
            page: 0,
            size: 1000,
            sortBy: 'admissionNo',
            sortDirection: 'asc',
          })
          baseStudents = transformStudents(res.students)

          if (baseStudents.length === 0 && filterDto.search)
            baseStudents = applyLocalFilters(allStudents, { search: filters.search })
          if (baseStudents.length === 0 && filterDto.rollNo)
            baseStudents = applyLocalFilters(allStudents, { rollNo: filters.rollNo })
        } else {
          baseStudents = allStudents
        }

        const finalList = applyLocalFilters(baseStudents, {
          rollNo: filters.rollNo,
          minPending: filters.minPending,
          maxPending: filters.maxPending,
        })
        setFilteredStudents(finalList)
      } catch (err) {
        console.warn('Backend filter failed, falling back to local:', err)
        setFilteredStudents(applyLocalFilters(allStudents, filters))
      } finally {
        setIsBackendFiltering(false)
      }
    },
    [allStudents, transformStudents],
  )

  const resetSearch = useCallback(() => {
    setActiveFilters({})
    setIsFilterActive(false)
    setIsBackendFiltering(false)
    setFilteredStudents(allStudents)
    setSearchTerm('')
    setPage(0)
  }, [allStudents])

  const refreshTransactions = useCallback(async (studentId: number) => {
    setIsLoadingTransactions(true)
    try {
      const txns = await feeTransactionService.getByStudentId(String(studentId))
      setTransactions(
        txns.map((tx) => ({
          feeTransactionId: tx.feeTransactionId || 0,
          date: tx.date,
          feeTypeName: tx.feeTypeName || '',
          feeTypeId: tx.feeTypeId,
          feesId: tx.feesId,
          studentId: tx.studentId,
          mode: tx.mode,
          amount: tx.amount,
          discountAmount: tx.discountAmount,
          fine: tx.fine || 0,
          receiptNo: tx.receiptNo,
          note: tx.note,
        })),
      )
    } catch {
      setTransactions([])
    } finally {
      setIsLoadingTransactions(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedStudent) {
      setTransactions([])
      setIsLoadingTransactions(false)
      return
    }
    refreshTransactions(selectedStudent.studentId)
  }, [selectedStudent, refreshTransactions])

  useEffect(() => {
    if (!messages.success) return
    const t = setTimeout(() => setMessages((p) => ({ ...p, success: '' })), 5000)
    return () => clearTimeout(t)
  }, [messages.success])

  useEffect(() => {
    if (!messages.error) return
    const t = setTimeout(() => setMessages((p) => ({ ...p, error: '' })), 8000)
    return () => clearTimeout(t)
  }, [messages.error])

  const openModal = useCallback((student: StudentFeesData) => {
    setSelectedStudent(student)
    setModal({ isOpen: true, selectedStudent: student })
    setMessages({ success: '', error: '' })
  }, [])

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, selectedStudent: null })
    setSelectedStudent(null)
    setMessages((p) => ({ ...p, error: '' }))
  }, [])

  const refreshCaches = useCallback(async () => {
    const [finesRes, txnsRes] = await Promise.all([
      fineTransactionService.getAll(0, 100, 'asc'),
      feeTransactionService.getAll(0, 100, 'asc'),
    ])
    setAllFines(finesRes.fineTransactions || [])
    setAllFeeTransactions(txnsRes.feeTransactions || [])
  }, [])

  const refreshStudentData = useCallback(
    async (studentId: number) => {
      try {
        const res = await studentFilterService.filter({
          dto: { sessionStatus: 'ACTIVE' },
          page: 0,
          size: 1000,
          sortBy: 'admissionNo',
          sortDirection: 'asc',
        })
        if (res.students && feeTypes) {
          const updated = transformStudents(res.students)
          const found = updated.find((s) => s.studentId === studentId)
          if (found) {
            setAllStudents(updated)
            setFilteredStudents(
              isFilterActive ? applyLocalFilters(updated, activeFilters) : updated,
            )
            setSelectedStudent(found)
            setModal((p) => ({ ...p, selectedStudent: found }))
            return found
          }
        }
        return null
      } catch {
        return null
      }
    },
    [feeTypes, transformStudents, isFilterActive, activeFilters],
  )

  const addMultiPayment = useCallback(
    async (request: MultiPaymentRequest): Promise<number[] | false> => {
      if (!selectedStudent) {
        setMessages((p) => ({ ...p, error: 'No student selected' }))
        return false
      }

      if (!request.transactions || request.transactions.length === 0) {
        setMessages((p) => ({ ...p, error: 'No fee types selected.' }))
        return false
      }

      for (const tx of request.transactions) {
        const totalAmt = tx.subs.reduce((s, sub) => s + Number(sub.amount || 0), 0)
        if (totalAmt <= 0) {
          setMessages((p) => ({
            ...p,
            error: `Please enter a valid amount for all selected fee types.`,
          }))
          return false
        }

        const feeDetail = selectedStudent.feesList.find(
          (f) => Number(f.feeTypeId) === Number(tx.feeTypeId),
        )
        if (!feeDetail) {
          setMessages((p) => ({
            ...p,
            error: `Fee type ID ${tx.feeTypeId} not found for this student.`,
          }))
          return false
        }
        if (totalAmt > feeDetail.pending) {
          setMessages((p) => ({
            ...p,
            error: `Payment amount (₹${totalAmt}) exceeds pending balance (₹${feeDetail.pending}) for ${feeDetail.feeTypeName}.`,
          }))
          return false
        }
      }

      try {
        setMessages({ success: '', error: '' })
        setIsSubmitting(true)

        const newIds = await feeTransactionService.createMulti(request)

        await refreshCaches()
        await refreshTransactions(selectedStudent.studentId)
        await refreshStudentData(selectedStudent.studentId)
        setLastPaymentTransactionIds(newIds)

        const feeTypeNames = request.transactions
          .map((tx) => {
            const fd = selectedStudent.feesList.find(
              (f) => Number(f.feeTypeId) === Number(tx.feeTypeId),
            )
            return fd?.feeTypeName || `FeeType#${tx.feeTypeId}`
          })
          .join(', ')

        const grandTotal = request.transactions.reduce(
          (s, tx) => s + tx.subs.reduce((ss, sub) => ss + Number(sub.amount || 0), 0),
          0,
        )

        setMessages({
          success: `Payment of ₹${grandTotal} added for ${selectedStudent.studentName} (${feeTypeNames})`,
          error: '',
        })

        return newIds
      } catch (error: any) {
        setMessages({
          success: '',
          error: error.message || 'Failed to add payment. Please try again.',
        })
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedStudent, refreshCaches, refreshTransactions, refreshStudentData],
  )

  const addTransaction = useCallback(
    async (paymentData: PaymentFormData): Promise<boolean> => {
      if (!selectedStudent) {
        setMessages((p) => ({ ...p, error: 'No student selected' }))
        return false
      }
      try {
        setMessages({ success: '', error: '' })
        setIsSubmitting(true)

        const feeDetail = selectedStudent.feesList.find(
          (fee) => Number(fee.feeTypeId) === Number(paymentData.feeTypeId),
        )
        if (!feeDetail) {
          setMessages((p) => ({ ...p, error: 'Fee type not found for this student' }))
          setIsSubmitting(false)
          return false
        }

        const paymentModes = paymentData.paymentModes || []
        const totalAmount = paymentModes.reduce((sum, pm) => sum + Number(pm.amount || 0), 0)

        if (totalAmount <= 0) {
          setMessages((p) => ({ ...p, error: 'Please enter a valid payment amount.' }))
          setIsSubmitting(false)
          return false
        }
        if (totalAmount > feeDetail.pending) {
          setMessages((p) => ({
            ...p,
            error: `Payment amount (₹${totalAmount}) exceeds pending amount (₹${feeDetail.pending})`,
          }))
          setIsSubmitting(false)
          return false
        }

        const request: AddTransaction = {
          discountAmount: String(paymentData.discountAmount || 0),
          date: paymentData.date || formatDateForBackend(),
          fine: String(paymentData.fine || 0),
          note: paymentData.note || undefined,
          feesId: feeDetail.feesId,
          studentId: selectedStudent.studentId,
          feeTypeId: paymentData.feeTypeId,
          mode: paymentData.mode,
          amount: totalAmount,
          receiptNo: Number(paymentData.receiptNo || 0),
        }

        await feeTransactionService.Add_transaction(request)

        await refreshCaches()
        await refreshTransactions(selectedStudent.studentId)
        await refreshStudentData(selectedStudent.studentId)

        const modesSummary = paymentModes.map((pm) => `${pm.mode} ₹${pm.amount}`).join(', ')
        setMessages({
          success: `Payment of ₹${totalAmount}${
            paymentData.fine ? ` with fine ₹${paymentData.fine}` : ''
          } added for ${selectedStudent.studentName} (${modesSummary})`,
          error: '',
        })
        return true
      } catch (error: any) {
        setMessages({ success: '', error: error.message || 'Failed to add payment.' })
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedStudent, refreshCaches, refreshStudentData, refreshTransactions],
  )

  const addPayment = useCallback(
    async (paymentData: PaymentFormData): Promise<boolean> => {
      if (!selectedStudent) {
        setMessages((p) => ({ ...p, error: 'No student selected' }))
        return false
      }
      try {
        setMessages({ success: '', error: '' })
        setIsSubmitting(true)

        const feeDetail = selectedStudent.feesList.find(
          (fee) => Number(fee.feeTypeId) === Number(paymentData.feeTypeId),
        )
        if (!feeDetail) {
          setMessages((p) => ({ ...p, error: 'Fee type not found for this student' }))
          setIsSubmitting(false)
          return false
        }

        const paymentModes = paymentData.paymentModes || []
        const totalAmount = paymentModes.reduce((sum, pm) => sum + Number(pm.amount || 0), 0)

        if (totalAmount <= 0) {
          setMessages((p) => ({ ...p, error: 'Please enter a valid payment amount.' }))
          setIsSubmitting(false)
          return false
        }
        if (totalAmount > feeDetail.pending) {
          setMessages((p) => ({
            ...p,
            error: `Payment amount (₹${totalAmount}) exceeds pending amount (₹${feeDetail.pending})`,
          }))
          setIsSubmitting(false)
          return false
        }

        const request: FeeTransactionCreateRequest = {
          discountAmount: Number(paymentData.discountAmount || 0),
          date: formatDateForBackend(),
          fine: Number(paymentData.fine || 0),
          note: paymentData.note || undefined,
          feesId: feeDetail.feesId,
          studentId: selectedStudent.studentId,
          feeTypeId: Number(paymentData.feeTypeId),
          paymentModes: paymentModes.map((pm) => ({
            mode: pm.mode,
            amount: Number(pm.amount),
            receiptNo: pm.receiptNo || undefined,
          })),
        }

        await feeTransactionService.create(request)

        await refreshCaches()
        await refreshTransactions(selectedStudent.studentId)
        await refreshStudentData(selectedStudent.studentId)

        const modesSummary = paymentModes.map((pm) => `${pm.mode} ₹${pm.amount}`).join(', ')
        setMessages({
          success: `Payment of ₹${totalAmount}${
            paymentData.fine ? ` with fine ₹${paymentData.fine}` : ''
          } added for ${selectedStudent.studentName} (${modesSummary})`,
          error: '',
        })
        return true
      } catch (error: any) {
        setMessages({ success: '', error: error.message || 'Failed to add payment.' })
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedStudent, refreshCaches, refreshStudentData, refreshTransactions],
  )

  const editPayment = useCallback(
    async (
      feeTransactionId: number,
      paymentData: PaymentFormData & {
        feesId: number
        studentId: number
        mode: string
        receiptNo?: string
      },
    ): Promise<boolean> => {
      if (!selectedStudent) {
        setMessages((p) => ({ ...p, error: 'No student selected' }))
        return false
      }
      try {
        setMessages({ success: '', error: '' })
        setIsSubmitting(true)

        const feeDetail = selectedStudent.feesList.find(
          (fee) => Number(fee.feeTypeId) === Number(paymentData.feeTypeId),
        )
        if (!feeDetail) {
          setMessages((p) => ({ ...p, error: 'Fee type not found for this student' }))
          setIsSubmitting(false)
          return false
        }

        const amount = Number(paymentData.amount || 0)
        // if (amount <= 0) {
        //   setMessages((p) => ({ ...p, error: 'Please enter a valid payment amount.' }))
        //   setIsSubmitting(false)
        //   return false
        // }

        const updateRequest: FeeTransactionUpdateRequest = {
          feesId: paymentData.feesId || feeDetail.feesId,
          studentId: paymentData.studentId || selectedStudent.studentId,
          feeTypeId: Number(paymentData.feeTypeId),
          amount,
          discountAmount: Number(paymentData.discountAmount || 0),
          fine: Number(paymentData.fine || 0),
          date: paymentData.date ? paymentData.date : formatDateForBackend(),
          mode: paymentData.mode || paymentData.paymentMode || 'CASH',
          receiptNo: paymentData.receiptNo || null,
          note: paymentData.note || null,
        }

        await feeTransactionService.update(feeTransactionId, updateRequest)

        await refreshCaches()
        await refreshTransactions(selectedStudent.studentId)
        await refreshStudentData(selectedStudent.studentId)

        setMessages({
          success: `Transaction #${feeTransactionId} updated successfully for ${selectedStudent.studentName}`,
          error: '',
        })
        return true
      } catch (error: any) {
        setMessages({ success: '', error: error.message || 'Failed to update payment.' })
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedStudent, refreshStudentData, refreshCaches, refreshTransactions],
  )

  const clearSuccessMessage = useCallback(() => setMessages((p) => ({ ...p, success: '' })), [])
  const clearErrorMessage = useCallback(() => setMessages((p) => ({ ...p, error: '' })), [])

  const pagedFilteredStudents = useMemo(() => {
    const start = page * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page, pageSize])

  const updateSearchTerm = useCallback((term: string) => setSearchTerm(term), [])

  return {
    filteredStudents: pagedFilteredStudents,
    allStudents,
    feeTypes: feeTypes || [],
    selectedStudent,
    transactions,
    page,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    isFilterActive,
    isBackendFiltering,
    isLoading: isLoadingStudents || isLoadingFeeTypes || isBackendFiltering,
    isLoadingStudents,
    isLoadingFeeTypes,
    isLoadingTransactions,
    isSubmitting,
    modal,
    messages,
    searchTerm,
    updateSearchTerm,
    searchStudents,
    resetSearch,
    openModal,
    closeModal,
    addPayment,
    addMultiPayment,
    addTransaction,
    editPayment,
    refreshTransactions,
    clearSuccessMessage,
    clearErrorMessage,
    refreshStudentData,
    setModal,
    setFilteredStudents,
  }
}

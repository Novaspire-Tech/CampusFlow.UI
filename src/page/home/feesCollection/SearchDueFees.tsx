import React, { useMemo, useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form'
import { Dropdown, TextField } from '../../../components/controlled'
import AmountField from '../../../components/controlled/AmountField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { useSearchDueFees } from '../../../hooks/queries/feesCollection/useSearchDueFees'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useSchool } from '../../../hooks/queries/superAdmin/useSchool'
import { useStaffPhoto } from '../../../hooks/queries/humanResource/useStaffPhoto'
import type {
  SearchFormData,
  StudentFeesData,
} from '../../../types/feesCollection/searchDueFeesType'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import PastDateField from '../../../components/controlled/PastDateField'

const SCHOOL_CODE = localStorage.getItem('schoolCode') || sessionStorage.getItem('schoolCode') || ''
const SCHOOL_GROUP_CODE =
  localStorage.getItem('schoolGroupCode') || sessionStorage.getItem('schoolGroupCode') || ''

const PAYMENT_MODE_OPTIONS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Debit Card', value: 'DEBIT_CARD' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Other', value: 'OTHER' },
]
const SESSION_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pass', value: 'PASS' },
  { label: 'Fail', value: 'FAIL' },
]

interface FeeDetail {
  feesId?: number
  feeTypeId: number
  feeTypeName: string
  totalFees: number
  paid: number
  pending: number
  fine?: number
}

interface EditingTransaction {
  feeTransactionId: number
  feeTypeId?: number
  feesId?: number
  studentId?: number
  feeTypeName?: string
  mode: string
  amount: number
  discountAmount: number
  fine: number
  receiptNo?: string
  note?: string
  date?: string
}

interface ModeEntry {
  amount: string
  receiptNo: string
}

interface FeeTypeEntry {
  feeTypeId: number
  feeTypeName: string
  feesId?: number
  pending: number
  fine: number
  selectedModes: string[]
  modeEntries: Record<string, ModeEntry>
  discount: string
  fineOverride: string
  note: string
}

interface EditFormValues {
  editAmount: string
  editReceiptNo: string
  editDiscountAmount: string
  editFine: string
  editDate: string
}

const getPaymentStatus = (totalFees: number, paid: number): 'Partial' | 'Unpaid' | 'Paid' => {
  if (paid === 0) return 'Unpaid'
  if (paid >= totalFees) return 'Paid'
  return 'Partial'
}

const getStatusColor = (status: 'Partial' | 'Unpaid' | 'Paid') => {
  switch (status) {
    case 'Partial':
      return 'bg-orange-200 text-orange-800'
    case 'Unpaid':
      return 'bg-pink-200 text-pink-800'
    case 'Paid':
      return 'bg-green-200 text-green-800'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}

const todayString = (): string => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

const toISODate = (ddmmyyyy: string): string => {
  if (!ddmmyyyy) return ''
  const parts = ddmmyyyy.split('/')
  if (parts.length !== 3) return ''
  const [dd, mm, yyyy] = parts
  if (!yyyy || !mm || !dd) return ''
  return `${yyyy}-${mm}-${dd}`
}

const fromISODate = (yyyymmdd: string): string => {
  if (!yyyymmdd) return ''
  const parts = yyyymmdd.split('-')
  if (parts.length !== 3) return ''
  const [yyyy, mm, dd] = parts
  if (!yyyy || !mm || !dd) return ''
  return `${dd}/${mm}/${yyyy}`
}

const calculateFeeSummary = (feesList?: FeeDetail[]) => {
  if (!feesList?.length) return { total: 0, paid: 0, pending: 0, fine: 0 }
  return feesList.reduce(
    (acc, fee) => ({
      total: acc.total + (Number(fee.totalFees) || 0),
      paid: acc.paid + (Number(fee.paid) || 0),
      pending: acc.pending + (Number(fee.pending) || 0),
      fine: acc.fine + (Number(fee.fine) || 0),
    }),
    { total: 0, paid: 0, pending: 0, fine: 0 },
  )
}

const resolveStudentFields = (student: StudentFeesData) => {
  const s = student as any
  const fatherName = s.parent?.fatherName || s.fatherName || s.parent?.name || '—'
  const mobileNo =
    s.parent?.phoneNumber ||
    s.parent?.alternatePhoneNumber ||
    s.parentPhone ||
    s.phoneNumber ||
    s.mobileNumber ||
    s.parentMobile ||
    s.fatherMobile ||
    s.motherMobile ||
    '—'
  const rollNo = s.rollNo || '—'
  return { fatherName, mobileNo, rollNo }
}

const SummaryCard = React.memo<{
  color: 'blue' | 'green' | 'red' | 'orange'
  label: string
  value: string
}>(({ color, label, value }) => {
  const s = {
    blue: { wrap: 'bg-blue-50 border-blue-200', text: 'text-blue-600', bold: 'text-blue-700' },
    green: { wrap: 'bg-green-50 border-green-200', text: 'text-green-600', bold: 'text-green-700' },
    red: { wrap: 'bg-red-50 border-red-200', text: 'text-red-600', bold: 'text-red-700' },
    orange: {
      wrap: 'bg-orange-50 border-orange-200',
      text: 'text-orange-600',
      bold: 'text-orange-700',
    },
  }[color]
  return (
    <div className={`${s.wrap} border rounded-lg p-4`}>
      <p className={`text-sm ${s.text} font-medium mb-1`}>{label}</p>
      <p className={`text-2xl font-bold ${s.bold}`}>{value}</p>
    </div>
  )
})

const CutLine = React.memo(() => (
  <>
    <div className="cut-line-screen my-6 select-none">
      <div className="flex items-center gap-0">
        <div className="flex-1 border-t-2 border-dashed border-gray-400" />
        <div className="flex items-center gap-2 px-4 py-1 bg-gray-100 border border-dashed border-gray-400 rounded-full text-xs font-semibold text-gray-500 tracking-widest">
          <span className="text-base leading-none">✂</span>
          <span>CUT HERE</span>
        </div>
        <div className="flex-1 border-t-2 border-dashed border-gray-400" />
      </div>
    </div>
    <div className="cut-line-print">
      <div style={{ height: '8mm' }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, borderTop: '1.5px dashed #9ca3af' }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '1px 10px',
            border: '1px dashed #9ca3af',
            borderRadius: '999px',
            fontSize: '9px',
            color: '#6b7280',
            fontWeight: 700,
            letterSpacing: '0.08em',
            background: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '12px', lineHeight: 1 }}>✂</span>
          <span>CUT HERE</span>
        </div>
        <div style={{ flex: 1, borderTop: '1.5px dashed #9ca3af' }} />
      </div>
      <div style={{ height: '8mm' }} />
    </div>
  </>
))

const SearchDueFees: React.FC = () => {
  const {
    control,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm,
    watch,
    setValue: setSearchValue,
  } = useForm<FieldValues>({
    defaultValues: { class: '', section: '', search: '', rollNo: '', session: '' },
  })

  const {
    control: editControl,
    setValue: setEditValue,
    watch: watchEdit,
    reset: resetEditForm,
  } = useForm<EditFormValues>({
    defaultValues: {
      editAmount: '',
      editReceiptNo: '',
      editDiscountAmount: '0',
      editFine: '0',
      editDate: '',
    },
  })

  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)

  const [logoReady, setLogoReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLogoReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const { data: schoolData, isLoading: isSchoolLoading } = useSchool(SCHOOL_GROUP_CODE, SCHOOL_CODE)

  const logoPath: string = (schoolData as any)?.logo ?? ''

  const {
    photoUrl: schoolLogoUrl,
    loading: logoLoading,
    error: logoError,
  } = useStaffPhoto(logoReady && logoPath ? logoPath : undefined)

  const [cachedSchool, setCachedSchool] = useState<{
    schoolName: string
    address: string
    phoneNumber: string
    email: string
    managedBy: string
    webSite: string
  } | null>(() => {
    try {
      const raw = localStorage.getItem('schoolDetails')
      if (!raw) return null
      const p = JSON.parse(raw)
      return {
        schoolName: p.schoolName || '',
        address: p.address || '',
        phoneNumber: p.phoneNumber || '',
        email: p.email || '',
        managedBy: p.managedBy || '',
        webSite: p.webSite || '',
      }
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!schoolData) return
    const next = {
      schoolName: schoolData.schoolName || '',
      address: schoolData.address || '',
      phoneNumber: schoolData.phoneNumber || '',
      email: schoolData.email || '',
      managedBy: (schoolData as any).managedBy || '',
      webSite: (schoolData as any).webSite || '',
    }
    setCachedSchool(next)
    localStorage.setItem('schoolDetails', JSON.stringify(schoolData))
  }, [schoolData])

  const schoolName = schoolData?.schoolName || cachedSchool?.schoolName || ''
  const schoolAddress = schoolData?.address || cachedSchool?.address || ''
  const schoolPhone = schoolData?.phoneNumber || cachedSchool?.phoneNumber || ''
  const schoolEmail = schoolData?.email || cachedSchool?.email || ''
  const schoolManagedBy = (schoolData as any)?.managedBy || cachedSchool?.managedBy || ''
  const schoolWebSite = (schoolData as any)?.webSite || cachedSchool?.webSite || ''

  const { data: classesData } = useSchoolClasses()
  const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0)
  const { data: sectionsData } = useSections(selectedClassForSections)

  const [isEditConfirm, setIsEditConfirm] = useState(false)

  const watchClass = watch('class')
  useEffect(() => {
    if (watchClass) {
      setSelectedClassForSections(Number(watchClass))
      setSearchValue('section', '')
    } else {
      setSelectedClassForSections(0)
      setSearchValue('section', '')
    }
  }, [watchClass, setSearchValue])

  const classOptions = useMemo(
    () =>
      classesData?.map((cls: any) => ({
        value: String(cls.id || cls.schoolClassId),
        label: cls.name || cls.className,
      })) || [],
    [classesData],
  )

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((sec: any) => ({
        value: String(sec.id || sec.sectionId),
        label: sec.name || sec.sectionName,
      })) || [],
    [sectionsData],
  )

  const [selectedView, setSelectedView] = useState<'list' | 'details'>('list')
  const [detailStudentId, setDetailStudentId] = useState<number | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<StudentFeesData | null>(
    null,
  )
  const [printMode, setPrintMode] = useState<'fee-only' | 'payment'>('fee-only')
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false)
  const [lastPaidStudent, setLastPaidStudent] = useState<StudentFeesData | null>(null)
  const [printTransactionIds, setPrintTransactionIds] = useState<number[]>([])
  const [editMode, setEditMode] = useState<string>('CASH')
  const [editNote, setEditNote] = useState<string>('')
  const [selectedFeeTypeIds, setSelectedFeeTypeIds] = useState<number[]>([])
  const [feeTypeEntries, setFeeTypeEntries] = useState<Record<number, FeeTypeEntry>>({})

  const [hasSearched, setHasSearched] = useState(false)

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [],
  )

  const {
    filteredStudents,
    allStudents,
    transactions,
    page,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    isBackendFiltering,
    isLoading,
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
    addMultiPayment,
    editPayment,
    clearSuccessMessage,
    clearErrorMessage,
  } = useSearchDueFees({ page: 0, size: 10, autoLoadStudents: false })

  const detailStudent = useMemo(
    () => allStudents.find((s) => s.studentId === detailStudentId) ?? null,
    [allStudents, detailStudentId],
  )

  const studentsWithTotalPending = useMemo(
    () =>
      filteredStudents.map((s) => {
        const raw = s as any
        const fatherName = raw.parent?.fatherName || raw.fatherName || raw.parent?.name || '—'
        const mobileNo =
          raw.parent?.phoneNumber ||
          raw.parent?.alternatePhoneNumber ||
          raw.parentPhone ||
          raw.phoneNumber ||
          raw.mobileNumber ||
          raw.parentMobile ||
          raw.fatherMobile ||
          raw.motherMobile ||
          '—'
        return { ...s, displayTotalPending: s.totalPending, fatherName, mobileNo }
      }),
    [filteredStudents],
  )

  const selectedStudent = detailStudent || modal.selectedStudent

  const feeSummary = useMemo(
    () => calculateFeeSummary(selectedStudent?.feesList as FeeDetail[]),
    [selectedStudent?.feesList],
  )

  const grandTotalPayment = useMemo(
    () =>
      Object.values(feeTypeEntries).reduce((s, e) => {
        const feeTotal = e.selectedModes.reduce(
          (sum, m) => sum + (parseFloat(e.modeEntries[m]?.amount || '0') || 0),
          0,
        )
        return s + feeTotal - (parseFloat(e.discount) || 0) + (parseFloat(e.fineOverride) || 0)
      }, 0),
    [feeTypeEntries],
  )

  const feeTotalAmount = useCallback(
    (entry: FeeTypeEntry) =>
      entry.selectedModes.reduce(
        (s, m) => s + (parseFloat(entry.modeEntries[m]?.amount || '0') || 0),
        0,
      ),
    [],
  )

  const toggleFeeType = useCallback((fee: FeeDetail) => {
    const id = fee.feeTypeId
    setSelectedFeeTypeIds((prev) => {
      if (prev.includes(id)) {
        setFeeTypeEntries((e) => {
          const n = { ...e }
          delete n[id]
          return n
        })
        return prev.filter((x) => x !== id)
      }
      setFeeTypeEntries((e) => ({
        ...e,
        [id]: {
          feeTypeId: id,
          feeTypeName: fee.feeTypeName,
          feesId: fee.feesId,
          pending: Number(fee.pending) || 0,
          fine: Number(fee.fine) || 0,
          selectedModes: [],
          modeEntries: {},
          discount: '0',
          fineOverride: String(Number(fee.fine) || 0),
          note: '',
        },
      }))
      return [...prev, id]
    })
  }, [])

  const toggleModeForFee = useCallback((feeTypeId: number, mode: string) => {
    setFeeTypeEntries((prev) => {
      const entry = prev[feeTypeId]
      if (!entry) return prev
      const hasMode = entry.selectedModes.includes(mode)
      const newModes = hasMode
        ? entry.selectedModes.filter((m) => m !== mode)
        : [...entry.selectedModes, mode]
      const newEntries = { ...entry.modeEntries }
      if (hasMode) delete newEntries[mode]
      else newEntries[mode] = { amount: '', receiptNo: '' }
      return {
        ...prev,
        [feeTypeId]: { ...entry, selectedModes: newModes, modeEntries: newEntries },
      }
    })
  }, [])

  const updateModeEntryForFee = useCallback(
    (feeTypeId: number, mode: string, field: keyof ModeEntry, value: string) => {
      setFeeTypeEntries((prev) => {
        const entry = prev[feeTypeId]
        if (!entry) return prev
        return {
          ...prev,
          [feeTypeId]: {
            ...entry,
            modeEntries: {
              ...entry.modeEntries,
              [mode]: { ...entry.modeEntries[mode], [field]: value },
            },
          },
        }
      })
    },
    [],
  )

  const updateFeeField = useCallback(
    (feeTypeId: number, field: 'discount' | 'fineOverride' | 'note', value: string) => {
      setFeeTypeEntries((prev) => {
        const entry = prev[feeTypeId]
        if (!entry) return prev
        return { ...prev, [feeTypeId]: { ...entry, [field]: value } }
      })
    },
    [],
  )

  const handleOpenPaymentModal = useCallback(() => {
    setIsPaymentModalOpen(true)
    setSelectedFeeTypeIds([])
    setFeeTypeEntries({})
    clearErrorMessage()
  }, [clearErrorMessage])

  const handleClosePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false)
    setSelectedFeeTypeIds([])
    setFeeTypeEntries({})
    clearErrorMessage()
  }, [clearErrorMessage])

  const isPaymentValid = useCallback(() => {
    if (selectedFeeTypeIds.length === 0) return false
    return Object.values(feeTypeEntries).every(
      (e) =>
        e.selectedModes.length > 0 &&
        e.selectedModes.reduce(
          (s, m) => s + (parseFloat(e.modeEntries[m]?.amount || '0') || 0),
          0,
        ) > 0,
    )
  }, [selectedFeeTypeIds, feeTypeEntries])

  const onPaymentSubmit = useCallback(async () => {
    if (!modal.selectedStudent) return
    setIsRefreshing(true)
    const transactions_payload = Object.values(feeTypeEntries).map((entry) => ({
      feesId: entry.feesId ?? 0,
      studentId: modal.selectedStudent!.studentId,
      feeTypeId: entry.feeTypeId,
      discountAmount: parseFloat(entry.discount) || 0,
      fine: parseFloat(entry.fineOverride) || 0,
      note: entry.note || undefined,
      date: todayString(),
      subs: entry.selectedModes.map((mode) => ({
        mode,
        amount: parseFloat(entry.modeEntries[mode]?.amount || '0') || 0,
        receiptNo: entry.modeEntries[mode]?.receiptNo || undefined,
      })),
    }))
    const result = await addMultiPayment({ transactions: transactions_payload })
    setIsRefreshing(false)
    if (result !== false && result.length > 0) {
      handleClosePaymentModal()
      setPrintTransactionIds(result)
      setLastPaidStudent(detailStudent || modal.selectedStudent)
      setIsPrintConfirmOpen(true)
      setIsEditConfirm(false)
    }
  }, [
    modal.selectedStudent,
    feeTypeEntries,
    addMultiPayment,
    handleClosePaymentModal,
    detailStudent,
  ])

  const handleEditTransaction = useCallback(
    (tx: any) => {
      if (!tx?.feeTransactionId) return
      const txTyped: EditingTransaction = {
        feeTransactionId: tx.feeTransactionId,
        feeTypeId: tx.feeTypeId,
        feesId: tx.feesId,
        studentId: tx.studentId,
        feeTypeName: tx.feeTypeName,
        mode: tx.mode || 'CASH',
        amount: Number(tx.amount) || 0,
        discountAmount: Number(tx.discountAmount) || 0,
        fine: Number(tx.fine) || 0,
        receiptNo: tx.receiptNo || '',
        note: tx.note || '',
        date: tx.date,
      }
      setEditingTransaction(txTyped)
      setEditMode(txTyped.mode)
      setEditNote(txTyped.note || '')
      setEditValue('editAmount', String(txTyped.amount))
      setEditValue('editReceiptNo', txTyped.receiptNo || '')
      setEditValue('editDiscountAmount', String(txTyped.discountAmount))
      setEditValue('editFine', String(txTyped.fine))
      setEditValue('editDate', toISODate(txTyped.date || ''))
      setIsEditModalOpen(true)
      clearErrorMessage()
    },
    [setEditValue, clearErrorMessage],
  )

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setEditingTransaction(null)
    setEditMode('CASH')
    setEditNote('')
    resetEditForm()
    clearErrorMessage()
  }, [resetEditForm, clearErrorMessage])

  const onEditSubmit = useCallback(async () => {
    if (!editingTransaction) return
    setIsRefreshing(true)
    const vals = watchEdit()
    const formattedDate = fromISODate(vals.editDate || '')
    const feeDetail = modal.selectedStudent?.feesList.find(
      (f) => Number(f.feeTypeId) === Number(editingTransaction.feeTypeId),
    )
    const resolvedFeesId = editingTransaction.feesId ?? feeDetail?.feesId ?? 0
    const resolvedStudentId = editingTransaction.studentId ?? modal.selectedStudent?.studentId ?? 0

    const success = await editPayment(editingTransaction.feeTransactionId, {
      feesId: resolvedFeesId,
      studentId: resolvedStudentId,
      feeTypeId: editingTransaction.feeTypeId ?? feeDetail?.feeTypeId ?? 0,
      amount: parseFloat(vals.editAmount) || 0,
      discountAmount: parseFloat(vals.editDiscountAmount) || 0,
      fine: parseFloat(vals.editFine) || 0,
      mode: editMode,
      receiptNo: vals.editReceiptNo || undefined,
      note: editNote || undefined,
      paymentMode: editMode,
      date: formattedDate || undefined,
    } as any)

    if (success) {
      handleCloseEditModal()
      setPrintTransactionIds([editingTransaction.feeTransactionId])
      setLastPaidStudent(detailStudent || modal.selectedStudent)
      setIsPrintConfirmOpen(true)
      setIsEditConfirm(true)
    }
    setIsRefreshing(false)
  }, [
    editingTransaction,
    watchEdit,
    modal.selectedStudent,
    editMode,
    editNote,
    editPayment,
    handleCloseEditModal,
    detailStudent,
  ])

  const handleRowClick = useCallback(
    (row: StudentFeesData) => {
      setDetailStudentId(row.studentId)
      setSelectedView('details')
      openModal(row)
    },
    [openModal],
  )

  const handleBackToList = useCallback(() => {
    setSelectedView('list')
    setDetailStudentId(null)
    closeModal()
  }, [closeModal])

  const onSearchSubmit: SubmitHandler<FieldValues> = useCallback(
    (data) => {
      const filters: SearchFormData = {}
      if (data.class) filters.class = String(data.class)
      if (data.section) filters.section = String(data.section)
      if (data.session) filters.session = String(data.session)
      if (data.search?.trim()) filters.search = data.search.trim()
      if (data.rollNo?.trim()) filters.rollNo = data.rollNo.trim()
      searchStudents(filters)
      setHasSearched(true)
    },
    [searchStudents],
  )

  const handleReset = useCallback(() => {
    resetSearchForm()
    setSelectedClassForSections(0)
    resetSearch()
    setHasSearched(false)
  }, [resetSearchForm, resetSearch])

  const listColumns = useMemo(
    () => [
      { label: Text.Admission_No || 'Admission No', key: 'admissionNo' },
      { label: Text.Class || 'Class', key: 'class' },
      { label: NameText.Section || 'Section', key: 'section' },
      { label: Text.Student_Name || 'Student Name', key: 'studentName' },
      { label: Text.Father_Name, key: 'fatherName' },
      { label: Text.Mobile_Number, key: 'mobileNo' },
      { label: Text.Roll_No, key: 'rollNo' },
      { label: Text.Total_Pending || 'Total Pending', key: 'displayTotalPending' },
    ],
    [Text, NameText],
  )

  const transactionColumns = useMemo(
    () => [
      { label: Text.Transaction_ID, key: 'feeTransactionId' },
      { label: Text.Receipt_No || 'Receipt No', key: 'receiptNo' },
      { label: Text.Date, key: 'date' },
      { label: Text.Fee_Type || 'Fee Type', key: 'feeTypeName' },
      { label: Text.Mode, key: 'mode' },
      { label: Text.Amount_Paid || 'Amount Paid', key: 'amount' },
      { label: Text.Discount, key: 'discountAmount' },
      { label: Text.Fine, key: 'fine' },
      {
        label: Text.Action,
        key: 'action',
        render: (_value: any, row: any) => (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!row?.feeTransactionId) return
              handleEditTransaction(row)
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={'Edit Transaction'}
          >
            <IconField name="FaEdit" size={16} />
          </button>
        ),
      },
    ],
    [handleEditTransaction],
  )

  const showSchoolLoader = (isSchoolLoading || logoLoading) && !cachedSchool

  const renderReceiptContent = useCallback(
    (copyLabel: string) => {
      if (!selectedStudentForPrint) return null
      const { fatherName, mobileNo, rollNo } = resolveStudentFields(selectedStudentForPrint)

      return (
        <div className="border-2 border-gray-800 rounded-lg print:rounded-none print:border-black relative">
          <div className="absolute top-2 right-3 text-xs font-bold text-gray-400 uppercase tracking-widest print:text-gray-500">
            {copyLabel}
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b-2 border-gray-800 print:border-black flex items-center gap-4">
            <div className="shrink-0 w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center overflow-hidden bg-gray-100">
              {logoLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              ) : schoolLogoUrl && !logoError ? (
                <img src={schoolLogoUrl} alt="School Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-500 text-center font-semibold leading-tight px-1">
                  LOGO
                </span>
              )}
            </div>
            <div className="flex-1 text-center">
              {showSchoolLoader ? (
                <div className="flex justify-center py-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : (
                <>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-800 print:text-xl leading-tight">
                    {schoolName || '—'}
                  </h1>
                  {schoolManagedBy && (
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mt-0.5 print:text-xs">
                      Managed by: {schoolManagedBy}
                    </p>
                  )}
                  {schoolAddress && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 print:text-xs">
                      {schoolAddress}
                    </p>
                  )}
                  {(schoolWebSite || schoolPhone || schoolEmail) && (
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-500">
                      {schoolWebSite && (
                        <span>
                          <span className="font-medium text-gray-600">Web:</span>{' '}
                          <span className="text-blue-600">{schoolWebSite}</span>
                        </span>
                      )}
                      {schoolPhone && (
                        <span>
                          <span className="font-medium text-gray-600">Ph:</span> {schoolPhone}
                        </span>
                      )}
                      {schoolEmail && (
                        <span>
                          <span className="font-medium text-gray-600">Email:</span> {schoolEmail}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2 border-b border-gray-300 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-[0.2em]">
              Fee Receipt
            </h2>
          </div>

          {/* Student info */}
          <div className="px-6 py-3 border-b-2 border-gray-800 print:border-black">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
              {[
                { label: 'Admission No', value: selectedStudentForPrint.admissionNo },
                { label: 'Student Name', value: selectedStudentForPrint.studentName },
                { label: "Father's Name", value: fatherName },
                { label: 'Mobile Number', value: mobileNo },
                { label: 'Roll No', value: rollNo },
                { label: 'Class', value: selectedStudentForPrint.class },
                { label: 'Section', value: selectedStudentForPrint.section },
                { label: 'Date', value: currentDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-1 min-w-0">
                  <span className="font-semibold text-gray-700 whitespace-nowrap shrink-0">
                    {label}:
                  </span>
                  <span className="text-gray-800 truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fee-only table */}
          {printMode === 'fee-only' && (
            <div className="px-6 py-3 border-b-2 border-gray-800 print:border-black">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      {[
                        { h: 'Fee Type', a: 'text-left' },
                        { h: 'Status', a: 'text-center' },
                        { h: 'Total (₹)', a: 'text-right' },
                        { h: 'Paid (₹)', a: 'text-right' },
                        { h: 'Pending (₹)', a: 'text-right' },
                      ].map(({ h, a }) => (
                        <th
                          key={h}
                          className={`border border-gray-300 px-3 py-2 font-semibold text-gray-700 ${a}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedStudentForPrint.feesList as FeeDetail[]).map((fee, i) => {
                      const feeAmount = Number(fee.totalFees) || 0
                      const feePaid = Number(fee.paid) || 0
                      const feePending = Number(fee.pending) || 0
                      const status = getPaymentStatus(feeAmount, feePaid)
                      return (
                        <tr key={fee.feeTypeId ?? i} className="even:bg-gray-50/50">
                          <td className="border border-gray-300 px-3 py-2 text-gray-800 whitespace-nowrap">
                            {fee.feeTypeName}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span
                              className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(status)}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-gray-800">
                            {feeAmount.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-green-700 font-semibold">
                            {feePaid.toFixed(2)}
                          </td>
                          <td
                            className={`border border-gray-300 px-3 py-2 text-right font-bold ${feePending > 0 ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {feePending.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                    {(() => {
                      const s = calculateFeeSummary(
                        selectedStudentForPrint.feesList as unknown as FeeDetail[],
                      )
                      return (
                        <tr className="bg-white font-bold text-gray-900">
                          <td
                            colSpan={2}
                            className="border border-gray-400 px-3 py-3 text-xs font-bold uppercase"
                          >
                            Grand Total
                          </td>
                          <td className="border border-gray-400 px-3 py-3 text-right text-xs">
                            {s.total.toFixed(2)}
                          </td>
                          <td className="border border-gray-400 px-3 py-3 text-right text-xs">
                            {s.paid.toFixed(2)}
                          </td>
                          <td className="border border-gray-400 px-3 py-3 text-right text-xs font-bold">
                            {s.pending.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment table */}
          {printMode === 'payment' && (
            <div className="px-6 py-3 border-b-2 border-gray-800 print:border-black">
              {(() => {
                const recentTxs =
                  printTransactionIds.length > 0
                    ? [...transactions]
                        .filter((tx: any) => printTransactionIds.includes(tx.feeTransactionId))
                        .sort(
                          (a: any, b: any) => (b.feeTransactionId || 0) - (a.feeTransactionId || 0),
                        )
                    : [...transactions]
                        .sort(
                          (a: any, b: any) => (b.feeTransactionId || 0) - (a.feeTransactionId || 0),
                        )
                        .slice(0, 5)

                if (recentTxs.length === 0)
                  return (
                    <p className="text-xs text-gray-400 text-center py-4 italic">
                      No recent transactions found.
                    </p>
                  )

                const totalAmountPaid = recentTxs.reduce(
                  (s: number, tx: any) => s + (Number(tx.amount) || 0),
                  0,
                )
                const totalDiscount = recentTxs.reduce(
                  (s: number, tx: any) => s + (Number(tx.discountAmount) || 0),
                  0,
                )
                const totalFine = recentTxs.reduce(
                  (s: number, tx: any) => s + (Number(tx.fine) || 0),
                  0,
                )
                const netPayable = totalAmountPaid + totalFine - totalDiscount
                const receiptSummary = calculateFeeSummary(
                  selectedStudentForPrint.feesList as unknown as FeeDetail[],
                )
                const allTransactionsPaid = transactions.reduce(
                  (s: number, tx: any) => s + (Number(tx.amount) || 0),
                  0,
                )
                const balancePending = Math.max(0, receiptSummary.total - allTransactionsPaid)

                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {[
                            { h: '#', a: 'text-center' },
                            { h: 'Txn ID', a: 'text-left' },
                            { h: 'Date', a: 'text-left' },
                            { h: 'Fee Type', a: 'text-left' },
                            { h: 'Mode', a: 'text-center' },
                            { h: 'Amount (₹)', a: 'text-right' },
                            { h: 'Discount (₹)', a: 'text-right' },
                            { h: 'Fine (₹)', a: 'text-right' },
                            { h: 'Net Payable (₹)', a: 'text-right' },
                          ].map(({ h, a }) => (
                            <th
                              key={h}
                              className={`border border-gray-300 px-3 py-2 font-semibold text-gray-700 whitespace-nowrap ${a}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentTxs.map((tx: any, idx: number) => {
                          const txAmount = Number(tx.amount) || 0
                          const txDiscount = Number(tx.discountAmount) || 0
                          const txFine = Number(tx.fine) || 0
                          const txNet = txAmount + txFine - txDiscount
                          return (
                            <tr key={tx.feeTransactionId ?? idx} className="even:bg-gray-50/50">
                              <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-gray-600">
                                {tx.feeTransactionId || '—'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-gray-600 whitespace-nowrap">
                                {tx.date || '—'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-gray-800">
                                {tx.feeTypeName || '—'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-semibold text-xs">
                                  {tx.mode || '—'}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-right text-gray-800 font-medium">
                                {txAmount.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-right text-green-700 font-medium">
                                {txDiscount > 0 ? `- ${txDiscount.toFixed(2)}` : '—'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-right text-orange-600 font-medium">
                                {txFine > 0 ? `+ ${txFine.toFixed(2)}` : '—'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-right font-bold text-blue-700">
                                {txNet.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-bold text-gray-900">
                          <td
                            colSpan={5}
                            className="border border-gray-400 px-3 py-2 text-xs font-bold uppercase text-right"
                          >
                            Grand Total
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-right text-xs font-bold text-gray-800">
                            {totalAmountPaid.toFixed(2)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-right text-xs font-bold text-green-700">
                            {totalDiscount > 0 ? `- ${totalDiscount.toFixed(2)}` : '—'}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-right text-xs font-bold text-orange-600">
                            {totalFine > 0 ? `+ ${totalFine.toFixed(2)}` : '—'}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-right text-xs font-bold text-blue-700">
                            {netPayable.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-white font-bold text-gray-900">
                          <td
                            colSpan={8}
                            className="border border-gray-400 px-3 py-2 text-xs font-bold uppercase text-right"
                          >
                            Amount Paid
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-right text-xs font-bold text-green-700">
                            {netPayable.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-white font-bold text-gray-900">
                          <td
                            colSpan={8}
                            className="border border-gray-400 px-3 py-2 text-xs font-bold uppercase text-right"
                          >
                            Balance Pending
                          </td>
                          <td
                            className={`border border-gray-400 px-3 py-2 text-right text-xs font-bold ${balancePending > 0 ? 'text-red-700' : 'text-green-700'}`}
                          >
                            {balancePending.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Signature */}
          <div className="px-6 py-4">
            <div className="flex justify-end">
              <div className="text-center w-1/2">
                <div className="h-12 border-b border-gray-400 mb-2" />
                <p className="text-xs font-semibold text-gray-700">Authorised Signatory</p>
                <p className="text-xs text-gray-500 mt-0.5">{schoolName || 'School'}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    [
      selectedStudentForPrint,
      logoLoading,
      logoError,
      schoolLogoUrl,
      showSchoolLoader,
      schoolName,
      schoolManagedBy,
      schoolAddress,
      schoolWebSite,
      schoolPhone,
      schoolEmail,
      currentDate,
      printMode,
      printTransactionIds,
      transactions,
    ],
  )

  const editVals = watchEdit()
  const editAmountNum = parseFloat(editVals.editAmount) || 0
  const editDiscNum = parseFloat(editVals.editDiscountAmount) || 0
  const editFineNum = parseFloat(editVals.editFine) || 0
  const editNetPayable = editAmountNum - editDiscNum + editFineNum

  if (selectedView === 'list') {
    return (
      <div className="w-full bg-gray-50 p-6 print:hidden">
        <div className="bg-white rounded-lg p-6 shadow space-y-6">
          <h1 className="text-2xl font-medium">{Text.Select_Criteria || 'Select Criteria'}</h1>

          {messages.success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconField name="FaCheckCircle" size={20} />
                <span>{messages.success}</span>
              </div>
              <button type="button" onClick={clearSuccessMessage}>
                <IconField name="FaTimes" size={16} />
              </button>
            </div>
          )}
          {messages.error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconField name="FaExclamationCircle" size={20} />
                <span>{messages.error}</span>
              </div>
              <button type="button" onClick={clearErrorMessage}>
                <IconField name="FaTimes" size={16} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <AllSchoolDropdown
              onSubmit={handleSearchSubmit(onSearchSubmit)}
              queryKeys={['schoolClasses', 'sections']}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Dropdown
                  label={Text.Class || 'Class'}
                  name="class"
                  control={control}
                  options={classOptions}
                />
                <Dropdown
                  label={NameText.Section || 'Section'}
                  name="section"
                  control={control}
                  options={sectionOptions}
                />
                <Dropdown
                  label={Text.Session}
                  name="session"
                  control={control}
                  options={SESSION_OPTIONS}
                />
                <TextField
                  label={Text.Name_or_Admission_No}
                  name="search"
                  control={control}
                  placeholder={Text.Enter_Name_Or_Admission_No}
                />
                <TextField
                  label={Text.Roll_No}
                  name="rollNo"
                  control={control}
                  placeholder={Text.Enter_Roll_Number}
                />
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button
                  name={Text.Cancel}
                  loading={false}
                  onClick={handleReset}
                  showAlways={true}
                />
                <Button
                  name={Text.Search || 'Search'}
                  icon={<IconField name="FaSearch" />}
                  loading={isLoading}
                  onClick={handleSearchSubmit(onSearchSubmit)}
                  showAlways={true}
                />
              </div>
            </AllSchoolDropdown>
          </div>

          {isBackendFiltering && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
              <IconField name="FaSpinner" size={14} className="animate-spin" />
              <span>{Text.Searching_Records_On_Server}</span>
            </div>
          )}

          {/* ── Table: only shown after search ── */}
          {hasSearched && (
            <div className="relative">
              {isLoading && !isBackendFiltering && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                  <span className="text-sm text-gray-500 animate-pulse">Loading...</span>
                </div>
              )}
              <ControlledTable
                data={studentsWithTotalPending}
                columns={listColumns}
                searchTerm={searchTerm}
                onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateSearchTerm(e.target.value)
                }
                title={Text.Students_With_Due_Fees}
                actionColumn={false}
                onRowClick={handleRowClick}
                rowClassName="cursor-pointer hover:bg-gray-100"
                showSearch={false}
                btn={false}
                showSelectAll={false}
                enablePermissions={true}
                permissionScope="FEES"
                serverPage={page}
                serverTotalPages={totalPages}
                serverTotalItems={totalItems}
                serverPageSize={pageSize}
                onServerPageChange={handlePageChange}
                onServerPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!selectedStudent) return <div className="p-6 text-gray-500">Loading...</div>

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen print:hidden">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Student header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <button
                onClick={handleBackToList}
                className="text-blue-600 hover:text-blue-700 mb-2 font-medium text-sm flex items-center gap-1"
              >
                <IconField name="FaArrowLeft" size={12} /> {Text.Back_To_Search}
              </button>
              <h2 className="text-xl font-bold text-gray-800">{selectedStudent.studentName}</h2>
              <p className="text-sm text-gray-500">
                Adm: {selectedStudent.admissionNo} | Class: {selectedStudent.class} | Section:{' '}
                {selectedStudent.section} | Roll: {selectedStudent.rollNo} | Date: {currentDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                name=""
                loading={false}
                icon={<IconField name="FaPrint" size={16} />}
                onClick={() => {
                  setSelectedStudentForPrint(selectedStudent)
                  setPrintMode('fee-only')
                  setIsPrintModalOpen(true)
                }}
              />
              <Button
                name={Text.Add_Transaction || 'Add Transaction'}
                loading={isRefreshing}
                onClick={handleOpenPaymentModal}
                showAlways={true}
              />
            </div>
          </div>

          {/* Messages */}
          {messages.success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconField name="FaCheckCircle" size={20} />
                <span>{messages.success}</span>
              </div>
              <button type="button" onClick={clearSuccessMessage}>
                <IconField name="FaTimes" size={16} />
              </button>
            </div>
          )}
          {messages.error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconField name="FaExclamationCircle" size={20} />
                <span>{messages.error}</span>
              </div>
              <button type="button" onClick={clearErrorMessage}>
                <IconField name="FaTimes" size={16} />
              </button>
            </div>
          )}
          {isRefreshing && (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md flex items-center gap-2">
              <IconField name="FaSpinner" size={20} className="animate-spin" />
              <span>Updating fee breakdown...</span>
            </div>
          )}

          {/* Fee structure */}
          {selectedStudent.feesList?.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                {Text.Fee_Structure_Breakdown}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                  label={Text.Total_Fees}
                  value={`₹${feeSummary.total.toFixed(2)}`}
                  color="blue"
                />
                <SummaryCard
                  label={Text.Paid_Amount || 'Paid Amount'}
                  value={`₹${feeSummary.paid.toFixed(2)}`}
                  color="green"
                />
                <SummaryCard
                  label={Text.Pending_Amount || 'Pending Amount'}
                  value={`₹${feeSummary.pending.toFixed(2)}`}
                  color="red"
                />
                <SummaryCard
                  label={Text.Fine_Amount || 'Fine Amount'}
                  value={`₹${feeSummary.fine.toFixed(2)}`}
                  color="orange"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      {[
                        { h: Text.Fee_Type || 'Fee Type', a: 'text-left' },
                        { h: Text.Total_Fees || 'Total Fees', a: 'text-right' },
                        { h: Text.Paid || 'Paid', a: 'text-right' },
                        { h: Text.Pending || 'Pending', a: 'text-right' },
                        { h: Text.Fine || 'Fine', a: 'text-right' },
                        { h: Text.Status || 'Status', a: 'text-center' },
                      ].map(({ h, a }) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-sm font-semibold text-gray-700 border-b ${a}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedStudent.feesList as FeeDetail[]).map((fee, i) => {
                      const total = Number(fee.totalFees) || 0
                      const paid = Number(fee.paid) || 0
                      const pending = Number(fee.pending) || 0
                      const fine = Number(fee.fine) || 0
                      return (
                        <tr key={fee.feeTypeId ?? i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-800 border-b">
                            {fee.feeTypeName}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800 border-b">
                            ₹{total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-medium border-b">
                            ₹{paid.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 font-medium border-b">
                            ₹{pending.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-orange-600 font-medium border-b">
                            ₹{fine.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center border-b">
                            {pending === 0 && total > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Paid
                              </span>
                            ) : paid > 0 && pending > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Partial
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Unpaid
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-gray-100 font-bold">
                      <td className="px-4 py-4 text-sm text-gray-900 border-t-2">
                        {Text.Grand_Total}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-900 border-t-2">
                        ₹{feeSummary.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-green-700 border-t-2">
                        ₹{feeSummary.paid.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-red-700 border-t-2">
                        ₹{(feeSummary.total - feeSummary.paid).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-orange-700 border-t-2">
                        ₹{feeSummary.fine.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-center border-t-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800">
                          {Text.Total}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaction history */}
          <div>
            <ControlledTable
              columns={transactionColumns}
              data={transactions.map((tx) => ({ ...tx, id: tx.feeTransactionId }))}
              showSearch={false}
              title={Text.Transaction_History || 'Transaction History'}
              actionColumn={false}
              btn={false}
              showSelectAll={false}
              searchTerm=""
              onSearchChange={() => {}}
            />
            {isLoadingTransactions && (
              <div className="text-center py-4 text-gray-500">Loading transactions...</div>
            )}
            {!isLoadingTransactions && transactions.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                No transaction history available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Print Modal ─── */}
      {isPrintModalOpen && selectedStudentForPrint && (
        <>
          <div className="fee-receipt-screen fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 shrink-0">
                <h2 className="text-base font-bold text-gray-800">Fee Receipt Preview</h2>
                <div className="flex gap-2">
                  <Button
                    name="Print"
                    loading={false}
                    icon={<IconField name="FaPrint" size={14} />}
                    onClick={() => window.print()}
                    showAlways={true}
                  />
                  <Button
                    name="Close"
                    loading={false}
                    onClick={() => {
                      setIsPrintModalOpen(false)
                      setSelectedStudentForPrint(null)
                      setPrintMode('fee-only')
                      setPrintTransactionIds([])
                    }}
                    showAlways={true}
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 px-4 py-4">
                {renderReceiptContent('Office Copy')}
                <CutLine />
                {renderReceiptContent('Student Copy')}
              </div>
            </div>
          </div>
          <div id="fee-receipt-printable">
            {renderReceiptContent('Office Copy')}
            <CutLine />
            {renderReceiptContent('Student Copy')}
          </div>
        </>
      )}

      {/* ─── Payment Modal ─── */}
      {isPaymentModalOpen && modal.selectedStudent && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClosePaymentModal()
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{Text.New_Payment_Transaction}</h3>
              <button
                onClick={handleClosePaymentModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <IconField name="FaTimes" size={18} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start gap-3">
                <IconField
                  name="FaExclamationTriangle"
                  size={20}
                  className="text-yellow-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    {Text.Important_Notice}
                  </p>
                  <p className="text-sm text-yellow-700">{Text.Transaction_Delete_Warning}</p>
                </div>
              </div>
            </div>

            {messages.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{messages.error}</p>
              </div>
            )}

            {/* Fee type selector */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {Text.Select_Fee_Type} <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  {Text.Select_Multiple_Fee_Types}
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(modal.selectedStudent.feesList as FeeDetail[]).map((fee) => {
                  const isSelected = selectedFeeTypeIds.includes(fee.feeTypeId)
                  const pending = Number(fee.pending) || 0
                  const isPaid = pending === 0
                  return (
                    <button
                      key={fee.feeTypeId}
                      type="button"
                      disabled={isPaid}
                      onClick={() => !isPaid && toggleFeeType(fee)}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all duration-150
                        ${
                          isPaid
                            ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                            : isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer'
                        }`}
                    >
                      <div
                        className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {fee.feeTypeName}
                        </p>
                        <div className="flex gap-3 mt-0.5 text-xs">
                          <span className="text-red-600 font-medium">
                            Pending: ₹{pending.toFixed(2)}
                          </span>
                          {Number(fee.fine) > 0 && (
                            <span className="text-orange-600">
                              Fine: ₹{Number(fee.fine).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      {isPaid && (
                        <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment details per fee type */}
            {selectedFeeTypeIds.length > 0 && (
              <div className="mb-5 space-y-4">
                <p className="text-sm font-semibold text-gray-700">
                  {Text.Enter_Payment_Details_For_Each_Fee_Type}{' '}
                  <span className="text-red-500">*</span>
                </p>
                {selectedFeeTypeIds.map((id) => {
                  const entry = feeTypeEntries[id]
                  if (!entry) return null
                  const feeTotal = feeTotalAmount(entry)
                  const disc = parseFloat(entry.discount) || 0
                  const fine = parseFloat(entry.fineOverride) || 0
                  const netPayable = feeTotal - disc + fine

                  return (
                    <div
                      key={id}
                      className="border-2 border-blue-200 rounded-xl bg-blue-50/30 overflow-hidden"
                    >
                      <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                        <span className="text-white text-sm font-bold">{entry.feeTypeName}</span>
                        <div className="flex gap-3 text-xs text-blue-100">
                          <span>Pending: ₹{entry.pending.toFixed(2)}</span>
                          {entry.fine > 0 && <span>Fine: ₹{entry.fine.toFixed(2)}</span>}
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            {Text.Payment_Mode} <span className="text-red-500">*</span>
                            <span className="ml-2 font-normal text-gray-400">
                              {Text.Select_Multiple_Fee_Types}
                            </span>
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {PAYMENT_MODE_OPTIONS.map(({ label, value }) => {
                              const active = entry.selectedModes.includes(value)
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => toggleModeForFee(id, value)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                                    ${
                                      active
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                                    }`}
                                >
                                  {active && (
                                    <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none">
                                      <path
                                        d="M2 7l3.5 3.5L12 3"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                  {label}
                                </button>
                              )
                            })}
                          </div>

                          {entry.selectedModes.length > 0 && (
                            <div className="bg-white border border-blue-100 rounded-lg p-3 space-y-3">
                              {entry.selectedModes.map((mode) => {
                                const modeLabel =
                                  PAYMENT_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode
                                const me = entry.modeEntries[mode] || { amount: '', receiptNo: '' }
                                return (
                                  <div key={mode} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        {modeLabel} — Amount (₹){' '}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                                          ₹
                                        </span>
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          value={me.amount}
                                          placeholder="0.00"
                                          onChange={(e) =>
                                            updateModeEntryForFee(
                                              id,
                                              mode,
                                              'amount',
                                              e.target.value,
                                            )
                                          }
                                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Receipt No{' '}
                                        <span className="text-gray-400 font-normal">
                                          (optional)
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        value={me.receiptNo}
                                        placeholder="Enter receipt number"
                                        onChange={(e) =>
                                          updateModeEntryForFee(
                                            id,
                                            mode,
                                            'receiptNo',
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              {Text.Discount}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                                ₹
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={entry.discount}
                                placeholder="0.00"
                                onChange={(e) => updateFeeField(id, 'discount', e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              {Text.Fine}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                                ₹
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={entry.fineOverride}
                                placeholder="0.00"
                                onChange={(e) => updateFeeField(id, 'fineOverride', e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            {Text.Note}
                            <span className="text-gray-400 font-normal">{Text.Optional}</span>
                          </label>
                          <input
                            type="text"
                            value={entry.note}
                            placeholder={Text.Enter_Additional_Notes}
                            onChange={(e) => updateFeeField(id, 'note', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>

                        {feeTotal > 0 && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Amount:</span>
                              <span className="font-medium">₹{feeTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Discount:</span>
                              <span className="text-green-600 font-medium">
                                - ₹{disc.toFixed(2)}
                              </span>
                            </div>
                            {fine > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Fine:</span>
                                <span className="text-orange-600 font-medium">
                                  + ₹{fine.toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between border-t pt-1 mt-1">
                              <span className="font-semibold text-gray-700">Net Payable:</span>
                              <span className="font-bold text-blue-700">
                                ₹{netPayable.toFixed(2)}
                              </span>
                            </div>
                            {feeTotal > entry.pending && (
                              <p className="text-orange-600 text-xs mt-1">
                                ⚠ Amount exceeds pending balance of ₹{entry.pending.toFixed(2)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {grandTotalPayment > 0 && selectedFeeTypeIds.length > 1 && (
                  <div className="bg-blue-600 text-white rounded-xl px-5 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">Grand Total Payable (incl. fine)</span>
                    <span className="text-xl font-bold">₹{grandTotalPayment.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <div className="flex-1">
                <Button
                  name={Text.Cancel || 'Cancel'}
                  loading={false}
                  onClick={handleClosePaymentModal}
                />
              </div>
              <div className="flex-1">
                <Button
                  name={Text.Confirm_Payment || 'Confirm Payment'}
                  loading={isSubmitting || isRefreshing}
                  isDisable={!isPaymentValid() || isRefreshing}
                  onClick={onPaymentSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Print Confirm Modal ─── */}
      {isPrintConfirmOpen && lastPaidStudent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div
              className={`mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full ${isEditConfirm ? 'bg-blue-100' : 'bg-green-100'}`}
            >
              <svg
                className={`w-8 h-8 ${isEditConfirm ? 'text-blue-600' : 'text-green-600'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isEditConfirm ? 'Transaction Updated!' : 'Payment Successful!'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {isEditConfirm ? (
                <>
                  Transaction successfully updated for{' '}
                  <span className="font-semibold text-gray-700">{lastPaidStudent.studentName}</span>
                  . Would you like to print the updated receipt?
                </>
              ) : (
                <>
                  Transaction recorded for{' '}
                  <span className="font-semibold text-gray-700">{lastPaidStudent.studentName}</span>
                  . Would you like to print the receipt?
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsPrintConfirmOpen(false)
                  setLastPaidStudent(null)
                  setPrintTransactionIds([])
                  setIsEditConfirm(false)
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  setIsPrintConfirmOpen(false)
                  setSelectedStudentForPrint(lastPaidStudent)
                  setPrintMode('payment')
                  setIsPrintModalOpen(true)
                  setLastPaidStudent(null)
                  setIsEditConfirm(false)
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <IconField name="FaPrint" size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {isEditModalOpen && editingTransaction && modal.selectedStudent && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseEditModal()
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  EDIT
                </span>
                <h3 className="text-xl font-bold text-gray-800">Edit Transaction</h3>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IconField name="FaTimes" size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Transaction ID:</span>
                <span className="font-bold text-gray-800">
                  #{editingTransaction.feeTransactionId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500 font-medium">Fee Type:</span>
                <span className="font-semibold text-blue-700">
                  {editingTransaction.feeTypeName || '—'}
                </span>
              </div>
            </div>

            {messages.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{messages.error}</p>
              </div>
            )}

            <div className="space-y-2">
              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_MODE_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditMode(value)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150
                        ${
                          editMode === value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                        }`}
                    >
                      {editMode === value && (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2 7l3.5 3.5L12 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <AmountField name="editAmount" control={editControl} label="Amount (₹)" required />
              <TextField
                name="editReceiptNo"
                control={editControl}
                label="Receipt No"
                placeholder="Enter receipt number"
              />
              <PastDateField
                name="editDate"
                control={editControl}
                label="Transaction Date"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <AmountField name="editDiscountAmount" control={editControl} label="Discount (₹)" />
                <AmountField name="editFine" control={editControl} label="Fine (₹)" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Enter any additional notes"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              {/* Summary */}
              {editAmountNum > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-semibold text-blue-700">{editMode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">₹{editAmountNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold text-green-600">
                      - ₹{editDiscNum.toFixed(2)}
                    </span>
                  </div>
                  {editFineNum > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fine:</span>
                      <span className="font-semibold text-orange-600">
                        + ₹{editFineNum.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-sm font-medium">Net Payable:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{editNetPayable.toFixed(2)}
                    </span>
                  </div>
                  {(() => {
                    const editingFee = modal.selectedStudent?.feesList?.find(
                      (f) => Number(f.feeTypeId) === Number(editingTransaction?.feeTypeId),
                    )
                    const editingPending =
                      Number((editingFee as FeeDetail | undefined)?.pending) || 0
                    const originalAmount = Number(editingTransaction?.amount) || 0
                    const effectivePending = editingPending + originalAmount
                    return editAmountNum > effectivePending ? (
                      <p className="text-orange-600 text-xs mt-1">
                        Amount exceeds pending balance of ₹{effectivePending.toFixed(2)}
                      </p>
                    ) : null
                  })()}
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <div className="flex-1">
                  <Button name="Cancel" loading={false} onClick={handleCloseEditModal} />
                </div>
                <div className="flex-1">
                  <Button
                    name="Update Transaction"
                    loading={isSubmitting || isRefreshing}
                    isDisable={!editMode || editAmountNum <= -1 || isRefreshing || isSubmitting}
                    onClick={onEditSubmit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Print styles ─── */}
      <style>{`
        .cut-line-print { display: none; }

        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          body * { visibility: hidden !important; }
          .fee-receipt-screen { display: none !important; }
          #fee-receipt-printable,
          #fee-receipt-printable * { visibility: visible !important; }
          #fee-receipt-printable {
            position: fixed; top: 0; left: 0;
            width: 190mm; padding: 0; margin: 0;
            background: white; font-size: 10px;
          }
          #fee-receipt-printable .cut-line-screen { display: none !important; }
          #fee-receipt-printable .cut-line-print {
            display: block !important;
            visibility: visible !important;
          }
          #fee-receipt-printable .cut-line-print * { visibility: visible !important; }
          #fee-receipt-printable > div:first-child,
          #fee-receipt-printable > div:last-child { page-break-inside: avoid; }
          #fee-receipt-printable .px-6 { padding-left: 10px !important; padding-right: 10px !important; }
          #fee-receipt-printable .py-4 { padding-top: 6px !important; padding-bottom: 6px !important; }
          #fee-receipt-printable .py-3 { padding-top: 4px !important; padding-bottom: 4px !important; }
          #fee-receipt-printable .py-2 { padding-top: 3px !important; padding-bottom: 3px !important; }
          #fee-receipt-printable .gap-y-1\\.5 { row-gap: 3px !important; }
          #fee-receipt-printable .h-12 { height: 28px !important; }
          #fee-receipt-printable .w-16 { width: 48px !important; }
          #fee-receipt-printable .h-16 { height: 48px !important; }
          #fee-receipt-printable h1 { font-size: 14px !important; }
          #fee-receipt-printable h2 { font-size: 10px !important; }
          #fee-receipt-printable table { font-size: 9px !important; }
          #fee-receipt-printable td, #fee-receipt-printable th { padding: 2px 6px !important; }
          #fee-receipt-printable .rounded-lg { border-radius: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  )
}

export default SearchDueFees

import React, { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { Button, TextField } from '../../../components/controlled'
import { Dropdown } from '../../../components/controlled'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { feeTransactionService } from '../../../services/feesCollection/feeTransactionService'
import { studentFilterService } from '../../../services/feesCollection/fineTransactionService'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'

interface FilterFormData {
  searchClass: string
  searchSection: string
  receiptNo: string
  keyword: string
}

interface ReportFormData {
  startDate: string
  endDate: string
}

interface TableRow {
  id: number
  feeTransactionId: number
  paymentId: string
  date: string
  name: string
  class: string
  section: string
  admissionNo: string
  feeType: string
  mode: string
  paid: string
  discount: string
  fine: string
  receiptNo: string
  _studentId: string
}

function transformTransaction(tx: any, index: number): TableRow {
  return {
    id: index + 1,
    feeTransactionId: tx.feeTransactionId || 0,
    paymentId: String(tx.feeTransactionId || 0),
    date: tx.date || '',
    name: tx.studentName || 'N/A',
    class: tx.className || 'N/A',
    section: tx.sectionName || '',
    admissionNo: tx.admissionNo || '',
    feeType: tx.feeTypeName || 'N/A',
    mode: tx.mode || 'N/A',
    paid: `₹${Number(tx.amount || 0).toFixed(2)}`,
    discount: `₹${Number(tx.discountAmount || 0).toFixed(2)}`,
    fine: `₹${Number(tx.fine || 0).toFixed(2)}`,
    receiptNo: tx.receiptNo || 'N/A',
    _studentId: String(tx.studentId || ''),
  }
}

interface ReportModalProps {
  onClose: () => void
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: { startDate: '', endDate: '' },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const isDisabled = isDownloading || !startDate || !endDate

  const onSubmit = async (data: ReportFormData) => {
    if (data.endDate < data.startDate) {
      toast.error('End date must be on or after start date.')
      return
    }
    setIsDownloading(true)
    try {
      const result = await feeTransactionService.downloadReport(data.startDate, data.endDate)
      if (result.downloaded) {
        toast.success('Report downloaded successfully!')
        onClose()
      } else {
        toast.info((result as any).message)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download report.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">Select Date Range</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IconField name="FaTimes" size={16} />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'From date is required' })}
                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <span className="text-xs text-red-500">{errors.startDate.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={startDate || undefined}
                {...register('endDate', { required: 'To date is required' })}
                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <span className="text-xs text-red-500">{errors.endDate.message}</span>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />
        <div className="flex justify-end gap-3 px-5 py-4">
          <Button
            name={isDownloading ? 'Generating…' : 'Download Report'}
            loading={isDownloading}
            type="button"
            icon={<IconField name="FaDownload" size={14} color="white" />}
            isDisable={isDisabled}
            onClick={handleSubmit(onSubmit)}
            showAlways={true}
          />
        </div>
      </div>
    </div>
  )
}

const SearchFeesPayment: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)
  const navigate = useNavigate()
  const location = useLocation()

  const {
    control,
    handleSubmit,
    reset: resetForm,
    watch,
  } = useForm<FilterFormData>({
    defaultValues: {
      searchClass: '',
      searchSection: '',
      receiptNo: '',
      keyword: '',
    },
  })

  const selectedClass = watch('searchClass')

  const [allRecords, setAllRecords] = useState<TableRow[]>([])
  const [displayRecords, setDisplayRecords] = useState<TableRow[]>([])
  const [isLoadingBase, setIsLoadingBase] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isFilterActive, setIsFilterActive] = useState(false)
  const [error, setError] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [showReportModal, setShowReportModal] = useState(false)

  const availableClasses = useMemo(
    () =>
      Array.from(new Set(allRecords.map((r) => r.class).filter((c) => c && c !== 'N/A'))).sort(),
    [allRecords],
  )

  const availableSections = useMemo(() => {
    const base = selectedClass ? allRecords.filter((r) => r.class === selectedClass) : allRecords
    return Array.from(new Set(base.map((r) => r.section).filter(Boolean))).sort()
  }, [allRecords, selectedClass])

  // Extracted so it can be called on mount AND whenever we navigate back to this page
  const loadTransactions = useCallback(async () => {
    setIsLoadingBase(true)
    setError('')
    try {
      const response = await feeTransactionService.getAllPages('desc')
      const rows = (response.feeTransactions || []).map(transformTransaction)
      setAllRecords(rows)
      setDisplayRecords(rows)
    } catch (err: any) {
      console.error('Error loading fee transactions:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setIsLoadingBase(false)
    }
  }, [])

  // Refetch every time this route becomes active again (location.key changes on every navigation,
  // even navigating back to the same path), so deletes/edits made on other pages are reflected.
  useEffect(() => {
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const applyLocalFilters = useCallback(
    (list: TableRow[], f: FilterFormData): TableRow[] =>
      list.filter((r) => {
        if (f.searchClass && f.searchClass !== 'N/A' && r.class !== f.searchClass) return false
        if (f.searchSection && r.section !== f.searchSection) return false
        if (
          f.receiptNo &&
          !r.receiptNo.toLowerCase().includes(f.receiptNo.toLowerCase()) &&
          !r.paymentId.toLowerCase().includes(f.receiptNo.toLowerCase())
        )
          return false
        if (f.keyword) {
          const q = f.keyword.toLowerCase()
          if (!r.name.toLowerCase().includes(q) && !r.admissionNo.toLowerCase().includes(q))
            return false
        }
        return true
      }),
    [],
  )

  const onSearch: SubmitHandler<FilterFormData> = useCallback(
    async (data) => {
      const hasAny = Object.values(data).some((v) => v !== '' && v != null)
      if (!hasAny) {
        setIsFilterActive(false)
        setDisplayRecords(allRecords)
        setPage(0)
        return
      }
      setIsFiltering(true)
      setIsFilterActive(true)
      setPage(0)
      setError('')
      try {
        const shouldCallBackend = !!data.keyword || !!data.searchClass || !!data.searchSection
        let matchedStudentIds: Set<string> | null = null
        if (shouldCallBackend) {
          try {
            const studentRes = await studentFilterService.filterAllPages(
              { search: data.keyword || undefined, sessionStatus: 'ACTIVE' },
              'asc',
            )
            let filteredStudents = studentRes.students as any[]
            if (data.searchClass) {
              filteredStudents = filteredStudents.filter(
                (s: any) => (s.className || '').toLowerCase() === data.searchClass.toLowerCase(),
              )
            }
            if (data.searchSection) {
              filteredStudents = filteredStudents.filter(
                (s: any) =>
                  (s.sectionName || '').toLowerCase() === data.searchSection.toLowerCase(),
              )
            }
            if (filteredStudents.length > 0) {
              matchedStudentIds = new Set(filteredStudents.map((s: any) => String(s.studentId)))
            } else if (data.keyword) {
              matchedStudentIds = null
            } else {
              matchedStudentIds = new Set()
            }
          } catch (backendErr) {
            console.warn('Backend student filter failed, using local:', backendErr)
            matchedStudentIds = null
          }
        }
        let baseRows = allRecords
        if (matchedStudentIds !== null) {
          if (matchedStudentIds.size === 0 && shouldCallBackend && !data.keyword) {
            baseRows = []
          } else if (matchedStudentIds.size > 0) {
            baseRows = allRecords.filter((r) => matchedStudentIds!.has(r._studentId))
            if (baseRows.length === 0 && data.keyword) {
              baseRows = applyLocalFilters(allRecords, {
                ...data,
                searchClass: '',
                searchSection: '',
              })
            }
          }
        } else if (shouldCallBackend && data.keyword) {
          baseRows = applyLocalFilters(allRecords, { ...data, searchClass: '', searchSection: '' })
        }
        const finalRows = applyLocalFilters(baseRows, {
          searchClass: data.searchClass,
          searchSection: data.searchSection,
          receiptNo: data.receiptNo,
          keyword: matchedStudentIds !== null ? '' : data.keyword,
        })
        setDisplayRecords(finalRows)
      } catch (err: any) {
        console.error('Filter error, falling back to local:', err)
        setDisplayRecords(applyLocalFilters(allRecords, data))
      } finally {
        setIsFiltering(false)
      }
    },
    [allRecords, applyLocalFilters],
  )

  const handleReset = () => {
    resetForm()
    setIsFilterActive(false)
    setDisplayRecords(allRecords)
    setTableSearch('')
    setPage(0)
    setError('')
  }

  const searchFilteredRows = useMemo(() => {
    if (!tableSearch) return displayRecords
    console.log(tableSearch)
    const q = tableSearch.toLowerCase()
    return displayRecords.filter(
      (r) =>
        r.paymentId.includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.admissionNo.toLowerCase().includes(q) ||
        r.feeType.toLowerCase().includes(q) ||
        r.receiptNo.toLowerCase().includes(q) ||
        r.class.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q),
    )
  }, [displayRecords, tableSearch])

  const totalItems = searchFilteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const pagedRows = useMemo(() => {
    const start = page * pageSize
    return searchFilteredRows.slice(start, start + pageSize)
  }, [searchFilteredRows, page, pageSize])

  const tableColumns = [
    { key: 'paymentId', label: Text.Transaction_ID },
    { key: 'date', label: Text.Date || 'Date' },
    { key: 'name', label: Text.Name || 'Student Name' },
    { key: 'admissionNo', label: Text.Admission_No },
    { key: 'class', label: Text.Class || 'Class' },
    { key: 'section', label: NameText.Section || 'Section' },
    { key: 'feeType', label: Text.Fees_Type || 'Fee Type' },
    { key: 'mode', label: Text.Mode || 'Mode' },
    { key: 'paid', label: Text.Paid || 'Amount Paid' },
    { key: 'discount', label: Text.Discount || 'Discount' },
    { key: 'fine', label: Text.Fine || 'Fine' },
    { key: 'receiptNo', label: Text.Receipt_Payment_ID || 'Receipt / Payment ID' },
  ]

  const isLoading = isLoadingBase || isFiltering

  return (
    <>
      {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} />}

      <div className="flex justify-center px-2 sm:px-4 md:px-6 mt-10 w-full">
        <div className="w-full max-w-7xl border border-gray-300 bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-300 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold">
              {Text.Search_Fees_PaymentTitle || 'Search Fees Payment'}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                name="Add Deleted Payment"
                type="button"
                icon={<IconField name="FaTrashAlt" size={14} />}
                onClick={() => navigate('/payment-history')}
                loading={false}
                showAlways={true}
              />
              <Button
                name="Delete Payment by ID"
                type="button"
                icon={<IconField name="FaTrash" size={14} />}
                onClick={() => navigate('/delete-fee-transaction')}
                loading={false}
                showAlways={true}
              />
              <Button
                name={Text.Download_Report || 'Download Report'}
                loading={false}
                type="button"
                icon={<IconField name="FaDownload" size={14} color="white" />}
                onClick={() => setShowReportModal(true)}
                showAlways={true}
              />
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconField name="FaExclamationCircle" size={20} />
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError('')}>
                <IconField name="FaTimes" size={16} />
              </button>
            </div>
          )}

          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{Text.Search_Filter}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Dropdown
                label={Text.Class || 'Class'}
                name="searchClass"
                control={control}
                required={false}
                options={availableClasses.map((c) => ({ value: c, label: c }))}
              />
              <Dropdown
                label={NameText.Section || 'Section'}
                name="searchSection"
                control={control}
                required={false}
                options={availableSections.map((s) => ({ value: s, label: s }))}
              />
              <TextField
                label={Text.Payment_ID || 'Receipt / Payment ID'}
                name="receiptNo"
                control={control}
                placeholder="Enter receipt or payment ID"
              />
              <TextField
                label={Text.Search_By_Name_Admission_No || 'Search by Name / Admission No'}
                name="keyword"
                control={control}
                placeholder={Text.Enter_Name_Or_Admission_No || 'Enter name or admission no.'}
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                name={Text.Cancel}
                loading={false}
                icon={<IconField name="FaTimes" size={14} />}
                onClick={handleReset}
                showAlways={true}
              />
              <Button
                name={Text.Search || 'Search'}
                loading={isLoading}
                icon={<IconField name="FaSearch" size={14} />}
                onClick={handleSubmit(onSearch)}
                showAlways={true}
              />
            </div>
            {isFiltering && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
                <IconField name="FaSpinner" size={14} className="animate-spin" />
                <span>{Text.Searching_Records_On_Server}</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto px-4 pb-4 pt-2">
            {isLoadingBase ? (
              <div className="flex justify-center items-center py-10 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="text-gray-600">{Text.Loading_Transactions}</span>
              </div>
            ) : (
              <div className="relative">
                {isFiltering && (
                  <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                    <span className="text-sm text-gray-500 animate-pulse">{Text.Filtering}</span>
                  </div>
                )}
                <ControlledTable
                  columns={tableColumns}
                  data={pagedRows}
                  searchTerm={tableSearch}
                  onSearchChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setTableSearch(e.target.value)
                    setPage(0)
                  }}
                  actionColumn={false}
                  title={`${Text.Transactions}${isFilterActive ? ' (filtered)' : ''}`}
                  btn={false}
                  enablePermissions={true}
                  permissionScope="FEES"
                  showSelectAll={false}
                  showSearch={true}
                  serverPage={page}
                  serverTotalPages={totalPages}
                  serverTotalItems={totalItems}
                  serverPageSize={pageSize}
                  onServerPageChange={(newPage: number) => setPage(newPage)}
                  onServerPageSizeChange={(newSize: number) => {
                    setPageSize(newSize)
                    setPage(0)
                  }}
                />
                {!isFiltering && pagedRows.length === 0 && (
                  <div className="text-center py-10">
                    <IconField name="FaSearch" size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 text-lg">
                      {allRecords.length === 0
                        ? Text.No_Transactions_Found
                        : Text.No_Transactions_Match_Your_Search}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchFeesPayment
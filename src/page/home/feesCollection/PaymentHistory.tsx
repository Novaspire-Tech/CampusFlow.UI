import React, { useMemo, useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form'
import { Dropdown, TextField } from '../../../components/controlled'
import PastDateField from '../../../components/controlled/PastDateField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { useSearchDueFees } from '../../../hooks/queries/feesCollection/useSearchDueFees'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import type {
  SearchFormData,
  StudentFeesData,
} from '../../../types/feesCollection/searchDueFeesType'

const PAYMENT_MODE_OPTIONS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Card', value: 'CARD' },
  { label: 'UPI', value: 'UPI' },
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

const toDisplayDate = (iso: string): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const PaymentHistory: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)

  const {
    control,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm,
    watch,
    setValue: setSearchValue,
  } = useForm<FieldValues>({
    defaultValues: { class: '', section: '', search: '', rollNo: '' },
  })

  const {
    control: txControl,
    getValues: getTxValues,
    reset: resetTxForm,
  } = useForm<FieldValues>({
    defaultValues: {},
  })

  const { data: classesData } = useSchoolClasses()
  const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0)
  const { data: sectionsData } = useSections(selectedClassForSections)

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

  const {
    filteredStudents,
    page,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    isSubmitting,
    modal,
    messages,
    searchTerm,
    updateSearchTerm,
    searchStudents,
    resetSearch,
    openModal,
    closeModal,
    clearSuccessMessage,
    clearErrorMessage,
    addTransaction, 
  } = useSearchDueFees({ page: 0, size: 10, autoLoadStudents: false })

  const [view, setView] = useState<'list' | 'transaction'>('list')
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedFeeTypeIds, setSelectedFeeTypeIds] = useState<number[]>([])
  const [feeTypeEntries, setFeeTypeEntries] = useState<Record<number, FeeTypeEntry>>({})

  const onSearchSubmit: SubmitHandler<FieldValues> = useCallback(
    (data) => {
      const filters: SearchFormData = {}
      if (data.class) filters.class = String(data.class)
      if (data.section) filters.section = String(data.section)
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

  const handleRowClick = useCallback(
    (row: StudentFeesData) => {
      openModal(row)
      setSelectedFeeTypeIds([])
      setFeeTypeEntries({})
      resetTxForm()
      clearErrorMessage()
      clearSuccessMessage()
      setView('transaction')
    },
    [openModal, clearErrorMessage, clearSuccessMessage, resetTxForm],
  )

  const handleBackToList = useCallback(() => {
    setView('list')
    closeModal()
    setSelectedFeeTypeIds([])
    setFeeTypeEntries({})
    resetTxForm()
    clearErrorMessage()
    clearSuccessMessage()
  }, [closeModal, clearErrorMessage, clearSuccessMessage, resetTxForm])

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

  const toggleMode = useCallback((feeTypeId: number, mode: string) => {
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

  const updateModeEntry = useCallback(
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

  const grandTotal = useMemo(
    () =>
      Object.values(feeTypeEntries).reduce((s, e) => {
        const amt = e.selectedModes.reduce(
          (sum, m) => sum + (parseFloat(e.modeEntries[m]?.amount || '0') || 0),
          0,
        )
        const disc = parseFloat(e.discount) || 0
        const fine = parseFloat(e.fineOverride) || 0
        return s + amt - disc + fine
      }, 0),
    [feeTypeEntries],
  )

  const isValid = useCallback(() => {
    if (selectedFeeTypeIds.length === 0) return false
    const txVals = getTxValues()
    return Object.values(feeTypeEntries).every((e) => {
      const dateVal = txVals[`date_${e.feeTypeId}`]
      return (
        dateVal &&
        e.selectedModes.length > 0 &&
        e.selectedModes.reduce(
          (s, m) => s + (parseFloat(e.modeEntries[m]?.amount || '0') || 0),
          0,
        ) > 0
      )
    })
  }, [selectedFeeTypeIds, feeTypeEntries, getTxValues])

  const onSubmit = useCallback(async () => {
    if (!modal.selectedStudent) return
    const txVals = getTxValues()

    let allSuccess = true

    for (const entry of Object.values(feeTypeEntries)) {
      const isoDate = txVals[`date_${entry.feeTypeId}`] || ''
      const displayDate = toDisplayDate(isoDate)

      for (const mode of entry.selectedModes) {
        const modeEntry = entry.modeEntries[mode]
        const amount = parseFloat(modeEntry?.amount || '0') || 0

        if (amount <= 0) continue

        const result = await addTransaction({
          feeTypeId: entry.feeTypeId,
          discountAmount: parseFloat(entry.discount) || 0,
          fine: parseFloat(entry.fineOverride) || 0,
          note: entry.note || undefined,
          date: displayDate,
          mode: mode,
          amount: amount,
          receiptNo: modeEntry?.receiptNo || undefined,
          paymentModes: [
            {
              mode: mode,
              amount: amount,
              receiptNo: modeEntry?.receiptNo || undefined,
            },
          ],
          transactionDate: '',
          paymentMode: ''
        })

        if (!result) {
          allSuccess = false
          break
        }
      }

      if (!allSuccess) break
    }

    if (allSuccess) {
      setSelectedFeeTypeIds([])
      setFeeTypeEntries({})
      resetTxForm()
    }
  }, [modal.selectedStudent, feeTypeEntries, getTxValues, addTransaction, resetTxForm])

  // ── Table columns 
  const listColumns = useMemo(
    () => [
      { label: Text.Admission_No || 'Admission No', key: 'admissionNo' },
      { label: Text.Class || 'Class', key: 'class' },
      { label: NameText.Section || 'Section', key: 'section' },
      { label: Text.Student_Name || 'Student Name', key: 'studentName' },
      { label: Text.Total_Pending || 'Total Pending', key: 'totalPending' },
    ],
    [Text, NameText],
  )

  const student = modal.selectedStudent

  // LIST VIEW
  if (view === 'list') {
    return (
      <div className="w-full bg-gray-50 p-6 min-h-screen">
        <div className="bg-white rounded-lg p-6 shadow space-y-6">
          <h1 className="text-2xl font-medium text-gray-800">Payment History</h1>

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

          <AllSchoolDropdown
            onSubmit={handleSearchSubmit(onSearchSubmit)}
            queryKeys={['schoolClasses', 'sections']}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <TextField
                label={Text.Name_or_Admission_No || 'Name / Admission No'}
                name="search"
                control={control}
                placeholder={Text.Enter_Name_Or_Admission_No || 'Enter name or admission no'}
              />
              <TextField
                label={Text.Roll_No || 'Roll No'}
                name="rollNo"
                control={control}
                placeholder={Text.Enter_Roll_Number || 'Enter roll number'}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                name={Text.Cancel || 'Reset'}
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

          {hasSearched && (
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                  <span className="text-sm text-gray-500 animate-pulse">Loading...</span>
                </div>
              )}
              <ControlledTable
                data={filteredStudents}
                columns={listColumns}
                searchTerm={searchTerm}
                onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateSearchTerm(e.target.value)
                }
                title={Text.Students_With_Due_Fees || 'Students'}
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

  
  // TRANSACTION VIEW
  if (!student) return <div className="p-6 text-gray-500">Loading...</div>

  return (
    <div className="w-full bg-gray-50 p-6 min-h-screen">
      <div className="bg-white rounded-lg p-6 shadow space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <button
            onClick={handleBackToList}
            className="text-blue-600 hover:text-blue-700 mb-2 font-medium text-sm flex items-center gap-1"
          >
            <IconField name="FaArrowLeft" size={12} />
            {Text.Back_To_Search || 'Back to Search'}
          </button>
          <h2 className="text-xl font-bold text-gray-800">{student.studentName}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Adm: {student.admissionNo} &nbsp;|&nbsp; Class: {student.class} &nbsp;|&nbsp; Section:{' '}
            {student.section}
          </p>
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

        <h3 className="text-lg font-semibold text-gray-700">Add Transaction History</h3>

        {/* ── Step 1: Select Fee Type ── */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {Text.Select_Fee_Type || 'Select Fee Type'} <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-gray-400 font-normal">
              ({Text.Select_Multiple_Fee_Types || 'You can select multiple'})
            </span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(student.feesList as FeeDetail[]).map((fee) => {
              const isSelected = selectedFeeTypeIds.includes(fee.feeTypeId)
              const isPaid = (Number(fee.pending) || 0) === 0
              return (
                <button
                  key={fee.feeTypeId}
                  type="button"
                  disabled={isPaid}
                  onClick={() => !isPaid && toggleFeeType(fee)}
                  className={`relative flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-150
                    ${
                      isPaid
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer'
                    }`}
                >
                  <div
                    className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
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
                  <span className="text-sm font-semibold text-gray-800">{fee.feeTypeName}</span>
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

        {/* ── Step 2: Payment details per fee type ── */}
        {selectedFeeTypeIds.length > 0 && (
          <div className="space-y-5">
            <p className="text-sm font-semibold text-gray-700">
              {Text.Enter_Payment_Details_For_Each_Fee_Type || 'Enter Payment Details'}{' '}
              <span className="text-red-500">*</span>
            </p>

            {selectedFeeTypeIds.map((id) => {
              const entry = feeTypeEntries[id]
              if (!entry) return null

              const feeTotal = entry.selectedModes.reduce(
                (s, m) => s + (parseFloat(entry.modeEntries[m]?.amount || '0') || 0),
                0,
              )
              const disc = parseFloat(entry.discount) || 0
              const fine = parseFloat(entry.fineOverride) || 0
              const netPayable = feeTotal - disc + fine

              return (
                <div key={id} className="border-2 border-blue-200 rounded-xl overflow-hidden">
                  {/* Fee type header */}
                  <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                    <span className="text-white text-sm font-bold">{entry.feeTypeName}</span>
                    <div className="flex gap-3 text-xs text-blue-100">
                      <span>Pending: ₹{entry.pending.toFixed(2)}</span>
                      {entry.fine > 0 && <span>Fine: ₹{entry.fine.toFixed(2)}</span>}
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Date */}
                    <PastDateField
                      name={`date_${id}`}
                      control={txControl}
                      label="Transaction Date"
                      required
                      autoFillToday
                    />

                    {/* Payment Mode */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        {Text.Payment_Mode || 'Payment Mode'}{' '}
                        <span className="text-red-500">*</span>
                        <span className="ml-2 font-normal text-gray-400 text-xs">
                          ({Text.Select_Multiple_Fee_Types || 'Select one or more'})
                        </span>
                      </label>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {PAYMENT_MODE_OPTIONS.map(({ label, value }) => {
                          const active = entry.selectedModes.includes(value)
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => toggleMode(id, value)}
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

                      {/* Amount + Receipt per mode */}
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
                                        updateModeEntry(id, mode, 'amount', e.target.value)
                                      }
                                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Receipt No{' '}
                                    <span className="text-gray-400 font-normal">(optional)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={me.receiptNo}
                                    placeholder="Enter receipt number"
                                    onChange={(e) =>
                                      updateModeEntry(id, mode, 'receiptNo', e.target.value)
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

                    {/* Discount & Fine */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {Text.Discount || 'Discount'}
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
                          {Text.Fine || 'Fine'}
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

                    {/* Note */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {Text.Note || 'Note'}{' '}
                        <span className="text-gray-400 font-normal">
                          {Text.Optional || '(optional)'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={entry.note}
                        placeholder={Text.Enter_Additional_Notes || 'Enter additional notes'}
                        onChange={(e) => updateFeeField(id, 'note', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>

                    {/* Per-fee summary */}
                    {feeTotal > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium">₹{feeTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Discount:</span>
                          <span className="text-green-600 font-medium">- ₹{disc.toFixed(2)}</span>
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
                          <span className="font-bold text-blue-700">₹{netPayable.toFixed(2)}</span>
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

            {/* Grand total — shown when multiple fee types selected */}
            {grandTotal > 0 && selectedFeeTypeIds.length > 1 && (
              <div className="bg-blue-600 text-white rounded-xl px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Grand Total Payable (incl. fine)</span>
                <span className="text-xl font-bold">₹{grandTotal.toFixed(2)}</span>
              </div>
            )}

            {/* Add History button */}
            <div className="flex justify-end pt-2">
              <Button
                name="Add History"
                loading={isSubmitting}
                isDisable={!isValid() || isSubmitting}
                onClick={onSubmit}
                showAlways={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentHistory

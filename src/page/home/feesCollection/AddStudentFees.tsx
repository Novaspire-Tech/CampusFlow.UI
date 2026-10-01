import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Dropdown, TextField } from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import AmountField from '../../../components/controlled/AmountField'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useFeeTypes } from '../../../hooks/queries/feesCollection/useFeeTypes'
import { useGetClassFees } from '../../../hooks/queries/feesCollection/useClassFees'
import { toast } from 'react-toastify'
import { useStudentFee } from '../../../hooks/queries/feesCollection/useAddStudentFee'
import type { StudentFeeRecord, FeeRowData } from '../../../types/feesCollection/addStudentFeeTypes'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'


interface SearchFormInputs {
  classId: string
  sectionId: string
  search: string
  rollNo: string
}

interface FeeRowFormValues {
  totalFees: string
  paid: string
  pending: string
}


interface FeeRowFormProps {
  feeTypeId: string
  feeTypeName: string
  row: FeeRowData
  onFieldChange: (feeTypeId: string, field: 'totalFees' | 'paid', value: string) => void
}

const FeeRowForm: React.FC<FeeRowFormProps> = ({ feeTypeId, feeTypeName, row, onFieldChange }) => {
  const { control, watch, setValue } = useForm<FeeRowFormValues>({
    defaultValues: {
      totalFees: row.totalFees || '',
      paid: row.paid || '',
      pending: row.pending || '0.00',
    },
  })
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === 'totalFees' || name === 'paid') {
        const total = parseFloat(values.totalFees ?? '') || 0
        const paid = parseFloat(values.paid ?? '') || 0
        setValue('pending', Math.max(0, total - paid).toFixed(2), {
          shouldValidate: false,
          shouldDirty: false,
        })
        onFieldChange(feeTypeId, name, values[name] ?? '')
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue, feeTypeId, onFieldChange])

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="mb-3">
        <h5 className="text-sm font-semibold text-blue-700">{feeTypeName}</h5>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <AmountField<FeeRowFormValues>
          name="totalFees"
          control={control}
          label={Text.Total_Fees || 'Total Fees'}
          required
        />
        <AmountField<FeeRowFormValues>
          name="paid"
          control={control}
          label={Text.Paid_Amount || 'Paid Amount'}
        />
        <AmountField<FeeRowFormValues>
          name="pending"
          control={control}
          label={Text.Pending || 'Pending (auto)'}
          disabled
        />
      </div>
    </div>
  )
}


interface DeleteConfirmModalProps {
  student: StudentFeeRecord
  isDeleting: boolean
  deletingFeeId: string | null
  onConfirm: () => void
  onCancel: () => void
  onDeleteSingleFee: (fee: FeeRowData) => void
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  student,
  isDeleting,
  deletingFeeId,
  onConfirm,
  onCancel,
  onDeleteSingleFee,
}) => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40"
        onClick={!isDeleting ? onCancel : undefined}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
          <div className="p-6 border-b flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <IconField name="FaTrash" size={16} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{Text.Delete_Student_Fees}</h2>
                <p className="text-sm text-red-500 font-medium mt-0.5">
                  {Text.This_Action_Cannot_Be_Undone}
                </p>
              </div>
            </div>
            {!isDeleting && (
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              >
                <IconField name="FaTimes" size={18} />
              </button>
            )}
          </div>

          <div className="px-6 pt-5 pb-2 overflow-y-auto max-h-[60vh]">
            <p className="text-sm text-gray-600 mb-4">{Text.Delete_Student_Fees_Confirmation}</p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{Text.Student_Name || 'Student Name'}</span>
                <span className="font-semibold text-gray-800">{student.studentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{Text.Admission_No || 'Admission No'}</span>
                <span className="font-medium text-gray-700">{student.admissionNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {Text.Class || 'Class'} / {NameText.Section || 'Section'}
                </span>
                <span className="font-medium text-gray-700">
                  {student.class}
                  {student.section ? ` — ${student.section}` : ''}
                </span>
              </div>
            </div>

            {student.hasFees ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {Text.Fee_Records}
                </p>
                <div className="space-y-2">
                  {student.feesList.map((fee, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {fee.feeTypeName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {Text.Total || 'Total'}:{' '}
                          <span className="text-blue-600 font-medium">₹{fee.totalFees}</span>
                          &nbsp;·&nbsp;{Text.Paid || 'Paid'}:{' '}
                          <span className="text-green-600 font-medium">₹{fee.paid}</span>
                          &nbsp;·&nbsp;{Text.Pending || 'Pending'}:{' '}
                          <span className="text-red-500 font-medium">₹{fee.pending}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteSingleFee(fee)}
                        disabled={
                          isDeleting ||
                          deletingFeeId === fee.feesId ||
                          !fee.feesId ||
                          fee.feesId === '0'
                        }
                        className={`ml-3 p-1.5 rounded-lg transition-all flex items-center justify-center shrink-0
                          ${
                            isDeleting || deletingFeeId === fee.feesId
                              ? 'bg-red-100 text-red-300 cursor-not-allowed'
                              : !fee.feesId || fee.feesId === '0'
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 cursor-pointer'
                          }`}
                      >
                        {deletingFeeId === fee.feesId ? (
                          <IconField name="FaSpinner" size={12} className="animate-spin" />
                        ) : (
                          <IconField name="FaTrash" size={12} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-sm border-t border-gray-200 pt-3">
                  <span className="text-gray-500 font-medium">{Text.Total || 'Total'}</span>
                  <span className="font-bold text-blue-700">₹{student.totalFees}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                <IconField name="FaExclamationTriangle" size={14} />
                <span>This student has no fees assigned.</span>
              </div>
            )}
          </div>

          <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
            <Button
              name={Text.Cancel || 'Cancel'}
              loading={false}
              onClick={onCancel}
              isDisable={isDeleting}
            />
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting || !student.hasFees}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                ${
                  isDeleting || !student.hasFees
                    ? 'bg-red-200 text-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                }`}
            >
              {isDeleting ? (
                <>
                  <IconField name="FaSpinner" size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconField name="FaTrash" size={14} />
                  {student.hasFees ? Text.Yes_Delete_All_Fees : Text.No_Fees_To_Delete}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
interface SingleFeeDeleteModalProps {
  fee: FeeRowData
  studentName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

const SingleFeeDeleteModal: React.FC<SingleFeeDeleteModalProps> = ({
  fee,
  studentName,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/40 z-[60]"
        onClick={!isDeleting ? onCancel : undefined}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col">
          <div className="p-5 border-b flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <IconField name="FaTrash" size={14} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Delete Fee Record</h2>
                <p className="text-xs text-red-500 font-medium mt-0.5">This cannot be undone</p>
              </div>
            </div>
            {!isDeleting && (
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-3"
              >
                <IconField name="FaTimes" size={16} />
              </button>
            )}
          </div>

          <div className="p-5">
            <p className="text-sm text-gray-600 mb-3">
              Are you sure you want to delete the following fee for{' '}
              <span className="font-semibold text-gray-800">{studentName}</span>?
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{Text.Fee_Type || 'Fee Type'}</span>
                <span className="font-semibold text-gray-800">{fee.feeTypeName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{Text.Total_Fees || 'Total Fees'}</span>
                <span className="font-semibold text-blue-700">₹{fee.totalFees}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{Text.Paid || 'Paid'}</span>
                <span className="font-semibold text-green-700">₹{fee.paid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{Text.Pending || 'Pending'}</span>
                <span className="font-semibold text-red-600">₹{fee.pending}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
            <Button
              name={Text.Cancel || 'Cancel'}
              loading={false}
              onClick={onCancel}
              isDisable={isDeleting}
            />
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                ${
                  isDeleting
                    ? 'bg-red-200 text-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                }`}
            >
              {isDeleting ? (
                <>
                  <IconField name="FaSpinner" size={13} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconField name="FaTrash" size={13} />
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const AddStudentFees: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)
  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm,
    watch: watchSearch,
    setValue: setSearchValue,
  } = useForm<SearchFormInputs>({
    defaultValues: { classId: '', sectionId: '', search: '', rollNo: '' },
  })

  const { data: classesData } = useSchoolClasses()
  const { data: feeTypesData } = useFeeTypes()

  const watchedClassId = watchSearch('classId')
  const selectedClassIdNum = useMemo(
    () => (watchedClassId ? Number(watchedClassId) : 0),
    [watchedClassId],
  )

  const { data: sectionsData, isLoading: isLoadingSections } = useSections(
    selectedClassIdNum > 0 ? selectedClassIdNum : 0,
  )

  const {
    students: filteredStudents,
    isSearching,
    hasSearched,
    search,
    clearSearch,
    saveFees,
    isSaving,
    deleteStudentFees,
    isDeleting,
    deleteSingleFee,
    isDeletingSingleFee,
  } = useStudentFee()

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeRecord | null>(null)
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<string[]>([])
  const [feesFormData, setFeesFormData] = useState<Record<string, FeeRowData>>({})

  const [deleteStudent, setDeleteStudent] = useState<StudentFeeRecord | null>(null)
  const [deleteSingleFeeTarget, setDeleteSingleFeeTarget] = useState<FeeRowData | null>(null)
  // tracks which single fee is mid-delete (for spinner in DeleteConfirmModal list)
  const [deletingFeeId, setDeletingFeeId] = useState<string | null>(null)

  const modalClassId = selectedStudent ? Number(selectedStudent.classId) || 0 : 0

  const allFeeTypeIds = useMemo(
    () => feeTypesData?.map((ft: any) => parseInt(ft.id || ft.feeTypeId, 10)) || [],
    [feeTypesData],
  )

  const { data: classFees, isLoading: isLoadingClassFees } = useGetClassFees(
    { feeTypeIds: allFeeTypeIds, schoolClassId: modalClassId },
    // fetch as soon as a student is selected AND fee types are loaded
    modalClassId > 0 && allFeeTypeIds.length > 0,
  )

  useEffect(() => {
    setSearchValue('sectionId', '')
  }, [watchedClassId, setSearchValue])

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: String(c.id || c.schoolClassId),
      })) || [],
    [classesData],
  )

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((s: any) => ({
        label: s.name || s.sectionName,
        value: String(s.id || s.sectionId),
      })) || [],
    [sectionsData],
  )

  const onSearch: SubmitHandler<SearchFormInputs> = async (data) => {
    if (!data.classId) {
      toast.warning('Please select a class first')
      return
    }
    setPage(0)
    const params: any = { schoolClassId: Number(data.classId) }
    if (data.sectionId) params.sectionId = Number(data.sectionId)
    if (data.search?.trim()) params.searchQuery = data.search.trim()
    await search(params)
  }

  const handleClearFilters = () => {
    resetSearchForm()
    clearSearch()
    setPage(0)
  }

  const openModal = useCallback((mode: 'add' | 'edit' | 'view', student: StudentFeeRecord) => {
    if (!student.id || student.id === '') {
      toast.error('Invalid student ID. Cannot open fees modal.')
      return
    }
    setModalMode(mode)
    setSelectedStudent(student)

    if (mode === 'view') {
      setSelectedFeeTypes([])
      setFeesFormData({})
      return
    }

    if (student.feesList.length > 0) {
      const types = student.feesList.map((f) => f.feeTypeId).filter(Boolean)
      const data: Record<string, FeeRowData> = {}
      student.feesList.forEach((f) => {
        data[f.feeTypeId] = { ...f }
      })
      setSelectedFeeTypes(types)
      setFeesFormData(data)
    } else {
      setSelectedFeeTypes([])
      setFeesFormData({})
    }
  }, [])

  const closeModal = useCallback(() => {
    setModalMode(null)
    setSelectedStudent(null)
    setSelectedFeeTypes([])
    setFeesFormData({})
  }, [])

  const handleFeeTypeToggle = useCallback(
    (feeTypeId: string) => {
      if (modalMode === 'view') return

      setSelectedFeeTypes((prev) => {
        if (prev.includes(feeTypeId)) {
          setFeesFormData((fd) => {
            const updated = { ...fd }
            delete updated[feeTypeId]
            return updated
          })
          return prev.filter((id) => id !== feeTypeId)
        }

        const existingFee = selectedStudent?.feesList.find((f) => f.feeTypeId === feeTypeId)
        const classFee = classFees?.find((cf: any) => String(cf.feesTypeId) === feeTypeId)
        const feeTypeName =
          feeTypesData?.find((ft: any) => String(ft.id || ft.feeTypeId) === feeTypeId)?.name || ''

        const amount = existingFee?.totalFees || (classFee ? String(classFee.fee) : '')
        const paid = existingFee?.paid || '0'
        const pending = String(Math.max(0, (parseFloat(amount) || 0) - (parseFloat(paid) || 0)))

        setFeesFormData((fd) => ({
          ...fd,
          [feeTypeId]: {
            feeTypeId,
            feeTypeName,
            totalFees: amount,
            paid,
            pending,
            classFeesId: existingFee?.classFeesId || String(classFee?.classFeesId || ''),
            feesId: existingFee?.feesId || '',
          },
        }))
        return [...prev, feeTypeId]
      })
    },
    [modalMode, selectedStudent, classFees, feeTypesData],
  )

  const updateFeeField = useCallback(
    (feeTypeId: string, field: 'totalFees' | 'paid', value: string) => {
      setFeesFormData((prev) => {
        const row = { ...((prev[feeTypeId] || {}) as FeeRowData), [field]: value }
        const total = parseFloat(field === 'totalFees' ? value : row.totalFees) || 0
        const paid = parseFloat(field === 'paid' ? value : row.paid) || 0
        row.pending = Math.max(0, total - paid).toFixed(2)
        return { ...prev, [feeTypeId]: row }
      })
    },
    [],
  )

  const handleSaveFees = async (_e?: React.FormEvent): Promise<void> => {
    if (!selectedStudent) { toast.error('No student selected'); return }

    const studentId = String(selectedStudent.id)
    if (!studentId || studentId === 'undefined' || studentId === 'null' || studentId === '') {
      toast.error('Invalid student ID. Cannot save fees.'); return
    }
    if (selectedFeeTypes.length === 0) {
      toast.warning('Please select at least one fee type'); return
    }
    for (const feeTypeId of selectedFeeTypes) {
      const row = feesFormData[feeTypeId]
      if (!row?.totalFees || parseFloat(row.totalFees) <= 0) {
        toast.warning(`Please enter Total Fees for "${row?.feeTypeName || feeTypeId}"`); return
      }
    }

    const newFeeTypes: string[] = []
    const updateFeeTypes: string[] = []
    selectedFeeTypes.forEach((feeTypeId) => {
      const feesId = feesFormData[feeTypeId]?.feesId
      const parsed = feesId && feesId !== '' && feesId !== '0' ? parseInt(feesId, 10) : null
      if (parsed && parsed > 0) updateFeeTypes.push(feeTypeId)
      else newFeeTypes.push(feeTypeId)
    })

    const toPayload = (feeTypeId: string, includeFeesId: boolean) => {
      const row = feesFormData[feeTypeId]
      return {
        studentId,
        feeTypeId: parseInt(feeTypeId, 10),
        totalFees: parseFloat(row.totalFees),
        paid: parseFloat(row.paid || '0'),
        fine: null,
        classFeesId:
          row?.classFeesId && row.classFeesId !== '' && row.classFeesId !== '0'
            ? parseInt(row.classFeesId, 10)
            : null,
        feesId: includeFeesId ? parseInt(row.feesId, 10) : null,
      }
    }

    const resolvedFeesList: FeeRowData[] = selectedFeeTypes.map((feeTypeId) => {
      const row = feesFormData[feeTypeId]
      return {
        feeTypeId: String(feeTypeId),
        feeTypeName:
          row?.feeTypeName ||
          feeTypesData?.find((ft: any) => String(ft.id || ft.feeTypeId) === feeTypeId)?.name ||
          'Fee',
        totalFees: row?.totalFees || '0',
        paid: row?.paid || '0',
        pending: row?.pending || '0',
        classFeesId: row?.classFeesId || '',
        feesId: row?.feesId || '',
      }
    })

    try {
      const allFees = [
        ...newFeeTypes.map((id) => toPayload(id, false)),
        ...updateFeeTypes.map((id) => toPayload(id, true)),
      ]
      const result = await saveFees({ studentId, fees: allFees }, resolvedFeesList)
      if (result.successCount > 0) closeModal()
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to save fees'
      toast.error(errorMsg)
    }
  }

  const openDeleteModal = useCallback((student: StudentFeeRecord) => {
    if (!student.id || student.id === '') {
      toast.error('Invalid student ID. Cannot delete fees.')
      return
    }
    setDeleteStudent(student)
  }, [])

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) return
    setDeleteStudent(null)
  }, [isDeleting])

  const handleDeleteConfirm = async () => {
    if (!deleteStudent) return
    try {
      await deleteStudentFees(String(deleteStudent.id), deleteStudent.studentName)
      setDeleteStudent(null)
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete fees'
      toast.error(errorMsg)
    }
  }

  const openSingleFeeDeleteModal = useCallback((fee: FeeRowData) => {
    if (!fee.feesId || fee.feesId === '' || fee.feesId === '0') {
      toast.warning('No fee ID found for this fee record. Cannot delete.')
      return
    }
    setDeleteSingleFeeTarget(fee)
  }, [])

  const closeSingleFeeDeleteModal = useCallback(() => {
    if (isDeletingSingleFee) return
    setDeleteSingleFeeTarget(null)
  }, [isDeletingSingleFee])

  const handleSingleFeeDeleteConfirm = async () => {
    if (!deleteSingleFeeTarget) return

    const fee = deleteSingleFeeTarget
    const studentId = selectedStudent
      ? String(selectedStudent.id)
      : deleteStudent
        ? String(deleteStudent.id)
        : null

    if (!studentId) return toast.error('Cannot identify student for this fee.')

    setDeletingFeeId(fee.feesId)
    try {
      await deleteSingleFee(fee, studentId)

      if (deleteStudent && String(deleteStudent.id) === studentId) {
        setDeleteStudent((prev) => {
          if (!prev) return prev
          const newFeesList = prev.feesList.filter((f) => f.feesId !== fee.feesId)
          const totals = newFeesList.reduce(
            (acc, f) => ({
              totalFees: (parseFloat(acc.totalFees) + (parseFloat(f.totalFees) || 0)).toFixed(2),
              totalPaid: (parseFloat(acc.totalPaid) + (parseFloat(f.paid) || 0)).toFixed(2),
              totalPending: (
                parseFloat(acc.totalPending) + (parseFloat(f.pending) || 0)
              ).toFixed(2),
            }),
            { totalFees: '0', totalPaid: '0', totalPending: '0' },
          )
          return { ...prev, feesList: newFeesList, ...totals, hasFees: newFeesList.length > 0 }
        })
      }

      if (selectedStudent && String(selectedStudent.id) === studentId) {
        setSelectedStudent((prev) => {
          if (!prev) return prev
          const newFeesList = prev.feesList.filter((f) => f.feesId !== fee.feesId)
          const totals = newFeesList.reduce(
            (acc, f) => ({
              totalFees: (parseFloat(acc.totalFees) + (parseFloat(f.totalFees) || 0)).toFixed(2),
              totalPaid: (parseFloat(acc.totalPaid) + (parseFloat(f.paid) || 0)).toFixed(2),
              totalPending: (
                parseFloat(acc.totalPending) + (parseFloat(f.pending) || 0)
              ).toFixed(2),
            }),
            { totalFees: '0', totalPaid: '0', totalPending: '0' },
          )
          return { ...prev, feesList: newFeesList, ...totals, hasFees: newFeesList.length > 0 }
        })
      }

      setDeleteSingleFeeTarget(null)
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.message || 'Failed to delete fee'
      toast.error(errorMsg)
    } finally {
      setDeletingFeeId(null)
    }
  }

  const paginatedStudents = useMemo(() => {
    const start = page * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))

  const columns = [
    { label: Text.Admission_No || 'Admission No', key: 'admissionNo' as keyof StudentFeeRecord },
    { label: Text.Student_Name || 'Student Name', key: 'studentName' as keyof StudentFeeRecord },
    { label: Text.Roll_Number || 'Roll No', key: 'rollNo' as keyof StudentFeeRecord },
    { label: Text.Class || 'Class', key: 'class' as keyof StudentFeeRecord },
    { label: NameText.Section || 'Section', key: 'section' as keyof StudentFeeRecord },
    { label: Text.Father_Name || 'Father Name', key: 'fatherName' as keyof StudentFeeRecord },
    { label: Text.Total_Fees || 'Total Fees (₹)', key: 'totalFees' as keyof StudentFeeRecord },
    { label: Text.Paid || 'Paid (₹)', key: 'totalPaid' as keyof StudentFeeRecord },
    { label: Text.Pending || 'Pending (₹)', key: 'totalPending' as keyof StudentFeeRecord },
  ]

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      {/* page header */}
      <div className="p-4 bg-gray-50 border-b rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">{Text.Add_Student_Fees}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {Text.Search_Students_To_Assign_Or_Update_Fees}
        </p>
      </div>

      {/* search form */}
      <AllSchoolDropdown
        onSubmit={handleSearchSubmit(onSearch) as (e: React.FormEvent) => Promise<void>}
        queryKeys={['sections', 'schoolClasses']}
        className="rounded-lg bg-white mb-4 p-4 shadow-sm border border-gray-100"
      >
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Dropdown
            label={Text.Class || 'Class'}
            name="classId"
            control={searchControl}
            required
            options={classOptions}
          />
          <Dropdown
            label={NameText.Section || 'Section'}
            name="sectionId"
            control={searchControl}
            options={
              !selectedClassIdNum
                ? [{ label: 'Please select a class first', value: '' }]
                : isLoadingSections
                  ? [{ label: 'Loading sections...', value: '' }]
                  : sectionOptions.length === 0
                    ? [{ label: 'No sections available', value: '' }]
                    : sectionOptions
            }
          />
          <TextField
            label={Text.Name_Admission_No || 'Name / Admission No'}
            name="search"
            control={searchControl}
            placeholder={Text.Enter_Name_Or_Admission_No || 'Enter name or admission no.'}
          />
          <TextField
            label={Text.Roll_Number || 'Roll No'}
            name="rollNo"
            control={searchControl}
            placeholder={Text.Enter_Roll_Number || 'Enter roll number'}
          />
        </div>

        <div className="px-4 pb-4 flex justify-end gap-2">
          {hasSearched && (
            <Button
              name="Clear"
              icon={<IconField name="FaTimes" size={16} />}
              onClick={handleClearFilters}
              loading={false}
              showAlways={true}
            />
          )}
          <Button
            name={Text.Search || 'Search'}
            icon={<IconField name="FaSearch" />}
            loading={isSearching}
            showAlways={true}
          />
        </div>
      </AllSchoolDropdown>

      {/* searching indicator */}
      {isSearching && (
        <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
          <IconField name="FaSpinner" size={14} className="animate-spin" />
          <span>{Text.Searching_Records_On_Server || 'Searching students on server...'}</span>
        </div>
      )}

      {/* results table */}
      {hasSearched && !isSearching && (
        <div className="mt-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-700">
              {Text.Student_List || 'Student List'}
            </h2>
          </div>

          <ControlledTable
            columns={columns}
            data={paginatedStudents}
            fullData={filteredStudents}
            title={Text.Student_Fees}
            btn={false}
            header={false}
            showSearch={false}
            forceShowActions={true}
            showExport={true}
            showSelectAll={false}
            enablePermissions={true}
            permissionScope="FEES"
            actionColumn={true}
            exportFilename="Add Student Fees"
            exportTitle="Add Student Fees Report"
            onAdd={(id: string | number) => {
              const s = filteredStudents.find((st) => String(st.id) === String(id))
              if (s) openModal('add', s)
            }}
            onEdit={(id: string | number) => {
              const s = filteredStudents.find((st) => String(st.id) === String(id))
              if (s) openModal('edit', s)
            }}
            onDelete={(id: string | number) => {
              const s = filteredStudents.find((st) => String(st.id) === String(id))
              if (s) openDeleteModal(s)
            }}
            onRowClick={(row: StudentFeeRecord) => openModal('view', row)}
            rowClassName="cursor-pointer hover:bg-gray-50 transition-colors"
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={filteredStudents.length}
            serverPageSize={pageSize}
            onServerPageChange={(p: number) => setPage(p)}
            onServerPageSizeChange={(s: number) => {
              setPageSize(s)
              setPage(0)
            }}
          />
        </div>
      )}

      {deleteStudent && (
        <DeleteConfirmModal
          student={deleteStudent}
          isDeleting={isDeleting}
          deletingFeeId={deletingFeeId}
          onConfirm={handleDeleteConfirm}
          onCancel={closeDeleteModal}
          onDeleteSingleFee={openSingleFeeDeleteModal}
        />
      )}

      {modalMode && selectedStudent && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={closeModal} />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* modal header */}
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                      modalMode === 'view'
                        ? 'bg-blue-100 text-blue-700'
                        : modalMode === 'edit'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {modalMode === 'view'
                      ? Text.View_Fees
                      : modalMode === 'edit'
                        ? Text.Edit_Fees
                        : Text.Add_Fees}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">
                    {selectedStudent.studentName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedStudent.class}
                    {selectedStudent.section ? ` — ${selectedStudent.section}` : ''}
                    &nbsp;|&nbsp; Roll: {selectedStudent.rollNo || 'N/A'}
                    &nbsp;|&nbsp; Adm: {selectedStudent.admissionNo}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4 mt-1"
                >
                  <IconField name="FaTimes" size={20} />
                </button>
              </div>

              {/* modal body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* ── view mode ── */}
                {modalMode === 'view' && (
                  <div>
                    {selectedStudent.feesList.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-5xl mb-3">💰</div>
                        <p className="text-sm font-medium">No fees assigned yet</p>
                        <p className="text-xs mt-1">
                          Click &quot;Edit Fees&quot; to add fees for this student
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              {Text.Total_Fees || 'Total Fees'}
                            </p>
                            <p className="text-xl font-bold text-blue-800">
                              ₹{selectedStudent.totalFees}
                            </p>
                          </div>
                          <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                            <p className="text-xs text-green-600 font-medium mb-1">
                              {Text.Paid || 'Paid'}
                            </p>
                            <p className="text-xl font-bold text-green-800">
                              ₹{selectedStudent.totalPaid}
                            </p>
                          </div>
                          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                            <p className="text-xs text-red-600 font-medium mb-1">
                              {Text.Pending || 'Pending'}
                            </p>
                            <p className="text-xl font-bold text-red-800">
                              ₹{selectedStudent.totalPending}
                            </p>
                          </div>
                        </div>

                        <h4 className="text-sm font-semibold text-gray-600 mb-2">
                          {Text.Fee_Breakdown}
                        </h4>
                        <div className="space-y-2">
                          {selectedStudent.feesList.map((fee, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <span className="text-sm font-medium text-gray-700 w-1/4 shrink-0">
                                {fee.feeTypeName}
                              </span>
                              <div className="flex gap-4 text-sm flex-1 justify-end items-center">
                                <span className="text-gray-500">
                                  {Text.Total || 'Total'}:{' '}
                                  <span className="font-semibold text-gray-700">
                                    ₹{fee.totalFees}
                                  </span>
                                </span>
                                <span className="text-green-600">
                                  {Text.Paid || 'Paid'}:{' '}
                                  <span className="font-semibold">₹{fee.paid}</span>
                                </span>
                                <span className="text-red-500">
                                  {Text.Pending || 'Pending'}:{' '}
                                  <span className="font-semibold">₹{fee.pending}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openSingleFeeDeleteModal(fee)}
                                  disabled={
                                    !fee.feesId || fee.feesId === '0' || fee.feesId === ''
                                  }
                                  className={`ml-1 p-1.5 rounded-lg transition-all flex items-center justify-center shrink-0
                                    ${
                                      !fee.feesId || fee.feesId === '0' || fee.feesId === ''
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        : 'bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 cursor-pointer border border-red-100 hover:border-red-300'
                                    }`}
                                >
                                  <IconField name="FaTrash" size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {(modalMode === 'add' || modalMode === 'edit') && (
                  <AllSchoolDropdown onSubmit={handleSaveFees}>
                    <div>
                      <div className="mb-5">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          {Text.Select_Fee_Types}
                        </p>
                        {isLoadingClassFees && (
                          <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                            Loading class fees...
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {feeTypesData?.map((feeType: any) => {
                            const feeTypeId = String(feeType.id || feeType.feeTypeId)
                            const isChecked = selectedFeeTypes.includes(feeTypeId)
                            const classFee = classFees?.find(
                              (cf: any) => String(cf.feesTypeId) === feeTypeId,
                            )
                            return (
                              <label
                                key={feeTypeId}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors select-none ${
                                  isChecked
                                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleFeeTypeToggle(feeTypeId)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium">
                                  {feeType.name || feeType.feeTypeName}
                                </span>
                                {classFee && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    ₹{classFee.fee}
                                  </span>
                                )}
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {selectedFeeTypes.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-600">
                            {Text.Fee_Details}
                          </h4>
                          {selectedFeeTypes.map((feeTypeId) => {
                            const row = feesFormData[feeTypeId] || ({} as FeeRowData)
                            const feeType = feeTypesData?.find(
                              (ft: any) => String(ft.id || ft.feeTypeId) === feeTypeId,
                            )
                            return (
                              <FeeRowForm
                                key={feeTypeId}
                                feeTypeId={feeTypeId}
                                feeTypeName={feeType?.name || feeType?.feeTypeName || 'Fee'}
                                row={row}
                                onFieldChange={updateFeeField}
                              />
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm">Select fee types above to enter fee details</p>
                        </div>
                      )}
                    </div>
                  </AllSchoolDropdown>
                )}
              </div>

              {/* modal footer */}
              <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                {modalMode === 'view' ? (
                  <>
                    <Button name={Text.Cancel} loading={false} onClick={closeModal} />
                    <Button
                      name={Text.Edit_Fees}
                      icon={<IconField name="FaEdit" />}
                      loading={false}
                      onClick={() => {
                        const s = selectedStudent!
                        closeModal()
                        setTimeout(() => openModal('edit', s), 50)
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Button name={Text.Cancel} loading={false} onClick={closeModal} />
                    <Button
                      name={
                        isSaving
                          ? 'Saving...'
                          : modalMode === 'edit'
                            ? Text.Edit_Fees
                            : Text.Add_Fees
                      }
                      icon={<IconField name="FaSave" />}
                      loading={isSaving}
                      isDisable={selectedFeeTypes.length === 0 || isSaving}
                      onClick={handleSaveFees}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* single fee delete confirmation modal */}
      {deleteSingleFeeTarget && (
        <SingleFeeDeleteModal
          fee={deleteSingleFeeTarget}
          studentName={(selectedStudent ?? deleteStudent)?.studentName ?? ''}
          isDeleting={isDeletingSingleFee}
          onConfirm={handleSingleFeeDeleteConfirm}
          onCancel={closeSingleFeeDeleteModal}
        />
      )}
    </div>
  )
}

export default AddStudentFees
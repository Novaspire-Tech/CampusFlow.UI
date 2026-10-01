import { useState, useEffect, useMemo, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import {
  Button,
  Dropdown,
  FutureDateField,
  PastDateField,
  NumberField,
} from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import {
  useBookIssueReturns,
  useFilterBookIssueReturns,
  useAddBookIssueReturn,
  useUpdateBookIssueReturn,
  useDeleteBookIssueReturn,
  useDeleteMultipleBookIssueReturns,
} from '../../../hooks/queries/library/useBookIssueReturn'
import { useListBooks } from '../../../hooks/queries/library/useBookList'
import { useAddStudentMembers } from '../../../hooks/queries/library/useAddStudent'
import { useAddStaffMembers } from '../../../hooks/queries/library/useAddStaff'
import type { BookIssueReturnFormData } from '../../../types/library/bookIssueReturn'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface IssueReturnFormData {
  libraryCardId: string
  bookId: string
  memberType: 'STUDENT' | 'STAFF'
  issueDate: string
  returnDate: string
  fine: number
  submitStatus: 'PENDING' | 'SUBMIT'
  submitDate?: string
}

// ✅ Moved outside component — pure functions, no closure needed
const memberTypeOptions = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Staff', value: 'STAFF' },
]

const submitStatusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Submit', value: 'SUBMIT' },
]

const getIssueStatus = (item: {
  submitStatus?: string
  isReturned?: boolean
  returnDate: string
}) => {
  if (item.submitStatus === 'SUBMIT' || item.isReturned)
    return { status: 'Returned', color: 'text-green-600 bg-green-100' }
  const today = new Date()
  const returnDate = new Date(item.returnDate)
  if (returnDate < today) return { status: 'Overdue', color: 'text-red-600 bg-red-100' }
  const daysUntilDue = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  if (daysUntilDue <= 2) return { status: 'Due Soon', color: 'text-amber-600 bg-amber-100' }
  return { status: 'Issued', color: 'text-blue-600 bg-blue-100' }
}

const getSubmitStatus = (item: { submitStatus?: string }) =>
  item.submitStatus === 'SUBMIT'
    ? { status: 'Submitted', color: 'text-green-600 bg-green-100' }
    : { status: 'Pending', color: 'text-amber-600 bg-amber-100' }

const toApiFormat = (data: IssueReturnFormData): BookIssueReturnFormData =>
  ({
    ...data,
    issueStatus: data.submitStatus === 'SUBMIT' ? 'RETURNED' : 'ISSUED',
    isReturned: data.submitStatus === 'SUBMIT',
    submitDate: data.submitStatus === 'SUBMIT' ? data.submitDate : undefined,
  }) as BookIssueReturnFormData

export default function IssueReturn() {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [memberTypeFilter, setMemberTypeFilter] = useState<'ALL' | 'STUDENT' | 'STAFF'>('ALL')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: issueReturnsResponse, isLoading } = useBookIssueReturns(0, 10000)
  const allIssueReturns = issueReturnsResponse?.bookIssueReturns ?? []

  const { data: filteredResponse, isFetching: isSearching } = useFilterBookIssueReturns(
    debouncedSearch,
    0,
    10000,
  )
  const filteredBySearch = filteredResponse?.bookIssueReturns ?? []

  const { data: books = [] } = useListBooks()
  const { data: students = [] } = useAddStudentMembers()
  const { data: staff = [] } = useAddStaffMembers()
  const addMutation = useAddBookIssueReturn()
  const updateMutation = useUpdateBookIssueReturn()
  const deleteMutation = useDeleteBookIssueReturn()
  const deleteMultipleMutation = useDeleteMultipleBookIssueReturns()

  const { control, handleSubmit, reset, setValue, watch } = useForm<IssueReturnFormData>({
    defaultValues: {
      libraryCardId: '',
      bookId: '',
      memberType: 'STUDENT',
      issueDate: '',
      returnDate: '',
      fine: 0,
      submitStatus: 'PENDING',
      submitDate: '',
    },
  })

  const selectedMemberType = watch('memberType')
  const selectedSubmitStatus = watch('submitStatus')

  const libraryCardOptions =
    selectedMemberType === 'STAFF'
      ? staff.map((s) => ({ label: `${s.libraryCardNo} - ${s.firstName}`, value: String(s.id) }))
      : students.map((s) => ({
          label: `${s.libraryCardNo} - ${s.studentName}`,
          value: String(s.id),
        }))

  const bookOptions = books.map((b) => ({ label: b.bookTitle, value: String(b.id) }))

  // ✅ isSearchActive inlined into sourceData
  const sourceData = debouncedSearch.trim().length > 0 ? filteredBySearch : allIssueReturns

  const allFilteredRows = useMemo(
    () =>
      sourceData
        .filter((item) => memberTypeFilter === 'ALL' || item.memberType === memberTypeFilter)
        .map((item) => {
          const issueStatus = getIssueStatus(item)
          const submitStatus = getSubmitStatus(item)
          return {
            id: item.id,
            libraryCardNo: item.libraryCardNo,
            memberName: item.memberName,
            bookTitle: item.bookTitle,
            issueDate: item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '-',
            returnDate: item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '-',
            fine: item.fine ? `₹${item.fine}` : '₹0',
            submitDate: item.submitDate ? new Date(item.submitDate).toLocaleDateString() : '-',
            status: { value: issueStatus.status, color: issueStatus.color },
            submitStatus: { value: submitStatus.status, color: submitStatus.color },
          }
        }),
    [sourceData, memberTypeFilter],
  )

  const totalItems = allFilteredRows.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const pagedData = useMemo(() => {
    const start = page * pageSize
    return allFilteredRows.slice(start, start + pageSize)
  }, [allFilteredRows, page, pageSize])

  useEffect(() => {
    setPage(0)
  }, [memberTypeFilter])

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const memberNameColumnLabel =
    memberTypeFilter === 'STUDENT'
      ? Text.Student_Name
      : memberTypeFilter === 'STAFF'
        ? Text.Staff_Name
        : Text.Members

  const columns = [
    { label: Text.Library_Card_No, key: 'libraryCardNo' },
    { label: memberNameColumnLabel, key: 'memberName' },
    { label: Text.Book_Title, key: 'bookTitle' },
    { label: Text.Issue_Date, key: 'issueDate' },
    { label: Text.Return_Date, key: 'returnDate' },
    { label: Text.Fine, key: 'fine' },
    {
      label: Text.Issue_Status,
      key: 'status',
      render: (value: { value: string; color: string }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value.color}`}>
          {value.value}
        </span>
      ),
    },
    {
      label: Text.Submit_Status,
      key: 'submitStatus',
      render: (value: { value: string; color: string }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value.color}`}>
          {value.value}
        </span>
      ),
    },
    { label: Text.Submit_Date, key: 'submitDate' },
  ]

  const onSubmit: SubmitHandler<IssueReturnFormData> = async (data) => {
    try {
      if (!data.libraryCardId) { toast.error('Please select a library card'); return }
      if (!data.bookId) { toast.error('Please select a book'); return }
      if (!data.issueDate) { toast.error('Please select an issue date'); return }
      if (!data.returnDate) { toast.error('Please select a return date'); return }
      if (new Date(data.returnDate) <= new Date(data.issueDate)) {
        toast.error('Return date must be after issue date')
        return
      }
      if (data.fine < 0) { toast.error('Fine amount cannot be negative'); return }
      if (data.submitStatus === 'SUBMIT' && !data.submitDate) {
        toast.error('Please select a submit date')
        return
      }

      const selectedBook = books.find((b) => String(b.id) === String(data.bookId))
      const bookTitle = selectedBook?.bookTitle ?? 'Book'

      let memberName = 'Member'
      if (data.memberType === 'STAFF') {
        const s = staff.find((x) => String(x.id) === String(data.libraryCardId))
        memberName = s?.email ?? 'Staff member'
      } else {
        const s = students.find((x) => String(x.id) === String(data.libraryCardId))
        memberName = s?.studentName ?? 'Student'
      }

      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: toApiFormat(data) })
        toast.success(`Book issue record for "${bookTitle}" updated successfully!`)
      } else {
        await addMutation.mutateAsync(toApiFormat(data))
        toast.success(`Book "${bookTitle}" issued to ${memberName} successfully!`)
      }

      reset()
      setEditId(null)
      setShowFormModal(false)
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } }
        message?: string
      }
      const status = err?.response?.status
      const msg = (err?.response?.data?.message ?? err?.message ?? '').toLowerCase()

      if (status === 400) {
        if (msg.includes('already issued'))
          toast.error('This book is already issued and not yet returned')
        else if (msg.includes('not available'))
          toast.error('This book is not available for issue')
        else if (msg.includes('invalid date'))
          toast.error('Invalid date. Please check issue and return dates')
        else
          toast.error(
            msg !== ''
              ? (err?.response?.data?.message ?? msg)
              : 'Invalid data. Please check all fields.',
          )
      } else if (status === 404) {
        toast.error('Book or member not found. Please refresh and try again.')
      } else {
        toast.error(err?.message ?? 'Operation failed. Please try again.')
      }
    }
  }

  const handleEdit = (id: string | number) => {
    const item = allIssueReturns.find((r) => String(r.id) === String(id))
    if (!item) {
      toast.error('Issue/return record not found')
      return
    }

    setValue('memberType', item.memberType as 'STUDENT' | 'STAFF')
    setValue('submitStatus', item.submitStatus ?? 'PENDING')
    setValue('fine', item.fine ?? 0)
    setValue('submitDate', item.submitDate ?? '')

    let memberId = ''
    if (item.memberType === 'STAFF') {
      const s = staff.find((s) => s.libraryCardNo === item.libraryCardNo)
      memberId = s ? String(s.id) : ''
    } else {
      const s = students.find((s) => s.libraryCardNo === item.libraryCardNo)
      memberId = s ? String(s.id) : ''
    }

    setTimeout(() => {
      setValue('libraryCardId', memberId)
      setValue('bookId', String(item.bookId))
      setValue('issueDate', item.issueDate)
      setValue('returnDate', item.returnDate)
    }, 0)

    setEditId(String(id))
    setShowFormModal(true)
  }

  const handleDelete = async (id: string | number) => {
    const item = allIssueReturns.find((r) => String(r.id) === String(id))
    if (!item) {
      toast.error('Issue/return record not found')
      return
    }
    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return
    try {
      await deleteMutation.mutateAsync(String(id))
      toast.success(`"${item.bookTitle}" deleted successfully!`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Failed to delete issue/return record.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!ids.length) {
      toast.warning('Please select at least one record to delete')
      return
    }
    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return
    try {
      await deleteMultipleMutation.mutateAsync(ids.map(Number))
      toast.success('Records deleted successfully!')
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Failed to delete issue/return records.')
    }
  }

  const handleCancel = () => {
    reset()
    setEditId(null)
    setShowFormModal(false)
  }

  const handleAddNew = () => {
    reset()
    setEditId(null)
    setShowFormModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">{Text.Loading}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-[#FFFCFC]">
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editId ? Text.Edit : Text.Add} {Text.Issue_Return}
            </h2>
            <AllSchoolDropdown
              onSubmit={handleSubmit(onSubmit)}
              queryKeys={['listBooks', 'addStudentMembers', 'addStaffMembers', 'bookIssueReturns']}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dropdown
                  name="memberType"
                  control={control}
                  label={Text.Member_Type}
                  options={memberTypeOptions}
                  required
                />
                <Dropdown
                  name="libraryCardId"
                  control={control}
                  label={Text.Library_Card_No}
                  options={libraryCardOptions}
                  required
                />
                <Dropdown
                  name="bookId"
                  control={control}
                  label={Text.Book_Title}
                  options={bookOptions}
                  required
                />
                <PastDateField
                  name="issueDate"
                  control={control}
                  label={Text.Issue_Date}
                  required
                />
                <FutureDateField
                  name="returnDate"
                  control={control}
                  label={Text.Return_Date}
                  required
                />
                <NumberField name="fine" control={control} label={Text.Fine} required />
                <Dropdown
                  name="submitStatus"
                  control={control}
                  label={Text.Status}
                  options={submitStatusOptions}
                  required
                />
                {selectedSubmitStatus === 'SUBMIT' && (
                  <PastDateField name="submitDate" control={control} label={Text.Submit_Date} />
                )}
              </div>

              <div className="flex items-center gap-2 px-1">
                <span className="text-sm text-gray-500">{Text.Issue_Status_will_be}:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedSubmitStatus === 'SUBMIT'
                      ? 'text-green-600 bg-green-100'
                      : 'text-blue-600 bg-blue-100'
                  }`}
                >
                  {selectedSubmitStatus === 'SUBMIT' ? 'Returned' : 'Issued'}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button name={Text.Cancel} onClick={handleCancel} loading={false} />
                <Button
                  name={editId ? Text.Update : Text.Save}
                  loading={addMutation.isPending || updateMutation.isPending}
                  icon={<IconField name="FaSave" />}
                  permissionScope="LIBRARY"
                  permissionType={editId ? 'UPDATE' : 'CREATE'}
                  enablePermissions={true}
                />
              </div>
            </AllSchoolDropdown>
          </div>
        </div>
      )}

      <div className="mb-4 px-6 pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium text-gray-700">{Text.Filter_by_Member_Type}:</label>
          <div className="flex gap-2">
            {(
              [
                { label: 'All', value: 'ALL' },
                { label: 'Student', value: 'STUDENT' },
                { label: 'Staff', value: 'STAFF' },
              ] as const
            ).map((type) => (
              <button
                key={type.value}
                onClick={() => setMemberTypeFilter(type.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  memberTypeFilter === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500" />
              <span>{Text.Loading}...</span>
            </div>
          )}
        </div>
      </div>

      <ControlledTable
        title={Text.Issue_Return}
        columns={columns}
        data={pagedData}
        fullData={pagedData}
        searchTerm={searchTerm}
        showSearch={true}
        btn={true}
        enablePermissions={true}
        permissionScope="LIBRARY"
        onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteMultiple={handleDeleteMultiple}
        showSelectAll
        btnName={Text.Add}
        showForm={handleAddNew}
        serverPage={page}
        serverTotalPages={totalPages}
        serverTotalItems={totalItems}
        serverPageSize={pageSize}
        onServerPageChange={handlePageChange}
        onServerPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
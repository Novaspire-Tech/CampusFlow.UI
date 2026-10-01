import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextAreaField from '../../../components/controlled/TextareaField'
import Dropdown from '../../../components/controlled/Dropdown'
import DateField from '../../../components/controlled/DateField'
import TimeField from '../../../components/controlled/TimeField'
import NameField from '../../../components/controlled/NameField'
import MobileField from '../../../components/controlled/MobileField'
import TextField from '../../../components/controlled/TextField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterVisitorBooks,
  useCreateVisitorBook,
  useUpdateVisitorBook,
  useDeleteVisitorBook,
  useDeleteMultipleVisitorBooks,
} from '../../../hooks/queries/frontOffice/useVisitorBook'
import { usePurposes } from '../../../hooks/queries/frontOffice/setupFrontOffice/usePurpose'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import type {
  VisitorBook as VisitorItem,
  VisitorBookSearchParams,
} from '../../../types/frontOffice/visitorBook'
import { EMPTY_SEARCH_PARAMS } from '../../../types/frontOffice/visitorBook'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const convertToDateInputFormat = (dateStr: string): string => {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }
  return dateStr
}

function VisitorBook() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t) as any

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy] = useState('date')
  const [sortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeFilters, setActiveFilters] = useState<VisitorBookSearchParams>(EMPTY_SEARCH_PARAMS)

  const {
    data: visitorsResponse,
    isLoading: visitorsLoading,
    isFetching,
    error: visitorsError,
  } = useFilterVisitorBooks(activeFilters, page, pageSize, sortBy, sortDirection)

  const { data: purposesData } = usePurposes()

  const createVisitor = useCreateVisitorBook()
  const updateVisitor = useUpdateVisitorBook()
  const deleteVisitor = useDeleteVisitorBook()
  const deleteMultipleVisitors = useDeleteMultipleVisitorBooks()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [activeView, setActiveView] = useState<'list' | 'details'>('list')
  const [detailsView, setDetailsView] = useState<VisitorItem | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      purposeId: '',
      visitorName: '',
      phone: '',
      meetingWith: '',
      numberOfPerson: '',
      date: '',
      inTime: '',
      outTime: '',
      note: '',
    },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterPurpose: '', filterSearch: '' },
  })

  const visitors: VisitorItem[] = visitorsResponse?.visitors ?? []
  const totalItems = visitorsResponse?.totalItems ?? 0
  const totalPages = visitorsResponse?.totalPages ?? 0

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: VisitorBookSearchParams = {}
    if (data.filterPurpose) params.purposeId = data.filterPurpose
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterPurpose: '', filterSearch: '' })
    setActiveFilters(EMPTY_SEARCH_PARAMS)
    setPage(0)
  }

  const resetForm = () => {
    reset({
      purposeId: '',
      visitorName: '',
      phone: '',
      meetingWith: '',
      numberOfPerson: '',
      date: '',
      inTime: '',
      outTime: '',
      note: '',
    })
    setEditingId(null)
  }

  const onSubmit = async (data: FieldValues) => {
    try {
      const payload = {
        purposeId: data.purposeId || '',
        visitorName: data.visitorName,
        phone: data.phone,
        meetingWith: data.meetingWith,
        numberOfPerson: data.numberOfPerson,
        date: data.date,
        inTime: data.inTime,
        outTime: data.outTime || '',
        note: data.note || '',
      }
      if (editingId) {
        await updateVisitor.mutateAsync({ id: editingId, data: payload })
        toast.success('Visitor updated successfully!')
      } else {
        await createVisitor.mutateAsync(payload)
        toast.success('Visitor created successfully!')
      }
      setEditingId(null)
      resetForm()
      setShowFormModal(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save visitor.')
      throw error
    }
  }

  const handleView = (id: string | number) => {
    const item = visitors.find((v) => v.id === id.toString())
    if (item) {
      setDetailsView(item)
      setActiveView('details')
    }
  }

  const handleEdit = (id: string | number) => {
    const item = visitors.find((v) => v.id === id.toString())
    if (!item) return
    setValue('purposeId', item.purposeId || '')
    setValue('visitorName', item.visitorName)
    setValue('phone', item.phone)
    setValue('meetingWith', item.meetingWith)
    setValue('numberOfPerson', item.numberOfPerson)
    setValue('date', convertToDateInputFormat(item.date))
    setValue('inTime', item.inTime)
    setValue('outTime', item.outTime || '')
    setValue('note', item.note || '')
    setEditingId(id.toString())
    setShowFormModal(true)
  }

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (!confirmed) return
    try {
      await deleteVisitor.mutateAsync(id.toString())
      toast.success('Visitor deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete visitor.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (!confirmed) return
    try {
      await deleteMultipleVisitors.mutateAsync(ids.map((x) => x.toString()))
      toast.success('Visitors deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete visitors.')
    }
  }

  const columns = [
    { key: 'visitorName', label: texts.Visitor_Name || 'Visitor Name' },
    { key: 'phone', label: texts.Phone || 'Phone' },
    { key: 'purposeName', label: texts.Purpose || 'Purpose' },
    { key: 'meetingWith', label: texts.Meeting_With || 'Meeting With' },
    { key: 'date', label: texts.Date || 'Date' },
    { key: 'inTime', label: texts.In_Time || 'In Time' },
  ]

  const isSubmitting = createVisitor.isPending || updateVisitor.isPending

  if (visitorsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading visitors...</p>
      </div>
    )
  }

  if (visitorsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Error loading visitors. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-4">
      {showFormModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer z-10"
                onClick={() => {
                  setShowFormModal(false)
                  resetForm()
                }}
              >
                <IconField name="FaTimes" size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4">
                {editingId ? texts.Edit || 'Edit' : texts.Add || 'Add'}{' '}
                {texts.Visitor_Book || 'Visitor Book'}
              </h2>

              <AllSchoolDropdown
                onSubmit={handleSubmit(onSubmit)}
                queryKeys={['visitorBooks', 'purposes']}
                onSchoolChange={resetForm}
              >
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
                    <NameField
                      label={texts.Visitor_Name || 'Visitor Name'}
                      name="visitorName"
                      control={control}
                      placeholder="Enter visitor name"
                      required
                      disabled={!!editingId}
                    />
                    <MobileField
                      label={texts.Phone || 'Phone'}
                      name="phone"
                      control={control}
                      placeholder="Enter 10 digit mobile no."
                      required
                      disabled={!!editingId}
                    />
                    <TextField
                      label={texts.Meeting_With || 'Meeting With'}
                      name="meetingWith"
                      control={control}
                      placeholder="Enter meeting with"
                      required
                    />
                    <TextField
                      label={texts.Number_Of_Person || 'Number Of Person'}
                      name="numberOfPerson"
                      control={control}
                      placeholder="Enter number of persons"
                      required
                      type="number"
                    />
                    <DateField
                      name="date"
                      label={texts.Date || 'Date'}
                      control={control}
                      required
                      disabled={!!editingId}
                    />
                    <Dropdown
                      name="purposeId"
                      label={texts.Purpose || 'Purpose'}
                      control={control}
                      options={
                        purposesData?.map((p: any) => ({
                          value: p.id || p.purposeId,
                          label: p.name || p.purpose,
                        })) || []
                      }
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                    <TimeField
                      name="inTime"
                      label={texts.In_Time || 'In Time'}
                      control={control}
                      placeholder="eg. 11:00 AM"
                      required
                    />
                    <TimeField
                      name="outTime"
                      label={texts.Out_Time || 'Out Time'}
                      control={control}
                      placeholder="eg. 01:00 PM"
                      required={false}
                    />
                  </div>

                  <TextAreaField
                    name="note"
                    label={texts.Note || 'Note (Optional)'}
                    control={control}
                    required={false}
                    rows={3}
                  />

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setShowFormModal(false)
                        resetForm()
                      }}
                      name={texts.Cancel || 'Cancel'}
                      loading={false}
                    />
                    <Button
                      name={editingId ? texts.Update || 'Update' : texts.Save || 'Save'}
                      loading={isSubmitting}
                      icon={<IconField name="FaSave" />}
                      showAlways={true}
                    />
                  </div>
                </>
              </AllSchoolDropdown>
            </div>
          </div>
        </>
      )}

      {activeView === 'details' && detailsView && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => {
                  setActiveView('list')
                  setDetailsView(null)
                }}
                className="absolute top-3 right-3 font-bold text-gray-700 hover:text-gray-900 text-2xl"
              >
                <IconField name="FaTimes" />
              </button>
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">
                {texts.Visitor_Book_Details || 'Visitor Book Details'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      [texts.Visitor_Name || 'Visitor Name', detailsView.visitorName],
                      [texts.Phone || 'Phone', detailsView.phone],
                      [texts.Meeting_With || 'Meeting With', detailsView.meetingWith],
                      [texts.Purpose || 'Purpose', detailsView.purposeName || 'N/A'],
                      [texts.Number_Of_Person || 'Number Of Person', detailsView.numberOfPerson],
                      [texts.Date || 'Date', detailsView.date],
                      [texts.In_Time || 'In Time', detailsView.inTime],
                      [texts.Out_Time || 'Out Time', detailsView.outTime || 'N/A'],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                {detailsView.note && (
                  <div>
                    <p className="text-sm text-gray-600">{texts.Note || 'Note'}</p>
                    <p className="mt-1">{detailsView.note}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button
                  name={texts.Close || 'Close'}
                  loading={false}
                  onClick={() => {
                    setActiveView('list')
                    setDetailsView(null)
                  }}
                  icon={<IconField name="FaTimes" />}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {texts.Visitor_Book || 'Visitor Book'}
          </h1>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="grid max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Dropdown
              name="filterPurpose"
              label={texts.Purpose || 'Purpose'}
              control={filterControl}
              options={
                purposesData?.map((p: any) => ({
                  value: p.id || p.purposeId,
                  label: p.name || p.purpose,
                })) || []
              }
              required={false}
            />
            <TextField
              label={texts.Search || 'Search'}
              name="filterSearch"
              placeholder="Name, phone, meeting with…"
              control={filterControl}
            />
          </section>
          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={texts.Cancel || 'Clear'}
              loading={false}
              icon={<IconField name="FaTimes" />}
              showAlways={true}
            />
            <Button
              name={texts.Search || 'Search'}
              loading={isFetching}
              icon={<IconField name="FaSearch" />}
              showAlways={true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !visitorsLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
            </div>
          )}
          <ControlledTable
            title={texts.Visitor_List || 'Visitor List'}
            columns={columns}
            data={visitors}
            fullData={visitors}
            showSearch={false}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            showForm={() => setShowFormModal(true)}
            btn={true}
            btnName={texts.Add || 'Add'}
            forceShowBtn={true}
            enablePermissions={true}
            permissionScope="FRONT_OFFICE"
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  )
}

export default VisitorBook

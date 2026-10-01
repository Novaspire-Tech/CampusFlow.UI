import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextAreaField from '../../../components/controlled/TextareaField'
import NameField from '../../../components/controlled/NameField'
import MobileField from '../../../components/controlled/MobileField'
import TimeField from '../../../components/controlled/TimeField'
import RadioGroupField from '../../../components/controlled/RadioGroupField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterPhoneCallLogs,
  useCreatePhoneCallLog,
  useUpdatePhoneCallLog,
  useDeletePhoneCallLog,
  useDeleteMultiplePhoneCallLogs,
} from '../../../hooks/queries/frontOffice/usePhoneCallLog'
import { Dropdown, FutureDateField, PastDateField, TextField } from '../../../components/controlled'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import type { PhoneCallLog as PhoneCallLogItem } from '../../../types/frontOffice/phoneCallLog'
import {
  type PhoneCallLogSearchParams,
  EMPTY_PHONE_SEARCH_PARAMS,
  type CallType,
} from '../../../services/frontOffice/phoneCallLogService'
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

//  Component
function PhoneCallLog() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t) as any

  //  Pagination & sort
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy] = useState('date')
  const [sortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeFilters, setActiveFilters] =
    useState<PhoneCallLogSearchParams>(EMPTY_PHONE_SEARCH_PARAMS)

  const {
    data: logsResponse,
    isLoading,
    isFetching,
    error,
  } = useFilterPhoneCallLogs(activeFilters, page, pageSize, sortBy, sortDirection)

  const createLog = useCreatePhoneCallLog()
  const updateLog = useUpdatePhoneCallLog()
  const deleteLog = useDeletePhoneCallLog()
  const deleteMultipleLogs = useDeleteMultiplePhoneCallLogs()

  //  UI state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<PhoneCallLogItem | null>(null)

  //  Add / Edit form
  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      phone: '',
      date: '',
      description: '',
      nextFollowUpDate: '',
      callDuration: '',
      note: '',
      callType: 'INCOMING',
    },
  })

  //  Filter form
  const {
    control: filterControl,
    getValues: getFilterValues,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterCallType: '',
      filterSearch: '',
    },
  })

  //  Derived data
  const logs: PhoneCallLogItem[] = logsResponse?.phoneCalls ?? []
  const totalItems = logsResponse?.totalItems ?? 0
  const totalPages = logsResponse?.totalPages ?? 0

  //  Pagination handlers
  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  //  Search handlers
  const handleApplySearch = () => {
    const { filterCallType, filterSearch } = getFilterValues()
    const params: PhoneCallLogSearchParams = {}
    if (filterCallType) params.callType = filterCallType as CallType
    if (filterSearch?.trim()) params.search = filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearSearch = () => {
    resetFilter({ filterCallType: '', filterSearch: '' })
    setActiveFilters(EMPTY_PHONE_SEARCH_PARAMS)
    setPage(0)
  }

  const hasActiveFilters = !!(activeFilters.search || activeFilters.callType)

  //  Form helpers
  const resetForm = () => {
    reset({
      name: '',
      phone: '',
      date: '',
      description: '',
      nextFollowUpDate: '',
      callDuration: '',
      note: '',
      callType: 'INCOMING',
    })
    setEditingId(null)
  }

  //  Submit
  const onSubmit = async (data: FieldValues) => {
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        date: data.date,
        description: data.description || '',
        nextFollowUpDate: data.nextFollowUpDate || '',
        callDuration: data.callDuration || '',
        note: data.note || '',
        callType: data.callType as CallType,
      }

      if (editingId) {
        await updateLog.mutateAsync({ id: editingId, data: payload })
        toast.success('Phone call log updated successfully!')
      } else {
        await createLog.mutateAsync(payload)
        toast.success('Phone call log created successfully!')
      }
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while submitting the form.')
    }
  }

  //  CRUD handlers
  const handleView = (id: string | number) => {
    const item = logs.find((i) => i.id === id.toString())
    if (item) setViewItem(item)
  }

  const handleEdit = (id: string | number) => {
    const item = logs.find((i) => i.id === id.toString())
    if (!item) return
    setValue('name', item.name)
    setValue('phone', item.phone)
    setValue('date', convertToDateInputFormat(item.date))
    setValue('description', item.description || '')
    setValue('nextFollowUpDate', convertToDateInputFormat(item.nextFollowUpDate || ''))
    setValue('callDuration', item.callDuration || '')
    setValue('note', item.note || '')
    setValue('callType', item.callType)
    setEditingId(id.toString())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (!confirmed) return
    try {
      await deleteLog.mutateAsync(id.toString())
      toast.success('Phone call log deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete phone call log.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (!confirmed) return
    try {
      await deleteMultipleLogs.mutateAsync(ids.map((x) => x.toString()))
      toast.success('Phone call logs deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete phone call logs.')
    }
  }

  //  Table columns
  const columns = [
    { key: 'name', label: texts.Name || 'Name' },
    { key: 'phone', label: texts.Phone || 'Phone' },
    { key: 'date', label: texts.Date || 'Date' },
    {
      key: 'nextFollowUpDate',
      label: texts.Follow_Up_Date || 'Follow Up Date',
    },
    { key: 'callType', label: texts.Call_Type || 'Call Type' },
  ]

  const isSubmitting = createLog.isPending || updateLog.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading phone call logs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Error loading phone call logs. Please try again.</p>
      </div>
    )
  }

  //  Render
  return (
    <div className="w-full px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/*  Left: Add / Edit form  */}
        <div className="w-full lg:w-1/3 p-4 bg-white shadow-md rounded">
          <h1 className="text-xl font-semibold mb-2">
            {editingId
              ? texts.Edit_Phone_Call_Log || 'Edit Phone Call Log'
              : texts.Add_Phone_Call_Log || 'Add Phone Call Log'}
          </h1>
          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['phoneCallLogs']}
            onSchoolChange={resetForm}
          >
            <NameField
              name="name"
              label={texts.Name || 'Name'}
              placeholder={texts.Enter_name || 'Enter Name'}
              control={control}
              required
              disabled={!!editingId}
            />

            <MobileField
              name="phone"
              label={texts.Phone || 'Phone'}
              placeholder={texts.Enter_Phone || 'Phone'}
              control={control}
              required
              disabled={!!editingId}
            />

            <PastDateField
              name="date"
              label={texts.Date || 'Date'}
              placeholder="Select date"
              control={control}
              required
            />

            <FutureDateField
              name="nextFollowUpDate"
              label={texts.Follow_Up_Date || 'Follow Up Date'}
              placeholder="Select follow up date"
              control={control}
            />

            <TimeField
              name="callDuration"
              label={texts.Call_Duration || 'Call Duration'}
              placeholder="eg. 09:30 AM"
              control={control}
            />

            <TextAreaField
              name="description"
              label={texts.Description || 'Description'}
              placeholder={texts.Enter_Description || 'Enter Description'}
              control={control}
              rows={2}
            />

            <TextAreaField
              name="note"
              label={texts.Note || 'Note (Optional)'}
              placeholder="Enter note"
              control={control}
              rows={2}
              required={false}
            />

            <RadioGroupField
              name="callType"
              label={texts.Call_Type || 'Call Type'}
              control={control}
              required
              options={[
                { label: texts.Incoming || 'Incoming', value: 'INCOMING' },
                { label: texts.Outgoing || 'Outgoing', value: 'OUTGOING' },
              ]}
            />

            <div className="flex gap-2">
              <Button
                name={editingId ? texts.Update || 'Update' : texts.Save || 'Save'}
                loading={isSubmitting}
                permissionScope="FRONT_OFFICE"
                permissionType={editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                icon={<IconField name="FaSave" />}
              />
              {editingId && (
                <Button
                  name={texts.Cancel || 'Cancel'}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                  onClick={resetForm}
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 p-2 bg-white shadow-md rounded overflow-auto">
          <div className="flex flex-wrap items-end gap-2 mb-3 px-1">
            <div className="w-36">
              <Dropdown
                name="filterCallType"
                label={texts.Call_Type || 'Call Type'}
                control={filterControl}
                options={[
                  { value: 'INCOMING', label: texts.Incoming || 'Incoming' },
                  { value: 'OUTGOING', label: texts.Outgoing || 'Outgoing' },
                ]}
                required={false}
              />
            </div>

            <div className="flex-1 min-w-40">
              <TextField
                label={texts.Search || 'Search'}
                name="filterSearch"
                placeholder="Name, phone, description…"
                control={filterControl}
              />
            </div>

            <div className="flex gap-2 pb-2">
              <Button
                name={texts.Search || 'Search'}
                loading={isFetching && !isLoading}
                onClick={handleApplySearch}
                icon={<IconField name="FaSearch" />}
                showAlways={true}
              />

              {hasActiveFilters && (
                <Button
                  name={texts.Clear || 'Clear'}
                  loading={false}
                  onClick={handleClearSearch}
                  icon={<IconField name="FaTimes" />}
                  showAlways={true}
                />
              )}
            </div>
          </div>
          {/*  Stale overlay  */}
          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
              </div>
            )}

            <ControlledTable
              title={texts.Phone_Call_List || 'Phone Call List'}
              columns={columns}
              data={logs}
              fullData={logs}
              showSearch={false}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              showSelectAll
              btn={false}
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

      {/*  View modal  */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 border-b pb-3">
              {texts.Call_Log_Details || 'Call Log Details'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    [texts.Name || 'Name', viewItem.name],
                    [texts.Phone || 'Phone', viewItem.phone],
                    [texts.Date || 'Date', viewItem.date],
                    [texts.Call_Type || 'Call Type', viewItem.callType],
                    [texts.Follow_Up_Date || 'Follow Up Date', viewItem.nextFollowUpDate || 'N/A'],
                    [texts.Call_Duration || 'Call Duration', viewItem.callDuration || 'N/A'],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {viewItem.description && (
                <div>
                  <p className="text-sm text-gray-600">{texts.Description || 'Description'}</p>
                  <p className="mt-1">{viewItem.description}</p>
                </div>
              )}

              {viewItem.note && (
                <div>
                  <p className="text-sm text-gray-600">{texts.Note || 'Note'}</p>
                  <p className="mt-1">{viewItem.note}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button
                name={texts.Close || 'Close'}
                loading={false}
                onClick={() => setViewItem(null)}
                icon={<IconField name="FaTimes" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhoneCallLog

import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextAreaField from '../../../components/controlled/TextareaField'
import DateField from '../../../components/controlled/DateField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import NameField from '../../../components/controlled/NameField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { TextField } from '../../../components/controlled'
import SearchDropdown from '../../../components/controlled/SearchDropdown'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterPostalReceives,
  useCreatePostalReceive,
  useUpdatePostalReceive,
  useUpdateAddPostalReceiveDocument,
  useDeletePostalReceive,
  useDeleteMultiplePostalReceives,
} from '../../../hooks/queries/frontOffice/usePostalReceives'
import { openDocument } from '../../../hooks/useBlobImage'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import type { PostalReceive as PostalReceiveItem } from '../../../types/frontOffice/postalReceive'
import {
  type PostalReceiveSearchParams,
  EMPTY_POSTAL_RECEIVE_SEARCH_PARAMS,
} from '../../../services/frontOffice/postalReceiveService'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

//  Constants
const POSTAL_TYPES = [
  { label: 'Indian Post', value: 'Indian Post' },
  { label: 'Speed Post', value: 'Speed Post' },
  { label: 'Registered Post', value: 'Registered Post' },
  { label: 'Courier', value: 'Courier' },
  { label: 'Express Mail', value: 'Express Mail' },
  { label: 'International Post', value: 'International Post' },
  { label: 'Parcel Post', value: 'Parcel Post' },
  { label: 'Book Post', value: 'Book Post' },
]

const convertToInputDate = (dateStr: string): string => {
  if (!dateStr) return ''
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return ''
}

//  Component

function PostalReceive() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t) as any

  //  Pagination & sort
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy] = useState('date')
  const [sortDirection] = useState<'asc' | 'desc'>('asc')
  const [activeFilters, setActiveFilters] = useState<PostalReceiveSearchParams>(
    EMPTY_POSTAL_RECEIVE_SEARCH_PARAMS,
  )

  //  Data fetching
  const {
    data: receivesResponse,
    isLoading,
    isFetching,
  } = useFilterPostalReceives(activeFilters, page, pageSize, sortBy, sortDirection)

  const createReceive = useCreatePostalReceive()
  const updateReceive = useUpdatePostalReceive()
  const updateAddDocument = useUpdateAddPostalReceiveDocument()
  const deleteReceive = useDeletePostalReceive()
  const deleteMultipleReceives = useDeleteMultiplePostalReceives()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<PostalReceiveItem | null>(null)
  const [existingDocument, setExistingDocument] = useState<string | null>(null)

  //  Add / Edit form
  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      fromTitle: '',
      referenceNo: '',
      postalType: '',
      note: '',
      toTitle: '',
      date: '',
      document: null,
    },
  })

  //  Filter form
  const {
    control: filterControl,
    getValues: getFilterValues,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterSearch: '' },
  })

  //  Derived data
  const receives: PostalReceiveItem[] = receivesResponse?.receives ?? []
  const totalItems = receivesResponse?.totalItems ?? 0
  const totalPages = receivesResponse?.totalPages ?? 0

  //  Pagination handlers
  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  //  Filter handlers
  const handleApplySearch = () => {
    const { filterSearch } = getFilterValues()
    const params: PostalReceiveSearchParams = {}
    if (filterSearch?.trim()) params.search = filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearSearch = () => {
    resetFilter({ filterSearch: '' })
    setActiveFilters(EMPTY_POSTAL_RECEIVE_SEARCH_PARAMS)
    setPage(0)
  }

  //  Form helpers
  const resetForm = () => {
    reset({
      fromTitle: '',
      referenceNo: '',
      postalType: '',
      note: '',
      toTitle: '',
      date: '',
      document: null,
    })
    setEditingId(null)
    setExistingDocument(null)
  }

  const getFileName = (path?: string | null) => {
    if (!path) return ''
    return path.split('/').pop() || ''
  }

  //  Submit
  const onSubmit = async (data: FieldValues) => {
    try {
      const isDuplicate = receives.some(
        (item) =>
          item.referenceNo?.toLowerCase() === data.referenceNo?.trim().toLowerCase() &&
          item.id !== editingId,
      )
      if (isDuplicate && data.referenceNo?.trim() !== '') {
        toast.error('Reference number already exists!')
        return
      }

      const payload = {
        fromTitle: data.fromTitle,
        referenceNo: data.referenceNo || '',
        address: data.postalType || '',
        postalType: data.postalType || '',
        note: data.note || '',
        toTitle: data.toTitle,
        date: data.date,
      }

      const documentFile = data.document instanceof FileList ? data.document[0] : data.document

      if (editingId) {
        await updateReceive.mutateAsync({ id: editingId, data: payload })
        if (documentFile instanceof File) {
          await updateAddDocument.mutateAsync({ id: editingId, file: documentFile })
        }
        toast.success('Postal receive updated successfully!')
        resetForm()
      } else {
        await createReceive.mutateAsync({ ...payload, document: documentFile })
        toast.success('Postal receive created successfully!')
        resetForm()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong')
    }
  }

  //  CRUD handlers
  const handleEdit = (id: string | number) => {
    const item = receives.find((i) => i.id === id.toString())
    if (!item) return
    setValue('fromTitle', item.fromTitle)
    setValue('referenceNo', item.referenceNo || '')
    setValue('postalType', item.address || '')
    setValue('note', item.note || '')
    setValue('toTitle', item.toTitle)
    setValue('date', convertToInputDate(item.date))
    setValue('document', null)
    setExistingDocument(typeof item.document === 'string' ? item.document : null)
    setEditingId(id.toString())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (!confirmed) return
    try {
      await deleteReceive.mutateAsync(id.toString())
      toast.success('Postal Receive deleted successfully!')
    } catch (error) {
      console.error('Error deleting postal receive:', error)
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (!confirmed) return
    try {
      await deleteMultipleReceives.mutateAsync(ids.map((x) => x.toString()))
      toast.success('Postal Receives deleted successfully!')
    } catch (error) {
      console.error('Error deleting multiple postal receives:', error)
    }
  }

  const handleView = (id: string | number) => {
    const item = receives.find((i) => i.id === id.toString())
    if (item) setViewItem(item)
  }

  //  Table columns
  const columns = [
    { key: 'fromTitle', label: texts.From_Title || 'From Title' },
    { key: 'referenceNo', label: texts.Reference_No || 'Reference No' },
    { key: 'address', label: 'Postal Type' },
    { key: 'toTitle', label: texts.To_Title || 'To Title' },
    { key: 'date', label: texts.Date || 'Date' },
  ]

  const isSubmitting = createReceive.isPending || updateReceive.isPending

  return (
    <div className="w-full px-2 py-3 sm:px-4 sm:py-4">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Add / Edit form ── */}
        <div className="w-full lg:w-1/3 p-3 sm:p-4 bg-white shadow-md rounded">
          <h1 className="text-lg sm:text-xl font-semibold mb-2">
            {editingId
              ? texts.Edit_Postal_Receive || 'Edit Postal Receive'
              : texts.Add_Postal_Receive || 'Add Postal Receive'}
          </h1>

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['postalReceives']}
            onSchoolChange={resetForm}
          >
            <NameField
              name="fromTitle"
              label={texts.From_Title || 'From Title'}
              placeholder="Enter sender title"
              control={control}
              required
            />

            <TextField
              name="referenceNo"
              label={texts.Reference_No || 'Reference No'}
              placeholder="Enter reference number"
              control={control}
              required
            />

            <SearchDropdown
              name="postalType"
              label="Postal Type"
              control={control}
              options={POSTAL_TYPES}
              required
              allowCustomInput={true}
              placeholder="Select or type postal type..."
            />

            <TextAreaField
              name="note"
              label={texts.Note || 'Note'}
              placeholder="Add notes here..."
              control={control}
              required
              rows={2}
            />

            <NameField
              name="toTitle"
              label={texts.To_Title || 'To Title'}
              placeholder="Enter recipient title"
              control={control}
              required
            />

            <DateField
              name="date"
              label={texts.Date || 'Date'}
              placeholder="Select date"
              control={control}
            />

            {editingId && existingDocument && (
              <div className="p-2 border rounded bg-gray-50">
                <p className="text-sm text-gray-600">Previously uploaded file</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {getFileName(existingDocument)}
                </p>
              </div>
            )}

            <FileUploadField
              name="document"
              label={texts.Attach_Document || 'Attach Document'}
              control={control}
            />

            <div className="flex flex-wrap gap-2">
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
          {/* Search */}
          <div className="flex flex-col xs:flex-row items-start xs:items-end gap-2 mb-3 px-1">
            <div className="w-full xs:flex-1 xs:min-w-0">
              <TextField
                label={texts.Search || 'Search'}
                name="filterSearch"
                placeholder="From, to, reference no…"
                control={filterControl}
              />
            </div>

            <div className="flex gap-2 pb-0 xs:pb-2 w-full xs:w-auto">
              <Button
                name={texts.Search || 'Search'}
                loading={isFetching && !isLoading}
                onClick={handleApplySearch}
                icon={<IconField name="FaSearch" />}
                showAlways={true}
              />
              {activeFilters.search && (
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

          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
              </div>
            )}

            <div className=" w-full">
              <ControlledTable
                title={texts.Postal_Receive_List || 'Postal Receive List'}
                columns={columns}
                data={receives}
                fullData={receives}
                showSearch={false}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
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
      </div>

      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center p-3 sm:p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 border-b pb-3">
              {texts.Postal_Receive_Details || 'Postal Receive Details'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm text-gray-600">{texts.From_Title || 'From Title'}</p>
                  <p className="font-semibold wrap-break-word">{viewItem.fromTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{texts.Reference_No || 'Reference No'}</p>
                  <p className="font-semibold wrap-break-word">{viewItem.referenceNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Postal Type</p>
                  <p className="font-semibold wrap-break-word">{viewItem.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{texts.To_Title || 'To Title'}</p>
                  <p className="font-semibold wrap-break-word">{viewItem.toTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{texts.Date || 'Date'}</p>
                  <p className="font-semibold">{viewItem.date}</p>
                </div>
              </div>
              {viewItem.note && (
                <div>
                  <p className="text-sm text-gray-600">{texts.Note || 'Note'}</p>
                  <p className="font-semibold wrap-break-word">{viewItem.note}</p>
                </div>
              )}
              {viewItem.document && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{texts.Documen || 'Document'}</p>
                  <button
                    onClick={() =>
                      typeof viewItem.document === 'string' && openDocument(viewItem.document)
                    }
                    className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <IconField name="FaDownload" />
                    <span className="ml-2">{texts.View_Docume || 'Download Document'}</span>
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-6 pt-4 border-t flex justify-end">
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

export default PostalReceive

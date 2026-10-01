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
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterPostalDispatches,
  useCreatePostalDispatch,
  useUpdatePostalDispatch,
  useUpdateAddPostalDispatchDocument,
  useDeletePostalDispatch,
  useDeleteMultiplePostalDispatches,
} from '../../../hooks/queries/frontOffice/usePostalDispatch'
import { openDocument } from '../../../hooks/useBlobImage'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import SearchDropdown from '../../../components/controlled/SearchDropdown'
import type { PostalDispatchSearchParams } from '../../../services/frontOffice/postalDispatchService'
import { EMPTY_POSTAL_SEARCH_PARAMS } from '../../../services/frontOffice/postalDispatchService'
import type { PostalDispatch as PostalDispatchItem } from '../../../types/frontOffice/postalDispatch'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

//  Types & constants

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

function PostalDispatch() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t) as any

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy] = useState('date')
  const [sortDirection] = useState<'asc' | 'desc'>('asc')

  const [activeFilters, setActiveFilters] = useState<PostalDispatchSearchParams>(
    EMPTY_POSTAL_SEARCH_PARAMS,
  )

  const {
    data: dispatchesResponse,
    isLoading,
    isFetching,
  } = useFilterPostalDispatches(activeFilters, page, pageSize, sortBy, sortDirection)

  const createDispatch = useCreatePostalDispatch()
  const updateDispatch = useUpdatePostalDispatch()
  const updatePostalDispatchDocument = useUpdateAddPostalDispatchDocument()
  const deleteDispatch = useDeletePostalDispatch()
  const deleteMultipleDispatches = useDeleteMultiplePostalDispatches()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<PostalDispatchItem | null>(null)
  const [existingDocument, setExistingDocument] = useState<string | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      referenceNo: '',
      postalType: '',
      fromTitle: '',
      phone: '',
      date: '',
      description: '',
      note: '',
      document: null,
    },
  })

  const {
    control: filterControl,
    getValues: getFilterValues,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterSearch: '' },
  })

  const dispatches: PostalDispatchItem[] = dispatchesResponse?.dispatches ?? []
  const totalItems = dispatchesResponse?.totalItems ?? 0
  const totalPages = dispatchesResponse?.totalPages ?? 0

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplySearch = () => {
    const { filterSearch } = getFilterValues()
    const params: PostalDispatchSearchParams = {}
    if (filterSearch?.trim()) params.search = filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearSearch = () => {
    resetFilter({ filterSearch: '' })
    setActiveFilters(EMPTY_POSTAL_SEARCH_PARAMS)
    setPage(0)
  }

  const resetForm = () => {
    reset({
      title: '',
      referenceNo: '',
      postalType: '',
      fromTitle: '',
      phone: '',
      date: '',
      description: '',
      note: '',
      document: null,
    })
    setEditingId(null)
    setExistingDocument(null)
  }

  const getFileName = (path?: string | null) => {
    if (!path) return ''
    return path.split('/').pop() || ''
  }

  const onSubmit = async (data: FieldValues) => {
    try {
      const isDuplicate = dispatches.some(
        (item) =>
          item.referenceNo?.toLowerCase() === data.referenceNo?.trim().toLowerCase() &&
          item.id !== editingId,
      )
      if (isDuplicate && data.referenceNo?.trim() !== '') {
        toast.error('Reference number already exists!')
        return
      }

      const payload = {
        title: data.title,
        referenceNo: data.referenceNo || '',
        address: data.postalType || '',
        postalType: data.postalType || '',
        fromTitle: data.fromTitle || '',
        phone: data.phone || '',
        date: data.date,
        description: data.description || '',
        note: data.note || '',
      }

      const documentFile = data.document instanceof FileList ? data.document[0] : data.document

      if (editingId) {
        await updateDispatch.mutateAsync({ id: editingId, data: payload })
        if (documentFile instanceof File) {
          await updatePostalDispatchDocument.mutateAsync({
            id: editingId,
            file: documentFile,
          })
        }
        toast.success('Postal dispatch updated successfully!')
        resetForm()
      } else {
        await createDispatch.mutateAsync({ ...payload, document: documentFile })
        toast.success('Postal dispatch created successfully!')
        resetForm()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong')
    }
  }

  const handleEdit = (id: string | number) => {
    const item = dispatches.find((i) => i.id === id.toString())
    if (!item) return
    setValue('title', item.title)
    setValue('referenceNo', item.referenceNo || '')
    setValue('postalType', item.address || '')
    setValue('fromTitle', item.fromTitle || '')
    setValue('phone', item.phone || '')
    setValue('date', convertToInputDate(item.date))
    setValue('description', item.description || '')
    setValue('note', item.note || '')
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
      await deleteDispatch.mutateAsync(id.toString())
      toast.success('Postal Dispatch deleted successfully!')
    } catch (error) {
      console.error('Error deleting postal dispatch:', error)
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (!confirmed) return
    try {
      await deleteMultipleDispatches.mutateAsync(ids.map((x) => x.toString()))
      toast.success('Postal Dispatches deleted successfully!')
    } catch (error) {
      console.error('Error deleting multiple postal dispatches:', error)
    }
  }

  const handleView = (id: string | number) => {
    const item = dispatches.find((i) => i.id === id.toString())
    if (item) setViewItem(item)
  }

  //  Table columns
  const columns = [
    { key: 'title', label: texts.To_Title || 'To Title' },
    { key: 'referenceNo', label: texts.Reference_No || 'Reference No' },
    { key: 'address', label: texts.Postal_type || 'Postal Type' },
    { key: 'fromTitle', label: texts.From_Title || 'From Title' },
    { key: 'date', label: texts.Date || 'Date' },
  ]

  const isLoading2 = createDispatch.isPending || updateDispatch.isPending

  //  Render
  return (
    <div className="w-full px-2 py-3 sm:px-4 sm:py-4">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className="w-full lg:w-1/3 p-3 sm:p-4 bg-white shadow-md rounded">
          <h1 className="text-lg sm:text-xl font-semibold mb-2">
            {editingId
              ? texts.Update_Complaint || 'Update Postal Dispatch'
              : texts.Add_Postal_Dispatch || 'Add Postal Dispatch'}
          </h1>

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['postalDispatches']}
            onSchoolChange={resetForm}
          >
            <NameField
              name="title"
              label={texts.To_Title || 'To'}
              placeholder={texts.Enter_recipient_title || 'Enter_Recipient_title'}
              control={control}
              required
            />

            <TextField
              name="referenceNo"
              label={texts.Reference_No || 'Reference No'}
              placeholder={texts.Enter_reference_number || 'Enter reference number'}
              control={control}
            />

            <SearchDropdown
              name="postalType"
              label={texts.Postal_type || 'Postal Type'}
              control={control}
              options={POSTAL_TYPES}
              required
              allowCustomInput={true}
              placeholder={texts.select_postal_type || 'Select or type postal type...'}
            />

            <TextField
              name="fromTitle"
              label={texts.From_Title || 'From'}
              placeholder={texts.enter_sender_title || 'Enter sender title'}
              control={control}
            />

            <DateField
              name="date"
              label={texts.Date || 'Date'}
              placeholder="Select date"
              control={control}
            />

            <TextAreaField
              name="description"
              placeholder={texts.Enter_Description || 'Enter description'}
              label={texts.Description || 'Description'}
              control={control}
              rows={2}
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
                loading={isLoading2}
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
          <div className="flex flex-col xs:flex-row items-start xs:items-end gap-2 mb-3 px-1">
            <div className="w-full xs:flex-1 xs:min-w-0">
              <TextField
                label={texts.Search || 'Search'}
                name="filterSearch"
                placeholder={texts.title_reference_from || 'Title, reference no, from…'}
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

            <div className="w-full">
              <ControlledTable
                title={texts.Postal_Dispatch_List || 'Postal Dispatch List'}
                columns={columns}
                data={dispatches}
                fullData={dispatches}
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
              {texts.Complaint_Details || 'Postal Dispatch Details'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm text-gray-600">{texts.To_Title || 'To Title'}</p>
                  <p className="font-semibold wrap-break-word">{viewItem.title}</p>
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
                  <p className="text-sm text-gray-600">{texts.From_Title || 'From Title'}</p>
                  <p className="font-semibold wrap-break-word">{viewItem.fromTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{texts.Date || 'Date'}</p>
                  <p className="font-semibold">{viewItem.date}</p>
                </div>
                {viewItem.phone && (
                  <div>
                    <p className="text-sm text-gray-600">{texts.Phone || 'Phone'}</p>
                    <p className="font-semibold">{viewItem.phone}</p>
                  </div>
                )}
              </div>
              {viewItem.description && (
                <div>
                  <p className="text-sm text-gray-600">{texts.Description || 'Description'}</p>
                  <p className="font-semibold wrap-break-word">{viewItem.description}</p>
                </div>
              )}
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

export default PostalDispatch

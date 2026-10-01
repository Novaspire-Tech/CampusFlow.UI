import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import DateField from '../../../components/controlled/DateField'
import MobileField from '../../../components/controlled/MobileField'
import NameField from '../../../components/controlled/NameField'
import EmailField from '../../../components/controlled/EmailField'
import TextField from '../../../components/controlled/TextField'
import Button from '../../../components/controlled/Button'
import Dropdown from '../../../components/controlled/Dropdown'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterAdmissionEnquiries,
  useCreateAdmissionEnquiry,
  useUpdateAdmissionEnquiry,
  useDeleteAdmissionEnquiry,
  useDeleteMultipleAdmissionEnquiries,
} from '../../../hooks/queries/frontOffice/useAdmissionEnquiry'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSources } from '../../../hooks/queries/frontOffice/setupFrontOffice/useSource'
import { useReferences } from '../../../hooks/queries/frontOffice/setupFrontOffice/useReference'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import type {
  AdmissionEnquiry as EnquiryItem,
  AdmissionEnquirySearchParams,
} from '../../../types/frontOffice/admissionEnquiry'
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

function AdmissionEnquiry() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t) as any

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy] = useState('enquiryDate')
  const [sortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeFilters, setActiveFilters] = useState<AdmissionEnquirySearchParams>(
    {} as AdmissionEnquirySearchParams,
  )

  const {
    data: enquiriesResponse,
    isLoading: enquiriesLoading,
    isFetching,
    error: enquiriesError,
  } = useFilterAdmissionEnquiries(activeFilters, page, pageSize, sortBy, sortDirection)

  const { data: classesData } = useSchoolClasses()
  const { data: sourcesData } = useSources()
  const { data: referencesData } = useReferences()

  const createEnquiry = useCreateAdmissionEnquiry()
  const updateEnquiry = useUpdateAdmissionEnquiry()
  const deleteEnquiry = useDeleteAdmissionEnquiry()
  const deleteMultipleEnquiries = useDeleteMultipleAdmissionEnquiries()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [activeView, setActiveView] = useState<'list' | 'details'>('list')
  const [detailsView, setDetailsView] = useState<EnquiryItem | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      schoolCode: localStorage.getItem('schoolCode') ?? '',
      studentName: '',
      phone: '',
      email: '',
      address: '',
      description: '',
      enquiryDate: '',
      nextFollowUpDate: '',
      reference: '',
      classId: '',
      sourceId: '',
      status: 'Active',
    },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterClass: '',
      filterSource: '',
      filterReference: '',
      filterSearch: '',
    },
  })

  const enquiries: EnquiryItem[] = enquiriesResponse?.admissionEnquiries ?? []
  const totalItems = enquiriesResponse?.totalItems ?? 0
  const totalPages = enquiriesResponse?.totalPages ?? 0

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: AdmissionEnquirySearchParams = {}
    if (data.filterClass) params.classId = data.filterClass
    if (data.filterSource) params.sourceId = data.filterSource
    if (data.filterReference) params.reference = data.filterReference
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterClass: '', filterSource: '', filterReference: '', filterSearch: '' })
    setActiveFilters({} as AdmissionEnquirySearchParams)
    setPage(0)
  }

  const resetForm = () => {
    reset({
      schoolCode: localStorage.getItem('schoolCode') ?? '',
      studentName: '',
      phone: '',
      email: '',
      address: '',
      description: '',
      enquiryDate: '',
      nextFollowUpDate: '',
      reference: '',
      classId: '',
      sourceId: '',
      status: 'Active',
    })
    setEditingId(null)
  }

  const onSubmit = async (data: FieldValues) => {
    try {
      const payload = {
        schoolCode: data.schoolCode || localStorage.getItem('schoolCode') || '',
        studentName: data.studentName,
        phone: data.phone,
        email: data.email || '',
        address: data.address || '',
        description: data.description || '',
        enquiryDate: data.enquiryDate,
        nextFollowUpDate: data.nextFollowUpDate || '',
        reference: data.reference || '',
        classId: data.classId,
        sourceId: data.sourceId,
        status: data.status,
      }
      if (editingId) {
        await updateEnquiry.mutateAsync({ id: editingId, data: payload })
        toast.success('Admission enquiry updated successfully!')
      } else {
        await createEnquiry.mutateAsync(payload)
        toast.success('Admission enquiry created successfully!')
      }
      setEditingId(null)
      resetForm()
      setShowFormModal(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save admission enquiry.')
      throw error
    }
  }

  const handleView = (id: string | number) => {
    const item = enquiries.find((i) => i.id === id.toString())
    if (item) {
      setDetailsView(item)
      setActiveView('details')
    }
  }

  const handleEdit = (id: string | number) => {
    const item = enquiries.find((i) => i.id === id.toString())
    if (!item) return
    setValue('schoolCode', item.schoolCode || localStorage.getItem('schoolCode') || '')
    setValue('studentName', item.studentName)
    setValue('phone', item.phone)
    setValue('email', item.email || '')
    setValue('address', item.address || '')
    setValue('description', item.description || '')
    setValue('enquiryDate', convertToDateInputFormat(item.enquiryDate))
    setValue('nextFollowUpDate', convertToDateInputFormat(item.nextFollowUpDate || ''))
    setValue('reference', item.reference?.referenceId || '')
    setValue('classId', item.classId || '')
    setValue('sourceId', item.sourceId)
    setValue('status', item.status)
    setEditingId(id.toString())
    setShowFormModal(true)
  }

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (!confirmed) return
    try {
      await deleteEnquiry.mutateAsync(id.toString())
      toast.success('Admission enquiry deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete enquiry.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (!confirmed) return
    try {
      await deleteMultipleEnquiries.mutateAsync(ids.map((x) => x.toString()))
      toast.success('Admission enquiries deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete enquiries.')
    }
  }

  const columns = [
    { key: 'studentName', label: texts.Student_Name || 'Student Name' },
    { key: 'phone', label: texts.Phone || 'Phone' },
    { key: 'sourceName', label: texts.Source || 'Source' },
    { key: 'enquiryDate', label: texts.Enquiry_Date || 'Enquiry Date' },
    { key: 'status', label: texts.Status || 'Status' },
  ]

  const isSubmitting = createEnquiry.isPending || updateEnquiry.isPending

  if (enquiriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading enquiries...</p>
      </div>
    )
  }

  if (enquiriesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Error loading enquiries. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="campusflow-page campusflow-page--admission mx-auto w-full max-w-[1680px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
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
                {texts.Admission_Enquiry || 'Admission Enquiry'}
              </h2>

              <AllSchoolDropdown
                onSubmit={handleSubmit(onSubmit)}
                queryKeys={['admissionEnquiries', 'schoolClasses', 'sources', 'references']}
                onSchoolChange={resetForm}
              >
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
                    <NameField
                      label={texts.Name || 'Name'}
                      name="studentName"
                      control={control}
                      placeholder="Enter Name"
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
                    <EmailField
                      label={texts.Email || 'Email'}
                      name="email"
                      control={control}
                      placeholder="Enter Email"
                      required={false}
                      disabled={!!editingId}
                    />
                    <TextField
                      label={texts.Address || 'Address'}
                      name="address"
                      placeholder="Enter Address"
                      control={control}
                    />
                    <TextField
                      label={texts.Description || 'Description'}
                      name="description"
                      placeholder="Enter Description"
                      required
                      control={control}
                    />
                    <DateField
                      name="enquiryDate"
                      label={texts.Enquiry_Date || 'Enquiry Date'}
                      control={control}
                      required
                    />
                    <DateField
                      name="nextFollowUpDate"
                      label={texts.Next_Follow_Up_Date || 'Next Follow Up Date'}
                      control={control}
                      required={false}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Dropdown
                      name="reference"
                      label={texts.Reference || 'Reference'}
                      control={control}
                      options={
                        referencesData?.map((r: any) => ({
                          value: r.id || r.referenceId,
                          label: r.reference || r.referenceName || '',
                        })) || []
                      }
                      required={false}
                    />
                    <Dropdown
                      name="sourceId"
                      label={texts.Source || 'Source'}
                      control={control}
                      options={
                        sourcesData?.map((s: any) => ({
                          value: s.id || s.sourceId,
                          label: s.source || s.sourceName || '',
                        })) || []
                      }
                      required
                    />
                    <Dropdown
                      name="classId"
                      label={texts.Class || 'Class'}
                      control={control}
                      options={
                        classesData?.map((c: any) => ({
                          value: c.id || c.schoolClassId,
                          label: c.className,
                        })) || []
                      }
                      required
                    />
                    <Dropdown
                      name="status"
                      label={texts.Status || 'Status'}
                      control={control}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Completed', label: 'Completed' },
                      ]}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setShowFormModal(false)
                        resetForm()
                      }}
                      name={texts.Cancel || 'Cancel'}
                      loading={false}
                      showAlways={true}
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
                {texts.Admission_Enquiry_Details || 'Admission Enquiry Details'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    [texts.Student_Name || 'Student Name', detailsView.studentName],
                    [texts.Phone || 'Phone', detailsView.phone],
                    [texts.Email || 'Email', detailsView.email || 'N/A'],
                    [texts.Class || 'Class', detailsView.className || 'N/A'],
                    [texts.Source || 'Source', detailsView.sourceName],
                    [texts.Reference || 'Reference', detailsView.referenceName || 'N/A'],
                    [texts.Enquiry_Date || 'Enquiry Date', detailsView.enquiryDate],
                    [
                      texts.Next_Follow_Up_Date || 'Next Follow Up Date',
                      detailsView.nextFollowUpDate || 'N/A',
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                {detailsView.address && (
                  <div>
                    <p className="text-sm text-gray-600">{texts.Address || 'Address'}</p>
                    <p className="mt-1">{detailsView.address}</p>
                  </div>
                )}
                {detailsView.description && (
                  <div>
                    <p className="text-sm text-gray-600">{texts.Description || 'Description'}</p>
                    <p className="mt-1">{detailsView.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">{texts.Status || 'Status'}</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                      detailsView.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : detailsView.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : detailsView.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {detailsView.status}
                  </span>
                </div>
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

      <div className="campusflow-panel w-full bg-white shadow-md rounded p-4 sm:p-6 lg:p-7">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="campusflow-page__eyebrow">Front office</p>
            <h1 className="campusflow-page__title text-xl sm:text-2xl font-semibold text-gray-800">
              {texts.Admission_Enquiry || 'Admission Enquiry'}
            </h1>
            <p className="campusflow-page__description">
              Review enquiries and keep prospective student follow-ups moving.
            </p>
          </div>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="campusflow-admission-filters grid max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Dropdown
              name="filterClass"
              label={texts.Class || 'Class'}
              control={filterControl}
              options={
                classesData?.map((c: any) => ({
                  value: c.id || c.schoolClassId,
                  label: c.className,
                })) || []
              }
              required={false}
            />
            <Dropdown
              name="filterSource"
              label={texts.Source || 'Source'}
              control={filterControl}
              options={
                sourcesData?.map((s: any) => ({
                  value: s.id || s.sourceId,
                  label: s.source || s.sourceName || '',
                })) || []
              }
              required={false}
            />
            <Dropdown
              name="filterReference"
              label={texts.Reference || 'Reference'}
              control={filterControl}
              options={
                referencesData?.map((r: any) => ({
                  value: r.id || r.referenceId,
                  label: r.reference || r.referenceName || '',
                })) || []
              }
              required={false}
            />
            <TextField
              label={texts.Search || 'Search'}
              name="filterSearch"
              placeholder="Name, phone, email…"
              control={filterControl}
            />
          </section>
          <div className="campusflow-admission-actions flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={texts.Clear || 'Clear'}
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

        <hr className="campusflow-admission-divider border-gray-300 mb-4" />

        <div className="campusflow-admission-table relative">
          {isFetching && !enquiriesLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
            </div>
          )}
          <ControlledTable
            title={texts.Student_List || 'Student List'}
            columns={columns}
            data={enquiries}
            fullData={enquiries}
            showSearch={false}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            showForm={() => setShowFormModal(true)}
            btn={true}
            btnName={texts.Add || 'Add'}
            forceShowBtn={true}
            showSelectAll
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

export default AdmissionEnquiry

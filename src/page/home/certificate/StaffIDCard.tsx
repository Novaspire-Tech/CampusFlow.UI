import React, { useMemo, useState } from 'react'
import { Controller, FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'

import { IconField } from '../../../components'
import Button from '../../../components/controlled/Button'
import Dropdown from '../../../components/controlled/Dropdown'
import FileUploadField from '../../../components/controlled/FileUploadField'
import TextField from '../../../components/controlled/TextField'
import ToggleButton from '../../../components/controlled/ToggleButton'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'

import {
  useCreateStaffIdCardTemplate,
  useDeleteStaffIdCardTemplate,
  useGenerateStaffIdCards,
  useStaffIdCardTemplates,
  useViewStaffIdCardTemplate,
} from '../../../hooks/queries/certificate/useStaffIdCard'
import { useGetAllStaff } from '../../../hooks/queries/humanResource/useStaffDirectory'

import type { StaffIdCardTemplateFormData } from '../../../types/certificate/staffIdCard'
import type { Staff } from '../../../types/humanResource/Staff'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

type StaffCardRow = {
  id: number
  templateName: string
  schoolName: string
  address: string
}

type StaffMemberForCard = {
  id: number
  staffId: number
  staffCode: string
  name: string
  department: string
  designation: string
  dob: string
  doj: string
  bloodGroup: string
  photoUrl?: string
}

type SearchFormValues = {
  department: string
  designation: string
  templateId: string
}

const transformStaffToCardMember = (staff: Staff): StaffMemberForCard => {
  const staffId = parseInt(staff.staffId || staff.id)
  return {
    id: staffId,
    staffId: staffId,
    staffCode: staff.staffCode,
    name: `${staff.firstName} ${staff.lastName}`.trim(),
    department: staff.department?.name || 'N/A',
    designation: staff.designation?.name || 'N/A',
    dob: staff.dateOfBirth || '',
    doj: staff.dateOfJoining || '',
    bloodGroup: staff.bloodGroup || 'N/A',
    photoUrl: staff.photo || undefined,
  }
}

const DEFAULT_DESIGNER_VALUES: StaffIdCardTemplateFormData = {
  templateName: 'HORIZONTAL STAFF CARD',
  schoolName: 'ABC INTERNATIONAL SCHOOL',
  tagLine: 'Education for Future',
  address: '',

  headerTextColor: '#1e293b',
  keyTextColor: '#64748b',
  valueTextColor: '#0f172a',

  logo: null,
  sign: null,
  backgroundImage: null,
  backCardBackgroundImage: null,
  barcodeUrl: null,

  staffCode: false,
  designation: false,
  department: false,
  dateOfJoining: false,
  dateOfBirth: false,
  staffAddress: false,
  bloodGroup: false,
  barcode: false,
  signature: false,
  circularProfilePicture: false,
  headerBodyDividerLine: false,
}

const ColorField: React.FC<{
  name: keyof StaffIdCardTemplateFormData
  label: string
  control: any
}> = ({ name, label, control }) => (
  <Controller
    name={name as any}
    control={control}
    render={({ field }) => (
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={field.value || '#000000'}
            onChange={(e) => field.onChange(e.target.value)}
            className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-24 text-xs border border-gray-300 rounded px-2 py-1"
            placeholder="#000000"
          />
        </div>
      </div>
    )}
  />
)

const StaffIDCard: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const { data: templates = [], isLoading: templatesLoading } = useStaffIdCardTemplates()
  const { data: allStaff = [], isLoading: staffLoading } = useGetAllStaff()

  const createTemplate = useCreateStaffIdCardTemplate()
  const deleteTemplate = useDeleteStaffIdCardTemplate()
  const viewTemplate = useViewStaffIdCardTemplate()
  const generateCards = useGenerateStaffIdCards()
  const [currentView, setCurrentView] = useState<'designer' | 'generator'>('designer')
  const [filteredStaff, setFilteredStaff] = useState<StaffMemberForCard[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [previewingId, setPreviewingId] = useState<number | null>(null)
  const [generatingCards, setGeneratingCards] = useState(false)

  // Form Methods
  const designerMethods = useForm<StaffIdCardTemplateFormData>({
    defaultValues: DEFAULT_DESIGNER_VALUES,
    mode: 'onSubmit',
  })

  const searchMethods = useForm<SearchFormValues>()

  // const watchBarcodeUrl = designerMethods.watch('barcodeUrl')
  const watchSignature = designerMethods.watch('signature')
  const watchSign = designerMethods.watch('sign')

  const transformedStaff = useMemo(() => {
    return allStaff.map(transformStaffToCardMember)
  }, [allStaff])

  const tableData: StaffCardRow[] = useMemo(() => {
    if (!templates || templates.length === 0) return []
    return templates.map((template) => ({
      id: template.staffIdCardTemplateId,
      templateName: template.templateName || 'Untitled Template',
      schoolName: template.schoolName || '',
      address: template.address || '',
    }))
  }, [templates])

  const departmentOptions = useMemo(() => {
    const uniqueDepts = new Set<string>()
    transformedStaff.forEach((staff) => {
      if (staff.department && staff.department !== 'N/A') {
        uniqueDepts.add(staff.department)
      }
    })
    return Array.from(uniqueDepts).map((dept) => ({ label: dept, value: dept }))
  }, [transformedStaff])

  const designationOptions = useMemo(() => {
    const uniqueDesigs = new Set<string>()
    transformedStaff.forEach((staff) => {
      if (staff.designation && staff.designation !== 'N/A') {
        uniqueDesigs.add(staff.designation)
      }
    })
    return Array.from(uniqueDesigs).map((desig) => ({ label: desig, value: desig }))
  }, [transformedStaff])

  const onSaveTemplate: SubmitHandler<StaffIdCardTemplateFormData> = async (data) => {
    // Validation
    if (!data.templateName?.trim()) {
      toast.error('Template name is required')
      return
    }
    if (!data.schoolName?.trim()) {
      toast.error('School name is required')
      return
    }
    if (!data.address?.trim()) {
      toast.error('Address is required')
      return
    }
    if (!data.logo) {
      toast.error('Logo is required')
      return
    }
    if (data.signature && !data.sign) {
      toast.error('Signature image is required when signature field is enabled')
      return
    }
    if (data.barcode && !data.barcodeUrl) {
      toast.error('Barcode/QR code image is required when barcode field is enabled')
      return
    }
    if (data.logo && !(data.logo instanceof File)) {
      toast.error('Logo must be a valid image file')
      return
    }
    if (data.barcodeUrl && !(data.barcodeUrl instanceof File)) {
      toast.error('Barcode must be a valid image file')
      return
    }

    try {
      await createTemplate.mutateAsync(data)

      designerMethods.reset(DEFAULT_DESIGNER_VALUES)

      toast.success('Template saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template')
    }
  }

  const onDeleteTemplate = async (id: number) => {
    if (!id) {
      toast.error('No template ID found for deletion')
      return
    }
    if (!(await confirmToast('Do you want to delete this template?'))) {
      return
    }

    setDeletingId(id)
    try {
      await deleteTemplate.mutateAsync(id)
      toast.success('Template deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template')
    } finally {
      setDeletingId(null)
    }
  }

  const onPreviewTemplate = async (id: number) => {
    if (!id) {
      toast.error('No template ID found for preview')
      return
    }

    setPreviewingId(id)
    try {
      const blob = await viewTemplate.mutateAsync(id)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to preview template')
    } finally {
      setPreviewingId(null)
    }
  }

  const onSearchSubmit: SubmitHandler<SearchFormValues> = (formData) => {
    const filtered = transformedStaff.filter(
      (s) =>
        (formData.department ? s.department === formData.department : true) &&
        (formData.designation ? s.designation === formData.designation : true),
    )
    setFilteredStaff(filtered)
    setHasSearched(true)
    setSelectedStaffIds([])
  }

  const handleGenerateCards = async () => {
    const selectedTemplateId = searchMethods.getValues('templateId')

    if (!selectedTemplateId) {
      toast.error('Please select a template first')
      return
    }
    if (selectedStaffIds.length === 0) {
      toast.error('Please select at least one staff member')
      return
    }

    setGeneratingCards(true)
    try {
      const templateId = parseInt(selectedTemplateId)
      const blob = await generateCards.mutateAsync({ templateId, staffIds: selectedStaffIds })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `staff_id_cards_${new Date().getTime()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast.success(
        `Generated ${selectedStaffIds.length} staff ID card${selectedStaffIds.length !== 1 ? 's' : ''} successfully!`,
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate staff ID cards')
    } finally {
      setGeneratingCards(false)
    }
  }

  const handleViewSwitch = () => {
    setCurrentView(currentView === 'designer' ? 'generator' : 'designer')
  }

  const optionalFields: (keyof StaffIdCardTemplateFormData)[] = [
    'staffCode',
    'designation',
    'department',
    'dateOfJoining',
    'dateOfBirth',
    'staffAddress',
    'bloodGroup',
    'signature',
    'circularProfilePicture',
    'headerBodyDividerLine',
  ]

  const fieldLabels: Record<string, string> = {
    staffCode: Text.Staff_Code,
    designation: Text.Designation,
    department: Text.Department,
    dateOfJoining: Text.Date_Of_Joining,
    dateOfBirth: Text.Date_Of_Birth,
    staffAddress: Text.Address,
    bloodGroup: Text.Blood_Group,
    signature: Text.Signature,
    circularProfilePicture: Text.Circular_Profile_Picture,
    headerBodyDividerLine: Text.Header_Body_Divider,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">
          {currentView === 'designer'
            ? Text.Staff_ID_Card_Template_Designer || 'Staff ID Card Template Designer'
            : Text.Generate_Staff_ID_Cards || 'Generate Staff ID Cards'}
        </h1>
        <Button
          loading={false}
          name={currentView === 'designer' ? Text.Generate_ID_Cards : Text.Back_To_Designer}
          onClick={handleViewSwitch}
          icon={<IconField name={currentView === 'designer' ? 'FaArrowRight' : 'FaArrowLeft'} />}
          showAlways={true}
        />
      </div>

      {currentView === 'designer' ? (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
          <div className="w-full lg:w-1/3 bg-white p-5 rounded-xl  shadow-sm max-h-[85vh] overflow-y-auto">
            <FormProvider {...designerMethods}>
              <AllSchoolDropdown
                onSubmit={designerMethods.handleSubmit(onSaveTemplate)}
                className="space-y-4"
                queryKeys={['staffIdCard', 'staff']}
              >
                <TextField
                  name="templateName"
                  label={Text.Template_Name || 'Template Name'}
                  control={designerMethods.control}
                  required
                />
                <TextField
                  name="schoolName"
                  label={Text.School_Name || 'School Name'}
                  control={designerMethods.control}
                  required
                />
                <TextField
                  name="tagLine"
                  label={Text.Tag_Line || 'Tag Line'}
                  control={designerMethods.control}
                />
                <TextField
                  name="address"
                  label={Text.Address || 'Address'}
                  placeholder='Address'
                  control={designerMethods.control}
                  required
                />

                <div className="grid grid-cols-1 gap-4 pt-4">
                  <FileUploadField
                    name="logo"
                    label={Text.Logo_Image || 'Logo Image'}
                    control={designerMethods.control}
                    required
                    accept="image/*"
                  />
                  <FileUploadField
                    name="backgroundImage"
                    label={Text.Front_Card_Background || 'Front Card Background Image'}
                    control={designerMethods.control}
                    accept="image/*"
                  />
                  <FileUploadField
                    name="backCardBackgroundImage"
                    label={Text.Back_Card_Background_optional || 'Back Card Background Image'}
                    control={designerMethods.control}
                    accept="image/*"
                  />
                  {/* <FileUploadField
                    name="barcodeUrl"
                    label={`Barcode/QR Code ${watchBarcode ? '' : ''}`}
                    control={designerMethods.control}
                    required={watchBarcode}
                    accept="image/*"
                  /> */}
                  {/* {watchBarcode && !watchBarcodeUrl && (
                    <p className="text-xs text-red-600 -mt-2">
                      Barcode image is required when barcode field is enabled
                    </p>
                  )} */}
                  <FileUploadField
                    name="sign"
                    label={
                      Text.Principal_Signature || `Principal Signature ${watchSignature ? '' : ''}`
                    }
                    control={designerMethods.control}
                    required={watchSignature}
                    accept="image/*"
                  />
                  {watchSignature && !watchSign && (
                    <p className="text-xs text-red-600 -mt-2">
                      Signature image is required when signature field is enabled
                    </p>
                  )}
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded border">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {Text.Colours || 'Colours'}
                  </p>
                  <ColorField
                    name="headerTextColor"
                    label={Text.Header_text || 'Header Text'}
                    control={designerMethods.control}
                  />
                  <ColorField
                    name="keyTextColor"
                    label={Text.Key_text || 'Key Text'}
                    control={designerMethods.control}
                  />
                  <ColorField
                    name="valueTextColor"
                    label={Text.Value_text || 'Value Text'}
                    control={designerMethods.control}
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded border">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {Text.Display_Fields || 'Display Fields'}
                  </p>

                  {optionalFields.map((field) => (
                    <div key={field} className="flex justify-between items-center">
                      <label className="text-sm">{fieldLabels[field] || field}</label>
                      <ToggleButton name={field as any} control={designerMethods.control} />
                    </div>
                  ))}
                </div>

                <Button
                  name={createTemplate.isPending ? 'Saving...' : Text.Save_Template || 'Save Template'}
                  loading={createTemplate.isPending}
                  icon={<IconField name="FaSave" />}
                />
              </AllSchoolDropdown>
            </FormProvider>
          </div>

          {/* Preview & Table Section */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">{Text.Saved_Templates || 'Saved Templates'}</h2>
              </div>

              {templatesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading templates...</span>
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No templates found. Create your first template!</p>
                </div>
              ) : (
                <>
                  <ControlledTable
                    title=""
                    columns={[
                      { key: 'templateName', label: Text.Template_Name || 'Template Name' },
                      { key: 'schoolName', label: Text.School_Name || 'School Name' },
                      { key: 'address', label: Text.Address || 'Address' },
                    ]}
                    data={tableData}
                    onDelete={(id) => onDeleteTemplate(id as number)}
                    onView={(id) => onPreviewTemplate(id as number)}
                    actionColumn={true}
                    loading={false}
                  />

                  {(deletingId || previewingId) && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      {deletingId && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                          Deleting template...
                        </div>
                      )}
                      {previewingId && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                          Opening template preview...
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Search Form */}
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">{Text.Select_Criteria || 'Select Criteria'}</h2>
            <AllSchoolDropdown
              className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4"
              onSubmit={searchMethods.handleSubmit(onSearchSubmit)}
              queryKeys={['Designations', 'Departments', 'staffIdCard']}
            >
              <Dropdown
                label={Text.Department || 'Department'}
                name="department"
                control={searchMethods.control}
                options={
                  departmentOptions.length > 0
                    ? departmentOptions
                    : [{ label: 'All Departments', value: '' }]
                }
              />
              <Dropdown
                label={Text.Designation || 'Designation'}
                name="designation"
                control={searchMethods.control}
                options={
                  designationOptions.length > 0
                    ? designationOptions
                    : [{ label: 'All Designations', value: '' }]
                }
              />
              <Dropdown
                label={Text.ID_Card_Template || 'ID Card Template'}
                name="templateId"
                control={searchMethods.control}
                options={tableData.map((t) => ({ label: t.templateName, value: t.id.toString() }))}
                required
              />
              <div className="md:col-span-3 flex justify-end">
                <Button
                  name={Text.Search_Staff || 'Search Staff'}
                  loading={staffLoading}
                  icon={<IconField name="FaSearch" />}
                  showAlways={true}
                />
              </div>
            </AllSchoolDropdown>
          </div>

          {hasSearched && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{Text.Staff_List || 'Staff List'}</h2>
                  <p className="text-sm text-gray-500">
                    {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} found
                    {selectedStaffIds.length > 0 && ` | ${selectedStaffIds.length} selected`}
                  </p>
                </div>

                <div className="flex gap-2">
                  {selectedStaffIds.length > 0 && (
                    <AllSchoolDropdown
                      onSubmit={handleGenerateCards}
                      queryKeys={['staffIdCard', 'staff']}
                    >
                      <Button
                        name={
                          generatingCards
                            ? 'Generating...'
                            : Text.Generate_ID_Cards || `Generate ID Cards (${selectedStaffIds.length})`
                        }
                        onClick={handleGenerateCards}
                        loading={generatingCards}
                        icon={<IconField name="FaPrint" />}
                        showAlways={true}
                      />

                      {filteredStaff.length > 0 && (
                        <Button
                          loading={false}
                          name={
                            selectedStaffIds.length === filteredStaff.length
                              ? 'Deselect All'
                              : Text.Select_All || 'Select All'
                          }
                          onClick={() => {
                            if (selectedStaffIds.length === filteredStaff.length) {
                              setSelectedStaffIds([])
                            } else {
                              setSelectedStaffIds(filteredStaff.map((s) => s.staffId))
                            }
                          }}
                        />
                      )}
                    </AllSchoolDropdown>
                  )}
                </div>
              </div>

              {staffLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading staff...</span>
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    {transformedStaff.length === 0
                      ? 'No staff members found in the system. Please add staff first.'
                      : 'No staff members found with the selected criteria.'}
                  </p>
                </div>
              ) : (
                <ControlledTable
                  columns={[
                    {
                      key: 'staffId',
                      label: Text.Select || 'Select',
                      render: (_value: any, row: StaffMemberForCard) => (
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.includes(row.staffId)}
                          onChange={() =>
                            setSelectedStaffIds((prev) =>
                              prev.includes(row.staffId)
                                ? prev.filter((i) => i !== row.staffId)
                                : [...prev, row.staffId],
                            )
                          }
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      ),
                    },
                    { key: 'name', label: Text.Name || 'Name' },
                    { key: 'department', label: Text.Department || 'Department' },
                    { key: 'designation', label: Text.Designation || 'Designation' },
                    { key: 'bloodGroup', label: 'Blood Group' },
                    { key: 'dob', label: Text.Date_Of_Birth || 'DOB' },
                    { key: 'doj', label: Text.Date_Of_Joining || 'DOJ' },
                  ]}
                  data={filteredStaff}
                  title=""
                  showSearch={true}
                  showSelectAll={false}
                  actionColumn={false}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StaffIDCard

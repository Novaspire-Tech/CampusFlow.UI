import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import NumberField from '../../../components/controlled/NumberField'
import MobileField from '../../../components/controlled/MobileField'
import TextField from '../../../components/controlled/TextField'
import { Button } from '../../../components/controlled'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useVehicles,
  useAddVehicle,
  useUpdateVehicle,
  useUpdateDriverDocument,
  useDeleteVehicle,
  useDeleteMultipleVehicles,
} from '../../../hooks/queries/transport/useVehicles'
import type { Vehicle as IVehicle } from '../../../types/transport/vehicle'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import FileUploadField from '../../../components/controlled/FileUploadField'
import { openDocument } from '../../../hooks/useBlobImage'
import AadharField from '../../../components/controlled/AadharField'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface VehicleFormData {
  document?: string | File | null
  vehicleNumber: string
  vehicleModel: string
  yearMade: string
  registrationNumber: string
  chassisNumber: string
  maxSeatingCapacity: string
  driverLicence: string
  driverContact: string
  driverName: string
  adhaarNumber: string
}

const VEHICLE_NUMBER = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/i
const VEHICLE_NUMBER_FORMAT_MSG = 'Invalid vehicle number format. Expected format: MH12AB1234 '

const Vehicle: React.FC = () => {
  const { data: vehiclesData = [], isLoading } = useVehicles()
  const { mutateAsync: addVehicle, isPending: isAdding } = useAddVehicle()
  const { mutateAsync: updateVehicle, isPending: isUpdating } = useUpdateVehicle()
  const { mutateAsync: updateVehicleDocument, isPending: isUpdatingDoc } = useUpdateDriverDocument()
  const { mutateAsync: deleteVehicle } = useDeleteVehicle()
  const { mutateAsync: deleteMultipleVehicles } = useDeleteMultipleVehicles()

  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [, setFormError] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<IVehicle | null>(null)
  const [existingDocument, setExistingDocument] = useState<string | null>(null)

  const { control, handleSubmit, reset, setError } = useForm<VehicleFormData>({
    defaultValues: {
      vehicleNumber: '',
      vehicleModel: '',
      yearMade: '',
      registrationNumber: '',
      chassisNumber: '',
      maxSeatingCapacity: '',
      driverLicence: '',
      driverContact: '',
      driverName: '',
      adhaarNumber: '',
      document: null,
    },
    mode: 'onChange',
  })

  const handleAddNew = () => {
    reset({
      vehicleNumber: '',
      vehicleModel: '',
      yearMade: '',
      registrationNumber: '',
      chassisNumber: '',
      maxSeatingCapacity: '',
      driverLicence: '',
      driverContact: '',
      driverName: '',
      adhaarNumber: '',
      document: null,
    })
    setEditingId(null)
    setExistingDocument(null)
    setFormError(null)
    setShowFormModal(true)
  }

  const onSubmit: SubmitHandler<VehicleFormData> = async (data) => {
    try {
      setFormError(null)

      if (!data.vehicleNumber?.trim()) {
        setError('vehicleNumber', { type: 'manual', message: 'Vehicle number is required' })
        toast.error('Vehicle number is required')
        return
      }

      if (!VEHICLE_NUMBER.test(data.vehicleNumber.trim())) {
        setError('vehicleNumber', { type: 'manual', message: VEHICLE_NUMBER_FORMAT_MSG })
        toast.error(VEHICLE_NUMBER_FORMAT_MSG)
        return
      }

      if (!data.driverName?.trim()) {
        setFormError('Driver name is required')
        toast.error('Driver name is required')
        return
      }

      if (!data.driverLicence?.trim()) {
        setFormError('Driver licence is required')
        toast.error('Driver licence is required')
        return
      }

      if (!data.adhaarNumber?.trim()) {
        setFormError('Aadhaar number is required')
        toast.error('Aadhaar number is required')
        return
      }

      const adhaarRegex = /^\d{12}$/
      if (data.adhaarNumber && !adhaarRegex.test(data.adhaarNumber.trim())) {
        setFormError('Aadhaar number must be exactly 12 digits')
        toast.error('Aadhaar number must be exactly 12 digits')
        return
      }

      if (data.yearMade) {
        const year = parseInt(data.yearMade)
        const currentYear = new Date().getFullYear()
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          const errorMsg = `Year made must be between 1900 and ${currentYear + 1}`
          setFormError(errorMsg)
          toast.error(errorMsg)
          return
        }
      }

      if (data.maxSeatingCapacity) {
        const capacity = parseInt(data.maxSeatingCapacity)
        if (isNaN(capacity) || capacity < 1 || capacity > 100) {
          setFormError('Max seating capacity must be between 1 and 100')
          toast.error('Max seating capacity must be between 1 and 100')
          return
        }
      }

      const payload = {
        vehicleNumber: data.vehicleNumber.trim().toUpperCase(),
        vehicleModel: data.vehicleModel?.trim() || '',
        yearMade: data.yearMade?.trim() || '',
        registrationNumber: data.registrationNumber?.trim() || '',
        chassisNumber: data.chassisNumber?.trim() || '',
        maxSeatingCapacity: data.maxSeatingCapacity?.trim() || '',
        driverLicence: data.driverLicence?.trim() || '',
        driverContact: data.driverContact?.trim() || '',
        driverName: data.driverName?.trim() || '',
        adhaarNumber: data.adhaarNumber?.trim() || '',
      }

      const documentFile = data.document instanceof File ? data.document : null

      if (editingId) {
        await updateVehicle({ id: editingId, data: payload })
        if (documentFile) {
          await updateVehicleDocument({ id: editingId, file: documentFile })
        }
        toast.success('Vehicle updated successfully!')
      } else {
        await addVehicle({ ...payload, document: documentFile })
        toast.success('Vehicle added successfully!')
      }

      resetForm()
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.response?.data?.message || 'Operation failed. Please try again.'
      setFormError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    reset({
      vehicleNumber: '',
      vehicleModel: '',
      yearMade: '',
      registrationNumber: '',
      chassisNumber: '',
      maxSeatingCapacity: '',
      driverLicence: '',
      driverContact: '',
      driverName: '',
      adhaarNumber: '',
      document: null,
    })
    setEditingId(null)
    setExistingDocument(null)
    setFormError(null)
    setShowFormModal(false)
  }

  const handleEdit = (id: string | number) => {
    const stringId = id.toString()
    const item = vehiclesData.find((v: IVehicle) => v.id.toString() === stringId)
    if (item) {
      reset({
        vehicleNumber: item.vehicleNumber || '',
        vehicleModel: item.vehicleModel || '',
        yearMade: item.yearMade || '',
        registrationNumber: item.registrationNumber || '',
        chassisNumber: item.chassisNumber || '',
        maxSeatingCapacity: item.maxSeatingCapacity || '',
        driverLicence: item.driverLicence || '',
        driverContact: item.driverContact || '',
        driverName: item.driverName || '',
        adhaarNumber: item.adhaarNumber || '',
        document: null,
      })
      setEditingId(stringId)
      setExistingDocument(item.document || null)
      setFormError(null)
      setShowFormModal(true)
    }
  }

  const handleView = (id: string | number) => {
    const stringId = id.toString()
    const item = vehiclesData.find((v: IVehicle) => v.id.toString() === stringId)
    if (item) setViewItem(item)
  }

  const handleDelete = async (id: string | number) => {
    if (await confirmToast('Do you want to delete this vehicle?')) {
      try {
        const stringId = id.toString()
        await deleteVehicle(stringId)
        toast.success('Vehicle deleted successfully!')
        if (editingId === stringId) resetForm()
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete vehicle.')
      }
    }
  }

  const handleDeleteAll = async (ids: (string | number)[]) => {
    if (await confirmToast(`Delete ${ids.length} selected vehicle(s)?`)) {
      try {
        const stringIds = ids.map((id) => id.toString())
        await deleteMultipleVehicles(stringIds)
        toast.success('Selected vehicles deleted successfully!')
        if (editingId !== null && stringIds.includes(editingId)) resetForm()
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete vehicles.')
      }
    }
  }

  const getFileName = (path?: string | null) => {
    if (!path) return ''
    return path.split('/').pop() || ''
  }

  const filteredData =
    vehiclesData
      ?.filter(
        (item: IVehicle) =>
          item.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.driverContact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.driverLicence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.yearMade?.includes(searchTerm) ||
          item.maxSeatingCapacity?.includes(searchTerm) ||
          item.adhaarNumber?.includes(searchTerm),
      )
      .map((item: IVehicle) => ({
        id: item.id,
        vehicleNumber: item.vehicleNumber || '-',
        vehicleModel: item.vehicleModel || '-',
        yearMade: item.yearMade || '-',
        registrationNumber: item.registrationNumber || '-',
        chassisNumber: item.chassisNumber || '-',
        maxSeatingCapacity: item.maxSeatingCapacity || '-',
        driverLicence: item.driverLicence || '-',
        driverContact: item.driverContact || '-',
        driverName: item.driverName || '-',
        adhaarNumber: item.adhaarNumber || '-',
      })) || []

  const { t } = useTranslation()
  const Vehicle_Text = getPagesDataText(t)
  const Add_Vehicle_Text = getPagesDataText(t)
  const Edit_Vehicle_Text = getPagesDataText(t)
  const Vehicle_Number_Text = getPagesDataText(t)
  const Vehicle_Model_Text = getPagesDataText(t)
  const Year_Made_Text = getPagesDataText(t)
  const Registration_Number_Text = getPagesDataText(t)
  const Chassis_Number_Text = getPagesDataText(t)
  const Max_Seating_Capacity_Text = getPagesDataText(t)
  const Driver_Licence_Text = getPagesDataText(t)
  const Driver_Contact_Text = getPagesDataText(t)
  const Driver_Name_Text = getPagesDataText(t)
  const Save_Text = getPagesDataText(t)
  const Update_Text = getPagesDataText(t)
  const Cancel_Text = getPagesDataText(t)
  const Close_Text = getPagesDataText(t)

  const columns = [
    { label: Vehicle_Number_Text.Vehicle_Number || 'Vehicle Number', key: 'vehicleNumber' },
    { label: Vehicle_Model_Text.Vehicle_Model || 'Vehicle Model', key: 'vehicleModel' },
    { label: Year_Made_Text.Year_Made || 'Year Made', key: 'yearMade' },
    {
      label: Registration_Number_Text.Registration_Number || 'Registration Number',
      key: 'registrationNumber',
    },
    { label: Chassis_Number_Text.Chassis_Number || 'Chassis Number', key: 'chassisNumber' },
    {
      label: Max_Seating_Capacity_Text.Max_Seating_Capacity || 'Max Seating Capacity',
      key: 'maxSeatingCapacity',
    },
    { label: Driver_Name_Text.Driver_Name || 'Driver Name', key: 'driverName' },
    { label: Driver_Licence_Text.Driver_Licence || 'Driver Licence', key: 'driverLicence' },
  ]

  const isSubmitting = isAdding || isUpdating || isUpdatingDoc

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-4">
      {showFormModal && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        >
          <div className="absolute inset-0" onClick={!isSubmitting ? resetForm : undefined} />

          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <h2 className="text-2xl font-bold">
                {editingId !== null
                  ? Edit_Vehicle_Text.Edit_Vehicle || 'Edit Vehicle'
                  : Add_Vehicle_Text.Add_Vehicle || 'Add Vehicle'}
              </h2>
            </div>

            {/* Form */}
            <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 mb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  name="vehicleNumber"
                  label={Vehicle_Number_Text.Vehicle_Number || 'Vehicle Number'}
                  placeholder="Enter vehicle number "
                  control={control}
                  required
                  rules={{ required: 'Vehicle number is required' }}
                />
                <TextField
                  name="vehicleModel"
                  label={Vehicle_Model_Text.Vehicle_Model || 'Vehicle Model'}
                  placeholder="Enter vehicle model"
                  required
                  control={control}
                />
                <NumberField
                  name="yearMade"
                  label={Year_Made_Text.Year_Made || 'Year Made'}
                  placeholder="Enter year made"
                  control={control}
                  required
                  rules={{
                    min: { value: 1900, message: 'Year must be 1900 or later' },
                    max: {
                      value: new Date().getFullYear() + 1,
                      message: `Year must not exceed ${new Date().getFullYear() + 1}`,
                    },
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  name="registrationNumber"
                  label={Registration_Number_Text.Registration_Number || 'Registration Number'}
                  placeholder="Enter registration number"
                  required
                  control={control}
                />
                <TextField
                  name="chassisNumber"
                  label={Chassis_Number_Text.Chassis_Number || 'Chassis Number'}
                  placeholder="Enter chassis number"
                  required
                  control={control}
                />
                <NumberField
                  name="maxSeatingCapacity"
                  label={Max_Seating_Capacity_Text.Max_Seating_Capacity || 'Max Seating Capacity'}
                  placeholder="Enter max seating capacity"
                  required
                  control={control}
                  rules={{
                    min: { value: 1, message: 'Capacity must be at least 1' },
                    max: { value: 100, message: 'Capacity must not exceed 100' },
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  name="driverName"
                  label={Driver_Name_Text.Driver_Name || 'Driver Name'}
                  placeholder="Enter driver name"
                  required
                  control={control}
                />
                <TextField
                  name="driverLicence"
                  label={Driver_Licence_Text.Driver_Licence || 'Driver Licence'}
                  placeholder="Enter driver licence"
                  required
                  control={control}
                />
                <AadharField
                  name="adhaarNumber"
                  label="Aadhar Number"
                  control={control}
                  required
                  placeholder="Enter 12 digit Aadhar number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MobileField
                  name="driverContact"
                  label={Driver_Contact_Text.Driver_Contact || 'Driver Contact'}
                  placeholder="Enter driver contact"
                  control={control}
                  required
                />
                <div className="md:col-span-2 space-y-3">
                  {editingId && existingDocument && (
                    <div className="p-3 border rounded bg-gray-50">
                      <p className="text-sm text-gray-600 mb-1">Previously uploaded document</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {getFileName(existingDocument)}
                        </p>
                        <button
                          type="button"
                          onClick={() => openDocument(existingDocument)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )}
                  <FileUploadField
                    name="document"
                    label={editingId ? 'Update Document (Optional)' : 'Attach Document'}
                    control={control}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  name={Cancel_Text.Cancel || 'Cancel'}
                  onClick={resetForm}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                  type="button"
                />
                <Button
                  name={editingId ? Update_Text.Update || 'Update' : Save_Text.Save || 'Save'}
                  loading={isSubmitting}
                  icon={<IconField name="FaSave" />}
                  permissionScope="TRANSPORT"
                  permissionType={editingId ? 'UPDATE' : 'CREATE'}
                  enablePermissions={true}
                  type="submit"
                />
              </div>
            </AllSchoolDropdown>
          </div>
        </div>
      )}

      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 border-b pb-3">Vehicle Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  {Vehicle_Number_Text.Vehicle_Number || 'Vehicle Number'}
                </p>
                <p className="font-semibold">{viewItem.vehicleNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {Vehicle_Model_Text.Vehicle_Model || 'Vehicle Model'}
                </p>
                <p className="font-semibold">{viewItem.vehicleModel || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{Year_Made_Text.Year_Made || 'Year Made'}</p>
                <p className="font-semibold">{viewItem.yearMade || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {Registration_Number_Text.Registration_Number || 'Registration Number'}
                </p>
                <p className="font-semibold">{viewItem.registrationNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {Chassis_Number_Text.Chassis_Number || 'Chassis Number'}
                </p>
                <p className="font-semibold">{viewItem.chassisNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {Max_Seating_Capacity_Text.Max_Seating_Capacity || 'Max Seating Capacity'}
                </p>
                <p className="font-semibold">{viewItem.maxSeatingCapacity || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {Driver_Name_Text.Driver_Name || 'Driver Name'}
                </p>
                <p className="font-semibold">{viewItem.driverName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {Driver_Licence_Text.Driver_Licence || 'Driver Licence'}
                </p>
                <p className="font-semibold">{viewItem.driverLicence || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {Driver_Contact_Text.Driver_Contact || 'Driver Contact'}
                </p>
                <p className="font-semibold">{viewItem.driverContact || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Aadhaar Number</p>
                <p className="font-semibold">{viewItem.adhaarNumber || '-'}</p>
              </div>
            </div>

            {viewItem.document && (
              <div className="pt-4 border-t mt-4">
                <p className="text-sm text-gray-600 mb-2">Document</p>
                <button
                  onClick={() => {
                    if (viewItem.document) openDocument(viewItem.document)
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <IconField name="FaDownload" />
                  <span className="ml-2">View/Download Document</span>
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button
                name={Close_Text.Close || 'Close'}
                loading={false}
                onClick={() => setViewItem(null)}
                icon={<IconField name="FaTimes" />}
              />
            </div>
          </div>
        </div>
      )}

      <ControlledTable
        data={filteredData}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onDeleteMultiple={handleDeleteAll}
        title={Vehicle_Text.Vehicle || 'Vehicle'}
        btn={true}
        btnName={Add_Vehicle_Text.Add_Vehicle || 'Add Vehicle'}
        showForm={handleAddNew}
        actionColumn={true}
        showSelectAll={false}
        enablePermissions={true}
        permissionScope="TRANSPORT"
      />
    </div>
  )
}

export default Vehicle

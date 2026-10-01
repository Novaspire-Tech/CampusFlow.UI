import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextField from '../../../components/controlled/TextField'
import { Button } from '../../../components/controlled'
import { IconField } from '../../../components'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'
import {
  usePickupPoints,
  useAddPickupPoint,
  useUpdatePickupPoint,
  useDeletePickupPoint,
  useDeleteMultiplePickupPoints,
} from '../../../hooks/queries/transport/usePickupPoints'
import type { PickupPoint as IPickupPoint } from '../../../types/transport/pickupPoint'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface PickupPointForm {
  pickUpPointName: string
}

const EMPTY_FORM: PickupPointForm = { pickUpPointName: '' }

export default function PickupPoint() {
  const { data: pickupPoints = [], isLoading } = usePickupPoints()
  const { mutateAsync: addPickupPoint } = useAddPickupPoint()
  const { mutateAsync: updatePickupPoint } = useUpdatePickupPoint()
  const { mutateAsync: deletePickupPoint } = useDeletePickupPoint()
  const { mutateAsync: deleteMultiplePickupPoints } = useDeleteMultiplePickupPoints()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { control, handleSubmit, reset } = useForm<PickupPointForm>({
    defaultValues: EMPTY_FORM,
  })

  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const handleCancel = () => {
    reset(EMPTY_FORM)
    setEditingId(null)
    setFormError(null)
  }

  const validateFormData = (data: PickupPointForm): boolean => {
    if (!data.pickUpPointName || data.pickUpPointName.trim() === '') {
      setFormError('Pickup point name is required')
      return false
    }
    const nameRegex = /^[A-Za-z\s]+$/
    if (!nameRegex.test(data.pickUpPointName.trim())) {
      setFormError('Pickup point name can only contain letters and spaces')
      return false
    }
    setFormError(null)
    return true
  }

  const onSubmit: SubmitHandler<PickupPointForm> = async (data) => {
    if (!validateFormData(data)) return
    try {
      if (editingId !== null) {
        await updatePickupPoint({ id: editingId, data })
        toast.success('Pickup point updated successfully!')
      } else {
        await addPickupPoint(data)
        toast.success('Pickup point created successfully!')
      }
      reset(EMPTY_FORM)
      setEditingId(null)
      setFormError(null)
    } catch (error: any) {
      setFormError(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (id: string | number) => {
    const stringId = id.toString()
    const item = pickupPoints.find((d: IPickupPoint) => d.id === stringId)
    if (item) {
      reset({ pickUpPointName: item.pickUpPointName || item.name || '' })
      setEditingId(stringId)
      setFormError(null)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (await confirmToast('Do you want to delete this pickup point?')) {
      try {
        const stringId = id.toString()
        await deletePickupPoint(stringId)
        toast.success('Pickup point deleted successfully!')
        if (editingId === stringId) handleCancel()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete pickup point.')
      }
    }
  }

  const handleDeleteAll = async (ids: (string | number)[]) => {
    if (await confirmToast(`Delete ${ids.length} selected pickup point(s)?`)) {
      try {
        const stringIds = ids.map((id) => id.toString())
        await deleteMultiplePickupPoints(stringIds)
        toast.success('Selected pickup points deleted successfully!')
        if (editingId !== null && stringIds.includes(editingId)) handleCancel()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete multiple pickup points.')
      }
    }
  }

  const filteredData = pickupPoints
    .filter((item: IPickupPoint) =>
      (item.pickUpPointName || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((item: IPickupPoint) => ({
      id: item.id,
      pickUpPointName: item.pickUpPointName || item.name || '-',
    }))

  const columns = [
    {
      label: Text.Pickup_Point_Name || 'Pickup Point Name',
      key: 'pickUpPointName',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pickup points data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch p-4 space-y-4 lg:space-y-0 w-full">
      <div className="w-full lg:w-1/3 p-4 bg-white rounded-md shadow-2xl mt-4 self-stretch">
        {' '}
        <h1 className="mb-4 text-black text-xl font-medium capitalize">
          {editingId !== null
            ? Text.Edit_Pickup_Point || 'Edit Pickup Point'
            : Text.Add_Pickup_Point || 'Add Pickup Point'}
        </h1>
        {formError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {formError}
          </div>
        )}
        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="pickUpPointName"
            label={Text.Pickup_Point_Name || 'Pickup Point Name'}
            control={control}
            required
            placeholder="Enter pickup point name"
          />

          <div className="flex items-center justify-end gap-2 mt-4">
            {editingId !== null && (
              <Button
                name={Text.Cancel || 'Cancel'}
                loading={false}
                icon={<IconField name="FaTimes" size={16} />}
                onClick={handleCancel}
                type="button"
              />
            )}
            <Button
              name={editingId !== null ? Text.Update || 'Update' : Text.Save || 'Save'}
              loading={false}
              icon={<IconField name="FaSave" size={16} />}
              permissionScope="TRANSPORT"
              permissionType={editingId ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
            />
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="p-2 w-full lg:w-2/3">
        <ControlledTable
          data={filteredData}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteAll}
          title={Text.Pickup_Point_List || 'Pickup Points'}
          actionColumn={true}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="TRANSPORT"
        />
      </div>
    </div>
  )
}

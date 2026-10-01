import React, { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import TextFields from '../../../../components/controlled/TextField'
import TextAreaField from '../../../../components/controlled/TextareaField'
import ControlledTable from '../../../../components/uncontrolled/ControlledTable'
import Button from '../../../../components/controlled/Button'
import { IconField } from '../../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../../helpers/useTranslations'
import {
  useComplaintTypes,
  useAddComplaintType,
  useUpdateComplaintType,
  useDeleteComplaintType,
  useDeleteMultipleComplaintTypes,
} from '../../../../hooks/queries/frontOffice/setupFrontOffice/useComplaintType'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../../components/uncontrolled/AllSchoolDropdown'

const ComplaintType = () => {
  const [search, setSearch] = useState<string>('')
  const [editIndex, setEditIndex] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: complaintTypes = [], isLoading } = useComplaintTypes()
  const { mutateAsync: addComplaintType } = useAddComplaintType()
  const { mutateAsync: updateComplaintType } = useUpdateComplaintType()
  const { mutateAsync: deleteComplaintTypeMutation } = useDeleteComplaintType()
  const { mutateAsync: deleteMultipleMutation } = useDeleteMultipleComplaintTypes()

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { complaintType: '', description: '' },
  })

  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const handleFormSubmit = async (_e: React.FormEvent) => {
    await handleSubmit(async (data: FieldValues) => {
      setIsSubmitting(true)
      try {
        if (editIndex !== null) {
          const complaintTypeToUpdate = complaintTypes.find(
            (item: { id: string }) => item.id === editIndex,
          )
          if (complaintTypeToUpdate) {
            const updateData: any = {
              ...complaintTypeToUpdate,
              complaintType: data.complaintType.trim(),
            }
            if (data.description && data.description.trim()) {
              updateData.description = data.description.trim()
            }
            await updateComplaintType({ id: editIndex, data: updateData })
            toast.success('Complaint type updated successfully')
          }
          setEditIndex(null)
        } else {
          const createData: any = {
            complaintType: data.complaintType.trim(),
            status: 'Active',
          }
          if (data.description && data.description.trim()) {
            createData.description = data.description.trim()
          }
          await addComplaintType(createData)
          toast.success('Complaint type added successfully')
        }
        reset()
      } catch (error: any) {
        toast.error(error.message || 'Operation failed. Please try again.')
        throw error
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  const handleEdit = (id: string | number) => {
    const complaintTypeId = id.toString()
    const item = complaintTypes.find((h: { id: string }) => h.id === complaintTypeId)
    if (!item) return
    setValue('complaintType', item.complaintType)
    setValue('description', item.description || '')
    setEditIndex(complaintTypeId)
  }

  const handleDelete = async (id: number | string) => {
    const confirm = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (confirm) {
      try {
        await deleteComplaintTypeMutation(id.toString())
        toast.success('Complaint type deleted successfully.')
        reset()
        setEditIndex(null)
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete complaint type.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    const confirm = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (confirm) {
      try {
        const stringIds = ids.map((id) => id.toString())
        await deleteMultipleMutation(stringIds)
        toast.success('Selected complaint types and all their linked records deleted successfully.')
        reset()
        setEditIndex(null)
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete complaint types.')
      }
    }
  }

  const filteredData = complaintTypes
    .filter(
      (item: { complaintType: string; description: any }) =>
        item.complaintType.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase()),
    )
    .map((item: { id: any; complaintType: any; description: any }) => ({
      id: item.id,
      complaintType: item.complaintType,
      description: item.description || '',
    }))

  const columns = [
    { key: 'complaintType', label: texts.Complaint_Type },
    { key: 'description', label: texts.Description },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading complaint types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editIndex !== null ? texts.Edit_Complaint_Type : texts.Add_Complaint_Type}
        </h2>

        <AllSchoolDropdown onSubmit={handleFormSubmit}>
          <>
            <TextFields
              name="complaintType"
              label={texts.Complaint_Type}
              control={control}
              placeholder={texts.Enter_complaint_type}
              required={true}
            />
            <TextAreaField
              name="description"
              label={texts.Description}
              control={control}
              placeholder={texts.Write_description}
            />

            <div className="flex gap-2">
              <Button
                name={editIndex !== null ? texts.Update || 'Update' : texts.Save || 'Save'}
                loading={isSubmitting}
                icon={<IconField name="FaSave" />}
                permissionScope="FRONT_OFFICE"
                permissionType={editIndex !== null ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                type="submit"
              />
              {editIndex !== null && (
                <Button
                  name={texts.Cancel || 'Cancel'}
                  onClick={() => {
                    setEditIndex(null)
                    reset()
                  }}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                />
              )}
            </div>
          </>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={texts.Complaint_Type_List}
          columns={columns}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="FRONT_OFFICE"
        />
      </div>
    </div>
  )
}

export default ComplaintType

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import NameField from '../../../components/controlled/NameField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextAreaField from '../../../components/controlled/TextareaField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFeeTypes,
  useAddFeeType,
  useUpdateFeeType,
  useDeleteFeeType,
  useDeleteMultipleFeeTypes,
} from '../../../hooks/queries/feesCollection/useFeeTypes'
import type { FeeType } from '../../../types/feesCollection/feeType'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface FeeTypeFormValues {
  name: string
  description: string
}

const FeeTypePage = () => {
  const [search, setSearch] = useState<string>('')
  const [editId, setEditId] = useState<string | null>(null)

  const { t } = useTranslation()
  const texts = getPagesDataText(t)
  const { data: feeTypes = [], isLoading } = useFeeTypes()
  const { mutateAsync: addFeeType } = useAddFeeType()
  const { mutateAsync: updateFeeType } = useUpdateFeeType()
  const { mutateAsync: deleteFeeType } = useDeleteFeeType()
  const { mutateAsync: deleteMultipleFeeTypes } = useDeleteMultipleFeeTypes()

  const { control, handleSubmit, reset, setValue } = useForm<FeeTypeFormValues>({
    defaultValues: { name: '', description: '' },
  })
  const onSubmit = async (data: FeeTypeFormValues): Promise<void> => {
    try {
      if (editId !== null) {
        const existing = feeTypes.find((item) => item.id === editId)
        if (!existing) return

        await updateFeeType({
          id: editId,
          data: {
            ...existing,
            name: data.name,
            description: data.description,
          },
        })
        toast.success('Fee type updated successfully')
        setEditId(null)
      } else {
        await addFeeType({
          name: data.name,
          description: data.description,
          feeCode: '',
          status: 'Active',
        })
        toast.success('Fee type added successfully')
      }
      reset()
    } catch (error: any) {
      toast.error(error.message ?? 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (id: string | number): void => {
    const strId = id.toString()
    const item = feeTypes.find((f) => f.id === strId)
    if (!item) return

    setValue('name', item.name)
    setValue('description', item.description)
    setEditId(strId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number): Promise<void> => {
    const strId = id.toString()
    const confirmed = await confirmToast(
      texts.Do_you_want_to_delete_this_entry ?? 'Do you want to delete this fee type?',
    )
    if (!confirmed) return

    try {
      await deleteFeeType(strId)
      toast.success('Fee type deleted successfully.')
      if (editId === strId) {
        setEditId(null)
        reset()
      }
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to delete fee type.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]): Promise<void> => {
    const strIds = ids.map((id) => id.toString())
    const confirmed = await confirmToast(
      texts.Delete_A ?? 'Do you want to delete selected fee types?',
    )
    if (!confirmed) return

    try {
      await deleteMultipleFeeTypes(strIds)
      toast.success(`${strIds.length} fee type(s) deleted successfully.`)

      if (editId !== null && strIds.includes(editId)) {
        setEditId(null)
        reset()
      }
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to delete fee types.')
    }
  }

  const handleCancel = (): void => {
    setEditId(null)
    reset()
  }

  const lowerSearch = search.toLowerCase()
  const filteredData: FeeType[] = feeTypes.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerSearch) ||
      item.description.toLowerCase().includes(lowerSearch),
  )

  const columns = [
    { key: 'name', label: texts.Name ?? 'Name' },
    { key: 'description', label: texts.Description ?? 'Description' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading fee types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editId !== null ? texts.Edit : texts.Add_Fees_Type}
        </h2>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <NameField
            name="name"
            label={texts.Name}
            control={control}
            placeholder={texts.Enter_name}
            required
          />
          <TextAreaField
            name="description"
            label={texts.Description}
            control={control}
            placeholder={texts.Description_Plaseholder}
            required={false}
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              name={editId !== null ? texts.Update : texts.Save}
              loading={false}
              permissionScope="FEES"
              permissionType={editId !== null ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
              icon={<IconField name={editId !== null ? 'FaEdit' : 'FaSave'} />}
            />
            {editId !== null && (
              <Button
                name={texts.Cancel ?? 'Cancel'}
                loading={false}
                icon={<IconField name="FaTimes" />}
                onClick={handleCancel}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={texts.Fees_Type_List ?? 'Fee Type List'}
          columns={columns}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="FEES"
        />
      </div>
    </div>
  )
}

export default FeeTypePage
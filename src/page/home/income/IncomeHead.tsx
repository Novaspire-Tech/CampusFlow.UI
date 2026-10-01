import React, { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import NameField from '../../../components/controlled/NameField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextAreaField from '../../../components/controlled/TextareaField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useIncomeHeads,
  useAddIncomeHead,
  useUpdateIncomeHead,
  useDeleteIncomeHead,
  useDeleteMultipleIncomeHeads,
} from '../../../hooks/queries/income/useIncomeHeads'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const IncomeHead = () => {
  const [search, setSearch] = useState<string>('')
  const [editIndex, setEditIndex] = useState<string | null>(null)

  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const { data: incomeHeads = [], isLoading } = useIncomeHeads()
  const { mutateAsync: addIncomeHead } = useAddIncomeHead()
  const { mutateAsync: updateIncomeHead } = useUpdateIncomeHead()
  const { mutateAsync: deleteIncomeHead } = useDeleteIncomeHead()
  const { mutateAsync: deleteMultipleIncomeHeads } = useDeleteMultipleIncomeHeads()

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { name: '', description: '' },
  })

  const onSubmit = async (data: FieldValues): Promise<void> => {
    try {
      if (editIndex !== null) {
        const existing = (incomeHeads as any[]).find((h) => h.id === editIndex)
        if (existing) {
          await updateIncomeHead({
            id: editIndex,
            data: {
              ...existing,
              name: data.name,
              description: data.description || '',
            },
          })
          toast.success('Income head updated successfully')
        }
        setEditIndex(null)
      } else {
        await addIncomeHead({
          name: data.name,
          description: data.description || '',
          status: 'Active',
        })
        toast.success('Income head added successfully')
      }
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (id: string | number): void => {
    const headId = id.toString()
    const item = (incomeHeads as any[]).find((h) => h.id === headId)
    if (!item) return
    setValue('name', item.name)
    setValue('description', item.description || '')
    setEditIndex(headId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number): Promise<void> => {
    if (
      await confirmToast(
        texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this income head?',
      )
    ) {
      try {
        await deleteIncomeHead(id.toString())
        toast.success('Income head deleted successfully.')
        if (editIndex === id.toString()) {
          setEditIndex(null)
          reset()
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete income head.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]): Promise<void> => {
    if (await confirmToast(texts.Delete_A || 'Do you want to delete selected income heads?')) {
      try {
        await deleteMultipleIncomeHeads(ids.map((id) => id.toString()))
        toast.success(`${ids.length} income head(s) deleted successfully.`)

        if (editIndex !== null && ids.map(String).includes(editIndex)) {
          setEditIndex(null)
          reset()
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || error.message || 'Failed to delete income heads.',
        )
      }
    }
  }

  const handleCancel = (): void => {
    setEditIndex(null)
    reset()
  }

  const filteredData = (incomeHeads as any[])
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase()),
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
    }))

  const columns = [
    { key: 'name', label: texts.Income_Head || 'Income Head' },
    { key: 'description', label: texts.Description || 'Description' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editIndex !== null ? texts.Edit || 'Edit Income Head' : texts.Add || 'Add Income Head'}
        </h2>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <NameField
            name="name"
            label={texts.Income_Head || 'Income Head'}
            control={control}
            placeholder={texts.Income_Head || 'Income Head'}
            required={true}
          />
          <TextAreaField
            name="description"
            label={texts.Description || 'Description'}
            control={control}
            placeholder={texts.Description_Plaseholder || 'Enter Description'}
            required={false}
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              name={editIndex !== null ? texts.Update || 'Update' : texts.Save || 'Save'}
              loading={false}
              permissionScope="INCOME"
              permissionType={editIndex !== null ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
              icon={<IconField name={editIndex !== null ? 'FaEdit' : 'FaSave'} />}
            />
            {editIndex !== null && (
              <Button
                name={texts.Cancel || 'Cancel'}
                onClick={handleCancel}
                loading={false}
                icon={<IconField name="FaTimes" />}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={texts.Income_List || 'Income List'}
          columns={columns}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="INCOME"
        />
      </div>
    </div>
  )
}

export default IncomeHead

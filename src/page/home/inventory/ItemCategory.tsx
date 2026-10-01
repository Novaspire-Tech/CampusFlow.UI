import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import TextField from '../../../components/controlled/TextField'
import TextAreaField from '../../../components/controlled/TextareaField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import {
  useItemCategories,
  useAddItemCategory,
  useUpdateItemCategory,
  useDeleteItemCategory,
  useDeleteMultipleItemCategories,
} from '../../../hooks/queries/inventory/useItemCategory'
import type { ItemCategoryFormData } from '../../../types/inventory/ItemCategory'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const ItemCategoryPage: React.FC = () => {
  const { control, handleSubmit, reset, setValue } = useForm<ItemCategoryFormData>({
    defaultValues: { itemCategory: '', description: '' },
  })

  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: categories = [], isLoading, error: fetchError } = useItemCategories()
  const addCategory = useAddItemCategory()
  const updateCategory = useUpdateItemCategory()
  const deleteCategory = useDeleteItemCategory()
  const deleteMultipleCategories = useDeleteMultipleItemCategories()

  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const Page = getPagesNameText(t)

  const resetForm = () => {
    reset({ itemCategory: '', description: '' })
    setEditId(null)
  }

  const onSubmit = (data: ItemCategoryFormData) => {
    if (editId !== null) {
      updateCategory.mutate(
        { id: editId, data },
        {
          onSuccess: () => {
            toast.success('Item category updated successfully!')
            resetForm()
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update item category.')
          },
        }
      )
    } else {
      addCategory.mutate(data, {
        onSuccess: () => {
          toast.success('Item category added successfully!')
          resetForm()
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Failed to add item category.')
        },
      })
    }
  }

  const handleEdit = (id: string | number) => {
    const numericId = typeof id === 'string' ? Number(id) : id
    const category = categories.find((c) => c.itemCategoryId === numericId)
    if (!category) {
      toast.error('Item category not found.')
      return
    }
    setValue('itemCategory', category.itemCategory)
    setValue('description', category.description)
    setEditId(numericId)
  }

  const handleDelete = async (id: string | number) => {
    const numericId = typeof id === 'string' ? Number(id) : id
    if (await confirmToast(Text.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?')) {
      deleteCategory.mutate(numericId, {
        onSuccess: () => {
          toast.success('Item category deleted successfully!')
          if (editId === numericId) resetForm()
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Failed to delete item category.')
        },
      })
    }
  }

  const handleMultipleDelete = async (ids: (string | number)[]) => {
    if (!ids.length) {
      toast.error('No items selected.')
      return
    }
    if (await confirmToast(Text.Delete_A || 'Do you want to delete selected entries?')) {
      const numericIds = ids.map((id) => (typeof id === 'string' ? Number(id) : id))
      deleteMultipleCategories.mutate(numericIds, {
        onSuccess: () => {
          toast.success('Item categories deleted successfully!')
          resetForm()
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Failed to delete item categories.')
        },
      })
    }
  }

  const filteredData = categories.filter(
    (cat) =>
      cat.itemCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  const tableData = filteredData.map((cat) => ({
    ...cat,
    id: cat.itemCategoryId,
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">{Text.Loading}</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load item categories. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-2xl p-5">
        <h1 className="text-xl font-bold mb-4">
          {editId ? Text.Edit : Text.Add} {Page.Item_Category}
        </h1>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="itemCategory"
            label={Page.Item_Category}
            control={control}
            required
            placeholder={Text.Enter_Item_Category}
            disabled={editId !== null}
            inputClassName={
              editId !== null ? 'cursor-not-allowed bg-gray-100 opacity-75' : ''
            }
          />
          <TextAreaField
            name="description"
            label={Text.Description}
            placeholder={Text.Enter_Description}
            control={control}
          />
          <div className="flex gap-4 pt-2">
            <Button
              name={editId ? Text.Update : Text.Save}
              loading={addCategory.isPending || updateCategory.isPending}
              icon={<IconField name="FaSave" />}
              permissionScope="INVENTORY"
              permissionType={editId ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
            />
            {editId && (
              <Button
                name={Text.Cancel}
                icon={<IconField name="FaTimes" />}
                onClick={resetForm}
                loading={false}
                showAlways={true}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3 bg-white p-4 rounded-2xl shadow-xl">
        <ControlledTable
          title={Text.Item_Category_List}
          columns={[
            { key: 'itemCategory', label: Page.Item_Category },
            { key: 'description', label: Text.Description },
          ]}
          data={tableData}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleMultipleDelete}
          enablePermissions={true}
          permissionScope="INVENTORY"
        />
      </div>
    </div>
  )
}

export default ItemCategoryPage
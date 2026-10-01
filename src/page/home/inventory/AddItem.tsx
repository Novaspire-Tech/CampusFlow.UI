import React, { useState, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import TextField from '../../../components/controlled/TextField'
import TextAreaField from '../../../components/controlled/TextareaField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterItems,
  useAddItems,
  useUpdateItems,
  useDeleteItem,
  useDeleteMultipleItems,
} from '../../../hooks/queries/inventory/useAddItems'
import type { AddItemsFilterParams } from '../../../services/inventory/addItemsService'
import type { AddItemsFormData } from '../../../types/inventory/AddItems'
import { NumberField } from '../../../components/controlled'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const AddItem: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [activeFilters, setActiveFilters] = useState<AddItemsFilterParams>({})
  const [editId, setEditId] = useState<number | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<AddItemsFormData>({
    defaultValues: { item: '', unit: '', quantity: '', description: '' },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterSearch: '' },
  })

  const {
    data: allItems = [],
    isLoading,
    isFetching,
    error: fetchError,
  } = useFilterItems(activeFilters)

  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const pagedItems = useMemo(() => {
    const start = page * pageSize
    return allItems.slice(start, start + pageSize)
  }, [allItems, page, pageSize])

  const addItem = useAddItems()
  const updateItem = useUpdateItems()
  const deleteItem = useDeleteItem()
  const deleteMultiple = useDeleteMultipleItems()

  const handlePageChange = (newPage: number) => setPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: AddItemsFilterParams = {}
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterSearch: '' })
    setActiveFilters({})
    setPage(0)
  }

  const resetForm = () => {
    reset({ item: '', unit: '', quantity: '', description: '' })
    setEditId(null)
  }

  const onSubmit = (data: AddItemsFormData) => {
    if (editId !== null) {
      updateItem.mutate(
        { id: editId, data },
        {
          onSuccess: () => {
            toast.success('Item updated successfully!')
            resetForm()
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || error?.message || 'Failed to update item.',
            )
          },
        },
      )
    } else {
      addItem.mutate(data, {
        onSuccess: () => {
          toast.success('Item added successfully!')
          resetForm()
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || error?.message || 'Failed to add item.')
        },
      })
    }
  }

  const onEdit = (id: number | string) => {
    const numericId = Number(id)
    const item = allItems.find((i) => i.addItemId === numericId)
    if (!item) {
      toast.error('Item not found.')
      return
    }
    setValue('item', item.item)
    setValue('unit', item.unit ?? '')
    setValue('quantity', item.quantity)
    setValue('description', item.description ?? '')
    setEditId(numericId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onDelete = async (id: number | string) => {
    const numericId = Number(id)
    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return
    deleteItem.mutate(numericId, {
      onSuccess: () => {
        toast.success('Item deleted successfully!')
        if (editId === numericId) resetForm()
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete item.')
      },
    })
  }

  const onDeleteMultiple = async (ids: (number | string)[]) => {
    const itemIds = ids.map(Number).filter((id) => !isNaN(id))
    if (!itemIds.length) {
      toast.error('No valid items selected.')
      return
    }
    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return
    deleteMultiple.mutate(itemIds, {
      onSuccess: () => {
        toast.success('Items deleted successfully!')
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete items.')
      },
    })
  }

  const tableData = pagedItems.map((i) => ({ ...i, id: i.addItemId }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to load items. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 w-full bg-gray-100">

      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-xl p-5">
        <h2 className="text-lg font-semibold mb-4">
          {editId ? Text.Edit : Text.Add} {Text.Item}
        </h2>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} >
          <TextField
            name="item"
            label={Text.Item}
            control={control}
            placeholder={Text.Enter_Item}
            required
          />
          <NumberField
            name="quantity"
            label={Text.Quantity}
            control={control}
            placeholder={Text.Enter_Quantity}
            required
          />
          <TextField
            name="unit"
            label={Text.Unit}
            control={control}
            placeholder={Text.Enter_Unit}
            required
          />
          <TextAreaField
            name="description"
            label={Text.Description}
            control={control}
            placeholder={Text.Enter_Description}
          />

          <div className="flex gap-4">
            <Button
              name={editId ? Text.Update : Text.Save}
              onClick={handleSubmit(onSubmit)}
              loading={addItem.isPending || updateItem.isPending}
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
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>


      <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-xl p-4">

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-4">
            <div className="w-full sm:flex-1">
              <TextField
                label={Text.Search}
                name="filterSearch"
                placeholder={Text.Search_By_Item}
                control={filterControl}
              />
            </div>
            <div className="flex items-end gap-2 lg:mb-2 md:mb-1 pb-2px">
              <Button
                onClick={handleClearFilters}
                name={Text.Cancel}
                loading={false}
                icon={<IconField name="FaTimes" />}
                showAlways={true}
              />
              <Button name={Text.Search} loading={isFetching} icon={<IconField name="FaSearch" />} showAlways={true} />
            </div>
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative overflow-auto">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
            </div>
          )}

          <ControlledTable
            title={Text.Item_List}
            columns={[
              { key: 'item', label: Text.Item },
              { key: 'quantity', label: Text.Quantity },
              { key: 'unit', label: Text.Unit },
              { key: 'description', label: Text.Description },
            ]}
            data={tableData}
            fullData={tableData}
            showSearch={false}
            btn={false}
            onEdit={onEdit}
            onDelete={onDelete}
            onDeleteMultiple={onDeleteMultiple}
            showSelectAll
            enablePermissions={true}
            permissionScope="INVENTORY"
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

export default AddItem

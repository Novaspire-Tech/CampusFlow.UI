import { useState, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import DateField from '../../../components/controlled/DateField'
import Dropdown from '../../../components/controlled/Dropdown'
import FileUploadField from '../../../components/controlled/FileUploadField'
import NumberField from '../../../components/controlled/NumberField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import type { AddItemStockFormData } from '../../../types/inventory/AddItemStock'
import {
  useAddItemStocks,
  useCreateAddItemStock,
  useUpdateAddItemStock,
  useUpdateAddItemStockDocument,
  useDeleteAddItemStock,
  useDeleteMultipleAddItemStocks,
} from '../../../hooks/queries/inventory/useAddItemStock'
import { useItems } from '../../../hooks/queries/inventory/useAddItems'
import { useItemCategories } from '../../../hooks/queries/inventory/useItemCategory'
import { useItemStores } from '../../../hooks/queries/inventory/useItemStore'
import { useItemSuppliers } from '../../../hooks/queries/inventory/useItemSupplier'
import { TextareaField, TextField } from '../../../components/controlled'
import { openDocument } from '../../../hooks/useBlobImage'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const formatDateForInput = (date: string): string => {
  if (!date) return ''
  if (date.match(/^\d{4}-\d{2}-\d{2}$/)) return date
  if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = date.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return date
}

export default function AddItemStockPage() {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [existingDocument, setExistingDocument] = useState<string | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<AddItemStockFormData>({
    defaultValues: {
      quantity: '',
      parchesPrice: '',
      date: '',
      document: null,
      description: '',
      itemCategoryId: 0,
      addItemsId: 0,
      itemStoreId: undefined,
      itemSupplierId: undefined,
    },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({ defaultValues: { filterSearch: '' } })

  const { data: addItems, isLoading: itemsLoading, error: itemsError } = useItems()
  const {
    data: itemCategories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useItemCategories()
  const { data: itemStores, isLoading: storesLoading, error: storesError } = useItemStores()
  const {
    data: itemSuppliers,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useItemSuppliers()

  const { data: allStocks = [], isLoading: stocksLoading, error: stocksError } = useAddItemStocks()

  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) return allStocks
    const q = searchTerm.toLowerCase()
    return allStocks.filter(
      (s) =>
        s.addItems.item.toLowerCase().includes(q) ||
        s.itemCategory.itemCategory.toLowerCase().includes(q) ||
        (s.itemStore?.itemStoreName ?? '').toLowerCase().includes(q),
    )
  }, [allStocks, searchTerm])

  const totalItems = filteredStocks.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const pagedStocks = useMemo(() => {
    const start = page * pageSize
    return filteredStocks.slice(start, start + pageSize)
  }, [filteredStocks, page, pageSize])

  const createStock = useCreateAddItemStock()
  const updateStock = useUpdateAddItemStock()
  const updateStockDocument = useUpdateAddItemStockDocument()
  const deleteStock = useDeleteAddItemStock()
  const deleteMultipleStocks = useDeleteMultipleAddItemStocks()

  const handleApplyFilters = (data: FieldValues) => {
    setSearchTerm(data.filterSearch ?? '')
    setPage(0)
  }
  const handleClearFilters = () => {
    resetFilter({ filterSearch: '' })
    setSearchTerm('')
    setPage(0)
  }

  const resetForm = () => {
    reset({
      quantity: '',
      parchesPrice: '',
      date: '',
      document: null,
      description: '',
      itemCategoryId: 0,
      addItemsId: 0,
      itemStoreId: undefined,
      itemSupplierId: undefined,
    })
    setEditingId(null)
    setExistingDocument(null)
  }

  const onSubmit = async (data: AddItemStockFormData) => {
    try {
      const documentFile = data.document instanceof FileList ? data.document[0] : data.document
      const payload: AddItemStockFormData = {
        ...data,
        itemCategoryId: Number(data.itemCategoryId),
        addItemsId: Number(data.addItemsId),
        itemStoreId: data.itemStoreId ? Number(data.itemStoreId) : undefined,
        itemSupplierId: data.itemSupplierId ? Number(data.itemSupplierId) : undefined,
        document: documentFile,
      }

      if (editingId) {
        await updateStock.mutateAsync({ id: editingId, data: payload })
        if (documentFile instanceof File) {
          await updateStockDocument.mutateAsync({ id: editingId, file: documentFile })
        }
        toast.success('Item stock updated successfully!')
      } else {
        await createStock.mutateAsync(payload)
        toast.success('Item stock added successfully!')
      }
      resetForm()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save item stock.')
    }
  }

  const handleEdit = (id: string | number) => {
    const numericId = Number(id)
    const item = allStocks.find((s) => s.addItemStockId === numericId)
    if (!item) {
      toast.error('Item stock not found.')
      return
    }

    setValue('quantity', item.quantity)
    setValue('parchesPrice', item.parchesPrice)
    setValue('date', formatDateForInput(item.date || ''))
    setValue('description', item.description || '')
    setValue('itemCategoryId', item.itemCategory.itemCategoryId)
    setValue('addItemsId', item.addItems.addItemId)
    setValue('itemStoreId', item.itemStore?.itemStoreId)
    setValue('itemSupplierId', item.itemSupplier?.itemSupplierId)
    setValue('document', null)
    setExistingDocument(item.document || null)
    setEditingId(numericId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    if (!(await confirmToast('Do you want to delete this entry?'))) return
    try {
      await deleteStock.mutateAsync(Number(id))
      toast.success('Item stock deleted successfully!')
      if (editingId === Number(id)) resetForm()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete item stock.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!(await confirmToast('Do you want to delete selected entries?'))) return
    try {
      await deleteMultipleStocks.mutateAsync(ids.map(Number))
      toast.success('Item stocks deleted successfully!')
      resetForm()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete item stocks.')
    }
  }

  const tableData = pagedStocks.map((item) => ({
    id: item.addItemStockId.toString(),
    item: item.addItems.item,
    category: item.itemCategory.itemCategory,
    store: item.itemStore?.itemStoreName || '-',
    supplier: item.itemSupplier?.name || '-',
    quantity: item.quantity,
    parchesPrice: item.parchesPrice,
    date: item.date,
    document: item.document,
    description: item.description || '-',
  }))

  const columns = [
    { label: Text.Item, key: 'item' },
    { label: Text.Category, key: 'category' },
    { label: Text.Store, key: 'store' },
    { label: Text.Supplier, key: 'supplier' },
    { label: Text.Quantity, key: 'quantity' },
    { label: Text.Purchase_Price, key: 'parchesPrice' },
    { label: Text.Date, key: 'date' },
    {
      key: 'document',
      label: Text.document || 'Document',
      render: (value: any) =>
        value ? (
          <button
            className="text-blue-600 hover:text-blue-800 underline text-sm pointer-events-auto"
            onClick={() => openDocument(value)}
          >
            View Document
          </button>
        ) : (
          <span className="text-gray-400">No document</span>
        ),
    },
    { label: Text.Description, key: 'description' },
  ]

  const isLoading =
    itemsLoading || categoriesLoading || storesLoading || suppliersLoading || stocksLoading
  const hasError = itemsError || categoriesError || storesError || suppliersError || stocksError

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    )

  if (hasError)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg font-semibold">Failed to load data. Please try again.</p>
      </div>
    )

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white w-full">
      {/* ── Form ── */}
      <div className="lg:w-1/3 p-4 shadow rounded">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? Text.Edit : Text.Add} {Text.Item_Stock}
        </h2>
       <AllSchoolDropdown
  onSubmit={handleSubmit(onSubmit)}
  queryKeys={['addItemStocks', 'addItems', 'itemCategories', 'itemStores', 'itemSuppliers']}
   onSchoolChange={resetForm}
>
          <Dropdown
            label={Text.Category}
            name="itemCategoryId"
            control={control}
            required
            options={
              itemCategories?.map((c) => ({ value: c.itemCategoryId, label: c.itemCategory })) || []
            }
          />
          <Dropdown
            label={Text.Item}
            name="addItemsId"
            control={control}
            required
            options={addItems?.map((i) => ({ value: i.addItemId, label: i.item })) || []}
          />
          <Dropdown
            label={Text.Store}
            name="itemStoreId"
            control={control}
            options={
              itemStores?.map((s) => ({ value: s.itemStoreId, label: s.itemStoreName })) || []
            }
          />
          <Dropdown
            label={Text.Supplier}
            name="itemSupplierId"
            control={control}
            options={itemSuppliers?.map((s) => ({ value: s.itemSupplierId, label: s.name })) || []}
          />
          <NumberField
            name="quantity"
            label={Text.Quantity}
            control={control}
            placeholder={Text.Enter_Quantity}
            required
          />
          <TextField
            name="parchesPrice"
            label={Text.Purchase_Price}
            control={control}
            placeholder={Text.Enter_Purchase_Price}
            required
          />
          <DateField name="date" label={Text.Date} control={control} required />
          <FileUploadField
            name="document"
            label={Text.document}
            existingFileUrl={existingDocument}
            control={control}
          />
          <TextareaField
            name="description"
            label={Text.Description}
            placeholder={Text.Enter_Description}
            control={control}
          />

          <div className="flex gap-4">
            <Button
              name={editingId ? Text.Update : Text.Save}
              icon={<IconField name="FaSave" />}
              loading={
                createStock.isPending || updateStock.isPending || updateStockDocument.isPending
              }
              permissionScope="INVENTORY"
              permissionType={editingId ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
            />
            {editingId && (
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

      {/* ── Table ── */}
      <div className="w-full lg:w-2/3 bg-white shadow-md rounded p-4">
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
            <div className="flex items-end gap-2 mb-2">
              <Button
                onClick={handleClearFilters}
                name={Text.Cancel}
                loading={false}
                icon={<IconField name="FaTimes" />}
                showAlways = {true}
              />
              <Button name={Text.Search} loading={false} icon={<IconField name="FaSearch" />} showAlways = {true} />
            </div>
          </div>
        </form>
        <hr className="border-gray-300 mb-4" />

        <ControlledTable
          title={Text.Item_Stock}
          columns={columns}
          data={tableData}
          fullData={tableData}
          showSearch={false}
          btn={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll
          enablePermissions={true}
          permissionScope="INVENTORY"
          serverPage={page}
          serverTotalPages={totalPages}
          serverTotalItems={totalItems}
          serverPageSize={pageSize}
          onServerPageChange={(p) => setPage(p)}
          onServerPageSizeChange={(s) => {
            setPageSize(s)
            setPage(0)
          }}
        />
      </div>
    </div>
  )
}
 
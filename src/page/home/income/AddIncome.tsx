import { useState, useEffect } from 'react'
import { useForm, type FieldValues, useWatch } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextAreaField from '../../../components/controlled/TextareaField'
import Dropdown from '../../../components/controlled/Dropdown'
import DateField, { convertToDateInputFormat } from '../../../components/controlled/DateField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import NameField from '../../../components/controlled/NameField'
import Button from '../../../components/controlled/Button'
import TextField from '../../../components/controlled/TextField'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import {
  useFilterAddIncomes,
  useCreateAddIncome,
  useUpdateAddIncome,
  useUpdateAddIncomeDocument,
  useDeleteAddIncome,
  useDeleteMultipleAddIncomes,
} from '../../../hooks/queries/income/useAddIncome'
import type { AddIncomeSearchParams } from '../../../services/income/addIncomeService '
import { useIncomeHeads } from '../../../hooks/queries/income/useIncomeHeads'
import { useIncomeGroups } from '../../../hooks/queries/income/useIncomeGroups'
import { AmountField } from '../../../components/controlled'
import { openDocument } from '../../../hooks/useBlobImage'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

function AddIncomes() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)
 const NameText = getPagesNameText(t);

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy] = useState('date')
  const [sortDirection] = useState<'asc' | 'desc'>('asc')

  const [activeFilters, setActiveFilters] = useState<AddIncomeSearchParams>({})

  const {
    data: incomesResponse,
    isLoading: incomesLoading,
    isFetching,
    error: incomesError,
  } = useFilterAddIncomes(activeFilters, page, pageSize, sortBy, sortDirection)

  const { data: incomeHeadsData } = useIncomeHeads()

  const createIncome = useCreateAddIncome()
  const updateIncome = useUpdateAddIncome()
  const updateIncomeDocument = useUpdateAddIncomeDocument()
  const deleteIncomeMutation = useDeleteAddIncome()
  const deleteMultipleIncomesMutation = useDeleteMultipleAddIncomes()

  const incomes = incomesResponse?.addIncomes ?? []
  const totalItems = incomesResponse?.totalItems ?? 0
  const totalPages = incomesResponse?.totalPages ?? 0

  const [existingDocument, setExistingDocument] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      incomeHeadId: '',
      incomeGroupId: '',
      name: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      document: null,
      description: '',
    },
  })

  const selectedIncomeHeadId = useWatch({ control, name: 'incomeHeadId' })

  const { data: incomeGroupsData } = useIncomeGroups(Number(selectedIncomeHeadId) || 0)

  const groupOptions =
    incomeGroupsData?.map((g: any) => ({
      value: g.incomeGroupId || g.id,
      label: g.groupName || g.name,
    })) || []

  useEffect(() => {
    setValue('incomeGroupId', '')
  }, [selectedIncomeHeadId, setValue])

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
    watch: watchFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterIncomeHeadId: '',
      filterIncomeGroupId: '',
      filterSearch: '',
    },
  })

  const selectedFilterHeadId = watchFilter('filterIncomeHeadId')

  const { data: filterGroupsData } = useIncomeGroups(Number(selectedFilterHeadId) || 0)

  const filterGroupOptions =
    filterGroupsData?.map((g: any) => ({
      value: g.incomeGroupId || g.id,
      label: g.groupName || g.name,
    })) || []

  const handlePageChange = (newPage: number) => setPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: AddIncomeSearchParams = {}
    if (data.filterIncomeHeadId) params.incomeHeadId = data.filterIncomeHeadId
    if (data.filterIncomeGroupId) params.incomeGroupId = data.filterIncomeGroupId
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({
      filterIncomeHeadId: '',
      filterIncomeGroupId: '',
      filterSearch: '',
    })
    setActiveFilters({})
    setPage(0)
  }

  const generateInvoiceNumber = (): string => {
    if (incomes.length === 0) return 'INV001'
    const invoiceNumbers = incomes
      .map((income) => income.invoiceNumber)
      .filter((invNum) => invNum && invNum.startsWith('INV'))
      .map((invNum) => {
        const numPart = invNum!.replace('INV', '')
        return parseInt(numPart, 10)
      })
      .filter((num) => !isNaN(num))
    const maxNumber = invoiceNumbers.length > 0 ? Math.max(...invoiceNumbers) : 0
    return `INV${(maxNumber + 1).toString().padStart(3, '0')}`
  }

  const onSubmit = async (data: FieldValues) => {
    try {
      const payload: any = {
        incomeHeadId: data.incomeHeadId?.toString(),
        incomeGroupId: data.incomeGroupId?.toString(),
        name: data.name,
        date: data.date,
        amount: Number(data.amount),
        description: data.description || '',
      }

      const documentFile = data.document instanceof FileList ? data.document[0] : data.document

      if (editingId) {
        const existingIncome = incomes.find((i) => i.id === editingId)
        payload.invoiceNumber = existingIncome?.invoiceNumber || ''
        await updateIncome.mutateAsync({ id: editingId, data: payload })
        if (documentFile instanceof File) {
          await updateIncomeDocument.mutateAsync({
            id: editingId,
            file: documentFile,
          })
        }
        toast.success('Income updated successfully')
        resetForm()
      } else {
        payload.invoiceNumber = generateInvoiceNumber()
        await createIncome.mutateAsync({ ...payload, document: documentFile })
        toast.success('Income added successfully')
        resetForm()
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to save income.'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    reset({
      incomeHeadId: '',
      incomeGroupId: '',
      name: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      document: null,
      description: '',
    })
    setEditingId(null)
    setExistingDocument(null)
  }

  const handleEdit = (id: string | number) => {
    const stringId = id.toString()
    const item = incomes.find((i) => i.id === stringId)
    if (!item) return

    setValue('incomeHeadId', item.incomeHeadId)
    setTimeout(() => {
      setValue('incomeGroupId', item.incomeGroupId)
    }, 100)
    setValue('name', item.name)
    setValue('date', convertToDateInputFormat(item.date))
    setValue('amount', item.amount)
    setValue('document', null)
    setValue('description', item.description || '')
    setExistingDocument(item.document as string | null)
    setEditingId(stringId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    if (
      await confirmToast(
        texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
      )
    ) {
      try {
        await deleteIncomeMutation.mutateAsync(id.toString())
        toast.success('Income deleted successfully')
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete income.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (
      await confirmToast(
        texts.Do_you_want_to_delete_this_entry || 'Do you want to delete these entries?',
      )
    ) {
      try {
        await deleteMultipleIncomesMutation.mutateAsync(ids.map((x) => x.toString()))
        toast.success('Selected incomes deleted successfully')
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete incomes.')
      }
    }
  }
  console.log(incomes)

  const columns = [
    { key: 'name', label: texts.Name || 'Name' },
    { key: 'incomeHeadName', label: texts.Income_Head || 'Income Head' },
    { key: 'groupName', label: texts.Income_Group || 'Income Group' },
    { key: 'invoiceNumber', label: texts.Invoice_Number || 'Invoice Number' },
    { key: 'date', label: texts.Date || 'Date' },
    { key: 'amount', label: texts.Amount || 'Amount' },
    { key: 'description', label: texts.Description || 'Description' },
    {
      key: 'document',
      label: texts.document || 'Document',
      render: (value: any) =>
        value ? (
          <button className="text-blue-600 underline" onClick={() => openDocument(value)}>
            View Document
          </button>
        ) : (
          <span className="text-gray-400">No document</span>
        ),
    },
  ]

  if (incomesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading incomes...</p>
      </div>
    )
  }

  if (incomesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Error loading incomes. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3 p-4 bg-white shadow-md rounded">
          <h1 className="text-xl font-semibold">
            {editingId ? texts.Edit || 'Edit Income' : texts.Add_IncomeTitle || 'Add Income'}
          </h1>
          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['incomeHeads', 'incomeGroups']}
            onSchoolChange={resetFilter}
          >
            <Dropdown
              label={texts.Income_Head || 'Income Head'}
              name="incomeHeadId"
              control={control}
              required
              options={
                incomeHeadsData?.map((h: any) => ({
                  value: h.id || h.incomeHeadId,
                  label: h.name || h.incomeHead,
                })) || []
              }
            />

            <Dropdown
              label={NameText.Income_Group}
              name="incomeGroupId"
              control={control}
              required
              options={groupOptions}
            />

            <NameField
              name="name"
              label={texts.Name || 'Name'}
              control={control}
              placeholder={texts.Enter_name || 'Enter Name'}
              required
            />
            <DateField name="date" label={texts.Date || 'Date'} control={control} required />
            <AmountField
              name="amount"
              label={texts.Amount || 'Amount'}
              control={control}
              required
            />
            <FileUploadField
              name="document"
              label={texts.document || 'Document'}
              control={control}
              existingFileUrl={existingDocument}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <TextAreaField
              name="description"
              label={texts.Description || 'Description'}
              control={control}
              placeholder={texts.Enter_Description}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                name={editingId ? texts.Update || 'Update' : texts.Save || 'Save'}
                loading={createIncome.isPending || updateIncome.isPending}
                permissionScope="INCOME"
                permissionType={editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions
                icon={<IconField name="FaSave" />}
              />
              {editingId && (
                <Button
                  name={texts.Cancel || 'Cancel'}
                  onClick={resetForm}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 bg-white shadow-md rounded p-4">
          <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Dropdown
                label={texts.Income_Head || 'Income Head'}
                name="filterIncomeHeadId"
                control={filterControl}
                required={false}
                options={
                  incomeHeadsData?.map((h: any) => ({
                    value: h.id || h.incomeHeadId,
                    label: h.name || h.incomeHead,
                  })) || []
                }
              />

              <Dropdown
                label={texts.Income_Group || 'Income Group'}
                name="filterIncomeGroupId"
                control={filterControl}
                required={false}
                options={filterGroupOptions}
              />

              <TextField
                label={texts.Search || 'Search'}
                name="filterSearch"
                placeholder={texts.Name || 'Name, invoice…'}
                control={filterControl}
              />
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={handleClearFilters}
                name={texts.Cancel || 'Clear'}
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

          <hr className="border-gray-300 mb-4" />

          <div className="relative overflow-auto">
            {isFetching && !incomesLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
              </div>
            )}
  
            <ControlledTable
              title={texts.Income_List || 'Income List'}
              columns={columns}
              data={incomes}
              fullData={incomes}
              showSearch={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              showSelectAll
              btn={false}
              enablePermissions
              permissionScope="INCOME"
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
    </div>
  )
}

export default AddIncomes

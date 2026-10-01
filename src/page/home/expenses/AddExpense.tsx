import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, type FieldValues, useWatch } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextAreaField from '../../../components/controlled/TextareaField'
import Dropdown from '../../../components/controlled/Dropdown'
import DateField, { convertToDateInputFormat } from '../../../components/controlled/DateField'
import AmountInput from '../../../components/controlled/AmountField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import NameField from '../../../components/controlled/NameField'
import Button from '../../../components/controlled/Button'
import TextField from '../../../components/controlled/TextField'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import {
  useAddExpenses,
  useFilterExpenses,
  useCreateAddExpense,
  useUpdateAddExpense,
  useUpdateAddExpenseDocument,
  useDeleteAddExpense,
  useDeleteMultipleAddExpenses,
} from '../../../hooks/queries/expense/useAddExpense'
import { useExpenseHeads } from '../../../hooks/queries/expense/useExpenseHeads'
import { useExpenseGroups } from '../../../hooks/queries/expense/useExpenseGroup'
import { openExpenseDocument } from '../../../services/expense/addExpenseService'
import type { ExpenseFilterParams } from '../../../services/expense/addExpenseService'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface ExpenseItem {
  id: string
  expenseHeadId: string
  expenseHeadName: string
  expenseGroupId: string
  expenseGroupName: string
  name: string
  invoiceNumber?: string
  date: string
  amount: number
  document?: string | null
  description?: string
}

interface AppliedFilter {
  headId: number
  groupId: number
  searchText: string
}

const toExpenseItem = (item: any): ExpenseItem => ({
  id: item.id || item.addExpenseId?.toString() || '',
  expenseHeadId: item.expenseHeadId || '',
  expenseHeadName: item.expenseHeadName || item.expenseHead?.name || '',
  expenseGroupId: item.expenseGroupId || item.expenseGroup?.id || '',
  expenseGroupName: item.expenseGroupName || item.expenseGroup?.name || '',
  name: item.name || '',
  invoiceNumber: item.invoiceNumber || '',
  date: item.date || '',
  amount: Number(item.amount) || 0,
  document: item.document || null,
  description: item.description || '',
})

function AddExpense() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)
  const NameText = getPagesNameText(t);
  

  const { data: expenseHeadsData } = useExpenseHeads()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null)

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: filterReset,
    watch: filterWatch,
  } = useForm<FieldValues>({
    defaultValues: {
      filterExpenseHeadId: '',
      filterExpenseGroupId: '',
      filterSearch: '',
    },
  })

  const watchedFilterHeadId = filterWatch('filterExpenseHeadId')

  const { data: filterGroupsData } = useExpenseGroups(Number(watchedFilterHeadId) || 0)
  const filterGroupOptions =
    filterGroupsData?.map((g: any) => ({
      value: g.expenseGroupId || g.id,
      label: g.groupName || g.name,
    })) || []
  const needsBackendFilter =
    appliedFilter !== null &&
    (appliedFilter.headId > 0 || appliedFilter.groupId > 0 || appliedFilter.searchText.length > 0)

  const backendFilterParams: ExpenseFilterParams = {
    expenseHeadId: appliedFilter?.headId ?? 0,
    expenseGroupId: appliedFilter?.groupId ?? 0,
    search: appliedFilter?.searchText ?? '',
    page: page,
    size: pageSize,
    sortDirection: 'asc',
  }

  const {
    data: filterResult,
    isFetching: isFilterFetching,
    isLoading: isFilterLoading,
  } = useFilterExpenses(backendFilterParams, needsBackendFilter)
  const { data: expensesData } = useAddExpenses(page, pageSize, 'asc')

  const createExpense = useCreateAddExpense()
  const updateExpense = useUpdateAddExpense()
  const updateExpenseDocument = useUpdateAddExpenseDocument()
  const deleteExpense = useDeleteAddExpense()
  const deleteMultipleExpenses = useDeleteMultipleAddExpenses()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingDocument, setExistingDocument] = useState<string | null>(null)
  const [localExpenses, setLocalExpenses] = useState<ExpenseItem[]>([])

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      expenseHeadId: '',
      expenseGroupId: '',
      name: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      document: null,
      description: '',
    },
  })

  const selectedExpenseHeadId = useWatch({ control, name: 'expenseHeadId' })
  const { data: expenseGroupsData } = useExpenseGroups(Number(selectedExpenseHeadId) || 0)
  const groupOptions =
    expenseGroupsData?.map((g: any) => ({
      value: g.expenseGroupId || g.id,
      label: g.groupName || g.name,
    })) || []

  useEffect(() => {
    if (expensesData?.expenses && Array.isArray(expensesData.expenses)) {
      setLocalExpenses(expensesData.expenses.map(toExpenseItem))
    }
  }, [expensesData])

  useEffect(() => {
    setValue('expenseGroupId', '')
  }, [selectedExpenseHeadId, setValue])
  const totalItems = appliedFilter
    ? (filterResult?.totalElements ?? 0)
    : (expensesData?.totalElements ?? 0)

  const totalPages = appliedFilter
    ? (filterResult?.totalPages ?? 0)
    : (expensesData?.totalPages ?? 0)

  const handlePageChange = (newPage: number) => setPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const headId = Number(data.filterExpenseHeadId) || 0
    const groupId = Number(data.filterExpenseGroupId) || 0
    const searchText = data.filterSearch?.trim() || ''

    if (headId === 0 && groupId === 0 && searchText === '') {
      setAppliedFilter(null)
      setPage(0)
      return
    }

    setAppliedFilter({ headId, groupId, searchText })
    setPage(0)
  }

  const handleClearFilters = () => {
    filterReset({
      filterExpenseHeadId: '',
      filterExpenseGroupId: '',
      filterSearch: '',
    })
    setAppliedFilter(null)
    setPage(0)
  }

  const isFilterActive = appliedFilter !== null
  const isSearching = needsBackendFilter && (isFilterFetching || isFilterLoading)
  const displayedExpenses: ExpenseItem[] = useMemo(() => {
    if (!appliedFilter) return localExpenses
    const backendPool = (filterResult?.expenses ?? []).map(toExpenseItem)
    return backendPool
  }, [appliedFilter, filterResult, localExpenses])

  const onSubmit = async (data: FieldValues) => {
    try {
      if (data.invoiceNumber?.trim()) {
        const isDuplicate = localExpenses.some(
          (item) =>
            item.invoiceNumber?.toLowerCase() === data.invoiceNumber.trim().toLowerCase() &&
            item.id !== editingId,
        )
        if (isDuplicate) {
          toast.error('Invoice number already exists!')
          return
        }
      }
      const payload = {
        expenseHeadId: data.expenseHeadId?.toString(),
        expenseGroupId: data.expenseGroupId?.toString(),
        name: data.name,
        invoiceNumber: data.invoiceNumber || '',
        date: data.date,
        amount: Number(data.amount),
        description: data.description || '',
      }

      const documentFile = data.document instanceof FileList ? data.document[0] : data.document

      if (editingId) {
        await updateExpense.mutateAsync({ id: editingId, data: payload })
        if (documentFile instanceof File) {
          await updateExpenseDocument.mutateAsync({ id: editingId, file: documentFile })
        }
        toast.success('Expense updated successfully!')
        resetForm()
      } else {
        await createExpense.mutateAsync({ ...payload, document: documentFile })
        toast.success('Expense added successfully!')
        resetForm()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save expense. Please try again.')
    }
  }

  const resetForm = () => {
    reset({
      expenseHeadId: '',
      expenseGroupId: '',
      name: '',
      invoiceNumber: '',
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
    const item =
      displayedExpenses.find((i) => i.id === stringId) ||
      localExpenses.find((i) => i.id === stringId)
    if (!item) return

    setValue('expenseHeadId', item.expenseHeadId)
    setTimeout(() => setValue('expenseGroupId', item.expenseGroupId), 100)
    setValue('name', item.name)
    setValue('invoiceNumber', item.invoiceNumber || '')
    setValue('date', convertToDateInputFormat(item.date))
    setValue('amount', item.amount)
    setValue('document', null)
    setValue('description', item.description || '')
    setExistingDocument(item.document || null)
    setEditingId(stringId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    const ok = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (!ok) return
    try {
      await deleteExpense.mutateAsync(id.toString())
      toast.success('Expense deleted successfully!')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete expense.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const ok = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete these entries?',
    )
    if (!ok) return
    try {
      await deleteMultipleExpenses.mutateAsync(ids.map((x) => x.toString()))
      toast.success('Selected expenses deleted successfully!')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete expenses.')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const blockedSearchHandler = useCallback(() => {
    /* blocked */
  }, [])

  const columns = [
    { key: 'name', label: texts.Name || 'Name' },
    { key: 'expenseHeadName', label: texts.Expense_Head || 'Expense Head' },
    { key: 'expenseGroupName', label: NameText.Expense_Group},
    { key: 'invoiceNumber', label: texts.Invoice_Number || 'Invoice Number' },
    { key: 'date', label: texts.Date || 'Date' },
    { key: 'amount', label: texts.Amount || 'Amount' },
    { key: 'description', label: texts.Description || 'Description' },
    {
      key: 'document',
      label: texts.document || 'Document',
      render: (value: any) =>
        value ? (
          <button className="text-blue-600 underline" onClick={() => openExpenseDocument(value)}>
            View Document
          </button>
        ) : (
          <span className="text-gray-400">No document</span>
        ),
    },
  ]
  const isFormLoading = createExpense.isPending || updateExpense.isPending
  const expenseHeadOptions =
    expenseHeadsData?.map((h: any) => ({
      value: h.id || h.expenseHeadId,
      label: h.name || h.expenseHead,
    })) || []

  return (
    <div className="w-full px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3 p-4 bg-white shadow-md rounded">
          <h1 className="text-xl font-semibold">
            {editingId ? texts.Edit || 'Edit Expense' : texts.Add_ExpenseTitle || 'Add Expense'}
          </h1>
          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['expenseGroups', 'expenseHeads', 'addExpenses']}
            onSchoolChange={resetForm}
          >
            <Dropdown
              label={texts.Expense_Head || 'Expense Head'}
              name="expenseHeadId"
              control={control}
              required
              options={expenseHeadOptions}
            />
            <Dropdown
              label={NameText.Expense_Group}
              name="expenseGroupId"
              control={control}
              required
              options={groupOptions}
            />
            <NameField
              name="name"
              placeholder={texts.Enter_name}
              label={texts.Name || 'Name'}
              control={control}
              required
            />
            <TextField
              name="invoiceNumber"
              placeholder={texts.Enter_Invoice_Number || 'Enter Invoice Number'}
              label={texts.Invoice_Number || 'Invoice Number'}
              control={control}
            />
            <DateField name="date" label={texts.Date || 'Date'} control={control} required />
            <AmountInput
              name="amount"
              control={control}
              label={texts.Amount || 'Amount'}
              required
            />
            <FileUploadField
              name="document"
              label={texts.document || 'Document'}
              existingFileUrl={existingDocument}
              control={control}
            />
            <TextAreaField
              name="description"
              placeholder={texts.Enter_Description}
              label={texts.Description || 'Description'}
              control={control}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                name={editingId ? texts.Update || 'Update' : texts.Save || 'Save'}
                loading={isFormLoading}
                permissionScope="EXPENSES"
                permissionType={editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                icon={<IconField name="FaSave" />}
                type="submit"
              />
              {editingId && (
                <Button
                  name={texts.Cancel || 'Cancel'}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                  type="button"
                  enablePermissions={false}
                  onClick={resetForm}
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 bg-white shadow-md rounded p-4">
          <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Dropdown
                label={texts.Expense_Head || 'Expense Head'}
                name="filterExpenseHeadId"
                control={filterControl}
                required={false}
                options={expenseHeadOptions}
              />

              <Dropdown
                label={NameText.Expense_Group}
                name="filterExpenseGroupId"
                control={filterControl}
                required={false}
                options={filterGroupOptions}
              />

              <TextField
                label={texts.Search || 'Search'}
                name="filterSearch"
                placeholder={texts.Name}
                control={filterControl}
              />
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={handleClearFilters}
                name={texts.Cancel}
                loading={false}
                icon={<IconField name="FaTimes" />}
                showAlways={true}
              />
              <Button
                name={texts.Search}
                loading={isSearching}
                icon={<IconField name="FaSearch" />}
                showAlways={true}
              />
            </div>
          </form>

          <hr className="border-gray-300 mb-4" />

          <div className="relative overflow-auto">
            {isSearching && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
              </div>
            )}

            <ControlledTable
              title={texts.Expense_List || 'Expense List'}
              columns={columns}
              data={displayedExpenses}
              fullData={isFilterActive ? displayedExpenses : localExpenses}
              showSearch={false}
              searchTerm={isFilterActive ? '' : undefined}
              onSearchChange={isFilterActive ? blockedSearchHandler : undefined}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              showSelectAll
              btn={false}
              enablePermissions={true}
              permissionScope="EXPENSES"
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
export default AddExpense
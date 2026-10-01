import { useState } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import Dropdown from '../../../components/controlled/Dropdown'
import TextFields from '../../../components/controlled/TextField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { Button } from '../../../components/controlled'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import {
  useAddExpenses,
  useFilterExpenses,
  useSearchExpenses,
} from '../../../hooks/queries/expense/useAddExpense'
import { useExpenseHeads } from '../../../hooks/queries/expense/useExpenseHeads'
import { useExpenseGroups } from '../../../hooks/queries/expense/useExpenseGroup'
import type {
  ExpenseFilterParams,
  ExpenseSearchParams,
} from '../../../services/expense/addExpenseService'

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
]

const PERIOD_MAP: Record<string, string> = {
  today: 'Today',
  this_week: 'This Week',
  last_week: 'Last Week',
  this_month: 'This Month',
  last_month: 'Last Month',
}

// Which query is currently active
type ActiveMode = 'none' | 'search' | 'filter'

function SearchExpenses() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)
  const NameText = getPagesNameText(t);
  


  const { control, getValues, reset, watch } = useForm<FieldValues>({
    defaultValues: {
      searchType: '',
      searchText: '',
      expenseHeadId: '',
      expenseGroupId: '',
    },
  })

  const watchedHeadId = watch('expenseHeadId')
  const { data: expenseHeadsData } = useExpenseHeads()
  const { data: expenseGroupsData } = useExpenseGroups(Number(watchedHeadId) || 0)

  const expenseHeadOptions =
    expenseHeadsData?.map((h: any) => ({
      value: h.id || h.expenseHeadId,
      label: h.name || h.expenseHead,
    })) || []

  const expenseGroupOptions =
    expenseGroupsData?.map((g: any) => ({
      value: g.expenseGroupId || g.id,
      label: g.groupName || g.name,
    })) || []

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [activeMode, setActiveMode] = useState<ActiveMode>('none')
  const [searchParams, setSearchParams] = useState<ExpenseSearchParams>({})
  const [filterParams, setFilterParams] = useState<ExpenseFilterParams>({})

  const {
    data: allResult,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
  } = useAddExpenses(currentPage, pageSize, 'asc')

  const {
    data: searchResult,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
  } = useSearchExpenses(searchParams, activeMode === 'search')

  const {
    data: filterResult,
    isLoading: isLoadingFilter,
    isFetching: isFetchingFilter,
  } = useFilterExpenses(
    { ...filterParams, page: currentPage, size: pageSize },
    activeMode === 'filter',
  )

  const activeData =
    activeMode === 'search' ? searchResult : activeMode === 'filter' ? filterResult : allResult

  const rawExpenses = activeData?.expenses ?? []
  const totalItems = activeData?.totalElements ?? 0
  const totalPages = activeData?.totalPages ?? 0

  const tableData = rawExpenses.map((item: any) => ({
    id: item.id,
    name: item.name,
    invoiceNumber: item.invoiceNumber || '',
    expenseHeadName: item.expenseHeadName || '',
    expenseGroupName: item.expenseGroupName || '',
    date: item.date,
    amount: Number(item.amount),
    description: item.description || '',
  }))

  const isBusy =
    (activeMode === 'search' && (isLoadingSearch || isFetchingSearch)) ||
    (activeMode === 'filter' && (isLoadingFilter || isFetchingFilter)) ||
    (activeMode === 'none' && (isLoadingAll || isFetchingAll))

  const handlePageChange = (newPage: number) => setCurrentPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0)
  }
  const handleSearch = () => {
    const period = getValues('searchType')
    const text = getValues('searchText')?.trim()
    const headId = getValues('expenseHeadId')
    const groupId = getValues('expenseGroupId')

    const hasSearch = !!period || !!text
    const hasFilter = !!headId || !!groupId

    if (!hasSearch && !hasFilter) {
      setActiveMode('none')
      setCurrentPage(0)
      return
    }

    if (hasFilter) {
      const params: ExpenseFilterParams = {}
      if (headId) params.expenseHeadId = Number(headId)
      if (groupId) params.expenseGroupId = Number(groupId)
      if (text) params.search = text
      setFilterParams(params)
      setActiveMode('filter')
      setCurrentPage(0)
      return
    }

    const params: ExpenseSearchParams = {}
    if (period) params.period = PERIOD_MAP[period] || period
    if (text) params.search = text
    setSearchParams(params)
    setActiveMode('search')
    setCurrentPage(0)
  }

  const handleClear = () => {
    reset({ searchType: '', searchText: '', expenseHeadId: '', expenseGroupId: '' })
    setSearchParams({})
    setFilterParams({})
    setActiveMode('none')
    setCurrentPage(0)
    setPageSize(10)
  }

  const grandTotal = tableData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)

  const columns = [
    { label: texts.Name || 'Name', key: 'name' },
    { label: texts.Invoice_Number || 'Invoice Number', key: 'invoiceNumber' },
    { label: texts.Expense_Head || 'Expense Head', key: 'expenseHeadName' },
    { label: NameText.Exam_Group, key: 'expenseGroupName' },
    { label: texts.Date || 'Date', key: 'date' },
    {
      label: texts.Amount || 'Amount',
      key: 'amount',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
  ]

  if (isLoadingAll && activeMode === 'none') {
    return (
      <div className="w-full min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Page Header */}
      <div className="text-black text-xl sm:text-2xl font-semibold mb-4">
        {texts.Select_Criteria || 'Select Criteria'}
      </div>
      <hr className="mb-6 border-gray-400" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Dropdown
          label={texts.Search_Type || 'Search Type'}
          name="searchType"
          control={control}
          required={false}
          options={PERIOD_OPTIONS}
        />
        <TextFields
          required={false}
          label={texts.Search_By_Expense || 'Search By Expense'}
          name="searchText"
          control={control}
          placeholder={texts.Search_By_Expense || 'Enter name'}
        />

        {/* 3. Expense Head */}
        <Dropdown
          label={texts.Expense_Head || 'Expense Head'}
          name="expenseHeadId"
          control={control}
          required={false}
          options={expenseHeadOptions}
        />
        <Dropdown
          label={NameText.Expense_Group}
          name="expenseGroupId"
          control={control}
          required={false}
          options={expenseGroupOptions}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          name={texts.Cancel}
          loading={false}
          onClick={handleClear}
          icon={<IconField name="FaTimes" />}
          showAlways={true}
        />
        <Button
          name={texts.Search || 'Search'}
          loading={isBusy}
          onClick={handleSearch}
          icon={<IconField name="FaSearch" />}
          showAlways={true}
        />
      </div>
      {isBusy && (
        <div className="mt-3 flex items-center gap-2 text-sky-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500" />
          <span className="text-sm">Searching...</span>
        </div>
      )}
      <div className="mt-6">
        <div className="relative">
          {isBusy && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating...</span>
            </div>
          )}

          <ControlledTable
            title={texts.Expense_List || 'Expense List'}
            columns={columns}
            data={tableData}
            fullData={tableData}
            actionColumn={false}
            showSelectAll={false}
            grandTotal={grandTotal}
            showGrandTotal={true}
            grandTotalLabel={texts.Grand_Total || 'Grand Total'}
            enablePermissions={true}
            permissionScope="EXPENSE"
            serverPage={currentPage}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>

        <div className="mt-4 text-right text-lg font-semibold text-black">
          {texts.Grand_Total || 'Grand Total'}: ₹{grandTotal.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default SearchExpenses
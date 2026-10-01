import React, { useState, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import { useQuery, useQueries } from '@tanstack/react-query'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { TextField, Dropdown } from '../../../components/controlled'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import { useExpenseHeads } from '../../../hooks/queries/expense/useExpenseHeads'
import {
  expenseGroupKeys,
  useAddExpenseGroup,
  useUpdateExpenseGroup,
  useDeleteExpenseGroup,
} from '../../../hooks/queries/expense/useExpenseGroup'
import { expenseGroupService } from '../../../services/expense/expenseGroupService'
import type { ExpenseGroupTableRow } from '../../../types/expense/expenseGroup'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const ExpenseGroup: React.FC = () => {
  const [search, setSearch] = useState('')
  const [editIndex, setEditIndex] = useState<string | null>(null)
  const [editHeadId, setEditHeadId] = useState<number | null>(null)
  const [selectedHeadId, setSelectedHeadId] = useState<number | null>(null)

  const { t } = useTranslation()
  const pageText = getPagesDataText(t)

  const { data: expenseHeads = [], isLoading: isLoadingHeads } = useExpenseHeads()

  const allSchools = isAllSchools()
  const { data: allSchoolGroups = [], isLoading: isLoadingAllSchool } = useQuery({
    queryKey: expenseGroupKeys.byHead(selectedHeadId ?? 0),
    queryFn: () => expenseGroupService.getAll(selectedHeadId!),
    enabled: allSchools && !!selectedHeadId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
  const groupQueries = useQueries({
    queries: (expenseHeads as any[]).map((head) => ({
      queryKey: expenseGroupKeys.byHead(Number(head.expenseHeadId || head.id)),
      queryFn: () => expenseGroupService.getAll(Number(head.expenseHeadId || head.id)),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !allSchools && !!(head.expenseHeadId || head.id),
      retry: 1,
    })),
  })

  const isLoadingGroups = allSchools ? isLoadingAllSchool : groupQueries.some((q) => q.isLoading)

  const allRows: ExpenseGroupTableRow[] = useMemo(() => {
    if (allSchools) {
      if (!selectedHeadId) return []
      const head = (expenseHeads as any[]).find(
        (h) => Number(h.expenseHeadId || h.id) === selectedHeadId,
      )
      return (allSchoolGroups as any[]).map((g) => ({
        id: String(g.id),
        expenseHeadName: head?.headName || head?.name || '',
        groupName: g.groupName || '',
        expenseHeadId: selectedHeadId,
      }))
    }

    const seen = new Set<string>()
    return groupQueries.flatMap((q, i) => {
      const head = (expenseHeads as any[])[i]
      const groups = (q.data as any[]) || []
      return groups
        .filter((g) => {
          if (seen.has(String(g.id))) return false
          seen.add(String(g.id))
          return true
        })
        .map((g) => ({
          id: String(g.id),
          expenseHeadName: head?.headName || head?.name || '',
          groupName: g.groupName || '',
          expenseHeadId: Number(head?.expenseHeadId || head?.id),
        }))
    })
  }, [allSchools, allSchoolGroups, selectedHeadId, groupQueries, expenseHeads])

  const { mutateAsync: addExpenseGroup } = useAddExpenseGroup()
  const { mutateAsync: updateExpenseGroup } = useUpdateExpenseGroup()
  const { mutateAsync: deleteExpenseGroup } = useDeleteExpenseGroup()

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { groupName: '', expenseHeadId: '' },
  })

  const expenseHeadOptions = (expenseHeads as any[]).map((head) => ({
    label: head.headName || head.name,
    value: String(head.expenseHeadId || head.id),
  }))

  const filterHeadOptions = [...expenseHeadOptions]

  const onSubmit = async (data: FieldValues): Promise<void> => {
    if (!data.expenseHeadId) {
      toast.error('Please select an expense head')
      return
    }
    if (!/^[a-zA-Z\s]+$/.test(data.groupName)) {
      toast.error('Group Name should contain only letters and spaces')
      return
    }

    try {
      if (editIndex !== null && editHeadId !== null) {
        await updateExpenseGroup({
          expenseGroupId: editIndex,
          payload: {
            expenseHeadId: editHeadId,
            groupName: data.groupName.trim(),
          },
        })
        toast.success('Expense group updated successfully!')
        setEditIndex(null)
        setEditHeadId(null)
        reset({ groupName: '', expenseHeadId: '' })
      } else {
        await addExpenseGroup({
          expenseHeadId: Number(data.expenseHeadId),
          groupName: data.groupName.trim(),
        })
        toast.success('Expense group added successfully!')
        reset({ groupName: '', expenseHeadId: data.expenseHeadId })
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (id: string | number): void => {
    const groupId = id.toString()
    const item = allRows.find((r) => r.id === groupId)
    if (!item) return
    setValue('groupName', item.groupName)
    setValue('expenseHeadId', item.expenseHeadId.toString())
    setEditIndex(groupId)
    setEditHeadId(item.expenseHeadId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number): Promise<void> => {
    const item = allRows.find((r) => r.id === id.toString())
    if (!item) return
    if (
      await confirmToast(
        pageText.Do_you_want_to_delete_this_entry || 'Do you want to delete this expense group?',
      )
    ) {
      try {
        await deleteExpenseGroup({
          expenseGroupId: id.toString(),
          expenseHeadId: item.expenseHeadId,
        })
        toast.success('Expense group deleted successfully!')
        if (editIndex === id.toString()) {
          setEditIndex(null)
          setEditHeadId(null)
          reset({ groupName: '', expenseHeadId: '' })
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete expense group.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]): Promise<void> => {
    if (await confirmToast(pageText.Delete_A || 'Do you want to delete these expense groups?')) {
      const failedNames: string[] = []
      const succeededIds: string[] = []

      await Promise.allSettled(
        ids.map(async (id) => {
          const item = allRows.find((r) => r.id === id.toString())
          if (!item) return
          try {
            await deleteExpenseGroup({
              expenseGroupId: id.toString(),
              expenseHeadId: item.expenseHeadId,
            })
            succeededIds.push(id.toString())
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error: any) {
            failedNames.push(item.groupName || id.toString())
          }
        }),
      )

      if (succeededIds.length > 0)
        toast.success(`${succeededIds.length} expense group(s) deleted successfully.`)
      if (failedNames.length > 0) toast.error(`Cannot delete: ${failedNames.join(', ')}`)

      if (editIndex !== null && succeededIds.includes(editIndex)) {
        setEditIndex(null)
        setEditHeadId(null)
        reset({ groupName: '', expenseHeadId: '' })
      }
    }
  }

  const handleCancel = (): void => {
    setEditIndex(null)
    setEditHeadId(null)
    reset({ groupName: '', expenseHeadId: '' })
  }

  const resetFilter = (): void => {
    setSearch('')
    setSelectedHeadId(null)
  }

  const filteredData = allRows.filter(
    (item) =>
      item.groupName.toLowerCase().includes(search.toLowerCase()) ||
      item.expenseHeadName.toLowerCase().includes(search.toLowerCase()),
  )

  const columns = [
    { key: 'expenseHeadName', label: pageText.Expense_Head || 'Expense Head' },
    { key: 'groupName', label: pageText.Fees_Group || 'Expense Group' },
  ]

  if (isLoadingHeads) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if ((expenseHeads as any[]).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 text-lg">
          No expense heads found. Please create an expense head first.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full p-2 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            {editIndex !== null
              ? pageText.Edit || 'Edit Expense Group'
              : pageText.Add || 'Add Expense Group'}
          </h2>

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['expenseHeads', 'expenseGroups']}
            onSchoolChange={resetFilter}
          >
            <Dropdown
              name="expenseHeadId"
              label={pageText.Expense_Head || 'Expense Head'}
              control={control}
              required={true}
              disabled={editIndex !== null}
              options={expenseHeadOptions}
            />

            <TextField
              name="groupName"
              label={pageText.Fees_Group || 'Expense Group Name'}
              control={control}
              placeholder={pageText.Expense_Group_Example || 'e.g., Office Supplies'}
              required={true}
              rules={{ required: 'Expense group name is required' }}
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                name={editIndex !== null ? pageText.Update || 'Update' : pageText.Save || 'Save'}
                loading={false}
                permissionScope="EXPENSES"
                permissionType={editIndex !== null ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                icon={<IconField name={editIndex !== null ? 'FaEdit' : 'FaSave'} />}
              />
              {editIndex !== null && (
                <Button
                  name={pageText.Cancel || 'Cancel'}
                  onClick={handleCancel}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-lg shadow-sm p-4">

          {allSchools && (
            <div className="mb-4 w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {pageText.Expense_Head || 'Filter by Expense Head'}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={selectedHeadId ?? ''}
                onChange={(e) => setSelectedHeadId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Select Expense Head --</option>
                {filterHeadOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoadingGroups ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
              </div>
            ) : allSchools && !selectedHeadId ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-gray-500 text-sm">
                  Please select an expense head to view groups.
                </p>
              </div>
            ) : (
              <ControlledTable
                title={pageText.Expense_Group_List || 'Expense Group List'}
                columns={columns}
                data={filteredData}
                fullData={allRows}
                searchTerm={search}
                onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeleteMultiple={handleDeleteMultiple}
                showSelectAll={true}
                btn={false}
                enablePermissions={true}
                permissionScope="EXPENSES"
                emptyMessage="No expense groups found"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseGroup

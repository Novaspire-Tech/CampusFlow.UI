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
  useExpenseHeads,
  useAddExpenseHead,
  useUpdateExpenseHead,
  useDeleteExpenseHead,
} from '../../../hooks/queries/expense/useExpenseHeads'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const ExpenseHead = () => {
  const [search, setSearch] = useState<string>('')
  const [editIndex, setEditIndex] = useState<string | null>(null)

  const { t } = useTranslation()
  const texts = getPagesDataText(t)
  const AddExpenseText = texts
  const ExpenseListText = texts
  const EditExpenseHeadText = texts
  const ExpenseHeadText = texts
  const DescriptionText = texts
  const UpdateText = texts
  const SaveText = texts
  const Do_You_Want_to_DeleteText = texts
  const DeleteAllText = texts
  const EnterDescriptionText = texts
  const ExpenseHeadPlaceholderText = texts

  const { data: expenseHeads = [], isLoading } = useExpenseHeads()
  const { mutateAsync: addExpenseHead } = useAddExpenseHead()
  const { mutateAsync: updateExpenseHead } = useUpdateExpenseHead()
  const { mutateAsync: deleteExpenseHead } = useDeleteExpenseHead()

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { name: '', description: '' },
  })

  const onSubmit = async (data: FieldValues): Promise<void> => {
    try {
      if (editIndex !== null) {
        const existing = (expenseHeads as any[]).find((h) => h.id === editIndex)
        if (existing) {
          await updateExpenseHead({
            id: editIndex,
            data: {
              ...existing,
              name: data.name,
              description: data.description || '',
            },
          })
          toast.success('Expense Head updated successfully!')
        }
        setEditIndex(null)
      } else {
        await addExpenseHead({
          name: data.name,
          description: data.description || '',
          status: 'Active',
        })
        toast.success('Expense Head added successfully!')
      }
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (id: string | number): void => {
    const expenseHeadId = id.toString()
    const item = (expenseHeads as any[]).find((h) => h.id === expenseHeadId)
    if (!item) return
    setValue('name', item.name)
    setValue('description', item.description || '')
    setEditIndex(expenseHeadId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number | string): Promise<void> => {
    if (
      await confirmToast(
        Do_You_Want_to_DeleteText.Do_you_want_to_delete_this_entry ||
          'Do you want to delete this expense head?',
      )
    ) {
      try {
        await deleteExpenseHead(id.toString())
        toast.success(
          'Expense head deleted successfully. Any related expense records have also been removed.',
        )
        if (editIndex === id.toString()) {
          setEditIndex(null)
          reset()
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete expense head.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (number | string)[]): Promise<void> => {
    if (
      await confirmToast(DeleteAllText.Delete_A || 'Do you want to delete selected expense heads?')
    ) {
      const failedNames: string[] = []
      const succeededIds: string[] = []

      await Promise.allSettled(
        ids.map(async (id) => {
          try {
            await deleteExpenseHead(id.toString())
            succeededIds.push(id.toString())
          } catch (error: any) {
            const item = (expenseHeads as any[]).find((h) => h.id === id.toString())
            const itemName = item?.name || id.toString()
            failedNames.push(itemName)
          }
        }),
      )

      if (succeededIds.length > 0) {
        toast.success(`${succeededIds.length} expense head(s) deleted successfully.`)
      }

      if (failedNames.length > 0) {
        toast.error(
          `Cannot delete the following expense heads as they are assigned to expense groups: ${failedNames.join(', ')}`,
        )
      }

      if (editIndex !== null && succeededIds.includes(editIndex)) {
        setEditIndex(null)
        reset()
      }
    }
  }

  const handleCancel = (): void => {
    setEditIndex(null)
    reset()
  }

  const filteredData = (expenseHeads as any[])
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
    { key: 'name', label: ExpenseHeadText.Expense_Head || 'Expense Head' },
    { key: 'description', label: DescriptionText.Description || 'Description' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading expense heads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      {/* ── Form Panel ── */}
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editIndex !== null ? EditExpenseHeadText.Edit : AddExpenseText.Add}{' '}
          {ExpenseHeadText.Expense_Head}
        </h2>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <NameField
            name="name"
            label={ExpenseHeadText.Expense_Head}
            control={control}
            placeholder={ExpenseHeadPlaceholderText.Expense_Head || 'Enter expense head'}
            required={true}
          />
          <TextAreaField
            name="description"
            label={DescriptionText.Description}
            control={control}
            placeholder={EnterDescriptionText.Description_Plaseholder || 'Enter description'}
            required={false}
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              name={editIndex !== null ? UpdateText.Update : SaveText.Save}
              loading={false}
              permissionScope="EXPENSES"
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

      {/* ── Table Panel ── */}
      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={ExpenseListText.Expense_List || 'Expense Head List'}
          columns={columns}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="EXPENSES"
        />
      </div>
    </div>
  )
}

export default ExpenseHead

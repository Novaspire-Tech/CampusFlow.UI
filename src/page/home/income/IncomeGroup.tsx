import React, { useState, useMemo } from 'react'
import { useForm, Controller, type FieldValues } from 'react-hook-form'
import { useQueries } from '@tanstack/react-query'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { TextField } from '../../../components/controlled'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import { useIncomeHeads } from '../../../hooks/queries/income/useIncomeHeads'
import {
  incomeGroupKeys,
  useAddIncomeGroup,
  useUpdateIncomeGroup,
  useDeleteIncomeGroup,
} from '../../../hooks/queries/income/useIncomeGroups'
import { incomeGroupService } from '../../../services/income/incomeGroupService'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface IncomeGroupTableRow {
  id: string
  incomeHeadName: string
  groupName: string
  incomeHeadId: number
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const IncomeGroup: React.FC = () => {
  const [search, setSearch] = useState('')
  const [editIndex, setEditIndex] = useState<string | null>(null)
  const [editHeadId, setEditHeadId] = useState<number | null>(null)

  const [selectedHeadId, setSelectedHeadId] = useState<number | null>(null)

  const { t } = useTranslation()
  const texts = getPagesDataText(t)
    const NameText = getPagesNameText(t);
  

  const { data: incomeHeads = [], isLoading: isLoadingHeads } = useIncomeHeads()

  const allSchools = isAllSchools()

  const headsToFetch = useMemo(() => {
    if (allSchools) {
      return selectedHeadId
        ? [(incomeHeads as any[]).find((h) => Number(h.id) === selectedHeadId)].filter(Boolean)
        : []
    }
    return incomeHeads as any[]
  }, [allSchools, incomeHeads, selectedHeadId])

  const groupQueries = useQueries({
    queries: headsToFetch.map((head) => ({
      queryKey: incomeGroupKeys.byHead(Number(head.id), allSchools),
      queryFn: () => incomeGroupService.getAll(Number(head.id)),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!head.id,
      retry: 1,
    })),
  })

  const isLoadingGroups = groupQueries.some((q) => q.isLoading)

  const allRows: IncomeGroupTableRow[] = useMemo(
    () =>
      groupQueries.flatMap((q, i) => {
        const head = headsToFetch[i]
        const groups = (q.data as any[]) || []
        return groups.map((g) => ({
          id: g.id,
          incomeHeadName: head?.name || '',
          groupName: g.groupName || '',
          incomeHeadId: Number(head?.id),
        }))
      }),
    [groupQueries, headsToFetch],
  )

  const { mutateAsync: addIncomeGroup } = useAddIncomeGroup()
  const { mutateAsync: updateIncomeGroup } = useUpdateIncomeGroup()
  const { mutateAsync: deleteIncomeGroup } = useDeleteIncomeGroup()

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { groupName: '', incomeHeadId: '' },
  })

  const onSubmit = async (data: FieldValues): Promise<void> => {
    if (!data.incomeHeadId) {
      toast.error('Please select an income head')
      return
    }

    try {
      if (editIndex !== null && editHeadId !== null) {
        await updateIncomeGroup({
          incomeGroupId: editIndex,
          payload: {
            incomeHeadId: editHeadId,
            groupName: data.groupName.trim(),
          },
        })
        toast.success('Income group updated successfully!')
        setEditIndex(null)
        setEditHeadId(null)
        reset({ groupName: '', incomeHeadId: '' })
      } else {
        await addIncomeGroup({
          incomeHeadId: Number(data.incomeHeadId),
          groupName: data.groupName.trim(),
        })
        toast.success('Income group added successfully!')
        reset({ groupName: '', incomeHeadId: data.incomeHeadId })
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
    setValue('incomeHeadId', item.incomeHeadId.toString())
    setEditIndex(groupId)
    setEditHeadId(item.incomeHeadId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number): Promise<void> => {
    const item = allRows.find((r) => r.id === id.toString())
    if (!item) return
    if (
      await confirmToast(
        texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this income group?',
      )
    ) {
      try {
        await deleteIncomeGroup({
          incomeGroupId: id.toString(),
          incomeHeadId: item.incomeHeadId,
        })
        toast.success('Income group deleted successfully!')
        if (editIndex === id.toString()) {
          setEditIndex(null)
          setEditHeadId(null)
          reset({ groupName: '', incomeHeadId: '' })
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete income group.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]): Promise<void> => {
    if (await confirmToast(texts.Delete_A || 'Do you want to delete these income groups?')) {
      const failedNames: string[] = []
      const succeededIds: string[] = []

      await Promise.allSettled(
        ids.map(async (id) => {
          const item = allRows.find((r) => r.id === id.toString())
          if (!item) return
          try {
            await deleteIncomeGroup({
              incomeGroupId: id.toString(),
              incomeHeadId: item.incomeHeadId,
            })
            succeededIds.push(id.toString())
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error: any) {
            failedNames.push(item.groupName || id.toString())
          }
        }),
      )

      if (succeededIds.length > 0)
        toast.success(`${succeededIds.length} income group(s) deleted successfully.`)

      if (failedNames.length > 0) toast.error(`Cannot delete: ${failedNames.join(', ')}`)

      if (editIndex !== null && succeededIds.includes(editIndex)) {
        setEditIndex(null)
        setEditHeadId(null)
        reset({ groupName: '', incomeHeadId: '' })
      }
    }
  }

  const handleCancel = (): void => {
    setEditIndex(null)
    setEditHeadId(null)
    reset({ groupName: '', incomeHeadId: '' })
  }

  const filteredData = allRows.filter(
    (item) =>
      item.groupName.toLowerCase().includes(search.toLowerCase()) ||
      item.incomeHeadName.toLowerCase().includes(search.toLowerCase()),
  )

  const columns = [
    { key: 'incomeHeadName', label: texts.Income_Head || 'Income Head' },
    { key: 'groupName', label: texts.Income_Group_Report || 'Income Group' },
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

  if ((incomeHeads as any[]).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 text-lg">
          No income heads found. Please create an income head first.
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
              ? texts.Edit || 'Edit Income Group'
              : texts.Add || 'Add Income Group'}
          </h2>

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['incomeHeads', 'incomeGroups']}
            onSchoolChange={reset}
          >
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {texts.Income_Head || 'Income Head'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Controller
                name="incomeHeadId"
                control={control}
                rules={{ required: 'Income head is required' }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <select
                      {...field}
                      disabled={editIndex !== null}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm
                        focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${error ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">{NameText.Income_Head}</option>
                      {(incomeHeads as any[]).map((head) => (
                        <option key={head.id} value={head.id.toString()}>
                          {head.name}
                        </option>
                      ))}
                    </select>
                    {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
                  </>
                )}
              />
            </div>

            <TextField
              name="groupName"
              label={NameText.Income_Group || 'Income Group Name'}
              control={control}
              placeholder={NameText.Income_Group}
              required={true}
              rules={{ required: 'Income group name is required' }}
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

        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">{texts.Income_List || 'Income Group List'}</h2>

          {allSchools && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Income Head
              </label>
              <select
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={selectedHeadId ?? ''}
                onChange={(e) => setSelectedHeadId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">-- Select Income Head --</option>
                {(incomeHeads as any[]).map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
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
                  Please select an income head to view groups.
                </p>
              </div>
            ) : (
              <ControlledTable
                title=""
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
                permissionScope="INCOME"
                emptyMessage="No income groups found"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncomeGroup

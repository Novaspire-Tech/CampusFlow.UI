import { useState, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField, Label } from '../../../components'
import { TextareaField, TextField } from '../../../components/controlled'
import Dropdown from '../../../components/controlled/Dropdown'
import CheckboxField from '../../../components/controlled/CheckboxField'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterSubjectGroups,
  useCreateSubjectGroup,
  useUpdateSubjectGroup,
  useDeleteSubjectGroup,
  useDeleteMultipleSubjectGroups,
} from '../../../hooks/queries/academics/useSubjectGroup'
import type { SubjectGroupSearchParams } from '../../../services/academics/subjectGroupService'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSubjects } from '../../../hooks/queries/academics/useSubject'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface SubjectGroupFormValues {
  subjectGroup: string
  description: string
  schoolClassId: string
  [key: `subject_${string}`]: boolean
}

function SubjectGroup() {
  const { t } = useTranslation()
  const text = getPagesDataText(t)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [activeFilters, setActiveFilters] = useState<SubjectGroupSearchParams>({})

  const {
    data: subjectGroupResponse,
    isLoading,
    isFetching,
    error,
  } = useFilterSubjectGroups(activeFilters, page, pageSize)

  const { data: classesData } = useSchoolClasses()
  const { data: subjectsData } = useSubjects()

  const createGroup = useCreateSubjectGroup()
  const updateGroup = useUpdateSubjectGroup()
  const deleteGroup = useDeleteSubjectGroup()
  const deleteMultipleGroups = useDeleteMultipleSubjectGroups()

  const subjectGroups = subjectGroupResponse?.subjectGroups ?? []
  const totalItems = subjectGroupResponse?.totalItems ?? 0
  const totalPages = subjectGroupResponse?.totalPages ?? 0

  const [editingId, setEditingId] = useState<string | null>(null)

  const { control, handleSubmit, reset, setValue, watch } = useForm<SubjectGroupFormValues>({
    defaultValues: {
      subjectGroup: '',
      description: '',
      schoolClassId: '',
    },
  })

  const formValues = watch()
  const selectedSubjects: string[] = useMemo(() => {
    return Object.keys(formValues)
      .filter(
        (key) => key.startsWith('subject_') && !!formValues[key as keyof SubjectGroupFormValues],
      )
      .map((key) => key.replace('subject_', ''))
  }, [formValues])

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterClassId: '',
      filterSubjectGroupName: '',
    },
  })

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: SubjectGroupSearchParams = {}
    if (data.filterClassId) params.classId = data.filterClassId
    if (data.filterSubjectGroupName?.trim())
      params.subjectGroupName = data.filterSubjectGroupName.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterClassId: '', filterSubjectGroupName: '' })
    setActiveFilters({})
    setPage(0)
  }

  const onSubmit = async (data: SubjectGroupFormValues) => {
    if (!data.subjectGroup?.trim()) {
      toast.error('Subject group name is required')
      return
    }
    if (!data.schoolClassId) {
      toast.error('Please select a class')
      return
    }
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject')
      return
    }

    const payload = {
      subjectGroup: data.subjectGroup.trim(),
      description: data.description?.trim() || '',
      schoolClassId: data.schoolClassId,
      subjectIds: selectedSubjects,
    }

    try {
      if (editingId) {
        await updateGroup.mutateAsync({ id: editingId, data: payload })
        toast.success('Subject group updated successfully!')
      } else {
        await createGroup.mutateAsync(payload)
        toast.success('Subject group added successfully!')
      }
      resetForm()
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.message || 'Error saving subject group')
    }
  }

  const resetForm = () => {
    const subjectResets = (subjectsData || []).reduce(
      (acc: any, sub: any) => ({ ...acc, [`subject_${sub.id}`]: false }),
      {},
    )
    reset({ subjectGroup: '', description: '', schoolClassId: '', ...subjectResets })
    setEditingId(null)
  }

  const handleEdit = (id: string | number) => {
    const item = subjectGroups.find((g: any) => g.id === id.toString())
    if (!item) return

    setValue('subjectGroup', item.subjectGroup)
    setValue('description', (item as any).description || '')
    setValue('schoolClassId', item.schoolClass?.id || item.schoolClass?.schoolClassId || '')

      ; (subjectsData || []).forEach((sub: any) => {
        const isAssigned = (item.subjects || []).some(
          (s: any) => String(s.id || s.subjectId) === String(sub.id),
        )
        setValue(`subject_${sub.id}`, isAssigned)
      })

    setEditingId(item.subjectGroupId || item.id || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    if (
      !(await confirmToast(
        text.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
      ))
    )
      return

    const item = subjectGroups.find((g: any) => g.id === id.toString())
    if (!item) return

    try {
      await deleteGroup.mutateAsync(item.subjectGroupId || item.id || '')
      toast.success('Subject group deleted successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting subject group')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!(await confirmToast(`Delete ${ids.length} selected subject group(s)?`))) return

    const backendIds = ids
      .map((id) => subjectGroups.find((g: any) => g.id === id.toString())?.subjectGroupId)
      .filter(Boolean) as string[]

    if (backendIds.length === 0) {
      toast.error('No valid groups found to delete')
      return
    }

    try {
      await deleteMultipleGroups.mutateAsync(backendIds)
      toast.success('Selected subject groups deleted successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting subject groups')
    }
  }

  const columns = [
    {
      key: 'subjectGroup',
      label: text.Subject_Group || 'Subject Group',
      render: (_: any, row: any) => row.subjectGroup || '',
    },
    {
      key: 'className',
      label: text.Class || 'Class',
      render: (_: any, row: any) => row.schoolClass?.className || '',
    },
    {
      key: 'subjectNames',
      label: text.Subject || 'Subjects',
      render: (_: any, row: any) =>
        (row.subjects || []).map((s: any) => s.subjectName).join(', ') || '',
    },
  ]

  const classOptions =
    classesData?.map((cls: any) => ({
      label: cls.className,
      value: cls.id || cls.schoolClassId,
    })) || []

  const isSubmitting = createGroup.isPending || updateGroup.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error loading data. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3 p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">
            {editingId
              ? text.Edit_Subject_Group || 'Edit Subject Group'
              : text.Add_Subject_Group || 'Add Subject Group'}
          </h2>

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['schoolClasses', 'subjects', 'subjectGroups']}
            onSchoolChange={resetForm}
            className="space-y-4 mt-4"
          >
            <TextField
              name="subjectGroup"
              label={text.Subject_Group || 'Subject Group Name'}
              control={control}
              placeholder={text.Enter_Subject_Group || 'Enter Subject Group'}
              required
            />

            <Dropdown
              name="schoolClassId"
              label={text.Class || 'Class'}
              control={control}
              options={classOptions}
              required
            />

            <div>
              <Label label={text.Subject || 'Subject'} required />
              <div className="border rounded p-3 max-h-60 overflow-y-auto space-y-1 mt-2">
                {subjectsData && subjectsData.length > 0 ? (
                  subjectsData.map((sub: any) => (
                    <CheckboxField
                      key={sub.id}
                      name={`subject_${sub.id}`}
                      label={sub.subjectName}
                      control={control}
                      disabled={isSubmitting}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No subjects available</p>
                )}
              </div>

              {selectedSubjects.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {selectedSubjects.length}
                  {selectedSubjects.length > 1} {text.Subjects_Selected || 'selected'}
                </p>
              )}
            </div>

            <TextareaField
              name="description"
              label={text.Description || 'Description'}
              placeholder={text.Enter_Description || 'Enter Description'}
              control={control}
            />

            <div className="flex gap-2 pt-2">
              {editingId && (
                <Button
                  name={text.Cancel || 'Cancel'}
                  icon={<IconField name="FaTimes" />}
                  onClick={resetForm}
                  loading={false}
                  isDisable={isSubmitting}
                  type="button"
                />
              )}
              <Button
                name={editingId ? text.Update || 'Update' : text.Save || 'Save'}
                icon={<IconField name="FaSave" />}
                loading={isSubmitting}
                isDisable={isSubmitting}
                permissionScope="SCHOOL_CLASS"
                permissionType={editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                type="submit"
              />
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 p-4 bg-white shadow rounded">
          <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Dropdown
                name="filterClassId"
                label={text.Class || 'Class'}
                control={filterControl}
                required={false}
                options={classOptions}
              />
              <TextField
                label={text.Subject_Group || 'Subject Group Name'}
                name="filterSubjectGroupName"
                placeholder={text.Search_By_Group_Name || 'Search by group name...'}
                control={filterControl}
              />
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={handleClearFilters}
                name={text.Cancel || 'Clear'}
                loading={false}
                icon={<IconField name="FaTimes" />}
                type="button"
                showAlways={true}
              />
              <Button
                name={text.Search || 'Search'}
                loading={isFetching}
                icon={<IconField name="FaSearch" />}
                type="submit"
                showAlways={true}
              />
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
              title={text.Subject_Group_List || 'Subject Group List'}
              columns={columns}
              data={subjectGroups}
              fullData={subjectGroups}
              showSearch={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              showSelectAll
              btn={false}
              enablePermissions={true}
              permissionScope="SCHOOL_CLASS"
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

export default SubjectGroup

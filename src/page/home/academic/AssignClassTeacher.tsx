import { useState, useEffect } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { Dropdown } from '../../../components/controlled'
import TextField from '../../../components/controlled/TextField'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'

import {
  useFilterAssignClassTeachers,
  useCreateAssignClassTeacher,
  useUpdateAssignClassTeacher,
  useDeleteAssignClassTeacher,
  useDeleteMultipleAssignClassTeachers,
} from '../../../hooks/queries/academics/useAssignClassTeacher'
import type { AssignClassTeacherSearchParams } from '../../../services/academics/assignClassTeacherService'

import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useTeachers } from '../../../hooks/queries/academics/useTeachers'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

function AssignClassTeachers() {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [activeFilters, setActiveFilters] = useState<AssignClassTeacherSearchParams>({})

  const {
    data: assignResponse,
    isLoading,
    isFetching,
    error,
  } = useFilterAssignClassTeachers(activeFilters, page, pageSize)

  const { data: classesData } = useSchoolClasses()
  const { data: teachersData } = useTeachers()
  console.log(teachersData)

  const createAssign = useCreateAssignClassTeacher()
  const updateAssign = useUpdateAssignClassTeacher()
  const deleteAssign = useDeleteAssignClassTeacher()
  const deleteMultipleAssign = useDeleteMultipleAssignClassTeachers()

  const classTeachers = assignResponse?.classTeachers ?? []
  const totalItems = assignResponse?.totalItems ?? 0
  const totalPages = assignResponse?.totalPages ?? 0

  const [editingId, setEditingId] = useState<string | null>(null)

  const { control, handleSubmit, reset, watch, setValue } = useForm<FieldValues>({
    defaultValues: { schoolClassId: '', sectionId: '', teacherId: '' },
  })

  const selectedClassId = watch('schoolClassId')

  const { data: sectionsData } = useSections(selectedClassId ? Number(selectedClassId) : 0)

  useEffect(() => {
    if (!editingId) setValue('sectionId', '')
  }, [selectedClassId, editingId, setValue])

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
    watch: watchFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterClassId: '', filterSectionId: '', filterSearch: '' },
  })

  const selectedFilterClassId = watchFilter('filterClassId')

  const { data: filterSectionsData } = useSections(
    selectedFilterClassId ? Number(selectedFilterClassId) : 0,
  )

  const filterSectionOptions =
    filterSectionsData?.map((s: any) => ({
      label: s.sectionName,
      value: String(s.sectionId ?? s.id),
    })) ?? []

  const handlePageChange = (newPage: number) => setPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: AssignClassTeacherSearchParams = {}
    if (data.filterClassId) params.classId = data.filterClassId
    if (data.filterSectionId) params.sectionId = data.filterSectionId
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterClassId: '', filterSectionId: '', filterSearch: '' })
    setActiveFilters({})
    setPage(0)
  }

  const onSubmit = async (data: FieldValues) => {
    console.log(data)
    if (!data.schoolClassId || !data.sectionId || !data.teacherId) {
      toast.error('Please fill all required fields')

      return
    }
    // Find the teacher's name for classTeacher field
    const teacherObj = teachersData?.find(
      (t: any) => String(t.teachersId ?? t.teacherId ?? t.id) === String(data.teacherId),
    )
    const classTeacher = teacherObj?.name ?? ''

    const payload = {
      classTeacher,
      schoolClassId: String(data.schoolClassId),
      sectionId: String(data.sectionId),
      teacherId: String(data.teacherId),
    }
    console.log(payload)

    try {
      if (editingId) {
        await updateAssign.mutateAsync({ id: editingId, data: payload })
        toast.success('Class teacher assignment updated successfully!')
      } else {
        await createAssign.mutateAsync(payload)
        toast.success('Class teacher assigned successfully!')
      }
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save class teacher assignment')
    }
  }

  const resetForm = () => {
    reset({ schoolClassId: '', sectionId: '', teacherId: '' })
    setEditingId(null)
  }
  const handleEdit = (id: string | number) => {
    const strId = String(id)
    const item = classTeachers.find((i) => i.id === strId || i.assignClassTeacherId === strId)
    if (!item) return

    setEditingId(item.assignClassTeacherId ?? item.id ?? '')

    const normalise = (s?: string) => (s ?? '').toLowerCase().trim()
    const itemName = normalise(item.classTeacher || item.teacher?.name)

    const matched = teachersData?.find((t: any) => normalise(t.name || t.teacherName) === itemName)

    const teacherId = matched ? String(matched.teachersId ?? matched.id ?? '') : ''

    setValue('schoolClassId', item.schoolClass?.schoolClassId ?? '')
    setValue('teacherId', teacherId)

    setTimeout(() => {
      setValue('sectionId', item.section?.sectionId ?? '')
    }, 200)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    const ok = await confirmToast(
      Text.Do_you_want_to_delete_this_entry ?? 'Do you want to delete this entry?',
    )
    if (!ok) return

    const strId = String(id)
    const item = classTeachers.find((i) => i.id === strId || i.assignClassTeacherId === strId)
    if (!item) return

    try {
      await deleteAssign.mutateAsync(item.assignClassTeacherId ?? item.id ?? '')
      toast.success('Class teacher assignment deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete class teacher assignment')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const ok = await confirmToast(
      Text.Do_you_want_to_delete_this_entry ?? 'Do you want to delete selected entries?',
    )
    if (!ok) return

    const backendIds = ids
      .map((id) => {
        const strId = String(id)
        return classTeachers.find((i) => i.id === strId || i.assignClassTeacherId === strId)
          ?.assignClassTeacherId
      })
      .filter((v): v is string => Boolean(v))

    if (backendIds.length === 0) return

    try {
      await deleteMultipleAssign.mutateAsync(backendIds)
      toast.success('Selected class teacher assignments deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete class teacher assignments')
    }
  }

  const columns = [
    {
      key: 'className',
      label: Text.Class,
      render: (_: any, row: any) => row.schoolClass?.className ?? '',
    },
    {
      key: 'sectionName',
      label: NameText.Section,
      render: (_: any, row: any) => row.section?.sectionName ?? '',
    },
    {
      key: 'teacherName',
      label: Text.Class_Teacher,

      render: (_: any, row: any) => row.classTeacher || row.teacher?.name || '',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading data…</p>
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
        <div className="w-full lg:w-1/3 p-4 bg-white shadow-md rounded">
          <h1 className="text-xl font-semibold">
            {editingId
              ? (Text.Update_Class_Teacher ?? 'Update Class Teacher')
              : (Text.Assign_Class_Teacher_Title ?? 'Assign Class Teacher')}
          </h1>
          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            queryKeys={['sections', 'schoolClasses', 'teachers']}
            className="space-y-4 mt-4"
          >
            <Dropdown
              name="schoolClassId"
              label={Text.Class ?? 'Class'}
              control={control}
              required
              options={
                classesData?.map((c: any) => ({
                  label: c.className,
                  value: String(c.schoolClassId ?? c.id),
                })) ?? []
              }
            />

            <Dropdown
              name="sectionId"
              label={NameText.Section ?? 'Section'}
              control={control}
              required
              options={
                sectionsData?.map((s: any) => ({
                  label: s.sectionName,
                  value: String(s.sectionId ?? s.id),
                })) ?? []
              }
            />

            <Dropdown
              label={Text.Teacher}
              name="teacherId"
              control={control}
              required
              options={
                !teachersData || teachersData.length === 0
                  ? [{ value: '', label: 'No teachers available' }]
                  : teachersData.map((t: any) => ({
                    value: String(t.teachersId ?? t.teacherId ?? t.id),
                    label: t.name || t.teacherName || 'Unknown Teacher',
                  }))
              }
            />

            <div className="flex gap-2">
              <Button
                name={editingId ? (Text.Update ?? 'Update') : (Text.Save ?? 'Save')}
                icon={<IconField name="FaSave" />}
                loading={createAssign.isPending || updateAssign.isPending}
                permissionScope="ACADEMICS"
                permissionType={editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
              />
              {editingId && (
                <Button
                  name={Text.Cancel ?? 'Cancel'}
                  icon={<IconField name="FaTimes" />}
                  onClick={resetForm}
                  loading={false}
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 bg-white shadow-md rounded p-4">
          {/* Filter form */}
          <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Dropdown
                name="filterClassId"
                label={Text.Class ?? 'Class'}
                control={filterControl}
                required={false}
                options={
                  classesData?.map((c: any) => ({
                    label: c.className,
                    value: String(c.schoolClassId ?? c.id),
                  })) ?? []
                }
              />

              <Dropdown
                name="filterSectionId"
                label={NameText.Section ?? 'Section'}
                control={filterControl}
                required={false}
                options={filterSectionOptions}
              />

              <TextField
                label={Text.Search}
                name="filterSearch"
                placeholder={Text.Search_By_Teacher_Name || "Search by teacher name…"}
                control={filterControl}
              />
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={handleClearFilters}
                name={Text.Cancel}
                loading={false}
                icon={<IconField name="FaTimes" />}
                showAlways={true}
              />
              <Button
                name={Text.Search}
                loading={isFetching}
                icon={<IconField name="FaSearch" />}
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
              title={Text.Class_Teacher_List ?? 'Class Teacher List'}
              columns={columns}
              data={classTeachers}
              fullData={classTeachers}
              showSearch={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              showSelectAll
              btn={false}
              enablePermissions={true}
              permissionScope="ACADEMICS"
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

export default AssignClassTeachers

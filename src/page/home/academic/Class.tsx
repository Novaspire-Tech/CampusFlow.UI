import { useState, useEffect } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import {
  useSchoolClasses,
  useSchoolClassesBySession,
  useCreateSchoolClass,
  useUpdateSchoolClass,
  useDeleteSchoolClass,
  useDeleteMultipleSchoolClasses,
} from '../../../hooks/queries/academics/useClasses'
import TextField from '../../../components/controlled/TextField'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface ClassItem {
  id: string
  className: string
  sections: string
}

function SchoolClass() {
  const { t } = useTranslation()
  const classText = getPagesDataText(t)
  const sectionText = getPagesNameText(t)

  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
    () => localStorage.getItem('selectedSessionId') ?? undefined,
  )

  const { data: allClassesData } = useSchoolClasses()
  const { data: sessionClassesData } = useSchoolClassesBySession(selectedSessionId)

  const activeData = selectedSessionId ? sessionClassesData : allClassesData

  const createClass = useCreateSchoolClass()
  const updateClass = useUpdateSchoolClass()
  const deleteClass = useDeleteSchoolClass()
  const deleteMultipleClasses = useDeleteMultipleSchoolClasses()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [localClasses, setLocalClasses] = useState<ClassItem[]>([])

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      className: '',
    },
  })

  useEffect(() => {
    if (activeData && Array.isArray(activeData)) {
      const formatted: ClassItem[] = activeData.map((item: any) => ({
        id: item.schoolClassId?.toString() || item.id,
        className: item.className,
        sections: item.sections?.map((s: any) => s.sectionName).join(', ') || '',
      }))
      setLocalClasses(formatted)
    }
  }, [activeData])

  useEffect(() => {
    const handleStorageChange = () => {
      const id = localStorage.getItem('selectedSessionId') ?? undefined
      setSelectedSessionId(id)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const onSubmit = async (data: FieldValues) => {
    if (!/^[a-zA-Z0-9\s.,'"!@?()-]*$/.test(data.className)) {
      toast.error('Class Name should contain only letters and numbers')
      return
    }

    try {
      const payload = { className: data.className.trim() }

      if (editingId) {
        await updateClass.mutateAsync({ id: editingId, data: payload })
        toast.success('Class updated successfully!')
        setEditingId(null)
        resetForm()
      } else {
        await createClass.mutateAsync(payload)
        toast.success('Class created successfully!')
        resetForm()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save class. Please try again.')
    }
  }

  const resetForm = () => {
    reset({ className: '' })
    setEditingId(null)
  }

  const handleEdit = (id: string | number) => {
    const stringId = id.toString()
    const item = localClasses.find((i) => i.id === stringId)
    if (!item) return

    setValue('className', item.className)
    setEditingId(stringId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    const stringId = id.toString()
    const confirmDelete = await confirmToast(
      classText.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (!confirmDelete) return

    try {
      await deleteClass.mutateAsync(stringId)
      toast.success('Class deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class. Please try again.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmDelete = await confirmToast(
      classText.Do_you_want_to_delete_this_entry || 'Do you want to delete these entries?',
    )
    if (!confirmDelete) return

    try {
      const stringIds = ids.map((x) => x.toString())
      const result = await deleteMultipleClasses.mutateAsync(stringIds)
      const successMessage = typeof result === 'string' ? result : 'Classes deleted successfully!'
      toast.success(successMessage)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete classes. Please try again.')
    }
  }

  const handleCancel = () => {
    resetForm()
  }

  const filteredClasses = localClasses.filter((item) =>
    Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()),
  )

  const columns = [
    { key: 'className', label: classText.Class || 'Class' },
    { key: 'sections', label: sectionText.Section || 'Sections' },
  ]

  const isMutating = createClass.isPending || updateClass.isPending

  return (
    <div className="w-full px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Form Section */}
        <div className="w-full lg:w-1/3 p-4 bg-white shadow-md rounded">
          <h1 className="text-xl font-semibold mb-2">
            {editingId ? classText.Edit_Class || 'Edit Class' : classText.Add_Class || 'Add Class'}
          </h1>

          <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="className"
              label={classText.Class || 'Class'}
              control={control}
              required
              placeholder={classText.Enter_Class_Name || 'Enter Class Name'}
            />

            <div className="flex gap-2">
              <Button
                name={editingId ? classText.Update || 'Update' : classText.Save || 'Save'}
                loading={isMutating}
                icon={<IconField name="FaSave" />}
                permissionScope="SCHOOL_CLASS"
                permissionType={editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
              />
              {editingId && (
                <Button
                  name={classText.Cancel || 'Cancel'}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                  onClick={handleCancel}
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        {/* Table Section */}
        <div className="w-full lg:w-2/3 p-2 bg-white shadow-md rounded overflow-auto">
          <ControlledTable
            title={classText.Class_List || 'Class List'}
            columns={columns}
            data={filteredClasses}
            fullData={localClasses}
            searchTerm={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            showSelectAll
            btn={false}
            enablePermissions={true}
            permissionScope="SCHOOL_CLASS"
            loading={false}
          />
        </div>
      </div>
    </div>
  )
}

export default SchoolClass

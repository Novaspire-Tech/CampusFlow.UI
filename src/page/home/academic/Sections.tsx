import React, { useState, useEffect } from 'react'
import { useForm, Controller, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, } from '../../../helpers/useTranslations'
import {
  useSections,
  useAddSection,
  useUpdateSection,
  useDeleteSection,
  useDeleteMultipleSections,
} from '../../../hooks/queries/academics/useSections'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { TextField } from '../../../components/controlled'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface SectionTableRow {
  id: string
  className: string
  sectionName: string
  schoolClassId: number
}

const Section = () => {
  const [search, setSearch] = useState<string>('')
  const [editIndex, setEditIndex] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)

  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const { data: classes = [], isLoading: isLoadingClasses } = useSchoolClasses()
  const { data: sections = [], isLoading: isLoadingSections } = useSections(selectedClassId || 0)

  const { mutateAsync: addSection } = useAddSection()
  const { mutateAsync: updateSection } = useUpdateSection()
  const { mutateAsync: deleteSection } = useDeleteSection()
  const { mutateAsync: deleteMultipleSections } = useDeleteMultipleSections()

  const { control, handleSubmit, reset, setValue, watch } = useForm<FieldValues>({
    defaultValues: {
      sectionName: '',
      schoolClassId: '',
    },
  })

  const watchClassId = watch('schoolClassId')

  useEffect(() => {
    if (watchClassId) {
      setSelectedClassId(Number(watchClassId))
    }
  }, [watchClassId])

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      const firstClassId = classes[0].schoolClassId || Number(classes[0].id)
      setValue('schoolClassId', firstClassId.toString())
      setSelectedClassId(firstClassId)
    }
  }, [classes, selectedClassId, setValue])

  const getClassNameById = (classId: number): string => {
    const found = classes.find((cls: any) => (cls.schoolClassId || Number(cls.id)) === classId)
    return found ? `Class ${found.className}` : ''
  }

  const onSubmit = async (data: FieldValues) => {
    if (!data.schoolClassId) {
      toast.error('Please select a class')
      return
    }

    if (!/^[a-zA-Z\s]+$/.test(data.sectionName)) {
      toast.error('Section Name should contain only letters and spaces')
      return
    }

    try {
      const classId = Number(data.schoolClassId)

      if (editIndex !== null) {
        await updateSection({
          classId,
          sectionId: editIndex,
          data: {
            sectionName: data.sectionName.trim(),
            schoolClassId: classId,
            className: getClassNameById(classId),
          },
        })
        toast.success('Section updated successfully!')
        setEditIndex(null)
      } else {
        await addSection({
          classId,
          data: {
            sectionName: data.sectionName.trim(),
            schoolClassId: classId,
            className: getClassNameById(classId),
          },
        })
        toast.success('Section added successfully!')
      }

      reset({
        sectionName: '',
        schoolClassId: classId.toString(),
      })
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast.error(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (id: string | number) => {
    const sectionId = id.toString()
    const item = sections.find((s) => s.id === sectionId)
    if (!item) return

    setValue('sectionName', item.sectionName)
    if (item.schoolClassId) {
      setValue('schoolClassId', item.schoolClassId.toString())
      setSelectedClassId(item.schoolClassId)
    }
    setEditIndex(sectionId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number | string) => {
    const sectionId = id.toString()
    const section = sections.find((s) => s.id === sectionId)
    const classId = section?.schoolClassId || selectedClassId

    if (!classId) {
      toast.error('No class selected')
      return
    }

    if (
      await confirmToast(
        Text.Do_you_want_to_delete_this_entry ||
        'Do you want to delete this entry?',
      )
    ) {
      try {
        await deleteSection({ classId, sectionId })
        toast.success('Section deleted successfully!')
        reset({
          sectionName: '',
          schoolClassId: classId.toString(),
        })
        setEditIndex(null)
      } catch (error: any) {
        console.error('Error deleting section:', error)
        toast.error(error.message || 'Failed to delete section.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (!selectedClassId) {
      toast.error('No class selected')
      return
    }

    if (await confirmToast(Text.Delete_A || 'Do you want to delete these entries?')) {
      try {
        const stringIds = ids.map((id) => id.toString())
        await deleteMultipleSections({
          classId: selectedClassId,
          sectionIds: stringIds,
        })
        toast.success('Selected sections deleted successfully!')
        reset({
          sectionName: '',
          schoolClassId: selectedClassId.toString(),
        })
        setEditIndex(null)
      } catch (error: any) {
        console.error('Error deleting sections:', error)
        toast.error(error.message || 'Failed to delete sections.')
      }
    }
  }

  const handleCancel = () => {
    reset({
      sectionName: '',
      schoolClassId: selectedClassId?.toString() || '',
    })
    setEditIndex(null)
  }

  const filteredData: SectionTableRow[] = sections
    .filter((item) => item.sectionName.toLowerCase().includes(search.toLowerCase()))
    .map((item) => ({
      id: item.id,
      className: item.className || getClassNameById(item.schoolClassId),
      sectionName: item.sectionName,
      schoolClassId: item.schoolClassId || 0,
    }))

  const columns = [
    { key: 'className', label: Text.Class || 'Class' },
    { key: 'sectionName', label: Text.Section || 'Section' },
  ]

  if (isLoadingClasses) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">
            No classes found. Please create a class first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 w-full max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="w-full border border-gray-300 p-4 rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold border-b pb-2">
            {editIndex !== null
              ? Text.Edit_Section || 'Edit Section'
              : Text.Add_Section || 'Add Section'}
          </h2>

          <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {Text.Class || 'Class'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Controller
                name="schoolClassId"
                control={control}
                rules={{ required: 'Class is required' }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <select
                      {...field}
                      disabled={editIndex !== null}
                      className={`
                        w-full px-3 py-2 border rounded-md shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${error ? 'border-red-500' : 'border-gray-300'}
                      `}
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((cls: any) => (
                        <option
                          key={cls.schoolClassId || cls.id}
                          value={(cls.schoolClassId || cls.id).toString()}
                        >
                          Class {cls.className}
                        </option>
                      ))}
                    </select>
                    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
                  </>
                )}
              />
            </div>

            <TextField
              name="sectionName"
              label={Text.Section_Name || 'Section Name'}
              control={control}
              placeholder={Text.Section_Name_placeholder || 'e.g., A, B, C'}
              required={true}
            />

            <div className="flex gap-2">
              <Button
                name={
                  editIndex !== null ? Text.Update || 'Update' : Text.Save || 'Save'
                }
                loading={false}
                permissionScope="SCHOOL_CLASS"
                permissionType={editIndex !== null ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                icon={<IconField name="FaSave" />}
              />
              {editIndex !== null && (
                <Button
                  name={Text.Cancel || 'Cancel'}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                  onClick={handleCancel}
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-2 w-full border border-gray-300 p-4 rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold border-b pb-2">
            {Text.Section_List || 'Section List'}
          </h2>
          <div className="mt-4 overflow-x-auto">
            {isLoadingSections ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              </div>
            ) : (
              <ControlledTable
                title=""
                columns={columns}
                data={filteredData}
                fullData={filteredData}
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
                permissionScope="SCHOOL_CLASS"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Section

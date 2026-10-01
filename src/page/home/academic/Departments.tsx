import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField, Label } from '../../../components'
import { TextField } from '../../../components/controlled'
import CheckboxField from '../../../components/controlled/CheckboxField'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '../../../hooks/queries/academics/useDepartments'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface DepartmentFormValues {
  departmentName: string

  [key: `classes_${string}`]: boolean
}

function Departments() {
  const { t } = useTranslation()
  const text = getPagesDataText(t)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { data: deptResponse, isLoading, error } = useDepartments(page, pageSize)
  const departments = deptResponse?.data ?? []
  const totalItems = deptResponse?.total ?? 0
  const totalPages = Math.ceil(totalItems / pageSize)

  const { data: classesRaw = [] } = useSchoolClasses()

  const classesData: { id: string; className: string }[] = classesRaw.map((cls: any) => {
    if (typeof cls === 'string') return { id: cls, className: cls }
    const id = (cls.id ?? cls.schoolClassId)?.toString() ?? ''
    return { id, className: cls.className ?? id }
  })

  const createDepartment = useCreateDepartment()
  const updateDepartment = useUpdateDepartment()
  const deleteDepartment = useDeleteDepartment()

  const [editingId, setEditingId] = useState<string | null>(null)

  const { control, handleSubmit, reset, setValue, watch } = useForm<DepartmentFormValues>({
    defaultValues: { departmentName: '' },
  })

  const formValues = watch()
  const selectedClasses = classesData
    .filter((cls) => !!formValues[`classes_${cls.className}`])
    .map((cls) => cls.className)

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const onSubmit = async (data: DepartmentFormValues) => {
    if (!data.departmentName?.trim()) {
      toast.error('Department name is required')
      return
    }
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class')
      return
    }

    const payload = {
      name: data.departmentName.trim(),
      classNames: selectedClasses,
    }

    try {
      if (editingId) {
        await updateDepartment.mutateAsync({ id: editingId, data: payload })
        toast.success('Department updated successfully!')
      } else {
        await createDepartment.mutateAsync(payload)
        toast.success('Department added successfully!')
      }
      resetForm()
    } catch (err: any) {
      toast.error(err?.message || 'Error saving department')
    }
  }

  const resetForm = () => {
    const checkboxDefaults = classesData.reduce(
      (acc, cls) => ({ ...acc, [`classes_${cls.className}`]: false }),
      {} as Record<string, boolean>,
    )
    reset({ departmentName: '', ...checkboxDefaults })
    setEditingId(null)
  }

  const handleEdit = (id: string | number) => {
    const strId = id.toString()
    const item = departments.find((d) => d.id === strId)
    if (!item) return

    setValue('departmentName', item.name)

    const assignedClassNames = item.classes.map((c: any) => c.className || c.id)
    classesData.forEach((cls) => {
      setValue(`classes_${cls.className}`, assignedClassNames.includes(cls.className))
    })

    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    if (
      !(await confirmToast(
        text.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
      ))
    )
      return

    try {
      await deleteDepartment.mutateAsync(id.toString())
      toast.success('Department deleted successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting department')
    }
  }

  const columns = [
    {
      key: 'name',
      label: text.Department_Name || 'Department Name',
      render: (_: any, row: any) => row.name || '',
    },
    {
      key: 'classNames',
      label: text.Class || 'Classes',
      render: (_: any, row: any) =>
        (row.classes || []).map((c: any) => c.className || c.id).join(', ') || '',
    },
  ]

  const isSubmitting = createDepartment.isPending || updateDepartment.isPending

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
              ? text.Edit_Department || 'Edit Department'
              : text.Add_Department || 'Add Department'}
          </h2>

          <AllSchoolDropdown
            queryKeys={['schoolClasses']}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <TextField
              name="departmentName"
              label={text.Department_Name || 'Department Name'}
              control={control}
              placeholder={text.Enter_Department_Name || 'Enter Department Name'}
              required
            />

            <div>
              <Label label={text.Class || 'Class'} required />
              <div className="border rounded p-3 max-h-60 overflow-y-auto space-y-1 mt-2">
                {classesData.length > 0 ? (
                  classesData.map((cls) => (
                    <CheckboxField
                      key={cls.id}
                      name={`classes_${cls.className}`}
                      label={cls.className}
                      control={control}
                      disabled={isSubmitting}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No classes available</p>
                )}
              </div>

              {selectedClasses.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {selectedClasses.length} class
                  {selectedClasses.length > 1 ? 'es' : ''} selected
                </p>
              )}
            </div>

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
                permissionScope="ACADEMICS"
                permissionType={editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                type="submit"
              />
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 p-4 bg-white shadow rounded">
          <ControlledTable
            title={text.Department_List || 'Department List'}
            columns={columns}
            data={departments}
            fullData={departments}
            showSearch={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showSelectAll={false}
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
  )
}

export default Departments

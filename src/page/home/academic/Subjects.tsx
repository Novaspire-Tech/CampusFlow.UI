import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextField from '../../../components/controlled/TextField'
import RadioButton from '../../../components/controlled/RadioButton'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import type { SubjectFormData } from '../../../types/academics/subject'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useDeleteMultipleSubject,
  useDeleteAllSubject,
} from '../../../hooks/queries/academics/useSubject'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const SubjectPage: React.FC = () => {
  const { control, handleSubmit, reset, setValue } = useForm<SubjectFormData>({
    defaultValues: {
      subjectName: '',
      subjectType: undefined,
      subjectCode: '',
    },
  })

  const [editId, setEditId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { t } = useTranslation()
  const Text = getPagesDataText(t) as any

  const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjects()
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject()
  const deleteSubject = useDeleteSubject()
  const deleteMultipleSubject = useDeleteMultipleSubject()
  const deleteAllSubject = useDeleteAllSubject()

  const isLoading =
    createSubject.isPending ||
    updateSubject.isPending ||
    deleteSubject.isPending ||
    deleteMultipleSubject.isPending ||
    deleteAllSubject.isPending

  const subjectTypeOptions = [
    { value: 'Theory', label: Text.Theory ?? 'Theory' },
    { value: 'Practical', label: Text.Practical ?? 'Practical' },
  ]

  const onSubmit: SubmitHandler<SubjectFormData> = (data) => {
    if (!data.subjectName?.trim()) {
      toast.error('Subject name is required')
      return
    }
    if (!data.subjectType) {
      toast.error('Subject type is required')
      return
    }
    if (!data.subjectCode?.trim()) {
      toast.error('Subject code is required')
      return
    }

    if (editId) {
      updateSubject.mutate({ id: editId, data }, { onSuccess: resetForm })
    } else {
      createSubject.mutate(data, { onSuccess: resetForm })
    }
  }

  const resetForm = () => {
    reset()
    setEditId(null)
  }

  const handleEdit = (id: string | number) => {
    const item = subjects.find((s) => s.id === String(id))
    if (!item) return

    setValue('subjectName', item.subjectName)
    setValue('subjectType', item.subjectType)
    setValue('subjectCode', item.subjectCode)
    setEditId(item.id)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      Text.Do_you_want_to_delete_this_entry ?? 'Do you want to delete this entry?',
    )
    if (!confirmed) return

    deleteSubject.mutate(String(id), {
      onSuccess: () => {
        if (editId === String(id)) resetForm()
      },
    })
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(`Delete ${ids.length} selected subject(s)?`)
    if (!confirmed) return

    const stringIds = ids.map(String)
    deleteMultipleSubject.mutate(stringIds, {
      onSuccess: () => {
        if (editId && stringIds.includes(editId)) resetForm()
      },
    })
  }

  const filteredSubjects = subjects.filter((s) =>
    s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const columns = [
    { key: 'subjectName', label: Text.Subject_Name ?? 'Subject Name' },
    { key: 'subjectCode', label: Text.Subject_Code ?? 'Subject Code' },
    { key: 'subjectType', label: Text.Subject_Type ?? 'Subject Type' },
  ]

  return (
    <div className="bg-neutral-50 p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">
            {editId ? (Text.Edit_Subject ?? 'Edit Subject') : (Text.Add_Subject ?? 'Add Subject')}
          </h2>

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            onSchoolChange={resetForm}
            className="space-y-4"
          >
            <TextField
              name="subjectName"
              label={Text.Subject_Name ?? 'Subject Name'}
              control={control}
              required
              placeholder={Text.Subject_Name_placeholder ?? 'Enter subject name'}
            />

            <RadioButton
              name="subjectType"
              label={Text.Subject_Type ?? 'Subject Type'}
              control={control}
              required
              options={subjectTypeOptions}
            />

            <TextField
              name="subjectCode"
              label={Text.Subject_Code ?? 'Subject Code'}
              control={control}
              required
              placeholder={Text.Subject_Code_placeholder ?? 'Enter subject code'}
            />

            <div className="flex gap-4">
              {editId && (
                <Button
                  name={Text.Cancel ?? 'Cancel'}
                  onClick={resetForm}
                  loading={false}
                  isDisable={isLoading}
                  icon={<IconField name="FaTimes" />}
                  type="button"
                />
              )}
              <Button
                name={editId ? (Text.Update ?? 'Update') : (Text.Save ?? 'Save')}
                icon={<IconField name="FaSave" />}
                permissionScope="SCHOOL_CLASS"
                permissionType={editId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
                loading={isLoading}
                isDisable={isLoading}
                type="submit"
              />
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <ControlledTable
            title={Text.Subject_List ?? 'Subject List'}
            columns={columns}
            data={filteredSubjects}
            loading={isLoadingSubjects}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            actionColumn
            showSelectAll
            enablePermissions={true}
            permissionScope="ACADEMICS"
          />
        </div>
      </div>
    </div>
  )
}

export default SubjectPage

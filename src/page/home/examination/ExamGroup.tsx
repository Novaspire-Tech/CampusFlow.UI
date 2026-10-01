import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextareaField from '../../../components/controlled/TextareaField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { Dropdown, TextField } from '../../../components/controlled'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'

import type { ExamGroup, ExamGroupFormData } from '../../../types/examination/ExamGroup'
import {
  useExamGroups,
  useCreateExamGroup,
  useUpdateExamGroup,
  useDeleteExamGroup,
  useDeleteMultipleExamGroups,
} from '../../../hooks/queries/examination/useExamGroup'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const ExamGroupPage: React.FC = () => {
  const { t } = useTranslation()
  const Texts = getPagesDataText(t)

  const { control, handleSubmit, reset, setValue } = useForm<ExamGroupFormData>({
    defaultValues: {
      name: '',
      description: '',
      schoolClassId: 0,
    },
  })

  const { data: classesData = [] } = useSchoolClasses()
  const { data: examGroups = [], isLoading } = useExamGroups()

  const createExamGroup = useCreateExamGroup()
  const updateExamGroup = useUpdateExamGroup()
  const deleteExamGroup = useDeleteExamGroup()
  const deleteMultipleExamGroups = useDeleteMultipleExamGroups()

  const [editingGroup, setEditingGroup] = useState<ExamGroup | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const resetForm = () => {
    reset({ name: '', description: '', schoolClassId: 0 })
    setEditingGroup(null)
  }

  const onSubmit: SubmitHandler<ExamGroupFormData> = (data) => {
    const submitData: ExamGroupFormData = {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      schoolClassId: Number(data.schoolClassId),
    }

    if (editingGroup) {
      updateExamGroup.mutate(
        { id: editingGroup.examGroupId, data: submitData },
        {
          onSuccess: () => {
            toast.success('Exam group updated successfully!')
            resetForm()
          },
          onError: (error: any) => {
            toast.error(error?.message || 'Failed to update exam group')
          },
        },
      )
    } else {
      createExamGroup.mutate(submitData, {
        onSuccess: () => {
          toast.success('Exam group added successfully!')
          resetForm()
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to add exam group')
        },
      })
    }
  }

  const handleEdit = (id: number) => {
    const group = examGroups.find((g) => g.examGroupId === id)
    if (!group) return

    setValue('name', group.name)
    setValue('description', group.description || '')
    setValue('schoolClassId', group.schoolClassId || 0)

    setEditingGroup(group)
  }

  const handleDelete = async (id: number) => {
    const confirmDelete = await confirmToast(
      Texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )

    if (confirmDelete) {
      deleteExamGroup.mutate(id, {
        onSuccess: () => {
          toast.success('Exam group deleted successfully!')
          if (editingGroup?.examGroupId === id) {
            resetForm()
          }
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to delete exam group')
        },
      })
    }
  }

  const handleDeleteMultiple = async (ids: number[]) => {
    if (!ids.length) return

    const confirmDelete = await confirmToast(
      Texts.Do_you_want_to_delete_this_entry || 'Do you want to delete these entries?',
    )

    if (confirmDelete) {
      deleteMultipleExamGroups.mutate(ids, {
        onSuccess: () => {
          toast.success('Selected exam groups deleted successfully!')
          resetForm()
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to delete exam groups')
        },
      })
    }
  }

  const handleCancel = () => resetForm()

  const filteredGroups = examGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableData = filteredGroups.map((group) => ({
    ...group,
    id: group.examGroupId,
    class: group.schoolClass?.className || 'N/A',
  }))

  const tableColumns = [
    { key: 'name', label: Texts.Name },
    { key: 'class', label: Texts.Class },
    { key: 'description', label: Texts.Description },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AllSchoolDropdown
          onSubmit={handleSubmit(onSubmit)}
          queryKeys={['examGroups', 'schoolClasses']}
          onSchoolChange={resetForm}
          className="bg-white shadow rounded-md p-4 space-y-4"
        >
          <h1 className="mb-4 text-black text-xl font-medium capitalize">{Texts.Exam_Group}</h1>

          <TextField
            name="name"
            label={Texts.Name}
            control={control}
            required
            placeholder={Texts.Enter_Name || 'Enter name'}
          />

          <Dropdown
            label={Texts.Class}
            name="schoolClassId"
            control={control}
            required
            options={classesData.map((c: any) => ({
              label: c.className,
              value: c.id,
            }))}
          />

          <TextareaField
            name="description"
            label={Texts.Description}
            control={control}
            placeholder={Texts.Enter_Description || 'Enter description'}
          />

          <div className="flex gap-2">
            <Button
              name={editingGroup ? Texts.Update : Texts.Save}
              loading={createExamGroup.isPending || updateExamGroup.isPending}
              icon={<IconField name="FaSave" />}
              permissionScope="EXAMINATION"
              permissionType={editingGroup ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
            />

            {editingGroup && <Button name={Texts.Cancel} loading={false} onClick={handleCancel} />}
          </div>
        </AllSchoolDropdown>

        <div className="lg:col-span-2">
          <ControlledTable
            title={Texts.Exam_Group_List}
            columns={tableColumns}
            data={tableData}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onEdit={(id) => handleEdit(Number(id))}
            onDelete={(id) => handleDelete(Number(id))}
            onDeleteMultiple={(ids) => handleDeleteMultiple(ids.map(Number))}
            enablePermissions={true}
            permissionScope="EXAMINATION"
          />
        </div>
      </div>
    </div>
  )
}

export default ExamGroupPage

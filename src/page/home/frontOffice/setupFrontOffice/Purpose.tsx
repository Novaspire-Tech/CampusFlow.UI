import { toast } from 'react-toastify'
import TextFields from '../../../../components/controlled/TextField'
import TextAreaField from '../../../../components/controlled/TextareaField'
import ControlledTable from '../../../../components/uncontrolled/ControlledTable'
import Button from '../../../../components/controlled/Button'
import { IconField } from '../../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../../helpers/useTranslations'
import { confirmToast } from '../../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../../components/uncontrolled/AllSchoolDropdown'

import {
  usePurposes,
  useAddPurpose,
  useUpdatePurpose,
  useDeletePurpose,
  useDeleteMultiplePurposes,
} from '../../../../hooks/queries/frontOffice/setupFrontOffice/usePurpose'

import { useManageFrontOfficeForm } from '../../../../hooks/queries/frontOffice/setupFrontOffice/useManageFrontOfficeForm'
import type { Purpose } from '../../../../types/frontOffice/setupFrontOffice'

const PurposePage = () => {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const { data, isLoading } = usePurposes()
  const deleteMutation = useDeletePurpose()
  const deleteMultipleMutation = useDeleteMultiplePurposes()

  const form = useManageFrontOfficeForm<Purpose>(
    data,
    isLoading,
    'purpose',
    { purpose: '', description: '' },
    { purpose: 'purpose', description: 'description' },
    useAddPurpose(),
    useUpdatePurpose(),
    deleteMutation,
    deleteMultipleMutation,
  )

  const handleDelete = async (id: string | number) => {
    const confirm = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (!confirm) return
    try {
      await deleteMutation.mutateAsync(id.toString())
      toast.success('Purpose deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purpose.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirm = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (!confirm) return
    try {
      await deleteMultipleMutation.mutateAsync(ids.map(String))
      toast.success('Selected purposes deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purposes.')
    }
  }

  if (form.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading purposes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 w-full">
      <div className="w-full lg:w-[40%] p-5 shadow-lg rounded-xl bg-white">
        <h1 className="text-xl font-bold mb-1">
          {form.editingId
            ? texts.Edit_Purpose || 'Edit Purpose'
            : texts.Add_Purpose || 'Add Purpose'}
        </h1>
        <hr className="mb-3" />

        <AllSchoolDropdown onSubmit={form.handleSubmit(form.onSubmit)}>
          <>
            <TextFields
              name="purpose"
              label={texts.Purpose || 'Purpose'}
              control={form.control}
              placeholder={texts.Enter_purpose || 'Enter purpose'}
              required
            />
            <TextAreaField
              name="description"
              label={texts.Description || 'Description'}
              control={form.control}
              placeholder={texts.Write_description || 'Write description'}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                name={form.editingId ? texts.Update || 'Update' : texts.Save || 'Save'}
                loading={form.isLoading}
                icon={<IconField name="FaSave" />}
                permissionScope="FRONT_OFFICE"
                permissionType={form.editingId ? 'UPDATE' : 'CREATE'}
                enablePermissions={true}
              />
              {form.editingId && (
                <Button
                  name={texts.Cancel || 'Cancel'}
                  onClick={() => {
                    form.setEditingId(null)
                    form.reset()
                  }}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                />
              )}
            </div>
          </>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-[60%] shadow-lg rounded-xl p-3 bg-white">
        <ControlledTable
          title={texts.Purpose_List || 'Purpose List'}
          columns={[
            { key: 'purpose', label: texts.Purpose || 'Purpose' },
            { key: 'description', label: texts.Description || 'Description' },
          ]}
          data={form.filteredData}
          searchTerm={form.searchTerm}
          onSearchChange={(e) => form.setSearchTerm(e.target.value)}
          onEdit={form.handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll
          btn={false}
          enablePermissions={true}
          permissionScope="FRONT_OFFICE"
        />
      </div>
    </div>
  )
}

export default PurposePage

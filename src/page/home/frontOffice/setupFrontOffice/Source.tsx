import { toast } from 'react-toastify'
import { confirmToast } from '../../../../helpers/confirmToast'
import TextFields from '../../../../components/controlled/TextField'
import TextAreaField from '../../../../components/controlled/TextareaField'
import ControlledTable from '../../../../components/uncontrolled/ControlledTable'
import Button from '../../../../components/controlled/Button'
import { IconField } from '../../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../../helpers/useTranslations'
import AllSchoolDropdown from '../../../../components/uncontrolled/AllSchoolDropdown'

import {
  useSources,
  useAddSource,
  useUpdateSource,
  useDeleteSource,
  useDeleteMultipleSources,
} from '../../../../hooks/queries/frontOffice/setupFrontOffice/useSource'

import { useManageFrontOfficeForm } from '../../../../hooks/queries/frontOffice/setupFrontOffice/useManageFrontOfficeForm'
import type { Source } from '../../../../types/frontOffice/setupFrontOffice'

const SourcePage = () => {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const { data, isLoading } = useSources()
  const deleteSourceMutation = useDeleteSource()
  const deleteMultipleMutation = useDeleteMultipleSources()

  const form = useManageFrontOfficeForm<Source>(
    data,
    isLoading,
    'source',
    { source: '', description: '' },
    { source: 'source', description: 'description' },
    useAddSource(),
    useUpdateSource(),
    deleteSourceMutation,
    deleteMultipleMutation,
  )

  const handleDeleteWithToast = async (id: string | number) => {
    const confirm = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
    )
    if (confirm) {
      try {
        await deleteSourceMutation.mutateAsync(id.toString())
        toast.success('Source deleted successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete source.')
      }
    }
  }

  const handleDeleteMultipleWithToast = async (ids: (string | number)[]) => {
    const confirm = await confirmToast(texts.Delete_A || 'Do you want to delete these entries?')
    if (confirm) {
      try {
        await deleteMultipleMutation.mutateAsync(ids.map((id) => id.toString()))
        toast.success('Selected sources deleted successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete sources.')
      }
    }
  }

  if (form.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading sources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 w-full">
      {/*  Form panel  */}
      <div className="w-full lg:w-[40%] p-5 shadow-lg rounded-xl bg-white">
        <h1 className="text-lg font-bold mb-1">
          {form.editingId ? texts.Edit_Source || 'Edit Source' : texts.Add_Source || 'Add Source'}
        </h1>
        <hr className="mb-3" />

        <AllSchoolDropdown onSubmit={form.handleSubmit(form.onSubmit)}>
          <>
            <TextFields
              name="source"
              label={texts.Source || 'Source'}
              control={form.control}
              placeholder={texts.Enter_source || 'Enter source'}
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

      {/*  Table panel  */}
      <div className="w-full lg:w-[60%] p-3 shadow-lg rounded-xl bg-white">
        <ControlledTable
          title={texts.Source_List || 'Source List'}
          columns={[
            { key: 'source', label: texts.Source || 'Source' },
            { key: 'description', label: texts.Description || 'Description' },
          ]}
          data={form.filteredData}
          searchTerm={form.searchTerm}
          onSearchChange={(e) => form.setSearchTerm(e.target.value)}
          onEdit={form.handleEdit}
          onDelete={handleDeleteWithToast}
          onDeleteMultiple={handleDeleteMultipleWithToast}
          showSelectAll
          btn={false}
          enablePermissions={true}
          permissionScope="FRONT_OFFICE"
        />
      </div>
    </div>
  )
}

export default SourcePage

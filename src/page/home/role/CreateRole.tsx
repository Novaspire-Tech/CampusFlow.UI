import { useState, type ChangeEvent, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { TextField, TextareaField, Button, Dropdown, ToggleButton,} from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import {useRoles,useRole,useCreateRole,useUpdateRole,useDeleteRole, useRoleTitles, useRoleScopes,useRoleOperations,} from '../../../hooks/queries/role/useCreateRole'
import type { RoleFormData } from '../../../types/role/createRole'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'

interface PermissionRow {
  scope: string
  operations: string[]
}

interface RoleFormInputs {
  roleName: string
  description?: string
  title: string
}

const CreateRole = () => {

   const { t } = useTranslation()
    const Text = getPagesDataText(t)

  const [search, setSearch] = useState<string>('')
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<PermissionRow[]>([])

  const { data: roles = [] } = useRoles()
  const { data: roleTitles = [] } = useRoleTitles()
  const { data: roleScopes = [], isLoading: scopesLoading } = useRoleScopes()
  const { data: roleOperations = [], isLoading: operationsLoading } = useRoleOperations()
  const { data: selectedRole } = useRole(editId || '')

  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const { control, handleSubmit, reset, setValue } = useForm<RoleFormInputs>({
    defaultValues: {
      roleName: '',
      description: '',
      title: '',
    },
  })

  const formatEnumValue = (value: string): string => {
    return value
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  useEffect(() => {
    if (editId && selectedRole) {
      setValue('roleName', selectedRole.name)
      setValue('description', selectedRole.description)
      setValue('title', selectedRole.title)

      const mappedPermissions: PermissionRow[] = selectedRole.crudPermissions.map((perm) => ({
        scope: perm.scope,
        operations: [...perm.operations],
      }))

      setPermissions(mappedPermissions)
    } else if (!editId) {
      reset()
      setPermissions([])
    }
  }, [editId, selectedRole, setValue, reset])

  const addPermissionRow = () => {
    if (permissions.length === 0) {
      setPermissions([{ scope: 'PROFILE', operations: ['READ'] }])
      toast.success( Text.Default_PROFILE_Permission_Added )
    } else {
      setPermissions([...permissions, { scope: '', operations: [] }])
      toast.info('New permission scope added. Please select a scope and operations.')
    }
  }

  const updatePermissionScope = (index: number, scope: string) => {
    const updated = [...permissions]
    updated[index] = { scope: scope, operations: [] }
    setPermissions(updated)
  }

  const toggleOperation = (index: number, operation: string) => {
    const isFirstRow = index === 0 && permissions[0]?.scope === 'PROFILE'

    if (isFirstRow && operation === 'READ') {
      return 
    }

    const updated = [...permissions]
    const currentOps = updated[index].operations
    updated[index].operations = currentOps.includes(operation)
      ? currentOps.filter((op) => op !== operation)
      : [...currentOps, operation]
    setPermissions(updated)
  }

  const removePermissionRow = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index))
    toast.success('Permission scope removed')
  }

  const onSubmit: SubmitHandler<RoleFormInputs> = async (data) => {
    try {
      console.log('Form submitted!', { data, editId, permissions })

      if (permissions.length === 0) {
        toast.error('Add at least one permission')
        return
      }

      const hasEmptyScope = permissions.some((p) => !p.scope)
      if (hasEmptyScope) {
        toast.error('Please select a scope for each permission')
        return
      }

      const hasEmptyOperations = permissions.some((p) => p.operations.length === 0)
      if (hasEmptyOperations) {
        toast.error('Please select at least one operation for each permission')
        return
      }

      const scopes = permissions.map((p) => p.scope)
      const hasDuplicateScopes = new Set(scopes).size !== scopes.length
      if (hasDuplicateScopes) {
        toast.error('Duplicate permission scopes are not allowed')
        return
      }

      const roleData: RoleFormData = {
        name: data.roleName,
        description: data.description || '',
        title: data.title,
        crudPermissions: permissions.map((p) => ({
          scope: p.scope,
          operations: p.operations,
        })),
      }

      console.log('Submitting role data:', roleData)

      if (editId) {
        console.log('Updating role with ID:', editId)
        await updateRole.mutateAsync({ roleId: editId, data: roleData })
        toast.success('Role updated successfully!')
        handleCloseForm()
      } else {
        console.log('Creating new role')
        await createRole.mutateAsync(roleData)
        toast.success('Role created successfully!')
        handleCloseForm()
      }
    } catch (error: any) {
      console.error('Error in role operation:', error)

      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to save role. Please try again.'

      toast.error(errorMessage)
    }
  }

  const handleEdit = (id: string | number | null) => {
    console.log('Editing role with ID:', id)
    setEditId(id as string | null)
    setShowForm(true)
  }

  const handleDelete = async (id: string | number) => {
    const confirmDelete = await confirmToast('Are you sure you want to delete this role?')

    if (confirmDelete) {
      try {
        await deleteRole.mutateAsync(id as string)
        toast.success('Role deleted successfully!')
      } catch (error: any) {
        console.error('Error deleting role:', error)

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete role. Please try again.'

        toast.error(errorMessage)
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditId(null)
    reset()
    setPermissions([])
  }

  const tableData = roles.map((role) => ({
    id: role.roleId,
    name: role.name,
    title: formatEnumValue(role.title),
    description: role.description,
  }))

  const filteredData = tableData.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(search.toLowerCase())),
  )
  return (
    <div className="w-full px-2 sm:px-4 py-4">
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 md:p-6 border-b bg-white">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                {editId ? Text.Edit_Role_And_Permissions : Text.Create_Role_And_Permissions}
              </h2>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Close modal"
              >
                <IconField name="FaTimesCircle" size={28} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 md:p-8 custom-scrollbar">
              <AllSchoolDropdown
                onSubmit={handleSubmit(onSubmit)}
                onSchoolChange={reset}
                className="space-y-6 md:space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="w-full">
                    <TextField
                      name="roleName"
                      placeholder={Text.Enter_Role_Name || 'Enter role name...'}
                      label={Text.Role_Name || 'Role Name'}
                      control={control}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <Dropdown
                      name="title"
                      label={Text.Title || 'Title'}
                      control={control}
                      options={roleTitles}
                      required
                    />
                  </div>
                </div>

                <div className="w-full">
                  <TextareaField
                    name="description"
                    label={Text.Description || 'Description'}
                    control={control}
                    rows={3}
                    placeholder={Text.Enter_Description || 'Enter a description...'}
                    required
                  />
                </div>

                <div className="border-t pt-2 md:pt-2">
                  <div className="flex flex-row justify-between items-center mb-6 gap-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">{Text.CRUD_Permissions || 'CRUD Permissions'}</h3>
                    <Button
                      name={Text.Add || 'Add'}
                      type="button"
                      onClick={addPermissionRow}
                      icon={<IconField name="FaPlus" size={14} />}
                      loading={operationsLoading || scopesLoading}
                      isDisable={operationsLoading || scopesLoading}
                    />
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {permissions.map((row, index) => {
                      const isFirstProfileRow = index === 0 && row.scope === 'PROFILE'

                      return (
                        <div
                          key={index}
                          className="p-4 md:p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-all"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1 w-full">
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">
                               {Text.Select_Scope || 'Select Scope'}
                              </label>
                              <select
                                className={`w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none transition-all ${
                                  isFirstProfileRow
                                    ? 'bg-gray-100 cursor-not-allowed hover:cursor-not-allowed opacity-60'
                                    : 'bg-white focus:ring-2 focus:ring-blue-500'
                                }`}
                                value={row.scope}
                                onChange={(e) => updatePermissionScope(index, e.target.value)}
                                disabled={isFirstProfileRow}
                              >
                                <option value="">-- Select Scope --</option>
                                {roleScopes.map((scope) => (
                                  <option key={scope} value={scope}>
                                    {formatEnumValue(scope)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePermissionRow(index)}
                              className="self-end sm:self-center text-red-500 p-2.5 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all mt-1 sm:mt-5"
                            >
                              <IconField name="FaTrash" size={18} />
                            </button>
                          </div>

                          {row.scope && (
                            <div className="mt-5 pt-4 border-t border-gray-200">
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3 ml-1">
                               {  Text.Operations || ' Operations'}
                              </label>

                              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {roleOperations.map((operation) => {
                                  const isSelected = row.operations.includes(operation)
                                  const isLockedRead = isFirstProfileRow && operation === 'READ'

                                  return (
                                    <div key={operation} className="w-full relative">
                                      <ToggleButton
                                        name={`${operation}-${index}`}
                                        label={formatEnumValue(operation)}
                                        value={isSelected}
                                        onChange={() => toggleOperation(index, operation)}
                                      />
                                      {isLockedRead && (
                                        <div
                                          className="absolute inset-0 cursor-not-allowed bg-transparent"
                                          title="READ permission is required for PROFILE scope"
                                        />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mb-10">
                  <Button
                    name={Text.Cancel || 'Cancel'}
                    type="button"
                    icon={<IconField name="FaTimes" size={20} />}
                    onClick={handleCloseForm}
                    loading={false}
                  />
                  <Button
                    name={Text.Update || 'Update'}
                    type="submit"
                    icon={<IconField name="FaSave" size={20} />}
                    loading={createRole.isPending || updateRole.isPending}
                    isDisable={createRole.isPending || updateRole.isPending}
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </div>
      )}

      <div className="w-full overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100">
        <ControlledTable
          title={Text.Role_Management || 'Role Management'}
          columns={[
            { key: 'name', label: Text.Role_Name || 'Role Name' },
            { key: 'title', label: Text.Title || 'Title' },
            { key: 'description', label: Text.Description || 'Description' },
          ]}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          btn={true}
          btnName={Text.Add || 'Add'}
          showForm={() => {
            setEditId(null)
            reset()
            setPermissions([])
            setShowForm(true)
          }}
          showSelectAll={false}
          enablePermissions={true}
          permissionScope="ROLE"
        />
      </div>
    </div>
  )
}

export default CreateRole

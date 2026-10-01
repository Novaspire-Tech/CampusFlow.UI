import { useState, useEffect, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { TextField, TextareaField, Button, ToggleButton } from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'

import {
  useGroupRoles,
  useGroupRoleScopes,
  useGroupRoleOperations,
  useGroupRoleTitles,
  useCreateGroupRole,
  useUpdateGroupRole,
  useDeleteGroupRole,
} from '../../../hooks/queries/systemSettinds/useGroupRole'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

interface PermissionRow {
  scope: string
  operations: string[]
}

interface RoleFormInputs {
  roleName: string
  description: string
}

const SchoolGroupRole = () => {
  const [search, setSearch] = useState<string>('')
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<PermissionRow[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string>('')
  const [titleError, setTitleError] = useState<boolean>(false)
  const [pendingTitle, setPendingTitle] = useState<string>('')
  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const { data: roles = [], isLoading: rolesLoading } = useGroupRoles()
  const { data: scopes = [], isLoading: scopesLoading } = useGroupRoleScopes()
  const { data: operations = [], isLoading: opsLoading } = useGroupRoleOperations()
  const { data: titles = [], isLoading: titlesLoading } = useGroupRoleTitles()

  const createMutation = useCreateGroupRole()
  const updateMutation = useUpdateGroupRole()
  const deleteMutation = useDeleteGroupRole()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const { control, handleSubmit, reset } = useForm<RoleFormInputs>({
    defaultValues: { roleName: '', description: '' },
  })

  useEffect(() => {
    if (!pendingTitle || titles.length === 0) return

    const matched =
      titles.find((t) => t === pendingTitle) ??
      titles.find((t) => t.toUpperCase() === pendingTitle.toUpperCase()) ??
      ''

    if (matched) {
      setSelectedTitle(matched)
      setTitleError(false)
      setPendingTitle('')
    }
  }, [titles, pendingTitle])

  // Formats "GROUP_ADMIN" → "Group Admin"
  const fmt = (v: string) =>
    v
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')

  const usedScopes = (currentIndex: number) =>
    permissions
      .filter((_, i) => i !== currentIndex)
      .map((p) => p.scope)
      .filter(Boolean)

  const openCreateForm = () => {
    setEditId(null)
    reset({ roleName: '', description: '' })
    setPermissions([])
    setSelectedTitle('')
    setPendingTitle('')
    setTitleError(false)
    setShowForm(true)
  }

  const openEditForm = (id: string | number) => {
    const role = roles.find((r) => r.roleId === String(id))
    if (!role) return

    reset({ roleName: role.name, description: role.description })

    setPermissions(
      role.crudPermissions.map((p) => ({
        scope: p.scope,
        operations: [...p.operations],
      })),
    )

    setEditId(String(id))
    setTitleError(false)

    if (titles.length > 0) {
      const matched =
        titles.find((t) => t === role.title) ??
        titles.find((t) => t.toUpperCase() === role.title?.toUpperCase()) ??
        ''
      setSelectedTitle(matched)
      setPendingTitle('')
    } else {
      setSelectedTitle('')
      setPendingTitle(role.title ?? '')
    }

    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditId(null)
    reset({ roleName: '', description: '' })
    setPermissions([])
    setSelectedTitle('')
    setPendingTitle('')
    setTitleError(false)
  }

  const addPermissionRow = () => {
    if (permissions.length === 0) {
      setPermissions([{ scope: 'PROFILE', operations: ['READ'] }])
      toast.success('Default PROFILE permission added')
    } else {
      setPermissions((prev) => [...prev, { scope: '', operations: [] }])
    }
  }

  const updatePermissionScope = (index: number, scope: string) => {
    setPermissions((prev) => {
      const updated = [...prev]
      updated[index] = { scope, operations: [] }
      return updated
    })
  }

  const toggleOperation = (index: number, operation: string) => {
    if (index === 0 && permissions[0]?.scope === 'PROFILE' && operation === 'READ') return
    setPermissions((prev) => {
      const updated = [...prev]
      const ops = updated[index].operations
      updated[index] = {
        ...updated[index],
        operations: ops.includes(operation)
          ? ops.filter((op) => op !== operation)
          : [...ops, operation],
      }
      return updated
    })
  }

  const removePermissionRow = (index: number) => {
    if (index === 0 && permissions[0]?.scope === 'PROFILE') {
      toast.warning('PROFILE permission is required and cannot be removed')
      return
    }
    setPermissions((prev) => prev.filter((_, i) => i !== index))
    toast.success('Permission scope removed')
  }

  const onSubmit: SubmitHandler<RoleFormInputs> = async (data) => {
    if (!selectedTitle || selectedTitle.trim() === '') {
      setTitleError(true)
      toast.error('Please select a title')
      return
    }
    if (permissions.length === 0) {
      toast.error('Add at least one permission')
      return
    }
    if (permissions.some((p) => !p.scope)) {
      toast.error('Please select a scope for each permission')
      return
    }
    if (permissions.some((p) => p.operations.length === 0)) {
      toast.error('Please select at least one operation for each permission')
      return
    }
    const scopeList = permissions.map((p) => p.scope)
    if (new Set(scopeList).size !== scopeList.length) {
      toast.error('Duplicate permission scopes are not allowed')
      return
    }

    const payload = {
      name: data.roleName.trim(),
      description: data.description.trim(),
      title: selectedTitle,                       
      crudPermissions: permissions.map((p) => ({
        scope: p.scope,
        operations: p.operations,
      })),
    }

    console.debug('[SchoolGroupRole] submitting payload →', JSON.stringify(payload, null, 2))

    try {
      if (editId) {
        await updateMutation.mutateAsync({ roleId: editId, data: payload })
        toast.success('Role updated successfully!')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Role created successfully!')
      }
      handleCloseForm()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Something went wrong'
      toast.error(msg)
      console.error('[SchoolGroupRole] submit error:', err?.response?.data ?? err)
    }
  }

  const handleEdit = (id: string | number) => openEditForm(id)

  const handleDelete = async (id: string | number) => {
    const ok = await confirmToast('Are you sure you want to delete this role?')
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(String(id))
      toast.success('Role deleted successfully!')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to delete role'
      toast.error(msg)
    }
  }

  const filteredData = roles
    .map((r) => ({
      id: r.roleId,
      name: r.name,
      description: r.description,
      title: r.title,
    }))
    .filter((row) =>
      Object.values(row).some((v) =>
        String(v).toLowerCase().includes(search.toLowerCase()),
      ),
    )

  return (
    <div className="w-full px-2 sm:px-4 py-4">

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b bg-white shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                {editId ? texts.editRole : texts.createRole}
              </h2>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Close"
              >
                <IconField name="FaTimesCircle" size={28} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-4 md:p-8 custom-scrollbar">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">

                {/* Row 1: Role Name + Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

                  {/* Role Name */}
                  <TextField
                    name="roleName"
                    placeholder={texts.Role}
                    label={texts.Role}
                    control={control}
                    required
                  />

                  {/* Title Dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      {texts.Title} <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-all bg-white
                        ${titleError
                          ? 'border-red-500 ring-2 ring-red-300 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        }
                        ${titlesLoading ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                      value={selectedTitle}
                      onChange={(e) => {
                        setSelectedTitle(e.target.value)
                        if (e.target.value) setTitleError(false)
                      }}
                      disabled={titlesLoading}
                    >
                      <option value="">
                        {titlesLoading ? texts.loading_title: texts.Select}
                      </option>
                      {titles.map((title) => (
                        <option key={title} value={title}>
                          {fmt(title)}
                        </option>
                      ))}
                    </select>
                    {titleError && (
                      <p className="text-xs text-red-500 mt-1 ml-1">{texts.TItLE_IS_REQUIRED}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Description */}
                <TextareaField
                  name="description"
                  label={texts.Description}
                  control={control}
                  rows={3}
                  placeholder="Enter a description..."
                  required
                />

                {/* Row 3: CRUD Permissions */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">
                      {texts.CRUD_Permissions}
                    </h3>
                    <Button
                      name={texts.Add}
                      type="button"
                      onClick={addPermissionRow}
                      icon={<IconField name="FaPlus" size={14} />}
                      loading={scopesLoading || opsLoading}
                      isDisable={scopesLoading || opsLoading}
                      showAlways={true}
                    />
                  </div>

                  {(scopesLoading || opsLoading) && (
                    <p className="text-sm text-blue-500 italic text-center py-4">
                      {texts.Loading_scopes_and_operations}…
                    </p>
                  )}

                  <div className="space-y-4 md:space-y-6">
                    {permissions.map((row, index) => {
                      const isProfileRow = index === 0 && row.scope === 'PROFILE'
                      const blocked = usedScopes(index)

                      return (
                        <div
                          key={index}
                          className="p-4 md:p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
                        >
                          {/* Scope Selector Row */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1 w-full">
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">
                                {texts.Select_Scope}
                              </label>
                              <select
                                className={`w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none transition-all ${
                                  isProfileRow
                                    ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                    : 'bg-white focus:ring-2 focus:ring-blue-500'
                                }`}
                                value={row.scope}
                                onChange={(e) => updatePermissionScope(index, e.target.value)}
                                disabled={isProfileRow}
                              >
                                <option value="">-- {texts.Select_Scope} --</option>
                                {scopes.map((scope) => (
                                  <option
                                    key={scope}
                                    value={scope}
                                    disabled={blocked.includes(scope)}
                                  >
                                    {fmt(scope)}
                                    {blocked.includes(scope) ? ' (already added)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Remove Scope Button */}
                            <button
                              type="button"
                              onClick={() => removePermissionRow(index)}
                              className="self-end sm:self-center text-red-500 p-2.5 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all mt-1 sm:mt-5"
                              title={
                                isProfileRow
                                  ? texts.PROFILE_scope_is_required
                                  : texts.Remove_scope
                              }
                            >
                              <IconField name="FaTrash" size={18} />
                            </button>
                          </div>

                          {/* Operations Toggle Row */}
                          {row.scope && (
                            <div className="mt-5 pt-4 border-t border-gray-200">
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3 ml-1">
                                {texts.Operations}
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {operations.map((operation) => {
                                  const isSelected = row.operations.includes(operation)
                                  const isLockedRead = isProfileRow && operation === 'READ'
                                  return (
                                    <div key={operation} className="w-full relative">
                                      <ToggleButton
                                        name={`${operation}-${index}`}
                                        label={fmt(operation)}
                                        value={isSelected}
                                        onChange={() => toggleOperation(index, operation)}
                                      />
                                      {isLockedRead && (
                                        <div
                                          className="absolute inset-0 cursor-not-allowed bg-transparent"
                                          title={texts.READ_is_always_required_for_PROFILE}
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

                    {permissions.length === 0 && !scopesLoading && (
                      <p className="text-sm text-gray-400 italic text-center py-6">
                        No permissions added yet. Click "+ Add" to begin.
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pb-4">
                  <Button
                    name={texts.Cancel}
                    type="button"
                    icon={<IconField name="FaTimes" size={20} />}
                    onClick={handleCloseForm}
                    loading={false}
                    showAlways={true}
                  />
                  <Button
                    name={editId ? texts.Update : texts.Save }
                    type="submit"
                    icon={<IconField name="FaSave" size={20} />}
                    loading={isSubmitting}
                    isDisable={isSubmitting}
                    showAlways={true}
                  />
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      <div className="w-full overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100">
        <ControlledTable
          title={texts.Role_Managenment}
          columns={[
            { key: 'name', label: texts.Role },
            { key: 'description', label: texts.Description },
            { key: 'title', label: texts.Title },
          ]}
          data={filteredData}
          loading={rolesLoading}
          searchTerm={search}
          onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actionColumn={true}
          forceShowActions={true}
          forceShowBtn={true}
          btn={true}
          btnName={texts.Add}
          showForm={openCreateForm}
          showSelectAll={false}
          enablePermissions={true}
          permissionScope="ROLE"
        />
      </div>

    </div>
  )
}

export default SchoolGroupRole
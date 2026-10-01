import { useState, useMemo, useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Dropdown, Button, TextField } from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import {useRoles, useAssignRoleToStaff, useUsers, useFilterUsers, useRoleTitles,} from '../../../hooks/queries/role/useCreateRole'
import { toast } from 'react-toastify'
import type { User } from '../../../services/role/createRoleService'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

interface TableRow {
  id: string | number
  name: string
  email: string
  phone: string
  currentRole: string
}

interface AssignRoleFormInputs {
  roleId: string
  searchInput: string
}

interface ScopePermission {
  scopeId: string
  name: string
  permissions: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
}

const PermissionIndicator = ({ active }: { active: boolean }) => (
  <div className="flex justify-center">
    {active ? (
      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-600">
        <IconField name="FaCheck" size={10} />
      </span>
    ) : (
      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-600">
        <IconField name="FaTimes" size={10} />
      </span>
    )}
  </div>
)

const AssignRole = () => {

   const { t } = useTranslation()
      const Text = getPagesDataText(t)

  const [committedSearch, setCommittedSearch] = useState('')
  const [roleTitleFilter, setRoleTitleFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null)

  const { data: usersData = [], isLoading: usersLoading, refetch: refetchUsers } = useUsers()
  const { data: rolesData = [], isLoading: rolesLoading } = useRoles()
  const { data: roleTitles = [], isLoading: titlesLoading } = useRoleTitles()
  const { mutateAsync: assignRole, isPending: isAssigning } = useAssignRoleToStaff()

  const { control, handleSubmit, reset, setValue, watch } = useForm<AssignRoleFormInputs>({
    defaultValues: { roleId: '', searchInput: '' },
  })

  const searchInput = watch('searchInput')
  const currentRoleId = watch('roleId')

  const hasFilter = !!(committedSearch || roleTitleFilter)

  const {
    data: filteredUsers = [],
    isLoading: filterLoading,
    isFetching: filterFetching,
  } = useFilterUsers({
    search: committedSearch || undefined,
    roleTitle: roleTitleFilter || undefined,
    enabled: hasFilter,
  })

  const activeUsers: User[] = hasFilter ? filteredUsers : usersData

  const nonParentUsers = useMemo(
    () => activeUsers.filter((u: User) => u.roleName?.toLowerCase() !== 'parent'),
    [activeUsers],
  )

  const selectedUser = useMemo(
    () => usersData.find((u: User) => String(u.userId) === String(selectedUserId)),
    [usersData, selectedUserId],
  )

  const permissions = useMemo((): ScopePermission[] => {
    if (!currentRoleId) return []
    const role = rolesData.find((r: any) => String(r.roleId) === String(currentRoleId))
    if (!role?.crudPermissions) return []
    return role.crudPermissions.map((perm: any, index: number) => {
      const ops = (perm.operations || []).map((o: string) => o.toUpperCase())
      return {
        scopeId: `${perm.scope}-${index}`,
        name: perm.scope || 'Unknown Scope',
        permissions: {
          create: ops.includes('CREATE'),
          read: ops.includes('READ'),
          update: ops.includes('UPDATE'),
          delete: ops.includes('DELETE'),
        },
      }
    })
  }, [currentRoleId, rolesData])

  const commitSearch = useCallback(() => setCommittedSearch(searchInput.trim()), [searchInput])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitSearch()
    if (e.key === 'Escape') {
      setValue('searchInput', '')
      setCommittedSearch('')
    }
  }

  const handleClearFilters = () => {
    setValue('searchInput', '')
    setCommittedSearch('')
    setRoleTitleFilter('')
  }

  const roleTitleOptions = useMemo(
    () => [
      { value: '', label: 'All Titles' },
      ...roleTitles.map((t: string) => ({ value: t, label: t })),
    ],
    [roleTitles],
  )

  const roleOptions = useMemo(
    () =>
      rolesData.map((r: any) => ({
        value: String(r.roleId),
        label: r.name || 'Unknown Role',
      })),
    [rolesData],
  )

  const tableData: TableRow[] = useMemo(
    () =>
      nonParentUsers.map((u: User) => ({
        id: u.userId,
        name: u.name ?? '—',
        email: u.email ?? '—',
        phone: u.phoneNumber ?? '—',
        currentRole: u.roleName ?? '—',
      })),
    [nonParentUsers],
  )

  const onSubmit: SubmitHandler<AssignRoleFormInputs> = async (data) => {
    if (!selectedUser || !data.roleId) return

    if (!selectedUser.staffCode) {
      toast.error('Role can only be assigned to staff members, not parents.')
      return
    }

    try {
      await assignRole({ roleId: data.roleId, staffCode: selectedUser.staffCode })
      await refetchUsers()
      const assignedRole = rolesData.find((r: any) => String(r.roleId) === String(data.roleId))
      toast.success(
        `${assignedRole?.name ?? 'Role'} assigned to ${selectedUser.name ?? 'user'} successfully!`,
      )
      handleCloseForm()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign role')
    }
  }

  const handleAssignRole = (rowId: string | number) => {
    const user = usersData.find((u: User) => String(u.userId) === String(rowId))
    if (!user) return
    setSelectedUserId(user.userId)
    setValue('roleId', '')
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedUserId(null)
    reset()
  }

  const isTableLoading = usersLoading || rolesLoading || (hasFilter && filterLoading)

  if (isTableLoading) return <div className="p-4 sm:p-6 md:p-10 text-center">Loading...</div>

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 md:py-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <span className="absolute left-3 top-[34px] -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                <IconField name="FaSearch" size={12} />
              </span>

              <TextField
                name="searchInput"
                label={Text.Search}
                control={control}
                placeholder={Text.Name_Email_Phone_Search || 'Name, email, phone… (Enter to search)'}
                labelClassName="text-xs font-medium text-gray-600"
                inputClassName="pl-8 pr-8 text-sm border-gray-200 rounded-lg
                                focus:ring-blue-500/30 focus:border-blue-400"
                onKeyDown={handleSearchKeyDown}
                onBlur={commitSearch}
              />

              {filterFetching && (
                <span className="absolute right-3 top-[34px] -translate-y-1/2 text-gray-400 animate-spin">
                  <IconField name="FaSpinner" size={12} />
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-52">
            <label className="block text-xs font-medium text-gray-600 mb-1">{Text.Role_Title|| 'Role Title'}</label>
            <select
              value={roleTitleFilter}
              onChange={(e) => setRoleTitleFilter(e.target.value)}
              disabled={titlesLoading}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500/30
                         focus:border-blue-400 transition-colors disabled:opacity-60"
            >
              {roleTitleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasFilter && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500
                         hover:text-red-500 border border-gray-200 rounded-lg
                         hover:border-red-200 transition-colors whitespace-nowrap"
            >
              <IconField name="FaTimes" size={11} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <ControlledTable
            title={Text.Staff_Directory}
            columns={[
              { key: 'name', label: Text.Staff_Name || 'Staff Name' },
              { key: 'email', label: Text.Email || 'Email' },
              { key: 'phone', label: Text.Phone || 'Phone' },
              { key: 'currentRole', label: Text.Current_Role || 'Current Role' },
            ]}
            data={tableData}
            searchTerm=""
            onSearchChange={() => {}}
            onEdit={handleAssignRole}
            btn={false}
            showSelectAll={false}
            enablePermissions={true}
            permissionScope="ROLE"
          />
        </div>
      </div>

      {showForm && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-0 sm:p-4">
          <div
            className="bg-white w-full h-full sm:h-auto sm:w-[95%] sm:max-w-xl
                          md:max-w-2xl lg:max-w-3xl sm:rounded-xl rounded-none shadow-2xl
                          flex flex-col max-h-screen sm:max-h-[90vh]"
          >
            <div className="p-4 sm:p-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="font-bold text-base sm:text-lg md:text-xl text-gray-800">
                {Text.Assign_Role || 'Assign Role'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2"
              >
                <IconField name="FaTimes" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p4 sm:p-6 space-y-4 sm:space-y-6">
              <div
                className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4
                              bg-blue-50/50 rounded-lg border border-blue-100 text-xs sm:text-sm"
              >
                <div className="space-y-0.5">
                  <p className="text-gray-600">{Text.Staff_Name || 'Staff Name'}</p>
                  <p className="font-semibold text-gray-800">{selectedUser.name ?? '—'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-gray-600">{Text.Email || 'Email'}</p>
                  <p className="font-semibold text-gray-800 break-all">
                    {selectedUser.email ?? '—'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-gray-600">{Text.Phone || 'Phone'}</p>
                  <p className="font-semibold text-gray-800">{selectedUser.phoneNumber ?? 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-gray-600">{Text.Current_Role || 'Current Role'}</p>
                  <p className="font-semibold text-gray-800">{selectedUser.roleName ?? 'None'}</p>
                </div>
              </div>

              <Dropdown
                name="roleId"
                label={Text.Assign_Role || 'Assign Role'}
                control={control}
                options={roleOptions}
                required
              />

              {currentRoleId && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-480px text-left text-xs sm:text-sm">
                      <thead className="bg-gray-50 text-[9px] sm:text-[10px] uppercase text-gray-500 border-b font-bold">
                        <tr>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 sticky left-0 bg-gray-50">
                          {Text.Scope || 'Scope'}
                          </th>
                          <th className="text-center px-2 py-2 sm:py-3">{Text.Create || 'Create'}</th>
                          <th className="text-center px-2 py-2 sm:py-3">{Text.Read || 'Read'}</th>
                          <th className="text-center px-2 py-2 sm:py-3">{Text.Update || 'Update'}</th>
                          <th className="text-center px-2 py-2 sm:py-3">{Text.Delete || 'Delete'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {permissions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                              No permissions available for this role
                            </td>
                          </tr>
                        ) : (
                          permissions.map((p) => (
                            <tr key={p.scopeId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium capitalize sticky left-0 bg-white">
                                {p.name.replace(/_/g, ' ')}
                              </td>
                              <td className="py-2 sm:py-3">
                                <PermissionIndicator active={p.permissions.create} />
                              </td>
                              <td className="py-2 sm:py-3">
                                <PermissionIndicator active={p.permissions.read} />
                              </td>
                              <td className="py-2 sm:py-3">
                                <PermissionIndicator active={p.permissions.update} />
                              </td>
                              <td className="py-2 sm:py-3">
                                <PermissionIndicator active={p.permissions.delete} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t flex justify-end gap-3 shrink-0">
              <Button
                name={Text.Cancel || 'Cancel'}
                onClick={handleCloseForm}
                isDisable={isAssigning}
                loading={false}
              />
              <Button
                name={isAssigning ? Text.Assigning : Text.Save}
                onClick={handleSubmit(onSubmit)}
                loading={isAssigning}
                isDisable={isAssigning || !currentRoleId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignRole

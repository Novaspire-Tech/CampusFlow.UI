import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import AdminCardComponent from '../../../components/uncontrolled/AdminCardComponent'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import DropDown from '../../../components/controlled/Dropdown'
import TextField from '../../../components/controlled/TextField'
import { Button } from '../../../components/controlled'
import { IconField } from '../../../components'
import {
  useGetAllStaff,
  useDeleteStaff,
} from '../../../hooks/queries/humanResource/useStaffDirectory'
import type { Staff } from '../../../types/humanResource/Staff'
import { staffService } from '../../../services/hr/staffDirectoryService'
import { useBlobImage } from '../../../hooks/useBlobImage'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import { usePermissions } from '../../../hooks/queries/usePermissions'
import { useRoles } from '../../../hooks/queries/role/useCreateRole'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

interface RoleSearchInputs {
  role: string
}
interface KeywordSearchInputs {
  searchKeyword: string
}

interface StaffCardProps {
  staff: Staff
  onEdit: (staff: Staff) => void
  onView: (staff: Staff) => void
  onDelete: (id: number) => void
  canEdit: boolean
  canView: boolean
  canDelete: boolean
}

const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onEdit,
  onView,
  onDelete,
  canEdit,
  canView,
  canDelete,
}) => {
  const { src: profilePhotoUrl } = useBlobImage(
    () => staffService.getProfilePicture(staff.photo || ''),
    [staff.photo],
  )

  return (
    <AdminCardComponent
      id={staff.staffCode || `STF${staff.staffId || staff.id}`}
      name={`${staff.firstName || ''} ${staff.lastName || ''}`.trim()}
      number={staff.phone || 'N/A'}
      email={staff.email || 'N/A'}
      role={staff.role || 'N/A'}
      department={staff.department?.name || 'N/A'}
      designation={staff.designation?.name || 'N/A'}
      imageUrl={profilePhotoUrl}
      OnEdit={() => onEdit(staff)}
      OnView={() => onView(staff)}
      OnDelete={() => onDelete(Number(staff.staffId || staff.id))}
      canEdit={canEdit}
      canView={canView}
      canDelete={canDelete}
    />
  )
}

interface TableStaffData {
  id: string | number
  staffCode: string
  name: string
  role: string
  department: string
  designation: string
  phone: string
  [key: string]: any
}

const PERMISSION_SCOPE = 'HR'
const PAGE_SIZE = 12

const StaffDirectory: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const { canCreate, canUpdate, canDelete, canRead } = usePermissions()
  const hasCreatePermission = canCreate(PERMISSION_SCOPE)
  const hasUpdatePermission = canUpdate(PERMISSION_SCOPE)
  const hasDeletePermission = canDelete(PERMISSION_SCOPE)
  const hasReadPermission = canRead(PERMISSION_SCOPE)

  const [page, setPage] = useState(0)
  const [activeView, setActiveView] = useState<'card' | 'list'>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [keywordFilter, setKeywordFilter] = useState('')
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
  const [isSearchApplied, setIsSearchApplied] = useState(false)

  const { control, handleSubmit, reset } = useForm<any>()
  const { data: staffData, isLoading, isError, error } = useGetAllStaff()
  const { data: rolesData = [] } = useRoles()
  const roleOptions = useMemo(
    () =>
      rolesData
        .filter((r: any) => r.name !== 'PARENT')
        .map((r: any) => ({
          value: String(r.roleId),
          label: r.name || 'Unknown Role',
        })),
    [rolesData],
  )
  const { mutateAsync: deleteStaff } = useDeleteStaff()

  useEffect(() => {
    if (!staffData || !Array.isArray(staffData)) return
    let result = [...staffData]

    if (isSearchApplied && roleFilter) {
      result = result.filter((s) => s.role?.toLowerCase().includes(roleFilter.toLowerCase()))
    }

    if (isSearchApplied && keywordFilter) {
      const kw = keywordFilter.toLowerCase()
      result = result.filter((s) =>
        [
          s.firstName,
          s.lastName,
          s.email,
          s.phone,
          s.staffCode,
          s.department?.name,
          s.designation?.name,
          `${s.firstName || ''} ${s.lastName || ''}`,
        ].some((v) => v?.toLowerCase().startsWith(kw)),
      )
    }

    if (searchTerm) {
      const st = searchTerm.toLowerCase()
      result = result.filter((s) =>
        [
          s.firstName,
          s.lastName,
          s.email,
          s.phone,
          s.staffCode,
          s.role,
          s.department?.name,
          s.designation?.name,
          `${s.firstName || ''} ${s.lastName || ''}`,
        ].some((v) => v?.toLowerCase().includes(st)),
      )
    }

    setFilteredStaff(result)
  }, [staffData, roleFilter, keywordFilter, isSearchApplied, searchTerm])

  const onRoleSearch: SubmitHandler<RoleSearchInputs> = (data) => {
    setRoleFilter(data.role?.trim() || '')
    setIsSearchApplied(true)
    setPage(0)
  }

  const onKeywordSearch: SubmitHandler<KeywordSearchInputs> = (data) => {
    setKeywordFilter(data.searchKeyword?.trim() || '')
    setIsSearchApplied(true)
    setPage(0)
  }

  const handleClearSearch = () => {
    setRoleFilter('')
    setKeywordFilter('')
    setSearchTerm('')
    setIsSearchApplied(false)
    setPage(0)
    reset({ role: '', searchKeyword: '' })
  }

  const isFilterActive = isSearchApplied && (!!roleFilter || !!keywordFilter)
  const allStaff = staffData || []
  const displayData = isSearchApplied ? filteredStaff : allStaff
  const totalItems = displayData.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const startIndex = page * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const paginatedStaff = displayData.slice(startIndex, endIndex)

  const tableData: TableStaffData[] = displayData.map((staff) => ({
    ...staff,
    id: staff.staffId || staff.id || staff.staffCode,
    name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
    role: staff.role || 'N/A',
    department: staff.department?.name || 'N/A',
    designation: staff.designation?.name || 'N/A',
    phone: staff.phone || 'N/A',
    staffCode: staff.staffCode || 'N/A',
    email: staff.email || 'N/A',
    dateOfBirth: staff.dateOfBirth || '',
    dateOfJoining: staff.dateOfJoining || '',
    gender: staff.gender || '',
  }))

  const handleAdd = () => {
    if (!hasCreatePermission) {
      toast.error("You don't have permission to create staff members")
      return
    }
    navigate('/edit')
  }

  const handleEdit = (staff: Staff) => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to edit staff members")
      return
    }
    navigate(`/edit/${staff.staffCode || staff.staffId || staff.id}`)
  }

  const handleView = (staff: Staff) => {
    if (!hasReadPermission) {
      toast.error("You don't have permission to view staff details")
      return
    }
    navigate(`/staff/view/${staff.staffCode}`)
  }

  const handleDelete = async (id: number) => {
    if (!hasDeletePermission) {
      toast.error("You don't have permission to delete staff members")
      return
    }
    if (!(await confirmToast('Are you sure you want to delete this staff member?'))) return
    try {
      await deleteStaff(String(id))
      toast.success('Staff member deleted successfully.')
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to delete staff member.',
      )
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!hasDeletePermission) {
      toast.error("You don't have permission to delete staff members")
      return
    }
    if (ids.length === 0) {
      toast.error('Please select staff members to delete')
      return
    }
    if (!(await confirmToast(`Are you sure you want to delete ${ids.length} staff member(s)?`)))
      return
    try {
      await Promise.all(ids.map((id) => deleteStaff(String(id))))
      toast.success(`${ids.length} staff member(s) deleted successfully.`)
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete selected staff members.',
      )
    }
  }

  const findStaffById = (id: string | number) =>
    displayData.find((s) => [s.staffId, s.id, s.staffCode].map(String).includes(String(id)))

  const columns = [
    { key: 'staffCode', label: Text.Staff_Code || 'Staff Code' },
    { key: 'name', label: Text.Staff_Name || 'Staff Name' },
    { key: 'role', label: Text.Role || 'Role' },
    { key: 'department', label: Text.Department || 'Department' },
    { key: 'designation', label: Text.Designation || 'Designation' },
    { key: 'phone', label: Text.Mobile_Number || 'Mobile Number' },
  ]

  const EmptyState = ({ isFiltered }: { isFiltered: boolean }) => (
    <div className="text-center py-12">
      <IconField
        name={activeView === 'card' ? 'FaUsersSlash' : 'FaTable'}
        size={48}
        className="text-gray-400 mx-auto mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">
        {isFiltered ? 'No Staff Members Found' : 'No Staff Members Available'}
      </h3>
      <p className="text-gray-500">
        {isFiltered
          ? 'Try adjusting your search criteria.'
          : 'Add new staff members to get started.'}
      </p>
      {isFiltered && (
        <Button
          name="Clear Filters"
          onClick={handleClearSearch}
          icon={<IconField name="FaTimes" />}
          loading={false}
        />
      )}
    </div>
  )

  if (!hasReadPermission) {
    return (
      <div className="m-3 shadow-2xl rounded-2xl h-auto p-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <IconField name="FaExclamationTriangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Access Denied</h3>
          <p className="text-red-600">You don't have permission to view the staff directory.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="m-3 shadow-2xl rounded-2xl h-auto p-3">
      <div className="p-2 flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold">{Text.Select_Criteria}</h2>
        {hasCreatePermission && (
          <Button
            name="Add Staff"
            onClick={handleAdd}
            icon={<IconField name="FaPlus" />}
            loading={false}
            showAlways
          />
        )}
      </div>
      <hr className="my-2" />

      <div className="flex flex-col md:flex-row gap-4 p-3">
        <div className="flex-1">
          <form onSubmit={handleSubmit(onRoleSearch)} className="space-y-2">
            <DropDown
              label={Text.Role}
              name="role"
              control={control}
              required={false}
              options={roleOptions}
            />
            <div className="w-full flex justify-end">
              <Button
                name={Text.Search}
                icon={<IconField name="FaSearch" />}
                loading={false}
                showAlways
              />
            </div>
          </form>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit(onKeywordSearch)} className="space-y-2">
            <TextField
              label={Text.Keyword}
              placeholder={Text.Search_By_Name_or_ID}
              name="searchKeyword"
              control={control}
              required={false}
            />
            <div className="w-full flex justify-end gap-2">
              {isFilterActive && (
                <Button
                  name="Clear"
                  onClick={handleClearSearch}
                  icon={<IconField name="FaTimes" />}
                  loading={false}
                  showAlways
                />
              )}
              <Button
                name={Text.Search}
                icon={<IconField name="FaSearch" />}
                loading={false}
                showAlways
              />
            </div>
          </form>
        </div>
      </div>
      <hr className="my-2" />

      <div className="flex space-x-6 px-3 py-2">
        {(['card', 'list'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`flex items-center space-x-2 p-3 cursor-pointer transition-colors ${
              activeView === v
                ? 'border-b-4 border-amber-400 text-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <IconField name={v === 'card' ? 'FaAddressCard' : 'FaList'} size={20} />
            <span className="font-medium">
              {v === 'card' ? Text.Card_View || 'Card View' : Text.List_View || 'List View'}
            </span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <span className="ml-3">Loading staff data...</span>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-3 my-4">
          <div className="flex items-center text-red-700">
            <IconField name="FaExclamationCircle" className="mr-2" />
            <span>Error loading staff: {error?.message || 'Unknown error'}</span>
          </div>
        </div>
      )}

      {!isLoading && activeView === 'card' && (
        <div className="p-3">
          {paginatedStaff.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedStaff.map((staff) => (
                  <StaffCard
                    key={staff.id || staff.staffId || staff.staffCode}
                    staff={staff}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    canEdit={hasUpdatePermission}
                    canView={hasReadPermission}
                    canDelete={hasDeletePermission}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 mt-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Showing {Math.min(startIndex + 1, totalItems)}–{Math.min(endIndex, totalItems)}{' '}
                    of {totalItems} staff members
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState isFiltered={isFilterActive || !!searchTerm} />
          )}
        </div>
      )}

      {!isLoading && activeView === 'list' && (
        <div className="p-3">
          {tableData.length > 0 ? (
            <ControlledTable<TableStaffData>
              columns={columns}
              data={tableData}
              fullData={tableData}
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              onDeleteMultiple={handleDeleteMultiple}
              onView={(id) => {
                const s = findStaffById(id)
                if (s) handleView(s)
              }}
              onEdit={(id) => {
                const s = findStaffById(id)
                if (s) handleEdit(s)
              }}
              onDelete={(id) => handleDelete(Number(id))}
              actionColumn
              showSelectAll
              header={false}
              showSearch={false}
              showExport
              showPaginationFooter
              enablePermissions
              permissionScope="HR"
              emptyMessage={
                isFilterActive || searchTerm
                  ? 'No staff members found matching your criteria'
                  : 'No staff members available'
              }
              exportFilename="staff_directory"
              exportTitle="Staff Directory Report"
            />
          ) : (
            <EmptyState isFiltered={isFilterActive || !!searchTerm} />
          )}
        </div>
      )}
    </div>
  )
}

export default StaffDirectory

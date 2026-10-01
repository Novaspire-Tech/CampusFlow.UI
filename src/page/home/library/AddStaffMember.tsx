import { useState, useMemo, useEffect, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler, type Control } from 'react-hook-form'
import { Button, Dropdown, TextField } from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useGetAllStaff } from '../../../hooks/queries/humanResource/useStaffDirectory'
import {
  useCreateAddStaffMember,
  useAddStaffMembers,
  useUpdateAddStaffMember,
  useDeleteAddStaffMember,
  useDeleteMultipleAddStaffMember,
} from '../../../hooks/queries/library/useAddStaff'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface SearchFormInputs {
  role?: string
}

interface ModalFormInputs {
  cardNo: string
}

interface StaffMember {
  id: number | string
  addStaffMemberId?: string | number
  cardNo: string
  name: string
  role: string
  email: string
  phone: string
}

const AddStaffMember = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const { control: searchControl, handleSubmit: handleSearchSubmit } = useForm<SearchFormInputs>()

  const {
    control: modalControl,
    handleSubmit: handleModalSubmit,
    reset: resetModalForm,
    setValue: setModalValue,
  } = useForm<ModalFormInputs>()

  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [results, setResults] = useState<StaffMember[]>([])
  const [editStaffId, setEditStaffId] = useState<string | number | null>(null)
  const [editData, setEditData] = useState<Partial<StaffMember>>({})
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tableKey, setTableKey] = useState(0)

  const { data: staffData, isLoading, isError: isStaffError } = useGetAllStaff()
  const {
    data: libraryMembers,
    refetch: refetchMembers,
    isLoading: isLoadingMembers,
  } = useAddStaffMembers()
  const { mutateAsync: createStaffMember, isPending: isCreating } = useCreateAddStaffMember()
  const { mutateAsync: updateStaffMember, isPending: isUpdating } = useUpdateAddStaffMember()
  const { mutateAsync: deleteStaffMember } = useDeleteAddStaffMember()
  const { mutateAsync: deleteMultipleStaffMember } = useDeleteMultipleAddStaffMember()

  const roleOptions = useMemo(() => {
    if (!staffData || !Array.isArray(staffData)) return []
    const roles = new Set(
      staffData.map((s: any) => s.role).filter((role): role is string => Boolean(role)),
    )
    return Array.from(roles)
  }, [staffData])

  useEffect(() => {
    if (!staffData || !Array.isArray(staffData)) return

    const libraryCardMap = new Map<string, any>()
    if (Array.isArray(libraryMembers)) {
      libraryMembers.forEach((member: any) => {
        if (member.staffId) {
          libraryCardMap.set(String(member.staffId), member)
        }
      })
    }

    const mapped: StaffMember[] = staffData.map((s: any) => {
      const member = libraryCardMap.get(String(s.id || s.staffId))
      return {
        id: s.id || s.staffId,
        addStaffMemberId: member?.addStaffMemberId,
        cardNo: member?.libraryCardNo || '',
        name: s.firstName + ' ' + s.lastName || '',
        role: s.role || '',
        email: s.email || '',
        phone: s.phoneNumber || s.phone || '',
      }
    })

    setStaffList(mapped)

    if (results.length > 0) {
      setResults((prevResults) =>
        prevResults.map((r) => {
          const updated = mapped.find((m) => String(m.id) === String(r.id))
          return updated || r
        }),
      )
    }
  }, [staffData, libraryMembers])

  const onSearchSubmit: SubmitHandler<SearchFormInputs> = (data) => {
    const filtered = staffList.filter((s) => !data.role || s.role === data.role)
    setResults(filtered)

    if (filtered.length === 0) {
      toast.info('No staff members found for the selected criteria')
    } else {
      toast.success(`Found ${filtered.length} staff member${filtered.length !== 1 ? 's' : ''}`)
    }
  }

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results
    const term = searchTerm.toLowerCase()
    return results.filter((s) =>
      [s.name, s.role, s.email, s.phone, s.cardNo].some(
        (v) => v && v.toLowerCase().includes(term),
      ),
    )
  }, [results, searchTerm])

  const handleEdit = (id: string | number) => {
    const staff = staffList.find((s) => String(s.id) === String(id))
    if (!staff) {
      toast.error('Staff member not found')
      return
    }
    setEditStaffId(id)
    setEditData(staff)
    setModalValue('cardNo', staff.cardNo || '')
    setShowForm(true)
  }

  const handleUpdate: SubmitHandler<ModalFormInputs> = async (formData) => {
    if (!editStaffId || !formData.cardNo) {
      toast.error('Please enter a valid library card number')
      return
    }

    const existingCard = staffList.find(
      (s) =>
        String(s.cardNo) === String(formData.cardNo) &&
        String(s.id) !== String(editStaffId),
    )

    if (existingCard) {
      toast.error(`Library card number ${formData.cardNo} already exists`)
      return
    }

    try {
      if (editData.cardNo && editData.addStaffMemberId) {
        await updateStaffMember({
          id: editData.addStaffMemberId,
          data: {
            staffId: Number(editStaffId),
            libraryCardNo: String(formData.cardNo),
            firstName: undefined,
            staffName: undefined
          },
        })
        toast.success(`Library card updated for ${editData.name || 'Staff member'} successfully!`)
      } else {
        await createStaffMember({
          staffId: Number(editStaffId),
          libraryCardNo: String(formData.cardNo),
          firstName: undefined,
          staffName: undefined
        })
        toast.success(`Library card added for ${editData.name || 'Staff member'} successfully!`)
      }

      await refetchMembers()
      handleCloseModal()
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowForm(false)
    setEditStaffId(null)
    setEditData({})
    resetModalForm()
  }

  const handleDelete = async (id: string | number) => {
    const staff = staffList.find((s) => String(s.id) === String(id))

    if (!staff?.addStaffMemberId) {
      toast.warning("This staff member doesn't have a library card to delete")
      return
    }

    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return

    try {
      await deleteStaffMember(staff.addStaffMemberId)
      await refetchMembers()
      toast.success(`Library card deleted for ${staff.name} successfully!`)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete library card.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const memberIds = staffList
      .filter((s) => ids.map(String).includes(String(s.id)) && s.addStaffMemberId)
      .map((s) => s.addStaffMemberId as string | number)

    if (!memberIds.length) {
      toast.warning("Selected staff members don't have library cards to delete")
      return
    }

    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return

    try {
      await deleteMultipleStaffMember(memberIds as number[])
      await refetchMembers()
      toast.success(
        `${memberIds.length} library card${memberIds.length !== 1 ? 's' : ''} deleted successfully!`,
      )
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete library cards.')
    } finally {
      setTableKey((prev) => prev + 1)
    }
  }

  const columns = [
    { label: Text.Library_Card_No, key: 'cardNo' },
    { label: Text.Staff_Name, key: 'name' },
    { label: Text.Role, key: 'role' },
    { label: Text.Email, key: 'email' },
    { label: Text.Phone, key: 'phone' },
  ]

  if (isLoading || isLoadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading staff library data...</p>
        </div>
      </div>
    )
  }

  if (isStaffError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading staff data</p>
          <Button name="Retry" onClick={() => window.location.reload()} loading={false} />
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      <div className="p-4 bg-gray-100 border-b mb-2">
        <h2 className="text-lg font-medium">{Text.Select_Criteria}</h2>
      </div>

      <AllSchoolDropdown onSubmit={handleSearchSubmit(onSearchSubmit)} queryKeys={['staff']}>
        <div className="p-4 grid sm:grid-cols-2 gap-4">
          <Dropdown
            label={Text.Role}
            name="role"
            control={searchControl as Control<SearchFormInputs>}
            options={roleOptions}
          />
        </div>
        <div className="p-4 flex justify-end gap-2">
          <Button name={Text.Search} icon={<IconField name="FaSearch" />} loading={false} showAlways={true} />
        </div>
      </AllSchoolDropdown>

      {results.length > 0 && (
        <div className="mt-4 p-4 rounded bg-white shadow-sm">
          <ControlledTable
            key={tableKey}
            columns={columns}
            data={filteredResults}
            searchTerm={searchTerm}
            onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onAdd={handleEdit}
            forceShowActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            title={Text.Staff_Member_List}
            btn={false}
            enablePermissions={true}
            permissionScope="LIBRARY"
          />
        </div>
      )}

      {results.length === 0 && staffList.length > 0 && (
        <div className="mt-4 p-8 rounded bg-white shadow-sm text-center">
          <p className="text-gray-500">
            No results found. Please select criteria and click Search.
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                {editData.cardNo ? Text.Edit_Library_Card : Text.Add_Library_Card}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-blue-50 border border-blue-100 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">{Text.Staff_Name}:</span> {editData.name}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-bold">{Text.Role}:</span> {editData.role}
                </p>
                <p className="text-xs text-blue-600 mt-1 italic">ID: {editData.id}</p>
              </div>
              <AllSchoolDropdown onSubmit={handleModalSubmit(handleUpdate)}>
                <TextField
                  name="cardNo"
                  label={Text.Library_Card_No}
                  control={modalControl as unknown as Control<any>}
                  required
                />
                <div className="flex justify-end gap-3 mt-6">
                  <Button name={Text.Cancel} onClick={handleCloseModal} loading={false} showAlways={true} />
                  <Button
                    name={editData.cardNo ? Text.Update : Text.Save}
                    icon={<IconField name="FaSave" />}
                    loading={isCreating || isUpdating}
                    permissionScope="LIBRARY"
                    permissionType={editData.cardNo ? 'UPDATE' : 'CREATE'}
                    enablePermissions={true}
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddStaffMember
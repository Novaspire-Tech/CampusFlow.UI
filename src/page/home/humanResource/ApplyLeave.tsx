import React, { useState, useEffect } from 'react'
import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Dropdown from '../../../components/controlled/Dropdown'
import NumberField from '../../../components/controlled/NumberField'
import TextField from '../../../components/controlled/TextField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import {
  useStaffLeaves,
  useFilterStaffLeaves,
  useCreateStaffLeave,
  useDeleteStaffLeave,
  useLeaveBalance,
} from '../../../hooks/queries/humanResource/useStaffLeave'
import { useGetAllStaff } from '../../../hooks/queries/humanResource/useStaffDirectory'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import type { FilterStaffLeaveDTO } from '../../../services/hr/staffLeaveService'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { FutureDateField } from '../../../components/controlled'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

interface LeaveForm extends FieldValues {
  staffId: string
  staffAssignedLeaveId: string
  leaveType: string
  leaveFromDate: string
  leaveToDate: string
  leaveDays: string
  reason: string
}

interface FilterForm {
  filterSearch: string
}

const ApplyLeave: React.FC = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [activeFilters, setActiveFilters] = useState<FilterStaffLeaveDTO>({})
  const [isFiltering, setIsFiltering] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<number>(0)
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  const { control, register, handleSubmit, reset, setValue, watch } = useForm<LeaveForm>({
    defaultValues: {
      staffId: '',
      staffAssignedLeaveId: '',
      leaveType: '',
      leaveFromDate: '',
      leaveToDate: '',
      leaveDays: '',
      reason: '',
    },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FilterForm>({ defaultValues: { filterSearch: '' } })

  const leaveFromDate = watch('leaveFromDate')
  const leaveToDate = watch('leaveToDate')
  const staffId = watch('staffId')
  const leaveType = watch('leaveType')

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: allData, isLoading: allLoading, isFetching: allFetching } =
    useStaffLeaves({ page, size: pageSize, sortDirection: 'asc' })

  const { data: filteredData, isLoading: filterLoading, isFetching: filterFetching } =
    useFilterStaffLeaves(activeFilters, { page, size: pageSize, sortDirection: 'asc' }, isFiltering)

  const { data: staffData } = useGetAllStaff()
  const { data: leaveBalance } = useLeaveBalance(selectedStaffId, selectedLeaveType)

  const response   = isFiltering ? filteredData : allData
  const leaves     = response?.leaves     ?? []
  const totalItems = response?.totalItems ?? 0
  const totalPages = response?.totalPages ?? 0
  const isLoading  = isFiltering ? filterLoading  : allLoading
  const isFetching = isFiltering ? filterFetching : allFetching

  // ─── Mutations ────────────────────────────────────────────────────────────

  const { mutateAsync: createStaffLeave, isPending: isCreating } = useCreateStaffLeave()
  const { mutateAsync: deleteStaffLeave } = useDeleteStaffLeave()

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!staffId || !staffData) return
    const selectedStaff = staffData.find((s: any) => Number(s.id) === Number(staffId))
    const assignedId = selectedStaff?.staffAssignedLeave?.staffAssignedLeaveId
    setValue('staffAssignedLeaveId', assignedId ? String(assignedId) : '', {
      shouldValidate: true,
      shouldDirty: true,
    })
    setSelectedStaffId(assignedId ? Number(staffId) : 0)
  }, [staffId, staffData, setValue])

  useEffect(() => {
    if (leaveType) setSelectedLeaveType(leaveType)
  }, [leaveType])

  useEffect(() => {
    if (!leaveFromDate || !leaveToDate) return
    const from = new Date(leaveFromDate)
    const to = new Date(leaveToDate)
    if (to >= from) {
      const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
      setValue('leaveDays', String(diffDays))
    }
  }, [leaveFromDate, leaveToDate, setValue])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCloseForm = () => {
    setShowForm(false)
    reset()
    setSelectedStaffId(0)
    setSelectedLeaveType('')
  }

  const onSubmit: SubmitHandler<LeaveForm> = async (data) => {
    if (!data.staffAssignedLeaveId) {
      toast.error('No leave balance found for this staff. Please ensure a leave assignment exists.')
      return
    }
    try {
      await createStaffLeave({
        staffId: Number(data.staffId),
        staffAssignedLeaveId: Number(data.staffAssignedLeaveId),
        leaveType: data.leaveType as 'SICK' | 'CASUAL' | 'MATERNITY' | 'ANNUAL',
        leaveFromDate: data.leaveFromDate,
        leaveToDate: data.leaveToDate,
        leaveDays: Number(data.leaveDays),
        reason: data.reason || '',
      })
      toast.success('Leave application submitted successfully!')
      handleCloseForm()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to apply for leave. Please try again.',
      )
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!(await confirmToast('Do you want to delete this leave request?'))) return
    try {
      await deleteStaffLeave(Number(id))
      toast.success('Leave request deleted successfully!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete leave request.')
    }
  }

  const handleApplyFilters: SubmitHandler<FilterForm> = (data) => {
    const filters: FilterStaffLeaveDTO = {}
    if (data.filterSearch?.trim()) filters.search = data.filterSearch.trim()
    setActiveFilters(filters)
    setIsFiltering(true)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterSearch: '' })
    setActiveFilters({})
    setIsFiltering(false)
    setPage(0)
  }

  // ─── Derived data ─────────────────────────────────────────────────────────

  const staffOptions = Array.isArray(staffData)
    ? staffData.map((s: any) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName} (${s.staffCode})`,
      }))
    : []
const { t } = useTranslation()
      const T = getPagesDataText(t)
  const leaveTypeOptions = [
    { value: 'SICK',      label: T.Sick_Leaves },
    { value: 'CASUAL',    label: T.Casual_Leaves },
    { value: 'MATERNITY', label: T.Maternity_Leaves },
    { value: 'ANNUAL',    label: T.Annual_Leaves },
  ]

  const columns = [
    { key: 'staffName',     label: T.Staff_Name},
    {
      key: 'leaveType',
      label: T.Leave_Type,
      render: (value: string) => value.charAt(0) + value.slice(1).toLowerCase(),
    },
    { key: 'leaveFromDate', label: T.From_Date },
    { key: 'leaveToDate',   label: T.To_Date },
    { key: 'leaveDays',     label: T.Days },
    { key: 'reason',        label: T.Reason },
    {
      key: 'status',
      label: T.Status,
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'APPROVED'
              ? 'bg-green-100 text-green-800'
              : value === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value.charAt(0) + value.slice(1).toLowerCase()}
        </span>
      ),
    },
  ]
  

  const tableData = leaves.map((item) => ({
    id:            item.staffLeaveId?.toString() ?? item.id,
    staffName:     item.staffName     || 'Unknown Staff',
    leaveType:     item.leaveType,
    leaveFromDate: item.leaveFromDate,
    leaveToDate:   item.leaveToDate,
    leaveDays:     item.leaveDays,
    reason:        item.reason        || 'N/A',
    status:        item.status,
  }))

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full px-4 py-4">

      {/* ── Add Modal ────────────────────────────────────────────────────── */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer z-10"
                onClick={handleCloseForm}
                type="button"
                disabled={isCreating}
              >
                <IconField name="FaTimes" size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                <IconField name="FaPaperPlane" className="inline mr-2" />
                {T.Apply_For_Leave}
              </h2>

              <AllSchoolDropdown
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                queryKeys={['staffLeaves', 'staff']}
              >
                <input type="hidden" {...register('staffAssignedLeaveId', { required: true })} />

                <Dropdown
                  label={T.Select_Staff}
                  name="staffId"
                  control={control}
                  required
                  options={staffOptions}
                />

                <Dropdown
                  label={T.Leave_Type}
                  name="leaveType"
                  control={control}
                  required
                  options={leaveTypeOptions}
                />

                {leaveBalance && selectedStaffId > 0 && selectedLeaveType && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>{T.Available}:</strong> {leaveBalance.remainingBalance} days
                    </p>
                  </div>
                )}

                <FutureDateField name="leaveFromDate" label={T.From_Date} control={control} required />
                <FutureDateField name="leaveToDate"   label={T.To_Date}   control={control} required />

                <NumberField name="leaveDays" label={T.Leave_Days} control={control} required disabled />

                <TextField
                  name="reason"
                  label={T.Reason}
                  placeholder={T.Enter_Reason}
                  control={control}
                />

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button
                    name={T.Cancel}
                    icon={<IconField name="FaTimes" size={16} />}
                    onClick={handleCloseForm}
                    loading={false}
                    type="button"
                  />
                  <Button
                    type="submit"
                    name={T.Apply}
                    onClick={handleSubmit(onSubmit)}
                    icon={<IconField name="FaPaperPlane" size={16} />}
                    loading={isCreating}
                    permissionScope="APPLY_LEAVE"
                    permissionType="CREATE"
                    enablePermissions
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </>
      )}

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{T.Apply_For_Leave}</h1>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <TextField
              label={T.Search}
              name="filterSearch"
              control={filterControl}
              placeholder={T.Search_By_Staff_Name_Or_Status}
            />
          </section>
          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={T.Clear_Filters}
              loading={false}
              icon={<IconField name="FaTimes" />}
              type="button"
              showAlways
            />
            <Button
              name={T.Search}
              loading={isFetching && !isLoading}
              icon={<IconField name="FaSearch" />}
              type="submit"
              showAlways
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">{T.Loading}…</span>
            </div>
          )}

          <ControlledTable
            title={T.Leave_Requests}
            columns={columns}
            data={isLoading ? [] : tableData}
            fullData={tableData}
            showSearch={false}
            onDelete={handleDelete}
            showForm={() => setShowForm(true)}
            btn
            btnName={T.Apply_For_Leave}
            actionColumn
            showSelectAll
            enablePermissions
            permissionScope="APPLY_LEAVE"
            emptyMessage={T.No_Leave_Requests_Found}
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={setPage}
            onServerPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setPage(0)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ApplyLeave
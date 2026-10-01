import React, { useEffect, useMemo, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Dropdown from '../../../components/controlled/Dropdown'
import { Button } from '../../../components/controlled'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useAssignVehicles,
  useCreateAssignVehicle,
  useUpdateAssignVehicle,
  useDeleteAssignVehicle,
  useDeleteMultipleAssignVehicles,
} from '../../../hooks/queries/transport/useAssignVehicles'
import { useRoutes } from '../../../hooks/queries/transport/useRoutes'
import { useVehicles } from '../../../hooks/queries/transport/useVehicles'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface AssignVehicleForm {
  routeId: string
  vehicleId: string
}

interface TableRow {
  id: string
  routeId: string
  routeName: string
  vehicleId: string
  vehicleName: string
}

const AssignVehicle: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const { data: routes = [] } = useRoutes()
  const { data: vehicles = [] } = useVehicles()
  const { data: assignments = [], isLoading, refetch } = useAssignVehicles()

  const { mutateAsync: addAssignVehicle, isPending: isAdding } = useCreateAssignVehicle()
  const { mutateAsync: updateAssignVehicle, isPending: isUpdating } = useUpdateAssignVehicle()
  const { mutateAsync: deleteAssignVehicle } = useDeleteAssignVehicle()
  const { mutateAsync: deleteMultipleAssignVehicle } = useDeleteMultipleAssignVehicles()

  const { control, handleSubmit, reset, setValue } = useForm<AssignVehicleForm>({
    defaultValues: { routeId: '', vehicleId: '' },
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tableData, setTableData] = useState<TableRow[]>([])

  const isSubmitting = isAdding || isUpdating

  const routeMap = useMemo(() => {
    const map: Record<string, string> = {}
    routes.forEach((r: any) => {
      const id = String(r.id ?? r.routeId)
      map[id] = r.routeName || r.name || r.routeTitle || ''
    })
    return map
  }, [routes])

  const vehicleMap = useMemo(() => {
    const map: Record<string, string> = {}
    vehicles.forEach((v: any) => {
      const id = String(v.id ?? v.vehicleId)
      map[id] = v.vehicleNumber || v.vehicleName || v.name || ''
    })
    return map
  }, [vehicles])

  useEffect(() => {
    if (!assignments.length) {
      setTableData([])
      return
    }
    const formatted: TableRow[] = assignments.map((item: any) => {
      const routeId = String(item.routeId)
      const vehicleId = String(item.vehicle?.vehicleId ?? item.vehicleId ?? item.vehicle?.id)
      return {
        id: String(item.id ?? item.assignVehiclesId),
        routeId,
        routeName: routeMap[routeId] || '',
        vehicleId,
        vehicleName:
          vehicleMap[vehicleId] || item.vehicle?.vehicleNumber || item.vehicle?.vehicleName || '',
      }
    })
    setTableData(formatted)
  }, [assignments, routeMap, vehicleMap])

  const onSubmit: SubmitHandler<AssignVehicleForm> = async (data) => {
    try {
      const payload = {
        routeId: String(data.routeId),
        vehicleId: String(data.vehicleId),
      }
      if (editingId) {
        await updateAssignVehicle({ id: editingId, data: payload })
        toast.success('Vehicle assignment updated successfully!')
      } else {
        await addAssignVehicle(payload)
        toast.success('Vehicle assigned successfully!')
      }
      reset()
      setEditingId(null)
      refetch()
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.response?.data?.message || 'Operation failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
  }

  const handleEdit = (id: string | number) => {
    const row = tableData.find((r) => r.id === String(id))
    if (!row) return
    setValue('routeId', row.routeId)
    setValue('vehicleId', row.vehicleId)
    setEditingId(String(id))
  }

  const handleDelete = async (id: string | number) => {
    if (
      await confirmToast(
        Text?.Do_you_want_to_delete_this_entry || 'Do you want to delete this entry?',
      )
    ) {
      try {
        await deleteAssignVehicle(String(id))
        toast.success('Vehicle assignment deleted successfully!')
        if (editingId === String(id)) handleCancel()
        refetch()
      } catch (error: any) {
        toast.error(
          error?.message || error?.response?.data?.message || 'Failed to delete assignment.',
        )
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (await confirmToast(`Delete ${ids.length} selected assignment(s)?`)) {
      try {
        await deleteMultipleAssignVehicle(ids.map(String))
        toast.success('Selected assignments deleted successfully!')
        if (editingId !== null && ids.map(String).includes(editingId)) handleCancel()
        refetch()
      } catch (error: any) {
        toast.error(
          error?.message ||
            error?.response?.data?.message ||
            'Failed to delete multiple assignments.',
        )
      }
    }
  }

  const filteredData = tableData.filter((row) =>
    `${row.routeName} ${row.vehicleName}`.toLowerCase().includes(search.toLowerCase()),
  )

  const columns = [
    { key: 'routeName', label: Text?.Route || 'Route' },
    { key: 'vehicleName', label: Text?.Vehicle || 'Vehicle' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch p-4 space-y-4 lg:space-y-0 w-full">
      {/* LEFT — Always visible form */}
      <div className="w-full lg:w-1/3 p-4 bg-white rounded-md shadow-2xl mt-4 self-stretch">
        <h1 className="mb-4 text-black text-xl font-medium capitalize">
          {editingId ? 'Edit Assignment' : Text?.Assign_Vehicle || 'Assign Vehicle'}
        </h1>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} queryKeys={['vehicles', 'routes']}>
          <Dropdown
            name="routeId"
            label={Text?.Route || 'Route'}
            required
            control={control}
            options={routes.map((r: any) => ({
              value: String(r.id ?? r.routeId),
              label: r.routeName || r.name || r.routeTitle || 'Unknown Route',
            }))}
          />

          <Dropdown
            name="vehicleId"
            label={Text?.Vehicle || 'Vehicle'}
            required
            control={control}
            options={vehicles.map((v: any) => ({
              value: String(v.id ?? v.vehicleId),
              label: v.vehicleNumber || v.vehicleName || v.name || 'Unknown Vehicle',
            }))}
          />

          <div className="flex items-center justify-end gap-2 mt-4">
            {editingId !== null && (
              <Button
                name={Text?.Cancel || 'Cancel'}
                loading={false}
                icon={<IconField name="FaTimes" size={16} />}
                onClick={handleCancel}
                type="button"
              />
            )}
            <Button
              name={editingId ? Text?.Update || 'Update' : Text?.Save || 'Save'}
              icon={<IconField name="FaSave" size={16} />}
              loading={isSubmitting}
              permissionScope="TRANSPORT"
              permissionType={editingId ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
            />
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="p-2 w-full lg:w-2/3">
        <ControlledTable
          columns={columns}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          title={Text?.Assigned_Vehicles_Routes || 'Assigned Vehicles to Routes'}
          actionColumn
          showSelectAll
          enablePermissions={true}
          permissionScope="TRANSPORT"
        />
      </div>
    </div>
  )
}

export default AssignVehicle

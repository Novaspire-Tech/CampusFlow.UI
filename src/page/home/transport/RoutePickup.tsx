import React, { useEffect, useMemo, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import NumberField from '../../../components/controlled/NumberField'
import Dropdown from '../../../components/controlled/Dropdown'
import TimeField from '../../../components/controlled/TimeField'
import { IconField } from '../../../components'
import { AmountField, Button, TextField } from '../../../components/controlled'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useRoutePickupPoints,
  useAddRoutePickupPoint,
  useUpdateRoutePickupPoint,
  useDeleteRoutePickupPoint,
  useDeleteMultipleRoutePickupPoints,
  useFilterRoutePickupPoints,
} from '../../../hooks/queries/transport/useRoutePickupPoints'
import { useRoutes } from '../../../hooks/queries/transport/useRoutes'
import { usePickupPoints } from '../../../hooks/queries/transport/usePickupPoints'
import type { RoutePickupPoint as IRoutePickupPoint } from '../../../types/transport/routePickupPoint'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import type { FilterRoutePickupPointDto } from '../../../services/transport/routePickupPointService'
import { useAssignVehicles } from '../../../hooks/queries/transport/useAssignVehicles'
import { useVehicles } from '../../../hooks/queries/transport/useVehicles'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface RoutePickupForm {
  routeId: string
  vehicleId: string
  pickupPointId: string
  dropOffTime: string
  totalFees: string
  distance: string
  pickupTime: string
}

interface FilterForm {
  filterSearch: string
}

const RoutePickup: React.FC = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [activeFilters, setActiveFilters] = useState<FilterRoutePickupPointDto>({})
  const [isFiltering, setIsFiltering] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { control, handleSubmit, reset, setValue, watch } = useForm<RoutePickupForm>({
    defaultValues: {
      routeId: '',
      pickupPointId: '',
      vehicleId: '',
      totalFees: '',
      distance: '',
      pickupTime: '',
      dropOffTime: '',
    },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FilterForm>({
    defaultValues: { filterSearch: '' },
  })

  const {
    data: allData,
    isLoading: allLoading,
    isFetching: allFetching,
  } = useRoutePickupPoints(page, pageSize, 'asc')

  const {
    data: filteredData,
    isLoading: filterLoading,
    isFetching: filterFetching,
  } = useFilterRoutePickupPoints(activeFilters, page, pageSize, 'asc', isFiltering)

  const { data: routesData } = useRoutes()
  const { data: pickupPointsData } = usePickupPoints()

  const response = isFiltering ? filteredData : allData
  const routePickupPoints = response?.routePickupPoints ?? []
  const totalItems = response?.totalItems ?? 0
  const totalPages = response?.totalPages ?? 0
  const routes = routesData ?? []
  const pickupPoints = pickupPointsData ?? []
  const isLoading = isFiltering ? filterLoading : allLoading
  const isFetching = isFiltering ? filterFetching : allFetching

  const { mutateAsync: addRoutePickupPoint, isPending: isAdding } = useAddRoutePickupPoint()
  const { mutateAsync: updateRoutePickupPoint, isPending: isUpdating } = useUpdateRoutePickupPoint()
  const { mutateAsync: deleteRoutePickupPoint } = useDeleteRoutePickupPoint()
  const { mutateAsync: deleteMultipleRoutePickupPoints } = useDeleteMultipleRoutePickupPoints()
  const { data: assignVehiclesData } = useAssignVehicles()
  const { data: allVehicles } = useVehicles()

  const isSubmitting = isAdding || isUpdating

  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const columns = [
    { key: 'route', label: Text?.Route || 'Route' },
    { key: 'pickupPoint', label: Text?.Pickup_Point_Name || 'Pickup Point' },
    { key: 'totalFees', label: 'Total Fees' },
    { key: 'distance', label: Text?.Distance || 'Distance (km)' },
    { key: 'pickupTime', label: Text?.Pickup_Time || 'Pickup Time' },
    { key: 'dropOffTime', label: 'Drop Off Time' },
  ]

  const tableData = routePickupPoints.map((item: IRoutePickupPoint) => ({
    id: item.id,
    route: item.routeName,
    pickupPoint: item.pickUpPoint,
    totalFees: item.totalFees,
    distance: item.distance,
    pickupTime: item.pickupTime,
    dropOffTime: item.dropOffTime,
  }))

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    reset()
  }

  const watchedRouteId = watch('routeId')

  useEffect(() => {
    setValue('vehicleId', '')
  }, [watchedRouteId, setValue])

  const filteredVehicles = useMemo(() => {
    if (!watchedRouteId || !assignVehiclesData) return []

    return assignVehiclesData
      .filter((av: any) => String(av.routes?.routeId ?? av.routeId ?? '') === watchedRouteId)
      .map((av: any) => {
        const vId = String(av.assignVehiclesId || av.vehicle?.id || '')
        const label =
          av.vehicles?.vehicleNumber ??
          allVehicles?.find((v: any) => String(v.vehiclesId ?? v.id) === vId)?.vehicleNumber ??
          vId

        return { label, value: vId }
      })
      .filter((opt) => opt.value !== '')
  }, [watchedRouteId, assignVehiclesData, allVehicles])

  const onSubmit: SubmitHandler<RoutePickupForm> = async (data) => {
    try {
      if (editingId !== null) {
        await updateRoutePickupPoint({ id: editingId, data })
        toast.success('Route pickup point updated successfully!')
      } else {
        await addRoutePickupPoint(data)
        toast.success('Route pickup point added successfully!')
      }
      handleCloseForm()
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Operation failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleEdit = (id: string | number) => {
    const stringId = id.toString()
    const item = routePickupPoints.find((rpp: IRoutePickupPoint) => rpp.id === stringId)
    if (item) {
      setValue('routeId', item.routeId)
      setValue('pickupPointId', item.pickupPointId)
      setValue('vehicleId', item.vehicleId)
      setValue('totalFees', item.totalFees)
      setValue('distance', item.distance)
      setValue('pickupTime', item.pickupTime)
      setValue('dropOffTime', item.dropOffTime)
      setEditingId(stringId)
      setShowForm(true)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!(await confirmToast('Do you want to delete this entry?'))) return
    try {
      await deleteRoutePickupPoint(id.toString())
      toast.success('Route pickup point deleted successfully!')
      if (editingId === id.toString()) handleCloseForm()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to delete route pickup point.',
      )
    }
  }

  const handleDeleteAll = async (ids: (string | number)[]) => {
    if (!(await confirmToast(`Delete ${ids.length} selected route pickup point(s)?`))) return
    try {
      const stringIds = ids.map((id) => id.toString())
      await deleteMultipleRoutePickupPoints(stringIds)
      toast.success('Selected route pickup points deleted successfully!')
      if (editingId !== null && stringIds.includes(editingId)) handleCloseForm()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to delete route pickup points.',
      )
    }
  }

  const handleApplyFilters: SubmitHandler<FilterForm> = (data) => {
    const filters: FilterRoutePickupPointDto = {}
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

  return (
    <div className="w-full px-4 py-4">
      {/* Add / Edit Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer z-10"
                onClick={handleCloseForm}
                type="button"
                disabled={isSubmitting}
              >
                <IconField name="FaTimes" size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                <IconField name={editingId ? 'FaEdit' : 'FaPlus'} className="inline mr-2" />
                {editingId
                  ? Text?.Edit_Pickup_Point || 'Edit Pickup Point'
                  : Text?.Add_Pickup_Point || 'Add Pickup Point'}
              </h2>

              <AllSchoolDropdown
                onSubmit={handleSubmit(onSubmit)}
                queryKeys={['routes', 'pickupPoints', 'assignVehicles', 'vehicles']}
              >
                <Dropdown
                  name="routeId"
                  required
                  label={Text?.Route || 'Route'}
                  control={control}
                  options={routes.map((route: any) => ({
                    value: String(route.id ?? route.routeId ?? ''),
                    label: route.name ?? route.routeTitle ?? 'Unknown Route',
                  }))}
                />
                <Dropdown
                  name="pickupPointId"
                  required
                  label={Text?.Pickup_Point_Name || 'Pickup Point'}
                  control={control}
                  options={pickupPoints.map((point: any) => ({
                    value: String(point.id ?? point.pickUpPointId ?? ''),
                    label: point.name ?? point.pickUpPointName ?? 'Unknown Point',
                  }))}
                />
                <NumberField
                  name="totalFees"
                  required
                  label="Total Fees"
                  control={control}
                  placeholder="Enter total fees"
                  min={0}
                  step="0.01"
                />
                <AmountField
                  name="distance"
                  label={Text?.Distance || 'Distance (km)'}
                  control={control}
                  placeholder="Enter distance"
                  min={0}
                  step="0.01"
                />
                <TimeField
                  name="pickupTime"
                  required
                  label={Text?.Pickup_Time || 'Pickup Time'}
                  control={control}
                />
                <TimeField name="dropOffTime" required label="Drop Off Time" control={control} />
                <div className="col-span-2">
                  <Dropdown
                    label="Vehicle"
                    name="vehicleId"
                    control={control}
                    options={
                      !watchedRouteId
                        ? [{ label: 'Select a route first', value: '' }]
                        : filteredVehicles.length === 0
                          ? [{ label: 'No vehicles assigned to this route', value: '' }]
                          : filteredVehicles
                    }
                  />
                </div>

                <div className="col-span-2 flex justify-end gap-3 pt-2 border-t mt-2">
                  <Button
                    name={Text?.Cancel || 'Cancel'}
                    icon={<IconField name="FaTimes" size={16} />}
                    onClick={handleCloseForm}
                    loading={false}
                    type="button"
                  />
                  <Button
                    type="submit"
                    name={editingId ? Text?.Update || 'Update' : Text?.Save || 'Save'}
                    onClick={handleSubmit(onSubmit)}
                    icon={<IconField name="FaSave" size={16} />}
                    loading={isSubmitting}
                    permissionScope="TRANSPORT"
                    permissionType={editingId ? 'UPDATE' : 'CREATE'}
                    enablePermissions
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {Text?.Route_Pickup_Point || 'Route Pickup Points'}
          </h1>
        </div>

        {/* Filter form */}
        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <TextField
              label={Text?.Search || 'Search'}
              name="filterSearch"
              control={filterControl}
              placeholder="Search route or pickup point..."
            />
          </section>

          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name="Clear"
              loading={false}
              icon={<IconField name="FaTimes" />}
              type="button"
              showAlways={true}
            />
            <Button
              name={Text?.Search || 'Search'}
              loading={isFetching && !isLoading}
              icon={<IconField name="FaSearch" />}
              type="submit"
              showAlways={true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
            </div>
          )}

          <ControlledTable
            title={Text?.Route_Pickup_Point || 'Route Pickup Points'}
            columns={columns}
            data={isLoading ? [] : tableData}
            fullData={tableData}
            showSearch={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteAll}
            showForm={() => {
              reset()
              setEditingId(null)
              setShowForm(true)
            }}
            btn
            btnName={Text?.Add_Pickup_Point || 'Add Pickup Point'}
            actionColumn
            showSelectAll
            enablePermissions
            permissionScope="TRANSPORT"
            emptyMessage="No route pickup points found matching your criteria."
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

export default RoutePickup

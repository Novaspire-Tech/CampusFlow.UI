import React, { useState } from 'react'
import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form'
import { Dropdown, Button } from '../../../components/controlled'
import TextAreaField from '../../../components/controlled/TextareaField'
import NumberField from '../../../components/controlled/NumberField'
import TextField from '../../../components/controlled/TextField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

import {
  useFilterHostelRooms,
  useCreateHostelRoom,
  useUpdateHostelRoom,
  useDeleteHostelRoom,
  useDeleteMultipleHostelRooms,
} from '../../../hooks/queries/hostel/useHostelRoom'

import type {
  HostelRoomFormData,
  HostelRoom as IHostelRoom,
  HostelRoomSearchParams,
} from '../../../types/hostel/HostelRooms'
import { useHostels } from '../../../hooks/queries/hostel/useHostel'
import { useRoomTypes } from '../../../hooks/queries/hostel/useRoomType'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'

const HostelRoom: React.FC = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [activeFilters, setActiveFilters] = useState<HostelRoomSearchParams>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<boolean>(true)

  const {
    data: hostelRoomsData,
    isLoading,
    isFetching,
  } = useFilterHostelRooms(activeFilters, page, pageSize)

  const { data: hostelsData } = useHostels()
  const { data: roomTypesData } = useRoomTypes()

  const hostelRooms = hostelRoomsData?.hostelRoom || []
  const hostels = hostelsData || []
  const roomTypes = roomTypesData || []
  const totalItems = hostelRoomsData?.totalItems ?? 0
  const totalPages = hostelRoomsData?.totalPages ?? 0

  const { control, handleSubmit, reset, setValue } = useForm<HostelRoomFormData>({
    defaultValues: {
      roomNo: '',
      hostelId: '',
      roomTypeId: '',
      noOfBeds: '',
      availableBeds: '',
      costPerBed: '',
      description: '',
    },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterSearch: '' },
  })

  const { mutateAsync: createHostelRoom, isPending: isCreating } = useCreateHostelRoom()
  const { mutateAsync: updateHostelRoom, isPending: isUpdating } = useUpdateHostelRoom()
  const { mutateAsync: deleteHostelRoom } = useDeleteHostelRoom()
  const { mutateAsync: deleteMultipleHostelRooms } = useDeleteMultipleHostelRooms()

  const { t } = useTranslation()
  const T = getPagesDataText(t) as any

  const resetForm = () => {
    reset({
      roomNo: '',
      hostelId: '',
      roomTypeId: '',
      noOfBeds: '',
      availableBeds: '',
      costPerBed: '',
      description: '',
    })
    setEditingId(null)
    setPage(0)
    setActiveFilters({})
  }

  const handlePageChange = (newPage: number) => setPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: HostelRoomSearchParams = {}
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterSearch: '' })
    setActiveFilters({})
    setPage(0)
  }

  const onSubmit: SubmitHandler<HostelRoomFormData> = async (data) => {
    try {
      if (editingId) {
        await updateHostelRoom({ id: editingId, data })
        toast.success('Hostel room updated')
      } else {
        await createHostelRoom(data)
        toast.success('Hostel room created')
      }
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (id: string | number) => {
    const room = hostelRooms.find((r: IHostelRoom) => r.id === id.toString())
    if (!room) return
    setValue('roomNo', room.roomNo)
    setValue('hostelId', room.hostelId)
    setValue('roomTypeId', room.roomTypeId)
    setValue('noOfBeds', room.noOfBeds)
    setValue('availableBeds', room.availableBeds)
    setValue('costPerBed', room.costPerBed)
    setValue('description', room.description || '')
    setEditingId(room.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    if (!(await confirmToast('Do you want to delete this hostel room?'))) return
    try {
      await deleteHostelRoom(id.toString())
      toast.success('Hostel room deleted!')
      if (editingId === id.toString()) resetForm()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete hostel room.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!(await confirmToast('Delete selected hostel rooms?'))) return
    try {
      const stringIds = ids.map((id) => id.toString())
      await deleteMultipleHostelRooms(stringIds)
      toast.success('Hostel rooms deleted!')
      if (editingId !== null && stringIds.includes(editingId)) resetForm()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete hostel rooms.')
    }
  }

  const columns = [
    { key: 'roomNo', label: T.Room_Number || 'Room No' },
    { key: 'hostelName', label: T.Hostel || 'Hostel' },
    { key: 'roomTypeName', label: T.Room_Type || 'Room Type' },
    { key: 'noOfBeds', label: T.Number_Of_Bed || 'No of Beds' },
    { key: 'costPerBed', label: T.Cost_Per_Bed || 'Cost per Bed' },
  ]

  const handleAddNew = () => {
    resetForm()
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">{T.Loading }</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-3 sm:px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {showForm && (
          <div className="w-full lg:w-80 xl:w-96 lg:shrink-0">
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-800">
                {editingId
                  ? T.Edit_Hostel_Room || 'Edit Hostel Room'
                  : T.Add_Hostel_Room || 'Add Hostel Room'}
              </h2>

              <AllSchoolDropdown
                onSubmit={handleSubmit(onSubmit)}
                queryKeys={['hostelRooms', 'hostels', 'roomTypes']}
                onSchoolChange={resetForm}
              >
                <TextField
                  name="roomNo"
                  control={control}
                  label={T.Room_Number || 'Room Number'}
                  required={true}
                  placeholder={T.Enter_Room_Number}
                />
                <Dropdown
                  name="hostelId"
                  control={control}
                  label={T.Hostel || 'Hostel'}
                  required={true}
                  options={hostels.map((hostel: any) => ({
                    value: hostel.id || hostel.hostelId || '',
                    label: hostel.name || hostel.hostelName || 'Unknown Hostel',
                  }))}
                />
                <Dropdown
                  name="roomTypeId"
                  control={control}
                  label={T.Room_Type || 'Room Type'}
                  required={true}
                  options={roomTypes.map((roomType: any) => ({
                    value: roomType.id || roomType.roomTypeId || '',
                    label: roomType.name || roomType.roomType || 'Unknown Type',
                  }))}
                />
                <NumberField
                  name="noOfBeds"
                  control={control}
                  label={T.Number_Of_Bed || 'Number of Beds'}
                  required={true}
                  placeholder={T.Enter_No_Of_Beds}
                  min={0}
                />
                <NumberField
                  name="costPerBed"
                  control={control}
                  label={T.Cost_Per_Bed || 'Cost per Bed'}
                  required={true}
                  placeholder={T.Enter_Cost_Per_Bed}
                  min={0}
                  step="0.01"
                />
                <TextAreaField
                  name="description"
                  control={control}
                  label={T.Description || 'Description'}
                  placeholder={T.Enter_Description}
                  rows={3}
                />

                <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t">
                  <Button
                    name={editingId ? T.Update || 'Update' : T.Save || 'Save'}
                    icon={<IconField name="FaSave" size={16} />}
                    loading={isCreating || isUpdating}
                    permissionScope="HOSTEL"
                    permissionType={editingId ? 'UPDATE' : 'CREATE'}
                    enablePermissions={true}
                  />
                  {editingId && (
                    <Button
                      name={T.Cancel || 'Cancel'}
                      icon={<IconField name="FaTimes" size={16} />}
                      onClick={resetForm}
                      loading={false}
                    />
                  )}
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="bg-white shadow-md rounded-lg p-3 sm:p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                {T.Hostel_Room_List || 'Hostel Rooms'}
              </h1>
            </div>

            <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <TextField
                    label={T.Search || 'Search'}
                    name="filterSearch"
                    placeholder={T.Search_By_Room_Or_Hostel}
                    control={filterControl}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0 m-2.5">
                  <Button
                    onClick={handleClearFilters}
                    name={T.Clear || 'Clear'}
                    loading={false}
                    icon={<IconField name="FaTimes" />}
                    showAlways={true}
                  />
                  <Button
                    name={T.Search || 'Search'}
                    loading={isFetching}
                    icon={<IconField name="FaSearch" />}
                    showAlways={true}
                  />
                </div>
              </div>
            </form>

            <hr className="border-gray-200 mb-4" />
            <div className="relative">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                  <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
                </div>
              )}
              <div className="overflow-x-auto">
                <ControlledTable
                  title={T.Hostel_Room_List || 'Hostel Rooms'}
                  columns={columns}
                  data={hostelRooms.map((room: IHostelRoom) => ({
                    id: room.id,
                    roomNo: room.roomNo,
                    hostelName: room.hostelName,
                    roomTypeName: room.roomTypeName,
                    availableBeds: room.availableBeds,
                    noOfBeds: room.noOfBeds,
                    costPerBed: room.costPerBed,
                  }))}
                  showSearch={false}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDeleteMultiple={handleDeleteMultiple}
                  showForm={handleAddNew}
                  actionColumn={true}
                  showSelectAll={true}
                  enablePermissions={true}
                  permissionScope="HOSTEL"
                  serverPage={page}
                  serverTotalPages={totalPages}
                  serverTotalItems={totalItems}
                  serverPageSize={pageSize}
                  onServerPageChange={handlePageChange}
                  onServerPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HostelRoom
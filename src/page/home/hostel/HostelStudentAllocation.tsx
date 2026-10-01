import React, { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm, type FieldValues } from 'react-hook-form'
import { studentHostelFeesService } from '../../../services/hostel/Studenthostelfeesservice'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { TextField } from '../../../components/controlled'
import Dropdown from '../../../components/controlled/Dropdown'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useHostels } from '../../../hooks/queries/hostel/useHostel'
import { useHostelRooms } from '../../../hooks/queries/hostel/useHostelRoom'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'

interface StudentHostelData {
  id: string
  studentName: string
  admissionNo: string
  hostelName: string
  roomName: string
  totalMonths: number
  totalFees: number
  className: string
  sectionName: string
  paidFees: number
  pendingFees: number
}

interface FilterDto {
  hostelId?: number
  classId?: number
  roomTypeId?: number
  search?: string
}

type ActiveMode = 'none' | 'filter'


const mapAllocation = (allocation: any): StudentHostelData => ({
  id: String(allocation.studentHostelFeeId ?? allocation.id ?? ''),
  studentName: `${allocation.firstName ?? ''} ${allocation.lastName ?? ''}`.trim() || 'N/A',
  admissionNo: allocation.admissionNo ?? 'N/A',
  hostelName: allocation.hostelName ?? 'N/A',
  roomName: allocation.roomName ?? 'N/A',
  totalMonths: allocation.totalMonths ?? 0,
  totalFees: allocation.totalFees ?? 0,
  className: allocation.studentClass ?? allocation.className ?? 'N/A',
  sectionName: allocation.section ?? allocation.sectionName ?? 'N/A',
  paidFees: allocation.paidFees ?? 0,
  pendingFees: allocation.pendingFees ?? 0,
})

const HostelStudentAllocation: React.FC = () => {

  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const columns = [
    { key: 'studentName', label: Text.Student_Name },
    { key: 'admissionNo', label: Text.Admission_No },
    { key: 'className', label: Text.Class },
    { key: 'sectionName', label: Text.Section },
    { key: 'hostelName', label: Text.Hostel_Name },
    { key: 'roomName', label: Text.Room_Name },
    { key: 'totalMonths', label: Text.Total_Months },
    { key: 'totalFees', label: Text.Total_Fees },
    { key: 'paidFees', label: Text.Paid },
    { key: 'pendingFees', label: Text.Pending },
  ]

  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const hostelParam = urlParams.get('hostel') ?? ''
  const roomParam = urlParams.get('room') ?? ''

  const { data: classesData } = useSchoolClasses()
  const { data: hostelsData } = useHostels()
  const { data: hostelRoomsResponse } = useHostelRooms()
  const hostelRoomsData: any[] = hostelRoomsResponse?.hostelRoom ?? []

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [activeMode, setActiveMode] = useState<ActiveMode>('none')
  const [filterParams, setFilterParams] = useState<FilterDto>({})
  const [tableSearch, setTableSearch] = useState('')
  const [isFetching, setIsFetching] = useState(false)

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      filterClassId: '',
      filterHostelId: '',
      filterRoomId: '',
      filterSearch: '',
    },
  })

  const watchedHostelId = watch('filterHostelId')

  const classOptions = useMemo(
    () =>
      (classesData as any[])?.map((c: any) => ({
        label: c.name ?? c.className,
        value: String(c.id ?? c.schoolClassId),
      })) ?? [],
    [classesData],
  )

  const hostelOptions = useMemo(
    () =>
      (hostelsData as any[])?.map((h: any) => ({
        label: h.hostelName ?? h.name ?? 'Unknown Hostel',
        value: String(h.hostelId ?? h.id),
      })) ?? [],
    [hostelsData],
  )
  const roomOptions = useMemo(() => {
    const rooms = watchedHostelId
      ? hostelRoomsData.filter((r: any) => String(r.hostelId) === watchedHostelId)
      : hostelRoomsData
    return rooms.map((r: any) => ({
      label: r.roomNo ?? r.roomNumber ?? 'Unknown Room',
      value: String(r.id ?? r.roomId ?? r.hostelRoomId),
    }))
  }, [hostelRoomsData, watchedHostelId])

  const [allData, setAllData] = useState<StudentHostelData[]>([])
  const [allTotal, setAllTotal] = useState(0)
  const [allTotalPages, setAllTotalPages] = useState(0)
  const [loadingAll, setLoadingAll] = useState(false)

  const [filterData, setFilterData] = useState<StudentHostelData[]>([])
  const [filterTotal, setFilterTotal] = useState(0)
  const [filterTotalPages, setFilterTotalPages] = useState(0)

  const fetchAll = React.useCallback(
    async (page: number, size: number) => {
      try {
        setLoadingAll(true)
        const response = await studentHostelFeesService.getAll(page, size)
        let data: StudentHostelData[] = (response?.content ?? []).map(mapAllocation)

        if (hostelParam) data = data.filter((s) => s.hostelName === hostelParam)
        if (roomParam) data = data.filter((s) => s.roomName === roomParam)

        setAllData(data)
        setAllTotal(response?.totalElements ?? data.length)
        setAllTotalPages(
          response?.totalPages ?? Math.ceil((response?.totalElements ?? data.length) / size),
        )
      } catch (err) {
        console.error('Error fetching students:', err)
        setAllData([])
        setAllTotal(0)
        setAllTotalPages(0)
      } finally {
        setLoadingAll(false)
      }
    },
    [hostelParam, roomParam],
  )

  const fetchFilter = React.useCallback(async (params: FilterDto, page: number, size: number) => {
    try {
      setIsFetching(true)
      const response = await studentHostelFeesService.filter(params, page, size)
      const data: StudentHostelData[] = (response?.content ?? []).map(mapAllocation)
      setFilterData(data)
      setFilterTotal(response?.totalElements ?? data.length)
      setFilterTotalPages(
        response?.totalPages ?? Math.ceil((response?.totalElements ?? data.length) / size),
      )
    } catch (err) {
      console.error('Error filtering students:', err)
      setFilterData([])
      setFilterTotal(0)
      setFilterTotalPages(0)
    } finally {
      setIsFetching(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAll(currentPage, pageSize)
  }, [hostelParam, roomParam])

  React.useEffect(() => {
    if (activeMode === 'none') {
      fetchAll(currentPage, pageSize)
    } else {
      fetchFilter(filterParams, currentPage, pageSize)
    }
  }, [currentPage, pageSize])

  const displayData = activeMode === 'filter' ? filterData : allData
  const totalItems = activeMode === 'filter' ? filterTotal : allTotal
  const totalPages = activeMode === 'filter' ? filterTotalPages : allTotalPages
  const isBusy = loadingAll || isFetching

  const tableData = displayData.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(tableSearch.toLowerCase()),
    ),
  )

  const handlePageChange = (newPage: number) => setCurrentPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0)
  }

  const handleApplyFilters = async (formData: FieldValues) => {
    const dto: FilterDto = {}

    if (formData.filterClassId) dto.classId = Number(formData.filterClassId)

    if (formData.filterHostelId) dto.hostelId = Number(formData.filterHostelId)
    if (formData.filterRoomId) {
      dto.roomTypeId = Number(formData.filterRoomId)
    }

    if (formData.filterSearch?.trim()) dto.search = formData.filterSearch.trim()

    const hasFilter = !!(dto.classId || dto.hostelId || dto.roomTypeId || dto.search)

    if (!hasFilter) {
      handleClearFilters()
      return
    }

    setFilterParams(dto)
    setActiveMode('filter')
    setTableSearch('')
    setCurrentPage(0)
    await fetchFilter(dto, 0, pageSize)
  }

  const handleClearFilters = () => {
    resetFilter({
      filterClassId: '',
      filterHostelId: '',
      filterRoomId: '',
      filterSearch: '',
    })
    setFilterParams({})
    setActiveMode('none')
    setTableSearch('')
    setCurrentPage(0)
    fetchAll(0, pageSize)
  }

  return (
    <div className="bg-white m-5 shadow-sm rounded-md p-4 w-full mx-auto">
      {(hostelParam || roomParam) && (
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
          >
            <i className="bx bx-arrow-back text-xl text-gray-700" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {hostelParam || 'All Hostels'}
              {roomParam ? ` — Room ${roomParam}` : ''}
            </h2>
            <p className="text-sm text-gray-500">{totalItems} student(s) allocated</p>
          </div>
        </div>
      )}

      <AllSchoolDropdown
        onSubmit={handleFilterSubmit(handleApplyFilters)}
        queryKeys={['schoolClasses', 'hostelRooms', 'hostels']}
        className="rounded-lg bg-gray-50 border border-gray-200 p-4 mb-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Dropdown
            name="filterClassId"
            label={Text.Class}
            control={filterControl}
            required={false}
            options={classOptions}
          />
          <Dropdown
            name="filterHostelId"
            label={Text.Hostel}
            control={filterControl}
            required={false}
            options={hostelOptions}
          />
          <Dropdown
            name="filterRoomId"
            label={Text.Room}
            control={filterControl}
            required={false}
            options={
              !watchedHostelId
                ? [{ label: 'Select hostel first', value: '' }]
                : roomOptions.length === 0
                  ? [{ label: 'No rooms available', value: '' }]
                  : roomOptions
            }
          />
          <TextField
            name="filterSearch"
            label={Text.Search}
            control={filterControl}
            placeholder={Text.Name_or_Admission_No}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            name={Text.Clear}
            icon={<IconField name="FaTimes" />}
            onClick={handleClearFilters}
            loading={false}
            type="button"
            showAlways={true}
          />
          <Button
            name={Text.Search}
            icon={<IconField name="FaSearch" />}
            loading={isFetching}
            type="submit"
            showAlways={true}
          />
        </div>
      </AllSchoolDropdown>

      {isBusy && (
        <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
          <IconField name="FaSpinner" size={14} className="animate-spin" />
          <span>{loadingAll ? 'Loading student list…' : 'Searching…'}</span>
        </div>
      )}

      <div className="relative">
        {isBusy && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
            <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
          </div>
        )}

        <ControlledTable
          columns={columns}
          data={tableData}
          fullData={displayData}
          searchTerm={tableSearch}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTableSearch(e.target.value)
          }
          title={Text.Student_Hostel_Allocations}
          actionColumn={false}
          showSelectAll={false}
          showExport={true}
          exportFilename="student_hostel_allocations"
          exportTitle="Student Hostel Allocations Report"
          emptyMessage={
            totalItems === 0
              ? 'No students allocated to hostels yet'
              : 'No students match the search'
          }
          customClassName="relative bg-transparent rounded-xl shadow-none mt-0"
          serverPage={currentPage}
          serverTotalPages={totalPages}
          serverTotalItems={totalItems}
          serverPageSize={pageSize}
          onServerPageChange={handlePageChange}
          onServerPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}

export default HostelStudentAllocation
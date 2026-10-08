import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Dropdown, NumberField, TextField } from '../../../components/controlled'
import DateField from '../../../components/controlled/DateField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import ExcelActions from '../../../components/uncontrolled/ExcelActions'
import { useTranslation } from 'react-i18next'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useHostels } from '../../../hooks/queries/hostel/useHostel'
import {
  useHostelRooms,
  useCheckBedAvailability,
} from '../../../hooks/queries/hostel/useHostelRoom'
import { useRoomTypes } from '../../../hooks/queries/hostel/useRoomType'
import {
  useAddStudentHostelFee,
  useUpdateStudentHostelFee,
  useRecordHostelPayment,
  useDeleteStudentHostelFee,
} from '../../../hooks/queries/hostel/Usestudenthostelfees'
import {
  useDownloadHostelFeeTemplate,
  useImportHostelFeesFromExcel,
} from '../../../hooks/queries/hostel/useHostel'
import { studentService } from '../../../services/studentInformation/studentService'
import { studentHostelFeesService } from '../../../services/hostel/Studenthostelfeesservice'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import type {
  StudentHostelFeeRow,
  StudentHostelFeeResponse,
} from '../../../types/hostel/HostelfeesType'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'

const toYMD = (val: string): string => {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [dd, mm, yyyy] = val.split('-')
    return `${yyyy}-${mm}-${dd}`
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [dd, mm, yyyy] = val.split('/')
    return `${yyyy}-${mm}-${dd}`
  }
  try {
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  } catch {
    /* empty */
  }
  return ''
}

const todayYMD = (): string => new Date().toISOString().split('T')[0]

const extractStudentId = (student: any): number => {
  const raw = student.studentId ?? student.id ?? student._id
  const num = Number(raw)
  return isNaN(num) ? 0 : num
}

// Maps a raw /student/filter record (no allocation yet) into a table row.
const mapRawToRow = (s: any): StudentHostelFeeRow | null => {
  const id = extractStudentId(s)
  if (!id) return null
  return {
    id,
    admissionNo: s.admissionNo ?? s.uid ?? '',
    studentName: `${s.firstName ?? ''} ${s.middleName ?? ''} ${s.lastName ?? ''}`.trim(),
    className: s.className ?? '',
    classId: Number(s.classId ?? 0),
    sectionName: s.sectionName ?? '',
    sectionId: Number(s.sectionId ?? 0),
    rollNo: s.rollNo ?? '',
    fatherName: s.fatherName ?? s.parent?.fatherName ?? 'N/A',
    gender: s.gender ?? '',
    mobile: s.phoneNumber ?? '',
    allocation: null,
    hasHostelFee: false,
    hostelName: '',
    roomName: '',
    _raw: s,
  }
}

interface SearchFormInputs {
  classId: string
  sectionId: string
  hostelId: string
  search: string
}

interface ModalFormInputs {
  hostelId: string
  hostelRoomId: string
  startDate: string
  totalMonths: number
  paid: number
}

interface ModalExtras {
  hostelName: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  totalFees: number
  pending: number
  allocationId?: number
}

const derive = (
  costPerBed: number,
  months: number,
  paid: number,
): { totalFees: number; pending: number } => {
  const totalFees = costPerBed * months
  const pending = Math.max(0, totalFees - paid)
  return { totalFees, pending }
}

const emptyExtras = (): ModalExtras => ({
  hostelName: '',
  roomNumber: '',
  roomTypeId: '',
  roomTypeName: '',
  totalFees: 0,
  pending: 0,
})

const AddHostelFees: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)

  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm,
    watch: watchSearch,
    setValue: setSearchValue,
  } = useForm<SearchFormInputs>({
    defaultValues: { classId: '', sectionId: '', hostelId: '', search: '' },
  })

  const {
    control: modalControl,
    handleSubmit: handleModalSubmit,
    reset: resetModalForm,
    watch: watchModal,
    setValue: setModalValue,
  } = useForm<ModalFormInputs>({
    defaultValues: {
      hostelId: '',
      hostelRoomId: '',
      startDate: todayYMD(),
      totalMonths: 1,
      paid: 0,
    },
  })

  const { data: classesData } = useSchoolClasses()
  const { data: hostelsData } = useHostels()
  const { data: hostelRoomsResponse } = useHostelRooms()
  const hostelRoomsData: any[] = hostelRoomsResponse?.hostelRoom ?? []
  const { data: roomTypesData } = useRoomTypes()

  const importMutation = useImportHostelFeesFromExcel()
  const downloadMutation = useDownloadHostelFeeTemplate()

  const addMutation = useAddStudentHostelFee()
  const updateMutation = useUpdateStudentHostelFee()
  const updateFeeMutation = useRecordHostelPayment()
  const deleteMutation = useDeleteStudentHostelFee()

  const watchedClassId = watchSearch('classId')
  const watchedSectionId = watchSearch('sectionId')
  const watchedHostelSearch = watchSearch('hostelId')
  const watchedSearchText = watchSearch('search')

  const selectedClassIdNum = useMemo(
    () => (watchedClassId ? Number(watchedClassId) : 0),
    [watchedClassId],
  )

  const { data: sectionsData, isLoading: isLoadingSections } = useSections(
    selectedClassIdNum > 0 ? selectedClassIdNum : 0,
  )

  const watchedHostelId = watchModal('hostelId')
  const watchedHostelRoomId = watchModal('hostelRoomId')
  const watchedTotalMonths = watchModal('totalMonths')
  const watchedPaid = watchModal('paid')
  const watchedStartDate = watchModal('startDate')

  const [filteredStudents, setFilteredStudents] = useState<StudentHostelFeeRow[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [tableKey, setTableKey] = useState(0)

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null)
  const [selectedRow, setSelectedRow] = useState<StudentHostelFeeRow | null>(null)
  const [extras, setExtras] = useState<ModalExtras>(emptyExtras())
  const [isSaving, setIsSaving] = useState(false)
  const [costPerBed, setCostPerBed] = useState<number>(0)

  useEffect(() => {
    setSearchValue('sectionId', '')
  }, [watchedClassId, setSearchValue])

  const excludeStudentId = modalMode === 'edit' && selectedRow ? String(selectedRow.id) : undefined

  const { data: bedAvailability, isFetching: isCheckingBeds } = useCheckBedAvailability(
    modalMode !== 'view' && watchedHostelId ? watchedHostelId : undefined,
    modalMode !== 'view' && watchedHostelRoomId ? watchedHostelRoomId : undefined,
    modalMode !== 'view' && watchedStartDate ? watchedStartDate : undefined,
    modalMode !== 'view' && watchedTotalMonths ? Number(watchedTotalMonths) : undefined,
    excludeStudentId,
  )

  useEffect(() => {
    if (modalMode === 'add' || modalMode === 'edit') {
      const months = Number(watchedTotalMonths) || 1
      const paid = isNaN(Number(watchedPaid)) ? 0 : Number(watchedPaid)
      const { totalFees, pending } = derive(costPerBed, months, paid)
      setExtras((p) => ({ ...p, totalFees, pending }))
    }
  }, [watchedTotalMonths, watchedPaid, costPerBed, modalMode])

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name ?? c.className,
        value: String(c.id ?? c.schoolClassId),
      })) ?? [],
    [classesData],
  )

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((s: any) => ({
        label: s.name ?? s.sectionName,
        value: String(s.id ?? s.sectionId),
      })) ?? [],
    [sectionsData],
  )

  const filteredRooms = useMemo(() => {
    if (!hostelRoomsData.length) return []
    if (!watchedHostelId) return hostelRoomsData
    return hostelRoomsData.filter((r: any) => String(r.hostelId) === watchedHostelId)
  }, [hostelRoomsData, watchedHostelId])

  // Mirrors AddStudentTransportFees.onSearch:
  // 1) /student/filter → all students matching class/section/search (with or without allocation)
  // 2) /student-hostel-fees/filter → allocations matching class/hostel/search, merged onto step 1's results
  // 3) if hostelId is set, narrow to students whose allocation matches that hostel
  const onSearch: SubmitHandler<SearchFormInputs> = async (data) => {
    if (!data.classId && !data.hostelId && !data.search?.trim()) {
      toast.warning('Please select a class or hostel, or enter a search term')
      return
    }
    setIsSearching(true)
    setHasSearched(true)
    setPage(0)
    try {
      const params: any = {}
      if (data.classId) params.schoolClassId = Number(data.classId)
      if (data.sectionId) params.sectionId = Number(data.sectionId)
      if (data.search?.trim()) params.searchQuery = data.search.trim()

      const result = await studentService.searchAllPages(params, 'admissionNo', 'asc')
      let students = (result.students ?? [])
        .map(mapRawToRow)
        .filter((s): s is StudentHostelFeeRow => s !== null)

      try {
        const filterCriteria: Record<string, any> = {}
        if (data.classId) filterCriteria.classId = Number(data.classId)
        if (data.hostelId) filterCriteria.hostelId = Number(data.hostelId)
        if (data.search?.trim()) filterCriteria.search = data.search.trim()

        const feesResult = await studentHostelFeesService.filterAllPages(filterCriteria)
        const feeMap = new Map<number, any>()
        for (const fee of feesResult.content ?? []) {
          const sid = Number(fee.studentId)
          if (sid) feeMap.set(sid, fee)
        }

        students = students.map((s) => {
          const alloc = feeMap.get(s.id)
          if (!alloc) return s
          return {
            ...s,
            allocation: alloc,
            hasHostelFee: true,
            hostelName: alloc.hostelName ?? '',
            roomName: alloc.roomName ?? '',
          }
        })
      } catch (e) {
        console.warn('Could not fetch hostel fees:', e)
      }

      if (data.hostelId)
        students = students.filter(
          (s) => s.allocation && String(s.allocation.hostelId) === String(data.hostelId),
        )

      setFilteredStudents(students)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search students')
      setFilteredStudents([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearFilters = () => {
    resetSearchForm()
    setFilteredStudents([])
    setHasSearched(false)
    setPage(0)
  }

  const handleRoomChange = useCallback(
    (roomId: string) => {
      const room = hostelRoomsData.find((r: any) => String(r.id ?? r.hostelRoomId) === roomId)
      setModalValue('hostelRoomId', roomId)
      if (!room) return

      const cpb = parseFloat(room.costPerBed ?? '0') || 0
      setCostPerBed(cpb)

      const roomType =
        roomTypesData?.find((rt: any) => String(rt.id ?? rt.roomTypeId) === String(room.roomTypeId))
          ?.roomType ?? ''

      setExtras((p) => {
        const months = Number(watchedTotalMonths) || 1
        const paid = isNaN(Number(watchedPaid)) ? 0 : Number(watchedPaid)
        const { totalFees, pending } = derive(cpb, months, paid)
        return {
          ...p,
          roomNumber: room.roomNo ?? room.roomNumber ?? '',
          roomTypeId: String(room.roomTypeId ?? ''),
          roomTypeName: roomType,
          totalFees,
          pending,
        }
      })
    },
    [hostelRoomsData, roomTypesData, watchedTotalMonths, watchedPaid, setModalValue],
  )

  const openModal = useCallback(
    (mode: 'add' | 'edit' | 'view', row: StudentHostelFeeRow) => {
      if (!row.id) {
        toast.error('Invalid student. Cannot open modal.')
        return
      }
      setModalMode(mode)
      setSelectedRow(row)

      if (mode === 'view') {
        resetModalForm()
        setExtras(emptyExtras())
        setCostPerBed(0)
        return
      }

      if (mode === 'edit' && row.allocation) {
        const alloc = row.allocation
        const room = hostelRoomsData.find(
          (r: any) => String(r.id ?? r.hostelRoomId) === String(alloc.roomId),
        )
        const cpb = parseFloat(room?.costPerBed ?? '0') || 0
        setCostPerBed(cpb)

        resetModalForm({
          hostelId: String(row._raw?.hostelId ?? alloc.hostelId ?? ''),
          hostelRoomId: String(alloc.roomId ?? ''),
          startDate: toYMD(alloc.startDate),
          totalMonths: alloc.totalMonths,
          paid: alloc.paidFees,
        })

        setExtras({
          hostelName: alloc.hostelName ?? '',
          roomNumber: alloc.roomName ?? '',
          roomTypeId: String(alloc.roomTypeId ?? ''),
          roomTypeName: alloc.roomTypeName ?? '',
          totalFees: alloc.totalFees,
          pending: Math.max(0, alloc.totalFees - alloc.paidFees),
          allocationId: alloc.studentHostelFeeId,
        })
      } else {
        // 'add' mode, or 'edit' with no existing allocation
        setCostPerBed(0)
        resetModalForm({
          hostelId: '',
          hostelRoomId: '',
          startDate: todayYMD(),
          totalMonths: 1,
          paid: 0,
        })
        setExtras(emptyExtras())
        if (mode === 'edit') setModalMode('add')
      }
    },
    [hostelRoomsData, resetModalForm],
  )

  const closeModal = useCallback(() => {
    setModalMode(null)
    setSelectedRow(null)
    resetModalForm()
    setExtras(emptyExtras())
    setCostPerBed(0)
  }, [resetModalForm])

  const handleSave = handleModalSubmit(async (formData) => {
    if (!selectedRow) return

    if (!formData.hostelId) {
      toast.warning('Please select a hostel')
      return
    }
    if (!formData.hostelRoomId) {
      toast.warning('Please select a room')
      return
    }

    const startDate = toYMD(formData.startDate)
    if (!startDate) {
      toast.warning('Please enter a valid start date')
      return
    }

    const hostelRoomId = Number(formData.hostelRoomId)
    const totalMonths = Number(formData.totalMonths)
    const paid = isFinite(Number(formData.paid)) ? Number(formData.paid) : 0

    if (hostelRoomId <= 0) {
      toast.warning('Please select a valid room')
      return
    }
    if (totalMonths < 1) {
      toast.warning('Total months must be at least 1')
      return
    }
    if (paid < 0) {
      toast.warning('Paid amount cannot be negative')
      return
    }
    if (extras.totalFees > 0 && paid > extras.totalFees) {
      toast.warning('Paid amount cannot exceed total fees')
      return
    }

    const hostel = hostelsData?.find((h: any) => String(h.id ?? h.hostelId) === formData.hostelId)
    const room = hostelRoomsData.find(
      (r: any) => String(r.id ?? r.hostelRoomId) === formData.hostelRoomId,
    )

    setIsSaving(true)
    try {
      if (modalMode === 'add') {
        await addMutation.mutateAsync({
          studentId: selectedRow.id,
          hostelRoomId,
          startDate,
          totalMonths,
          paid,
        })

        const optimistic: StudentHostelFeeResponse = {
          studentHostelFeeId: 0,
          firstName: selectedRow._raw?.firstName ?? '',
          lastName: selectedRow._raw?.lastName ?? '',
          studentId: selectedRow.id,
          startDate,
          endDate: '',
          totalMonths,
          totalFees: extras.totalFees,
          paidFees: paid,
          hostelName: hostel?.hostelName ?? hostel?.name ?? '',
          roomName: room?.roomNo ?? room?.roomNumber ?? '',
          hostelId: Number(formData.hostelId),
          roomId: hostelRoomId,
          roomTypeId: Number(extras.roomTypeId),
          roomTypeName: extras.roomTypeName,
          admissionNo: selectedRow.admissionNo,
          id: 0,
        }

        setFilteredStudents((prev) =>
          prev.map((r) =>
            r.id === selectedRow.id
              ? {
                  ...r,
                  allocation: optimistic,
                  hasHostelFee: true,
                  hostelName: optimistic.hostelName ?? '',
                  roomName: optimistic.roomName ?? '',
                }
              : r,
          ),
        )
        toast.success('Hostel fee added successfully')
      } else if (modalMode === 'edit' && extras.allocationId) {
        await updateMutation.mutateAsync({
          allocationId: extras.allocationId,
          dto: {
            newTotalMonths: totalMonths,
            hostelRoomId,
            additionalPayment: 0,
          },
        })

        const previousPaid = selectedRow.allocation?.paidFees ?? 0
        const additionalPayment = paid - previousPaid
        if (additionalPayment > 0) {
          await updateFeeMutation.mutateAsync({
            allocationId: extras.allocationId,
            fee: additionalPayment,
          })
        }

        setFilteredStudents((prev) =>
          prev.map((r) =>
            r.id === selectedRow.id && r.allocation
              ? {
                  ...r,
                  allocation: {
                    ...r.allocation,
                    totalMonths,
                    totalFees: extras.totalFees,
                    paidFees: paid,
                    hostelName: hostel?.hostelName ?? hostel?.name ?? r.allocation.hostelName,
                    roomName: room?.roomNo ?? room?.roomNumber ?? r.allocation.roomName,
                  },
                  hostelName: hostel?.hostelName ?? hostel?.name ?? r.hostelName,
                  roomName: room?.roomNo ?? room?.roomNumber ?? r.roomName,
                }
              : r,
          ),
        )
        toast.success('Hostel fee updated successfully')
      }

      closeModal()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Operation failed. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  })

  const handleDelete = async (rowId: string | number) => {
    const row = filteredStudents.find((r) => String(r.id) === String(rowId))
    if (!row?.allocation) {
      toast.warning('This student has no hostel allocation to delete')
      return
    }
    if (!(await confirmToast('Delete this hostel fee allocation? This cannot be undone.'))) return

    try {
      await deleteMutation.mutateAsync(row.allocation.studentHostelFeeId)
      setFilteredStudents((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, allocation: null, hasHostelFee: false, hostelName: '', roomName: '' }
            : r,
        ),
      )
      setTableKey((k) => k + 1)
      toast.success('Hostel fee deleted successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete hostel fee')
    }
  }

  const paginatedStudents = useMemo(() => {
    const start = page * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))

  const columns = [
    { label: Text.Admission_No, key: 'admissionNo' as keyof StudentHostelFeeRow },
    { label: Text.Student_Name, key: 'studentName' as keyof StudentHostelFeeRow },
    { label: Text.Roll_No, key: 'rollNo' as keyof StudentHostelFeeRow },
    { label: Text.Class, key: 'className' as keyof StudentHostelFeeRow },
    { label: NameText.Section, key: 'sectionName' as keyof StudentHostelFeeRow },
    { label: Text.Hostel, key: 'hostelName' as keyof StudentHostelFeeRow },
    { label: Text.Room, key: 'roomName' as keyof StudentHostelFeeRow },
  ]

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4  border-b ">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 ">{Text.Add_Hostel_Fees}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Search students to assign or update their hostel fees
          </p>
        </div>

        <div className="flex gap-2">
          <ExcelActions
            uploadEndpoint="/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/add/xl-sheet"
            importMutation={importMutation}
            downloadMutation={downloadMutation}
            importLabel="Import Hostel Fees XL"
            downloadLabel="Download XL Template"
            onImportSuccess={() =>
              onSearch({
                classId: watchedClassId,
                sectionId: watchedSectionId,
                hostelId: watchedHostelSearch,
                search: watchedSearchText,
              })
            }
          />
        </div>
      </div>

      <AllSchoolDropdown
        onSubmit={handleSearchSubmit(onSearch)}
        queryKeys={['sections', 'schoolClasses']}
        onSchoolChange={resetSearchForm}
        className="p-2"
      >
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Dropdown
            label={Text.Class}
            name="classId"
            control={searchControl}
            options={classOptions}
          />
          <Dropdown
            label={NameText.Section}
            name="sectionId"
            control={searchControl}
            options={
              !selectedClassIdNum
                ? [{ label: 'Please select a class first', value: '' }]
                : isLoadingSections
                  ? [{ label: 'Loading sections…', value: '' }]
                  : sectionOptions.length === 0
                    ? [{ label: 'No sections available', value: '' }]
                    : sectionOptions
            }
          />
          <TextField
            label={Text.Name_Admission_No}
            name="search"
            control={searchControl}
            placeholder={Text.Enter_Name_Or_Admission_No}
          />
        </div>

        <div className="px-4 pb-4 flex justify-end gap-2">
          {hasSearched && (
            <Button
              name={Text.Cancel}
              icon={<IconField name="FaTimes" size={16} />}
              onClick={handleClearFilters}
              loading={false}
              showAlways={true}
            />
          )}
          <Button
            name={isSearching ? Text.Loading : Text.Search}
            icon={<IconField name="FaSearch" />}
            loading={isSearching}
            showAlways={true}
          />
        </div>
      </AllSchoolDropdown>

      {isSearching && (
        <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
          <IconField name="FaSpinner" size={14} className="animate-spin" />
          <span>{Text.Loading}</span>
        </div>
      )}

      {hasSearched && !isSearching && (
        <div className="mt-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-700">{Text.Student_List}</h2>
            <span className="text-sm text-gray-500">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm font-medium">No students match your filters</p>
              <p className="text-xs mt-1">
                Try adjusting the class, section, hostel, or name filter
              </p>
            </div>
          ) : (
            <ControlledTable
              key={tableKey}
              columns={columns}
              data={paginatedStudents}
              fullData={filteredStudents}
              title={Text.Student_Hostel_Fees}
              btn={false}
              header={false}
              forceShowActions={true}
              showSearch={false}
              showSelectAll={false}
              enablePermissions={true}
              permissionScope="FEES"
              actionColumn={true}
              onAdd={(id: string | number) => {
                const r = filteredStudents.find((s) => String(s.id) === String(id))
                if (r) openModal('add', r)
              }}
              onEdit={(id: string | number) => {
                const r = filteredStudents.find((s) => String(s.id) === String(id))
                if (r) openModal('edit', r)
              }}
              onDelete={handleDelete}
              onRowClick={(row: StudentHostelFeeRow) => openModal('view', row)}
              rowClassName="cursor-pointer hover:bg-gray-50 transition-colors"
              serverPage={page}
              serverTotalPages={totalPages}
              serverTotalItems={filteredStudents.length}
              serverPageSize={pageSize}
              onServerPageChange={(p: number) => setPage(p)}
              onServerPageSizeChange={(s: number) => {
                setPageSize(s)
                setPage(0)
              }}
            />
          )}
        </div>
      )}

      {modalMode && selectedRow && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={closeModal} />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                      modalMode === 'view'
                        ? 'bg-blue-100 text-blue-700'
                        : modalMode === 'edit'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {modalMode === 'view'
                      ? Text.View_Hostel_Fees
                      : modalMode === 'edit'
                        ? Text.Edit_Hostel_Fees
                        : Text.Add_Hostel_Fees}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">
                    {selectedRow.studentName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedRow.className}
                    {selectedRow.sectionName ? ` — ${selectedRow.sectionName}` : ''}
                    &nbsp;|&nbsp;Roll: {selectedRow.rollNo || 'N/A'}
                    &nbsp;|&nbsp;Adm: {selectedRow.admissionNo}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 ml-4 mt-1"
                >
                  <IconField name="FaTimes" size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {modalMode === 'view' && (
                  <div>
                    {!selectedRow.allocation ? (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-sm font-medium">No hostel fees assigned yet</p>
                        <p className="text-xs mt-1">Use the Add button to assign hostel fees</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {[
                            {
                              label: Text.Total_Fees,
                              value: selectedRow.allocation.totalFees,
                              color: 'blue',
                            },
                            {
                              label: Text.Paid,
                              value: selectedRow.allocation.paidFees,
                              color: 'green',
                            },
                            {
                              label: Text.Pending,
                              value: Math.max(
                                0,
                                selectedRow.allocation.totalFees - selectedRow.allocation.paidFees,
                              ),
                              color: 'red',
                            },
                          ].map(({ label, value, color }) => (
                            <div
                              key={label}
                              className={`bg-${color}-50 border border-${color}-100 rounded-lg p-3 text-center`}
                            >
                              <p className={`text-xs text-${color}-600 font-medium mb-1`}>
                                {label}
                              </p>
                              <p className={`text-xl font-bold text-${color}-800`}>₹{value}</p>
                            </div>
                          ))}
                        </div>

                        <h4 className="text-sm font-semibold text-gray-600 mb-2">
                          {Text.Hostel_Details}
                        </h4>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                          {[
                            [Text.Hostel, selectedRow.allocation.hostelName ?? '—'],
                            [Text.Room, selectedRow.allocation.roomName ?? '—'],
                            [Text.Room_Type, selectedRow.allocation.roomTypeName ?? '—'],
                            [Text.Start_Date, selectedRow.allocation.startDate],
                            [Text.End_Date, selectedRow.allocation.endDate],
                            [Text.Total_Months, selectedRow.allocation.totalMonths],
                            [Text.Total_Fees, `₹${selectedRow.allocation.totalFees}`],
                            [Text.Paid, `₹${selectedRow.allocation.paidFees}`],
                            [
                              Text.Pending,
                              `₹${Math.max(0, selectedRow.allocation.totalFees - selectedRow.allocation.paidFees)}`,
                            ],
                          ].map(([k, v]) => (
                            <div key={String(k)} className="flex justify-between text-sm">
                              <span className="text-gray-500 font-medium">{k}</span>
                              <span className="text-gray-800 font-semibold">{v}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {(modalMode === 'add' || modalMode === 'edit') && (
                  <AllSchoolDropdown onSubmit={handleSave} queryKeys={['hostels']}>
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Hostel Assignment
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {Text.Hostel}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={watchedHostelId}
                              onChange={(e) => {
                                const val = e.target.value
                                const h = hostelsData?.find(
                                  (x: any) => String(x.id ?? x.hostelId) === val,
                                )
                                setModalValue('hostelId', val)
                                setModalValue('hostelRoomId', '')
                                setCostPerBed(0)
                                setExtras((p) => ({
                                  ...p,
                                  hostelName: h?.hostelName ?? h?.name ?? '',
                                  roomNumber: '',
                                  roomTypeId: '',
                                  roomTypeName: '',
                                  totalFees: 0,
                                  pending: 0,
                                }))
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Hostel</option>
                              {hostelsData?.map((h: any) => (
                                <option key={h.id ?? h.hostelId} value={String(h.id ?? h.hostelId)}>
                                  {h.hostelName ?? h.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {Text.Room} <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={watchedHostelRoomId}
                              onChange={(e) => handleRoomChange(e.target.value)}
                              disabled={!watchedHostelId}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                            >
                              <option value="">
                                {!watchedHostelId ? 'Select hostel first' : 'Select Room'}
                              </option>
                              {filteredRooms.map((r: any) => (
                                <option
                                  key={r.id ?? r.hostelRoomId}
                                  value={String(r.id ?? r.hostelRoomId)}
                                >
                                  {r.roomNo ?? r.roomNumber ?? 'Unknown Room'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {Text.Room_Type}
                            </label>
                            <input
                              type="text"
                              value={extras.roomTypeName}
                              readOnly
                              placeholder="Auto-filled from room"
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>

                          <DateField
                            name="startDate"
                            label={Text.Start_Date}
                            control={modalControl}
                            required
                          />
                        </div>

                        {watchedHostelId && watchedHostelRoomId && (
                          <div className="mt-4">
                            {isCheckingBeds ? (
                              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 shrink-0" />
                                {Text.Checking_Bed_Availability}
                              </div>
                            ) : bedAvailability ? (
                              <div
                                className={`p-3 rounded-lg border text-sm ${bedAvailability.available ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                              >
                                <div className="flex items-center gap-2 font-medium mb-2">
                                  <IconField
                                    name={
                                      bedAvailability.available ? 'FaCheckCircle' : 'FaTimesCircle'
                                    }
                                    size={15}
                                  />
                                  {bedAvailability.message}
                                </div>
                                {bedAvailability.totalBeds > 0 && (
                                  <div className="grid grid-cols-3 gap-3 mt-2 text-center">
                                    {[
                                      ['Total_Beds', bedAvailability.totalBeds, ''],
                                      [Text.Occupied, bedAvailability.occupiedBeds, ''],
                                      [
                                        Text.Available,
                                        bedAvailability.availableBeds,
                                        bedAvailability.available
                                          ? 'text-green-700'
                                          : 'text-red-600',
                                      ],
                                    ].map(([label, val, cls]) => (
                                      <div
                                        key={String(label)}
                                        className="bg-white/60 rounded-md p-2"
                                      >
                                        <div className={`text-base font-bold ${cls}`}>{val}</div>
                                        <div className="text-xs text-gray-500">{label}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          {Text.Fee_Details}
                        </p>
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <NumberField
                              name="totalMonths"
                              label={Text.Total_Months}
                              control={modalControl}
                              required
                              min={1}
                              step={1}
                            />

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                {Text.Cost_Per_Bed}
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  value={costPerBed || '—'}
                                  readOnly
                                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                {Text.Total_Fees}
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  value={extras.totalFees.toFixed(2)}
                                  readOnly
                                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                {Text.Pending}
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  value={extras.pending.toFixed(2)}
                                  readOnly
                                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AllSchoolDropdown>
                )}
              </div>

              <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                {modalMode === 'view' ? (
                  <>
                    <Button name={Text.Cancel} loading={false} onClick={closeModal} />
                    <Button
                      name={Text.Edit_Hostel_Fees}
                      icon={<IconField name="FaEdit" />}
                      loading={false}
                      onClick={() => {
                        const r = selectedRow!
                        closeModal()
                        setTimeout(() => openModal('edit', r), 50)
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Button name={Text.Cancel} loading={false} onClick={closeModal} />
                    <Button
                      name={isSaving ? Text.Saving : modalMode === 'edit' ? Text.Update : Text.Save}
                      icon={<IconField name="FaSave" />}
                      loading={isSaving}
                      isDisable={
                        !watchedHostelId ||
                        !watchedHostelRoomId ||
                        !watchedTotalMonths ||
                        Number(watchedTotalMonths) < 1 ||
                        isSaving
                      }
                      onClick={handleSave}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AddHostelFees

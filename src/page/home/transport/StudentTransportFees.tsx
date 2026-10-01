import React, { useCallback, useMemo, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { IconField } from '../../../components'
import { Button, DateField, Dropdown, NumberField, TextField } from '../../../components/controlled'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import ExcelActions from '../../../components/uncontrolled/ExcelActions'
import { confirmToast } from '../../../helpers/confirmToast'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useAssignVehicles } from '../../../hooks/queries/transport/useAssignVehicles'
import { usePickupPoints } from '../../../hooks/queries/transport/usePickupPoints'
import { useRoutePickupPoints } from '../../../hooks/queries/transport/useRoutePickupPoints'
import { useRoutes } from '../../../hooks/queries/transport/useRoutes'
import {
  useBulkUploadStudents,
  useDownloadStudentTemplate,
} from '../../../hooks/queries/transport/useStudentTransportFees'
import { useVehicles } from '../../../hooks/queries/transport/useVehicles'
import { studentService } from '../../../services/studentInformation/studentService'
import { studentTransportFeesService } from '../../../services/transport/studentTransportFeesService'
import type {
  StudentTransportFees,
  StudentTransportFeesFilterCriteria,
  StudentTransportFeesFormData,
  UpdateStudentTransportFeeFormData,
  UpdateTransportPaymentData,
} from '../../../types/transport/studentTransportFees'

interface SearchFormInputs {
  classId: string
  sectionId: string
  routeId: string
  search: string
}

interface TransportFeeRowData {
  studentTransportFeesId: number | null
  routeId: string
  routeName: string
  pickUpPointId: string
  pickUpPointName: string
  vehicleId: string
  vehicleName: string
  startDate: string
  totalMonths: number
  paid: string
  totalFees: string
  pendingFees: string
}

interface StudentTransportFeeRecord {
  id: string | number
  admissionNo: string
  studentName: string
  class: string
  classId: string | number
  section: string
  sectionId: string | number
  rollNo: string
  fatherName: string
  parentName: string
  parentPhone: string
  gender: string
  mobile: string
  routeName: string
  pickUpPointName: string
  vehicleName: string
  totalFees: string
  totalPaid: string
  totalPending: string
  transportFee: TransportFeeRowData | null
  hasTransportFee: boolean
  _raw: any
}

interface TransportFeeModalForm {
  routeId: string
  pickUpPointId: string
  vehicleId: string
  startDate: string
  totalMonths: number
}

interface PaymentModalForm {
  paymentAmount: string
}

const extractStudentId = (student: any): string => {
  if (student.studentId && student.studentId !== '') return String(student.studentId)
  if (student.id && student.id !== '') return String(student.id)
  if (student._id && student._id !== '') return String(student._id)
  console.error('Could not extract ID from student:', student)
  return ''
}

const mapRawToStudentTransportFeeRecord = (s: any): StudentTransportFeeRecord | null => {
  const studentId = extractStudentId(s)
  if (!studentId) {
    console.error('Student missing ID:', s)
    return null
  }

  const transportData = s.transport || null
  const routeId = s.routeId || transportData?.routeId || transportData?.route?.routeId || ''
  const routeName =
    s.routeName || transportData?.routeName || transportData?.route?.routeTitle || ''
  const pickUpPointId =
    s.pickUpPointId ||
    transportData?.pickupPointId ||
    transportData?.pickUpPoint?.pickUpPointId ||
    ''
  const pickUpPointName =
    s.pickUpPointName || transportData?.pickupPointName || transportData?.pickUpPoint?.name || ''
  const vehicleId =
    s.vehicleId || transportData?.vehicleId || transportData?.vehicle?.vehiclesId || ''
  const vehicleName =
    s.vehicleName || transportData?.vehicleName || transportData?.vehicle?.vehicleNumber || ''

  const existingFee = s.studentTransportFee || null
  const studentTransportFeesId: number | null = existingFee?.studentTransportFeesId ?? null
  const totalFees = existingFee?.totalFees ?? s.transportTotalFees ?? '0'
  const paid = existingFee?.paidFees ?? s.transportPaid ?? '0'
  const pending =
    existingFee?.pendingFees ??
    String(Math.max(0, (parseFloat(totalFees) || 0) - (parseFloat(paid) || 0)))
  const startDate = existingFee?.startDate ?? ''
  const totalMonths = existingFee?.totalMonths ?? 1

  const transportFee: TransportFeeRowData | null = routeId
    ? {
        studentTransportFeesId,
        routeId: String(routeId),
        routeName,
        pickUpPointId: String(pickUpPointId),
        pickUpPointName,
        vehicleId: String(vehicleId),
        vehicleName,
        startDate,
        totalMonths,
        paid: String(paid),
        totalFees: String(totalFees),
        pendingFees: String(pending),
      }
    : null

  return {
    id: studentId,
    admissionNo: s.admissionNo || s.uid || '',
    studentName: `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim(),
    class: s.className || '',
    classId: String(s.classId || ''),
    section: s.sectionName || '',
    sectionId: String(s.sectionId || ''),
    rollNo: s.rollNo || '',
        fatherName: s.fatherName || s.parent?.fatherName || 'N/A',
    parentName: s.fatherName || s.parent?.fatherName || 'N/A',
    parentPhone:
      s.parent?.phoneNumber ||
      s.parent?.mobile ||
      s.parentPhone ||
      s.parentMobile ||
      s.fatherPhone ||
      s.phoneNumber ||
      'N/A',
    gender: s.gender || '',
    mobile: s.phoneNumber || '',
    routeName: transportFee?.routeName || '—',
    pickUpPointName: transportFee?.pickUpPointName || '—',
    vehicleName: transportFee?.vehicleName || '—',
    totalFees: transportFee?.totalFees || '0',
    totalPaid: transportFee?.paid || '0',
    totalPending: transportFee?.pendingFees || '0',
    transportFee,
    hasTransportFee: !!transportFee,
    _raw: s,
  }
}

const AddStudentTransportFees: React.FC = () => {
  const uploadExcelMutation = useBulkUploadStudents()
  const downloadTemplateMutation = useDownloadStudentTemplate()
  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm,
    watch: watchSearch,
  } = useForm<SearchFormInputs>({
    defaultValues: { classId: '', sectionId: '', routeId: '', search: '' },
  })
  const {
    control: transportFeeControl,
    handleSubmit: handleTransportFeeSubmit,
    reset: resetTransportFeeForm,
    setValue: setTransportFeeValue,
    watch: watchTransportFee,
  } = useForm<TransportFeeModalForm>({
    defaultValues: {
      routeId: '',
      pickUpPointId: '',
      vehicleId: '',
      startDate: '',
      totalMonths: 1,
    },
  })

  const {
    control: paymentControl,
    handleSubmit: handlePaymentSubmit,
    reset: resetPaymentForm,
  } = useForm<PaymentModalForm>({
    defaultValues: { paymentAmount: '' },
  })

  const { data: classesData } = useSchoolClasses()
  const { data: routesData } = useRoutes()
  const { data: pickupPointsData } = usePickupPoints()
  const { data: vehiclesData } = useVehicles()
  const { data: assignVehiclesData = [] } = useAssignVehicles()
  const { data: routePickupPointsResponse } = useRoutePickupPoints(0, 1000, 'asc')
  const routePickupPointsData = useMemo(
    () => routePickupPointsResponse?.routePickupPoints || [],
    [routePickupPointsResponse],
  )

  const watchedClassId = watchSearch('classId')
  const selectedClassIdNum = useMemo(
    () => (watchedClassId ? Number(watchedClassId) : 0),
    [watchedClassId],
  )
  const { data: sectionsData, isLoading: isLoadingSections } = useSections(
    selectedClassIdNum > 0 ? selectedClassIdNum : 0,
  )

  const watchedModalRouteId = watchTransportFee('routeId')
  const watchedModalPickUpPointId = watchTransportFee('pickUpPointId')
  const watchedTotalMonths = watchTransportFee('totalMonths')

  const [filteredStudents, setFilteredStudents] = useState<StudentTransportFeeRecord[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [tableKey, setTableKey] = useState(0)

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'payment' | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentTransportFeeRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPaymentSaving, setIsPaymentSaving] = useState(false)
  const [calculatedTotalFees, setCalculatedTotalFees] = useState<string>('0')
  const [calculatedPending, setCalculatedPending] = useState<string>('0')

  const { t } = useTranslation()
    const T = getPagesDataText(t)

  const filteredVehicles = useMemo(() => {
    if (!vehiclesData?.length) return []
    if (!watchedModalRouteId || !assignVehiclesData?.length) return vehiclesData
    const vehicleNumbersForRoute = new Set(
      assignVehiclesData
        .filter((av: any) => String(av.routeId) === String(watchedModalRouteId))
        .map((av: any) => (av.vehicle?.vehicleNumber || av.vehicleName || '').trim())
        .filter((num: string) => num !== ''),
    )
    if (vehicleNumbersForRoute.size === 0) return vehiclesData
    const filtered = vehiclesData.filter((v: any) =>
      vehicleNumbersForRoute.has((v.vehicleNumber || v.vehicleNo || '').trim()),
    )
    return filtered.length > 0 ? filtered : vehiclesData
  }, [watchedModalRouteId, vehiclesData, assignVehiclesData])

  const filteredPickupPointsForModal = useMemo(() => {
    const list = pickupPointsData ?? []
    if (!watchedModalRouteId) return []
    const ids = new Set(
      routePickupPointsData
        .filter((rpp: any) => String(rpp.routeId) === String(watchedModalRouteId))
        .map((rpp: any) => String(rpp.pickupPointId)),
    )
    const filtered = list.filter((pp: any) => ids.has(String(pp.id || pp.pickUpPointId)))
    return filtered
  }, [pickupPointsData, watchedModalRouteId, routePickupPointsData])

  const getRoutePickupPoint = useCallback(
    (routeId: string, pickupPointId: string) =>
      routePickupPointsData.find(
        (rpp: any) =>
          String(rpp.routeId) === String(routeId) &&
          String(rpp.pickupPointId) === String(pickupPointId),
      ),
    [routePickupPointsData],
  )

  useMemo(() => {
    if (watchedModalRouteId && watchedModalPickUpPointId) {
      const rpp = getRoutePickupPoint(watchedModalRouteId, watchedModalPickUpPointId)
      if (rpp) {
        const monthlyFee = parseFloat(rpp.totalFees || '0')
        const total = monthlyFee * (watchedTotalMonths || 1)
        setCalculatedTotalFees(total.toFixed(2))

        const existingPaid = selectedStudent?.transportFee?.paid || '0'
        const pending = Math.max(0, total - parseFloat(existingPaid)).toFixed(2)
        setCalculatedPending(pending)
        return
      }
    }
    setCalculatedTotalFees('0')
    setCalculatedPending('0')
  }, [
    watchedModalRouteId,
    watchedModalPickUpPointId,
    watchedTotalMonths,
    getRoutePickupPoint,
    selectedStudent,
  ])

  const handleRouteChange = useCallback(
    (routeId: string) => {
      setTransportFeeValue('routeId', routeId)
      setTransportFeeValue('pickUpPointId', '')
      setTransportFeeValue('vehicleId', '')
    },
    [setTransportFeeValue],
  )

  const handlePickupPointChange = useCallback(
    (pickupPointId: string) => {
      setTransportFeeValue('pickUpPointId', pickupPointId)

      if (watchedModalRouteId && pickupPointId) {
        const rpp = getRoutePickupPoint(watchedModalRouteId, pickupPointId)
        if (rpp?.vehicleId) {
          setTransportFeeValue('vehicleId', String(rpp.vehicleId))
        }
      }
    },
    [watchedModalRouteId, getRoutePickupPoint, setTransportFeeValue],
  )

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: String(c.id || c.schoolClassId),
      })) || [],
    [classesData],
  )

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((s: any) => ({
        label: s.name || s.sectionName,
        value: String(s.id || s.sectionId),
      })) || [],
    [sectionsData],
  )

  const routeOptions = useMemo(
    () =>
      routesData?.map((r: any) => ({
        label: r.routeTitle || r.name || 'Unknown Route',
        value: String(r.routeId || r.id),
      })) || [],
    [routesData],
  )

  const pickupPointOptions = useMemo(
    () =>
      filteredPickupPointsForModal.map((pp: any) => ({
        label: pp.pickUpPointName || pp.name || 'Unknown Point',
        value: String(pp.id || pp.pickUpPointId),
      })),
    [filteredPickupPointsForModal],
  )

  const vehicleOptions = useMemo(
    () =>
      filteredVehicles.map((v: any) => ({
        label: v.vehicleNumber || v.vehicleNo || 'Unknown Vehicle',
        value: String(v.id || v.vehicleId),
      })),
    [filteredVehicles],
  )

  const onSearch: SubmitHandler<SearchFormInputs> = async (data) => {
    if (!data.classId && !data.routeId) {
      toast.warning('Please select a class or route to search')
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

      const result = await studentService.search(params, 0, 100000, 'admissionNo', 'asc')
      let students = (result.students || [])
        .map(mapRawToStudentTransportFeeRecord)
        .filter((s): s is StudentTransportFeeRecord => s !== null)

     try {
        const filterCriteria: StudentTransportFeesFilterCriteria = {}
        if (data.classId) filterCriteria.classId = Number(data.classId)
        if (data.routeId) filterCriteria.routeId = Number(data.routeId)
        if (data.search?.trim()) filterCriteria.search = data.search.trim()
        const transportResult = await studentTransportFeesService.filter(
          filterCriteria,
          0,
          100000,
          'studentTransportFeesId',
          'asc',
        )
        
        const transportMap = new Map<number, StudentTransportFees>()
        for (const fee of transportResult.data) transportMap.set(fee.studentId, fee)
        students = students.map((s) => {
          const fee = transportMap.get(Number(s.id))
          if (!fee) return s
          const transportFee: TransportFeeRowData = {
            studentTransportFeesId: fee.studentTransportFeesId,
            routeId: String(fee.routeId),
            routeName: fee.routeName,
            pickUpPointId: String(fee.pickUpPointId),
            pickUpPointName: fee.pickUpPointName,
            vehicleId: String(fee.vehicleId),
            vehicleName: fee.vehicleName,
            startDate: fee.startDate,
            totalMonths: fee.totalMonths,
            paid: String(fee.paidFees),
            totalFees: String(fee.totalFees),
            pendingFees: String(fee.totalFees - fee.paidFees),
          }
          return {
            ...s,
            transportFee,
            parentName: fee.parentName || s.parentName,
            parentPhone: fee.parentPhone || s.parentPhone,
            routeName: fee.routeName,
            pickUpPointName: fee.pickUpPointName,
            vehicleName: fee.vehicleName,
            totalFees: String(fee.totalFees),
            totalPaid: String(fee.paidFees),
            totalPending: String(fee.totalFees - fee.paidFees),
            hasTransportFee: true,
          }
        })
      } catch (e) {
        console.warn('Could not fetch transport fees:', e)
      }

      if (data.routeId)
        students = students.filter(
          (s) => s.transportFee && String(s.transportFee.routeId) === String(data.routeId),
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

  const openModal = useCallback(
    (mode: 'add' | 'edit' | 'view' | 'payment', student: StudentTransportFeeRecord) => {
      if (!student.id || student.id === '') {
        toast.error('Invalid student ID.')
        return
      }
      setModalMode(mode)
      setSelectedStudent(student)

      if (mode === 'view') {
        return
      }

      if (mode === 'payment') {
        resetPaymentForm()
        return
      }

      resetTransportFeeForm()

      if (student.transportFee) {
        setTransportFeeValue('routeId', student.transportFee.routeId)
        setTransportFeeValue('pickUpPointId', student.transportFee.pickUpPointId)
        setTransportFeeValue('vehicleId', student.transportFee.vehicleId)
        setTransportFeeValue('startDate', student.transportFee.startDate)
        setTransportFeeValue('totalMonths', student.transportFee.totalMonths)
      } else {
        setTransportFeeValue('totalMonths', 1)
      }
    },
    [resetTransportFeeForm, resetPaymentForm, setTransportFeeValue],
  )

  const closeModal = useCallback(() => {
    setModalMode(null)
    setSelectedStudent(null)
    resetTransportFeeForm()
    resetPaymentForm()
    setCalculatedTotalFees('0')
    setCalculatedPending('0')
  }, [resetTransportFeeForm, resetPaymentForm])

  const handleSaveFees = async (data: TransportFeeModalForm) => {
    if (!selectedStudent) {
      toast.error('No student selected')
      return
    }

    const studentId = String(selectedStudent.id)
    if (!studentId || studentId === 'undefined' || studentId === 'null' || studentId === '') {
      toast.error('Invalid student ID.')
      return
    }

    if (!data.routeId) {
      toast.warning('Please select a route')
      return
    }

    if (!data.pickUpPointId) {
      toast.warning('Please select a pickup point')
      return
    }

    if (!data.startDate) {
      toast.warning('Please enter a start date')
      return
    }

    if (!data.totalMonths || data.totalMonths <= 0) {
      toast.warning('Total months must be greater than 0')
      return
    }

    const rpp = getRoutePickupPoint(data.routeId, data.pickUpPointId)
    if (!rpp) {
      toast.error('This route-pickup point combination is not configured.')
      return
    }

    setIsSaving(true)
    try {
      const paidAmount = selectedStudent.transportFee?.paid || '0'

      if (modalMode === 'add') {
        await studentTransportFeesService.create({
          studentId,
          routeId: data.routeId,
          pickUpPointId: data.pickUpPointId,
          paid: paidAmount,
          totalMonths: data.totalMonths,
          startDate: data.startDate,
        } as StudentTransportFeesFormData)
      } else {
        await studentTransportFeesService.updateFee(
          selectedStudent.transportFee!.studentTransportFeesId!,
          {
            newTotalMonths: data.totalMonths,
            routeId: data.routeId ? Number(data.routeId) : null,
            pickUpPointId: data.pickUpPointId ? Number(data.pickUpPointId) : null,
          } as UpdateStudentTransportFeeFormData,
        )
      }

      toast.success(
        `Transport fees ${modalMode === 'edit' ? 'updated' : 'added'} for ${selectedStudent.studentName} successfully!`,
      )

      const route = routesData?.find((r: any) => String(r.routeId || r.id) === data.routeId)
      const pickupPoint = pickupPointsData?.find(
        (pp: any) => String(pp.id || pp.pickUpPointId) === data.pickUpPointId,
      )
      const vehicle = vehiclesData?.find((v: any) => String(v.id || v.vehicleId) === data.vehicleId)

           const newFee: TransportFeeRowData = {
        studentTransportFeesId: selectedStudent.transportFee?.studentTransportFeesId ?? null,
        routeId: data.routeId,
        routeName: route?.routeTitle || route?.routeTitle || '',
        pickUpPointId: data.pickUpPointId,
        pickUpPointName: pickupPoint?.pickUpPointName || pickupPoint?.name || '',
        vehicleId: data.vehicleId,
        vehicleName: vehicle?.vehicleNumber || '',
        startDate: data.startDate,
        totalMonths: data.totalMonths,
        paid: selectedStudent.transportFee?.paid || '0',
        totalFees: String(parseFloat(calculatedTotalFees)),
        pendingFees: String(parseFloat(calculatedPending)),
      }

      setFilteredStudents((prev) =>
        prev.map((s) =>
          String(s.id) === studentId
            ? {
                ...s,
                transportFee: newFee,
                routeName: newFee.routeName,
                pickUpPointName: newFee.pickUpPointName,
                vehicleName: newFee.vehicleName,
                totalFees: newFee.totalFees,
                totalPaid: newFee.paid,
                totalPending: newFee.pendingFees,
                hasTransportFee: true,
              }
            : s,
        ),
      )
      closeModal()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to save transport fees',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePayment = async (data: PaymentModalForm) => {
    if (!selectedStudent?.transportFee?.studentTransportFeesId) {
      toast.error('No transport fee record found')
      return
    }

    const amount = parseFloat(data.paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.warning('Please enter a valid payment amount')
      return
    }

    const pending = parseFloat(selectedStudent.totalPending)
    if (amount > pending) {
      toast.warning(`Payment (₹${amount}) exceeds pending amount (₹${pending})`)
      return
    }

    setIsPaymentSaving(true)
    try {
      await studentTransportFeesService.updatePayment(
        selectedStudent.transportFee.studentTransportFeesId,
        { fee: amount } as UpdateTransportPaymentData,
      )
      toast.success(`Payment of ₹${amount} recorded for ${selectedStudent.studentName}`)

      const newPaid = String(parseFloat(selectedStudent.totalPaid) + amount)
      const newPending = String(Math.max(0, pending - amount))

      setFilteredStudents((prev) =>
        prev.map((s) =>
          String(s.id) === String(selectedStudent.id)
            ? {
                ...s,
                totalPaid: newPaid,
                totalPending: newPending,
                transportFee: s.transportFee
                  ? { ...s.transportFee, paid: newPaid, pendingFees: newPending }
                  : null,
              }
            : s,
        ),
      )
      closeModal()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to record payment')
    } finally {
      setIsPaymentSaving(false)
    }
  }

  const handleDeleteFees = async (studentId: string | number) => {
    const student = filteredStudents.find((s) => String(s.id) === String(studentId))
    if (!student?.hasTransportFee) {
      toast.warning('This student has no transport fees to delete')
      return
    }
    if (!student.transportFee?.studentTransportFeesId) {
      toast.error('Transport fee ID not found')
      return
    }
    if (!(await confirmToast('Do you want to remove transport fees for this student?'))) return

    try {
      await studentTransportFeesService.delete(student.transportFee.studentTransportFeesId)
      toast.success(`Transport fees removed for ${student.studentName}`)
      setFilteredStudents((prev) =>
        prev.map((s) =>
          String(s.id) === String(studentId)
            ? {
                ...s,
                transportFee: null,
                routeName: '—',
                pickUpPointName: '—',
                vehicleName: '—',
                totalFees: '0',
                totalPaid: '0',
                totalPending: '0',
                hasTransportFee: false,
              }
            : s,
        ),
      )
      setTableKey((k) => k + 1)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove transport fees')
    }
  }

  const paginatedStudents = useMemo(() => {
    const start = page * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))

  const columns = [
    { label: T.Admission_No, key: 'admissionNo' as keyof StudentTransportFeeRecord },
    { label: T.Student_Name, key: 'studentName' as keyof StudentTransportFeeRecord },
    { label: T.Roll_No, key: 'rollNo' as keyof StudentTransportFeeRecord },
    { label: 'Parent Name', key: 'parentName' as keyof StudentTransportFeeRecord },
    { label: 'Parent Phone', key: 'parentPhone' as keyof StudentTransportFeeRecord },
    { label: T.Class, key: 'class' as keyof StudentTransportFeeRecord },
    { label: T.Section, key: 'section' as keyof StudentTransportFeeRecord },
    { label: T.Route, key: 'routeName' as keyof StudentTransportFeeRecord },
    { label: T.Pickup_Point, key: 'pickUpPointName' as keyof StudentTransportFeeRecord },
    { label: T.Vehicle, key: 'vehicleName' as keyof StudentTransportFeeRecord },
    { label: T.Total_Fees, key: 'totalFees' as keyof StudentTransportFeeRecord },
    { label: T.Paid, key: 'totalPaid' as keyof StudentTransportFeeRecord },
    { label: T.Pending, key: 'totalPending' as keyof StudentTransportFeeRecord },
  ]

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      {/*  Search Form  */}

      <div className="p-4 bg-gray-50  rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{T.Add_Transport_Fees}</h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-2">
              {T.Search_students_to_assign_or_update_their_transport_fees}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <ExcelActions
              uploadEndpoint="/school-group/{schoolGroupCode}/school/{schoolCode}/student-transport-fees/add/xl-sheet"
              importMutation={uploadExcelMutation}
              downloadMutation={downloadTemplateMutation}
              importLabel={T.Import_Book_XL}
              downloadLabel={T.Download_XL_Template}
            />
          </div>
        </div>
      </div>
      <AllSchoolDropdown
        queryKeys={['routes', 'sections', 'schoolClasses']}
        onSubmit={handleSearchSubmit(onSearch)}
        className="rounded-lg p-4 bg-white mb-4 shadow-sm border border-gray-100"
      >
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Dropdown label={T.Class} name="classId" control={searchControl} options={classOptions} />
          <Dropdown
            label={T.Section}
            name="sectionId"
            control={searchControl}
            options={
              !selectedClassIdNum
                ? [{ label: T.Select_Class, value: '' }]
                : isLoadingSections
                  ? [{ label: T.Loading, value: '' }]
                  : sectionOptions.length === 0
                    ? [{ label: T.No_Sections_Available, value: '' }]
                    : sectionOptions
            }
          />
          <Dropdown label={T.Route} name="routeId" control={searchControl} options={routeOptions} />
          <TextField
            label={T.Name_Admission_No}
            name="search"
            control={searchControl}
            placeholder={T.Name_Admission_No}
          />
        </div>

        <div className="px-4 pb-4 flex justify-end gap-2">
          {hasSearched && (
            <Button
              name={T.Clear_Filters}
              icon={<IconField name="FaTimes" size={16} />}
              onClick={handleClearFilters}
              loading={false}
              showAlways={true}
            />
          )}
          <Button
            name={T.Search}
            icon={<IconField name="FaSearch" />}
            loading={isSearching}
            showAlways={true}
          />
        </div>
      </AllSchoolDropdown>

      {isSearching && (
        <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
          <IconField name="FaSpinner" size={14} className="animate-spin" />
          <span>{T.Searching_Students}</span>
        </div>
      )}

      {hasSearched && !isSearching && (
        <div className="mt-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-700">{T.Student_List}</h2>
            <span className="text-sm text-gray-500">
              {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
            </span>
          </div>
          <ControlledTable
            key={tableKey}
            columns={columns}
            data={paginatedStudents}
            fullData={filteredStudents}
            title={T.Student_Transport_Fees}
            btn={false}
            header={false}
            showSearch={false}
            showSelectAll={false}
            forceShowActions={true}
            enablePermissions={true}
            permissionScope="FEES"
            actionColumn={true}
            onAdd={(id: string | number) => {
              const s = filteredStudents.find((st) => String(st.id) === String(id))
              if (s) openModal('add', s)
            }}
            onEdit={(id: string | number) => {
              const s = filteredStudents.find((st) => String(st.id) === String(id))
              if (s) openModal('edit', s)
            }}
            onDelete={handleDeleteFees}
            onRowClick={(row: StudentTransportFeeRecord) => openModal('view', row)}
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
        </div>
      )}
      {modalMode === 'view' && selectedStudent && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    {T.View_Transport_Fees}
                  </span> 
                  <h2 className="text-xl font-bold text-gray-800 mt-2">
                    {selectedStudent.studentName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedStudent.class}
                    {selectedStudent.section ? ` — ${selectedStudent.section}` : ''}
                    &nbsp;|&nbsp; Roll: {selectedStudent.rollNo || 'N/A'} &nbsp;|&nbsp; Adm:{' '}
                    {selectedStudent.admissionNo}
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
                {!selectedStudent.transportFee ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm font-medium">{T.No_Transport_Fees_Assigned}</p>
                    <p className="text-xs mt-1">
                      {T.Click_Edit_Transport_FeesToAdd_Fees}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">{T.Total_Fees}</p>
                        <p className="text-xl font-bold text-blue-800">
                          ₹{selectedStudent.totalFees}
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                        <p className="text-xs text-green-600 font-medium mb-1">{T.Paid}</p>
                        <p className="text-xl font-bold text-green-800">
                          ₹{selectedStudent.totalPaid}
                        </p>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                        <p className="text-xs text-red-600 font-medium mb-1">{T.Pending}</p>
                        <p className="text-xl font-bold text-red-800">
                          ₹{selectedStudent.totalPending}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-600 mb-2">{T.Transport_Details}</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Route}</span>
                        <span className="text-gray-800 font-semibold">
                          {selectedStudent.transportFee.routeName || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Pickup_Point}</span>
                        <span className="text-gray-800 font-semibold">
                          {selectedStudent.transportFee.pickUpPointName || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Vehicle}</span>
                        <span className="text-gray-800 font-semibold">
                          {selectedStudent.transportFee.vehicleName || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Total_Months}</span>
                        <span className="text-gray-800 font-semibold">
                          {selectedStudent.transportFee.totalMonths}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Start_Date}</span>
                        <span className="text-gray-800 font-semibold">
                          {selectedStudent.transportFee.startDate || '—'}
                        </span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Total_Fees}</span>
                        <span className="text-blue-700 font-bold">
                          ₹{selectedStudent.transportFee.totalFees}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Paid}</span>
                        <span className="text-green-700 font-bold">
                          ₹{selectedStudent.transportFee.paid}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{T.Pending}</span>
                        <span className="text-red-600 font-bold">
                          ₹{selectedStudent.transportFee.pendingFees}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <Button name={T.Close} loading={false} onClick={closeModal} />
                <Button
                  name={T.Edit_Transport_Fees}
                  icon={<IconField name="FaEdit" />}
                  loading={false}
                  onClick={() => {
                    const s = selectedStudent!
                    closeModal()
                    setTimeout(() => openModal('edit', s), 50)
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {(modalMode === 'add' || modalMode === 'edit') && selectedStudent && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                      modalMode === 'edit'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {modalMode === 'edit' ? 'Edit Transport Fees' : 'Add Transport Fees'}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">
                    {selectedStudent.studentName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedStudent.class}
                    {selectedStudent.section ? ` — ${selectedStudent.section}` : ''}
                    &nbsp;|&nbsp; Roll: {selectedStudent.rollNo || 'N/A'} &nbsp;|&nbsp; Adm:{' '}
                    {selectedStudent.admissionNo}
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

              <AllSchoolDropdown
                onSubmit={handleTransportFeeSubmit(handleSaveFees)}
                queryKeys={['routes', 'pickupPoints', 'assignVehicles', 'vehicles']}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">{T.Transport_Assignment}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Dropdown
                        name="routeId"
                        label={T.Route}
                        required
                        control={transportFeeControl}
                        options={routeOptions}
                        onChange={(value) => handleRouteChange(String(value))}
                      />

                      <Dropdown
                        name="pickUpPointId"
                        label={T.Pickup_Point}
                        required
                        control={transportFeeControl}
                        options={pickupPointOptions}
                        disabled={!watchedModalRouteId}
                        onChange={(value) => handlePickupPointChange(String(value))}
                      />

                      <Dropdown
                        name="vehicleId"
                        label={T.Vehicle}
                        required
                        control={transportFeeControl}
                        options={vehicleOptions}
                        disabled={!watchedModalRouteId}
                      />

                      <DateField
                        name="startDate"
                        label={T.Start_Date}
                        type="date"
                        required
                        control={transportFeeControl}
                      />

                      <NumberField
                        name="totalMonths"
                        label={T.Total_Months}
                        control={transportFeeControl}
                        required
                        min={1}
                        max={12}
                        step={1}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">{T.Fee_Details}</p>
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {T.Total_Fees} (auto)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={calculatedTotalFees}
                              readOnly
                              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                          {watchedModalRouteId && watchedModalPickUpPointId && (
                            <p className="text-xs text-gray-400 mt-1">
                              {T.Monthly_fee_calculated_from_route_pickup_point_configuration}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {T.Pending} (auto)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={calculatedPending}
                              readOnly
                              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {watchedModalRouteId &&
                    watchedModalPickUpPointId &&
                    !getRoutePickupPoint(watchedModalRouteId, watchedModalPickUpPointId) && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                        {T.Route_pickup_point_not_configured}
                      </div>
                    )}
                </div>

                <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3 mt-6 -mx-6 -mb-6">
                  <Button
                    name="Cancel"
                    icon={<IconField name="FaTimes" size={16} />}
                    onClick={closeModal}
                    loading={false}
                    type="button"
                  />
                  <Button
                    name={
                      isSaving
                        ? T.Saving
                        : modalMode === 'edit'
                          ? T.Update
                          : T.Save
                    }
                    icon={<IconField name="FaSave" size={16} />}
                    loading={isSaving}
                    isDisable={
                      !watchedModalRouteId ||
                      !watchedModalPickUpPointId ||
                      !getRoutePickupPoint(watchedModalRouteId, watchedModalPickUpPointId) ||
                      isSaving
                    }
                    type="submit"
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </>
      )}

      {modalMode === 'payment' && selectedStudent && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    {T.Record_Payment}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">
                    {selectedStudent.studentName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedStudent.class}
                    {selectedStudent.section ? ` — ${selectedStudent.section}` : ''}
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

              <form
                onSubmit={handlePaymentSubmit(handleSavePayment)}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-600 font-medium mb-1">{T.Total_Fees}</p>
                      <p className="text-lg font-bold text-blue-800">
                        ₹{selectedStudent.totalFees}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-600 font-medium mb-1">{T.Paid}</p>
                      <p className="text-lg font-bold text-green-800">
                        ₹{selectedStudent.totalPaid}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                      <p className="text-xs text-red-600 font-medium mb-1">{T.Pending}</p>
                      <p className="text-lg font-bold text-red-800">
                        ₹{selectedStudent.totalPending}
                      </p>
                    </div>
                  </div>

                  <TextField
                    name="paymentAmount"
                    label={T.Payment_Amount}
                    type="number"
                    required
                    control={paymentControl}
                    placeholder={T.Enter_amount_to_pay}
                    step="0.01"
                    min="0.01"
                  />

                  <p className="text-xs text-gray-400">
                    {T.Max_payable}: ₹{selectedStudent.totalPending}
                  </p>
                </div>

                <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3 mt-6 -mx-6 -mb-6">
                  <Button
                    name={T.Cancel}
                    icon={<IconField name="FaTimes" size={16} />}
                    onClick={closeModal}
                    loading={false}
                    type="button"
                  />
                  <Button
                    name={isPaymentSaving ? T.Saving : T.Confirm_Payment}
                    icon={<IconField name="FaSave" size={16} />}
                    loading={isPaymentSaving}
                    type="submit"
                  />
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AddStudentTransportFees
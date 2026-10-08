import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useForm, type FieldValues, useWatch } from 'react-hook-form'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import TextAreaField from '../../../components/controlled/TextareaField'
import Dropdown from '../../../components/controlled/Dropdown'
import NumberField from '../../../components/controlled/NumberField'
import DateField from '../../../components/controlled/DateField'
import MobileField from '../../../components/controlled/MobileField'
import EmailField from '../../../components/controlled/EmailField'
import TextFields from '../../../components/controlled/TextField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import CheckboxField from '../../../components/controlled/CheckboxField'
import IFSCInputField from '../../../components/controlled/IFSCInputField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useUpdateStudentDocument,
  useImportStudentsFromExcel,
  useDownloadStudentTemplate,
  useUpdateStudentOtherDocument,
  useUpdateParentAadhaar,
} from '../../../hooks/queries/studentInformation/useStudents'
// import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSchoolClassesBySession } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useStudentCategories } from '../../../hooks/queries/studentInformation/useStudentCategories'
import { useStudentHouses } from '../../../hooks/queries/studentInformation/useStudentHouses'
import { useDisableReasons } from '../../../hooks/queries/studentInformation/useDisableReasons'
import { useFeeTypes } from '../../../hooks/queries/feesCollection/useFeeTypes'
import { useGetClassFees } from '../../../hooks/queries/feesCollection/useClassFees'
import { useSessions } from '../../../hooks/queries/systemSettinds/useSessionSetting'
import { AmountField, TextField } from '../../../components/controlled'
import { studentService } from '../../../services/studentInformation/studentService'

// Transport hooks
import { useRoutes } from '../../../hooks/queries/transport/useRoutes'
import { usePickupPoints } from '../../../hooks/queries/transport/usePickupPoints'
import { useVehicles } from '../../../hooks/queries/transport/useVehicles'
import { useRoutePickupPoints } from '../../../hooks/queries/transport/useRoutePickupPoints'
import { useCreateStudentTransportFees } from '../../../hooks/queries/transport/useStudentTransportFees'

// Hostel hooks
import { useHostels } from '../../../hooks/queries/hostel/useHostel'
import { useHostelRooms } from '../../../hooks/queries/hostel/useHostelRoom'
import { useRoomTypes } from '../../../hooks/queries/hostel/useRoomType'
import { useCheckBedAvailability } from '../../../hooks/queries/hostel/useHostelRoom'
import { useAddStudentHostelFee } from '../../../hooks/queries/hostel/Usestudenthostelfees'

import ExcelActions from '../../../components/uncontrolled/ExcelActions'

import React from 'react'
import { toast } from 'react-toastify'
import BirthDateField from '../../../components/controlled/BirthDateField'
import AadharField from '../../../components/controlled/AadharField'
import type { Department } from '../../../types/academics/departments'
import { useDepartmentsByClassId } from '../../../hooks/queries/academics/useDepartments'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { getPagesDataText } from '../../../helpers/useTranslations'

const getLocalDateInputValue = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const convertToDateInputFormat = (dateStr: string): string => {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }
  return ''
}

interface Sibling {
  siblingName: string
  siblingClassName: string
}

interface SSLCMark {
  subjectName: string
  maxMarks: string
  obtainMarks: string
}

function StudentAdmission() {
  useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // const { data: classesData } = useSchoolClasses()
  const { data: sessionsData } = useSessions()
  const downloadTemplateMutation = useDownloadStudentTemplate()
  const importStudents = useImportStudentsFromExcel()

  const { control, handleSubmit, reset, setValue, watch } = useForm<FieldValues>({
    defaultValues: {
      // IDs
      sessionId: '',
      rollNo: '',
      stsNumber: '',
      udiseNumber: '',
      grNumber: '',
      departmentId: '',
      // Basic
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dob: '',
      classId: '',
      sectionId: '',
      phoneNumber: '',
      email: '',
      aadhaarNumber: '',
      studentAadhaar: null,
      parentAadhaar: null,
      birthCertificate: null,
      // Location
      placeOfBirth: '',
      taluk: '',
      district: '',
      state: '',
      nationality: '',
      // Other basic
      fatherName: '',
      parentPhone: '',
      alternatePhoneNumber: '',
      studentCategoryId: '',
      religion: '',
      castName: '',
      admissionDate: getLocalDateInputValue(),
      photo: null,
      bloodGroup: '',
      studentHouseId: '',
      height: '',
      weight: '',
      measurementDate: '',
      uid: '',
      isDisabled: false,
      disableReasonId: '',
      currentAddress: '',
      permanentAddress: '',
      previousSchool: '',
      previousSchoolClass: '',
      rte: '',
      // Parent extra
      parentName: '',
      parentQualification: '',
      parentOccupation: '',
      parentAnnualIncome: '',
      parentIncomeCertificateNumber: '',
      parentNoOfDependents: '',
      parentAlternatePhoneNumber: '',
      parentEmail: '',
      parentDefaultParent: '',
      // Father / mother
      fatherPhone: '',
      fatherOccupation: '',
      motherName: '',
      motherPhone: '',
      motherOccupation: '',
      // Guardian
      guardianName: '',
      guardianRelation: '',
      guardianEmail: '',
      guardianPhone: '',
      guardianOccupation: '',
      guardianAddress: '',
      description: '',
      bankAccountNumber: '',
      bankName: '',
      ifscCode: '',
      nationalIdentification: '',
      localIdentification: '',
      note: '',
      documentTitle: '',
      document: null,
      parentType: 'parents',
      fees: {},
      // Transport
      hasTransport: false,
      routeId: '',
      pickupPointId: '',
      vehicleId: '',
      transportTotalFees: '',
      transportStartDate: '',
      transportTotalMonths: 1,
      transportPaid: 0,
      // Hostel
      hasHostel: false,
      hostelId: '',
      roomId: '',
      roomTypeId: '',
      hostelTotalFees: '',
      hostelStartDate: '',
      hostelTotalMonths: 1,
      hostelCostPerBed: '',
      // Siblings
      siblings: [{ siblingName: '', siblingClassName: '' }],
      // SSLC (college)
      sslcSchoolName: '',
      sslcRegistrationNo: '',
      sslcFirstLanguage: '',
      sslcSecondLanguage: '',
      sslcThirdLanguage: '',
      sslcPercentage: '',
      sslcResult: '',
      sslcMarks: [{ subjectName: '', maxMarks: '', obtainMarks: '' }],
    },
  })

  const selectedClassId = useWatch({ control, name: 'classId' })

  const { data: sectionsData, isLoading: isLoadingSections } = useSections(
    selectedClassId && Number(selectedClassId) > 0 ? Number(selectedClassId) : 0,
  )

  const selectedSessionId = useWatch({ control, name: 'sessionId' })
  const { data: classesData, isLoading: isLoadingClasses } = useSchoolClassesBySession(
    selectedSessionId ? String(selectedSessionId) : undefined,
  )

  // Department data — uses selectedClassId to filter
  const { data: departmentsData = [] } = useDepartmentsByClassId(
    selectedClassId ? Number(selectedClassId) : undefined,
  )

  const { data: categoriesData } = useStudentCategories()
  const { data: housesData } = useStudentHouses()
  const { data: disableReasonsData } = useDisableReasons()
  const { data: feeTypesData } = useFeeTypes()

  const { data: routesData = [] } = useRoutes()
  const { data: pickupPointsData = [] } = usePickupPoints()
  const { data: vehiclesData = [] } = useVehicles()
  const { data: routePickupPointsResponse } = useRoutePickupPoints()
  const routePickupPointsData = routePickupPointsResponse?.routePickupPoints || []
  const createTransportFeeMutation = useCreateStudentTransportFees()

  const { data: hostelsData } = useHostels()
  const { data: hostelRoomsResponse } = useHostelRooms()
  const hostelRoomsData = hostelRoomsResponse?.hostelRoom || []
  const { data: roomTypesData } = useRoomTypes()
  const addHostelFeeMutation = useAddStudentHostelFee()

  const [page] = useState(0)
  const [size] = useState(100)
  useStudents(page, size, 'asc')

  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()
  const updateStudentDocument = useUpdateStudentDocument()
  const updateStudentOtherDocument = useUpdateStudentOtherDocument()
  const updateParentAadhaar = useUpdateParentAadhaar()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showMoreDetails, setShowMoreDetails] = useState(false)
  const [showParentDetails, setShowParentDetails] = useState(false)
  const [showSSLC, setShowSSLC] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<string[]>([])
  const [, setCurrentStudentData] = useState<any>(null)
  const formTopRef = useRef<HTMLDivElement>(null)
  const [originalClassId, setOriginalClassId] = useState<string>('')
  const [existingDocuments, setExistingDocuments] = React.useState<{
    photo?: string | null
    studentAadhaar?: string | null
    fatherAdhaar?: string | null
    motherAdhaar?: string | null
    bankPassbook?: string | null
    transferCertificate?: string | null
    sslcHallTicket?: string | null
    sslcMarksSheet?: string | null
    migrationBonafide?: string | null
    birthCertificate?: string | null
    incomeCasteCertificate?: string | null
    document?: string | null
  }>({})

  const { data: classFees, isLoading: isLoadingClassFees } = useGetClassFees(
    {
      feeTypeIds: selectedFeeTypes.map((id) => parseInt(id, 10)),
      schoolClassId: selectedClassId ? parseInt(selectedClassId, 10) : 0,
    },
    selectedClassId !== '' && selectedFeeTypes.length > 0,
  )

  const [, setSectionsLoaded] = useState(false)
  const formSiblings = useWatch({ control, name: 'siblings' }) || []
  const sslcMarks = useWatch({ control, name: 'sslcMarks' }) || []
  const isDisabled = useWatch({ control, name: 'isDisabled' })
  const hasTransport = useWatch({ control, name: 'hasTransport' })
  const hasHostel = useWatch({ control, name: 'hasHostel' })
  const feesData = watch('fees')

  const selectedRouteId = useWatch({ control, name: 'routeId' })
  const selectedHostelId = useWatch({ control, name: 'hostelId' })
  const selectedPickupPointId = useWatch({ control, name: 'pickupPointId' })
  const selectedRoomId = useWatch({ control, name: 'roomId' })
  const hostelTotalMonths = useWatch({ control, name: 'hostelTotalMonths' })
  const hostelStartDate = useWatch({ control, name: 'hostelStartDate' })
  const hostelCostPerBed = useWatch({ control, name: 'hostelCostPerBed' })

  const excludeStudentId = editingId ? editingId : undefined
  const { data: bedAvailability, isFetching: isCheckingBeds } = useCheckBedAvailability(
    hasHostel && selectedHostelId ? selectedHostelId : undefined,
    hasHostel && selectedRoomId ? selectedRoomId : undefined,
    hasHostel && hostelStartDate ? hostelStartDate : undefined,
    hasHostel && hostelTotalMonths ? Number(hostelTotalMonths) : undefined,
    excludeStudentId,
  )

  const [classFeesDataForSubmit, setClassFeesDataForSubmit] = useState<any[]>([])
  const [classChanged, setClassChanged] = useState(false)

  const type = localStorage.getItem('type') || ''

  // ─── effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!editingId) {
      setValue('classId', '')
      setValue('departmentId', '')
      setValue('sectionId', '')
    }
  }, [selectedSessionId, editingId, setValue])

  useEffect(() => {
    if (sessionsData && sessionsData.length > 0 && !editingId) {
      const current = sessionsData.find(
        (s: any) => s.isCurrent || s.isActive || s.status === 'Active',
      )
      const target = current || sessionsData[0]
      setValue('sessionId', String(target.sessionId || target.id))
    }
  }, [sessionsData, editingId, setValue])

  useEffect(() => {
    if (classFees && Array.isArray(classFees)) setClassFeesDataForSubmit(classFees)
  }, [classFees])

  useEffect(() => {
    if (editingId && selectedClassId && selectedClassId !== originalClassId) {
      setSelectedFeeTypes([])
      setValue('fees', {})
      setClassChanged(true)
      setTimeout(() => {
        toast.error('Class changed. All fees reset. Please select fee types again.')
      }, 100)
    }
  }, [selectedClassId, editingId, setValue, originalClassId])

  useEffect(() => {
    if (
      classFees &&
      Array.isArray(classFees) &&
      classFees.length > 0 &&
      selectedFeeTypes.length > 0
    ) {
      let shouldUpdate = false
      const updates: { [key: string]: any } = {}
      classFees.forEach((classFee: any) => {
        const feeTypeId = String(classFee.feesTypeId)
        if (selectedFeeTypes.includes(feeTypeId)) {
          const currentTotal = feesData?.[feeTypeId]?.totalFees
          const shouldAuto =
            !editingId ||
            classChanged ||
            !currentTotal ||
            currentTotal === '' ||
            currentTotal === '0'
          if (shouldAuto) {
            const feeAmount = String(classFee.fee || 0)
            const classFeesId = String(classFee.classFeesId)
            const paidAmount = editingId && classChanged ? '0' : feesData?.[feeTypeId]?.paid || '0'
            updates[`fees.${feeTypeId}.totalFees`] = feeAmount
            updates[`fees.${feeTypeId}.paid`] = paidAmount
            updates[`fees.${feeTypeId}.pending`] = feeAmount
            updates[`fees.${feeTypeId}.classFeesId`] = classFeesId
            shouldUpdate = true
          }
        }
      })
      if (shouldUpdate) {
        setTimeout(() => {
          Object.entries(updates).forEach(([key, value]) => {
            setValue(key as any, value, { shouldValidate: false, shouldDirty: false })
          })
          if (classChanged) setClassChanged(false)
        }, 0)
      }
    }
  }, [classFees, selectedFeeTypes, editingId, feesData, setValue, classChanged])

  useEffect(() => {
    if (sectionsData && sectionsData.length > 0) setSectionsLoaded(true)
    else if (selectedClassId && !isLoadingSections && sectionsData) setSectionsLoaded(true)
  }, [sectionsData, selectedClassId, isLoadingSections])

  useEffect(() => {
    if (selectedClassId && !editingId) {
      setValue('sectionId', '')
      setSectionsLoaded(false)
    }
  }, [selectedClassId, editingId, setValue])

  useEffect(() => {
    let isMounted = true
    const fetchTransportFees = async () => {
      if (hasTransport && selectedRouteId && selectedPickupPointId) {
        const rpp = routePickupPointsData.find(
          (r: any) =>
            String(r.routeId) === String(selectedRouteId) &&
            String(r.pickupPointId || r.pickUpPointId) === String(selectedPickupPointId),
        )
        if (isMounted) setValue('transportTotalFees', rpp?.totalFees || '')
      } else if (isMounted) setValue('transportTotalFees', '')
    }
    fetchTransportFees()
    return () => {
      isMounted = false
    }
  }, [hasTransport, selectedRouteId, selectedPickupPointId, routePickupPointsData, setValue])

  useEffect(() => {
    if (selectedRouteId && selectedPickupPointId && pickupPointsData && routePickupPointsData) {
      const valid = routePickupPointsData.some(
        (r: any) =>
          String(r.routeId) === String(selectedRouteId) &&
          String(r.pickupPointId || r.pickUpPointId) === String(selectedPickupPointId),
      )
      if (!valid && !editingId) setValue('pickupPointId', '')
    }
  }, [
    selectedRouteId,
    selectedPickupPointId,
    pickupPointsData,
    routePickupPointsData,
    setValue,
    editingId,
  ])

  useEffect(() => {
    if (hasHostel && selectedRoomId) {
      const room = hostelRoomsData.find(
        (r: any) => String(r.id || r.hostelRoomId) === String(selectedRoomId),
      )
      if (room) {
        const cost = room.costPerBed ? parseFloat(room.costPerBed) : 0
        setValue('hostelCostPerBed', cost.toString())
        const rt = roomTypesData?.find(
          (t: any) => String(t.id || t.roomTypeId) === String(room.roomTypeId),
        )
        setValue('roomTypeId', rt ? rt.roomType || rt.name || '' : '')
      } else {
        setValue('hostelCostPerBed', '')
        setValue('roomTypeId', '')
      }
    }
  }, [hasHostel, selectedRoomId, hostelRoomsData, roomTypesData, setValue])

  useEffect(() => {
    if (hasHostel) {
      const cost = parseFloat(hostelCostPerBed)
      const months = Number(hostelTotalMonths)
      if (!isNaN(cost) && !isNaN(months) && cost > 0 && months > 0) {
        setValue('hostelTotalFees', (cost * months).toFixed(2))
      } else {
        setValue('hostelTotalFees', '0.00')
      }
    }
  }, [hasHostel, hostelCostPerBed, hostelTotalMonths, setValue])

  useEffect(() => {
    if (
      bedAvailability &&
      !bedAvailability.available &&
      !editingId &&
      hasHostel &&
      selectedRoomId
    ) {
      setTimeout(() => {
        toast.error(`${bedAvailability.message}\n\nPlease select a different room.`)
      }, 100)
    }
  }, [bedAvailability, editingId, hasHostel, selectedRoomId])

  useEffect(() => {
    if (successMessage && formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const t = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(''), 8000)
      return () => clearTimeout(t)
    }
  }, [errorMessage])

  useEffect(() => {
    if (selectedFeeTypes.length > 0) {
      const updates: { key: string; value: string }[] = []
      selectedFeeTypes.forEach((feeTypeId) => {
        const totalFees = feesData?.[feeTypeId]?.totalFees
        const paid = feesData?.[feeTypeId]?.paid
        if (totalFees && paid) {
          const newPending = (parseFloat(totalFees) - parseFloat(paid)).toFixed(2)
          if (feesData?.[feeTypeId]?.pending !== newPending)
            updates.push({ key: `fees.${feeTypeId}.pending`, value: newPending })
        } else if (totalFees) {
          if (feesData?.[feeTypeId]?.pending !== totalFees)
            updates.push({ key: `fees.${feeTypeId}.pending`, value: totalFees })
        }
      })
      if (updates.length > 0) {
        setTimeout(() => {
          updates.forEach(({ key, value }) =>
            setValue(key as any, value, { shouldValidate: false, shouldDirty: false }),
          )
        }, 0)
      }
    }
  }, [feesData, selectedFeeTypes, setValue])

  useEffect(() => {
    const load = async () => {
      if (id) {
        setEditingId(id)
        const fromState = location.state?.student
        if (fromState) {
          setCurrentStudentData(fromState)
          setExistingDocuments({
            photo: fromState.photo || null,
            studentAadhaar: fromState.aadhaarFile || null,
            fatherAdhaar: fromState.fatherAdhaar || null,
            motherAdhaar: fromState.motherAdhaar || null,
            bankPassbook: fromState.bankPassbookFile || null,
            transferCertificate: fromState.transferCertificate || null,
            sslcHallTicket: fromState.sslcHallTicket || null,
            sslcMarksSheet: fromState.sslcMarksSheetFile || null,
            migrationBonafide: fromState.migrationBonafile || null,
            incomeCasteCertificate: fromState.incomeCasteCertificate || null,
            birthCertificate: fromState.birthCertificateFile || null,
          })
          populateFormData(fromState)
        } else {
          try {
            const studentData = await studentService.getById(id)
            if (studentData) {
              setCurrentStudentData(studentData)
              setExistingDocuments({
                photo: studentData.photo || null,
                studentAadhaar: (studentData as any).aadhaarFile || null,
                birthCertificate: (studentData as any).birthCertificateFile || null,
                motherAdhaar: (studentData as any).motherAadhaarFile || null,
                fatherAdhaar: (studentData as any).fatherAadhaarFile || null,
                bankPassbook: (studentData as any).bankPassbookFile || null,
                transferCertificate: (studentData as any).transferCertificateFile || null,
                migrationBonafide: (studentData as any).migrationBonafideFile || null,
                incomeCasteCertificate: (studentData as any).incomeCasteCertificateFile || null,
                document: (studentData as any).document || null,
                sslcHallTicket: (studentData as any).sslcHallTicket || null,
                sslcMarksSheet: (studentData as any).sslcMarksSheet || null,
              })
              populateFormData(studentData)
            }
          } catch (e) {
            console.error('Error fetching student:', e)
          }
        }
      } else {
        setEditingId(null)
        resetForm()
      }
    }
    load()
  }, [id, location.state])

  const filteredPickupPoints = useMemo(() => {
    if (!pickupPointsData || !routePickupPointsData) return []
    if (!selectedRouteId) return pickupPointsData
    const ids = routePickupPointsData
      .filter((r: any) => String(r.routeId) === String(selectedRouteId))
      .map((r: any) => String(r.pickupPointId || r.pickUpPointId))
    const filtered = pickupPointsData.filter((pp: any) =>
      ids.includes(String(pp.id || pp.pickUpPointId)),
    )
    if (selectedPickupPointId) {
      const alreadyIn = filtered.some(
        (pp: any) => String(pp.id || pp.pickUpPointId) === String(selectedPickupPointId),
      )
      if (!alreadyIn) {
        const kept = pickupPointsData.find(
          (pp: any) => String(pp.id || pp.pickUpPointId) === String(selectedPickupPointId),
        )
        if (kept) filtered.push(kept)
      }
    }
    return filtered
  }, [selectedRouteId, selectedPickupPointId, pickupPointsData, routePickupPointsData])

  const filteredRooms = useMemo(() => {
    if (!hostelRoomsData || hostelRoomsData.length === 0) return []
    if (!selectedHostelId) return hostelRoomsData
    const filtered = hostelRoomsData.filter(
      (r: any) => String(r.hostelId) === String(selectedHostelId),
    )
    if (selectedRoomId) {
      const alreadyIn = filtered.some(
        (r: any) => String(r.id || r.hostelRoomId) === String(selectedRoomId),
      )
      if (!alreadyIn) {
        const kept = hostelRoomsData.find(
          (r: any) => String(r.id || r.hostelRoomId) === String(selectedRoomId),
        )
        if (kept) filtered.push(kept)
      }
    }
    return filtered
  }, [selectedHostelId, selectedRoomId, hostelRoomsData])

  // ─── handlers ─────────────────────────────────────────────────────────────

  const handleFeeTypeToggle = (feeTypeId: string) => {
    setSelectedFeeTypes((prev) => {
      if (prev.includes(feeTypeId)) {
        const newFees = { ...feesData }
        delete newFees[feeTypeId]
        setValue('fees', newFees)
        return prev.filter((id) => id !== feeTypeId)
      } else {
        const currentFees = { ...feesData }
        let classFeesId = ''
        let feeAmount = ''
        if (classFees && Array.isArray(classFees)) {
          const cf = classFees.find((c: any) => String(c.feesTypeId) === feeTypeId)
          if (cf) {
            classFeesId = cf.classFeesId ? String(cf.classFeesId) : ''
            feeAmount = cf.fee ? String(cf.fee) : ''
          }
        }
        const existing = feesData?.[feeTypeId]
        if (editingId && existing && !classChanged) {
          currentFees[feeTypeId] = existing
        } else {
          currentFees[feeTypeId] = {
            totalFees: feeAmount || '',
            paid: editingId && classChanged ? '0' : existing?.paid || '0',
            pending: feeAmount || '0',
            classFeesId,
            feesId: existing?.feesId || '',
          }
        }
        setValue('fees', currentFees)
        return [...prev, feeTypeId]
      }
    })
  }

  const handleAddSibling = useCallback(() => {
    setValue('siblings', [...formSiblings, { siblingName: '', siblingClassName: '' }])
  }, [formSiblings, setValue])

  const handleRemoveSibling = useCallback(
    (index: number) => {
      if (formSiblings.length > 1) {
        setValue(
          'siblings',
          formSiblings.filter((_: any, i: number) => i !== index),
        )
      }
    },
    [formSiblings, setValue],
  )

  const handleAddSSLCMark = useCallback(() => {
    setValue('sslcMarks', [...sslcMarks, { subjectName: '', maxMarks: '', obtainMarks: '' }])
  }, [sslcMarks, setValue])

  const handleRemoveSSLCMark = useCallback(
    (index: number) => {
      if (sslcMarks.length > 1) {
        setValue(
          'sslcMarks',
          sslcMarks.filter((_: any, i: number) => i !== index),
        )
      }
    },
    [sslcMarks, setValue],
  )

  // ─── populate form ────────────────────────────────────────────────────────

  const populateFormData = (student: any) => {
    console.log('Populating form data for student:', student)
    reset()
    setClassChanged(false)

    // ── Session ────────────────────────────────────────────────────────────
    const safeSessions = sessionsData || []
    let sessionIdToSet = ''

    if (student.sessionId) {
      sessionIdToSet = String(student.sessionId)
    } else if (student.session && safeSessions.length > 0) {
      const match = safeSessions.find(
        (s: any) =>
          String(s.session) === String(student.session) ||
          String(s.sessionName) === String(student.session),
      )
      if (match) sessionIdToSet = String(match.sessionId || match.id)
    }

    setValue('sessionId', sessionIdToSet || '')
    setValue('startSession', student.startSession || student.session || '') // ← ADDED

    // ── Identifiers ────────────────────────────────────────────────────────
    setValue('stsNumber', student.stsNumber || '')
    setValue('grNumber', student.grNumber || '')
    setValue('rollNo', student.rollNo || '')
    setValue('udiseNumber', student.udiseNumber || '')
    // ── Name ──────────────────────────────────────────────────────────────
    setValue('firstName', student.firstName || '')
    setValue('middleName', student.middleName || '')
    setValue('lastName', student.lastName || '')

    // ── Personal ──────────────────────────────────────────────────────────
    setValue('gender', student.gender || '')
    setValue('dob', convertToDateInputFormat(student.dob))
    setValue('admissionDate', convertToDateInputFormat(student.admissionDate))
    setValue('measurementDate', convertToDateInputFormat(student.measurementDate))
    setValue('aadhaarNumber', student.aadhaarNumber || '')
    setValue('bloodGroup', student.bloodGroup || '')
    setValue('height', student.height || '')
    setValue('weight', student.weight || '')
    setValue('uid', student.aadhaarNumber || student.uid || '') // aadhaarNumber is the uid
    setValue('rte', student.rte || '')
    setValue('religion', student.religion || '')
    setValue('castName', student.castName || '')

    // ── Class / Section / Department ──────────────────────────────────────
    let classIdToSet = ''
    if (student.classId) {
      classIdToSet = String(student.classId)
      setOriginalClassId(String(student.classId))
    } else if (student.className && classesData) {
      const cm = classesData.find(
        (c: any) => c.name === student.className || c.className === student.className,
      )
      if (cm) {
        classIdToSet = String(cm.id || cm.schoolClassId)
        setOriginalClassId(classIdToSet)
      }
    }
    if (classIdToSet) {
      setValue('classId', classIdToSet)
      if (student.sectionId) setValue('sectionId', String(student.sectionId))
      if (student.departmentId) setValue('departmentId', String(student.departmentId))
    }

    // ── Category / House ──────────────────────────────────────────────────
    setValue(
      'studentCategoryId',
      student.studentCategoryId ? String(student.studentCategoryId) : '',
    )
    setValue('studentHouseId', student.studentHouseId ? String(student.studentHouseId) : '')

    // ── Contact ───────────────────────────────────────────────────────────
    setValue('phoneNumber', student.phoneNumber || '')
    setValue('email', student.email || '')

    // ── Location ──────────────────────────────────────────────────────────
    setValue('placeOfBirth', student.placeOfBirth || '')
    setValue('taluk', student.taluk || '')
    setValue('district', student.district || '')
    setValue('state', student.state || '')
    setValue('nationality', student.nationality || '')

    // ── Disability ────────────────────────────────────────────────────────
    const disabled =
      student.disableReasonId != null &&
      student.disableReasonId !== '' &&
      student.disableReasonId !== '0'
    setValue('isDisabled', disabled)
    setValue('disableReasonId', disabled ? String(student.disableReasonId) : '')

    // ── Address / School ──────────────────────────────────────────────────
    setValue('currentAddress', student.currentAddress || '')
    setValue('permanentAddress', student.permanentAddress || '')
    setValue('previousSchool', student.previousSchool || '')
    setValue('previousSchoolClass', student.previousSchoolClass || '')

    // ── Parent core ───────────────────────────────────────────────────────
    setValue('fatherName', student.fatherName || '')
    setValue('motherName', student.motherName || '')
    setValue('parentPhone', student.parentPhone || '') // backend phoneNumber → parentPhone
    setValue('alternatePhoneNumber', student.parentAlternatePhoneNumber || '')

    // ── Parent extra ──────────────────────────────────────────────────────
    setValue('parentName', student.parentName || '')
    setValue('parentQualification', student.parentQualification || '')
    setValue('parentOccupation', student.parentOccupation || '')
    setValue('parentAnnualIncome', student.parentAnnualIncome || '')
    setValue('parentIncomeCertificateNumber', student.parentIncomeCertificateNumber || '')
    setValue('parentNoOfDependents', student.parentNoOfDependents || '')
    setValue('parentAlternatePhoneNumber', student.parentAlternatePhoneNumber || '')
    setValue('parentEmail', student.parentEmail || '')
    setValue('parentDefaultParent', student.parentDefaultParent || '')

    // ── Father / Mother ───────────────────────────────────────────────────
    setValue('fatherPhone', student.fatherPhone || '')
    setValue('fatherOccupation', student.fatherOccupation || '')
    setValue('motherPhone', student.motherPhone || '')
    setValue('motherOccupation', student.motherOccupation || '')

    // ── Guardian ──────────────────────────────────────────────────────────
    setValue('guardianName', student.guardianName || '')
    setValue('guardianRelation', student.guardianRelation || '')
    setValue('guardianEmail', student.guardianEmail || '')
    setValue('guardianPhone', student.guardianPhone || '')
    setValue('guardianOccupation', student.guardianOccupation || '')
    setValue('guardianAddress', student.guardianAddress || '')
    setValue('parentType', student.guardianName || student.guardianPhone ? 'guardian' : 'parents')

    // ── Siblings ──────────────────────────────────────────────────────────
    // FIXED: use siblingsList to match transformToDTO which reads data.siblingsList
    if (student.siblingsList?.length > 0) {
      const mappedSiblings = student.siblingsList.map((s: any) => ({
        siblingName: s.siblingName || '',
        siblingClassName: s.siblingClassName || '', // matches SiblingsDto.siblingClassName
      }))
      setValue('siblingsList', mappedSiblings) // ← was 'siblings', now 'siblingsList'
    } else {
      setValue('siblingsList', [{ siblingName: '', siblingClassName: '' }])
    }

    // ── Transport ─────────────────────────────────────────────────────────
    const tRouteId = student.transport?.routeId || student.routeId
    const tPickup = student.transport?.pickupPointId || student.pickupPointId
    const tVehicle = student.transport?.vehicleId || student.vehicleId
    if (tRouteId || tPickup || tVehicle) {
      setValue('hasTransport', true)
      setValue('routeId', tRouteId ? String(tRouteId) : '')
      setValue('pickupPointId', tPickup ? String(tPickup) : '')
      setValue('vehicleId', tVehicle ? String(tVehicle) : '')
      setValue(
        'transportTotalFees',
        student.transport?.totalFees || student.transportTotalFees || '',
      )
      setValue('transportStartDate', convertToDateInputFormat(student.transport?.startDate || ''))
      setValue('transportTotalMonths', student.transport?.totalMonths || 1)
      setValue('transportPaid', 0)
    }

    // ── Hostel ────────────────────────────────────────────────────────────
    const hId = student.hostel?.hostelId || student.hostelId
    const hRoom = student.hostel?.roomId || student.roomId
    const hType = student.hostel?.roomTypeId || student.roomTypeId
    if (hId || hRoom || hType) {
      setValue('hasHostel', true)
      setValue('hostelId', hId ? String(hId) : '')
      setValue('roomId', hRoom ? String(hRoom) : '')
      setValue('roomTypeId', hType ? String(hType) : '')
      setValue('hostelTotalFees', student.hostel?.totalFees || '')
      setValue('hostelStartDate', convertToDateInputFormat(student.hostel?.startDate || ''))
      setValue('hostelTotalMonths', student.hostel?.totalMonths || 1)
      setValue('hostelCostPerBed', student.hostel?.costPerBed || '')
    }

    // ── Fees ──────────────────────────────────────────────────────────────
    // FIXED: populate both feesList (array) and fees (object) so transformToDTO
    // picks up feesList first and falls back to fees object correctly
    if (student.feesList?.length > 0) {
      const feesObject: any = {}
      const selectedTypes: string[] = []
      const feesArray: any[] = []

      student.feesList.forEach((fee: any) => {
        const ftId = fee.feeTypeId
          ? String(fee.feeTypeId)
          : fee.feeType?.feeTypeId
            ? String(fee.feeType.feeTypeId)
            : null
        if (ftId) {
          selectedTypes.push(ftId)
          feesObject[ftId] = {
            totalFees: fee.totalFees || '0',
            paid: fee.paid || '0',
            pending: fee.pending || '0',
            classFeesId: fee.classFeesId ? String(fee.classFeesId) : '',
            feesId: fee.feesId ? String(fee.feesId) : '',
          }
          feesArray.push({
            feesId: fee.feesId ? String(fee.feesId) : '',
            feeTypeId: ftId,
            feeTypeName: fee.feeTypeName || '',
            totalFees: fee.totalFees || '0',
            paid: fee.paid || '0',
            pending: fee.pending || '0',
            classFeesId: fee.classFeesId ? String(fee.classFeesId) : '',
          })
        }
      })

      setSelectedFeeTypes(selectedTypes)
      setValue('fees', feesObject)
      setValue('feesList', feesArray) // ← ADDED so transformToDTO finds feesList first
    } else {
      setSelectedFeeTypes([])
      setValue('fees', {})
      setValue('feesList', [])
    }

    // ── SSLC ──────────────────────────────────────────────────────────────
    if (student.sslcData) {
      setValue('sslcSchoolName', student.sslcData.schoolNameWithAddress || '')
      setValue('sslcRegistrationNo', student.sslcData.registrationNo || '')
      setValue('sslcFirstLanguage', student.sslcData.firstLanguage || '')
      setValue('sslcSecondLanguage', student.sslcData.secondLanguage || '')
      setValue('sslcThirdLanguage', student.sslcData.thirdLanguage || '')
      setValue('sslcPercentage', student.sslcData.percentage || '')
      setValue('sslcResult', student.sslcData.result || '')
      if (student.sslcData.marksList?.length > 0) {
        setValue('sslcMarks', student.sslcData.marksList)
        setShowSSLC(true)
      }
    }

    // ── Extra / Bank / Docs ───────────────────────────────────────────────
    setValue('description', student.description || '')
    setValue('bankAccountNumber', student.bankAccountNumber || '')
    setValue('bankName', student.bankName || '')
    setValue('ifscCode', student.ifscCode || '')
    setValue('nationalIdentification', student.nationalIdentification || '')
    setValue('localIdentification', student.localIdentification || '')
    setValue('note', student.note || '')
    setValue('documentTitle', student.documentTitle || '')

    if (
      student.bankAccountNumber ||
      student.nationalIdentification ||
      student.previousSchool ||
      student.description ||
      student.rte ||
      student.note ||
      student.documentTitle
    )
      setShowMoreDetails(true)
  }

  // ─── submit ───────────────────────────────────────────────────────────────

  const onSubmit = async (data: FieldValues) => {
    console.log('Form data to submit:', data)
    try {
      setErrorMessage('')
      setSuccessMessage('')

      const selectedSession = sessionsData?.find(
        (s: any) => String(s.sessionId || s.id) === String(data.sessionId),
      )
      const sessionName = selectedSession?.session || selectedSession?.sessionName
      const sessionId = data.sessionId ? parseInt(data.sessionId, 10) : undefined

      const feesList = selectedFeeTypes
        .map((feeTypeId) => {
          const feeData = data.fees?.[feeTypeId] || {}
          const feeTypeIdNum = parseInt(feeTypeId, 10)
          const classFeesIdNum = feeData?.classFeesId ? parseInt(feeData.classFeesId, 10) : null
          const feesIdNum = feeData?.feesId ? parseInt(feeData.feesId, 10) : null
          return {
            feeTypeId: feeTypeIdNum,
            totalFees: feeData?.totalFees || '0',
            paid: feeData?.paid || '0',
            pending: feeData?.pending || '0',
            classFeesId:
              classFeesIdNum !== null && !isNaN(classFeesIdNum) ? classFeesIdNum : undefined,
            feesId: feesIdNum !== null && !isNaN(feesIdNum) ? feesIdNum : undefined,
          }
        })
        .filter((fee) => fee.totalFees && fee.totalFees !== '0')

      // Siblings — map siblingClassName to className for API
      const validSiblings = (data.siblings || [])
        .filter((s: Sibling) => s.siblingName?.trim() !== '' || s.siblingClassName?.trim() !== '')
        .map((s: Sibling) => ({ siblingName: s.siblingName, className: s.siblingClassName }))

      // Build SSLC data if filled
      const sslcData =
        showSSLC && data.sslcSchoolName
          ? {
              schoolNameWithAddress: data.sslcSchoolName,
              registrationNo: data.sslcRegistrationNo || '',
              firstLanguage: data.sslcFirstLanguage || '',
              secondLanguage: data.sslcSecondLanguage || '',
              thirdLanguage: data.sslcThirdLanguage || '',
              percentage: data.sslcPercentage || '',
              result: data.sslcResult || '',
              marksList: (data.sslcMarks || []).filter(
                (m: SSLCMark) => m.subjectName?.trim() !== '',
              ),
            }
          : undefined

      const payload: any = {
        session: sessionName,
        sessionId,
        startSession: sessionName,
        stsNumber: data.stsNumber || undefined,
        grNumber: data.grNumber || undefined,
        udiseNumber: data.udiseNumber || undefined,
        rollNo: data.rollNo,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gender: data.gender,
        dob: data.dob,
        classId: data.classId,
        sectionId: data.sectionId,
        departmentId: data.departmentId || undefined,
        aadhaarNumber: data.aadhaarNumber || undefined,
        studentCategoryId: data.studentCategoryId || undefined,
        studentHouseId: data.studentHouseId || undefined,
        religion: data.religion || undefined,
        castName: data.castName || undefined,
        phoneNumber: data.phoneNumber,
        email: data.email,
        admissionDate: data.admissionDate || undefined,
        bloodGroup: data.bloodGroup || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        measurementDate: data.measurementDate || undefined,
        // location
        placeOfBirth: data.placeOfBirth || undefined,
        taluk: data.taluk || undefined,
        district: data.district || undefined,
        state: data.state || undefined,
        nationality: data.nationality || undefined,
        // address
        currentAddress: data.currentAddress || undefined,
        permanentAddress: data.permanentAddress || undefined,
        previousSchool: data.previousSchool || undefined,
        previousSchoolClass: data.previousSchoolClass || undefined,
        uid: data.uid || undefined,
        isDisabled: Boolean(data.isDisabled),
        disableReasonId: data.isDisabled && data.disableReasonId ? data.disableReasonId : undefined,
        description: data.description || undefined,
        nationalIdentification: data.nationalIdentification || undefined,
        localIdentification: data.localIdentification || undefined,
        rte: data.rte || undefined,
        note: data.note || undefined,
        documentTitle: data.documentTitle || undefined,
        document: data.document,
        feesList: feesList.length > 0 ? feesList : undefined,
        siblingsList: validSiblings.length > 0 ? validSiblings : undefined,
        fatherName: data.fatherName,
        parentPhone: data.parentPhone,
        alternatePhoneNumber: data.alternatePhoneNumber || undefined,
        parentType: data.parentType || 'parents',
        sslcData,
      }

      const parentData: any = {
        parentPhone: data.parentPhone,
        alternatePhoneNumber: data.alternatePhoneNumber || undefined,
        fatherName: data.fatherName,
        name: data.parentName || undefined,
        qualification: data.parentQualification || undefined,
        occupation: data.parentOccupation || undefined,
        annualIncome: data.parentAnnualIncome || undefined,
        incomeCertificateNumber: data.parentIncomeCertificateNumber || undefined,
        noOfDependents: data.parentNoOfDependents || undefined,

        email: data.parentEmail || undefined,
        defaultParent: data.parentDefaultParent || undefined,
      }

      if (data.parentType === 'parents') {
        if (data.fatherOccupation) parentData.fatherOccupation = data.fatherOccupation
        if (data.fatherPhone) parentData.fatherPhone = data.fatherPhone
        if (data.motherName) parentData.motherName = data.motherName
        if (data.motherOccupation) parentData.motherOccupation = data.motherOccupation
        if (data.motherPhone) parentData.motherPhone = data.motherPhone
      } else {
        if (data.guardianName) parentData.guardianName = data.guardianName
        if (data.guardianRelation) parentData.guardianRelation = data.guardianRelation
        if (data.guardianEmail) parentData.guardianEmail = data.guardianEmail
        if (data.guardianPhone) parentData.guardianPhone = data.guardianPhone
        if (data.guardianOccupation) parentData.guardianOccupation = data.guardianOccupation
        if (data.guardianAddress) parentData.guardianAddress = data.guardianAddress
      }
      payload.parent = parentData

      if (data.bankAccountNumber || data.bankName || data.ifscCode) {
        payload.bankDetails = {
          bankAccountNumber: data.bankAccountNumber || undefined,
          bankName: data.bankName || undefined,
          ifscCode: data.ifscCode || undefined,
        }
      }

      const photo = data.photo instanceof FileList ? data.photo[0] : data.photo
      const studentAadhaar =
        data.studentAadhaar instanceof FileList ? data.studentAadhaar[0] : data.studentAadhaar
      const fatherAadhaar =
        data.fatherAadhaar instanceof FileList ? data.fatherAadhaar[0] : data.fatherAadhaar
      const motherAadhaar =
        data.motherAadhaar instanceof FileList ? data.motherAadhaar[0] : data.motherAadhaar
      const bankPassbook =
        data.bankPassbook instanceof FileList ? data.bankPassbook[0] : data.bankPassbook
      const sslcHallTicket =
        data.sslcHallTicket instanceof FileList ? data.sslcHallTicket[0] : data.sslcHallTicket
      const incomeCasteCertificate =
        data.incomeCasteCertificate instanceof FileList
          ? data.incomeCasteCertificate[0]
          : data.incomeCasteCertificate
      const migrationBonafide =
        data.migrationBonafide instanceof FileList
          ? data.migrationBonafide[0]
          : data.migrationBonafide
      const transferCertificate =
        data.transferCertificate instanceof FileList
          ? data.transferCertificate[0]
          : data.transferCertificate
      const sslcMarksSheet =
        data.sslcMarksSheet instanceof FileList ? data.sslcMarksSheet[0] : data.sslcMarksSheet
      const birthCertificate =
        data.birthCertificate instanceof FileList ? data.birthCertificate[0] : data.birthCertificate

      let studentId: string | number | undefined

      if (editingId) {
        await updateStudent.mutateAsync({
          id: editingId,
          data: payload,
          classFeesData: classFeesDataForSubmit,
        })
        if (photo instanceof File) {
          await updateStudentDocument.mutateAsync({ id: editingId, photo })
        }
        if (
          studentAadhaar instanceof File ||
          birthCertificate instanceof File ||
          transferCertificate instanceof File ||
          migrationBonafide instanceof File ||
          incomeCasteCertificate instanceof File ||
          sslcHallTicket instanceof File ||
          sslcMarksSheet instanceof File ||
          bankPassbook instanceof File
        ) {
          await updateStudentOtherDocument.mutateAsync({
            id: editingId,
            aadhaar: studentAadhaar,
            birthCertificate: birthCertificate,
            transferCertificateFile: transferCertificate,
            migrationBonafideFile: migrationBonafide,
            incomeCasteCertificateFile: incomeCasteCertificate,
            sslcHallTicketFile: sslcHallTicket,
            sslcMarksSheetFile: sslcMarksSheet,
            bankPassbookFile: bankPassbook,
          })
        }
        if (fatherAadhaar instanceof File || motherAadhaar instanceof File) {
          await updateParentAadhaar.mutateAsync({ id: editingId, fatherAadhaar, motherAadhaar })
        }

        studentId = editingId
        toast.success('Student updated successfully!')
      } else {
        const result = await createStudent.mutateAsync({
          data: {
            ...payload,
            photo,
            studentAadhaar,
            fatherAadhaar,
            motherAadhaar,
            bankPassbook,
            sslcHallTicket,
            incomeCasteCertificate,
            migrationBonafide,
            transferCertificate,
            sslcMarksSheet,
            birthCertificate,
          },
          classFeesData: classFeesDataForSubmit,
        })
        studentId = result?.data?.studentId || result?.studentId || result?.id
        toast.success('Student admitted successfully!')
      }

      if (data.hasTransport && data.routeId && data.pickupPointId && studentId) {
        try {
          await createTransportFeeMutation.mutateAsync({
            studentId: String(studentId),
            routeId: data.routeId,
            pickUpPointId: data.pickupPointId,
            paid: String(isFinite(Number(data.transportPaid)) ? Number(data.transportPaid) : 0),
            totalMonths: Number(data.transportTotalMonths) || 1,
            startDate: data.transportStartDate,
          })
        } catch (e: any) {
          console.error('Transport fee error:', e)
          toast.warning('Student saved but transport fee assignment failed.')
        }
      }

      if (data.hasHostel && data.hostelId && data.roomId && studentId) {
        try {
          await addHostelFeeMutation.mutateAsync({
            studentId: Number(studentId),
            hostelRoomId: Number(data.roomId),
            startDate: data.hostelStartDate,
            totalMonths: Number(data.hostelTotalMonths),
            paid: 0,
          })
        } catch (e: any) {
          console.error('Hostel fee error:', e)
          toast.warning('Student saved but hostel fee assignment failed.')
        }
      }

      setSuccessMessage(
        editingId ? 'Student updated successfully!' : 'Student admitted successfully!',
      )
      setTimeout(() => {
        navigate('/student-details')
        resetForm()
      }, 1500)
    } catch (error: any) {
      console.error('Submit error:', error)
      const message = error.message || 'Failed to save student. Please try again.'
      toast.error(`Error: ${message}`)
      setErrorMessage(message)
    }
  }

  // ─── reset ────────────────────────────────────────────────────────────────

  const resetForm = () => {
    reset()
    setEditingId(null)
    setShowMoreDetails(false)
    setShowParentDetails(false)
    setShowSSLC(false)
    setSelectedFeeTypes([])
    setValue('siblings', [{ siblingName: '', siblingClassName: '' }])
    setValue('sslcMarks', [{ subjectName: '', maxMarks: '', obtainMarks: '' }])
    setErrorMessage('')
    setSuccessMessage('')
    setClassFeesDataForSubmit([])
    setCurrentStudentData(null)
    setOriginalClassId('')
    setClassChanged(false)
    setExistingDocuments({})
  }

  const handleCancel = () => {
    resetForm()
    navigate('/student-details')
  }

  const isLoading =
    createStudent.isPending ||
    updateStudent.isPending ||
    addHostelFeeMutation.isPending ||
    createTransportFeeMutation.isPending

  //TRANSLATION
  const { t } = useTranslation()
  const T = getPagesDataText(t)

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-5" ref={formTopRef}>
      <AllSchoolDropdown
        onSubmit={handleSubmit(onSubmit)}
        className="w-full"
        queryKeys={[
          'schoolClasses',
          'sections',
          'studentCategories',
          'studentHouses',
          'disableReasons',
          'feeTypes',
          'classFees',
          'sessions',
          'routes',
          'pickupPoints',
          'vehicles',
          'routePickupPoints',
          'studentTransportFees',
          'hostels',
          'hostelRooms',
          'roomTypes',
          'studentHostelFees',
        ]}
      >
        {/* ── Page Header ── */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">{editingId ? T.Student_Edit : T.Student_Ad}</h2>
          <div className="flex gap-2">
            <ExcelActions
              uploadEndpoint="/school-group/{schoolGroupCode}/school/{schoolCode}/student/add/xl-sheet"
              importMutation={importStudents}
              downloadMutation={downloadTemplateMutation}
              importLabel="Import Student XL"
              downloadLabel="Download XL Template"
              onImportSuccess={() => navigate('/student-details')}
            />
            {editingId && (
              <Button
                name="Back to List"
                loading={false}
                onClick={handleCancel}
                icon={<IconField name="FaArrowLeft" />}
              />
            )}
          </div>
        </div>
        <hr />

        {/* ── Alerts ── */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <IconField name="FaCheckCircle" size={20} className="mr-2" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-green-700 hover:text-green-900"
            >
              <IconField name="FaTimes" size={16} />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-red-700 hover:text-red-900"
            >
              <IconField name="FaTimes" size={16} />
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════
            SECTION 1 — Basic Information
        ════════════════════════════════════════ */}
        <div className="p-4 bg-white shadow-md rounded mb-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">{T.Basic_Information}</h3>

          {/* Row 1: Session / Class / Roll / Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Dropdown
              label={T.Session}
              name="sessionId"
              control={control}
              options={
                sessionsData?.map((s: any) => ({
                  value: String(s.sessionId || s.id),
                  label: s.session || s.sessionName,
                })) || []
              }
              required
            />

            {/* <Dropdown
              label="Class"
              name="classId"
              control={control}
              required
              options={
                classesData?.map((c: any) => ({
                  value: String(c.id || c.schoolClassId),
                  label: c.name || c.className,
                })) || []
              }
             disabled ={!!editingId}

            /> */}

            <Dropdown
              label={T.Class}
              name="classId"
              control={control}
              required
              disabled={!!editingId}
              options={
                !selectedSessionId
                  ? [{ value: '', label: 'Please select a session first' }]
                  : isLoadingClasses
                    ? [{ value: '', label: 'Loading classes...' }]
                    : !classesData || classesData.length === 0
                      ? [{ value: '', label: 'No classes available for this session' }]
                      : classesData.map((c: any) => ({
                          value: String(c.id || c.schoolClassId),
                          label: c.name || c.className,
                        }))
              }
            />

            <Dropdown
              label={T.Department}
              name="departmentId"
              control={control}
              required
              disabled={!!editingId}
              options={
                !selectedClassId
                  ? [{ value: '', label: 'Select a class first' }]
                  : departmentsData.length === 0
                    ? [{ value: '', label: 'No departments available' }]
                    : departmentsData.map((d: Department) => ({
                        value: String(d.departmentId || d.id),
                        label: d.departmentName || d.name,
                      }))
              }
            />

            <Dropdown
              label={T.Section_Name}
              name="sectionId"
              control={control}
              required
              disabled={!!editingId}
              options={
                !selectedClassId
                  ? [{ value: '', label: 'Please select a class first' }]
                  : isLoadingSections
                    ? [{ value: '', label: 'Loading sections...' }]
                    : !sectionsData || sectionsData.length === 0
                      ? [{ value: '', label: 'No sections available' }]
                      : sectionsData.map((s: any) => ({
                          value: String(s.id || s.sectionId),
                          label: s.name || s.sectionName,
                        }))
              }
            />
          </div>

          {/* Row 2: Department / STS / GR */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <NumberField
              name="rollNo"
              label={T.Roll_Number}
              control={control}
              placeholder={T.Roll_Number}
              disabled={!!editingId}
            />
            <TextFields
              name="stsNumber"
              label={T.STS_Number}
              control={control}
              placeholder={T.STS_Number}
            />
            <TextFields
              name="grNumber"
              label={T.GR_Number}
              control={control}
              placeholder={T.GR_Number}
            />

            <TextFields
              name="udiseNumber"
              label={T.udise}
              control={control}
              placeholder={T.udise}
            />
          </div>

          {/* Row 3: Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <TextFields
              name="firstName"
              label={T.First_Name}
              control={control}
              placeholder={T.First_Name}
              required
            />
            <TextFields
              name="middleName"
              label={T.Middle_Name}
              control={control}
              placeholder={T.Middle_Name}
            />
            <TextFields
              name="lastName"
              label={T.Last_Name}
              control={control}
              placeholder="Enter last name"
            />
            <Dropdown
              label={T.Gender}
              name="gender"
              control={control}
              required
              options={['Male', 'Female']}
            />
          </div>

          {/* Row 4: DOB / Category / Religion / Caste */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <BirthDateField name="dob" label={T.Date_Of_Birth} control={control} required />
            <Dropdown
              label={T.Category}
              name="studentCategoryId"
              control={control}
              required
              options={
                categoriesData?.map((c: any) => ({ value: String(c.id), label: c.name })) || []
              }
            />
            <TextFields
              name="religion"
              label={T.Religion}
              control={control}
              placeholder={T.Religion}
            />
            <TextFields name="castName" label={T.Caste} control={control} placeholder={T.Caste} />
          </div>

          {/* Row 5: Phone / Email / Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <DateField name="admissionDate" label={T.Admission_Date} control={control} required />

            <AadharField
              name="aadhaarNumber"
              label={T.Aadhaar_Number}
              control={control}
              placeholder={T.Aadhaar_Number}
            />

            <Dropdown
              label={T.Blood_Group}
              name="bloodGroup"
              control={control}
              options={['O+', 'A+', 'B+', 'AB+', 'AB-', 'O-', 'A-', 'B-']}
            />
            <Dropdown
              label={T.House}
              name="studentHouseId"
              control={control}
              options={housesData?.map((h: any) => ({ value: String(h.id), label: h.name })) || []}
            />

            <TextFields name="rte" label={T.rte} control={control} placeholder={T.rte} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <FileUploadField
                name="photo"
                label={T.Student_Photo}
                existingFileUrl={existingDocuments?.photo || null}
                control={control}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a passport-size photo (JPG/PNG, max 2MB, min 200x200px)
              </p>
            </div>
            <FileUploadField
              name="studentAadhaar"
              label={T.Student_Aadhaar_File}
              existingFileUrl={existingDocuments?.studentAadhaar || null}
              control={control}
            />
            {type === 'SCHOOL' ? (
              <FileUploadField
                name="birthCertificate"
                label={T.Birth_Certificate}
                existingFileUrl={existingDocuments?.birthCertificate || null}
                control={control}
              />
            ) : null}
          </div>
          {/* ── Previous School Details ── */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-md font-semibold mb-3">{T.previous_school_details}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TextFields
                name="previousSchool"
                label={T.Previous_School}
                control={control}
                placeholder={T.Previous_School}
                required
              />
              <TextFields
                name="previousSchoolClass"
                label={T.Previous_School_Class}
                control={control}
                placeholder={T.Previous_School_Class}
                required
              />
              <FileUploadField
                name="transferCertificate"
                label={T.Transfer_Certificate}
                existingFileUrl={existingDocuments?.transferCertificate || null}
                control={control}
              />
              <FileUploadField
                name="migrationBonafide"
                label={T.Migration_Bonafide}
                existingFileUrl={existingDocuments?.migrationBonafide || null}
                control={control}
              />
            </div>
          </div>
          {/* ── Location Details ── */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-md font-semibold mb-3">{T.Place_of_Birth_Location}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TextFields
                name="placeOfBirth"
                label={T.Place_of_Birth}
                control={control}
                required
                placeholder={T.Place_of_Birth}
              />
              <TextFields name="taluk" label={T.Taluk} control={control} placeholder={T.Taluk} />
              <TextFields
                name="district"
                label={T.District}
                control={control}
                placeholder={T.District}
              />
              <TextFields name="state" label={T.State} control={control} placeholder={T.State} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <TextFields
                name="nationality"
                label={T.Nationality}
                control={control}
                placeholder={T.Nationality}
              />
              <TextAreaField
                name="permanentAddress"
                label={T.Permanent_Address}
                control={control}
                placeholder={T.Permanent_Address_Placeholder}
                rows={2}
                required
              />
              {/* <TextAreaField
                name="currentAddress"
                label="Current Address"
                control={control}
                placeholder="Current address"
                rows={2}
              /> */}
            </div>
          </div>

          {/* ── Disable Status ── */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-md font-semibold mb-3">{T.Disable_Status}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CheckboxField name="isDisabled" label={T.Is_Student_Disabled} control={control} />
              {isDisabled && (
                <Dropdown
                  label={T.Disabled_Reason}
                  name="disableReasonId"
                  control={control}
                  required={isDisabled}
                  options={
                    disableReasonsData?.map((dr: any) => ({
                      value: String(dr.id),
                      label: dr.reason,
                    })) || []
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 2 — Parent / Guardian
        ════════════════════════════════════════ */}
        <div className="p-4 bg-white shadow-md rounded mb-4">
          <h3 className="text-lg font-semibold mb-3">{T.Parent_Guardian_Detail}</h3>

          {/* Core required parent fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <TextFields
              name="fatherName"
              label={T.Father_Name}
              control={control}
              placeholder={T.Father_Name}
              required
            />
            <TextFields
              name="motherName"
              label={T.Mother_Name}
              control={control}
              required
              placeholder={T.Mother_Name}
            />

            <FileUploadField
              name="fatherAadhaar"
              label={T.Father_Aadhaar_File}
              existingFileUrl={existingDocuments?.fatherAdhaar || null}
              control={control}
            />
            <FileUploadField
              name="motherAadhaar"
              label={T.Mother_Aadhaar_File}
              existingFileUrl={existingDocuments?.motherAdhaar || null}
              control={control}
            />
          </div>

          {/* Parent type toggle */}

          {/* Collapsible: Additional Parent Info */}
          <div className="mt-4 pt-4 border-t">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowParentDetails(!showParentDetails)}
            >
              <h4 className="text-md font-semibold">{T.Additional_Details}</h4>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Dropdown
                  label={T.Default_Parent}
                  name="parentDefaultParent"
                  control={control}
                  options={[
                    { value: 'Father', label: 'Father' },
                    { value: 'Mother', label: 'Mother' },
                    { value: 'Guardian', label: 'Guardian' },
                  ]}
                  required
                />
                <TextFields
                  name="parentName"
                  label={T.Parent_Full_Name}
                  control={control}
                  placeholder={T.Parent_Full_Name}
                  required
                />
                <TextFields
                  name="parentQualification"
                  label={T.Qualification}
                  control={control}
                  placeholder={T.Qualification}
                />
                <TextFields
                  name="parentOccupation"
                  label={T.Father_Occupation}
                  control={control}
                  placeholder={T.Father_Occupation}
                />
                <NumberField
                  name="parentAnnualIncome"
                  label={T.Annual_Income}
                  control={control}
                  placeholder={T.Annual_Income}
                />
                <TextFields
                  name="parentIncomeCertificateNumber"
                  label={T.Income_Certificate_No}
                  control={control}
                  placeholder={T.Income_Certificate_No}
                />
                <NumberField
                  name="parentNoOfDependents"
                  label={T.No_of_Dependents}
                  control={control}
                  placeholder={T.No_of_Dependents}
                />
                <MobileField
                  name="parentPhone"
                  label={T.Mobile_Number}
                  control={control}
                  placeholder={T.Mobile_Number}
                  required
                />
                <MobileField
                  name="alternatePhoneNumber"
                  label={T.Alternate_Phone}
                  control={control}
                  placeholder={T.Alternate_Phone}
                />
                <EmailField
                  name="parentEmail"
                  label={T.Parent_Email}
                  control={control}
                  placeholder={T.Parent_Email}
                />
                <FileUploadField
                  name="incomeCasteCertificate"
                  label={T.Income_Certificate}
                  existingFileUrl={existingDocuments?.incomeCasteCertificate || null}
                  control={control}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            SECTION 3 — Sibling Details
        ════════════════════════════════════════ */}
        <div className="p-4 bg-white shadow-md rounded mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">{T.Sibling_Details}</h3>
            <button
              type="button"
              onClick={handleAddSibling}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition-colors"
            >
              <IconField name="FaPlus" /> {T.Add_Sibling}
            </button>
          </div>
          {formSiblings.map((_: Sibling, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-medium">
                  {T.Sibling} {index + 1}
                </h4>
                {formSiblings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSibling(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <IconField name="FaTimes" size={18} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextFields
                  name={`siblings.${index}.siblingName`}
                  label={T.Add_Sibling}
                  control={control}
                  placeholder="Full name"
                />
                <TextFields
                  name={`siblings.${index}.siblingClassName`}
                  label={T.Sibling_Class_Admission_No}
                  control={control}
                  placeholder={T.Sibling_Class_Admission_No}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            SECTION 4 — Transport
        ════════════════════════════════════════ */}
        {editingId ? (
          <></>
        ) : (
          <div className="p-4 bg-white shadow-md rounded mb-4">
            <div className="flex items-center mb-4">
              <CheckboxField name="hasTransport" label="Transport Required" control={control} />
            </div>
            {hasTransport && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white shadow-lg rounded">
                  <Dropdown
                    label="Route"
                    name="routeId"
                    control={control}
                    required={hasTransport}
                    options={
                      routesData?.map((r: any) => ({
                        value: String(r.id || r.routeId),
                        label: r.routeName || r.routeTitle || 'Unknown Route',
                      })) || []
                    }
                  />
                  <Dropdown
                    label="Pickup Point"
                    name="pickupPointId"
                    control={control}
                    required={hasTransport}
                    options={
                      filteredPickupPoints?.map((p: any) => ({
                        value: String(p.id || p.pickUpPointId),
                        label: p.pickUpPointName || p.name || 'Unknown Point',
                      })) || []
                    }
                  />
                  <Dropdown
                    label="Vehicle"
                    name="vehicleId"
                    control={control}
                    options={
                      vehiclesData?.map((v: any) => ({
                        value: String(v.id || v.vehicleId),
                        label: v.vehicleNumber
                          ? `${v.vehicleNumber}${v.vehicleType ? ` (${v.vehicleType})` : ''}`
                          : 'Unknown Vehicle',
                      })) || []
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white shadow-lg rounded">
                  <DateField
                    name="transportStartDate"
                    label="Start Date"
                    control={control}
                    required={hasTransport}
                  />
                  <NumberField
                    name="transportTotalMonths"
                    label="Total Months"
                    control={control}
                    placeholder="Months"
                    required={hasTransport}
                  />
                  <AmountField
                    name="transportPaid"
                    label="Paid Amount"
                    control={control}
                    placeholder="Enter paid"
                  />
                  <AmountField
                    name="transportTotalFees"
                    label="Transport Fees"
                    control={control}
                    placeholder="Auto-filled"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 5 — Hostel */}
        {editingId ? (
          <></>
        ) : (
          <div className="p-4 bg-white shadow-md rounded mb-4">
            <div className="flex items-center mb-4">
              <CheckboxField name="hasHostel" label="Hostel Required" control={control} />
            </div>
            {hasHostel && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white shadow-lg rounded">
                  <Dropdown
                    label="Hostel"
                    name="hostelId"
                    control={control}
                    required={hasHostel}
                    options={
                      hostelsData?.map((h: any) => ({
                        value: String(h.id || h.hostelId),
                        label: h.hostelName || h.name || 'Unknown Hostel',
                      })) || []
                    }
                  />
                  <Dropdown
                    label="Room Number"
                    name="roomId"
                    control={control}
                    required={hasHostel}
                    options={
                      filteredRooms?.map((r: any) => ({
                        value: String(r.id || r.hostelRoomId),
                        label: r.roomNo || r.roomNumber || 'Unknown Room',
                      })) || []
                    }
                  />
                  <TextField
                    name="roomTypeId"
                    label="Room Type"
                    control={control}
                    placeholder="Auto-filled"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white shadow-lg rounded">
                  <DateField
                    name="hostelStartDate"
                    label="Start Date"
                    control={control}
                    required={hasHostel}
                  />
                  <NumberField
                    name="hostelTotalMonths"
                    label="Total Months"
                    control={control}
                    placeholder="Months"
                    required={hasHostel}
                  />
                  <AmountField
                    name="hostelCostPerBed"
                    label="Cost Per Bed"
                    control={control}
                    placeholder="Auto-filled"
                  />
                  <AmountField
                    name="hostelTotalFees"
                    label="Total Hostel Fees"
                    control={control}
                    placeholder="Auto-calculated"
                  />
                </div>

                {selectedHostelId && selectedRoomId && hostelStartDate && hostelTotalMonths && (
                  <div className="mt-4">
                    {isCheckingBeds ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 shrink-0" />
                        Checking bed availability...
                      </div>
                    ) : bedAvailability ? (
                      <div
                        className={`p-3 rounded-lg border text-sm ${
                          bedAvailability.available
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-medium mb-2">
                          <IconField
                            name={bedAvailability.available ? 'FaCheckCircle' : 'FaTimesCircle'}
                            size={15}
                          />
                          {bedAvailability.message}
                        </div>
                        {bedAvailability.totalBeds > 0 && (
                          <div className="grid grid-cols-3 gap-3 mt-2 text-center">
                            <div className="bg-white/60 rounded-md p-2">
                              <div className="text-base font-bold">{bedAvailability.totalBeds}</div>
                              <div className="text-xs text-gray-500">Total Beds</div>
                            </div>
                            <div className="bg-white/60 rounded-md p-2">
                              <div className="text-base font-bold">
                                {bedAvailability.occupiedBeds}
                              </div>
                              <div className="text-xs text-gray-500">Occupied</div>
                            </div>
                            <div className="bg-white/60 rounded-md p-2">
                              <div
                                className={`text-base font-bold ${bedAvailability.available ? 'text-green-700' : 'text-red-600'}`}
                              >
                                {bedAvailability.availableBeds}
                              </div>
                              <div className="text-xs text-gray-500">Available</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            SECTION 6 — Fees
        ════════════════════════════════════════ */}
        {editingId ? (
          <></>
        ) : (
          <div className="p-4 bg-white shadow-md rounded mb-4">
            <h3 className="text-lg font-semibold mb-3">Fees Details</h3>
            {!selectedClassId && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                Please select a class first to enable fee type selection.
              </div>
            )}
            {classChanged && editingId && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <strong>Note:</strong> Class changed — all fees reset. Please select fee types
                again.
              </div>
            )}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Select Fee Types:</p>
              <div className="flex flex-wrap gap-4">
                {feeTypesData?.map((ft: any) => {
                  const ftId = String(ft.id || ft.feeTypeId)
                  return (
                    <label
                      key={ftId}
                      className={`flex items-center space-x-2 cursor-pointer ${!selectedClassId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeeTypes.includes(ftId)}
                        onChange={() => handleFeeTypeToggle(ftId)}
                        disabled={!selectedClassId}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">{ft.name || ft.feeTypeName}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            {isLoadingClassFees && selectedFeeTypes.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                Loading class fees...
              </div>
            )}
            {selectedFeeTypes.length > 0 && (
              <div className="space-y-6 mt-6">
                {selectedFeeTypes.map((feeTypeId) => {
                  const ft = feeTypesData?.find(
                    (f: any) => String(f.id || f.feeTypeId) === feeTypeId,
                  )
                  const feeTypeName = ft?.name || ft?.feeTypeName || 'Fee'
                  const cf = classFees?.find((c: any) => String(c.feesTypeId) === feeTypeId)
                  return (
                    <div
                      key={feeTypeId}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <h4 className="text-md font-semibold text-blue-600 mb-3">{feeTypeName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AmountField
                          name={`fees.${feeTypeId}.totalFees`}
                          label="Total Fees"
                          control={control}
                          placeholder={cf ? `₹${cf.fee}` : 'Enter total fees'}
                        />
                        <AmountField
                          name={`fees.${feeTypeId}.paid`}
                          label="Paid Amount"
                          control={control}
                          placeholder="Enter paid"
                        />
                        <AmountField
                          name={`fees.${feeTypeId}.pending`}
                          label="Pending Amount"
                          control={control}
                          placeholder="Auto-calculated"
                          disabled
                        />
                      </div>
                      {!cf && selectedClassId && !isLoadingClassFees && (
                        <p className="text-xs text-amber-600 mt-2">
                          No class fee defined for "{feeTypeName}". Enter manually or configure in
                          Class Fees.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {selectedFeeTypes.length === 0 && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-500">
                No fee types selected.
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            SECTION 7 — SSLC (College 10th Details)
        ════════════════════════════════════════ */}
        {type === 'COLLEGE' ? (
          <div className="p-4 bg-white shadow-md rounded mb-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowSSLC(!showSSLC)}
            >
              <h3 className="text-lg font-semibold">{T.SSLC_Details}</h3>
              <IconField name={showSSLC ? 'FaChevronUp' : 'FaChevronDown'} size={20} />
            </div>
            {showSSLC && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TextFields
                    name="sslcSchoolName"
                    label={T.School_Name_And_Address}
                    control={control}
                    placeholder="Previous school full name"
                  />
                  <TextFields
                    name="sslcRegistrationNo"
                    label={T.SSLC_Registration_No}
                    control={control}
                    placeholder="Board registration number"
                  />
                  <TextFields
                    name="sslcFirstLanguage"
                    label={T.SSLC_First_Language}
                    control={control}
                    placeholder="e.g. Kannada"
                  />
                  <TextFields
                    name="sslcSecondLanguage"
                    label={T.SSLC_Second_Language}
                    control={control}
                    placeholder="e.g. Hindi"
                  />
                  <TextFields
                    name="sslcThirdLanguage"
                    label={T.SSLC_Third_Language}
                    control={control}
                    placeholder="e.g. English"
                  />
                  <AmountField
                    name="sslcPercentage"
                    label={T.SSLC_Percentage}
                    control={control}
                    placeholder={T.SSLC_Percentage}
                  />
                  <Dropdown
                    label={T.SSLC_Result}
                    name="sslcResult"
                    control={control}
                    options={[
                      { value: 'Pass', label: 'Pass' },
                      { value: 'Fail', label: 'Fail' },
                      { value: 'Distinction', label: 'Distinction' },
                      { value: 'First Class', label: 'First Class' },
                      { value: 'Second Class', label: 'Second Class' },
                    ]}
                  />
                  <FileUploadField
                    name="sslcHallTicket"
                    label={T.SSLC_Hall_Ticket}
                    existingFileUrl={existingDocuments?.sslcHallTicket || null}
                    control={control}
                  />
                  <FileUploadField
                    name="sslcMarksSheet"
                    label={T.SSLC_Marks_Sheet}
                    existingFileUrl={existingDocuments?.sslcMarksSheet || null}
                    control={control}
                  />
                </div>
                {/* Subject marks */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-semibold">{T.Subject_Marks}</h4>
                    <button
                      type="button"
                      onClick={handleAddSSLCMark}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-md hover:bg-slate-900 text-sm"
                    >
                      <IconField name="FaPlus" /> {T.Add_Subject}
                    </button>
                  </div>
                  {sslcMarks.map((_: SSLCMark, index: number) => (
                    <div
                      key={index}
                      className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {T.Subject} {index + 1}
                        </span>
                        {sslcMarks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSSLCMark(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <IconField name="FaTimes" size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextFields
                          name={`sslcMarks.${index}.subjectName`}
                          label={T.Subject_Name}
                          control={control}
                          placeholder={T.Subject_Name}
                        />
                        <NumberField
                          name={`sslcMarks.${index}.maxMarks`}
                          label={T.Max_Marks}
                          control={control}
                          placeholder={T.Max_Marks}
                        />
                        <AmountField
                          name={`sslcMarks.${index}.obtainMarks`}
                          label={T.Marks_Obtained}
                          control={control}
                          placeholder={T.Marks_Obtained}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ════════════════════════════════════════
            SECTION 8 — Additional Details
        ════════════════════════════════════════ */}
        <div className="p-4 bg-white shadow-md rounded mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowMoreDetails(!showMoreDetails)}
          >
            <h3 className="text-lg font-semibold">{T.Additional_Details}</h3>
            <IconField name={showMoreDetails ? 'FaChevronUp' : 'FaChevronDown'} size={20} />
          </div>
          {showMoreDetails && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NumberField
                  name="bankAccountNumber"
                  label={T.Bank_Account_Number}
                  control={control}
                  placeholder="Account number"
                />
                <TextFields
                  name="bankName"
                  label={T.Bank_Name}
                  control={control}
                  placeholder={T.Bank_Name}
                />
                <IFSCInputField
                  name="ifscCode"
                  label={T.IFSC_Code}
                  control={control}
                  placeholder={T.IFSC_Code}
                />
                <FileUploadField
                  name="bankPassbook"
                  label={T.Bank_Passbook_File}
                  existingFileUrl={existingDocuments?.bankPassbook || null}
                  control={control}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Form Actions ── */}
        <div className="flex gap-2 justify-end">
          <Button
            name={editingId ? T.Update : T.Save}
            loading={isLoading}
            icon={<IconField name="FaSave" />}
          />
          {editingId && (
            <Button
              name="Cancel"
              loading={false}
              icon={<IconField name="FaTimes" />}
              onClick={handleCancel}
            />
          )}
        </div>
      </AllSchoolDropdown>
    </div>
  )
}

export default StudentAdmission

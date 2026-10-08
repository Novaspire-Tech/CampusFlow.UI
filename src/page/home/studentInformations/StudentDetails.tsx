import { IconField } from '../../../components'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Dropdown from '../../../components/controlled/Dropdown'
import TextFields from '../../../components/controlled/TextField'
import Button from '../../../components/controlled/Button'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useSearchStudents,
  useDeleteStudents,
  useBulkUploadStudentSessions,
  useDownloadStudentSessionTemplate,
  useStudentSessionHistory,
  useUpdateStudentDocument,
} from '../../../hooks/queries/studentInformation/useStudents'
import type { StudentSessionHistoryRow } from '../../../services/studentInformation/studentService'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useStudentCategories } from '../../../hooks/queries/studentInformation/useStudentCategories'
import { studentService } from '../../../services/studentInformation/studentService'
import { studentTransportFeesService } from '../../../services/transport/studentTransportFeesService'
import { studentHostelFeesService } from '../../../services/hostel/Studenthostelfeesservice'
import ExcelActions from '../../../components/uncontrolled/ExcelActions'
import { openDocument } from '../../../hooks/useBlobImage'
import { useUpdateStudentSession } from '../../../hooks/queries/studentInformation/useStudents'
import { useSessions } from '../../../hooks/queries/systemSettinds/useSessionSetting'
import { API_BASE_URL } from '../../../utils/axios'

interface SiblingDetail {
  siblingsId?: string
  siblingName: string
  siblingClassName: string
}

interface FeeDetail {
  feesId?: string
  feeTypeId: string
  feeTypeName: string
  totalFees: string
  paid: string
  pending: string
}

interface TransportDetail {
  transportId?: string
  routeId: string
  routeName: string
  vehicleId: string
  vehicleNumber: string
  pickupPointId: string
  pickupPointName: string
  fareAmount: string
  totalFees?: string
  totalMonths?: string | number
  startDate?: string
  paid?: string
}

interface HostelDetail {
  hostelId?: string
  hostelName: string
  roomId: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  costPerBed: string
  totalFees?: string
  totalMonths?: string | number
  startDate?: string
  paid?: string
}

interface SSLCMark {
  subjectName: string
  maxMarks: string
  obtainMarks: string
}

interface SSLCData {
  schoolNameWithAddress?: string
  registrationNo?: string
  firstLanguage?: string
  secondLanguage?: string
  thirdLanguage?: string
  percentage?: string
  result?: string
  sslcHallTicket?: string
  sslcMarksSheetFile?: string
  marksList?: SSLCMark[]
}

type Student = {
  sslcHallTicket?: string
  fatherAdhaar: any
  motherAdhaar: any
  name: string
  occupation: string
  id: string | number
  studentId: string | number
  admissionNo: string
  rollNo: number | string
  firstName?: string
  middleName?: string
  lastName?: string
  studentName: string
  gender: string
  dob: string
  classId?: string | number
  class: string
  className?: string
  sectionId?: string | number
  section: string
  sectionName?: string
  departmentId?: string | number
  departmentName?: string
  session?: string
  sessionId?: string | number | null
  startSession?: string

  stsNumber?: string
  grNumber?: string
  udiseNumber?: string
  aadhaarNumber?: string
  uid: string

  phoneNumber?: string
  mobileNumber: string
  email?: string

  fatherName: string
  motherName?: string
  parentPhone: string
  alternatePhoneNumber?:string
  parentName?: string
  parentEmail?: string
  parentDefaultParent?: string
  parentAadhaarNumber?: string
  parentQualification?: string
  parentOccupation?: string
  parentAnnualIncome?: string
  parentIncomeCertificateNumber?: string
  parentNoOfDependents?: string
  parentAlternatePhoneNumber?: string
  fatherPhone?: string
  fatherOccupation?: string
  fatherPhoto?: string
  motherPhone?: string
  motherOccupation?: string
  motherPhoto?: string

  guardianName?: string
  guardianRelation?: string
  guardianEmail?: string
  guardianPhone?: string
  guardianOccupation?: string
  guardianAddress?: string
  guardianPhoto?: string

  studentCategoryId?: string | number
  categoryId?: string
  category: string
  categoryName?: string
  studentHouseId?: string | number

  religion?: string
  castName?: string
  admissionDate?: string
  photo?: string
  bloodGroup?: string
  height?: string
  weight?: string
  measurementDate?: string
  placeOfBirth?: string
  taluk?: string
  district?: string
  state?: string
  nationality?: string
  rte?: string

  isDisabled: boolean
  disableReasonId?: string | number | null
  disableReason: string
  disableReasonName?: string

  currentAddress?: string
  address: string
  permanentAddress?: string
  previousSchool?: string
  previousSchoolClass?: string

  siblingsList?: SiblingDetail[]
  siblingName?: string

  description?: string
  bankPassbookFile?: string
  bankAccountNumber?: string
  bankName?: string
  ifscCode?: string
  nationalIdentification?: string
  localIdentification?: string
  note?: string
  aadhaarFile?: string
  birthCertificateFile?: string
  migrationBonafile?: string
  transferCertificate?: string
  parentAdhaar?: string
  incomeCasteCertificate?: string

  feesList?: FeeDetail[]

  routeId?: string | null
  routeName?: string | null
  vehicleId?: string | null
  vehicleNumber?: string | null
  pickupPointId?: string | null
  pickupPointName?: string | null
  transport?: TransportDetail

  hostelId?: string | null
  hostelName?: string | null
  roomId?: string | null
  roomNumber?: string | null
  roomTypeId?: string | null
  roomTypeName?: string | null
  hostel?: HostelDetail

  sslcData?: SSLCData
  studentSessions?: any[]
}

interface SearchFormValues {
  searchClass: string | number
  searchSection: string | number
  searchKeyword: string
}

type StudentWithPhoto = Student & {
  photoUrl?: string
  photoError?: boolean
  photoLoading?: boolean
}

interface FetchedTransport {
  studentTransportFeesId?: number
  routeId?: number
  routeName?: string
  pickUpPointId?: number
  pickUpPointName?: string
  vehicleId?: number
  vehicleName?: string
  totalFees?: number
  paidFees?: number
  startDate?: string
  endDate?: string
  totalMonths?: number
}

interface FetchedHostel {
  id?: number
  hostelId?: number
  hostelName?: string
  roomId?: number
  roomNumber?: string
  roomTypeName?: string
  costPerBed?: number
  totalFees?: number
  paidFees?: number
  startDate?: string
  endDate?: string
  totalMonths?: number
}

// ─────────────────────────────────────────────
// Session status badge
// ─────────────────────────────────────────────
const SessionStatusBadge = ({ status }: { status: string }) => {
   const { t } = useTranslation();
  const T = getPagesDataText(t);
  const upper = (status || '').toUpperCase()

  if (upper === 'ACTIVE')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        {T.Active}
      </span>
    )
  if (upper === 'PASS')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        {T.Pass}
      </span>
    )
  if (upper === 'PASSED_OUT' || upper === 'PASSEDOUT')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        {T.Pass_Out_Session}
      </span>
    )
  if (upper === 'INACTIVE')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
        {T.Inactive}
      </span>
    )
  if (upper === 'TRANSFERRED')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
        Transferred
      </span>
    )
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
      {status || '—'}
    </span>
  )
}

// ─────────────────────────────────────────────
// Modal section dropdown — independent of the search form
// ─────────────────────────────────────────────
const ModalSectionDropdown = ({
  classId,
  value,
  onChange,
  onLabelChange,
}: {
  classId: string
  value: string
  onChange: (val: string) => void
  onLabelChange?: (label: string) => void
}) => {
  const { data: modalSections, isLoading } = useSections(Number(classId) || 0)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onChange(val)
    if (onLabelChange) {
      const found = modalSections?.find(
        (s: any) => String(s.id ?? s.sectionId) === val,
      )
      onLabelChange(found?.name ?? found?.sectionName ?? '')
    }
  }
   const { t } = useTranslation();
  const T = getPagesDataText(t);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {T.Section} <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={!classId}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                   transition-shadow bg-white disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">
          {!classId
            ? '— Select a class first —'
            : isLoading
              ? 'Loading sections...'
              : '— Select Section —'}
        </option>
        {modalSections?.map((s: any) => (
          <option key={s.id ?? s.sectionId} value={String(s.id ?? s.sectionId)}>
            {s.name ?? s.sectionName}
          </option>
        ))}
      </select>
    </div>
  )
}


const ModalDepartmentDropdown = ({
  classId,
  value,
  onChange,
}: {
  classId: string
  value: string
  onChange: (val: string) => void
}) => {
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
   const { t } = useTranslation();
  const T = getPagesDataText(t);

  useEffect(() => {
    if (!classId) {
      setDepartments([])
      return
    }

    const fetchDepartments = async () => {
      setIsLoading(true)
      try {
        const schoolGroupCode = localStorage.getItem('schoolGroupCode') || 'default'
        const schoolCode = localStorage.getItem('schoolCode') || 'default'
        const token = localStorage.getItem('accessToken') || ''

       
        const baseUrl =
          (typeof API_BASE_URL !== 'undefined' && API_BASE_URL)
            ? API_BASE_URL
            : ''

        const fullUrl = `${baseUrl}/schoolGroup/${schoolGroupCode}/school/${schoolCode}/class/${classId}/all`

        console.debug('[DepartmentDropdown] Fetching:', fullUrl)

        const res = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()

        console.debug('[DepartmentDropdown] Response:', json)

        
        let raw: any[] = []

        if (Array.isArray(json?.data)) {
     
          raw = json.data
        } else if (Array.isArray(json?.data?.departments)) {
    
          raw = json.data.departments
        } else if (Array.isArray(json)) {
      
          raw = json
        }

        const mapped = raw
          .filter((d: any) => d.departmentId != null)
          .map((d: any) => ({
            id: Number(d.departmentId),
            name: String(d.name || ''),
          }))

        console.debug('[DepartmentDropdown] Mapped departments:', mapped)
        setDepartments(mapped)
      } catch (err) {
        console.warn('[DepartmentDropdown] Could not fetch departments for class:', classId, err)
        setDepartments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [classId])

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {T.Department}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!classId || isLoading}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                   transition-shadow bg-white disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">
          {!classId
            ? '— Select a class first —'
            : isLoading
              ? 'Loading departments...'
              : departments.length === 0
                ? '— No departments found —'
                : '— Select Department (optional) —'}
        </option>
        {departments.map((d) => (
          <option key={d.id} value={String(d.id)}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─────────────────────────────────────────────
// Photo hooks
// ─────────────────────────────────────────────
const useStudentPhotos = (students: Student[]) => {
  const [studentsWithPhotos, setStudentsWithPhotos] = useState<StudentWithPhoto[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const isFetchingRef = useRef(false)
  const objectUrlsRef = useRef<string[]>([])
  

  const studentsKey = useMemo(() => {
    if (!students || students.length === 0) return 'empty'
    return students.map((s) => s.studentId).join(',')
  }, [students])

  useEffect(() => {
    const fetchPhotos = async () => {
      if (isFetchingRef.current) return
      if (!students || students.length === 0) {
        setStudentsWithPhotos([])
        return
      }
      isFetchingRef.current = true
      setLoadingPhotos(true)
      const studentsWithPhotoUrls = await Promise.all(
        students.map(async (student) => {
          const studentWithPhoto: StudentWithPhoto = {
            ...student,
            photoUrl: undefined,
            photoError: false,
            photoLoading: true,
          }
          if (!student.photo || student.photo.trim() === '') {
            studentWithPhoto.photoLoading = false
            return studentWithPhoto
          }
          try {
            const blob = await studentService.getProfilePicture(student.photo)
            if (!blob || blob.size === 0) throw new Error('Received empty blob')
            const photoUrl = URL.createObjectURL(blob)
            objectUrlsRef.current.push(photoUrl)
            studentWithPhoto.photoUrl = photoUrl
            studentWithPhoto.photoLoading = false
            return studentWithPhoto
          } catch (error: any) {
            console.error(`Error fetching photo for student ${student.studentId}:`, error)
            studentWithPhoto.photoError = true
            studentWithPhoto.photoLoading = false
            return studentWithPhoto
          }
        }),
      )
      setStudentsWithPhotos(studentsWithPhotoUrls)
      setLoadingPhotos(false)
      isFetchingRef.current = false
    }
    fetchPhotos()
    return () => {
      objectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url)
        } catch (e) {
          console.error('Error revoking URL:', e)
        }
      })
      objectUrlsRef.current = []
    }
  }, [studentsKey])

  return { studentsWithPhotos, loadingPhotos }
}

const useStudentPhoto = (photoPath?: string) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!photoPath || photoPath.trim() === '') {
        setPhotoUrl(null)
        setError(false)
        setLoading(false)
        return
      }
      setLoading(true)
      setError(false)
      try {
        const blob = await studentService.getProfilePicture(photoPath)
        if (!blob || blob.size === 0) throw new Error('Received empty blob')
        const url = URL.createObjectURL(blob)
        setPhotoUrl(url)
      } catch (error: any) {
        console.error('Error fetching student photo:', error)
        setError(true)
        setPhotoUrl(null)
      } finally {
        setLoading(false)
      }
    }
    fetchPhoto()
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoPath])

  return { photoUrl, loading, error }
}

// ─────────────────────────────────────────────
// Transform helper
// ─────────────────────────────────────────────
const transformApiStudent = (student: any, categoryMap: Map<any, any>): Student | null => {
  const categoryName = student.studentCategoryId
    ? categoryMap.get(student.studentCategoryId) ||
      student.studentCategoryName ||
      student.categoryName ||
      'N/A'
    : student.studentCategoryName || student.categoryName || 'N/A'

  const studentId = student.studentId?.toString() || student.id?.toString()
  if (!studentId) {
    console.error('CRITICAL: Student missing ID:', student)
    return null
  }

  return {
    id: studentId,
    studentId: studentId,
    admissionNo: student.admissionNo || '',
    rollNo: student.rollNo || '',
    firstName: student.firstName || '',
    middleName: student.middleName || '',
    lastName: student.lastName || '',
    studentName:
      `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim() ||
      '',
    stsNumber: student.stsNumber || '',
    grNumber: student.grNumber || '',
    udiseNumber: student.udiseNumber || '',
    previousSchoolClass: student.previousSchoolClass || '',
    aadhaarNumber: student.aadhaarNumber || '',
    uid: student.aadhaarNumber || student.uid || '',
    gender: student.gender || '',
    dob: student.dob || '',
    bloodGroup: student.bloodGroup || '',
    height: student.height || '',
    weight: student.weight || '',
    measurementDate: student.measurementDate || '',
    religion: student.religion || '',
    castName: student.castName || '',
    admissionDate: student.admissionDate || '',
    rte: student.rte || '',
    photo: student.photo || '',
    birthCertificateFile: student.birthCertificateFile || '',
    transferCertificate:student.transferCertificate || '',
    migrationBonafile:student.migrationBonafide|| '',
    incomeCasteCertificate: student.incomeCasteCertificate || '',
    placeOfBirth: student.placeOfBirth || '',
    taluk: student.taluk || '',
    district: student.district || '',
    state: student.state || '',
    nationality: student.nationality || '',
    classId: student.classId,
    class: student.className || student.class || '',
    className: student.className || '',
    sectionId: student.sectionId,
    section: student.sectionName || student.section || '',
    sectionName: student.sectionName || '',
    departmentId: student.departmentId,
    departmentName: student.departmentName || '',
    session: student.startSession || student.session || '',
    startSession: student.startSession || '',
    sessionId: student.sessionId || null,
    phoneNumber: student.phoneNumber || '',
    mobileNumber: student.phoneNumber || student.mobileNumber || '',
    email: student.email || '',
    fatherName: student.parent?.fatherName || student.fatherName || '',
    motherName: student.parent?.motherName || student.motherName || '',
    parentPhone: student.parent?.phoneNumber || student.parentPhone || '',
    alternatePhoneNumber:student.parent?.alternatePhoneNumber || student.alternatePhoneNumber || '',
    parentName: student.parent?.name || student.parentName || '',
    parentEmail: student.parent?.email || student.parentEmail || '',
    parentDefaultParent: student.parent?.defaultParent || student.parentDefaultParent || '',
    motherAdhaar:student.parent?.motherAdhaarFile || student.motherAadhaar ||'',
    fatherAdhaar: student.parent?.fatherAdhaarFile || student.fatherAadhaar || '',
    parentQualification: student.parent?.qualification || student.parentQualification || '',
    parentOccupation: student.parent?.occupation || student.parentOccupation || '',
    parentAnnualIncome: student.parent?.annualIncome || student.parentAnnualIncome || '',
    parentIncomeCertificateNumber:
      student.parent?.incomeCertificateNumber || student.parentIncomeCertificateNumber || '',
    parentNoOfDependents: student.parent?.noOfDependents || student.parentNoOfDependents || '',
    parentAlternatePhoneNumber:
      student.parent?.alternatePhoneNumber || student.parentAlternatePhoneNumber || '',
    parentAdhaar: student.parentAdhaar || '',
    fatherPhone: student.fatherPhone || '',
    fatherOccupation: student.fatherOccupation || '',
    motherPhone: student.motherPhone || '',
    motherOccupation: student.motherOccupation || '',
    guardianName: student.guardianName || '',
    guardianRelation: student.guardianRelation || '',
    guardianEmail: student.guardianEmail || '',
    guardianPhone: student.guardianPhone || '',
    guardianOccupation: student.guardianOccupation || '',
    guardianAddress: student.guardianAddress || '',
    studentCategoryId: student.studentCategoryId,
    categoryId: student.studentCategoryId?.toString(),
    category: categoryName,
    categoryName: categoryName,
    studentHouseId: student.studentHouseId,
    isDisabled: !!student.disableReasonId,
    disableReasonId: student.disableReasonId,
    disableReason: student.disableReasonName || '',
    disableReasonName: student.disableReasonName || '',
    currentAddress: student.currentAddress || '',
    address: student.permanentAddress || student.currentAddress || 'N/A',
    permanentAddress: student.permanentAddress || '',
    previousSchool: student.previousSchool || '',
    siblingsList:
      student.siblingsList?.map((sibling: any) => ({
        siblingsId: sibling.siblingsId?.toString(),
        siblingName: sibling.siblingName || '',
        siblingClassName: sibling.siblingClassName || '',
      })) || [],
    description: student.description || '',
    bankAccountNumber: student.bankDetails?.bankAccountNumber || student.bankAccountNumber || '',
    bankPassbookFile:student.bankDetails?.bankPassbook || student.bankPassbook || '',
    bankName: student.bankDetails?.bankName || student.bankName || '',
    ifscCode: student.bankDetails?.ifscCode || student.ifscCode || '',
    nationalIdentification: student.nationalIdentification || '',
    localIdentification: student.localIdentification || '',
    note: student.note || '',
    aadhaarFile: student.aadhaarFile || '',
    feesList:
      student.feesList?.map((fee: any) => ({
        feesId: fee.feesId?.toString(),
        feeTypeId: (fee.feeTypeId ?? fee.feeType?.feeTypeId)?.toString(),
        feeTypeName: fee.feeTypeName || fee.feeType?.name || '',
        totalFees: fee.totalFees || '0',
        paid: fee.paid || '0',
        pending: fee.pending || '0',
      })) || [],
    routeId: (student.transport?.routeId || student.routeId)?.toString() || null,
    routeName: student.transport?.routeName || student.routeTitle || student.routeName || null,
    vehicleId: (student.transport?.vehicleId || student.vehicleId)?.toString() || null,
    vehicleNumber: student.transport?.vehicleNumber || student.vehicleNumber || null,
    pickupPointId: (student.transport?.pickupPointId || student.pickupPointId)?.toString() || null,
    pickupPointName: student.transport?.pickupPointName || student.pickupPointName || null,
    transport:
      student.transport?.routeId || student.routeId || student.pickupPointId
        ? {
            transportId: student.transport?.transportId?.toString() || '',
            routeId: (student.transport?.routeId || student.routeId)?.toString() || '',
            routeName:
              student.transport?.routeName || student.routeTitle || student.routeName || '',
            vehicleId: (student.transport?.vehicleId || student.vehicleId)?.toString() || '',
            vehicleNumber: student.transport?.vehicleNumber || student.vehicleNumber || '',
            pickupPointId:
              (student.transport?.pickupPointId || student.pickupPointId)?.toString() || '',
            pickupPointName:
              student.transport?.pickupPointName ||
              student.transport?.pickUpPointName ||
              student.pickupPointName ||
              '',
            fareAmount: student.transport?.fareAmount || '0',
            totalFees: student.transport?.totalFees || student.transport?.fareAmount || '0',
            totalMonths: student.transport?.totalMonths || '',
            startDate: student.transport?.startDate || '',
            paid: student.transport?.paid || '0',
          }
        : undefined,
    hostelId: (student.hostel?.hostelId || student.hostelId)?.toString() || null,
    hostelName: student.hostel?.hostelName || student.hostelName || null,
    roomId: (student.hostel?.roomId || student.hostelRoomId)?.toString() || null,
    roomNumber: student.hostel?.roomNumber || student.roomNumber || null,
    roomTypeId: (student.hostel?.roomTypeId || student.roomTypeId)?.toString() || null,
    roomTypeName: student.hostel?.roomTypeName || student.roomTypeName || null,
    hostel:
      student.hostel?.hostelId || student.hostelId
        ? {
            hostelId: (student.hostel?.hostelId || student.hostelId)?.toString() || '',
            hostelName: student.hostel?.hostelName || student.hostelName || '',
            roomId: (student.hostel?.roomId || student.hostelRoomId)?.toString() || '',
            roomNumber: student.hostel?.roomNumber || student.roomNumber || '',
            roomTypeId: (student.hostel?.roomTypeId || student.roomTypeId)?.toString() || '',
            roomTypeName: student.hostel?.roomTypeName || student.roomTypeName || '',
            costPerBed: student.hostel?.costPerBed || '0',
            totalFees: student.hostel?.totalFees || '0',
            totalMonths: student.hostel?.totalMonths || '',
            startDate: student.hostel?.startDate || '',
            paid: student.hostel?.paid || '0',
          }
        : undefined,
    sslcData: student.sslcData
      ? {
          schoolNameWithAddress: student.sslcData.schoolNameWithAddress || '',
          registrationNo: student.sslcData.registrationNo || '',
          firstLanguage: student.sslcData.firstLanguage || '',
          secondLanguage: student.sslcData.secondLanguage || '',
          thirdLanguage: student.sslcData.thirdLanguage || '',
          percentage: student.sslcData.percentage || '',
          result: student.sslcData.result || '',
          sslcHallTicket: student.sslcData.sslcHallTicket || '',
          sslcMarksSheetFile: student.sslcData.sslcMarksSheetFile || '',
          marksList: (student.sslcData.marksList || []).map((m: any) => ({
            subjectName: m.subjectName || '',
            maxMarks: m.maxMarks || '',
            obtainMarks: m.obtainMarks || '',
          })),
        }
      : undefined,
    studentSessions: student.studentSessions || [],
    name:
      `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim() ||
      '',
    occupation: student.occupation || '',
  }
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function StudentDetails(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchFilters, setSearchFilters] = useState({ classId: '', sectionId: '', keyword: '' })
  const studentSearchParams = useMemo(
    () => ({
      ...(searchFilters.classId ? { schoolClassId: searchFilters.classId } : {}),
      ...(searchFilters.sectionId ? { sectionId: searchFilters.sectionId } : {}),
      ...(searchFilters.keyword ? { searchQuery: searchFilters.keyword } : {}),
    }),
    [searchFilters],
  )

  const {
    data: studentsData,
    isLoading: studentsLoading,
    isFetching: studentsFetching,
    refetch: refetchStudents,
  } = useSearchStudents(studentSearchParams, page, pageSize, 'admissionNo', 'asc')
  const deleteStudents = useDeleteStudents()
  const bulkUploadSessionMutation = useBulkUploadStudentSessions()
  const downloadSessionTemplateMutation = useDownloadStudentSessionTemplate()
  const { data: classesData } = useSchoolClasses()
  const { data: categoriesData } = useStudentCategories()

  const { control, reset, handleSubmit, watch } = useForm<SearchFormValues>({
    defaultValues: { searchClass: '', searchSection: '', searchKeyword: '' },
    mode: 'onSubmit',
  })

  const selectedClass = watch('searchClass')
  const { data: sectionsData } = useSections(Number(selectedClass) || 0)

  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [paginatedStudents, setPaginatedStudents] = useState<Student[]>([])
  const [activeView, setActiveView] = useState<'list' | 'details'>('list')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [fetchedTransport, setFetchedTransport] = useState<FetchedTransport | null>(null)
  const [fetchedHostel, setFetchedHostel] = useState<FetchedHostel | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)
  const { data: sessionsData } = useSessions()

  // ── Session history ──
  const selectedStudentId = selectedStudent?.studentId?.toString() ?? ''
  const {
    data: sessionHistory = [],
    isLoading: isFetchingSessionHistory,
    isError: sessionHistoryError,
  } = useStudentSessionHistory(selectedStudentId)

  const { studentsWithPhotos: studentsWithPhotosList } = useStudentPhotos(paginatedStudents)
  const {
    photoUrl: selectedStudentPhoto,
    loading: photoLoading,
    error: photoError,
  } = useStudentPhoto(selectedStudent?.photo)

  // After your existing hooks (near useStudentPhoto)
const updateDocumentMutation = useUpdateStudentDocument()
const photoInputRef = useRef<HTMLInputElement>(null)

const handlePhotoClick = () => {
  if (photoInputRef.current) photoInputRef.current.click()
}

const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file || !selectedStudent) return
  try {
    await updateDocumentMutation.mutateAsync({
      id: String(selectedStudent.studentId),
      photo: file,
    })
    // Refetch so the new photo loads
    refetchStudents()
  } catch {
    // error already handled in mutation's onError
  }
  // Reset input so the same file can be re-selected
  e.target.value = ''
}

  

  const categoryMap = React.useMemo(() => {
    if (!categoriesData) return new Map()
    return new Map(categoriesData.map((cat: any) => [cat.id, cat.name]))
  }, [categoriesData])

  useEffect(() => {
    if (studentsData?.students) {
      const transformedStudents = studentsData.students
        .map((student: any) => transformApiStudent(student, categoryMap))
        .filter((student: Student | null): student is Student => student !== null)
      setAllStudents(transformedStudents)
      setFilteredStudents(transformedStudents)
    }
  }, [studentsData, categoryMap])

  // ── On student selection: fetch transport & hostel ────────
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudent) {
        setFetchedTransport(null)
        setFetchedHostel(null)
        return
      }

      setIsFetchingDetails(true)
      setFetchedTransport(null)
      setFetchedHostel(null)

      const studentIdNum = Number(selectedStudent.studentId)

      // Transport
      try {
        let transportItems: any[] = []
        try {
          const transportResult = await studentTransportFeesService.filter(
            { studentId: studentIdNum } as any,
            0,
            50,
          )
          const raw = transportResult?.data ?? []
          transportItems = raw.filter((item: any) => {
            const sid = item.studentId ?? item.student?.studentId ?? item.student?.id
            return sid == null || Number(sid) === studentIdNum
          })
        } catch {
          const allTransport = await studentTransportFeesService.getAll(0, 200)
          transportItems = (allTransport?.data ?? []).filter((item: any) => {
            const sid = item.studentId ?? item.student?.studentId ?? item.student?.id
            return Number(sid) === studentIdNum
          })
        }
        if (transportItems.length > 0) {
          const t = transportItems[0]
          setFetchedTransport({
            studentTransportFeesId: t.studentTransportFeesId ?? t.id,
            routeId: t.routeId ?? t.route?.id,
            routeName: t.routeName || t.route?.routeName || t.route?.routeTitle || '',
            pickUpPointId: t.pickUpPointId ?? t.pickupPointId,
            pickUpPointName:
              t.pickUpPointName ||
              t.pickupPointName ||
              t.pickUpPoint?.pickUpPointName ||
              t.pickupPoint?.pickUpPointName ||
              '',
            vehicleId: t.vehicleId ?? t.vehicle?.id,
            vehicleName:
              t.vehicleName ||
              t.vehicleNumber ||
              t.vehicle?.vehicleNumber ||
              t.vehicle?.vehicleNo ||
              '',
            totalFees: t.totalFees ?? t.total ?? t.totalAmount,
            paidFees: t.paidFees ?? t.paid ?? 0,
            startDate: t.startDate || '',
            endDate: t.endDate || '',
            totalMonths: t.totalMonths ?? t.months,
          })
        }
      } catch (err) {
        console.warn('Could not fetch transport details:', err)
      }

      // Hostel
      try {
        let hostelItems: any[] = []
        try {
          const hostelResult = await studentHostelFeesService.filter(
            { studentId: studentIdNum } as any,
            0,
            50,
          )
          const rawContent = hostelResult?.content ?? []
          hostelItems = rawContent.filter((item: any) => {
            const sid = item.studentId ?? item.student?.studentId ?? item.student?.id
            return sid == null || Number(sid) === studentIdNum
          })
        } catch {
          const allHostel = await studentHostelFeesService.getAll(0, 200)
          hostelItems = (allHostel?.content ?? []).filter((item: any) => {
            const sid = item.studentId ?? item.student?.studentId ?? item.student?.id
            return Number(sid) === studentIdNum
          })
        }
        if (hostelItems.length > 0) {
          const h = hostelItems[0]
          setFetchedHostel({
            id: h.id ?? h.studentHostelFeeId ?? h.allocationId,
            hostelId: h.hostelId ?? h.hostelRoom?.hostelId ?? h.hostelRoom?.id,
            hostelName:
              h.hostelName ||
              h.hostel?.hostelName ||
              h.hostelRoom?.hostelName ||
              h.hostelRoom?.hostel?.hostelName ||
              '',
            roomId: h.hostelRoomId ?? h.roomId ?? h.hostelRoom?.id,
            roomNumber:
              h.roomName ||
              h.hostelRoom?.roomNo ||
              h.hostelRoom?.roomNumber ||
              h.roomNo ||
              h.roomNumber ||
              h.room?.roomNo ||
              '',
            roomTypeName:
              h.hostelRoom?.roomType?.roomType ||
              h.hostelRoom?.roomType?.name ||
              h.roomTypeName ||
              h.roomType?.roomType ||
              h.roomType?.name ||
              '',
            costPerBed: h.costPerBed ?? h.hostelRoom?.costPerBed ?? h.room?.costPerBed,
            totalFees: h.totalFees ?? h.total ?? h.totalAmount,
            paidFees: h.paidFees ?? h.paid ?? h.paidAmount ?? 0,
            startDate: h.startDate || h.allotmentDate || '',
            endDate: h.endDate || h.checkoutDate || '',
            totalMonths: h.totalMonths ?? h.months,
          })
        }
      } catch (err) {
        console.warn('Could not fetch hostel details:', err)
      }

      setIsFetchingDetails(false)
    }

    fetchStudentDetails()
  }, [selectedStudent?.studentId])

  useEffect(() => {
    setPaginatedStudents(filteredStudents)
  }, [filteredStudents])

  useEffect(() => {
    if (searchQuery) {
      reset({ searchKeyword: searchQuery })
      setSearchFilters((prev) => ({ ...prev, keyword: searchQuery }))
      setPage(0)
    }
  }, [searchQuery, reset])

  const onSearch = async (data: SearchFormValues) => {
    const classId = data.searchClass ? String(data.searchClass) : ''
    const sectionId = data.searchSection ? String(data.searchSection) : ''
    const keyword = data.searchKeyword?.trim() || ''
    setSearchFilters({ classId, sectionId, keyword })
    setPage(0)
  }

  const handleClearFilters = () => {
    reset({ searchClass: '', searchSection: '', searchKeyword: '' })
    setSearchParams({})
    setSearchFilters({ classId: '', sectionId: '', keyword: '' })
    setPage(0)
  }

  const handleView = (id: string | number): void => {
    const student = filteredStudents.find((s) => s.id === id) ?? allStudents.find((s) => s.id === id)
    if (student) {
      setSelectedStudent(student)
      setActiveView('details')
    }
  }

  const handleEdit = (id: string | number): void => {
    const student = filteredStudents.find((s) => s.id === id) ?? allStudents.find((s) => s.id === id)
    console.log('Passing student to edit:', student);
    if (student) navigate(`/student-admission/${id}`, { state: { student, isEdit: true } })
  }

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const calculateFeeSummary = (feesList?: FeeDetail[]) => {
    if (!feesList || feesList.length === 0) return { total: 0, paid: 0, pending: 0 }
    return feesList.reduce(
      (acc, fee) => ({
        total: acc.total + (parseFloat(fee.totalFees) || 0),
        paid: acc.paid + (parseFloat(fee.paid) || 0),
        pending: acc.pending + (parseFloat(fee.pending) || 0),
      }),
      { total: 0, paid: 0, pending: 0 },
    )
  }

  const calculateGrandTotal = (student: Student) => calculateFeeSummary(student.feesList).total

  const importMutation = {
    mutateAsync: async (file: File) => bulkUploadSessionMutation.mutateAsync(file),
    isPending: bulkUploadSessionMutation.isPending,
  }
  const downloadMutation = {
    mutateAsync: async () => downloadSessionTemplateMutation.mutateAsync(),
    isPending: downloadSessionTemplateMutation.isPending,
  }
   const { t } = useTranslation();
  const T = getPagesDataText(t);

  const baseColumns = [
    { label: T.Admission_No || 'Admission No', key: 'admissionNo' },
    { label: T.Name || 'Name', key: 'studentName' },
    { label: T.Class || 'Class', key: 'class' },
    { label: T.Section || 'Section', key: 'section' },
    { label: T.Category || 'Category', key: 'category' },
    { label: T.Father_Name || 'Father Name', key: 'fatherName' },
    { label: T.Date_Of_Birth || 'Date of Birth', key: 'dob' },
    { label: T.Gender || 'Gender', key: 'gender' },
    { label: T.UID, key: 'uid' },
    { label: T.Address || 'Address', key: 'address' },
  ]

  const columnsWithPhoto = [
    ...baseColumns,
    {
      label: T.Photo,
      key: 'photo',
      render: (_: string, item: Student) => {
        const studentWithPhoto = studentsWithPhotosList.find((s) => s.id === item.id)
        if (studentWithPhoto?.photoLoading) {
          return (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E59513]" />
            </div>
          )
        }
        if (studentWithPhoto?.photoUrl) {
          return (
            <div className="flex items-center justify-center">
              <img
                src={studentWithPhoto.photoUrl}
                alt={item.studentName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <IconField name="FaUser" className="text-gray-400" size={16} />
            </div>
          </div>
        )
      },
    },
  ]

  const classOptions = React.useMemo(
    () => classesData?.map((c: any) => ({ label: c.name || c.className, value: c.id })) || [],
    [classesData],
  )
  const sectionOptions = React.useMemo(
    () => sectionsData?.map((s: any) => ({ label: s.name || s.sectionName, value: s.id })) || [],
    [sectionsData],
  )

  const totalPages = Math.max(1, studentsData?.totalPages ?? 1)
  const isDeleting = deleteStudents.isPending
  const isLoading = studentsLoading || studentsFetching
  const isBackendFiltering = studentsFetching

  const hasTransport =
    !isFetchingDetails &&
    Boolean(
      fetchedTransport?.routeName ||
        fetchedTransport?.pickUpPointName ||
        fetchedTransport?.vehicleName ||
        fetchedTransport?.routeId,
    )
  const hasHostel =
    !isFetchingDetails &&
    Boolean(fetchedHostel?.hostelName || fetchedHostel?.roomNumber || fetchedHostel?.hostelId)

  const displayRouteName = fetchedTransport?.routeName || 'N/A'
  const displayPickupPoint = fetchedTransport?.pickUpPointName || 'N/A'
  const displayVehicle = fetchedTransport?.vehicleName || 'N/A'
  const displayHostelName = fetchedHostel?.hostelName || 'N/A'
  const displayRoomNumber = fetchedHostel?.roomNumber || 'N/A'
  const displayRoomType = fetchedHostel?.roomTypeName || null

  // ── Edit session modal state ──
  const [editSessionModal, setEditSessionModal] = useState<{
    open: boolean
    row: StudentSessionHistoryRow | null
  }>({ open: false, row: null })

  const [editSessionForm, setEditSessionForm] = useState({
    sessionId: '',
    classId: '',
    sectionId: '',
    departmentId: '',
    rollNumber: '',
  })

  const [editSessionError, setEditSessionError] = useState<string | null>(null)
  const updateSessionMutation = useUpdateStudentSession()

  // Ref to capture the section label chosen inside ModalSectionDropdown
  const selectedSectionLabelRef = useRef('')

  const handleOpenEditSession = (row: StudentSessionHistoryRow) => {
    setEditSessionForm({
      sessionId: String(row.studentSessionId ?? ''),
      classId: String(selectedStudent?.classId ?? ''),
      sectionId: String(selectedStudent?.sectionId ?? ''),
      departmentId: String(selectedStudent?.departmentId ?? ''),
      rollNumber: row.rollNo ?? '',
    })
    selectedSectionLabelRef.current =
      selectedStudent?.sectionName ?? selectedStudent?.section ?? ''
    setEditSessionError(null)
    setEditSessionModal({ open: true, row })
  }

  const handleCloseEditSession = () => {
    setEditSessionModal({ open: false, row: null })
    setEditSessionError(null)
  }

  // ── Submit with real-time UI update ──
  const handleSubmitEditSession = async () => {
    if (!selectedStudent) return
    if (!editSessionForm.sessionId || !editSessionForm.classId || !editSessionForm.sectionId) {
      setEditSessionError('Session, Class and Section are required.')
      return
    }
    try {
      setEditSessionError(null)
      await updateSessionMutation.mutateAsync({
        id: String(selectedStudent.studentId),
      data: {
         sessionId: Number(editSessionForm.sessionId),
         classId: Number(editSessionForm.classId),
         sectionId: Number(editSessionForm.sectionId),
         departmentId: Number(editSessionForm.departmentId) || 0,
         rollNumber: Number(editSessionForm.rollNumber) || 0,
    },
      })

      // ── Resolve human-readable labels from dropdown data ──────────────────
      const matchedSession = sessionsData?.find(
        (s: any) => String(s.sessionId ?? s.id) === editSessionForm.sessionId,
      )
      const matchedClass = classesData?.find(
        (c: any) => String(c.id ?? c.schoolClassId) === editSessionForm.classId,
      )
      const newClassName = matchedClass?.name ?? matchedClass?.className ?? selectedStudent.className ?? selectedStudent.class
      const newSectionName = selectedSectionLabelRef.current || selectedStudent.sectionName || selectedStudent.section
      const newSession = matchedSession?.session ?? matchedSession?.sessionName ?? selectedStudent.session

      // ── Patch selectedStudent in-place → header updates instantly ─────────
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              sessionId:   Number(editSessionForm.sessionId),
              session:     newSession ?? prev.session,
              classId:     Number(editSessionForm.classId),
              className:   newClassName,
              class:       newClassName,
              sectionId:   Number(editSessionForm.sectionId),
              sectionName: newSectionName,
              section:     newSectionName,
              ...(editSessionForm.departmentId
                ? { departmentId: Number(editSessionForm.departmentId) }
                : {}),
              rollNo:      Number(editSessionForm.rollNumber) || prev.rollNo,
            }
          : prev,
      )

      // ── Invalidate React Query cache → session history table refetches ─────
      await queryClient.invalidateQueries({
        queryKey: ['studentSessionHistory', String(selectedStudent.studentId)],
      })

      // ── Keep list view consistent ─────────────────────────────────────────
      refetchStudents()

      handleCloseEditSession()
    } catch (err: any) {
      setEditSessionError(err.message || 'Failed to update session')
    }
  }
console.log(selectedStudent)
  return (
    <div className="h-auto w-full flex md:flex-row flex-col bg-white shadow-lg">
      <div className="w-full">
        {/* ── Page header ── */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl sm:text-2xl font-medium text-gray-800">
            {T.Student_Details || 'Student Details'}
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <ExcelActions
              importMutation={importMutation}
              downloadMutation={downloadMutation}
              importLabel="Import XL"
              downloadLabel="Download XL Template"
              onImportSuccess={() => refetchStudents()}
            />
          </div>
        </div>

        {/* ── Search panel ── */}
        <div className="p-4 bg-gray-50">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{T.Search_Students}</h3>
            <form onSubmit={handleSubmit(onSearch)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Dropdown
                  name="searchClass"
                  label={T.Class || 'Class'}
                  control={control}
                  required={false}
                  options={classOptions}
                />
                <Dropdown
                  name="searchSection"
                  label={T.Section || 'Section'}
                  control={control}
                  required={false}
                  options={sectionOptions}
                />
                <TextFields
                  name="searchKeyword"
                  label={T.Name_Admission_UID}
                  placeholder={T.Name_Admission_UID}
                  control={control}
                  required={false}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  name={T.Clear_Filters || 'Clear Filters'}
                  icon={<IconField name="FaTimes" size={18} />}
                  onClick={handleClearFilters}
                  loading={false}
                  showAlways={true}
                />
                <Button
                  name={T.Search || 'Search'}
                  loading={isBackendFiltering}
                  icon={<IconField name="FaSearch" size={18} />}
                  showAlways={true}
                />
              </div>
            </form>
          </div>
        </div>

        {isBackendFiltering && (
          <div className="mx-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
            <IconField name="FaSpinner" size={14} className="animate-spin" />
            <span>Searching records on server...</span>
          </div>
        )}

        <hr className="border-gray-300" />

        {/* ── View tabs ── */}
        <div className="flex justify-between sm:text-xl text-sm lg:text-2xl font-inter text-[#656060]">
          <div className="flex">
            <p
              onClick={() => setActiveView('list')}
              className={`sm:p-3 p-1.5 transition-all cursor-pointer ${activeView === 'list' ? 'border-b-8 border-[#E59513]' : ''}`}
            >
              {T.List_View || 'List View'}
            </p>
            <p className="border-r border-[#7A6D6D]" />
            <p
              onClick={() => setActiveView('details')}
              className={`sm:p-3 p-1.5 transition-all cursor-pointer ${activeView === 'details' ? 'border-b-8 border-[#E59513]' : ''}`}
            >
              {T.Details_View || 'Details View'}
            </p>
          </div>
          {activeView === 'list' && (
            <div className="flex items-center pr-4 text-sm text-gray-600">
              {T.Show || 'Showing'} {paginatedStudents.length} {T.of || 'of'}{' '}
              {studentsData?.totalItems ?? 0} {T.RESULT || 'results'}
            </div>
          )}
        </div>

        {(isLoading || isDeleting) && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E59513]" />
          </div>
        )}

        <div>
          {activeView === 'list' && !isLoading && (
            <>
              {(searchFilters.classId || searchFilters.sectionId || searchFilters.keyword) && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    Found <span className="font-bold">{studentsData?.totalItems ?? 0}</span> students
                    matching your criteria
                  </p>
                </div>
              )}
              <ControlledTable
                data={studentsWithPhotosList}
                columns={columnsWithPhoto}
                fullData={filteredStudents}
                onView={handleView}
                onEdit={handleEdit}
                showForm={() => {}}
                header={false}
                showSearch={false}
                showSelectAll={false}
                enablePermissions={true}
                permissionScope="STUDENT"
                serverPage={page}
                serverTotalPages={totalPages}
                serverTotalItems={studentsData?.totalItems ?? 0}
                serverPageSize={pageSize}
                onServerPageChange={handlePageChange}
                onServerPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
          {/* ════════════════════ DETAILS VIEW ════════════════════ */}
          {activeView === 'details' && !isLoading && (
            <div className="p-4">
              {selectedStudent ? (
                <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
                  {/* ── Header ── */}
                  <div className="flex flex-col md:flex-row items-center md:items-start border-b pb-4 mb-4">
                    {/* Hidden file input */}
<input
  ref={photoInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handlePhotoChange}
/>

{/* Clickable photo wrapper */}
<div
  onClick={handlePhotoClick}
  title="Click to update photo"
  className="relative group cursor-pointer shrink-0"
>
  {photoLoading || updateDocumentMutation.isPending ? (
    <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  ) : selectedStudentPhoto && !photoError ? (
    <img
      src={selectedStudentPhoto}
      alt="Student Avatar"
      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
    />
  ) : (
    <IconField name="FaUserCircle" className="text-gray-400 w-32 h-32 md:text-8xl" />
  )}

  {/* Hover overlay */}
  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                  transition-opacity flex flex-col items-center justify-center gap-1">
    <IconField name="FaCamera" size={20} className="text-white" />
    <span className="text-white text-[10px] font-semibold tracking-wide">
      {updateDocumentMutation.isPending ? 'Uploading…' : 'Change Photo'}
    </span>
  </div>
</div>
                    <div className="md:ml-6 flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-blue-600 mb-2">
                        {selectedStudent.studentName}
                      </h2>
                      <div className="space-y-1 mb-3">
                        {selectedStudent.session && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">{T.Session}: </span>
                            <span className="text-gray-600 text-sm">{selectedStudent.session}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-semibold text-gray-600">
                            {T.Admission_No || 'Admission No'}:{' '}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {selectedStudent.admissionNo}
                          </span>
                        </div>
                        {selectedStudent.stsNumber && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">STS No: </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.stsNumber}
                            </span>
                          </div>
                        )}
                        {selectedStudent.grNumber && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">GR No: </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.grNumber}
                            </span>
                          </div>
                        )}
                        
                        {selectedStudent.udiseNumber && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">UDISE No: </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.udiseNumber}
                            </span>
                          </div>
                        )}
                        {selectedStudent.departmentName && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">
                              {T.Department}:{' '}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.departmentName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ── Class / Section / Roll + inline Edit Session button ── */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-gray-600 font-medium">
                          {T.Class || 'Class'}:{' '}
                          {selectedStudent.className || selectedStudent.class}
                          {(selectedStudent.sectionName || selectedStudent.section) && (
                            <> — {selectedStudent.sectionName || selectedStudent.section}</>
                          )}
                          {selectedStudent.rollNo && (
                            <span className="ml-3 text-sm text-gray-500">
                              | Roll No: {selectedStudent.rollNo}
                            </span>
                          )}
                        </p>
                        <button
                          onClick={() =>
                            handleOpenEditSession({
                              studentSessionId: selectedStudent.sessionId as any,
                              session: selectedStudent.session ?? '',
                              className:
                                selectedStudent.className ?? selectedStudent.class ?? '',
                              sectionName:
                                selectedStudent.sectionName ?? selectedStudent.section ?? '',
                              rollNo: String(selectedStudent.rollNo ?? ''),
                              departmentName: selectedStudent.departmentName ?? '',
                              startDate: '',
                              endDate: '',
                              status: 'ACTIVE',
                            })
                          }
                          title="Edit current session"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                                     bg-amber-50 text-amber-700 border border-amber-200
                                     hover:bg-amber-100 hover:border-amber-400 transition-colors"
                        >
                          <IconField name="FaEdit" size={10} />
                          Edit Session
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {isFetchingDetails ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400" />
                            Loading details...
                          </span>
                        ) : (
                          <>
                            {hasTransport && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                <IconField name="FaBus" size={11} /> Transport Enrolled
                              </span>
                            )}
                            {hasHostel && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                <IconField name="FaHome" size={11} /> Hostel Enrolled
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Personal / Parent / Contact ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Personal */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">
                        {T.Personal_Information}
                      </h3>
                      <div>
                        <p className="text-sm text-gray-500">
                          {T.Date_Of_Birth || 'Date of Birth'}
                        </p>
                        <p className="font-medium">{selectedStudent.dob || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{T.Gender || 'Gender'}</p>
                        <p className="font-medium">{selectedStudent.gender || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {T.Category || 'Category'}
                        </p>
                        <p className="font-medium">{selectedStudent.category || '—'}</p>
                      </div>
                      {selectedStudent.bloodGroup && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Blood_Group}</p>
                          <p className="font-medium">{selectedStudent.bloodGroup}</p>
                        </div>
                      )}
                      {selectedStudent.religion && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Religion}</p>
                          <p className="font-medium">{selectedStudent.religion}</p>
                        </div>
                      )}
                      {selectedStudent.castName && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Caste}</p>
                          <p className="font-medium">{selectedStudent.castName}</p>
                        </div>
                      )}
                      {(selectedStudent.aadhaarNumber || selectedStudent.uid) && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Aadhaar_Number}</p>
                          <p className="font-medium">
                            {selectedStudent.aadhaarNumber || selectedStudent.uid}
                          </p>
                        </div>
                      )}
                      {selectedStudent.admissionDate && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Admission_Date}</p>
                          <p className="font-medium">{selectedStudent.admissionDate}</p>
                        </div>
                      )}
                      {selectedStudent.rte && (
                        <div>
                          <p className="text-sm text-gray-500">RTE</p>
                          <p className="font-medium">{selectedStudent.rte}</p>
                        </div>
                      )}
                      {selectedStudent.isDisabled && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Disabled_Reason}</p>
                          <p className="font-medium text-red-600">
                            {selectedStudent.disableReason || 'Yes'}
                          </p>
                        </div>
                      )}
                      {selectedStudent.placeOfBirth && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Place_of_Birth}</p>
                          <p className="font-medium">{selectedStudent.placeOfBirth}</p>
                        </div>
                      )}
                      {selectedStudent.taluk && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Taluk}</p>
                          <p className="font-medium">{selectedStudent.taluk}</p>
                        </div>
                      )}
                      {selectedStudent.district && (
                        <div>
                          <p className="text-sm text-gray-500">{T.District}</p>
                          <p className="font-medium">{selectedStudent.district}</p>
                        </div>
                      )}
                      {selectedStudent.state && (
                        <div>
                          <p className="text-sm text-gray-500">{T.State}</p>
                          <p className="font-medium">{selectedStudent.state}</p>
                        </div>
                      )}
                      {selectedStudent.nationality && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Nationality}</p>
                          <p className="font-medium">{selectedStudent.nationality}</p>
                        </div>
                      )}
                      {(selectedStudent.height || selectedStudent.weight) && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            {T.Physical_Details}
                          </p>
                          {selectedStudent.height && (
                            <div>
                              <p className="text-sm text-gray-500">{T.Height}</p>
                              <p className="font-medium">{selectedStudent.height} cm</p>
                            </div>
                          )}
                          {selectedStudent.weight && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">{T.Weight}</p>
                              <p className="font-medium">{selectedStudent.weight} kg</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Parent */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">
                        {T.Parent_Information || 'Parent Information'}
                      </h3>
                      {selectedStudent.parentName && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Parent_Full_Name}</p>
                          <p className="font-medium">{selectedStudent.parentName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">
                          {T.Father_Name || 'Father Name'}
                        </p>
                        <p className="font-medium">{selectedStudent.fatherName || '—'}</p>
                      </div>
                      {selectedStudent.motherName && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Mother_Name || 'Mother Name'}
                          </p>
                          <p className="font-medium">{selectedStudent.motherName}</p>
                        </div>
                      )}
                      {selectedStudent.parentDefaultParent && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Default_Parent}</p>
                          <p className="font-medium">{selectedStudent.parentDefaultParent}</p>
                        </div>
                      )}
                      {selectedStudent.fatherPhone && (
                        <div>
                          <p className="text-sm text-gray-500">Father's Phone</p>
                          <p className="font-medium">{selectedStudent.fatherPhone}</p>
                        </div>
                      )}
                      {selectedStudent.aadhaarNumber && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Aadhaar_Number}</p>
                          <p className="font-medium">{selectedStudent.aadhaarNumber}</p>
                        </div>
                      )}
                      {selectedStudent.parentOccupation && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Father_Occupation}</p>
                          <p className="font-medium">{selectedStudent.parentOccupation}</p>
                        </div>
                      )}
                      {selectedStudent.parentAnnualIncome && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Annual_Income}</p>
                          <p className="font-medium">₹ {selectedStudent.parentAnnualIncome}</p>
                        </div>
                      )}
                      {selectedStudent.parentNoOfDependents && (
                        <div>
                          <p className="text-sm text-gray-500">{T.No_of_Dependents}</p>
                          <p className="font-medium">{selectedStudent.parentNoOfDependents}</p>
                        </div>
                      )}
                      {selectedStudent.parentQualification && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Qualification}</p>
                          <p className="font-medium">{selectedStudent.parentQualification}</p>
                        </div>
                      )}
                      {selectedStudent.parentIncomeCertificateNumber && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Income_Certificate_No}</p>
                          <p className="font-medium">
                            {selectedStudent.parentIncomeCertificateNumber}
                          </p>
                        </div>
                      )}
                      
                    </div>

                    {/* Contact */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">
                        {T.Contact_Information || 'Contact Information'}
                      </h3>
                      <div>
                        <p className="text-sm text-gray-500">{T.Mobile_Number}</p>
                        <p className="font-medium">{selectedStudent.parentPhone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{T.Alternate_Phone}</p>
                        <p className="font-medium">{selectedStudent.parentAlternatePhoneNumber || '—'}</p>
                      </div>
                      {selectedStudent.parentEmail && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Parent_Email}</p>
                          <p className="font-medium">{selectedStudent.parentEmail}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">{T.Permanent_Address}</p>
                        <p className="font-medium">
                          {selectedStudent.permanentAddress &&
                          selectedStudent.permanentAddress !== 'N/A'
                            ? selectedStudent.permanentAddress
                            : '—'}
                        </p>
                      </div>
                      {selectedStudent.previousSchool && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Previous_School}</p>
                          <p className="font-medium">{selectedStudent.previousSchool}</p>
                        </div>
                      )}
                      {(selectedStudent.bankAccountNumber ||
                        selectedStudent.bankName ||
                        selectedStudent.ifscCode) && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold text-gray-600 mb-2">{T.Bank_Account_Details}</p>
                          {selectedStudent.bankName && (
                            <div>
                              <p className="text-sm text-gray-500">{T.Bank_Name}</p>
                              <p className="font-medium">{selectedStudent.bankName}</p>
                            </div>
                          )}
                          {selectedStudent.bankAccountNumber && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">{T.Bank_Account_Number}</p>
                              <p className="font-medium">{selectedStudent.bankAccountNumber}</p>
                            </div>
                          )}
                          {selectedStudent.ifscCode && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">{T.IFSC_Code}</p>
                              <p className="font-medium">{selectedStudent.ifscCode}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Siblings ── */}
                  {selectedStudent.siblingsList && selectedStudent.siblingsList.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                        Sibling Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedStudent.siblingsList.map((sibling, idx) => (
                          <div
                            key={sibling.siblingsId || idx}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Sibling {idx + 1}
                            </p>
                            <div>
                              <p className="text-xs text-gray-500">{T.Name}</p>
                              <p className="font-medium text-sm">{sibling.siblingName || '—'}</p>
                            </div>
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">Class</p>
                              <p className="font-medium text-sm">
                                {sibling.siblingClassName || '—'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── SSLC ── */}
                  {selectedStudent.sslcData && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                        {T.SSLC_Details}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {selectedStudent.sslcData.schoolNameWithAddress && (
                          <div>
                            <p className="text-sm text-gray-500">{T.School_Name_And_Address}</p>
                            <p className="font-medium">
                              {selectedStudent.sslcData.schoolNameWithAddress}
                            </p>
                          </div>
                        )}
                        {selectedStudent.previousSchoolClass && (
                          <div>
                            <p className="text-sm text-gray-500">{T.Previous_School_Class}</p>
                            <p className="font-medium">{selectedStudent.previousSchoolClass}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.registrationNo && (
                          <div>
                            <p className="text-sm text-gray-500">{T.SSLC_Registration_No}</p>
                            <p className="font-medium">{selectedStudent.sslcData.registrationNo}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.percentage && (
                          <div>
                            <p className="text-sm text-gray-500">{T.Percentage}</p>
                            <p className="font-medium">{selectedStudent.sslcData.percentage}%</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.result && (
                          <div>
                            <p className="text-sm text-gray-500">{T.SSLC_Result}</p>
                            <p
                              className={`font-medium ${selectedStudent.sslcData.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {selectedStudent.sslcData.result}
                            </p>
                          </div>
                        )}
                        {selectedStudent.sslcData.firstLanguage && (
                          <div>
                            <p className="text-sm text-gray-500">{T.SSLC_First_Language}</p>
                            <p className="font-medium">{selectedStudent.sslcData.firstLanguage}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.secondLanguage && (
                          <div>
                            <p className="text-sm text-gray-500">{T.SSLC_Second_Language}</p>
                            <p className="font-medium">{selectedStudent.sslcData.secondLanguage}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.thirdLanguage && (
                          <div>
                            <p className="text-sm text-gray-500">{T.SSLC_Third_Language}</p>
                            <p className="font-medium">{selectedStudent.sslcData.thirdLanguage}</p>
                          </div>
                        )}
                      </div>
                      {selectedStudent.sslcData.marksList &&
                        selectedStudent.sslcData.marksList.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                                    {T.Subject}
                                  </th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                    {T.Max_Marks}
                                  </th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                    {T.Marks_Obtained}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedStudent.sslcData.marksList.map((mark, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-800 border-b">
                                      {mark.subjectName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-800 border-b">
                                      {mark.maxMarks}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium border-b">
                                      {mark.obtainMarks}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </div>
                  )}
                  {(selectedStudent.aadhaarFile ||
                    selectedStudent.birthCertificateFile ||
                    selectedStudent.parentAdhaar) && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                        {T.Other_Document}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedStudent.aadhaarFile && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.aadhaarFile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-blue-500 mb-1">
                              {T.Student_Aadhaar_File}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition truncate">
                              {selectedStudent.aadhaarFile.split('/').pop() || 'Aadhaar Document'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-blue-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.birthCertificateFile && (
                          <div
                           className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.birthCertificateFile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-green-500 mb-1">
                              {T.Birth_Certificate}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition truncate">
                              {selectedStudent.birthCertificateFile || 'Birth Certificate'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-green-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.fatherAdhaar && (
                          <div
                           className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.fatherAdhaar!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Father_Aadhaar_File || 'Father Aadhaar'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.fatherAdhaar.split('/').pop() || 'Father Aadhaar'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.motherAdhaar && (
                          <div
                           className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.motherAdhaar!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Mother_Aadhaar_File}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.motherAdhaar.split('/').pop() || 'Mother Aadhaar'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.migrationBonafile && (
                          <div
                           className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.migrationBonafile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Migration_Bonafide}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.migrationBonafile.split('/').pop() || 'Migration Bonafide'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        
                        {selectedStudent.incomeCasteCertificate && (
                          <div
                           className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.incomeCasteCertificate!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Income_Certificate}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.incomeCasteCertificate.split('/').pop() || 'Income Caste Certificate'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.bankPassbookFile && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.bankPassbookFile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Bank_Passbook_File}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.bankPassbookFile.split('/').pop() || 'Bank Passbook'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.sslcData && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => selectedStudent.sslcData?.sslcHallTicket && openDocument(selectedStudent.sslcData.sslcHallTicket)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.SSLC_Hall_Ticket}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.sslcData.sslcHallTicket?.split('/').pop() || T.SSLC_Hall_Ticket}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.sslcData && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => selectedStudent.sslcData?.sslcMarksSheetFile && openDocument(selectedStudent.sslcData.sslcMarksSheetFile)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.SSLC_Marks_Sheet}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.sslcData.sslcMarksSheetFile?.split('/').pop() || T.SSLC_Marks_Sheet}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                        {selectedStudent.transferCertificate && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.transferCertificate!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Transfer_Certificate}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.transferCertificate.split('/').pop() || T.Transfer_Certificate}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              Click to open
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                      <IconField name="FaHistory" size={18} className="text-[#E59513]" />
                        {T.Session_history || 'Session History'}
                      {!isFetchingSessionHistory && sessionHistory.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
                          {sessionHistory.length} {T.Session}{sessionHistory.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>

                    {isFetchingSessionHistory ? (
                      <div className="flex items-center gap-3 text-gray-500 text-sm py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#E59513]" />
                        {T.Session_history_loading || 'Loading session history...'}
                      </div>
                    ) : sessionHistoryError ? (
                      <div className="flex flex-col items-center justify-center py-8 text-red-400 bg-red-50 rounded-lg border border-dashed border-red-200">
                        <IconField
                          name="FaExclamationTriangle"
                          size={28}
                          className="mb-2 text-red-300"
                        />
                        <p className="text-sm font-medium">{T.Session_history_failed || 'Failed to load session history'}</p>
                        <p className="text-xs mt-1 text-red-400">{T.Session_history_refresh || 'Please try refreshing the page.'}</p>
                      </div>
                    ) : sessionHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <IconField
                          name="FaCalendarTimes"
                          size={28}
                          className="mb-2 text-gray-300"
                        />
                        <p className="text-sm font-medium">{T.No_session_history_available || 'No session history available'}</p>
                        <p className="text-xs mt-1 text-gray-400">
                          {T.Session_Records_Available || 'Session records will appear here once the student has been enrolled across multiple years.'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full bg-white text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                #
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Session}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                               {T.Class}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Section}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Roll_No}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Department}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Start_Date}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.End_Date}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Status}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                               {T.Action}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {sessionHistory.map((row: StudentSessionHistoryRow, idx: number) => (
                              <tr
                                key={row.studentSessionId || idx}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="font-semibold text-gray-800">
                                    {row.session || '—'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                                  {row.className || '—'}
                                </td>
                                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                  {row.sectionName || '—'}
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                  {row.rollNo || '—'}
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                  {row.departmentName || '—'}
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                  {row.startDate || '—'}
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                  {row.endDate || '—'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <SessionStatusBadge status={row.status} />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <button
                                    onClick={() => handleOpenEditSession(row)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                                               bg-amber-50 text-amber-700 border border-amber-200
                                               hover:bg-amber-100 hover:border-amber-400 transition-colors"
                                  >
                                    <IconField name="FaEdit" size={11} />
                                    {T.Edit}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {isFetchingDetails ? (
                    <div className="mt-6 border-t pt-6 flex items-center gap-3 text-gray-500 text-sm">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                      Loading transport and hostel information...
                    </div>
                  ) : (
                    <>
                      {/* Transport */}
                      {hasTransport && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                            <IconField name="FaBus" size={18} className="text-blue-500" />
                            {T.Transport_Information}
                          </h3>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-blue-600 font-medium mb-1">
                                  {T.Route}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayRouteName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-blue-600 font-medium mb-1">
                                  {T.Pickup_Point}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayPickupPoint}</p>
                              </div>
                              {displayVehicle && displayVehicle !== 'N/A' && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Vehicle}
                                  </p>
                                  <p className="text-gray-800 font-semibold">{displayVehicle}</p>
                                </div>
                              )}
                              {fetchedTransport?.totalFees != null && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Monthly_Fees}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    ₹ {fetchedTransport.totalFees}
                                  </p>
                                </div>
                              )}
                              {fetchedTransport?.startDate && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Start_Date}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedTransport.startDate}
                                  </p>
                                </div>
                              )}
                              {fetchedTransport?.endDate && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.End_Date}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedTransport.endDate}
                                  </p>
                                </div>
                              )}
                              {fetchedTransport?.totalMonths != null && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Total_Months}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedTransport.totalMonths}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hostel */}
                      {hasHostel && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                            <IconField name="FaHome" size={18} className="text-purple-500" />
                            {T.Hostel_Information}
                          </h3>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-purple-600 font-medium mb-1">
                                  {T.Hostel_Name}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayHostelName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-purple-600 font-medium mb-1">
                                  {T.Room_Number}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayRoomNumber}</p>
                              </div>
                              {displayRoomType && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Room_Type}
                                  </p>
                                  <p className="text-gray-800 font-semibold">{displayRoomType}</p>
                                </div>
                              )}
                              {fetchedHostel?.costPerBed != null && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Cost_Per_Bed}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    ₹ {fetchedHostel.costPerBed}
                                  </p>
                                </div>
                              )}
                              {fetchedHostel?.startDate && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Start_Date}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedHostel.startDate}
                                  </p>
                                </div>
                              )}
                              {fetchedHostel?.endDate && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.End_Date}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedHostel.endDate}
                                  </p>
                                </div>
                              )}
                              {fetchedHostel?.totalMonths != null && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Total_Months}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedHostel.totalMonths}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedStudent.feesList && selectedStudent.feesList.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                        {T.Fees_Information}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {(() => {
                          const summary = calculateFeeSummary(selectedStudent.feesList)
                          return (
                            <>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600 font-medium mb-1">{T.Total_Fees}</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  ₹{summary.total.toFixed(2)}
                                </p>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-600 font-medium mb-1">
                                  {T.Paid}
                                </p>
                                <p className="text-2xl font-bold text-green-700">
                                  ₹{summary.paid.toFixed(2)}
                                </p>
                              </div>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600 font-medium mb-1">
                                  {T.Pending}
                                </p>
                                <p className="text-2xl font-bold text-red-700">
                                  ₹{summary.pending.toFixed(2)}
                                </p>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                                {T.Fees_Type}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                {T.Total_Fees}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                {T.Paid}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                {T.Pending}
                              </th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                                {T.Status}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudent.feesList.map((fee, index) => {
                              const total = parseFloat(fee.totalFees) || 0
                              const paid = parseFloat(fee.paid) || 0
                              const pending = parseFloat(fee.pending) || 0
                              const isPaid = pending === 0 && total > 0
                              const isPartiallyPaid = paid > 0 && pending > 0
                              return (
                                <tr
                                  key={fee.feesId || index}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-sm text-gray-800 border-b">
                                    {fee.feeTypeName}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-800 border-b">
                                    ₹{total.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-green-600 font-medium border-b">
                                    ₹{paid.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-red-600 font-medium border-b">
                                    ₹{pending.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-center border-b">
                                    {isPaid ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {T.Paid}
                                      </span>
                                    ) : isPartiallyPaid ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        {T.Paid}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {T.Pending}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                            <tr className="bg-gray-100 font-bold">
                              <td className="px-4 py-4 text-sm text-gray-900 border-t-2">
                                {T.Grand_Total}
                              </td>
                              <td className="px-4 py-4 text-sm text-right text-gray-900 border-t-2">
                                ₹{calculateGrandTotal(selectedStudent).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-sm text-right text-green-700 border-t-2">
                                ₹{calculateFeeSummary(selectedStudent.feesList).paid.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-sm text-right text-red-700 border-t-2">
                                ₹
                                {calculateFeeSummary(selectedStudent.feesList).pending.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-center border-t-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800">
                                  {T.Total}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                    <Button
                      name="Edit Student"
                      loading={false}
                      onClick={() => handleEdit(selectedStudent.id)}
                      icon={<IconField name="FaEdit" size={18} />}
                    />
                    <Button
                      name="Back to List"
                      loading={false}
                      onClick={() => setActiveView('list')}
                      icon={<IconField name="FaArrowLeft" size={18} />}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-blue-100 text-blue-700 p-4 rounded-md border border-blue-300 mt-6">
                  <strong>{T.No_Record_Found || 'No Record Found'}</strong>
                  <p className="mt-2">{T.Please_select_a_student_from_the_list_view_to_see_details}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editSessionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <IconField name="FaEdit" size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">
                    {T.Update_Current_Session}
                  </h2>
                  <p className="text-amber-100 text-xs mt-0.5">{selectedStudent?.studentName}</p>
                </div>
              </div>
              <button
                onClick={handleCloseEditSession}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              >
                <IconField name="FaTimes" size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {editSessionError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  <IconField name="FaExclamationTriangle" size={13} />
                  {editSessionError}
                </div>
              )}

              {/* Session */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {T.Session} <span className="text-red-500">*</span>
                </label>
                <select
                  value={editSessionForm.sessionId}
                  onChange={(e) =>
                    setEditSessionForm((f) => ({ ...f, sessionId: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                             transition-shadow bg-white"
                >
                  <option value="">— Select Session —</option>
                  {sessionsData?.map((s: any) => (
                    <option key={s.sessionId ?? s.id} value={String(s.sessionId ?? s.id)}>
                      {s.session ?? s.sessionName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {T.Class} <span className="text-red-500">*</span>
                </label>
                <select
                  value={editSessionForm.classId}
                  onChange={(e) =>
                    setEditSessionForm((f) => ({
                      ...f,
                      classId: e.target.value,
                      sectionId: '',
                      departmentId: '',
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                             transition-shadow bg-white"
                >
                  <option value="">— Select Class —</option>
                  {classesData?.map((c: any) => (
                    <option key={c.id ?? c.schoolClassId} value={String(c.id ?? c.schoolClassId)}>
                      {c.name ?? c.className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department — driven by selected classId */}
              <ModalDepartmentDropdown
                classId={editSessionForm.classId}
                value={editSessionForm.departmentId}
                onChange={(val) => setEditSessionForm((f) => ({ ...f, departmentId: val }))}
              />

              {/* Section — independent fetch driven by modal's classId */}
              <ModalSectionDropdown
                classId={editSessionForm.classId}
                value={editSessionForm.sectionId}
                onChange={(val) => setEditSessionForm((f) => ({ ...f, sectionId: val }))}
                onLabelChange={(label) => {
                  selectedSectionLabelRef.current = label
                }}
              />

              {/* Roll Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {T.Roll_Number}
                </label>
                <input
                  type="number"
                  value={editSessionForm.rollNumber}
                  onChange={(e) =>
                    setEditSessionForm((f) => ({ ...f, rollNumber: e.target.value }))
                  }
                  placeholder="Enter roll number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                             transition-shadow"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button
                onClick={handleCloseEditSession}
                disabled={updateSessionMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg
                           hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEditSession}
                disabled={updateSessionMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold
                           bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg
                           hover:from-amber-600 hover:to-orange-600
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all shadow-sm hover:shadow-md"
              >
                {updateSessionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    {T.Saving}
                  </>
                ) : (
                  <>
                    <IconField name="FaSave" size={13} />
                    {T.Edit_Session}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { IconField } from '../../../components'
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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
  useStudents,
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

// ─────────────────────────────────────────────
// Interfaces  (unchanged)
// ─────────────────────────────────────────────

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

type DisabledStudent = {
  sslcHallTicket?: string
  fatherAdhaar: any
  motherAdhaar: any
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

type DisabledStudentWithPhoto = DisabledStudent & {
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
// Session status badge  (unchanged)
// ─────────────────────────────────────────────
const SessionStatusBadge = ({ status }: { status: string }) => {
  const upper = (status || '').toUpperCase()
  if (upper === 'ACTIVE')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Active
      </span>
    )
  if (upper === 'PASS')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        Pass
      </span>
    )
  if (upper === 'PASSED_OUT' || upper === 'PASSEDOUT')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        Passed Out
      </span>
    )
  if (upper === 'INACTIVE')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
        Inactive
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
// ModalSectionDropdown / ModalDepartmentDropdown  (unchanged)
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
      const found = modalSections?.find((s: any) => String(s.id ?? s.sectionId) === val)
      onLabelChange(found?.name ?? found?.sectionName ?? '')
    }
  }
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Section <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={!classId}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow bg-white disabled:bg-gray-50 disabled:text-gray-400"
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
        const baseUrl = typeof API_BASE_URL !== 'undefined' && API_BASE_URL ? API_BASE_URL : ''
        const res = await fetch(
          `${baseUrl}/schoolGroup/${schoolGroupCode}/school/${schoolCode}/class/${classId}/all`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const raw: any[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.data?.departments)
            ? json.data.departments
            : Array.isArray(json)
              ? json
              : []
        setDepartments(
          raw
            .filter((d: any) => d.departmentId != null)
            .map((d: any) => ({ id: Number(d.departmentId), name: String(d.name || '') })),
        )
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
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!classId || isLoading}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow bg-white disabled:bg-gray-50 disabled:text-gray-400"
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
// Transform helper  (unchanged)
// ─────────────────────────────────────────────
const transformApiDisabledStudent = (
  student: any,
  categoryMap: Map<any, any>,
): DisabledStudent | null => {
  if (!student.disableReasonId && !student.isDisabled) return null
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
    studentId,
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
    transferCertificate: student.transferCertificate || '',
    migrationBonafile: student.migrationBonafide || '',
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
    parentName: student.parent?.name || student.parentName || '',
    parentEmail: student.parent?.email || student.parentEmail || '',
    parentDefaultParent: student.parent?.defaultParent || student.parentDefaultParent || '',
    motherAdhaar: student.parent?.motherAdhaarFile || student.motherAadhaar || '',
    fatherAdhaar: student.parent?.fatherAdhaarFile || student.fatherAadhaar || '',
    parentAadhaarNumber: student.parent?.aadhaarNumber || student.parentAadhaarNumber || '',
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
    categoryName,
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
    bankPassbookFile: student.bankDetails?.bankPassbook || student.bankPassbook || '',
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
  }
}

// ─────────────────────────────────────────────
// Photo hooks  (unchanged)
// ─────────────────────────────────────────────
const useDisabledStudentsPhotos = (students: DisabledStudent[]) => {
  const [studentsWithPhotos, setStudentsWithPhotos] = useState<DisabledStudentWithPhoto[]>([])
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
      const studentsWithPhotoUrls = await Promise.all(
        students.map(async (student) => {
          const studentWithPhoto: DisabledStudentWithPhoto = {
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
            console.error(`Error fetching photo for disabled student ${student.studentId}:`, error)
            studentWithPhoto.photoError = true
            studentWithPhoto.photoLoading = false
            return studentWithPhoto
          }
        }),
      )
      setStudentsWithPhotos(studentsWithPhotoUrls)
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
  return { studentsWithPhotos }
}

const useDisabledStudentPhoto = (photoPath?: string) => {
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
        setPhotoUrl(URL.createObjectURL(blob))
      } catch (error: any) {
        console.error('Error fetching disabled student photo:', error)
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
// Main Component
// ─────────────────────────────────────────────
export default function DisabledStudents(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')
  const navigate = useNavigate()
  
  const queryClient = useQueryClient()

  // ── Single translation object (matches StudentDetails pattern) ──
  const { t } = useTranslation()
  const T = getPagesDataText(t)

  const {
    data: studentsData,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useStudents(0, 100000, 'asc')
  const deleteStudents = useDeleteStudents()
  const bulkUploadSessionMutation = useBulkUploadStudentSessions()
  const downloadSessionTemplateMutation = useDownloadStudentSessionTemplate()
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
      refetchStudents()
    } catch {
      /* error handled in mutation's onError */
    }
    e.target.value = ''
  }

  const { data: classesData } = useSchoolClasses()
  const { data: categoriesData } = useStudentCategories()
  const { data: sessionsData } = useSessions()

  const { control, reset, handleSubmit, watch } = useForm<SearchFormValues>({
    defaultValues: { searchClass: '', searchSection: '', searchKeyword: '' },
    mode: 'onSubmit',
  })

  const selectedClass = watch('searchClass')
  const { data: sectionsData } = useSections(Number(selectedClass) || 0)

  const [allDisabledStudents, setAllDisabledStudents] = useState<DisabledStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<DisabledStudent[]>([])
  const [paginatedStudents, setPaginatedStudents] = useState<DisabledStudent[]>([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchFilters, setSearchFilters] = useState({ classId: '', sectionId: '', keyword: '' })
  const [isBackendFiltering, setIsBackendFiltering] = useState(false)
  const [isFilterActive, setIsFilterActive] = useState(false)
  const [activeView, setActiveView] = useState<'list' | 'details'>('list')
  const [selectedStudent, setSelectedStudent] = useState<DisabledStudent | null>(null)
  const [fetchedTransport, setFetchedTransport] = useState<FetchedTransport | null>(null)
  const [fetchedHostel, setFetchedHostel] = useState<FetchedHostel | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  const selectedStudentId = selectedStudent?.studentId?.toString() ?? ''
  const {
    data: sessionHistory = [],
    isLoading: isFetchingSessionHistory,
    isError: sessionHistoryError,
  } = useStudentSessionHistory(selectedStudentId)

  const { studentsWithPhotos: disabledStudentsWithPhotosList } =
    useDisabledStudentsPhotos(paginatedStudents)
  const {
    photoUrl: selectedStudentPhoto,
    loading: photoLoading,
    error: photoError,
  } = useDisabledStudentPhoto(selectedStudent?.photo)

  const categoryMap = React.useMemo(() => {
    if (!categoriesData) return new Map()
    return new Map(categoriesData.map((cat: any) => [cat.id, cat.name]))
  }, [categoriesData])

  useEffect(() => {
    if (studentsData?.students) {
      const transformedDisabledStudents = studentsData.students
        .filter((student: any) => student.disableReasonId != null && student.disableReasonId !== '')
        .map((student: any) => transformApiDisabledStudent(student, categoryMap))
        .filter((student: DisabledStudent | null): student is DisabledStudent => student !== null)
      setAllDisabledStudents(transformedDisabledStudents)
    }
  }, [studentsData, categoryMap])

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

  const runBackendSearch = useCallback(
    async (classId: string, sectionId: string, keyword: string) => {
      const hasAnyFilter = classId || sectionId || keyword
      if (!hasAnyFilter) {
        setIsFilterActive(false)
        setFilteredStudents(allDisabledStudents)
        setPage(0)
        return
      }
      setIsBackendFiltering(true)
      setIsFilterActive(true)
      setPage(0)
      try {
        const params: any = { studentSessionStatus: 'ACTIVE' }
        if (classId) params.schoolClassId = Number(classId)
        if (sectionId) params.sectionId = Number(sectionId)
        if (keyword?.trim()) params.searchQuery = keyword.trim()
        const result = await studentService.search(params, 0, 100000, 'admissionNo', 'asc')
        const transformed = (result.students || [])
          .map((student: any) => transformApiDisabledStudent(student, categoryMap))
          .filter((s: DisabledStudent | null): s is DisabledStudent => s !== null)
        if (transformed.length > 0) {
          setFilteredStudents(transformed)
        } else {
          let fallback = [...allDisabledStudents]
          if (classId) fallback = fallback.filter((s) => String(s.classId) === String(classId))
          if (sectionId)
            fallback = fallback.filter((s) => String(s.sectionId) === String(sectionId))
          if (keyword?.trim()) {
            const kw = keyword.trim().toLowerCase()
            fallback = fallback.filter(
              (s) =>
                s.studentName?.toLowerCase().includes(kw) ||
                s.admissionNo?.toLowerCase().includes(kw) ||
                s.uid?.toLowerCase().includes(kw) ||
                s.phoneNumber?.toLowerCase().includes(kw) ||
                s.email?.toLowerCase().includes(kw),
            )
          }
          setFilteredStudents(fallback)
        }
      } catch (err) {
        console.warn('Backend search failed, falling back to local filter:', err)
        let fallback = [...allDisabledStudents]
        if (classId) fallback = fallback.filter((s) => String(s.classId) === String(classId))
        if (sectionId) fallback = fallback.filter((s) => String(s.sectionId) === String(sectionId))
        if (keyword?.trim()) {
          const kw = keyword.trim().toLowerCase()
          fallback = fallback.filter(
            (s) =>
              s.studentName?.toLowerCase().includes(kw) ||
              s.admissionNo?.toLowerCase().includes(kw) ||
              s.uid?.toLowerCase().includes(kw) ||
              s.phoneNumber?.toLowerCase().includes(kw) ||
              s.email?.toLowerCase().includes(kw),
          )
        }
        setFilteredStudents(fallback)
      } finally {
        setIsBackendFiltering(false)
      }
    },
    [allDisabledStudents, categoryMap],
  )

  useEffect(() => {
    if (!isFilterActive) setFilteredStudents(allDisabledStudents)
  }, [allDisabledStudents, isFilterActive])
  useEffect(() => {
    const start = page * pageSize
    setPaginatedStudents(filteredStudents.slice(start, start + pageSize))
  }, [filteredStudents, page, pageSize])
  useEffect(() => {
    if (searchQuery) {
      reset({ searchKeyword: searchQuery })
      setSearchFilters((prev) => ({ ...prev, keyword: searchQuery }))
      runBackendSearch('', '', searchQuery)
    }
  }, [searchQuery, reset])

  const onSearch = async (data: SearchFormValues) => {
    const classId = data.searchClass ? String(data.searchClass) : ''
    const sectionId = data.searchSection ? String(data.searchSection) : ''
    const keyword = data.searchKeyword?.trim() || ''
    setSearchFilters({ classId, sectionId, keyword })
    await runBackendSearch(classId, sectionId, keyword)
  }

  const handleClearFilters = () => {
    reset({ searchClass: '', searchSection: '', searchKeyword: '' })
    setSearchParams({})
    setSearchFilters({ classId: '', sectionId: '', keyword: '' })
    setIsFilterActive(false)
    setFilteredStudents(allDisabledStudents)
    setPage(0)
  }

  const handleView = (id: string | number): void => {
    const student = allDisabledStudents.find((s) => s.id === id)
    if (student) {
      setSelectedStudent(student)
      setActiveView('details')
    }
  }

  const handleEdit = (id: string | number): void => {
    const student = allDisabledStudents.find((s) => s.id === id)
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

  const calculateGrandTotal = (student: DisabledStudent) =>
    calculateFeeSummary(student.feesList).total

  const importMutation = {
    mutateAsync: async (file: File) => bulkUploadSessionMutation.mutateAsync(file),
    isPending: bulkUploadSessionMutation.isPending,
  }
  const downloadMutation = {
    mutateAsync: async () => downloadSessionTemplateMutation.mutateAsync(),
    isPending: downloadSessionTemplateMutation.isPending,
  }

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

  const baseColumns = [
    { label: T.Admission_No || 'Admission No', key: 'admissionNo' },
    { label: T.Name || 'Name', key: 'studentName' },
    { label: T.Class || 'Class', key: 'class' },
    { label: T.Section || 'Section', key: 'section' },
    { label: T.Category || 'Category', key: 'category' },
    { label: T.Father_Name || 'Father Name', key: 'fatherName' },
    { label: T.Date_Of_Birth || 'Date of Birth', key: 'dob' },
    { label: T.Gender || 'Gender', key: 'gender' },
    { label: T.Disabled_Reason || 'Disabled Reason', key: 'disableReason' },
    { label: T.UID, key: 'uid' },
    { label: T.Address || 'Address', key: 'address' },
  ]

  const columnsWithPhoto = [
    ...baseColumns,
    {
      label: T.Photo,
      key: 'photo',
      render: (_: string, item: DisabledStudent) => {
        const studentWithPhoto = disabledStudentsWithPhotosList.find((s) => s.id === item.id)
        if (studentWithPhoto?.photoLoading)
          return (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E59513]" />
            </div>
          )
        if (studentWithPhoto?.photoUrl)
          return (
            <div className="flex items-center justify-center">
              <img
                src={studentWithPhoto.photoUrl}
                alt={item.studentName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
          )
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
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const isDeleting = deleteStudents.isPending
  const isLoading = studentsLoading || isBackendFiltering

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
  const selectedSectionLabelRef = useRef('')

  const handleOpenEditSession = (row: StudentSessionHistoryRow) => {
    setEditSessionForm({
      sessionId: String(row.studentSessionId ?? ''),
      classId: String(selectedStudent?.classId ?? ''),
      sectionId: String(selectedStudent?.sectionId ?? ''),
      departmentId: String(selectedStudent?.departmentId ?? ''),
      rollNumber: row.rollNo ?? '',
    })
    selectedSectionLabelRef.current = selectedStudent?.sectionName ?? selectedStudent?.section ?? ''
    setEditSessionError(null)
    setEditSessionModal({ open: true, row })
  }

  const handleCloseEditSession = () => {
    setEditSessionModal({ open: false, row: null })
    setEditSessionError(null)
  }

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
          ...(editSessionForm.departmentId
            ? { departmentId: Number(editSessionForm.departmentId) }
            : {}),
          rollNumber: Number(editSessionForm.rollNumber) || 0,
        },
      })
      const matchedSession = sessionsData?.find(
        (s: any) => String(s.sessionId ?? s.id) === editSessionForm.sessionId,
      )
      const matchedClass = classesData?.find(
        (c: any) => String(c.id ?? c.schoolClassId) === editSessionForm.classId,
      )
      const newClassName =
        matchedClass?.name ??
        matchedClass?.className ??
        selectedStudent.className ??
        selectedStudent.class
      const newSectionName =
        selectedSectionLabelRef.current || selectedStudent.sectionName || selectedStudent.section
      const newSession =
        matchedSession?.session ?? matchedSession?.sessionName ?? selectedStudent.session
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              sessionId: Number(editSessionForm.sessionId),
              session: newSession ?? prev.session,
              classId: Number(editSessionForm.classId),
              className: newClassName,
              class: newClassName,
              sectionId: Number(editSessionForm.sectionId),
              sectionName: newSectionName,
              section: newSectionName,
              ...(editSessionForm.departmentId
                ? { departmentId: Number(editSessionForm.departmentId) }
                : {}),
              rollNo: Number(editSessionForm.rollNumber) || prev.rollNo,
            }
          : prev,
      )
      await queryClient.invalidateQueries({
        queryKey: ['studentSessionHistory', String(selectedStudent.studentId)],
      })
      refetchStudents()
      handleCloseEditSession()
    } catch (err: any) {
      setEditSessionError(err.message || 'Failed to update session')
    }
  }

  return (
    <div className="h-auto w-full flex md:flex-row flex-col bg-white shadow-lg">
      <div className="w-full">
        {/* ── Page header ── */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl sm:text-2xl font-medium text-gray-800">
            {T.Disabled_StudentTitle || 'Disabled Students'}
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {T.Search_Disabled_Students || 'Search Disabled Students'}
            </h3>
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
                  label={T.Name_Admission_UID || 'Name / Admission / UID'}
                  placeholder={T.Name_Admission_UID || 'Name / Admission / UID'}
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
            <span>{'Searching records on server...'}</span>
          </div>
        )}

        <hr className="border-gray-300" />

        {/* ── View tabs ── */}
        <div className="flex justify-between sm:text-xl text-sm lg:text-2xl font-inter text-[#656060]">
          <div className="flex">
            <p
              onClick={() => setActiveView('list')}
              className={`sm:p-3 p-[6px] transition-all cursor-pointer ${activeView === 'list' ? 'border-b-8 border-[#E59513]' : ''}`}
            >
              {T.List_View || 'List View'}
            </p>
            <p className="border-r-[1px] border-[#7A6D6D]" />
            <p
              onClick={() => setActiveView('details')}
              className={`sm:p-3 p-[6px] transition-all cursor-pointer ${activeView === 'details' ? 'border-b-8 border-[#E59513]' : ''}`}
            >
              {T.Details_View || 'Details View'}
            </p>
          </div>
          {activeView === 'list' && (
            <div className="flex items-center pr-4 text-sm text-gray-600">
              {T.Show || 'Showing'} {paginatedStudents.length} {T.of || 'of'}{' '}
              {filteredStudents.length} {T.RESULT || 'results'}
            </div>
          )}
        </div>

        {(isLoading || isDeleting) && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E59513]" />
          </div>
        )}

        {!isLoading && !isDeleting && allDisabledStudents.length === 0 && (
          <div className="p-4">
            <div className="bg-blue-100 text-blue-700 p-4 rounded-md border border-blue-300">
              <strong>{T.No_Record_Found || 'No Record Found'}</strong>
              <p className="mt-2">
                {T.No_Disabled_Students_Message ||
                  'There are currently no disabled students in the system.'}
              </p>
            </div>
          </div>
        )}

        <div>
          {activeView === 'list' && !isLoading && allDisabledStudents.length > 0 && (
            <>
              {(searchFilters.classId || searchFilters.sectionId || searchFilters.keyword) && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    {T.Found || 'Found'}{' '}
                    <span className="font-bold">{filteredStudents.length}</span>{' '}
                    {T.Disabled_Students_Matching || 'disabled students matching your criteria'}
                  </p>
                </div>
              )}
              <ControlledTable
                data={disabledStudentsWithPhotosList}
                columns={columnsWithPhoto}
                fullData={filteredStudents}
                onView={handleView}
                onEdit={handleEdit}
                showForm={() => {}}
                header={false}
                showSearch={false}
                showSelectAll={true}
                enablePermissions={true}
                permissionScope="STUDENT"
                serverPage={page}
                serverTotalPages={totalPages}
                serverTotalItems={filteredStudents.length}
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
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
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
                        <IconField
                          name="FaUserCircle"
                          className="text-gray-400 w-32 h-32 md:text-8xl"
                        />
                      )}
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <IconField name="FaCamera" size={20} className="text-white" />
                        <span className="text-white text-[10px] font-semibold tracking-wide">
                          {updateDocumentMutation.isPending
                            ? T.Upload || 'Uploading…'
                            : T.Update || 'Change Photo'}
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
                            <span className="text-sm font-semibold text-gray-600">
                              {T.Session || 'Session'}:{' '}
                            </span>
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
                            <span className="text-sm font-semibold text-gray-600">
                              {'STS No'}:{' '}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.stsNumber}
                            </span>
                          </div>
                        )}
                        {selectedStudent.grNumber && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">
                              { 'GR No'}:{' '}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.grNumber}
                            </span>
                          </div>
                        )}
                        {selectedStudent.udiseNumber && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">
                              {'UDISE No'}:{' '}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.udiseNumber}
                            </span>
                          </div>
                        )}
                        {selectedStudent.departmentName && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">
                              {T.Department || 'Department'}:{' '}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {selectedStudent.departmentName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ── Class / Section / Roll + Edit Session ── */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-gray-600 font-medium">
                          {T.Class || 'Class'}: {selectedStudent.className || selectedStudent.class}
                          {(selectedStudent.sectionName || selectedStudent.section) && (
                            <> — {selectedStudent.sectionName || selectedStudent.section}</>
                          )}
                          {selectedStudent.rollNo && (
                            <span className="ml-3 text-sm text-gray-500">
                              | {T.Roll_No || 'Roll No'}: {selectedStudent.rollNo}
                            </span>
                          )}
                        </p>
                        <button
                          onClick={() =>
                            handleOpenEditSession({
                              studentSessionId: selectedStudent.sessionId as any,
                              session: selectedStudent.session ?? '',
                              className: selectedStudent.className ?? selectedStudent.class ?? '',
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
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-400 transition-colors"
                        >
                          <IconField name="FaEdit" size={10} />
                          {T.Edit_Session || 'Edit Session'}
                        </button>
                      </div>

                      {/* Disabled badge */}
                      <div className="mt-3 mb-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
                          <IconField name="FaExclamationTriangle" size={12} className="mr-1" />
                          {T.Disabled || 'Disabled'}: {selectedStudent.disableReason}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {isFetchingDetails ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400" />
                            {T.Loading || 'Loading details...'}
                          </span>
                        ) : (
                          <>
                            {hasTransport && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                <IconField name="FaBus" size={11} />{' '}
                                {T.Transport_Enrolled || 'Transport Enrolled'}
                              </span>
                            )}
                            {hasHostel && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                <IconField name="FaHome" size={11} />{' '}
                                {T.Hostel_Enrolled || 'Hostel Enrolled'}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Personal / Parent / Contact grid ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Personal */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">
                        {T.Personal_Information || 'Personal Information'}
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
                        <p className="text-sm text-gray-500">{T.Category || 'Category'}</p>
                        <p className="font-medium">{selectedStudent.category || '—'}</p>
                      </div>
                      {selectedStudent.bloodGroup && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Blood_Group || 'Blood Group'}</p>
                          <p className="font-medium">{selectedStudent.bloodGroup}</p>
                        </div>
                      )}
                      {selectedStudent.religion && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Religion || 'Religion'}</p>
                          <p className="font-medium">{selectedStudent.religion}</p>
                        </div>
                      )}
                      {selectedStudent.castName && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Caste || 'Caste'}</p>
                          <p className="font-medium">{selectedStudent.castName}</p>
                        </div>
                      )}
                      {(selectedStudent.aadhaarNumber || selectedStudent.uid) && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Aadhaar_Number || 'UID / Aadhaar'}
                          </p>
                          <p className="font-medium">
                            {selectedStudent.aadhaarNumber || selectedStudent.uid}
                          </p>
                        </div>
                      )}
                      {selectedStudent.admissionDate && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Admission_Date || 'Admission Date'}
                          </p>
                          <p className="font-medium">{selectedStudent.admissionDate}</p>
                        </div>
                      )}
                      {selectedStudent.rte && (
                        <div>
                          <p className="text-sm text-gray-500">{T.RTE || 'RTE'}</p>
                          <p className="font-medium">{selectedStudent.rte}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">
                          {T.Disabled_Reason || 'Disability Reason'}
                        </p>
                        <p className="font-medium text-red-600">
                          {selectedStudent.disableReason || '—'}
                        </p>
                      </div>
                      {selectedStudent.placeOfBirth && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Place_of_Birth || 'Place of Birth'}
                          </p>
                          <p className="font-medium">{selectedStudent.placeOfBirth}</p>
                        </div>
                      )}
                      {selectedStudent.taluk && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Taluk || 'Taluk'}</p>
                          <p className="font-medium">{selectedStudent.taluk}</p>
                        </div>
                      )}
                      {selectedStudent.district && (
                        <div>
                          <p className="text-sm text-gray-500">{T.District || 'District'}</p>
                          <p className="font-medium">{selectedStudent.district}</p>
                        </div>
                      )}
                      {selectedStudent.state && (
                        <div>
                          <p className="text-sm text-gray-500">{T.State || 'State'}</p>
                          <p className="font-medium">{selectedStudent.state}</p>
                        </div>
                      )}
                      {selectedStudent.nationality && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Nationality || 'Nationality'}</p>
                          <p className="font-medium">{selectedStudent.nationality}</p>
                        </div>
                      )}
                      {(selectedStudent.height || selectedStudent.weight) && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            {T.Physical_Details || 'Physical Details'}
                          </p>
                          {selectedStudent.height && (
                            <div>
                              <p className="text-sm text-gray-500">{T.Height || 'Height'}</p>
                              <p className="font-medium">{selectedStudent.height} cm</p>
                            </div>
                          )}
                          {selectedStudent.weight && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">{T.Weight || 'Weight'}</p>
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
                          <p className="text-sm text-gray-500">{T.Name || 'Name'}</p>
                          <p className="font-medium">{selectedStudent.parentName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">{T.Father_Name || 'Father Name'}</p>
                        <p className="font-medium">{selectedStudent.fatherName || '—'}</p>
                      </div>
                      {selectedStudent.motherName && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Mother_Name || 'Mother Name'}</p>
                          <p className="font-medium">{selectedStudent.motherName}</p>
                        </div>
                      )}
                      {selectedStudent.parentDefaultParent && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Default_Parent || 'Default Parent'}
                          </p>
                          <p className="font-medium">{selectedStudent.parentDefaultParent}</p>
                        </div>
                      )}
                      {selectedStudent.fatherPhone && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Father_Phone || "Father's Phone"}
                          </p>
                          <p className="font-medium">{selectedStudent.fatherPhone}</p>
                        </div>
                      )}
                      {selectedStudent.fatherOccupation && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Father_Occupation || "Father's Occupation"}
                          </p>
                          <p className="font-medium">{selectedStudent.fatherOccupation}</p>
                        </div>
                      )}
                      {selectedStudent.motherPhone && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Mother_Phone || "Mother's Phone"}
                          </p>
                          <p className="font-medium">{selectedStudent.motherPhone}</p>
                        </div>
                      )}
                      {selectedStudent.motherOccupation && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Mother_Occupation || "Mother's Occupation"}
                          </p>
                          <p className="font-medium">{selectedStudent.motherOccupation}</p>
                        </div>
                      )}
                      {selectedStudent.parentOccupation && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Father_Occupation || 'Occupation'}</p>
                          <p className="font-medium">{selectedStudent.parentOccupation}</p>
                        </div>
                      )}
                      {selectedStudent.parentAnnualIncome && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Annual_Income || 'Annual Income'}
                          </p>
                          <p className="font-medium">₹ {selectedStudent.parentAnnualIncome}</p>
                        </div>
                      )}
                      {selectedStudent.parentNoOfDependents && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.No_of_Dependents || 'No. of Dependents'}
                          </p>
                          <p className="font-medium">{selectedStudent.parentNoOfDependents}</p>
                        </div>
                      )}
                      {selectedStudent.parentQualification && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Qualification || 'Qualification'}
                          </p>
                          <p className="font-medium">{selectedStudent.parentQualification}</p>
                        </div>
                      )}
                      {selectedStudent.parentIncomeCertificateNumber && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Income_Certificate_No || 'Income Certificate No.'}
                          </p>
                          <p className="font-medium">
                            {selectedStudent.parentIncomeCertificateNumber}
                          </p>
                        </div>
                      )}
                      {selectedStudent.guardianName && (
                        <>
                          <h4 className="text-sm font-semibold text-gray-600 pt-2 border-t">
                            {T.Guardian_Details || 'Guardian Details'}
                          </h4>
                          <div>
                            <p className="text-sm text-gray-500">
                              {T.Guardian_Name || 'Guardian Name'}
                            </p>
                            <p className="font-medium">{selectedStudent.guardianName}</p>
                          </div>
                          {selectedStudent.guardianRelation && (
                            <div>
                              <p className="text-sm text-gray-500">{ 'Relation'}</p>
                              <p className="font-medium">{selectedStudent.guardianRelation}</p>
                            </div>
                          )}
                          {selectedStudent.guardianPhone && (
                            <div>
                              <p className="text-sm text-gray-500">
                                {T.Guardian_Phone || 'Guardian Phone'}
                              </p>
                              <p className="font-medium">{selectedStudent.guardianPhone}</p>
                            </div>
                          )}
                          {selectedStudent.guardianEmail && (
                            <div>
                              <p className="text-sm text-gray-500">
                                {T.Guardian_Email || 'Guardian Email'}
                              </p>
                              <p className="font-medium">{selectedStudent.guardianEmail}</p>
                            </div>
                          )}
                          {selectedStudent.guardianOccupation && (
                            <div>
                              <p className="text-sm text-gray-500">
                                {T.Guardian_Occupation || 'Guardian Occupation'}
                              </p>
                              <p className="font-medium">{selectedStudent.guardianOccupation}</p>
                            </div>
                          )}
                          {selectedStudent.guardianAddress && (
                            <div>
                              <p className="text-sm text-gray-500">
                                {T.Guardian_Address || 'Guardian Address'}
                              </p>
                              <p className="font-medium">{selectedStudent.guardianAddress}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Contact */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">
                        {T.Contact_Information || 'Contact Information'}
                      </h3>
                      <div>
                        <p className="text-sm text-gray-500">
                          {T.Mobile_Number || "Parent's Phone"}
                        </p>
                        <p className="font-medium">{selectedStudent.parentPhone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {T.Alternate_Phone || 'Parent Alternate Phone Number'}
                        </p>
                        <p className="font-medium">
                          {selectedStudent.parentAlternatePhoneNumber || '—'}
                        </p>
                      </div>
                      {selectedStudent.parentEmail && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Parent_Email || 'Parent Email'}
                          </p>
                          <p className="font-medium">{selectedStudent.parentEmail}</p>
                        </div>
                      )}
                      {selectedStudent.email && (
                        <div>
                          <p className="text-sm text-gray-500">{T.Email || 'Email'}</p>
                          <p className="font-medium">{selectedStudent.email}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">
                          {T.Permanent_Address || 'Permanent Address'}
                        </p>
                        <p className="font-medium">
                          {selectedStudent.permanentAddress &&
                          selectedStudent.permanentAddress !== 'N/A'
                            ? selectedStudent.permanentAddress
                            : '—'}
                        </p>
                      </div>
                      {selectedStudent.previousSchool && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {T.Previous_School || 'Previous School'}
                          </p>
                          <p className="font-medium">{selectedStudent.previousSchool}</p>
                        </div>
                      )}
                      {(selectedStudent.bankAccountNumber ||
                        selectedStudent.bankName ||
                        selectedStudent.ifscCode) && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            {T.Bank_Account_Details || 'Bank Details'}
                          </p>
                          {selectedStudent.bankName && (
                            <div>
                              <p className="text-sm text-gray-500">{T.Bank_Name || 'Bank Name'}</p>
                              <p className="font-medium">{selectedStudent.bankName}</p>
                            </div>
                          )}
                          {selectedStudent.bankAccountNumber && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">
                                {T.Bank_Account_Number || 'Account Number'}
                              </p>
                              <p className="font-medium">{selectedStudent.bankAccountNumber}</p>
                            </div>
                          )}
                          {selectedStudent.ifscCode && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">{T.IFSC_Code || 'IFSC Code'}</p>
                              <p className="font-medium">{selectedStudent.ifscCode}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Siblings, SSLC, Documents, Session History, Transport, Hostel, Fees sections
                      are identical to document 2 — only label strings have been updated to use T.* */}
                  {/* ── Siblings ── */}
                  {selectedStudent.siblingsList && selectedStudent.siblingsList.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                        {T.Sibling_Details || 'Sibling Details'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedStudent.siblingsList.map((sibling, idx) => (
                          <div
                            key={sibling.siblingsId || idx}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              {T.Sibling || 'Sibling'} {idx + 1}
                            </p>
                            <div>
                              <p className="text-xs text-gray-500">{T.Name || 'Name'}</p>
                              <p className="font-medium text-sm">{sibling.siblingName || '—'}</p>
                            </div>
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">{T.Class || 'Class'}</p>
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
                        {T.SSLC_Details || '10th (SSLC) Details'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {selectedStudent.sslcData.schoolNameWithAddress && (
                          <div>
                            <p className="text-sm text-gray-500">
                              {T.School_Name_And_Address || 'School Name & Address'}
                            </p>
                            <p className="font-medium">
                              {selectedStudent.sslcData.schoolNameWithAddress}
                            </p>
                          </div>
                        )}
                        {selectedStudent.previousSchoolClass && (
                          <div>
                            <p className="text-sm text-gray-500">
                              {T.Previous_School_Class || 'Previous School Class'}
                            </p>
                            <p className="font-medium">{selectedStudent.previousSchoolClass}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.registrationNo && (
                          <div>
                            <p className="text-sm text-gray-500">
                              {T.Registration_Number || 'Registration No'}
                            </p>
                            <p className="font-medium">{selectedStudent.sslcData.registrationNo}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.percentage && (
                          <div>
                            <p className="text-sm text-gray-500">{T.Percentage || 'Percentage'}</p>
                            <p className="font-medium">{selectedStudent.sslcData.percentage}%</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.result && (
                          <div>
                            <p className="text-sm text-gray-500">{T.RESULT || 'Result'}</p>
                            <p
                              className={`font-medium ${selectedStudent.sslcData.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {selectedStudent.sslcData.result}
                            </p>
                          </div>
                        )}
                        {selectedStudent.sslcData.firstLanguage && (
                          <div>
                            <p className="text-sm text-gray-500">
                              {T.SSLC_First_Language || 'First Language'}
                            </p>
                            <p className="font-medium">{selectedStudent.sslcData.firstLanguage}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.secondLanguage && (
                          <div>
                            <p className="text-sm text-gray-500">
                              {T.SSLC_Second_Language || 'Second Language'}
                            </p>
                            <p className="font-medium">{selectedStudent.sslcData.secondLanguage}</p>
                          </div>
                        )}
                        {selectedStudent.sslcData.thirdLanguage && (
                          <div>
                            <p className="text-sm text-gray-500">
                              {T.SSLC_Third_Language || 'Third Language'}
                            </p>
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
                                    {T.Subject || 'Subject'}
                                  </th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                    {T.Max_Marks || 'Max Marks'}
                                  </th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                    {T.Marks_Obtained || 'Obtained'}
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

                  {/* ── Documents ── (label strings use T.*, rest unchanged) */}
                  {(selectedStudent.aadhaarFile ||
                    selectedStudent.birthCertificateFile ||
                    selectedStudent.fatherAdhaar ||
                    selectedStudent.motherAdhaar ||
                    selectedStudent.migrationBonafile ||
                    selectedStudent.incomeCasteCertificate ||
                    selectedStudent.bankPassbookFile ||
                    selectedStudent.sslcData ||
                    selectedStudent.transferCertificate ||
                    selectedStudent.parentAdhaar) && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                        {T.Other_Document || 'Document Details'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedStudent.aadhaarFile && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.aadhaarFile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-blue-500 mb-1">
                              {T.Student_Aadhaar_File || 'Student Aadhaar'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition truncate">
                              {selectedStudent.aadhaarFile.split('/').pop() || 'Aadhaar Document'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-blue-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.birthCertificateFile && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.birthCertificateFile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-green-500 mb-1">
                              {T.Birth_Certificate || 'Birth Certificate'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition truncate">
                              {selectedStudent.birthCertificateFile || 'Birth Certificate'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-green-500 transition">
                              {T.Click_To_Open || 'Click to open'}
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
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.motherAdhaar && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.motherAdhaar!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Mother_Aadhaar_File || 'Mother Aadhaar'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.motherAdhaar.split('/').pop() || 'Mother Aadhaar'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.migrationBonafile && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.migrationBonafile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Migration_Bonafide || 'Migration Bonafide'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.migrationBonafile.split('/').pop() ||
                                'Migration Bonafide'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.incomeCasteCertificate && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.incomeCasteCertificate!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Income_Certificate || 'Income Caste Certificate'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.incomeCasteCertificate.split('/').pop() ||
                                'Income Caste Certificate'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.bankPassbookFile && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.bankPassbookFile!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Bank_Passbook_File || 'Bank Passbook'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.bankPassbookFile.split('/').pop() || 'Bank Passbook'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.sslcData && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() =>
                              selectedStudent.sslcData?.sslcHallTicket &&
                              openDocument(selectedStudent.sslcData.sslcHallTicket)
                            }
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.SSLC_Hall_Ticket || 'SSLC Hall Ticket'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.sslcData.sslcHallTicket?.split('/').pop() ||
                                'SSLC Hall Ticket'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.sslcData && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() =>
                              selectedStudent.sslcData?.sslcMarksSheetFile &&
                              openDocument(selectedStudent.sslcData.sslcMarksSheetFile)
                            }
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.SSLC_Marks_Sheet || 'SSLC Marks Sheet'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.sslcData.sslcMarksSheetFile?.split('/').pop() ||
                                'SSLC Marks Sheet'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                        {selectedStudent.transferCertificate && (
                          <div
                            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group"
                            onClick={() => openDocument(selectedStudent.transferCertificate!)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-purple-500 mb-1">
                              {T.Transfer_Certificate || 'Transfer Certificate'}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition truncate">
                              {selectedStudent.transferCertificate.split('/').pop() ||
                                'Transfer Certificate'}
                            </p>
                            <span className="text-xs text-gray-500 group-hover:text-purple-500 transition">
                              {T.Click_To_Open || 'Click to open'}
                            </span>
                          </div>
                        )}
                       
                      </div>
                    </div>
                  )}

                  {/* ── Session History ── */}
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                      <IconField name="FaHistory" size={18} className="text-[#E59513]" />
                      {T.Session_history || 'Session History'}
                      {!isFetchingSessionHistory && sessionHistory.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
                          {sessionHistory.length} {T.Session || 'session'}
                          {sessionHistory.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>
                    {isFetchingSessionHistory ? (
                      <div className="flex items-center gap-3 text-gray-500 text-sm py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#E59513]" />
                        {'Loading session history...'}
                      </div>
                    ) : sessionHistoryError ? (
                      <div className="flex flex-col items-center justify-center py-8 text-red-400 bg-red-50 rounded-lg border border-dashed border-red-200">
                        <IconField
                          name="FaExclamationTriangle"
                          size={28}
                          className="mb-2 text-red-300"
                        />
                        <p className="text-sm font-medium">
                          {T.Session_history_failed || 'Failed to load session history'}
                        </p>
                        <p className="text-xs mt-1 text-red-400">
                          {'Please try refreshing the page.'}
                        </p>
                      </div>
                    ) : sessionHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <IconField
                          name="FaCalendarTimes"
                          size={28}
                          className="mb-2 text-gray-300"
                        />
                        <p className="text-sm font-medium">
                         {T.No_session_history_available || 'No session history available'}
                        </p>
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
                                {T.Session || 'Session / Year'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Class || 'Class'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Section || 'Section'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Roll_No || 'Roll No'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Department || 'Department'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Start_Date || 'Start Date'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.End_Date || 'End Date'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Status || 'Status'}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {T.Action || 'Action'}
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
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-400 transition-colors"
                                  >
                                    <IconField name="FaEdit" size={11} />
                                    {T.Edit || 'Edit'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* ── Transport & Hostel ── */}
                  {isFetchingDetails ? (
                    <div className="mt-6 border-t pt-6 flex items-center gap-3 text-gray-500 text-sm">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                      {'Loading transport & hostel information...'}
                    </div>
                  ) : (
                    <>
                      {hasTransport && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                            <IconField name="FaBus" size={18} className="text-blue-500" />
                            {T.Transport_Information || 'Transport Information'}
                          </h3>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-blue-600 font-medium mb-1">
                                  {T.Route || 'Route Name'}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayRouteName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-blue-600 font-medium mb-1">
                                  {T.Pickup_Point || 'Pickup Point'}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayPickupPoint}</p>
                              </div>
                              {displayVehicle && displayVehicle !== 'N/A' && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Vehicle || 'Vehicle'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">{displayVehicle}</p>
                                </div>
                              )}
                              {fetchedTransport?.totalFees != null && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Monthly_Fees || 'Monthly Fees'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    ₹ {fetchedTransport.totalFees}
                                  </p>
                                </div>
                              )}
                              {fetchedTransport?.startDate && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Start_Date || 'Start Date'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedTransport.startDate}
                                  </p>
                                </div>
                              )}
                              {fetchedTransport?.endDate && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.End_Date || 'End Date'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedTransport.endDate}
                                  </p>
                                </div>
                              )}
                              {fetchedTransport?.totalMonths != null && (
                                <div>
                                  <p className="text-sm text-blue-600 font-medium mb-1">
                                    {T.Total_Months || 'Total Months'}
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
                      {hasHostel && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                            <IconField name="FaHome" size={18} className="text-purple-500" />
                            {T.Hostel_Information || 'Hostel Information'}
                          </h3>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-purple-600 font-medium mb-1">
                                  {T.Hostel_Name || 'Hostel Name'}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayHostelName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-purple-600 font-medium mb-1">
                                  {T.Room_Number || 'Room Number'}
                                </p>
                                <p className="text-gray-800 font-semibold">{displayRoomNumber}</p>
                              </div>
                              {displayRoomType && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Room_Type || 'Room Type'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">{displayRoomType}</p>
                                </div>
                              )}
                              {fetchedHostel?.costPerBed != null && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Cost_Per_Bed || 'Cost Per Bed'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    ₹ {fetchedHostel.costPerBed}
                                  </p>
                                </div>
                              )}
                              {fetchedHostel?.startDate && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Start_Date || 'Start Date'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedHostel.startDate}
                                  </p>
                                </div>
                              )}
                              {fetchedHostel?.endDate && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.End_Date || 'End Date'}
                                  </p>
                                  <p className="text-gray-800 font-semibold">
                                    {fetchedHostel.endDate}
                                  </p>
                                </div>
                              )}
                              {fetchedHostel?.totalMonths != null && (
                                <div>
                                  <p className="text-sm text-purple-600 font-medium mb-1">
                                    {T.Total_Months || 'Total Months'}
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

                  {/* ── Fees ── */}
                  {selectedStudent.feesList && selectedStudent.feesList.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="font-semibold text-lg text-gray-700 border-b pb-3 mb-4">
                        {T.Fees_Information || 'Fees Information'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {(() => {
                          const summary = calculateFeeSummary(selectedStudent.feesList)
                          return (
                            <>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600 font-medium mb-1">
                                  {T.Total_Fees || 'Total Fees'}
                                </p>
                                <p className="text-2xl font-bold text-blue-700">
                                  ₹{summary.total.toFixed(2)}
                                </p>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-600 font-medium mb-1">
                                  {T.Paid || 'Paid Amount'}
                                </p>
                                <p className="text-2xl font-bold text-green-700">
                                  ₹{summary.paid.toFixed(2)}
                                </p>
                              </div>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600 font-medium mb-1">
                                  {T.Pending || 'Pending Amount'}
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
                                {T.Fees_Type || 'Fee Type'}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                {T.Total_Fees || 'Total Fees'}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                {T.Paid || 'Paid'}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                                {T.Pending || 'Pending'}
                              </th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                                {T.Status || 'Status'}
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
                                        {T.Paid || 'Paid'}
                                      </span>
                                    ) : isPartiallyPaid ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        {T.Paid || 'Partial'}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {T.Pending || 'Unpaid'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                            <tr className="bg-gray-100 font-bold">
                              <td className="px-4 py-4 text-sm text-gray-900 border-t-2">
                                {T.Grand_Total || 'GRAND TOTAL'}
                              </td>
                              <td className="px-4 py-4 text-sm text-right text-gray-900 border-t-2">
                                ₹{calculateGrandTotal(selectedStudent).toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-sm text-right text-green-700 border-t-2">
                                ₹{calculateFeeSummary(selectedStudent.feesList).paid.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-sm text-right text-red-700 border-t-2">
                                ₹{calculateFeeSummary(selectedStudent.feesList).pending.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-center border-t-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800">
                                  {T.Total || 'TOTAL'}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                    <Button
                      name={T.Edit_Student || 'Edit Student'}
                      loading={false}
                      onClick={() => handleEdit(selectedStudent.id)}
                      icon={<IconField name="FaEdit" size={18} />}
                    />
                    <Button
                      name={T.Back || 'Back to List'}
                      loading={false}
                      onClick={() => setActiveView('list')}
                      icon={<IconField name="FaArrowLeft" size={18} />}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-blue-100 text-blue-700 p-4 rounded-md border border-blue-300 mt-6">
                  <strong>{T.No_Record_Found || 'No Record Found'}</strong>
                  <p className="mt-2">
                    {T.Select_Disabled_Student ||
                      'Please select a disabled student from the list view to see details.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════ UPDATE CURRENT SESSION MODAL ════════════ */}
      {editSessionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <IconField name="FaEdit" size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">
                    {T.Update_Current_Session || 'Update Current Session'}
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
            <div className="px-6 py-5 space-y-4">
              {editSessionError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  <IconField name="FaExclamationTriangle" size={13} />
                  {editSessionError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {T.Session || 'Session'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={editSessionForm.sessionId}
                  onChange={(e) => setEditSessionForm((f) => ({ ...f, sessionId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow bg-white"
                >
                  <option value="">— {T.Select_Academic_Session || 'Select Session'} —</option>
                  {sessionsData?.map((s: any) => (
                    <option key={s.sessionId ?? s.id} value={String(s.sessionId ?? s.id)}>
                      {s.session ?? s.sessionName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {T.Class || 'Class'} <span className="text-red-500">*</span>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow bg-white"
                >
                  <option value="">— {T.Select_Class || 'Select Class'} —</option>
                  {classesData?.map((c: any) => (
                    <option key={c.id ?? c.schoolClassId} value={String(c.id ?? c.schoolClassId)}>
                      {c.name ?? c.className}
                    </option>
                  ))}
                </select>
              </div>
              <ModalDepartmentDropdown
                classId={editSessionForm.classId}
                value={editSessionForm.departmentId}
                onChange={(val) => setEditSessionForm((f) => ({ ...f, departmentId: val }))}
              />
              <ModalSectionDropdown
                classId={editSessionForm.classId}
                value={editSessionForm.sectionId}
                onChange={(val) => setEditSessionForm((f) => ({ ...f, sectionId: val }))}
                onLabelChange={(label) => {
                  selectedSectionLabelRef.current = label
                }}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {T.Roll_Number || 'Roll Number'}
                </label>
                <input
                  type="number"
                  value={editSessionForm.rollNumber}
                  onChange={(e) =>
                    setEditSessionForm((f) => ({ ...f, rollNumber: e.target.value }))
                  }
                  placeholder={T.Roll_No || 'Enter roll number'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow"
                />
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button
                onClick={handleCloseEditSession}
                disabled={updateSessionMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {T.Cancel || 'Cancel'}
              </button>
              <button
                onClick={handleSubmitEditSession}
                disabled={updateSessionMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {updateSessionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    {T.Saving || 'Saving...'}
                  </>
                ) : (
                  <>
                    <IconField name="FaSave" size={13} />
                    {T.Edit_Session || 'Update Session'}
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

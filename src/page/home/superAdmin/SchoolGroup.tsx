import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, RadioButton, TextField } from '../../../components/controlled'
import BirthDateField from '../../../components/controlled/BirthDateField'
import Dropdown from '../../../components/controlled/Dropdown'
import EmailField from '../../../components/controlled/EmailField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import MobileField from '../../../components/controlled/MobileField'
import TextareaField from '../../../components/controlled/TextareaField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
// page: currentPage, size: PAGE_SIZE
import type {
  AssignSubscriptionRequestDto,
  FilterSchoolGroupRequestDTO,
  SchoolGroup,
  SchoolGroupFilterBarProps,
  SchoolGroupFilterState,
  SchoolGroupForm,
  SchoolGroupLogoProps,
  ViewSchoolGroupModalProps,
} from '../../../types/superAdmin/SchoolGroup'

import type { AddSchoolToGroupForm } from '../../../types/superAdmin/School'

import {
  useFilterSchoolGroups,
  useRegisterSchoolGroup,
  useSchoolGroup,
  useSchoolGroups,
  useSchoolsByGroup,
  useSubscribePackage,
  useUpdateSchoolGroup,
  useUpdateSchoolGroupLogo,
} from "../../../hooks/queries/superAdmin/useschoolGroup"

import { useNavigate } from 'react-router-dom'
import { usePackages } from '../../../hooks/queries/superAdmin/usePackage'
import { useAddSchoolToGroup, useUpdateSchool } from '../../../hooks/queries/superAdmin/useSchool'
import {
  schoolGroupService,
  type SchoolInGroup,
} from '../../../services/superAdmin/schoolGroupService'

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: 'School', value: 'SCHOOL' },
  { label: 'College', value: 'COLLEGE' },
]

const DEFAULT_FILTERS: SchoolGroupFilterState = {
  search: '',
  isActive: '',
  startDate: '',
  endDate: '',
}

const DEFAULT_SCHOOL_GROUP_FORM: SchoolGroupForm = {
  packageId: '',
  schoolGroupName: '',
  phoneNumber: '',
  webSite: '',
  managedBy: '',
  email: '',
  logo: null,
  databaseName: '',
  defaultConnectionString: 'yes',
  dbAddress: '',
  username: '',
  password: '',
  databaseType: '',
}

const DEFAULT_ADD_SCHOOL_FORM: AddSchoolToGroupForm = {
  schoolName: '',
  address: '',
  email: '',
  phoneNumber: '',
  managedBy: '',
  session: '',
  type: '',
  databaseName: '',
  logo: null,
  webSite: '',
}

const DEFAULT_SUB_FORM: AssignSubscriptionRequestDto = {
  transactionId: '',
  invoiceNumber: '',
  amountPaid: 0,
  paidThrough: '',
  paidAt: '',
}

const PAGE_SIZE = 10
const DEBOUNCE_MS = 500

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (iso?: string | null): string => {
  if (!iso) return 'N/A'
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

const hasRealFilters = (dto: FilterSchoolGroupRequestDTO): boolean =>
  Boolean(
    (dto.search && dto.search.trim() !== '') ||
      (dto.isActive !== undefined && dto.isActive !== null) ||
      (dto.startDate && dto.startDate.trim() !== '') ||
      (dto.endDate && dto.endDate.trim() !== '') ||
      (dto.packageCategories && dto.packageCategories.trim() !== ''),
  )

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
const SchoolGroupLogo: React.FC<SchoolGroupLogoProps> = ({ logoPath, schoolGroupName }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!logoPath) return
    let url: string | null = null
    schoolGroupService
      .getLogo(logoPath)
      .then((blob) => {
        url = URL.createObjectURL(blob)
        setBlobUrl(url)
      })
      .catch(() => setImgError(true))
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [logoPath])

  if (blobUrl && !imgError)
    return (
      <img
        src={blobUrl}
        alt={schoolGroupName}
        onError={() => setImgError(true)}
        className="h-16 w-16 rounded-full object-cover shrink-0 border border-gray-200"
      />
    )

  return (
    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
      {schoolGroupName?.charAt(0)?.toUpperCase() ?? 'G'}
    </div>
  )
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm text-gray-800 break-all">{value || 'N/A'}</p>
  </div>
)

// ─── SchoolDetailSubModal ─────────────────────────────────────────────────────

interface SchoolDetailSubModalProps {
  school: SchoolInGroup
  schoolGroupCode: string
  onClose: () => void
  onEditSuccess: () => void
}

const SchoolDetailSubModal: React.FC<SchoolDetailSubModalProps> = ({
  school,
  schoolGroupCode,
  onClose,
  onEditSuccess,
}) => {
  const updateMutation = useUpdateSchool()
  const [isEditing, setIsEditing] = useState(false)

  const { handleSubmit, control, reset } = useForm<AddSchoolToGroupForm>({
    defaultValues: {
      schoolName: school.schoolName ?? '',
      address: school.address ?? '',
      email: school.email ?? '',
      phoneNumber: school.phoneNumber ?? '',
      managedBy: school.managedBy ?? '',
      session: school.session ?? '',
      type: school.type ?? '',
      databaseName: school.databaseName ?? '',
      logo: null,
      webSite: school.webSite ?? '',
    },
  })

  const onSubmit = async (formData: AddSchoolToGroupForm) => {
    try {
      await updateMutation.mutateAsync({
        schoolGroupCode,
        schoolCode: school.schoolCode,
        data: {
          schoolName: formData.schoolName.trim(),
          address: formData.address.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          webSite: formData.webSite?.trim(),
          managedBy: formData.managedBy.trim(),
          session: formData.session.trim(),
          type: formData.type.toUpperCase(),
          databaseName: formData.databaseName.trim().toLowerCase(),
        },
      })
      alert('School updated successfully!')
      setIsEditing(false)
      onEditSuccess()
    } catch (err: any) {
      alert(err?.message ?? 'Something went wrong. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    reset({
      schoolName: school.schoolName ?? '',
      address: school.address ?? '',
      email: school.email ?? '',
      phoneNumber: school.phoneNumber ?? '',
      webSite: school.webSite ?? '',
      managedBy: school.managedBy ?? '',
      session: school.session ?? '',
      type: school.type ?? '',
      databaseName: school.databaseName ?? '',
      logo: null,
    })
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEditing ? 'Edit School/collage' : 'School/Collage Details'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors border border-blue-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <TextField
                name="schoolName"
                label="School/Collage Name"
                placeholder="e.g. Sunrise International School"
                control={control}
                required
              />
              <EmailField
                name="email"
                label="Email"
                placeholder="contact@school.com"
                control={control}
                required
              />
              <MobileField
                name="phoneNumber"
                label="Phone Number"
                placeholder="9123456780"
                control={control}
                required
              />
              <TextField
                name="managedBy"
                label="Managed By"
                placeholder="Managed By"
                control={control}
                required
              />
              <TextField
                name="webSite"
                label="Website"
                control={control}
                required
              />
              <TextareaField
                name="address"
                label="Address"
                placeholder="e.g. 123 Main Street, Pune, Maharashtra"
                control={control}
                rows={3}
                required
              />
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">
                  Session & Type
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <TextField
                    name="session"
                    label="Session"
                    placeholder="e.g. 2026-2027"
                    control={control}
                    required
                  />
                  <Dropdown
                    name="type"
                    label="School / College Type"
                    control={control}
                    required
                    options={TYPE_OPTIONS}
                  />
                  <TextField
                    name="databaseName"
                    label="Database Name"
                    placeholder="e.g. sunrise_school_db"
                    control={control}
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Name + status */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{school.schoolName}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{school.schoolCode}</p>
                </div>
                <span
                  className={`mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    school.isActive === true
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : school.isActive === false
                        ? 'bg-red-50 text-red-500 border border-red-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {school.isActive === true
                    ? 'Active'
                    : school.isActive === false
                      ? 'Inactive'
                      : 'Unknown'}
                </span>
              </div>

              {/* Session & Type info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">
                  Session & Type
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Session</p>
                    <p className="text-sm font-medium text-gray-800">{school.session || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Type</p>
                    <span
                      className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        school.type === 'COLLEGE'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {school.type
                        ? school.type.charAt(0) + school.type.slice(1).toLowerCase()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Other info */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoRow label="Email" value={school.email} />
                <InfoRow label="Phone" value={school.phoneNumber} />
                <InfoRow label="Website" value={school.webSite} />
                <InfoRow label="Managed By" value={school.managedBy} />
                <div className="col-span-2">
                  <InfoRow label="Address" value={school.address} />
                </div>
                <InfoRow label="Database Name" value={school.databaseName} />
                <InfoRow label="Created Date" value={fmt(school.createdDate)} />
              </div>
              <InfoRow label="Tenant ID" value={school.tenantId} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 shrink-0 border-t border-gray-100 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={updateMutation.isPending}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SchoolCard ───────────────────────────────────────────────────────────────

export const SchoolCard = ({
  school, onView, onEdit,
}: {
  school: SchoolInGroup
  onView: () => void
  onEdit: () => void
}) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
        {school.schoolName?.charAt(0)?.toUpperCase() ?? 'S'}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{school.schoolName}</p>
        <p className="text-xs text-gray-400">{school.schoolCode}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          school.isActive
            ? 'bg-green-50 text-green-600 border border-green-200'
            : 'bg-red-50 text-red-500 border border-red-200'
        }`}
      >
        {school.isActive ? 'Active' : 'Inactive'}
      </span>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Edit school"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="View details"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
)

// ─── ViewModal ────────────────────────────────────────────────────────────────

const ViewModal: React.FC<ViewSchoolGroupModalProps> = ({ schoolGroupCode, onClose }) => {
  const { data: sg, isLoading, isError } = useSchoolGroup(schoolGroupCode)
  const [schoolPage, setSchoolPage] = useState(0)
  const [selectedSchool, setSelectedSchool] = useState<SchoolInGroup | null>(null)
  const [editingSchool, setEditingSchool] = useState<SchoolInGroup | null>(null)

  const {
    data: schoolsData,
    isLoading: schoolsLoading,
    refetch: refetchSchools,
  } = useSchoolsByGroup(schoolGroupCode, { page: schoolPage, size: 10 })

  const schools = schoolsData?.schools ?? []
  const totalSchPages = schoolsData?.totalPages ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 pt-6 pb-5 shrink-0 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">School Group Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
          {isError && (
            <p className="text-red-500 text-center py-10">
              Failed to load details. Please try again.
            </p>
          )}
          {!isLoading && !isError && !sg && (
            <p className="text-red-500 text-center py-10">School group not found.</p>
          )}
          {!isLoading && !isError && sg && (
            <div className="space-y-6">
              {/* Group header */}
              <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
                <SchoolGroupLogo schoolGroupName={sg.schoolGroupName} logoPath={sg.logo} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {sg.schoolGroupName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">{sg.schoolGroupCode || '—'}</p>
                  <span
                    className={`mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      sg.isActive
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-red-50 text-red-500 border border-red-200'
                    }`}
                  >
                    {sg.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Subscription info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">
                  Subscription Info
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Plan Name', value: sg.planName },
                    { label: 'Billing Period', value: sg.billingPeriod },
                    { label: 'Created Date', value: fmt(sg.createdDate) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm font-medium text-gray-800">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other fields */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {[
                  { label: 'Email', value: sg.email },
                  { label: 'Phone Number', value: sg.phoneNumber },
                  { label: 'Database Name', value: sg.databaseName },
                  { label: 'DB Type', value: sg.databaseType },
                  { label: 'DB Address', value: sg.dbAddress },
                  { label: 'Username', value: sg.username },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm text-gray-800">{value || 'N/A'}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Default Connection
                  </p>
                  <span
                    className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                      sg.defaultConnectionString
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {sg.defaultConnectionString ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tenant ID</p>
                  <p className="text-sm text-gray-800 break-all">{sg.tenantId || 'N/A'}</p>
                </div>
              </div>

              {/* Schools list */}
              <div className="pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Schools
                  {schoolsData?.totalItems !== undefined && (
                    <span className="ml-2 normal-case text-blue-500 font-medium">
                      ({schoolsData.totalItems})
                    </span>
                  )}
                </p>

                {schoolsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                ) : schools.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No schools found.</p>
                ) : (
                  <>
                    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                      {schools.map((s: SchoolInGroup) => (
                        <li
                          key={s.schoolId}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <p
                            onClick={() => setSelectedSchool(s)}
                            className="text-sm text-gray-800 hover:text-blue-700 font-medium cursor-pointer"
                          >
                            {s.schoolName}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingSchool(s)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                              title="Edit school"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => setSelectedSchool(s)}
                              className="p-1 rounded text-gray-300 hover:text-blue-400 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {totalSchPages > 1 && (
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-400">
                          Page {schoolPage + 1} of {totalSchPages}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSchoolPage((p) => Math.max(0, p - 1))}
                            disabled={schoolPage === 0}
                            className="px-3 py-1 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() =>
                              setSchoolPage((p) => Math.min(totalSchPages - 1, p + 1))
                            }
                            disabled={schoolPage >= totalSchPages - 1}
                            className="px-3 py-1 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 pt-4 shrink-0 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>


      {selectedSchool && (
        <SchoolDetailSubModal
          school={selectedSchool}
          schoolGroupCode={schoolGroupCode}
          onClose={() => setSelectedSchool(null)}
          onEditSuccess={() => {
            refetchSchools()
            setSelectedSchool(null)
          }}
        />
      )}
      {editingSchool && (
        <SchoolDetailSubModal
          school={editingSchool}
          schoolGroupCode={schoolGroupCode}
          onClose={() => setEditingSchool(null)}
          onEditSuccess={() => {
            refetchSchools()
            setEditingSchool(null)
          }}
        />
      )}
    </div>
  )
}

// ─── SubscribeModal ───────────────────────────────────────────────────────────

interface SubscribeModalProps {
  schoolGroupCode: string
  packages: { label: string; value: string }[]
  onClose: () => void
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ schoolGroupCode, packages, onClose }) => {
  const subscribeMutation = useSubscribePackage()
  const [packageId, setPackageId] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  const [subForm, setSubForm] = useState<AssignSubscriptionRequestDto>(DEFAULT_SUB_FORM)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof AssignSubscriptionRequestDto, value: string | number) =>
    setSubForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!packageId) {
      setError('Please select a package.')
      return
    }
    setError(null)
    try {
      await subscribeMutation.mutateAsync({
        schoolGroupCode,
        packageId: Number(packageId),
        dto: subForm,
        isPaid,
      })
      alert('Package assigned successfully!')
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Assign Package</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Package *
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            >
              <option value="">Select a package</option>
              {packages.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="isPaid" className="text-sm text-gray-700">
              Paid transaction
            </label>
          </div>
          {isPaid && (
            <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Payment Details
              </p>
              {[
                { field: 'transactionId' as const, label: 'Transaction ID', type: 'text' },
                { field: 'invoiceNumber' as const, label: 'Invoice Number', type: 'text' },
                { field: 'amountPaid' as const, label: 'Amount Paid', type: 'number' },
                { field: 'paidThrough' as const, label: 'Paid Through', type: 'text' },
                { field: 'paidAt' as const, label: 'Paid At', type: 'datetime-local' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">{label} *</label>
                  <input
                    type={type}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={String(subForm[field])}
                    onChange={(e) =>
                      handleChange(
                        field,
                        type === 'number' ? Number(e.target.value) : e.target.value,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={subscribeMutation.isPending}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {subscribeMutation.isPending ? 'Saving…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── LogoModal ────────────────────────────────────────────────────────────────

interface LogoModalProps {
  schoolGroupCode: string
  onClose: () => void
}

const LogoModal: React.FC<LogoModalProps> = ({ schoolGroupCode, onClose }) => {
  const logoMutation = useUpdateSchoolGroupLogo()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a logo file.')
      return
    }
    setError(null)
    try {
      await logoMutation.mutateAsync({ schoolGroupCode, logo: file })
      alert('Logo updated successfully!')
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update logo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Update Logo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Select new logo *
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={logoMutation.isPending}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {logoMutation.isPending ? 'Uploading…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

const FilterBar: React.FC<SchoolGroupFilterBarProps> = ({ control, onReset, activeCount }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
    <div className="px-5 pt-2 pb-4">
      {activeCount > 0 && (
        <div className="flex justify-end mb-2">
          <button type="button" onClick={onReset} className="text-xs text-blue-600 hover:underline">
            Reset filters ({activeCount})
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
        <TextField
          name="search"
          label="Search"
          control={control}
          placeholder="Name, code, email…"
        />
        <Dropdown
          name="isActive"
          label="Status"
          control={control}
          options={[
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ]}
        />
        <BirthDateField name="startDate" label="Start Date" control={control} />
        <BirthDateField name="endDate" label="End Date" control={control} />
      </div>
    </div>
  </div>
)


interface AddSchoolFormProps {
  schoolGroupCode: string
  schoolGroupName: string
  editingSchool?: SchoolInGroup | null
  onSuccess: () => void
  onCancel: () => void
}

const AddSchoolForm: React.FC<AddSchoolFormProps> = ({
  schoolGroupCode,
  schoolGroupName,
  editingSchool,
  onSuccess,
  onCancel,
}) => {
  const addMutation = useAddSchoolToGroup()
  const updateMutation = useUpdateSchool()
  const isEditMode = Boolean(editingSchool)
  const isSubmitting = addMutation.isPending || updateMutation.isPending

  const { handleSubmit, control, reset } = useForm<AddSchoolToGroupForm>({
    defaultValues:
      isEditMode && editingSchool
        ? {
            schoolName: editingSchool.schoolName ?? '',
            address: editingSchool.address ?? '',
            email: editingSchool.email ?? '',
            phoneNumber: editingSchool.phoneNumber ?? '',
            webSite: editingSchool.webSite ?? '',
            managedBy: editingSchool.managedBy ?? '',
            session: editingSchool.session ?? '',
            type: editingSchool.type ?? '',
            databaseName: editingSchool.databaseName ?? '',
            logo: null,
          }
        : DEFAULT_ADD_SCHOOL_FORM,
  })

  const onSubmit = async (formData: AddSchoolToGroupForm) => {
    try {
      if (isEditMode && editingSchool) {
        await updateMutation.mutateAsync({
          
          schoolGroupCode ,
          schoolCode: editingSchool.schoolCode,
          data: {
            schoolName: formData.schoolName.trim(),
            address: formData.address.trim(),
            email: formData.email.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            webSite: formData.webSite?.trim(),
            managedBy: formData.managedBy.trim(),
            session: formData.session.trim(),
            type: formData.type.toUpperCase(),
            databaseName: formData.databaseName.trim().toLowerCase(),
          },
        })
        alert('School updated successfully!')
      } else {
        await addMutation.mutateAsync({
          schoolGroupCode,
          data: {
            schoolName: formData.schoolName.trim(),
            address: formData.address.trim(),
            email: formData.email.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            webSite: formData.webSite?.trim(),
            managedBy: formData.managedBy.trim(),
            session: formData.session.trim(),
            type: formData.type.toUpperCase(),
            databaseName: formData.databaseName.trim().toLowerCase(),
            logo: formData.logo ?? undefined,
          },
        })
        alert('School added successfully!')
      }
      reset(DEFAULT_ADD_SCHOOL_FORM)
      onSuccess()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      alert(err?.message ?? 'Something went wrong. Please try again.')
    }
  }

  const handleCancel = useCallback(() => {
    reset(DEFAULT_ADD_SCHOOL_FORM)
    onCancel()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [reset, onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white overflow-y-auto p-6 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit School' : 'Add School'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? (
              <>Editing&nbsp;<span className="font-medium text-blue-600">{editingSchool?.schoolName}</span></>
            ) : (
              <>
                Adding to&nbsp;
                <span className="font-medium text-blue-600">{schoolGroupName}</span>
                &nbsp;<span className="font-mono text-xs text-gray-400">({schoolGroupCode})</span>
              </>
            )}
          </p>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1 space-y-6">
          {/* School Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">School Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <TextField
                  name="schoolName"
                  label="School/Collage Name"
                  placeholder="e.g. Sunrise International School"
                  control={control}
                  required
                />
              </div>
              <EmailField
                name="email"
                label="Email"
                placeholder="contact@school.com"
                control={control}
                required
              />
              <MobileField
                name="phoneNumber"
                label="Phone Number"
                placeholder="9123456780"
                control={control}
                required
              />

              <TextField
                  name="managedBy"
                  label="Managed By"
                  placeholder="e.g. John Doe"
                  control={control}
                />

                <TextField
                  name="webSite"
                  label="Website"
                  control={control}
                />

              <div className="md:col-span-2">
                <TextareaField
                  name="address"
                  label="Address"
                  placeholder="e.g. 123 Main Street, Pune, Maharashtra"
                  control={control}
                  rows={3}
                  required
                />
              </div>
              {!isEditMode && (
                <div className="md:col-span-2">
                  <FileUploadField name="logo" label="School Logo " control={control} required />
                </div>
              )}
            </div>
          </div>

          {/* Session & Type */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Session & Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                name="session"
                label="Session"
                placeholder="e.g. 2026-2027"
                control={control}
                required
              />
              <Dropdown
                name="type"
                label="School / College Type"
                control={control}
                required
                options={TYPE_OPTIONS}
              />
            </div>
          </div>

          {/* Database */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Database Configuration</h2>
            <div className="grid grid-cols-1 gap-4">
              <TextField
                name="databaseName"
                label="Database Name"
                placeholder="e.g. sunrise_school_db"
                control={control}
                required
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button name="Cancel" loading={false} isDisable={isSubmitting} onClick={handleCancel} showAlways = {true} />
            <Button
              name={isEditMode ? 'Save Changes' : 'Add School'}
              loading={isSubmitting}
              isDisable={isSubmitting}
              onClick={handleSubmit(onSubmit)} showAlways = {true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SchoolGroupPage ──────────────────────────────────────────────────────────

type ActiveView = 'table' | 'addGroup' | 'addSchool'

const SchoolGroupPage: React.FC = () => {
  const navigate = useNavigate()

  const [activeView, setActiveView] = useState<ActiveView>('table')
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [viewingCode, setViewingCode] = useState<string | null>(null)
  const [logoModalCode, setLogoModalCode] = useState<string | null>(null)
  const [subModalCode, setSubModalCode] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const [addSchoolTarget, setAddSchoolTarget] = useState<{
    code: string
    name: string
    editingSchool?: SchoolInGroup | null
  } | null>(null)

  const { data: packagesData, isLoading: packagesLoading } = usePackages()
  const packageOptions = useMemo(
    () => (packagesData?.packages ?? []).map((pkg: any) => ({
      label: pkg.name,
      value: String(pkg.packageId),
    })),
    [packagesData],
  )

  const registerMutation = useRegisterSchoolGroup()
  const updateMutation = useUpdateSchoolGroup()
  const isSubmitting = registerMutation.isPending || updateMutation.isPending

  const {
    control: filterControl,
    watch: filterWatch,
    reset: filterReset,
  } = useForm<SchoolGroupFilterState>({ defaultValues: DEFAULT_FILTERS })

  const filterValues = filterWatch()

  const filterDto = useMemo((): FilterSchoolGroupRequestDTO => {
    const dto: FilterSchoolGroupRequestDTO = {}
    const search = filterValues.search?.trim()
    if (search) dto.search = search
    if (filterValues.isActive === 'true') dto.isActive = true
    if (filterValues.isActive === 'false') dto.isActive = false
    const startDate = filterValues.startDate?.trim()
    if (startDate) dto.startDate = startDate
    const endDate = filterValues.endDate?.trim()
    if (endDate) dto.endDate = endDate
    return dto
  }, [filterValues])

  const debouncedFilterDto = useDebounced(filterDto, DEBOUNCE_MS)
  const filterEnabled = useMemo(() => hasRealFilters(debouncedFilterDto), [debouncedFilterDto])

  const activeFilterCount = useMemo(
    () => Object.values(filterDto).filter((v) => v !== undefined && v !== null && v !== '').length,
    [filterDto],
  )

  const handleFilterReset = useCallback(() => {
    filterReset(DEFAULT_FILTERS)
    setCurrentPage(0)
  }, [filterReset])

  const prevDtoRef = useRef<string>('')
  useEffect(() => {
    const serialised = JSON.stringify(debouncedFilterDto)
    if (prevDtoRef.current !== serialised) {
      prevDtoRef.current = serialised
      setCurrentPage(0)
    }
  }, [debouncedFilterDto])

  const {
    data: allData,
    isLoading: allLoading,
    isError: allError,
  } = useSchoolGroups({ page: currentPage, size: PAGE_SIZE })

  const {
    data: filteredData,
    isLoading: filterLoading,
    isError: filterError,
  } = useFilterSchoolGroups(
    debouncedFilterDto,
    { page: currentPage, size: PAGE_SIZE },
    filterEnabled,
  )

  const paginatedData = filterEnabled ? filteredData : allData
  const isDataLoading = filterEnabled ? filterLoading : allLoading
  const isDataError = filterEnabled ? filterError : allError

  const schoolGroups: SchoolGroup[] = paginatedData?.schoolGroups ?? []
  const totalPages = paginatedData?.totalPages ?? 0
  const totalItems = paginatedData?.totalItems ?? 0

  const { handleSubmit, control, watch, reset } = useForm<SchoolGroupForm>({
    defaultValues: DEFAULT_SCHOOL_GROUP_FORM,
  })

  const defaultConnectionString = watch('defaultConnectionString')
  const isEditMode = editingCode !== null

  const onSchoolGroupSubmit = async (formData: SchoolGroupForm) => {
    try {
      if (isEditMode && editingCode) {
        await updateMutation.mutateAsync({
          schoolGroupCode: editingCode,
          dto: {
            schoolGroupName: formData.schoolGroupName,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
          },
        })
        alert('School group updated successfully!')
      } else {
        if (!formData.logo) {
          alert('Please select a logo file.')
          return
        }
        if (!formData.packageId) {
          alert('Please select a package.')
          return
        }
        await registerMutation.mutateAsync({
          packageId: Number(formData.packageId),
          schoolGroupName: formData.schoolGroupName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          databaseName: formData.databaseName,
          defaultConnectionString: formData.defaultConnectionString === 'yes',
          groupLogo: formData.logo,
          dbAddress: formData.dbAddress ?? '',
          username: formData.username ?? '',
          password: formData.password ?? '',
          databaseType: formData.databaseType ?? '',
        })
        alert('School group registered successfully!')
      }
      reset(DEFAULT_SCHOOL_GROUP_FORM)
      setEditingCode(null)
      setActiveView('table')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      alert(err?.message ?? 'Something went wrong. Please try again.')
    }
  }

  const handleEdit = useCallback(
    (id: string | number) => {
      const code = String(id)
      const group = schoolGroups.find((g) => g.schoolGroupCode === code)
      reset({
        ...DEFAULT_SCHOOL_GROUP_FORM,
        schoolGroupName: group?.schoolGroupName ?? '',
        phoneNumber: group?.phoneNumber ?? '',
        email: group?.email ?? '',
      })
      setEditingCode(code)
      setActiveView('addGroup')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [schoolGroups, reset],
  )

  const handleView = useCallback(
    (id: string | number) => navigate(`/admin/school-group/${id}`),
    [navigate],
  )

  const handleAddSchool = useCallback(
    (id: string | number) => {
      const code = String(id)
      const group = schoolGroups.find((g) => g.schoolGroupCode === code)
      if (!group) return
      setAddSchoolTarget({ code, name: group.schoolGroupName, editingSchool: null })
      setActiveView('addSchool')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [schoolGroups],
  )

  const closeGroupForm = useCallback(() => {
    reset(DEFAULT_SCHOOL_GROUP_FORM)
    setEditingCode(null)
    setActiveView('table')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [reset])

  const closeAddSchoolForm = useCallback(() => {
    setAddSchoolTarget(null)
    setActiveView('table')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const tableRows = useMemo(
    () => schoolGroups.map((g) => ({ ...g, id: g.schoolGroupCode })),
    [schoolGroups],
  )

  const columns = [
    { key: 'schoolGroupName', label: 'School Group Name' },
    { key: 'schoolGroupCode', label: 'Code' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone Number' },
    { key: 'planName', label: 'Plan' },
    { key: 'isActive', label: 'Status' },
  ]

  return (
    <div className="min-h-screen py-6">
      {viewingCode && (
        <ViewModal schoolGroupCode={viewingCode} onClose={() => setViewingCode(null)} />
      )}
      {logoModalCode && (
        <LogoModal schoolGroupCode={logoModalCode} onClose={() => setLogoModalCode(null)} />
      )}
      {subModalCode && (
        <SubscribeModal
          schoolGroupCode={subModalCode}
          packages={packageOptions}
          onClose={() => setSubModalCode(null)}
        />
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8">
        {activeView === 'addSchool' && addSchoolTarget && (
          <AddSchoolForm
            schoolGroupCode={addSchoolTarget.code}
            schoolGroupName={addSchoolTarget.name}
            editingSchool={addSchoolTarget.editingSchool ?? null}
            onSuccess={closeAddSchoolForm}
            onCancel={closeAddSchoolForm}
          />
        )}

        {activeView === 'addGroup' && (
          <div className="w-full mx-auto">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEditMode ? 'Edit School Group' : 'Create School Group'}
                </h1>
              </div>
              <form onSubmit={handleSubmit(onSchoolGroupSubmit)}>
                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isEditMode && (
                      <Dropdown
                        name="packageId"
                        label="Package"
                        control={control}
                        required
                        disabled={packagesLoading}
                        options={
                          packagesLoading
                            ? [{ label: 'Loading packages…', value: '' }]
                            : packageOptions
                        }
                      />
                    )}
                    <TextField
                      name="schoolGroupName"
                      label="School Group Name"
                      placeholder="Enter school group name"
                      control={control}
                      required
                    />
                    <EmailField
                      name="email"
                      label="Email"
                      placeholder="Enter school group email"
                      control={control}
                      required
                    />
                    <MobileField
                      name="phoneNumber"
                      label="Phone Number"
                      placeholder="Enter phone number"
                      control={control}
                      required
                    />
                    {!isEditMode && (
                      <div className="md:col-span-2">
                        <FileUploadField
                          name="logo"
                          label="School Group Logo"
                          control={control}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {isEditMode && editingCode && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 pb-2 border-y border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
                        Other Updates:
                      </span>
                      <button
                        type="button"
                        onClick={() => setLogoModalCode(editingCode)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors border border-blue-200"
                      >
                        Update Logo
                      </button>
                      {/* <button
                        type="button"
                        onClick={() => setSubModalCode(editingCode)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-medium transition-colors border border-purple-200"
                      >
                        Change Package
                      </button> */}
                    </div>
                  )}

                  {!isEditMode && (
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Database Configuration
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        <TextField
                          name="databaseName"
                          label="Database Name"
                          placeholder="e.g. dyp_db"
                          control={control}
                          required
                        />
                        <RadioButton
                          name="defaultConnectionString"
                          label="Default Connection"
                          control={control}
                          required
                          options={[
                            { label: 'Yes', value: 'yes' },
                            { label: 'No', value: 'no' },
                          ]}
                        />
                      </div>

                      {defaultConnectionString === 'no' && (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Database Connection</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                              name="dbAddress"
                              label="DB IP Address"
                              placeholder="192.168.1.1"
                              control={control}
                              required
                            />
                            <TextField
                              name="username"
                              label="Username"
                              placeholder="Enter username"
                              control={control}
                              required
                            />
                            <TextField
                              name="password"
                              label="Password"
                              placeholder="Enter password"
                              control={control}
                              required
                            />
                            <Dropdown
                              name="databaseType"
                              label="Database Type"
                              control={control}
                              required
                              options={[
                                { label: 'MySQL', value: 'mysql' },
                                { label: 'SQL Server', value: 'sqlserver' },
                                { label: 'Oracle', value: 'oracle' },
                              ]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button
                      name="Cancel"
                      loading={false}
                      isDisable={isSubmitting}
                      onClick={closeGroupForm}
                      showAlways = {true}
                    />
                    <Button
                      name={isEditMode ? 'Update' : 'Save'}
                      loading={isSubmitting}
                      isDisable={isSubmitting}
                      onClick={handleSubmit(onSchoolGroupSubmit)}
                      showAlways = {true}

                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeView === 'table' && (
          <>
            <FilterBar control={filterControl} onReset={handleFilterReset} activeCount={activeFilterCount} />
            {isDataError && (
              <p className="text-red-500 text-center py-8 text-sm">
                Failed to load school groups. Please refresh the page.
              </p>
            )}
            <ControlledTable
              title="School Groups"
              columns={columns}
              data={tableRows}
              fullData={tableRows}
              onEdit={handleEdit}
              onView={handleView}
              onAdd={handleAddSchool}
              btn={true}
              btnName="Add School Group"
              forceShowBtn={true}
              showForm={() => setActiveView('addGroup')}
              showExport={false}
              showSearch={false}
              actionColumn={true}
              showSelectAll={false}
              showPaginationFooter={true}
              forceShowActions={true}
              emptyMessage={
                isDataLoading
                  ? 'Loading…'
                  : activeFilterCount > 0
                    ? 'No school groups match the selected filters.'
                    : "No school groups yet. Click 'Add School Group' to create one."
              }
              exportFilename="school_groups_list"
              exportTitle="School Groups Report"
            />
            {!isDataLoading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-sm text-gray-500">
                  Page {currentPage + 1} of {totalPages} &mdash; {totalItems} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SchoolGroupPage
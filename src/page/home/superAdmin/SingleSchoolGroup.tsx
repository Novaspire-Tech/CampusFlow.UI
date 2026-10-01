import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useSchoolGroup,
  useSchoolsByGroup,
  useSubscribePackage,
} from '../../../hooks/queries/superAdmin/useschoolGroup'
import { useUpdateSchool } from '../../../hooks/queries/superAdmin/useSchool'
import { usePackages } from '../../../hooks/queries/superAdmin/usePackage'
import { type SchoolInGroup } from '../../../services/superAdmin/schoolGroupService'
import { TextField } from '../../../components/controlled'
import Dropdown from '../../../components/controlled/Dropdown'
import EmailField from '../../../components/controlled/EmailField'
import MobileField from '../../../components/controlled/MobileField'
import TextareaField from '../../../components/controlled/TextareaField'
import type { AddSchoolToGroupForm } from '../../../types/superAdmin/School'
import type { AssignSubscriptionRequestDto } from '../../../types/superAdmin/SchoolGroup'

const TYPE_OPTIONS = [
  { label: 'School', value: 'SCHOOL' },
  { label: 'College', value: 'COLLEGE' },
]

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

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm text-gray-800 break-all">{value || 'N/A'}</p>
  </div>
)

const getLocalNowString = (): string => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

const PAID_THROUGH_OPTIONS = [
  { label: 'UPI', value: 'UPI' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Debit Card', value: 'DEBIT_CARD' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Net Banking', value: 'NET_BANKING' },
  { label: 'Demand Draft', value: 'DEMAND_DRAFT' },
]

const fieldClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

const PaymentField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label} *</label>
    {children}
  </div>
)

PaymentField.Input = function PaymentFieldInput({
  label,
  type = 'text',
  value,
  onChange,
}: {
  label: string
  type?: 'text' | 'number'
  value: string | number
  onChange: (v: string | number) => void
}) {
  return (
    <PaymentField label={label}>
      <input
        type={type}
        className={fieldClass}
        value={String(value)}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    </PaymentField>
  )
}

PaymentField.Select = function PaymentFieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (v: string) => void
}) {
  return (
    <PaymentField label={label}>
      <select
        className={`${fieldClass} bg-white`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select method</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </PaymentField>
  )
}

PaymentField.DateTime = function PaymentFieldDateTime({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <PaymentField label={label}>
      <input
        type="datetime-local"
        max={getLocalNowString()}
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-gray-400 mt-1">Only past or current date and time allowed.</p>
    </PaymentField>
  )
}

const DEFAULT_SUB_FORM: AssignSubscriptionRequestDto = {
  transactionId: '',
  invoiceNumber: '',
  amountPaid: 0,
  paidThrough: '',
  paidAt: '',
}

interface ManageSubscriptionModalProps {
  schoolGroupCode: string
  packages: { label: string; value: string }[]
  onClose: () => void
  onSuccess: () => void
}

const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  schoolGroupCode,
  packages,
  onClose,
  onSuccess,
}) => {
  const subscribeMutation = useSubscribePackage()
  const [packageId, setPackageId] = useState('')
  const [isPaid, setIsPaid] = useState<'paid' | 'unpaid'>('unpaid')
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
        dto: isPaid === 'paid' ? subForm : DEFAULT_SUB_FORM,
        isPaid: isPaid === 'paid',
      })
      alert('Package assigned successfully!')
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Manage Subscription</h2>
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

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
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

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Payment Type *
            </p>
            <div className="flex gap-4">
              {(['paid', 'unpaid'] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${
                    isPaid === opt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value={opt}
                    checked={isPaid === opt}
                    onChange={() => setIsPaid(opt)}
                    className="accent-blue-600"
                  />
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {isPaid === 'paid' ? (
            <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Payment Details
              </p>
              <PaymentField.Input
                label="Transaction ID"
                value={subForm.transactionId}
                onChange={(v) => handleChange('transactionId', v)}
              />
              <PaymentField.Input
                label="Invoice Number"
                value={subForm.invoiceNumber}
                onChange={(v) => handleChange('invoiceNumber', v)}
              />
              <PaymentField.Input
                label="Amount Paid"
                type="number"
                value={subForm.amountPaid}
                onChange={(v) => handleChange('amountPaid', v)}
              />
              <PaymentField.Select
                label="Paid Through"
                value={subForm.paidThrough}
                options={PAID_THROUGH_OPTIONS}
                onChange={(v) => handleChange('paidThrough', v)}
              />
              <PaymentField.DateTime
                label="Paid At"
                value={subForm.paidAt}
                onChange={(v) => handleChange('paidAt', v)}
              />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Unpaid Subscription</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  No payment details required. The subscription will be created without a
                  transaction record.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
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
            {subscribeMutation.isPending ? 'Assigning…' : 'Assign Package'}
          </button>
        </div>
      </div>
    </div>
  )
}

const SchoolCard = ({
  school,
  onView,
  onEdit,
}: {
  school: SchoolInGroup
  onView: () => void
  onEdit: () => void
}) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
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

const SchoolDetailDrawer = ({
  school,
  schoolGroupCode,
  onClose,
  onEditSuccess,
}: {
  school: SchoolInGroup
  schoolGroupCode: string
  onClose: () => void
  onEditSuccess: () => void
}) => {
  const updateMutation = useUpdateSchool()
  const [isEditing, setIsEditing] = useState(false)

  const { handleSubmit, control, reset } = useForm<AddSchoolToGroupForm>({
    defaultValues: {
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
          webSite: formData.webSite.trim(),
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEditing ? 'Edit School' : 'School Details'}
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
                name="webSite"
                label="Website"
                control={control}
              />
              <TextareaField
                name="managedBy"
                label="Managed By"
                placeholder="e.g. John Doe"
                control={control}
                rows={3}
                
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
                  className={`mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    school.isActive
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-500 border border-red-200'
                  }`}
                >
                  {school.isActive ? 'Active' : 'Inactive'}
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
              {/* Contact + other info */}
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

export default function SingleSchoolGroup() {
  const { schoolGroupId } = useParams<{ schoolGroupId: string }>()
  const navigate = useNavigate()
  const [schoolPage, setSchoolPage] = useState(0)
  const [selectedSchool, setSelectedSchool] = useState<SchoolInGroup | null>(null)
  const [editingSchool, setEditingSchool] = useState<SchoolInGroup | null>(null)
  const [showSubModal, setShowSubModal] = useState(false)

  const {
    data: sg,
    isLoading,
    isError,
    refetch: refetchGroup,
  } = useSchoolGroup(schoolGroupId ?? '')

  const {
    data: schoolsData,
    isLoading: schoolsLoading,
    refetch: refetchSchools,
  } = useSchoolsByGroup(schoolGroupId ?? '', { page: schoolPage, size: 10 })

  const { data: packagesData, isLoading: packagesLoading } = usePackages()
  const packageOptions = (packagesData?.packages ?? []).map((pkg: any) => ({
    label: pkg.name,
    value: String(pkg.packageId),
  }))

  const schools = schoolsData?.schools ?? []
  const totalSchPages = schoolsData?.totalPages ?? 0
  const totalItems = schoolsData?.totalItems ?? 0

  const hasNoActivePlan = sg?.planName === 'No Active Plan'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-500">Loading school group…</p>
        </div>
      </div>
    )
  }

  if (isError || !sg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">School group not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to School Groups
        </button>

        {/* Group header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="w-full h-14" />
          <div className="px-6 pb-4">
            <div className="flex items-end gap-4 -mt-10 mb-2">
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {sg.schoolGroupName || 'N/A'}
                </h1>
                <p className="text-sm text-gray-400 font-mono">{sg.schoolGroupCode}</p>
              </div>
              <div className="ml-auto pb-1">
                <span
                  className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                    sg.isActive
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-500 border border-red-200'
                  }`}
                >
                  {sg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                  Subscription Info
                </h2>
                {hasNoActivePlan && (
                  <button
                    onClick={() => setShowSubModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition-colors border border-amber-200"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Manage Subscription
                  </button>
                )}
              </div>

              {hasNoActivePlan && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-amber-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-sm text-amber-800 font-medium">
                    This school group has no active subscription plan.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Plan Name</p>
                  <p
                    className={`text-sm font-medium ${hasNoActivePlan ? 'text-amber-600' : 'text-gray-800'}`}
                  >
                    {sg.planName || 'N/A'}
                  </p>
                </div>
                <InfoRow label="Billing Period" value={sg.billingPeriod} />
                <InfoRow label="Created Date" value={fmt(sg.createdDate)} />
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Contact Info
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <InfoRow label="Email" value={sg.email} />
                <InfoRow label="Phone Number" value={sg.phoneNumber} />
              </div>
            </div>

            {/* Database Configuration */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Database Configuration
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <InfoRow label="Database Name" value={sg.databaseName} />
                <InfoRow label="DB Type" value={sg.databaseType} />
                <InfoRow label="DB Address" value={sg.dbAddress} />
                <InfoRow label="Username" value={sg.username} />
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
                  <InfoRow label="Tenant ID" value={sg.tenantId} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: schools panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Schools
                </h2>
                {totalItems > 0 && (
                  <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full border border-blue-100">
                    {totalItems}
                  </span>
                )}
              </div>

              {schoolsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : schools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">No schools yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schools.map((s: SchoolInGroup) => (
                    <SchoolCard
                      key={s.schoolId}
                      school={s}
                      onView={() => setSelectedSchool(s)}
                      onEdit={() => setEditingSchool(s)}
                    />
                  ))}

                  {totalSchPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        {schoolPage + 1} / {totalSchPages}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSchoolPage((p) => Math.max(0, p - 1))}
                          disabled={schoolPage === 0}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setSchoolPage((p) => Math.min(totalSchPages - 1, p + 1))}
                          disabled={schoolPage >= totalSchPages - 1}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedSchool && (
        <SchoolDetailDrawer
          school={selectedSchool}
          schoolGroupCode={schoolGroupId ?? ''}
          onClose={() => setSelectedSchool(null)}
          onEditSuccess={() => {
            refetchSchools()
            setSelectedSchool(null)
          }}
        />
      )}

      {editingSchool && (
        <SchoolDetailDrawer
          school={editingSchool}
          schoolGroupCode={schoolGroupId ?? ''}
          onClose={() => setEditingSchool(null)}
          onEditSuccess={() => {
            refetchSchools()
            setEditingSchool(null)
          }}
        />
      )}

      {showSubModal && (
        <ManageSubscriptionModal
          schoolGroupCode={schoolGroupId ?? ''}
          packages={packagesLoading ? [] : packageOptions}
          onClose={() => setShowSubModal(false)}
          onSuccess={() => refetchGroup()}
        />
      )}
    </div>
  )
}
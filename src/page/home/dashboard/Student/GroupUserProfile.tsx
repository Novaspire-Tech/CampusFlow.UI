import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as FaIcons from 'react-icons/fa'

interface IconFieldProps {
  name: string
  size?: number
  color?: string
  className?: string
  onClick?: () => void
}

const IconField: React.FC<IconFieldProps> = ({
  name,
  size = 20,
  color = 'inherit',
  className = '',
  onClick,
}) => {
  const DynamicIcon = FaIcons[name as keyof typeof FaIcons]
  if (!DynamicIcon) return null
  return <DynamicIcon size={size} color={color} className={className} onClick={onClick} />
}

interface CrudPermission {
  operations: string[]
  scope: string
}

const SCOPE_TO_MENU: Record<string, { label: string; path: string; faIcon: string }> = {
  WHATSAPP: { label: 'WhatsApp', path: '/whatsapp', faIcon: 'FaWhatsapp' },
  FRONT_OFFICE: { label: 'Front Office', path: '/admission-enquiry', faIcon: 'FaBuilding' },
  STUDENT: { label: 'Student Info', path: '/student-details', faIcon: 'FaUserGraduate' },
  FEES: { label: 'Fees Collection', path: '/class-fees', faIcon: 'FaMoneyBillWave' },
  INCOME: { label: 'Income', path: '/add-income', faIcon: 'FaChartLine' },
  EXPENSES: { label: 'Expenses', path: '/add-expense', faIcon: 'FaReceipt' },
  EXAMINATION: { label: 'Examination', path: '/exam-group', faIcon: 'FaClipboardList' },
  ATTENDANCE: { label: 'Attendance', path: '/student-attendance', faIcon: 'FaCalendarCheck' },
  ACADEMICS: { label: 'Academics', path: '/class-timetable', faIcon: 'FaBookOpen' },
  LESSON_PLAN: { label: 'Lesson Plan', path: '/lesson', faIcon: 'FaClipboard' },
  HR: { label: 'Human Resource', path: '/staff-directory', faIcon: 'FaUsers' },
  DOWNLOAD_CENTRE: { label: 'Download Center', path: '/content-type', faIcon: 'FaDownload' },
  HOMEWORK: { label: 'Homework', path: '/add-homework', faIcon: 'FaFlask' },
  LIBRARY: { label: 'Library', path: '/book-list', faIcon: 'FaBook' },
  INVENTORY: { label: 'Inventory', path: '/issue-item', faIcon: 'FaBoxOpen' },
  TRANSPORT: { label: 'Transport', path: '/pickup-points', faIcon: 'FaCarSide' },
  HOSTEL: { label: 'Hostel', path: '/hostel-rooms', faIcon: 'FaKey' },
  CERTIFICATE: { label: 'Certificate', path: '/generate-certificate', faIcon: 'FaCertificate' },
  ALUMNI: { label: 'Alumni', path: '/manage-alumni', faIcon: 'FaUserGraduate' },
  ROLE: { label: 'Role', path: '/create-role', faIcon: 'FaUserShield' },
  SYSTEM_SETTINGS: { label: 'System Settings', path: '/session-settings', faIcon: 'FaTools' },
  TIMETABLE: { label: 'Timetable', path: '/class-timetable', faIcon: 'FaCalendar' },
  ADMIT_CARD: { label: 'Admit Card', path: '/design-admit-card', faIcon: 'FaIdCard' },
  EXAM_MARKSHEET: { label: 'Marksheet', path: '/design-marksheet', faIcon: 'FaFileAlt' },
  PROMOTE_STUDENT: { label: 'Promote Student', path: '/promote-student', faIcon: 'FaArrowUp' },
  SCHOOL_CLASS: { label: 'Classes & Sections', path: '/class', faIcon: 'FaSchool' },
  APPLY_LEAVE: { label: 'Apply Leave', path: '/apply-leave', faIcon: 'FaUmbrellaBeach' },
  COMMUNICATION: { label: 'Communication', path: '/send-email', faIcon: 'FaBroadcastTower' },
  SESSION_SETTING: { label: 'Session Settings', path: '/session-settings', faIcon: 'FaCog' },
  // PROFILE:         { label: "Profile",            path: "/group-user-profile",    faIcon: "FaUser"           },
}

function getRoleLabel(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function ModuleCard({
  label,
  faIcon,
  operations,
  onClick,
}: {
  label: string
  faIcon: string
  operations: string[]
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#213448]/30"
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-[#213448] group-hover:bg-[#2d4a63] transition-colors duration-200" />

      <div className="py-6 px-4 flex flex-col items-center gap-3 text-center">
        {/* Icon circle */}
        <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-[#213448] flex items-center justify-center transition-all duration-200 shadow-sm">
          <span className="text-[#213448] group-hover:text-white transition-colors duration-200">
            <IconField name={faIcon} size={22} />
          </span>
        </div>

        {/* Label */}
        <span className="text-[12px] font-bold text-gray-800 leading-snug">{label}</span>

        {/* Operation badges */}
        <div className="flex flex-wrap gap-1 justify-center">
          {operations.slice(0, 3).map((op) => (
            <span
              key={op}
              className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide"
            >
              {op}
            </span>
          ))}
          {operations.length > 3 && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              +{operations.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface GroupUserProfileProps {
  userName?: string
  role?: string
}

export default function GroupUserProfile({ userName, role }: GroupUserProfileProps) {
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState<CrudPermission[]>([])
  const [, setResolvedName] = useState<string>('')
  const [resolvedRole, setResolvedRole] = useState<string>('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('crudPermissions')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setPermissions(parsed)
      }

      const name = userName || localStorage.getItem('userName') || ''
      const storedRole =
        role ||
        localStorage.getItem('userRole') ||
        localStorage.getItem('roleName') ||
        localStorage.getItem('role') ||
        ''

      setResolvedName(name)
      setResolvedRole(storedRole)
    } catch {
      setPermissions([])
    }
  }, [userName, role])

  const accessibleModules = permissions
    .filter((p) => p.operations.length > 0 && SCOPE_TO_MENU[p.scope])
    .map((p) => ({
      ...SCOPE_TO_MENU[p.scope],
      scope: p.scope,
      operations: p.operations,
    }))
    .filter((m, i, arr) => arr.findIndex((x) => x.path === m.path) === i)

  const roleLabel = resolvedRole ? getRoleLabel(resolvedRole) : ''

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-[Outfit,sans-serif]">
      <div className="flex flex-col items-center justify-center text-center px-6 pt-14 pb-10 bg-[#f0f2f5]">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-700 tracking-[0.12em] uppercase mb-5">
          Welcome Back
        </h1>

        {/* Role badge — shown below heading */}
        {roleLabel && (
          <span className="inline-flex items-center gap-2 border border-[#213448]/25 bg-[#213448]/8 text-[#213448] text-[13px] font-semibold px-5 py-2 rounded-full mb-8">
            <IconField name="FaUserShield" size={13} color="#213448" />
            {roleLabel}
          </span>
        )}

        {/* Thin divider */}
        <div className="w-16 h-px bg-gray-300 mb-8" />

        {/* ── Module Grid — centered ── */}
        {accessibleModules.length > 0 ? (
          <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
            {accessibleModules.map((mod) => (
              <div key={mod.scope} className="w-full">
                <ModuleCard
                  label={mod.label}
                  faIcon={mod.faIcon}
                  operations={mod.operations}
                  onClick={() => navigate(mod.path)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm p-16 flex flex-col items-center gap-5 text-center max-w-md mx-auto mt-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <IconField name="FaLock" size={24} color="#d1d5db" />
            </div>
            <div>
              <p className="text-gray-800 font-bold text-base">No modules assigned yet</p>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Please contact the administrator to grant access to the relevant modules for your
                role.
              </p>
            </div>
            {roleLabel && (
              <span className="inline-flex items-center gap-2 bg-[#213448] text-white text-xs font-semibold px-4 py-2 rounded-xl">
                <IconField name="FaUserShield" size={11} color="#fff" />
                {roleLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

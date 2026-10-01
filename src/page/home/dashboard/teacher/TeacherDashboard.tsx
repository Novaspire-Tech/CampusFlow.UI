import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as FaIcons from 'react-icons/fa'
import StatsCards from './StatsCards'
import StudentDistributionChart from './StudentDistributionChart'
import MyStudentsTable from './MyStudentsTable'
import AxiosFunc from '../../../../utils/axios'
import { useTranslation } from 'react-i18next'
import { getTeacherDashboardText } from '../../../../helpers/useTranslations'

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

  if (!DynamicIcon) {
    console.warn(`Icon "${name}" not found in react-icons/fa`)
    return null
  }

  return <DynamicIcon size={size} color={color} className={className} onClick={onClick} />
}

interface ClassDetails {
  class: string
  section: string
}

interface TimetableEntry {
  timetableId: number
  day: string
  startTime: string
  endTime: string
  subject: string
  schoolClass: string
  section: string
  teacher: string
}

interface DashboardData {
  classDetails: ClassDetails | null
  timeTable: TimetableEntry[]
}

// const DAYS = [
//   { key: 'MONDAY', label: teacherText.Monday },
//   { key: 'TUESDAY', label: teacherText.Tuesday },
//   { key: 'WEDNESDAY', label: teacherText.Wednesday },
//   { key: 'THURSDAY', label: teacherText.Thursday },
//   { key: 'FRIDAY', label: teacherText.Friday },
//   { key: 'SATURDAY', label: teacherText.Saturday },
// ]

const getSchoolCode = (): string => localStorage.getItem('schoolCode') || ''

const getCurrentSession = (): string => {
  const year = new Date().getFullYear()
  return `${year}-${year + 1}`
}

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

const ClassTeacherCard: React.FC<{
  classDetails: ClassDetails | null
  loading: boolean
  teacherText: ReturnType<typeof getTeacherDashboardText>
}> = ({ classDetails, loading, teacherText }) => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
        <IconField name="FaSchool" size={18} color="#3b82f6" />
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-800 leading-tight">
          {teacherText.My_Assigned_Class}
        </h2>
        <p className="text-xs text-gray-400">{teacherText.Where_You_Are_The_Class_Teacher}</p>
      </div>
    </div>

    {loading ? (
      <div className="flex gap-3">
        <Skeleton className="h-14 w-32" />
        <Skeleton className="h-14 w-32" />
        <Skeleton className="h-14 w-48 opacity-60" />
      </div>
    ) : classDetails ? (
      <div className="flex flex-wrap gap-3 items-center">
        {/* Class Badge */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl px-6 py-3 shadow-sm min-w-[100px]">
          <span className="text-xs font-medium uppercase tracking-widest opacity-80 mb-0.5">
            {teacherText.Class}
          </span>
          <span className="text-xl font-extrabold leading-none">{classDetails.class}</span>
        </div>

        {/* Section Badge */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl px-6 py-3 shadow-sm min-w-[100px]">
          <span className="text-xs font-medium uppercase tracking-widest opacity-80 mb-0.5">
            {teacherText.Section}
          </span>
          <span className="text-xl font-extrabold leading-none">{classDetails.section}</span>
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <IconField name="FaExclamationTriangle" size={24} color="#d97706" />
        <div>
          <p className="text-amber-700 font-semibold text-sm">
            {teacherText.Not_Assigned_As_Class_Teacher}
          </p>
          <p className="text-amber-500 text-xs mt-0.5">
            {teacherText.Assign_Yourself_As_Class_Teacher}
          </p>
        </div>
      </div>
    )}
  </div>
)

const WeeklyTimetable: React.FC<{
  timetable: TimetableEntry[]
  loading: boolean
  teacherText: ReturnType<typeof getTeacherDashboardText>
}> = ({ timetable, loading, teacherText }) => {
  const DAYS = [
    { key: 'MONDAY', label: teacherText.Monday },
    { key: 'TUESDAY', label: teacherText.Tuesday },
    { key: 'WEDNESDAY', label: teacherText.Wednesday },
    { key: 'THURSDAY', label: teacherText.Thursday },
    { key: 'FRIDAY', label: teacherText.Friday },
    { key: 'SATURDAY', label: teacherText.Saturday },
  ]

  const totalPeriods = timetable.length
  const activeDays = new Set(timetable.map((e) => e.day)).size

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <IconField name="FaCalendarAlt" size={18} color="#6366f1" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 leading-tight">
              {teacherText.My_Weekly_Timetable}
            </h2>
            <p className="text-xs text-gray-400"> {teacherText.Your_Teacher_Weekly_Timetable}</p>
          </div>
        </div>

        {/* Summary pills */}
        {!loading && timetable.length > 0 && (
          <div className="flex gap-2">
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
              <IconField name="FaClock" size={10} color="#1d4ed8" />
              {totalPeriods} {teacherText.Periods}
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
              <IconField name="FaCalendarCheck" size={10} color="#4338ca" />
              {activeDays} {teacherText.Active_Days}
            </span>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DAYS.map((d) => (
            <div key={d.key} className="space-y-1">
              <Skeleton className="h-7 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg opacity-40" />
            </div>
          ))}
        </div>
      ) : timetable.length === 0 ? (
        /* Empty state — replaced 📭 emoji with FaInbox icon */
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="flex justify-center mb-3">
            <IconField name="FaInbox" size={48} color="#9ca3af" />
          </div>
          <p className="text-gray-600 font-semibold">{teacherText.No_Timetable_Assigned_Yet}</p>
          <p className="text-gray-400 text-sm mt-1">
            {teacherText.Contact_Admin_To_Get_Weekly_Schedule}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {DAYS.map((day) => {
            const items = timetable
              .filter((e) => e.day === day.key)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))

            return (
              <div key={day.key} className="flex flex-col">
                {/* Day header */}
                <div
                  className={`text-center py-1.5 rounded-t-lg font-bold text-xs tracking-wide ${
                    items.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {day.label}
                  {items.length > 0 && (
                    <span className="ml-1 bg-white/25 rounded-full px-1 text-[10px]">
                      {items.length}
                    </span>
                  )}
                </div>

                {/* Period cards */}
                <div
                  className={`flex-1 rounded-b-lg p-1.5 space-y-1.5 min-h-[80px] ${
                    items.length > 0 ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  {items.length > 0 ? (
                    items.map((item) => (
                      <div
                        key={item.timetableId}
                        className="bg-white rounded-lg p-2 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-150"
                      >
                        <p className="font-bold text-gray-800 text-[11px] leading-tight truncate flex items-center gap-1">
                          <IconField name="FaBook" size={9} color="#3b82f6" />
                          {item.subject || '—'}
                        </p>

                        {/* Class & Section with chalkboard icon */}
                        <p className="text-[10px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
                          <IconField name="FaChalkboard" size={8} color="#6b7280" />
                          {teacherText.Class} {item.schoolClass}
                          {item.section ? ` · ${item.section}` : ''}
                        </p>

                        {/* Time badges */}
                        <div className="mt-1 flex items-center gap-0.5 flex-wrap">
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full">
                            {item.startTime}
                          </span>
                          <span className="text-[9px] text-gray-400">–</span>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded-full">
                            {item.endTime}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-gray-300 text-center pt-4 select-none">
                      {teacherText.Free}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation()
  const teacherText = getTeacherDashboardText(t)

  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    classDetails: null,
    timeTable: [],
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const schoolCode = getSchoolCode()
        const session = localStorage.getItem('session') || getCurrentSession()

        console.log(
          '[TeacherDashboard] Fetching analytics —',
          `schoolCode: ${schoolCode}, session: ${session}`,
        )

        console.log('session', session)
        const response = await AxiosFunc.Get(
          `/school-group/{schoolGroupCode}/school/${schoolCode}/teacher/dashboard/analytics`,
          { session },
        )

        console.log('[TeacherDashboard] Analytics response:', response.data)

        const data = response.data?.data

        if (!data) {
          setError(teacherText.No_Data_Received)
          return
        }

        setDashboardData({
          classDetails: data.classDetails ?? null,
          timeTable: Array.isArray(data.timeTable) ? data.timeTable : [],
        })
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to load dashboard data.'
        console.error('[TeacherDashboard] Analytics fetch error:', err)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
            {teacherText.Welcome}
          </h1>
        </div>

        <button
          onClick={() => navigate('/student-attendance')}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
        >
          <IconField name="FaClipboardCheck" size={16} color="white" />
          {teacherText.Take_Attendance}
        </button>
      </div>

      {/* API error banner */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
          <IconField name="FaExclamationCircle" size={16} color="#b91c1c" />
          {error}
        </div>
      )}

      <StatsCards />

      <ClassTeacherCard
        classDetails={dashboardData.classDetails}
        loading={loading}
        teacherText={teacherText}
      />
      <WeeklyTimetable
        timetable={dashboardData.timeTable}
        loading={loading}
        teacherText={teacherText}
      />
      <div className="flex flex-col items-center mb-6">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <IconField name="FaChartPie" size={20} color="#374151" />
            {teacherText.Students_Distribution}
          </h2>
          <div className="flex justify-center">
            <StudentDistributionChart />
          </div>
        </div>
      </div>

      <MyStudentsTable />
    </div>
  )
}

export default TeacherDashboard

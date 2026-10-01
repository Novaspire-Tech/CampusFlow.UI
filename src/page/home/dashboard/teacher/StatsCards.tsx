import React, { useState, useEffect } from 'react'
import { IconField } from '../../../../components'
import { studentService } from '../../../../services/studentInformation/studentService'
import AxiosFunc from '../../../../utils/axios'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../../helpers/useTranslations'

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  bgColor: string
  textColor: string
  loading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  bgColor,
  textColor,
  loading = false,
}) => (
  <div
    className={`flex items-center p-6 rounded-xl shadow-lg ${bgColor} transition-all duration-300 hover:shadow-xl`}
  >
    <div
      className={`p-4 rounded-full ${bgColor} bg-opacity-75 mr-5 flex items-center justify-center`}
    >
      <div className={`text-3xl ${textColor}`}>{icon}</div>
    </div>
    <div className="flex-1">
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className={`h-9 w-32 rounded-lg ${bgColor} bg-opacity-50`}></div>
          <div className={`h-5 w-24 rounded-lg ${bgColor} bg-opacity-50`}></div>
        </div>
      ) : (
        <>
          <div className={`text-3xl font-bold ${textColor} mb-1`}>{value}</div>
          <div className={`text-base font-medium ${textColor} opacity-90`}>{label}</div>
        </>
      )}
    </div>
  </div>
)

const getSchoolCode = (): string => localStorage.getItem('schoolCode') || ''
const getCurrentSession = (): string => {
  const year = new Date().getFullYear()
  return `${year}-${year + 1}`
}

const StatsCards: React.FC = () => {
  const { t } = useTranslation()
  const T = getPagesDataText(t)
  const [stats, setStats] = useState({ totalStudents: 0, totalExams: 0 })
  const [loading, setLoading] = useState({ students: true, exams: true })
  const [error, setError] = useState<string | null>(null)

  const fetchTotalStudents = async () => {
    try {
      setLoading((prev) => ({ ...prev, students: true }))
      const response = await studentService.getAll(0, 1)
      if (response && response.totalItems !== undefined) {
        setStats((prev) => ({ ...prev, totalStudents: response.totalItems }))
      } else {
        const allStudents = await studentService.getAll(0, 10000)
        setStats((prev) => ({ ...prev, totalStudents: allStudents.students.length }))
      }
    } catch (error: any) {
      console.error('Error fetching students count:', error)
      setStats((prev) => ({ ...prev, totalStudents: 0 }))
    } finally {
      setLoading((prev) => ({ ...prev, students: false }))
    }
  }

  const fetchTotalExams = async () => {
    try {
      setLoading((prev) => ({ ...prev, exams: true }))
      const schoolCode = getSchoolCode()
      const session = localStorage.getItem('session') || getCurrentSession()

      const response = await AxiosFunc.Get(
        `/school-group/{schoolGroupCode}/school/${schoolCode}/teacher/dashboard/analytics`,
        { session },
      )

      const data = response.data?.data

      const examCount =
        data?.totalExams ??
        data?.examCount ??
        (Array.isArray(data?.examSchedules) ? data.examSchedules.length : null)

      setStats((prev) => ({
        ...prev,
        totalExams: examCount !== null && examCount !== undefined ? examCount : 0,
      }))
    } catch (error: any) {
      console.error('Error fetching exams count:', error)
      setStats((prev) => ({ ...prev, totalExams: 0 }))
    } finally {
      setLoading((prev) => ({ ...prev, exams: false }))
    }
  }

  const fetchAllStats = async () => {
    setError(null)
    await Promise.all([fetchTotalStudents(), fetchTotalExams()])
  }

  useEffect(() => {
    fetchAllStats()
    const interval = setInterval(fetchAllStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (error && (loading.students || loading.exams)) {
    return (
      <div className="p-6 mb-6 bg-red-50 border border-red-200 rounded-xl shadow">
        <div className="flex items-center text-red-700">
          <IconField name="FaExclamationTriangle" className="mr-3 text-xl" />
          <span className="text-lg font-medium">{error}</span>
        </div>
        <button
          onClick={fetchAllStats}
          className="mt-3 px-4 py-2 text-base bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
        <StatCard
          icon={<IconField name="FaUserGraduate" size={34} className="cursor-default" />}
          value={stats.totalStudents.toLocaleString('en-IN')}
          label={T.Total_Students}
          bgColor="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200"
          textColor="text-purple-700"
          loading={loading.students}
        />
      </div>
      <div className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
        <StatCard
          icon={<IconField name="FaClipboardList" size={34} />}
          value={stats.totalExams.toLocaleString('en-IN')}
          label={T.Total_Exams}
          bgColor="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200"
          textColor="text-blue-700"
          loading={loading.exams}
        />
      </div>
    </div>
  )
}

export default StatsCards

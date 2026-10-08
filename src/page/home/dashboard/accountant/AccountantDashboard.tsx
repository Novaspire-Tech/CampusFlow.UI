import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconField } from '../../../../components'
import Button from '../../../../components/controlled/Button'
import { useAllStudents } from '../../../../hooks/queries/studentInformation/useStudents'
import { useFeeTypes } from '../../../../hooks/queries/feesCollection/useFeeTypes'
import { useClassFees } from '../../../../hooks/queries/feesCollection/useClassFees'
import { feeTransactionService } from '../../../../services/feesCollection/feeTransactionService'
import PieCharts from './PieCharts'
import CountUp from 'react-countup'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, accountTranslation } from '../../../../helpers/useTranslations'

interface DashboardStats {
  totalStudents: number
  totalFeeTypes: number
  totalClassFees: number
  totalTransactions: number
  totalCollectedAmount: number
  totalPendingAmount: number
  todayCollections: number
  thisWeekCollections: number
  thisMonthCollections: number
  thisYearCollections: number
  fullyPaidStudents: number
  partialPaidStudents: number
  unpaidStudents: number
}

interface RecentTransaction {
  id: string | number
  date: string
  studentName: string
  admissionNo: string
  className: string
  sectionName: string
  feeTypeName: string
  amount: number
  mode: string
  receiptNo: string
}

interface StudentFeeStatus {
  studentId: string
  studentName: string
  totalFees: number
  paidFees: number
  pending: number
  status: 'Fully Paid' | 'Partial' | 'Unpaid'
}

const AccountantDashboard: React.FC = () => {
  const navigate = useNavigate()

  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFeeTypes: 0,
    totalClassFees: 0,
    totalTransactions: 0,
    totalCollectedAmount: 0,
    totalPendingAmount: 0,
    todayCollections: 0,
    thisWeekCollections: 0,
    thisMonthCollections: 0,
    thisYearCollections: 0,
    fullyPaidStudents: 0,
    partialPaidStudents: 0,
    unpaidStudents: 0,
  })
  const { t } = useTranslation()
  const texts = accountTranslation(t)
  const T = getPagesDataText(t)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [, setStudentFeeStatus] = useState<StudentFeeStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month')
  const [collectionTrend, setCollectionTrend] = useState({
    value: '+0%',
    direction: 'up' as 'up' | 'down',
  })

  const { data: studentsData, isLoading: studentsLoading } = useAllStudents('asc')
  const { data: feeTypes = [] } = useFeeTypes()

  const { data: classFeesResponse = [] } = useClassFees(0, 1000, 'asc')

  const classFeesArray: any[] = Array.isArray(classFeesResponse)
    ? classFeesResponse
    : ((classFeesResponse as any)?.classFees ??
      (classFeesResponse as any)?.data ??
      (classFeesResponse as any)?.list ??
      (classFeesResponse as any)?.items ??
      [])

  const parseDate = (dateString: string): Date => {
    try {
      if (!dateString) return new Date(0)
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number)
        return new Date(year, month - 1, day)
      }
      return new Date(dateString)
    } catch {
      return new Date(0)
    }
  }

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

  const isThisWeek = (date: Date): boolean => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    return date >= startOfWeek && date <= endOfWeek
  }

  const isThisMonth = (date: Date) => {
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  const isThisYear = (date: Date) => date.getFullYear() === new Date().getFullYear()

  const calculateTrend = (
    current: number,
    previous: number,
  ): { value: string; direction: 'up' | 'down' } => {
    if (previous === 0) return { value: '+100%', direction: 'up' }
    const change = ((current - previous) / previous) * 100
    return {
      direction: change >= 0 ? 'up' : 'down',
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    }
  }

  const getPaymentStatus = (
    pending: number,
    paidFees: number,
  ): 'Fully Paid' | 'Partial' | 'Unpaid' => {
    if (paidFees === 0) return 'Unpaid'
    if (pending <= 0) return 'Fully Paid'
    return 'Partial'
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        const transactionsResponse = await feeTransactionService.getAllPages('desc')
        const transactions = transactionsResponse.feeTransactions || []
        const students = studentsData?.students || []

        // Student lookup map
        const studentMap = new Map<string, any>()
        students.forEach((student: any) => {
          const studentId = student.studentId?.toString() || student.id?.toString()
          if (studentId) {
            studentMap.set(studentId, {
              name:
                `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim() ||
                'Unknown',
              admissionNo: student.admissionNo || 'N/A',
              className: student.className || student.class || 'N/A',
              sectionName: student.sectionName || student.section || 'N/A',
            })
          }
        })

        let todayTotal = 0
        let weekTotal = 0
        let monthTotal = 0
        let yearTotal = 0
        let lastMonthTotal = 0
        const studentTransactionsMap = new Map<string, any[]>()

        transactions.forEach((tx: any) => {
          const amount = parseFloat(tx.amount) || 0
          const txDate = parseDate(tx.date)
          const studentId = tx.studentId?.toString()

          if (isToday(txDate)) todayTotal += amount
          if (isThisWeek(txDate)) weekTotal += amount
          if (isThisMonth(txDate)) monthTotal += amount
          if (isThisYear(txDate)) yearTotal += amount

          const now = new Date()
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          if (
            txDate.getMonth() === lastMonth.getMonth() &&
            txDate.getFullYear() === lastMonth.getFullYear()
          ) {
            lastMonthTotal += amount
          }

          if (studentId) {
            if (!studentTransactionsMap.has(studentId)) {
              studentTransactionsMap.set(studentId, [])
            }
            studentTransactionsMap.get(studentId)!.push(tx)
          }
        })

        setCollectionTrend(calculateTrend(monthTotal, lastMonthTotal))

        const totalCollected = transactions.reduce(
          (sum: number, tx: any) => sum + (parseFloat(tx.amount) || 0),
          0,
        )

        let fullyPaidCount = 0
        let partialPaidCount = 0
        let unpaidCount = 0
        let totalPendingAmount = 0
        const studentStatusList: StudentFeeStatus[] = []

        students.forEach((student: any) => {
          const studentId = student.studentId?.toString() || student.id?.toString()
          if (!studentId) return

          const studentTransactions = studentTransactionsMap.get(studentId) || []

          // Latest transaction per fee type
          const feeTypeMap = new Map<string, any>()
          studentTransactions.forEach((tx: any) => {
            const feeTypeId = tx.feeTypeId?.toString()
            if (!feeTypeId) return
            if (!feeTypeMap.has(feeTypeId)) {
              feeTypeMap.set(feeTypeId, tx)
            } else {
              const existing = feeTypeMap.get(feeTypeId)
              const existDate = new Date(existing.date || 0)
              const curDate = new Date(tx.date || 0)
              if (
                curDate > existDate ||
                (curDate.getTime() === existDate.getTime() &&
                  (tx.feeTransactionId || 0) > (existing.feeTransactionId || 0))
              ) {
                feeTypeMap.set(feeTypeId, tx)
              }
            }
          })

          let totalFees = 0
          let totalPaid = 0

          feeTypeMap.forEach((tx: any) => {
            totalFees += parseFloat(tx.feesTotalFees?.toString() || '0') || 0
            totalPaid += parseFloat(tx.feesPaid?.toString() || '0') || 0
          })

          if (feeTypeMap.size === 0 && student.feesList?.length > 0) {
            student.feesList.forEach((fee: any) => {
              totalFees += parseFloat(fee.totalFees || '0') || 0
              totalPaid += parseFloat(fee.paid || '0') || 0
            })
          }

          const pending = Math.max(0, totalFees - totalPaid)
          totalPendingAmount += pending

          const status = getPaymentStatus(pending, totalPaid)
          if (status === 'Fully Paid') fullyPaidCount++
          else if (status === 'Partial') partialPaidCount++
          else unpaidCount++

          studentStatusList.push({
            studentId,
            studentName:
              `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim() ||
              'Unknown',
            totalFees,
            paidFees: totalPaid,
            pending,
            status,
          })
        })

        setStudentFeeStatus(studentStatusList)

        setStats({
          totalStudents: students.length,
          totalFeeTypes: Array.isArray(feeTypes) ? feeTypes.length : 0,
          totalClassFees: classFeesArray.length,
          totalTransactions: transactions.length,
          totalCollectedAmount: totalCollected,
          totalPendingAmount,
          todayCollections: todayTotal,
          thisWeekCollections: weekTotal,
          thisMonthCollections: monthTotal,
          thisYearCollections: yearTotal,
          fullyPaidStudents: fullyPaidCount,
          partialPaidStudents: partialPaidCount,
          unpaidStudents: unpaidCount,
        })

        const recent = transactions.slice(0, 10).map((tx: any, index: number) => {
          const studentId = tx.studentId?.toString()
          const student = studentId ? studentMap.get(studentId) : null
          return {
            id: tx.feeTransactionId || tx.id || index,
            date: tx.date || new Date().toLocaleDateString('en-IN'),
            studentName: student?.name || tx.studentName || 'Unknown',
            admissionNo: student?.admissionNo || tx.admissionNo || 'N/A',
            className: student?.className || tx.className || 'N/A',
            sectionName: student?.sectionName || tx.sectionName || '',
            feeTypeName: tx.feeTypeName || 'N/A',
            amount: parseFloat(tx.amount) || 0,
            mode: tx.mode || 'N/A',
            receiptNo: tx.receiptNo || 'N/A',
          }
        })

        setRecentTransactions(recent)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (studentsData) {
      loadDashboardData()
    }
  }, [studentsData, feeTypes, classFeesArray.length])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const getPeriodCollection = () => {
    switch (selectedPeriod) {
      case 'today':
        return stats.todayCollections
      case 'week':
        return stats.thisWeekCollections
      case 'year':
        return stats.thisYearCollections
      default:
        return stats.thisMonthCollections
    }
  }

  const QuickActionCard = ({
    title,
    icon,
    color,
    onClick,
    description,
  }: {
    title: string
    icon: string
    color: string
    onClick: () => void
    description?: string
  }) => (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div
          className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}
        >
          <IconField
            name={icon}
            size={24}
            className={color.replace('border-', 'text-').replace('-600', '-600')}
          />
        </div>
      </div>
    </div>
  )

  const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
    trendValue,
  }: {
    title: string
    value: string | number
    icon: string
    color: string
    trend?: 'up' | 'down'
    trendValue?: string
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`p-2 rounded-lg ${color} transition-transform duration-300 hover:scale-110`}
        >
          <IconField name={icon} size={20} className="text-white" />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
          >
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )

  if (isLoading || studentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">{T.Loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{texts.Accountant_Dashboard}</h1>
        <p className="text-gray-500 mt-1">{texts.Welcome_back_Heres_your_financial_overview}</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['today', 'week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {selectedPeriod} {texts.Collection}
          </span>
          <span className="text-2xl font-bold text-blue-600 transition-all duration-300">
            <CountUp
              key={selectedPeriod}
              end={getPeriodCollection()}
              duration={1}
              separator=","
              prefix="₹"
            />
          </span>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={texts.Total_Collection}
          value={formatCurrency(stats.totalCollectedAmount)}
          icon="FaRupeeSign"
          color="bg-green-600"
          trend={collectionTrend.direction}
          trendValue={collectionTrend.value}
        />
        <StatCard
          title={T.Pending_Amount}
          value={formatCurrency(stats.totalPendingAmount)}
          icon="FaClock"
          color="bg-red-600"
        />
        <StatCard
          title={T.Total_Students}
          value={stats.totalStudents}
          icon="FaUsers"
          color="bg-blue-600"
        />
        <StatCard
          title={T.Total_Transactions}
          value={stats.totalTransactions}
          icon="FaExchangeAlt"
          color="bg-purple-600"
        />
      </div>

      {/* Pie Charts */}
      <div className="mb-8">
        <PieCharts />
      </div>

      {/* Student Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-green-800">{T.Fully_Paid}</h3>
            <div className="p-2 bg-green-200 rounded-full">
              <IconField name="FaCheckCircle" size={20} className="text-green-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.fullyPaidStudents}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-orange-800">{T.Partial_Paid}</h3>
            <div className="p-2 bg-orange-200 rounded-full">
              <IconField name="FaExclamationTriangle" size={20} className="text-orange-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-700">{stats.partialPaidStudents}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-red-800">{T.Unpaid}</h3>
            <div className="p-2 bg-red-200 rounded-full">
              <IconField name="FaTimesCircle" size={20} className="text-red-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.unpaidStudents}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{T.Quick_Actions}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickActionCard
          title={texts.Due_Fees}
          icon="FaMoneyBill"
          color="border-blue-600"
          description="Find students with pending fees"
          onClick={() => navigate('/search-due-fees')}
        />
        <QuickActionCard
          title={T.Add_Fine}
          icon="FaExclamationCircle"
          color="border-orange-600"
          description="Apply fines to students"
          onClick={() => navigate('/add-fine')}
        />
        <QuickActionCard
          title={T.Fees_Receipt}
          icon="FaFileInvoice"
          color="border-green-600"
          description="Generate and print receipts"
          onClick={() => navigate('/fee-receipt')}
        />
        <QuickActionCard
          title={T.Search_Fees_PaymentTitle}
          icon="FaSearchDollar"
          color="border-purple-600"
          description="Search payment transactions"
          onClick={() => navigate('/search-fees-payment')}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{texts.Recent_Transaction}</h2>
          <Button
            name={texts.View_All}
            loading={false}
            onClick={() => navigate('/search-fees-payment')}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  T.Date,
                  T.Student,
                  T.Admission_No,
                  T.Class_Section,
                  T.Fee_Type,
                  T.Amount,
                  T.Mode,
                  T.Receipt_No,
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2 text-xs font-medium text-gray-500 uppercase ${
                      i === 5 ? 'text-right' : i === 6 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{tx.studentName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.admissionNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {tx.className}
                    {tx.sectionName && ` - ${tx.sectionName}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.feeTypeName}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      {tx.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.receiptNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-400">{texts.No_recent_transactions}</div>
        )}
      </div>
    </div>
  )
}

export default AccountantDashboard

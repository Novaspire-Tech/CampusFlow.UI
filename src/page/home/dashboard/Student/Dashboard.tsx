import React, { useState, useEffect } from 'react'
import FeesChart from './FeesChart'
import PieCharts from './PieCharts'
import 'boxicons/css/boxicons.min.css'
import { getDashboardText } from '../../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'
import { attendanceService } from '../../../../services/attendence/attendanceservice'
import { useEvents } from '../../../../hooks/queries/alumni/useEvents'
import { roleApi } from '../../../../services/role/roleApi'
import { staffService } from '../../../../services/systemSettinds/staffApi'
import { useNavigate } from 'react-router-dom'
import AxiosFunc from '../../../../utils/axios'

interface EventItem {
  id: string
  title: string
  classSection: string
  session: string
  from: string
  to: string
}

interface DashboardAttendanceStats {
  presentCount: number
  lateCount: number
  absentCount: number
  totalCount: number
  displayValue: string
  presentPercentage: number
}

interface FeeStats {
  unpaidCount: number
  partialCount: number
  paidCount: number
  displayValue: string
  totalStudents: number
}

interface RoleCountData {
  adminCount: number
  teacherCount: number
  parentCount: number
  studentCount: number
  staffCount: number
  librarianCount: number
  hostelWardenCount: number
  transportInchargeCount: number
  accountantCount: number
  receptionistCount: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  const [roleCounts, setRoleCounts] = useState<RoleCountData>({
    adminCount: 0,
    teacherCount: 0,
    parentCount: 0,
    studentCount: 0,
    staffCount: 0,
    librarianCount: 0,
    hostelWardenCount: 0,
    transportInchargeCount: 0,
    accountantCount: 0,
    receptionistCount: 0,
  })

  const [roleLoading, setRoleLoading] = useState<boolean>(true)
  const [, setRoleError] = useState<string | null>(null)

  const [attendanceStats, setAttendanceStats] = useState<DashboardAttendanceStats>({
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    totalCount: 0,
    displayValue: '0/0',
    presentPercentage: 0,
  })

  const [feeStats, setFeeStats] = useState<FeeStats>({
    unpaidCount: 0,
    partialCount: 0,
    paidCount: 0,
    displayValue: '0/0',
    totalStudents: 0,
  })

  const [totalStudentCount, setTotalStudentCount] = useState<number>(0)
  const [financialReports, setFinancialReports] = useState<any>(null)
  const [, setIsAllSchoolsMode] = useState<boolean>(false)
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false)
  const [feeLoading, setFeeLoading] = useState<boolean>(false)
  const [monthlyFeesCollection, setMonthlyFeesCollection] = useState<number>(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0)
  const [, setDataMonth] = useState<string>('')

  const { t } = useTranslation()
  const dashboardText = getDashboardText(t)
  const unpaidText = dashboardText.unpai || 'Unpaid'
  const partialText = dashboardText.partial || 'Partial'
  const paidText = dashboardText.paid || 'Paid'
  const presentText = dashboardText.present || 'Present'
  const lateText = dashboardText.late || 'Late'
  const absentText = dashboardText.absent || 'Absent'
  const monthlyFeesCollectionText = dashboardText.monthlyFeesCollection || 'Monthly Fees Collection'
  const monthlyFeesExpensesText = dashboardText.monthlyFeesExpenses || 'Monthly Expenses'
  const studentText = dashboardText.student || 'Students'
  const staffText = dashboardText.adminAndStaffCount || 'Staff'
  const adminText = dashboardText.ADMIN || 'Admin'
  const teacherText = dashboardText.TEACHER || 'Teacher'
  const parentText = dashboardText.PARENT || 'Parent'
  const librarianText = dashboardText.LIBRARIAN || 'Librarian'
  const accountantText = dashboardText.ACCOUNTANT || 'ACCOUNTANT'
  const receptionistText = dashboardText.RECEPTIONIST || 'RECEPTIONIST'
  const hostelWardenText = 'HOSTEL'
  const transportInchargeText = 'TRANSPORT'

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const startDay = monthStart.getDay()
  const daysInMonth = monthEnd.getDate()
  const { data: eventsData = [] } = useEvents()
  const weeks: (number | null)[][] = []
  let day = 1 - startDay

  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    date: number
    events: EventItem[]
  } | null>(null)

  while (day <= daysInMonth) {
    const week: (number | null)[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day > 0 && day <= daysInMonth ? day : null)
      day++
    }
    weeks.push(week)
  }

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  const parseEventDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    const parts = dateStr.split('/')
    if (parts.length !== 3) return null
    const [day, month, year] = parts.map(Number)
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  }

  const events: EventItem[] = eventsData.map((event) => {
    const sessionName = event.session?.sessionName || ''
    return {
      id: event.eventsId || '',
      title: event.eventTitle || '',
      classSection: event.classSection || '',
      session: sessionName,
      from: event.fromDate || '',
      to: event.toDate || '',
    }
  })

  const getEventsForDate = (date: number): EventItem[] => {
    const current = new Date(year, month, date, 0, 0, 0, 0)
    return events.filter((event) => {
      const from = parseEventDate(event.from)
      const to = parseEventDate(event.to)
      if (!from || !to) return false
      const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate())
      const toMidnight = new Date(to.getFullYear(), to.getMonth(), to.getDate())
      const currentMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate())
      return currentMidnight >= fromMidnight && currentMidnight <= toMidnight
    })
  }

  const handleMonthlyDataUpdate = (feesData: number[], expensesData: number[]) => {
    try {
      const totalMonthlyFees = feesData.reduce((sum, amount) => sum + amount, 0)
      const totalMonthlyExpenses = expensesData.reduce((sum, amount) => sum + amount, 0)
      setMonthlyFeesCollection(totalMonthlyFees)
      setMonthlyExpenses(totalMonthlyExpenses)
      const currentDate = new Date()
      const currentMonthName = currentDate.toLocaleString('default', { month: 'long' })
      setDataMonth(currentMonthName)
    } catch (error) {
      console.error('Error updating monthly data:', error)
    }
  }

  const fetchRoleCounts = async () => {
    try {
      console.log('Fetching role counts from roleApi...')
      const response = await roleApi.getRolesCount()
      console.log('Role API Response:', response)

      if (response?.data) {
        const data = response.data
        setRoleCounts((prev) => ({
          ...prev,
          adminCount: data.adminCount || data.ADMIN || data.Admin || 0,
          teacherCount: data.teacherCount || data.TEACHER || data.Teacher || 0,
          parentCount: data.parentCount || data.PARENT || data.Parent || 0,
          studentCount: data.studentCount || data.STUDENT || data.Student || 0,
          staffCount: data.staffCount || data.STAFF || data.Staff || 0,
        }))
      } else {
        setRoleCounts((prev) => ({
          ...prev,
          adminCount: 0,
          teacherCount: 0,
          parentCount: 0,
          studentCount: 0,
          staffCount: 0,
        }))
      }
    } catch (error) {
      console.error('Error fetching role counts:', error)
      setRoleError('Failed to load role counts')
      setRoleCounts((prev) => ({
        ...prev,
        adminCount: 0,
        teacherCount: 0,
        parentCount: 0,
        studentCount: 0,
        staffCount: 0,
      }))
    }
  }

  const fetchStaffRoleCounts = async () => {
    try {
      console.log('Fetching staff role counts from staffService...')
      const res = await staffService.getAll(0, 1000)

      let staffList: any[] = []
      if (res?.staffList && Array.isArray(res.staffList)) {
        staffList = res.staffList
      } else if (Array.isArray(res)) {
        staffList = res
      } else if (res?.data?.staffList) {
        staffList = res.data.staffList
      } else if (res?.data && Array.isArray(res.data)) {
        staffList = res.data
      }

      if (staffList.length > 0) {
        const librarianCount = staffList.filter(
          (s: any) => s.role?.toUpperCase() === 'LIBRARIAN',
        ).length
        const hostelWardenCount = staffList.filter(
          (s: any) =>
            s.role?.toUpperCase() === 'HOSTEL_WARDEN' ||
            s.role?.toUpperCase() === 'HOSTEL WARDEN' ||
            s.role?.toUpperCase() === 'HOSTEL',
        ).length
        const transportInchargeCount = staffList.filter(
          (s: any) =>
            s.role?.toUpperCase() === 'TRANSPORT_INCHARGE' ||
            s.role?.toUpperCase() === 'TRANSPORT INCHARGE' ||
            s.role?.toUpperCase() === 'TRANSPORT',
        ).length
        const accountantCount = staffList.filter(
          (s: any) => s.role?.toUpperCase() === 'ACCOUNTANT',
        ).length
        const receptionistCount = staffList.filter(
          (s: any) => s.role?.toUpperCase() === 'RECEPTIONIST',
        ).length

        setRoleCounts((prev) => ({
          ...prev,
          librarianCount,
          hostelWardenCount,
          transportInchargeCount,
          accountantCount,
          receptionistCount,
        }))
      } else {
        setRoleCounts((prev) => ({
          ...prev,
          librarianCount: 0,
          hostelWardenCount: 0,
          transportInchargeCount: 0,
          accountantCount: 0,
          receptionistCount: 0,
        }))
      }
    } catch (error) {
      console.error('Error fetching staff role counts:', error)
      setRoleCounts((prev) => ({
        ...prev,
        librarianCount: 0,
        hostelWardenCount: 0,
        transportInchargeCount: 0,
        accountantCount: 0,
        receptionistCount: 0,
      }))
    }
  }

  const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'
  const getSchoolGroupCode = (): string => localStorage.getItem('schoolGroupCode') || ''

  const processFinancialReports = (fin: any) => {
    if (!fin) return
    const totalIncome = Object.values(fin.monthlyTotalIncome || {}).reduce(
      (sum: number, val) => sum + (Number(val) || 0),
      0,
    )
    const totalExpense = Object.values(fin.monthlyTotalExpense || {}).reduce(
      (sum: number, val) => sum + (Number(val) || 0),
      0,
    )
    setMonthlyFeesCollection(totalIncome)
    setMonthlyExpenses(totalExpense)
    setFinancialReports(fin)
  }

  const fetchSchoolDashboard = async () => {
    try {
      setAttendanceLoading(true)
      setFeeLoading(true)
      setRoleLoading(true)

      if (isAllSchools()) {
        setIsAllSchoolsMode(true)

        const schoolGroupCode = getSchoolGroupCode()
        const response = await AxiosFunc.Get(`/school-group/${schoolGroupCode}/dashboard`)

        const dashboardData = response.data?.data || response.data

        const att = dashboardData.attendance
        setAttendanceStats({
          presentCount: att.presentStudentToday,
          lateCount: att.lateStudentToday,
          absentCount: att.absentStudentToday,
          totalCount: att.totalStudent,
          displayValue: `${att.presentStudentToday}/${att.totalStudent}`,
          presentPercentage: att.presentPercentage,
        })

        const fees = dashboardData.fees
        const unpaid = fees.unpaidStudents ?? 0
        const partial = fees.partiallyPaidStudents ?? 0
        const paid = fees.fullyPaidStudents ?? 0
        const pendingPayments = unpaid + partial
        const totalStudentsForFees = paid + partial + unpaid
        setFeeStats({
          unpaidCount: unpaid,
          partialCount: partial,
          paidCount: paid,
          displayValue: `${pendingPayments}/${totalStudentsForFees || 1}`,
          totalStudents: totalStudentsForFees,
        })

        setTotalStudentCount(dashboardData.totalStudent)

        const role = dashboardData.role || {}
        setRoleCounts((prev) => ({
          ...prev,
          adminCount: role.adminCount || 0,
          teacherCount: role.teacherCount || 0,
          parentCount: role.parentCount || 0,
          staffCount: 0,
          librarianCount: 0,
          hostelWardenCount: 0,
          transportInchargeCount: 0,
          accountantCount: 0,
          receptionistCount: 0,
        }))

        processFinancialReports(dashboardData.financialReports || null)
      } else {
        setIsAllSchoolsMode(false)

        const dashboardData = await attendanceService.getSchoolDashboard()

        const attendanceData = dashboardData.attendance
        setAttendanceStats({
          presentCount: attendanceData.presentStudentToday,
          lateCount: attendanceData.lateStudentToday,
          absentCount: attendanceData.absentStudentToday,
          totalCount: attendanceData.totalStudent,
          displayValue: `${attendanceData.presentStudentToday}/${attendanceData.totalStudent}`,
          presentPercentage: attendanceData.presentPercentage,
        })

        const feesData = dashboardData.fees
        const pendingPayments = feesData.unpaidStudents + feesData.partiallyPaidStudents
        const totalStudentsForFees =
          feesData.fullyPaidStudents + feesData.partiallyPaidStudents + feesData.unpaidStudents
        setFeeStats({
          unpaidCount: feesData.unpaidStudents,
          partialCount: feesData.partiallyPaidStudents,
          paidCount: feesData.fullyPaidStudents,
          displayValue: `${pendingPayments}/${totalStudentsForFees || 1}`,
          totalStudents: totalStudentsForFees,
        })

        setTotalStudentCount(dashboardData.totalStudent)

        if (dashboardData.financialReports) {
          processFinancialReports(dashboardData.financialReports)
        } else {
          setFinancialReports(null)
        }

        if (dashboardData.role) {
          const role = dashboardData.role
          setRoleCounts((prev) => ({
            ...prev,
            adminCount: role.adminCount || 0,
            teacherCount: role.teacherCount || 0,
            parentCount: role.parentCount || 0,
          }))

          await fetchStaffRoleCounts()
        } else {
          await fetchRoleCounts()
          await fetchStaffRoleCounts()
        }
      }
    } catch (error) {
      console.error('Error fetching school dashboard:', error)
      setAttendanceStats({
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        totalCount: 0,
        displayValue: '0/0',
        presentPercentage: 0,
      })
      setFeeStats({
        unpaidCount: 0,
        partialCount: 0,
        paidCount: 0,
        displayValue: '0/0',
        totalStudents: 0,
      })
      setTotalStudentCount(0)
      setFinancialReports(null)
    } finally {
      setAttendanceLoading(false)
      setFeeLoading(false)
      setRoleLoading(false)
    }
  }

  const handleRoleClick = (role: string) => {
    const count =
      role === 'admin'
        ? roleCounts.adminCount
        : role === 'teacher'
          ? roleCounts.teacherCount
          : role === 'parent'
            ? roleCounts.parentCount
            : role === 'librarian'
              ? roleCounts.librarianCount
              : role === 'accountant'
                ? roleCounts.accountantCount
                : role === 'receptionist'
                  ? roleCounts.receptionistCount
                  : role === 'hostelWarden'
                    ? roleCounts.hostelWardenCount
                    : role === 'transportIncharge'
                      ? roleCounts.transportInchargeCount
                      : 0

    if (count === 0) return

    switch (role) {
      case 'teacher':
        navigate('/users', { state: { selectedTab: 'Teacher' } })
        break
      case 'parent':
        navigate('/users', { state: { selectedTab: 'Parent' } })
        break
      case 'librarian':
        navigate('/users', { state: { selectedTab: 'Librarian' } })
        break
      case 'accountant':
        navigate('/users', { state: { selectedTab: 'Accountant' } })
        break
      case 'receptionist':
        navigate('/users', { state: { selectedTab: 'Receptionist' } })
        break
      case 'hostelWarden':
        navigate('/users', { state: { selectedTab: 'Hostel Warden' } })
        break
      case 'transportIncharge':
        navigate('/users', { state: { selectedTab: 'Transport Incharge' } })
        break
      default:
        break
    }
  }

  useEffect(() => {
    fetchSchoolDashboard()
  }, [])

  useEffect(() => {
    console.log('Updated role counts:', roleCounts)
  }, [roleCounts])

  const totalStaffCount =
    roleCounts.adminCount +
    roleCounts.teacherCount +
    roleCounts.parentCount +
    roleCounts.librarianCount +
    roleCounts.accountantCount +
    roleCounts.receptionistCount +
    roleCounts.hostelWardenCount +
    roleCounts.transportInchargeCount

  return (
    <div className="campusflow-school-dashboard bg-gray-100 p-4 sm:p-6">
      <div className="campusflow-school-dashboard__inner mx-auto">
        <h2 className="campusflow-school-dashboard__heading text-xl sm:text-2xl font-bold text-gray-700 text-center mb-6">
          {dashboardText.dashboardTitle || 'Dashboard'}
        </h2>

        {/* {roleError && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            <p className="text-sm">{roleError}</p>
          </div>
        )} */}

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
          <div
            className="border-2 border-blue-100 bg-white shadow-xl p-6 rounded-xl hover:transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:border-blue-300 cursor-pointer "
            onClick={() => navigate('/search-due-fees')}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <i className="bx bx-money text-2xl text-blue-600"></i>
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-800">
                    {dashboardText.Fees_Awaiting_Payments || 'Fees Awaiting Payments'}
                  </span>
                </div>
              </div>
              <span className="font-bold text-3xl text-blue-700">
                {feeLoading ? <span className="text-gray-400">...</span> : feeStats.displayValue}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div
                className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out shadow-md"
                style={{
                  width:
                    feeStats.totalStudents > 0
                      ? `${((feeStats.unpaidCount + feeStats.partialCount) / feeStats.totalStudents) * 100}%`
                      : '0%',
                }}
              ></div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {feeStats.totalStudents > 0 ? (
                <span>
                  {Math.round(
                    ((feeStats.unpaidCount + feeStats.partialCount) / feeStats.totalStudents) * 100,
                  )}
                  % pending payments
                </span>
              ) : (
                <span>No students found</span>
              )}
            </div>
          </div>

          <div
            className="border-2 border-green-100 bg-white shadow-xl p-6 rounded-xl hover:transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:border-green-300 cursor-pointer"
            onClick={() => navigate('/student-attendance')}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <i className="bx bx-user-check text-2xl text-green-600"></i>
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-800">
                    {dashboardText.Student_Present_Today || 'Student Present Today'}
                  </span>
                </div>
              </div>
              <span className="font-bold text-3xl text-green-700">
                {attendanceLoading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  attendanceStats.displayValue
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div
                className="bg-linear-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500 ease-in-out shadow-md"
                style={{
                  width:
                    attendanceStats.totalCount > 0
                      ? `${(attendanceStats.presentCount / attendanceStats.totalCount) * 100}%`
                      : '0%',
                }}
              ></div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {attendanceStats.totalCount > 0 ? (
                <span>{Math.round(attendanceStats.presentPercentage)}% attendance rate</span>
              ) : (
                <span>No attendance data</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          <FeesChart
            onMonthlyDataUpdate={handleMonthlyDataUpdate}
            allSchoolsData={financialReports}
          />
          <PieCharts allSchoolsData={financialReports} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center mb-6">
          {[
            {
              title: dashboardText.Fees_Awaiting_Payments || 'Fees Awaiting Payments',
              details: [
                `${unpaidText}: ${feeStats.unpaidCount}`,
                `${partialText}: ${feeStats.partialCount}`,
                `${paidText}: ${feeStats.paidCount}`,
              ],
              onClick: () => navigate('/fees-awaiting-payments'),
            },
            {
              title: dashboardText.Student_Present_Today || 'Student Present Today',
              details: [
                `${presentText}: ${attendanceStats.presentCount}`,
                `${lateText}: ${attendanceStats.lateCount}`,
                `${absentText}: ${attendanceStats.absentCount}`,
              ],
              onClick: () => navigate('/attendance-by-date'),
            },
          ].map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 hover:transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] w-full max-w-100 cursor-pointer"
            >
              <h3 className="text-lg font-bold mb-3 text-gray-800">{item.title}</h3>
              {item.details.map((detail, idx) => {
                let barColor = 'bg-gray-300'
                if (detail.includes(presentText)) barColor = 'bg-green-500'
                else if (detail.includes(lateText)) barColor = 'bg-yellow-500'
                else if (detail.includes(absentText)) barColor = 'bg-red-500'
                else if (detail.includes(unpaidText)) barColor = 'bg-red-500'
                else if (detail.includes(partialText)) barColor = 'bg-orange-500'
                else if (detail.includes(paidText)) barColor = 'bg-green-500'

                return (
                  <React.Fragment key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {detail.split(':')[0]}:
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {detail.split(':')[1] || ''}
                      </span>
                    </div>
                    <div className={`h-2 w-full mb-3 mt-1 rounded-full ${barColor}`}></div>
                  </React.Fragment>
                )
              })}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[
            {
              title: monthlyFeesCollectionText,
              amount: `₹${monthlyFeesCollection.toLocaleString('en-IN')}`,
              icon: 'bx bx-money text-green-500',
            },
            {
              title: monthlyFeesExpensesText,
              amount: `₹${monthlyExpenses.toLocaleString('en-IN')}`,
              icon: 'bx bx-credit-card text-gray-700',
            },
            {
              title: studentText,
              amount: attendanceLoading ? '...' : totalStudentCount.toString(),
              icon: 'bx bxs-graduation text-gray-700',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-md p-6 border border-gray-300 text-center hover:transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105"
            >
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              {item.amount && <p className="text-base font-bold">{item.amount}</p>}
              <div className="flex justify-center mt-2">
                <i className={`${item.icon} text-4xl`}></i>
              </div>
            </div>
          ))}
        </div>

        <div className="campusflow-dashboard-calendar-layout flex flex-col lg:flex-row gap-4 lg:gap-6 w-full p-2 sm:p-4">
          <div className="campusflow-calendar-panel w-full lg:w-2/3 xl:w-3/4 bg-white rounded-xl shadow p-2 sm:p-4 overflow-auto">
            <div className="campusflow-calendar-header flex justify-between items-center mb-4">
              <button
                onClick={goToPrevMonth}
                className="text-lg sm:text-xl p-1 sm:px-2 hover:bg-gray-100 rounded"
                aria-label="Previous month"
              >
                <i className="bx bx-chevron-left" aria-hidden="true"></i>
              </button>
              <h2 className="text-lg sm:text-xl font-semibold">{`${monthName} ${year}`}</h2>
              <button
                onClick={goToNextMonth}
                className="text-lg sm:text-xl p-1 sm:px-2 hover:bg-gray-100 rounded"
                aria-label="Next month"
              >
                <i className="bx bx-chevron-right" aria-hidden="true"></i>
              </button>
            </div>

            <div className="campusflow-calendar-grid w-full">
              <div className="campusflow-calendar-weekdays grid grid-cols-7 text-xs sm:text-sm font-semibold text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="p-1 sm:p-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="campusflow-calendar-weeks">
                {weeks.map((week, i) => (
                  <div key={i} className="campusflow-calendar-week grid grid-cols-7 gap-1 text-xs">
                    {week.map((date, j) => {
                      const dateEvents = date ? getEventsForDate(date) : []
                      const visibleEvents = dateEvents.slice(0, 2)
                      const moreCount = dateEvents.length - 2
                      const isToday =
                        date !== null &&
                        date === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear()

                      return (
                        <div
                          key={j}
                          className={`campusflow-calendar-day h-20 sm:h-24 border border-gray-300 rounded-md p-1 relative overflow-hidden ${
                            isToday ? 'campusflow-calendar-day--today' : ''
                          } ${dateEvents.length ? 'campusflow-calendar-day--has-events' : ''} ${
                            !date ? 'campusflow-calendar-day--empty' : ''
                          }`}
                        >
                          {date && (
                            <>
                              <div className="campusflow-calendar-day__number absolute top-1 left-1 font-bold text-xs">
                                {date}
                              </div>
                              <div className="campusflow-calendar-events mt-5 space-y-0.5 overflow-hidden">
                                {visibleEvents.map((event) => (
                                  <div
                                    key={event.id}
                                    className="campusflow-calendar-event bg-green-600 text-white px-1 py-0.5 text-[10px] rounded truncate w-full"
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {moreCount > 0 && (
                                  <div
                                    onClick={() =>
                                      setSelectedDayEvents({ date, events: dateEvents })
                                    }
                                    className="text-blue-600 font-bold text-[10px] px-1 cursor-pointer hover:underline"
                                  >
                                    +{moreCount} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}

                {selectedDayEvents && (
                  <div className="fixed inset-0 bg-blend-color-burn bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-sm">
                      <div className="flex justify-between items-center border-b pb-2 mb-3">
                        <h3 className="font-bold text-lg">
                          Events for {selectedDayEvents.date} {monthName}
                        </h3>
                        <button
                          onClick={() => setSelectedDayEvents(null)}
                          className="text-gray-500 hover:text-black text-xl"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedDayEvents.events.map((event) => (
                          <div
                            key={event.id}
                            className="p-2 bg-green-50 border-l-4 border-green-600 rounded"
                          >
                            <p className="font-semibold text-sm text-green-800">{event.title}</p>
                            <p className="text-xs text-gray-600">
                              {event.classSection} | {event.session}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="campusflow-staff-panel w-full lg:w-1/3 xl:w-1/4 bg-white p-4 sm:p-6 rounded-lg shadow-lg flex flex-col gap-3 sm:gap-4 h-auto lg:sticky lg:top-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="bx bxs-user-detail text-xl text-blue-600"></i>
              <h2 className="text-base sm:text-lg font-semibold text-center text-gray-800">
                {staffText}
              </h2>
            </div>

            {roleLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <div
                  onClick={() => roleCounts.adminCount > 0 && handleRoleClick('admin')}
                  className={`flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out ${roleCounts.adminCount > 0 ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <i className="bx bxs-user-check text-lg text-blue-600"></i>
                    </div>
                    <span className="font-medium text-gray-700 text-sm truncate">{adminText}</span>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-blue-100 text-blue-800">
                    {roleCounts.adminCount}
                  </span>
                </div>

                <div
                  onClick={() => roleCounts.teacherCount > 0 && handleRoleClick('teacher')}
                  className={`flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out ${roleCounts.teacherCount > 0 ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <i className="bx bxs-graduation text-lg text-green-600"></i>
                    </div>
                    <span className="font-medium text-gray-700 text-sm truncate">
                      {teacherText}
                    </span>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-green-100 text-green-800">
                    {roleCounts.teacherCount}
                  </span>
                </div>

                <div
                  onClick={() => roleCounts.parentCount > 0 && handleRoleClick('parent')}
                  className={`flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out ${roleCounts.parentCount > 0 ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <i className="bx bxs-user text-lg text-purple-600"></i>
                    </div>
                    <span className="font-medium text-gray-700 text-sm truncate">{parentText}</span>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-purple-100 text-purple-800">
                    {roleCounts.parentCount}
                  </span>
                </div>

                {roleCounts.librarianCount > 0 && (
                  <div
                    onClick={() => handleRoleClick('librarian')}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50">
                        <i className="bx bxs-book-alt text-lg text-indigo-600"></i>
                      </div>
                      <span className="font-medium text-gray-700 text-sm truncate">
                        {librarianText}
                      </span>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-indigo-100 text-indigo-800">
                      {roleCounts.librarianCount}
                    </span>
                  </div>
                )}

                {roleCounts.accountantCount > 0 && (
                  <div
                    onClick={() => handleRoleClick('accountant')}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50">
                        <i className="bx bxs-calculator text-lg text-emerald-600"></i>
                      </div>
                      <span className="font-medium text-gray-700 text-sm truncate">
                        {accountantText}
                      </span>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-emerald-100 text-emerald-800">
                      {roleCounts.accountantCount}
                    </span>
                  </div>
                )}

                {roleCounts.receptionistCount > 0 && (
                  <div
                    onClick={() => handleRoleClick('receptionist')}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-50">
                        <i className="bx bxs-phone-call text-lg text-teal-600"></i>
                      </div>
                      <span className="font-medium text-gray-700 text-sm truncate">
                        {receptionistText}
                      </span>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-teal-100 text-teal-800">
                      {roleCounts.receptionistCount}
                    </span>
                  </div>
                )}

                {roleCounts.hostelWardenCount > 0 && (
                  <div
                    onClick={() => handleRoleClick('hostelWarden')}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-50">
                        <i className="bx bxs-home text-lg text-orange-600"></i>
                      </div>
                      <span className="font-medium text-gray-700 text-sm truncate">
                        {hostelWardenText}
                      </span>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-orange-100 text-orange-800">
                      {roleCounts.hostelWardenCount}
                    </span>
                  </div>
                )}

                {roleCounts.transportInchargeCount > 0 && (
                  <div
                    onClick={() => handleRoleClick('transportIncharge')}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg p-3 sm:p-4 border border-gray-200 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50">
                        <i className="bx bxs-bus text-lg text-amber-600"></i>
                      </div>
                      <span className="font-medium text-gray-700 text-sm truncate">
                        {transportInchargeText}
                      </span>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap bg-amber-100 text-amber-800">
                      {roleCounts.transportInchargeCount}
                    </span>
                  </div>
                )}
              </div>
            )}

            {totalStaffCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 text-sm">Total Staff</span>
                  <span className="font-bold text-lg text-gray-900">
                    {roleLoading ? <span className="text-gray-400">...</span> : totalStaffCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

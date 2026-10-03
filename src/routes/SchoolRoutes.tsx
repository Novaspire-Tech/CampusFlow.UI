import { useState, type JSX } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../containers/layout/Navbar'
import Sidebar from '../containers/layout/Sidebar'
import Footer from '../containers/layout/Footer'

//  Page Imports
import WhatsApp from '../page/home/whatsapp/WhatsApp'
import AdmissionEnquiry from '../page/home/frontOffice/AdmissionEnquiry'
import VistorBook from '../page/home/frontOffice/VisitorBook'
import Phonecalllog from '../page/home/frontOffice/PhoneCallLog'
import PostalDispatch from '../page/home/frontOffice/PostalDispatch'
import PostalReceive from '../page/home/frontOffice/PosterReceive'
import Complain from '../page/home/frontOffice/Complain'
import SetupFrontOffice from '../page/home/frontOffice/setupFrontOffice/SetupFrontOffice'
import StudentDetails from '../page/home/studentInformations/StudentDetails'
import StudentAdmission from '../page/home/studentInformations/StudentAdmission'
import DisabledStudent from '../page/home/studentInformations/DisabledStudent'
import StudentCategories from '../page/home/studentInformations/StudentCategories'
import StudentHouses from '../page/home/studentInformations/StudentHouse'
import Disablereason from '../page/home/studentInformations/Disablereason'
import SearchFeesPayment from '../page/home/feesCollection/SearchFeesPayment'
import SearchDueFees from '../page/home/feesCollection/SearchDueFees'
import FeesType from '../page/home/feesCollection/FeesType'
import AddFine from '../page/home/feesCollection/AddFine'
import AddIncomes from '../page/home/income/AddIncome'
import SearchIncome from '../page/home/income/SearchIncome'
import IncomeHead from '../page/home/income/IncomeHead'
import AddExpense from '../page/home/expenses/AddExpense'
import SearchExpenses from '../page/home/expenses/SearchExpenses'
import ExpenseHead from '../page/home/expenses/ExpenseHead'
import ExamGroup from '../page/home/examination/ExamGroup'
import ExamSchedule from '../page/home/examination/ExamSchedule'
import ExamResult from '../page/home/examination/ExamResult'
import DesignAdmitCard from '../page/home/examination/DesignAdmitCard'
import PrintAdmitCard from '../page/home/examination/PrintAdmitCard'
import DesignMarksheet from '../page/home/examination/DesignMarksheet'
import Printmarksheet from '../page/home/examination/Printmarksheet'
import MarksGrade from '../page/home/examination/MarksGrade'
import MarkDivision from '../page/home/examination/MarkDivision'
import StudentAttendance from '../page/home/attendance/StudentAttendance'
import AttendanceByDate from '../page/home/attendance/AttendanceByDate'
import ClassTimeTable from '../page/home/academic/ClassTimeTable'
import TeacherTimeTable from '../page/home/academic/TeacherTimetable'
import AssignClassTeachers from '../page/home/academic/AssignClassTeacher'
import Promotestudent from '../page/home/academic/PromoteStudent'
import SubjectGroup from '../page/home/academic/SubjectGroup'
import Subject from '../page/home/academic/Subjects'
import Class from '../page/home/academic/Class'
import Section from '../page/home/academic/Sections'
import LessonPage from '../page/home/lessonPlan/LessonPage'
import StaffDirectory from '../page/home/humanResource/StaffDirectory'
import ApplyLeave from '../page/home/humanResource/ApplyLeave'
import Department from '../page/home/humanResource/Department'
import Designation from '../page/home/humanResource/Designation'
import Edit from '../page/home/humanResource/Edit'
import SendEmail from '../page/home/communicate/SendEmail'
import ContentType from '../page/home/downloadCenter/ContentType'
import UploadShareContent from '../page/home/downloadCenter/UploadShareContent'
import VideoTutorialList from '../page/home/downloadCenter/VideoTutorialList'
import BookList from '../page/home/library/BookList'
import IssueReturn from '../page/home/library/IssueRetuen'
import AddStudent from '../page/home/library/AddStudent'
import AddStaffMember from '../page/home/library/AddStaffMember'
import IssueItem from '../page/home/inventory/IssueItem'
import AddItemStock from '../page/home/inventory/AddItemStock'
import AddItem from '../page/home/inventory/AddItem'
import ItemCategory from '../page/home/inventory/ItemCategory'
import ItemSupplier from '../page/home/inventory/ItemSupplier'
import ItemStore from '../page/home/inventory/ItemStore'
import PickupPoint from '../page/home/transport/PickupPoint'
import RoutesPage from '../page/home/transport/RoutesPage'
import Vehicle from '../page/home/transport/Vehicle'
import AssignVehicle from '../page/home/transport/AssignVehicle'
import RoutePickup from '../page/home/transport/RoutePickup'
import HostelRoom from '../page/home/hostel/HostelRooms'
import RoomTypeManager from '../page/home/hostel/RoomType'
import Hostel from '../page/home/hostel/Hostel'
import StudentCertificate from '../page/home/certificate/StudentCertificate'
import GenerateCertificate from '../page/home/certificate/GenerateCertificate'
import StudentIDCard from '../page/home/certificate/StudentIDCard'
import GenerateIdCard from '../page/home/certificate/GenerateIdCard'
import StaffIDCards from '../page/home/certificate/StaffIDCard'
import GenerateStaffIDCard from '../page/home/certificate/GenerateStaffIDCard'
import ManageAlu from '../page/home/alumni/ManageAlumni'
import Events from '../page/home/alumni/Events'
import SessionSetting from '../page/home/systemSettinds/SessionSetting'
import Users from '../page/home/systemSettinds/users/Users'
import Dashboard from '../page/home/dashboard/Student/Dashboard'
import PageNotFound from '../common/PageNotFound'
import RegistrationPage from '../page/auth/RegistrationPage'
import ParentDashboard from '../page/home/dashboard/parent/ParentDashboard'
import TeacherDashboard from '../page/home/dashboard/teacher/TeacherDashboard'
import LoginPage from '../page/auth/LoginPage'
import ForgotPasswordPage from '../page/auth/ForgotPasswordPage'
import ResultPage from '../page/home/dashboard/parent/Results'
import ExamTypePage from '../page/home/examination/ExamTypePage'
import FeeReceipt from '../page/home/feesCollection/FeeReceipt'
import MonthlyAttendanceReport from '../page/home/attendance/MonthlyAttendanceReport'
import StaffView from '../page/home/humanResource/StaffView'
import ApproveLeave from '../page/home/humanResource/ApproveLeave'
import MarksManagement from '../page/home/academic/MarksManagement'
import PrintExamResult from '../page/home/examination/PrintExamResult'
import ClassFees from '../page/home/feesCollection/ClassFees'
import CreateRole from '../page/home/role/CreateRole'
import AssignRole from '../page/home/role/AssignRole'
import ItemStoreList from '../page/home/inventory/ItemStore'
import RoomType from '../page/home/hostel/RoomType'
import GenerateIdCardPage from '../page/home/certificate/GenerateIdCard'
import StaffIDCard from '../page/home/certificate/StaffIDCard'
import TopicPage from '../page/home/lessonPlan/TopicPage'
import AddHomeWork from '../page/home/homework/AddHomework'
import DailyAssignment from '../page/home/homework/DailyAssignment'
import LibraryDashboard from '../page/home/dashboard/library/LibraryDashboard'
import HostelDashboard from '../page/home/dashboard/hostel/HostelDashboard'
import TransportDashboard from '../page/home/dashboard/transport/Transportdashboard'
import StudentTransportDetailsPage from '../page/home/dashboard/transport/StudentTransportDetailsPage'
import CreateSchool from '../page/home/database/CreateSchool'
import AccountantDashboard from '../page/home/dashboard/accountant/AccountantDashboard'
import SuperAdminLoginPage from '../page/auth/SuperAdminLogin'
import ReceptionistDashboard from '../page/home/dashboard/receptionist/Receptionistdashboard'
import ExpenseGroup from '../page/home/expenses/ExpenseGroup'
import IncomeGroup from '../page/home/income/IncomeGroup'
import HostelStudentAllocation from '../page/home/hostel/HostelStudentAllocation'
import UserActivity from '../page/home/systemSettinds/UserActivity'
import { schoolApi } from '../services/apis/api'
import AddStudentFees from '../page/home/feesCollection/AddStudentFees'
import AddHostelFees from '../page/home/hostel/AddHostelFees'
import AddStudentTransportFees from '../page/home/transport/StudentTransportFees'
import Departments from '../page/home/academic/Departments'
import BalanceSheet from '../page/home/feesCollection/BalanceSheet'
import SchoolGroupRole from '../page/home/systemSettinds/SchoolGroupRole'
import GroupUserProfile from '../page/home/dashboard/Student/GroupUserProfile'
import { GroupUser } from '../page/home/systemSettinds/GroupUser'
import FeesAwaitingPayments from '../page/home/feesCollection/FeesAwaitingPayments'
import PaymentHistory from '../page/home/feesCollection/PaymentHistory'
import DeleteFeeTransactionById from '../page/home/feesCollection/DeleteFeeTransactionById'

//  Permission Helpers
const hasPermissionForScope = (scope?: string): boolean => {
  const role = localStorage.getItem('role')
  if (role === 'SCHOOL' || 'SCHOOL_GROUP') return true
  if (!scope) return true

  try {
    const storedPermissions = localStorage.getItem('crudPermissions')
    if (storedPermissions) {
      const userPermissions = JSON.parse(storedPermissions)
      if (Array.isArray(userPermissions)) {
        return userPermissions.some(
          (permission) => permission.scope === scope && permission.operations.length > 0,
        )
      }
    }
  } catch (error) {
    console.error('Error checking permissions:', error)
  }
  return false
}

const hasFeatureAccess = async (featureCode?: string): Promise<boolean> => {
  const schoolCode = localStorage.getItem('schoolCode') ?? ''

  try {
    const storedFeatureCodes = await schoolApi.getFeatureCodes(schoolCode)
    if (!storedFeatureCodes) return false
    const featureCodes = storedFeatureCodes
    if (!Array.isArray(featureCodes)) return false
    return !featureCode || featureCodes.includes(featureCode)
  } catch (error) {
    console.error('Error checking feature codes:', error)
    return false
  }
}

//  Route Permission Map
interface RoutePermission {
  path: string
  scope?: string
  featureCode?: string
  roles?: string[]
}

const routePermissions: RoutePermission[] = [
  { path: '/school-dashboard', roles: ['SCHOOL', 'SCHOOL_GROUP'] },
  { path: '/parent-dashboard', roles: ['PARENT'] },
  { path: '/teacher-dashboard', roles: ['TEACHER'] },
  { path: '/library-dashboard', roles: ['LIBRARIAN'] },
  { path: '/hostel-dashboard', roles: ['HOSTEL'] },
  { path: '/transport-dashboard', roles: ['TRANSPORT'] },
  { path: '/accountant-dashboard', roles: ['ACCOUNTANT'] },
  { path: '/receptionist-dashboard', roles: ['RECEPTIONIST'] },
  { path: '/whatsapp', featureCode: 'WHATSAPP', scope: 'WHATSAPP' },
  { path: '/admission-enquiry', scope: 'FRONT_OFFICE' },
  { path: '/visitor-book', scope: 'FRONT_OFFICE' },
  { path: '/phone-call-log', scope: 'FRONT_OFFICE' },
  { path: '/postal-dispatch', scope: 'FRONT_OFFICE' },
  { path: '/postal-receive', scope: 'FRONT_OFFICE' },
  { path: '/complain', scope: 'FRONT_OFFICE' },
  { path: '/setup-front-office', scope: 'FRONT_OFFICE' },
  { path: '/student-details', scope: 'STUDENT' },
  { path: '/student-admission', scope: 'STUDENT' },
  { path: '/disabled-student', scope: 'STUDENT' },
  { path: '/student-categories', scope: 'STUDENT' },
  { path: '/student-house', scope: 'STUDENT' },
  { path: '/disable-reason', scope: 'STUDENT' },
  { path: '/class-fees', scope: 'FEES' },
  { path: '/search-fees-payment', scope: 'FEES' },
  { path: '/search-due-fees', scope: 'FEES' },
  { path: '/fees-awaiting-payments', scope: 'FEES' },
  { path: '/balance-sheet', scope: 'FEES' },
  { path: '/fees-type', scope: 'FEES' },
  { path: '/add-fine', scope: 'FEES' },
  { path: '/fee-receipt', scope: 'FEES' },
  { path: '/add-student-fees', scope: 'FEES' },
  { path: '/payment-history', scope: 'FEES' },
  { path: '/add-income', scope: 'INCOME' },
  { path: '/search-income', scope: 'INCOME' },
  { path: '/income-head', scope: 'INCOME' },
  { path: '/income-group', scope: 'INCOME' },
  { path: '/add-expense', scope: 'EXPENSES' },
  { path: '/search-expense', scope: 'EXPENSES' },
  { path: '/expense-head', scope: 'EXPENSES' },
  { path: '/expense-group', scope: 'EXPENSES' },
  { path: '/exam-type', scope: 'EXAMINATION' },
  { path: '/exam-group', scope: 'EXAMINATION' },
  { path: '/exam-schedule', scope: 'EXAMINATION' },
  { path: '/exam-result', scope: 'EXAM_RESULT' },
  { path: '/design-admit-card', scope: 'ADMIT_CARD' },
  { path: '/print-admit-card', scope: 'ADMIT_CARD' },
  { path: '/design-marksheet', scope: 'EXAM_MARKSHEET' },
  { path: '/print-marksheet', scope: 'EXAM_MARKSHEET' },
  { path: '/marks-grade', scope: 'EXAMINATION' },
  { path: '/marks-division', scope: 'EXAMINATION' },
  { path: '/print-exam-result', scope: 'EXAM_RESULT' },
  { path: '/student-attendance', scope: 'ATTENDANCE' },
  { path: '/attendance-by-date', scope: 'ATTENDANCE' },
  { path: '/monthly-attendance-report', scope: 'ATTENDANCE' },
  { path: '/class-timetable', scope: 'TIMETABLE' },
  { path: '/teachers-timetable', scope: 'TIMETABLE' },
  { path: '/assign-class-teacher', scope: 'ACADEMICS' },
  { path: '/marks-management', scope: 'ACADEMICS' },
  { path: '/promote-student', scope: 'PROMOTE_STUDENT' },
  { path: '/subject-group', scope: 'ACADEMICS' },
  { path: '/subjects', scope: 'ACADEMICS' },
  { path: '/departments', scope: 'ACADEMICS' },
  { path: '/class', scope: 'SCHOOL_CLASS' },
  { path: '/sections', scope: 'SCHOOL_CLASS' },
  { path: '/lesson', scope: 'LESSON_PLAN' },
  { path: '/topic', scope: 'LESSON_PLAN' },
  { path: '/staff-directory', scope: 'HR' },
  { path: '/approve-leave-report', scope: 'HR' },
  { path: '/apply-leave', scope: 'APPLY_LEAVE' },
  { path: '/department', scope: 'HR' },
  { path: '/designation', scope: 'HR' },
  { path: '/edit', scope: 'HR' },
  { path: '/staff/view/:staffCode', scope: 'PROFILE' },
  { path: '/send-email', featureCode: 'COMMUNICATION', scope: 'COMMUNICATION' },
  { path: '/content-type', scope: 'DOWNLOAD_CENTRE' },
  { path: '/upload-/-share-content', scope: 'DOWNLOAD_CENTRE' },
  { path: '/video-tutorial', scope: 'DOWNLOAD_CENTRE' },
  { path: '/add-homework', scope: 'HOMEWORK' },
  { path: '/daily-assignment', scope: 'HOMEWORK' },
  { path: '/book-list', scope: 'LIBRARY' },
  { path: '/issue-return', scope: 'LIBRARY' },
  { path: '/add-student', scope: 'LIBRARY' },
  { path: '/add-staff-member', scope: 'LIBRARY' },
  { path: '/issue-item', scope: 'INVENTORY' },
  { path: '/add-item-stock', scope: 'INVENTORY' },
  { path: '/add-item', scope: 'INVENTORY' },
  { path: '/item-category', scope: 'INVENTORY' },
  { path: '/item-supplier', scope: 'INVENTORY' },
  { path: '/item-store', scope: 'INVENTORY' },
  { path: '/item-store-list', scope: 'INVENTORY' },
  { path: '/pickup-points', scope: 'TRANSPORT' },
  { path: '/routes', scope: 'TRANSPORT' },
  { path: '/vehicles', scope: 'TRANSPORT' },
  { path: '/assign-vehicle', scope: 'TRANSPORT' },
  { path: '/route-pickup-point', scope: 'TRANSPORT' },
  { path: '/hostel-rooms', scope: 'HOSTEL' },
  { path: '/room-type', scope: 'HOSTEL' },
  { path: '/hostel', scope: 'HOSTEL' },
  { path: '/hostel-due-fees', scope: 'HOSTEL' },
  { path: '/hostel-student-allocation', scope: 'HOSTEL' },
  { path: '/generate-certificate', scope: 'CERTIFICATE' },
  { path: '/student-id-card', scope: 'CERTIFICATE' },
  { path: '/generate-id-card', scope: 'CERTIFICATE' },
  { path: '/generate-id-card-page', scope: 'CERTIFICATE' },
  { path: '/staff-id-card', scope: 'CERTIFICATE' },
  { path: '/generate-staff-id-card', scope: 'CERTIFICATE' },
  { path: '/student-certificate', scope: 'CERTIFICATE' },
  { path: '/manage-alumni', featureCode: 'ALUMNI', scope: 'ALUMNI' },
  { path: '/events', featureCode: 'ALUMNI', scope: 'ALUMNI' },
  { path: '/create-role', featureCode: 'OFFICE', scope: 'ROLE' },
  { path: '/assign-role', featureCode: 'OFFICE', scope: 'ROLE' },
  { path: '/general-settings', scope: 'SYSTEM_SETTINGS' },
  { path: '/session-settings', scope: 'SESSION_SETTING' },
  { path: '/users', scope: 'SYSTEM_SETTINGS' },
  { path: '/user-activity', scope: 'SYSTEM_SETTINGS' },
  { path: '/group-user-profile', scope: 'PROFILE' },
]

//  Protected Route
interface ProtectedRouteProps {
  element: JSX.Element
  path: string
  roles?: string[]
  scope?: string
  featureCode?: string
}

const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAuth()

  // if (loading) return null;

  if (isAuthenticated) {
    const role = localStorage.getItem('role')
    const staffCode = localStorage.getItem('staffCode')

    const roleRedirectMap: Record<string, string> = {
      SCHOOL: '/school-dashboard',
      SCHOOL_GROUP: '/school-dashboard',
      SCHOOL_ADMIN: `/staff/view/${staffCode}`,
      GROUP_ADMIN: '/group-user-profile',
      PARENT: '/parent-dashboard',
      TEACHER: '/teacher-dashboard',
      LIBRARIAN: '/library-dashboard',
      HOSTEL: '/hostel-dashboard',
      TRANSPORT: '/transport-dashboard',
      ACCOUNTANT: '/accountant-dashboard',
      RECEPTIONIST: '/receptionist-dashboard',
    }

    const redirectPath = (role && roleRedirectMap[role]) || '/school-dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return element
}

const ProtectedRoute = ({ element, path, roles, scope, featureCode }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth()
  const role = localStorage.getItem('role')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && (!role || !roles.includes(role))) return <Navigate to="/unauthorized" replace />
  if (featureCode && !hasFeatureAccess(featureCode)) return <Navigate to="/" replace />
  if (scope && !hasPermissionForScope(scope)) return <Navigate to="/unauthorized" replace />

  const routePermission = routePermissions.find((rp) => path.startsWith(rp.path))
  if (routePermission) {
    if (routePermission.featureCode && !hasFeatureAccess(routePermission.featureCode))
      return <Navigate to="/" replace />
    if (routePermission.scope && !hasPermissionForScope(routePermission.scope))
      return <Navigate to="/unauthorized" replace />
    if (routePermission.roles && (!role || !routePermission.roles.includes(role)))
      return <Navigate to="/unauthorized" replace />
  }

  return element
}

//  Main Layout
const MainLayout = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const location = useLocation()
  const isLoginPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/registration' ||
    location.pathname === '/super-admin/login' ||
    location.pathname === '/forgot-password'
  const closeSidebar = () => {
    if (window.matchMedia('(max-width: 767px)').matches) setIsSidebarOpen(false)
  }

  return (
    <div className="campusflow-shell flex flex-col h-screen">
      {!isLoginPage && <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}

      <div className="flex flex-1 overflow-hidden">
        {!isLoginPage && <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />}
        <div
          className={`campusflow-content flex-1 ${isLoginPage ? 'campusflow-content--auth' : 'campusflow-page-content'}`}
        >
          <Routes>
            {/*  Public Routes  */}
            <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
            <Route path="/" element={<PublicRoute element={<LoginPage />} />} />
            <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/*  Dashboards  */}
            <Route
              path="/school-dashboard"
              element={
                <ProtectedRoute
                  element={<Dashboard />}
                  path="/school-dashboard"
                  roles={['SCHOOL', 'SCHOOL_GROUP']}
                />
              }
            />
            <Route
              path="/parent-dashboard"
              element={
                <ProtectedRoute
                  element={<ParentDashboard />}
                  path="/parent-dashboard"
                  roles={['PARENT']}
                />
              }
            />
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute
                  element={<TeacherDashboard />}
                  path="/teacher-dashboard"
                  roles={['TEACHER']}
                />
              }
            />
            <Route
              path="/library-dashboard"
              element={
                <ProtectedRoute
                  element={<LibraryDashboard />}
                  path="/library-dashboard"
                  roles={['LIBRARIAN']}
                />
              }
            />
            <Route
              path="/transport-dashboard"
              element={
                <ProtectedRoute
                  element={<TransportDashboard />}
                  path="/transport-dashboard"
                  roles={['TRANSPORT']}
                />
              }
            />
            <Route
              path="/hostel-dashboard"
              element={
                <ProtectedRoute
                  element={<HostelDashboard />}
                  path="/hostel-dashboard"
                  roles={['HOSTEL']}
                />
              }
            />
            <Route
              path="/accountant-dashboard"
              element={
                <ProtectedRoute
                  element={<AccountantDashboard />}
                  path="/accountant-dashboard"
                  roles={['ACCOUNTANT']}
                />
              }
            />
            <Route
              path="/receptionist-dashboard"
              element={
                <ProtectedRoute
                  element={<ReceptionistDashboard />}
                  path="/receptionist-dashboard"
                  roles={['RECEPTIONIST']}
                />
              }
            />
            <Route
              path="/group-user-profile"
              element={
                <ProtectedRoute
                  element={<GroupUserProfile />}
                  path="/group-user-profile"
                  roles={['GROUP_ADMIN']}
                />
              }
            />

            <Route
              path="/result/:id"
              element={<ProtectedRoute element={<ResultPage />} path="/result" />}
            />

            {/*  WhatsApp  */}
            <Route
              path="/whatsapp"
              element={
                <ProtectedRoute
                  element={<WhatsApp />}
                  path="/whatsapp"
                  featureCode="WHATSAPP"
                  scope="WHATSAPP"
                />
              }
            />

            {/*  Front Office  */}
            <Route
              path="/admission-enquiry"
              element={
                <ProtectedRoute
                  element={<AdmissionEnquiry />}
                  path="/admission-enquiry"
                  scope="FRONT_OFFICE"
                />
              }
            />
            <Route
              path="/visitor-book"
              element={
                <ProtectedRoute
                  element={<VistorBook />}
                  path="/visitor-book"
                  scope="FRONT_OFFICE"
                />
              }
            />
            <Route
              path="/phone-call-log"
              element={
                <ProtectedRoute
                  element={<Phonecalllog />}
                  path="/phone-call-log"
                  scope="FRONT_OFFICE"
                />
              }
            />
            <Route
              path="/postal-dispatch"
              element={
                <ProtectedRoute
                  element={<PostalDispatch />}
                  path="/postal-dispatch"
                  scope="FRONT_OFFICE"
                />
              }
            />
            <Route
              path="/postal-receive"
              element={
                <ProtectedRoute
                  element={<PostalReceive />}
                  path="/postal-receive"
                  scope="FRONT_OFFICE"
                />
              }
            />
            <Route
              path="/complain"
              element={
                <ProtectedRoute element={<Complain />} path="/complain" scope="FRONT_OFFICE" />
              }
            />
            <Route
              path="/setup-front-office/*"
              element={
                <ProtectedRoute
                  element={<SetupFrontOffice />}
                  path="/setup-front-office"
                  scope="FRONT_OFFICE"
                />
              }
            />

            {/*  Student Information  */}
            <Route
              path="/student-details"
              element={
                <ProtectedRoute
                  element={<StudentDetails />}
                  path="/student-details"
                  scope="STUDENT"
                />
              }
            />
            <Route
              path="/student-admission"
              element={
                <ProtectedRoute
                  element={<StudentAdmission />}
                  path="/student-admission"
                  scope="STUDENT"
                />
              }
            />
            <Route
              path="/student-admission/:id"
              element={
                <ProtectedRoute
                  element={<StudentAdmission />}
                  path="/student-admission"
                  scope="STUDENT"
                />
              }
            />
            <Route
              path="/disabled-student"
              element={
                <ProtectedRoute
                  element={<DisabledStudent />}
                  path="/disabled-student"
                  scope="STUDENT"
                />
              }
            />
            <Route
              path="/student-categories"
              element={
                <ProtectedRoute
                  element={<StudentCategories />}
                  path="/student-categories"
                  scope="STUDENT"
                />
              }
            />
            <Route
              path="/student-house"
              element={
                <ProtectedRoute element={<StudentHouses />} path="/student-house" scope="STUDENT" />
              }
            />
            <Route
              path="/disable-reason"
              element={
                <ProtectedRoute
                  element={<Disablereason />}
                  path="/disable-reason"
                  scope="STUDENT"
                />
              }
            />

            {/*  Fees Collection  */}
            <Route
              path="/search-fees-payment"
              element={
                <ProtectedRoute
                  element={<SearchFeesPayment />}
                  path="/search-fees-payment"
                  scope="FEES"
                />
              }
            />
            <Route
              path="/search-due-fees"
              element={
                <ProtectedRoute element={<SearchDueFees />} path="/search-due-fees" scope="FEES" />
              }
            />
            <Route
              path="/fees-type"
              element={<ProtectedRoute element={<FeesType />} path="/fees-type" scope="FEES" />}
            />
            <Route
              path="/balance-sheet"
              element={
                <ProtectedRoute element={<BalanceSheet />} path="/balance-sheet" scope="FEES" />
              }
            />

            <Route
              path="/add-fine"
              element={<ProtectedRoute element={<AddFine />} path="/add-fine" scope="FEES" />}
            />
            <Route
              path="/class-fees"
              element={<ProtectedRoute element={<ClassFees />} path="/class-fees" scope="FEES" />}
            />
            <Route
              path="/fee-receipt"
              element={<ProtectedRoute element={<FeeReceipt />} path="/fee-receipt" scope="FEES" />}
            />
            <Route
              path="/add-student-fees"
              element={
                <ProtectedRoute
                  element={<AddStudentFees />}
                  path="/add-student-fees"
                  scope="FEES"
                />
              }
            />
            <Route
              path="/fees-awaiting-payments"
              element={
                <ProtectedRoute
                  element={<FeesAwaitingPayments />}
                  path="/fees-awaiting-payments"
                  scope="FEES"
                />
              }
            />
            <Route
              path="/payment-history"
              element={
                <ProtectedRoute element={<PaymentHistory />} path="/payment-history" scope="FEES" />
              }
            />
            <Route
              path="/delete-fee-transaction"
              element={
                <ProtectedRoute element={<DeleteFeeTransactionById />} path="" scope="FEES" />
              }
            />

            {/*  Income  */}
            <Route
              path="/add-income"
              element={
                <ProtectedRoute element={<AddIncomes />} path="/add-income" scope="INCOME" />
              }
            />
            <Route
              path="/search-income"
              element={
                <ProtectedRoute element={<SearchIncome />} path="/search-income" scope="INCOME" />
              }
            />
            <Route
              path="/income-head"
              element={
                <ProtectedRoute element={<IncomeHead />} path="/income-head" scope="INCOME" />
              }
            />
            <Route
              path="/income-group"
              element={
                <ProtectedRoute element={<IncomeGroup />} path="/income-group" scope="INCOME" />
              }
            />

            {/*  Expenses  */}
            <Route
              path="/add-expense"
              element={
                <ProtectedRoute element={<AddExpense />} path="/add-expense" scope="EXPENSES" />
              }
            />
            <Route
              path="/search-expense"
              element={
                <ProtectedRoute
                  element={<SearchExpenses />}
                  path="/search-expense"
                  scope="EXPENSES"
                />
              }
            />
            <Route
              path="/expense-head"
              element={
                <ProtectedRoute element={<ExpenseHead />} path="/expense-head" scope="EXPENSES" />
              }
            />
            <Route
              path="/expense-group"
              element={
                <ProtectedRoute element={<ExpenseGroup />} path="/expense-group" scope="EXPENSES" />
              }
            />

            {/*  Examination  */}
            <Route
              path="/exam-type"
              element={
                <ProtectedRoute element={<ExamTypePage />} path="/exam-type" scope="EXAMINATION" />
              }
            />
            <Route
              path="/exam-group"
              element={
                <ProtectedRoute element={<ExamGroup />} path="/exam-group" scope="EXAMINATION" />
              }
            />
            <Route
              path="/exam-schedule"
              element={
                <ProtectedRoute
                  element={<ExamSchedule />}
                  path="/exam-schedule"
                  scope="EXAMINATION"
                />
              }
            />
            <Route
              path="/exam-result"
              element={
                <ProtectedRoute element={<ExamResult />} path="/exam-result" scope="EXAM_RESULT" />
              }
            />
            <Route
              path="/design-admit-card"
              element={
                <ProtectedRoute
                  element={<DesignAdmitCard />}
                  path="/design-admit-card"
                  scope="ADMIT_CARD"
                />
              }
            />
            <Route
              path="/print-admit-card"
              element={
                <ProtectedRoute
                  element={<PrintAdmitCard />}
                  path="/print-admit-card"
                  scope="ADMIT_CARD"
                />
              }
            />
            <Route
              path="/design-marksheet"
              element={
                <ProtectedRoute
                  element={<DesignMarksheet />}
                  path="/design-marksheet"
                  scope="EXAM_MARKSHEET"
                />
              }
            />
            <Route
              path="/print-marksheet"
              element={
                <ProtectedRoute
                  element={<Printmarksheet />}
                  path="/print-marksheet"
                  scope="EXAM_MARKSHEET"
                />
              }
            />
            <Route
              path="/marks-grade"
              element={
                <ProtectedRoute element={<MarksGrade />} path="/marks-grade" scope="EXAMINATION" />
              }
            />
            <Route
              path="/marks-division"
              element={
                <ProtectedRoute
                  element={<MarkDivision />}
                  path="/marks-division"
                  scope="EXAMINATION"
                />
              }
            />
            <Route
              path="/print-exam-result"
              element={
                <ProtectedRoute
                  element={<PrintExamResult />}
                  path="/print-exam-result"
                  scope="EXAM_RESULT"
                />
              }
            />

            {/*  Attendance  */}
            <Route
              path="/student-attendance"
              element={
                <ProtectedRoute
                  element={<StudentAttendance />}
                  path="/student-attendance"
                  scope="ATTENDANCE"
                />
              }
            />
            <Route
              path="/attendance-by-date"
              element={
                <ProtectedRoute
                  element={<AttendanceByDate />}
                  path="/attendance-by-date"
                  scope="ATTENDANCE"
                />
              }
            />
            <Route
              path="/monthly-attendance-report"
              element={
                <ProtectedRoute
                  element={<MonthlyAttendanceReport />}
                  path="/monthly-attendance-report"
                  scope="ATTENDANCE"
                />
              }
            />

            {/*  Academics  */}
            <Route
              path="/class-timetable"
              element={
                <ProtectedRoute
                  element={<ClassTimeTable />}
                  path="/class-timetable"
                  scope="TIMETABLE"
                />
              }
            />
            <Route
              path="/teachers-timetable"
              element={
                <ProtectedRoute
                  element={<TeacherTimeTable />}
                  path="/teachers-timetable"
                  scope="TIMETABLE"
                />
              }
            />
            <Route
              path="/assign-class-teacher"
              element={
                <ProtectedRoute
                  element={<AssignClassTeachers />}
                  path="/assign-class-teacher"
                  scope="ACADEMICS"
                />
              }
            />
            <Route
              path="/marks-management"
              element={
                <ProtectedRoute
                  element={<MarksManagement />}
                  path="/marks-management"
                  scope="ACADEMICS"
                />
              }
            />
            <Route
              path="/promote-student"
              element={
                <ProtectedRoute
                  element={<Promotestudent />}
                  path="/promote-student"
                  scope="PROMOTE_STUDENT"
                />
              }
            />
            <Route
              path="/subject-group"
              element={
                <ProtectedRoute
                  element={<SubjectGroup />}
                  path="/subject-group"
                  scope="ACADEMICS"
                />
              }
            />
            <Route
              path="/subjects"
              element={<ProtectedRoute element={<Subject />} path="/subjects" scope="ACADEMICS" />}
            />
            <Route
              path="/class"
              element={<ProtectedRoute element={<Class />} path="/class" scope="SCHOOL_CLASS" />}
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute element={<Departments />} path="/departments" scope="ACADEMICS" />
              }
            />

            <Route
              path="/sections"
              element={
                <ProtectedRoute element={<Section />} path="/sections" scope="SCHOOL_CLASS" />
              }
            />

            {/*  Lesson Plan  */}
            <Route
              path="/lesson"
              element={
                <ProtectedRoute element={<LessonPage />} path="/lesson" scope="LESSON_PLAN" />
              }
            />
            <Route
              path="/topic"
              element={<ProtectedRoute element={<TopicPage />} path="/topic" scope="LESSON_PLAN" />}
            />

            {/*  Human Resource  */}
            <Route
              path="/staff-directory"
              element={
                <ProtectedRoute element={<StaffDirectory />} path="/staff-directory" scope="HR" />
              }
            />
            <Route
              path="/approve-leave-report"
              element={
                <ProtectedRoute
                  element={<ApproveLeave />}
                  path="/approve-leave-report"
                  scope="HR"
                />
              }
            />
            <Route
              path="/apply-leave"
              element={
                <ProtectedRoute element={<ApplyLeave />} path="/apply-leave" scope="APPLY_LEAVE" />
              }
            />
            <Route
              path="/department"
              element={<ProtectedRoute element={<Department />} path="/department" scope="HR" />}
            />
            <Route
              path="/designation"
              element={<ProtectedRoute element={<Designation />} path="/designation" scope="HR" />}
            />
            <Route
              path="/edit"
              element={<ProtectedRoute element={<Edit />} path="/edit" scope="HR" />}
            />
            <Route
              path="/edit/:id"
              element={<ProtectedRoute element={<Edit />} path="/edit/:id" scope="HR" />}
            />
            <Route
              path="/staff/view/:staffCode"
              element={
                <ProtectedRoute
                  element={<StaffView />}
                  path="/staff/view/:staffCode"
                  scope="PROFILE"
                />
              }
            />

            {/*  Communication  */}
            <Route
              path="/send-email"
              element={
                <ProtectedRoute
                  element={<SendEmail />}
                  path="/send-email"
                  featureCode="COMMUNICATION"
                  scope="COMMUNICATION"
                />
              }
            />

            {/*  Download Centre  */}
            <Route
              path="/content-type"
              element={
                <ProtectedRoute
                  element={<ContentType />}
                  path="/content-type"
                  scope="DOWNLOAD_CENTRE"
                />
              }
            />
            <Route
              path="/upload-/-share-content"
              element={
                <ProtectedRoute
                  element={<UploadShareContent />}
                  path="/upload-/-share-content"
                  scope="DOWNLOAD_CENTRE"
                />
              }
            />
            <Route
              path="/video-tutorial"
              element={
                <ProtectedRoute
                  element={<VideoTutorialList />}
                  path="/video-tutorial"
                  scope="DOWNLOAD_CENTRE"
                />
              }
            />

            {/*  Homework  */}
            <Route
              path="/add-homework"
              element={
                <ProtectedRoute element={<AddHomeWork />} path="/add-homework" scope="HOMEWORK" />
              }
            />
            <Route
              path="/daily-assignment"
              element={
                <ProtectedRoute
                  element={<DailyAssignment />}
                  path="/daily-assignment"
                  scope="HOMEWORK"
                />
              }
            />

            {/*  Library  */}
            <Route
              path="/book-list"
              element={<ProtectedRoute element={<BookList />} path="/book-list" scope="LIBRARY" />}
            />
            <Route
              path="/issue---return"
              element={
                <ProtectedRoute element={<IssueReturn />} path="/issue---return" scope="LIBRARY" />
              }
            />
            <Route
              path="/add-student"
              element={
                <ProtectedRoute element={<AddStudent />} path="/add-student" scope="LIBRARY" />
              }
            />
            <Route
              path="/add-staff-member"
              element={
                <ProtectedRoute
                  element={<AddStaffMember />}
                  path="/add-staff-member"
                  scope="LIBRARY"
                />
              }
            />

            {/*  Inventory  */}
            <Route
              path="/issue-item"
              element={
                <ProtectedRoute element={<IssueItem />} path="/issue-item" scope="INVENTORY" />
              }
            />
            <Route
              path="/add-item-stock"
              element={
                <ProtectedRoute
                  element={<AddItemStock />}
                  path="/add-item-stock"
                  scope="INVENTORY"
                />
              }
            />
            <Route
              path="/add-item"
              element={<ProtectedRoute element={<AddItem />} path="/add-item" scope="INVENTORY" />}
            />
            <Route
              path="/item-category"
              element={
                <ProtectedRoute
                  element={<ItemCategory />}
                  path="/item-category"
                  scope="INVENTORY"
                />
              }
            />
            <Route
              path="/item-supplier"
              element={
                <ProtectedRoute
                  element={<ItemSupplier />}
                  path="/item-supplier"
                  scope="INVENTORY"
                />
              }
            />
            <Route
              path="/item-store"
              element={
                <ProtectedRoute element={<ItemStore />} path="/item-store" scope="INVENTORY" />
              }
            />
            <Route
              path="/item-store-list"
              element={
                <ProtectedRoute
                  element={<ItemStoreList />}
                  path="/item-store-list"
                  scope="INVENTORY"
                />
              }
            />

            {/*  Transport  */}
            <Route
              path="/pickup-points"
              element={
                <ProtectedRoute element={<PickupPoint />} path="/pickup-points" scope="TRANSPORT" />
              }
            />
            <Route
              path="/routes"
              element={<ProtectedRoute element={<RoutesPage />} path="/routes" scope="TRANSPORT" />}
            />
            <Route
              path="/vehicles"
              element={<ProtectedRoute element={<Vehicle />} path="/vehicles" scope="TRANSPORT" />}
            />
            <Route
              path="/assign-vehicle"
              element={
                <ProtectedRoute
                  element={<AssignVehicle />}
                  path="/assign-vehicle"
                  scope="TRANSPORT"
                />
              }
            />
            <Route
              path="/route-pickup-point"
              element={
                <ProtectedRoute
                  element={<RoutePickup />}
                  path="/route-pickup-point"
                  scope="TRANSPORT"
                />
              }
            />
            <Route
              path="/student-transport-details"
              element={
                <ProtectedRoute
                  element={<StudentTransportDetailsPage />}
                  path="/student-transport-details"
                  scope="TRANSPORT"
                />
              }
            />
            <Route
              path="/student-transport-fees"
              element={
                <ProtectedRoute
                  element={<AddStudentTransportFees />}
                  path="/student-transport-fees"
                  scope="TRANSPORT"
                />
              }
            />

            {/*  Hostel  */}
            <Route
              path="/hostel-rooms"
              element={
                <ProtectedRoute element={<HostelRoom />} path="/hostel-rooms" scope="HOSTEL" />
              }
            />
            <Route
              path="/room-type"
              element={
                <ProtectedRoute element={<RoomTypeManager />} path="/room-type" scope="HOSTEL" />
              }
            />
            <Route
              path="/room-type-hostel"
              element={
                <ProtectedRoute element={<RoomType />} path="/room-type-hostel" scope="HOSTEL" />
              }
            />
            <Route
              path="/hostel"
              element={<ProtectedRoute element={<Hostel />} path="/hostel" scope="HOSTEL" />}
            />
            <Route
              path="/hostel-student-allocation"
              element={
                <ProtectedRoute
                  element={<HostelStudentAllocation />}
                  path="/hostel-student-allocation"
                  scope="HOSTEL"
                />
              }
            />
            <Route
              path="/add-hostel-fees"
              element={
                <ProtectedRoute
                  element={<AddHostelFees />}
                  path="/add-hostel-fees"
                  scope="HOSTEL"
                />
              }
            />

            {/*  Certificate  */}
            <Route
              path="/generate-certificate"
              element={
                <ProtectedRoute
                  element={<GenerateCertificate />}
                  path="/generate-certificate"
                  scope="CERTIFICATE"
                />
              }
            />
            <Route
              path="/student-id-card"
              element={
                <ProtectedRoute
                  element={<StudentIDCard />}
                  path="/student-id-card"
                  scope="CERTIFICATE"
                />
              }
            />
            <Route
              path="/generate-id-card"
              element={
                <ProtectedRoute
                  element={<GenerateIdCard />}
                  path="/generate-id-card"
                  scope="CERTIFICATE"
                />
              }
            />
            <Route
              path="/generate-id-card-page"
              element={
                <ProtectedRoute
                  element={<GenerateIdCardPage />}
                  path="/generate-id-card-page"
                  scope="CERTIFICATE"
                />
              }
            />
            <Route
              path="/staff-id-card"
              element={
                <ProtectedRoute
                  element={<StaffIDCard />}
                  path="/staff-id-card"
                  scope="CERTIFICATE"
                />
              }
            />
            <Route
              path="/staff-id-cards"
              element={
                <ProtectedRoute
                  element={<StaffIDCards />}
                  path="/staff-id-cards"
                  scope="CERTIFICATE"
                />
              }
            />
            <Route
              path="/generate-staff-id-card"
              element={
                <ProtectedRoute
                  element={<GenerateStaffIDCard />}
                  path="/generate-staff-id-card"
                  scope="CERTIFICATE"
                />
              }
            />
            <Route
              path="/student-certificate"
              element={
                <ProtectedRoute
                  element={<StudentCertificate />}
                  path="/student-certificate"
                  scope="CERTIFICATE"
                />
              }
            />

            {/*  Alumni  */}
            <Route
              path="/manage-alumni"
              element={
                <ProtectedRoute
                  element={<ManageAlu />}
                  path="/manage-alumni"
                  featureCode="ALUMNI"
                  scope="ALUMNI"
                />
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute
                  element={<Events />}
                  path="/events"
                  featureCode="ALUMNI"
                  scope="ALUMNI"
                />
              }
            />

            {/*  Roles  */}
            <Route
              path="/create-role"
              element={<ProtectedRoute element={<CreateRole />} path="/create-role" scope="ROLE" />}
            />
            <Route
              path="/assign-role"
              element={<ProtectedRoute element={<AssignRole />} path="/assign-role" scope="ROLE" />}
            />

            {/*  Settings  */}
            <Route
              path="/general-settings"
              element={
                <ProtectedRoute
                  element={<CreateSchool />}
                  path="/general-settings"
                  scope="SYSTEM_SETTINGS"
                />
              }
            />
            <Route
              path="/group-user"
              element={
                <ProtectedRoute
                  element={<GroupUser />}
                  path="/group-user"
                  scope="SYSTEM_SETTINGS"
                />
              }
            />
            <Route
              path="/school-group-roles"
              element={
                <ProtectedRoute
                  element={<SchoolGroupRole />}
                  path="/school-group-roles"
                  scope="SYSTEM_SETTINGS"
                />
              }
            />
            <Route
              path="/session-settings"
              element={
                <ProtectedRoute
                  element={<SessionSetting />}
                  path="/session-settings"
                  scope="SESSION_SETTING"
                />
              }
            />
            <Route
              path="/users"
              element={<ProtectedRoute element={<Users />} path="/users" scope="SYSTEM_SETTINGS" />}
            />
            <Route
              path="/user-activity"
              element={
                <ProtectedRoute
                  element={<UserActivity />}
                  path="/user-activity"
                  scope="SYSTEM_SETTINGS"
                />
              }
            />

            {/*  Unauthorized  */}
            <Route
              path="/unauthorized"
              element={
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-xl text-gray-600">
                      You don't have permission to access this page.
                    </p>
                  </div>
                </div>
              }
            />

            {/*  Fallback  */}
            <Route path="*" element={<ProtectedRoute element={<PageNotFound />} path="*" />} />
          </Routes>
        </div>
      </div>

      {!isLoginPage && <Footer />}
    </div>
  )
}

//  App Content
const SchoolAppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia('(min-width: 768px)').matches,
  )
  return <MainLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
}

export default SchoolAppContent

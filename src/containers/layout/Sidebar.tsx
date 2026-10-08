import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconField } from '../../components'
import { getSidebarText, getPagesNameText } from '../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'
import { hasScopePermission } from '../../utils/permissions'
// import IncomeGroup from "../../page/home/income/IncomeGroup";

type SubMenuItem = string | { name: string; path: string; scope?: string; roles?: string }

interface MenuItem {
  title: string
  path?: string
  icon?: string
  items?: SubMenuItem[]
  scope?: string
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const role = localStorage.getItem('role')

  if (role === 'PARENT') {
    return null
  }

  const location = useLocation()
  const hasPermissionForScope = (scope?: string): boolean => {
    return hasScopePermission(scope, 'READ')
  }

  const { t } = useTranslation()
  const sidebarText = getSidebarText(t)
  const DashboardText = sidebarText.Dashboard
  const FrontOfficeText = sidebarText.Front_Office
  const StudentInformationText = sidebarText.Student_Information
  const FeesCollectionText = sidebarText.Fees_Collection
  const IncomeText = sidebarText.Income
  // const InComeGroupText = sidebarText.Income_Group;
  const ExpensesText = sidebarText.Expenses
  const ExaminationText = sidebarText.Examination
  const AttendanceText = sidebarText.Attendance
  const AcademicsText = sidebarText.Academics
  const LessonPlanText = sidebarText.Lesson_Plan
  const HumanResourceText = sidebarText.Human_Resource
  const DownloadCenterText = sidebarText.Download_Center
  const HomeworkText = sidebarText.Homework
  const LibraryText = sidebarText.Library
  const InventoryText = sidebarText.Inventory
  const TransportText = sidebarText.Transport
  const HostelText = sidebarText.Hostel
  const CertificateText = sidebarText.Certificate
  const AlumniText = sidebarText.Alumni
  const RoleText = sidebarText.Role
  const SystemSettingsText = sidebarText.System_Settings

  const AdmissionEnquiryText = getPagesNameText(t).Admission_Enquiry
  const VisitorBookText = getPagesNameText(t).Visitor_Book
  const PhoneCallLogText = getPagesNameText(t).Phone_Call_Log
  const PostalDispatchText = getPagesNameText(t).Postal_Dispatch
  const PostalReceiveText = getPagesNameText(t).Postal_Receive
  const ComplainText = getPagesNameText(t).Complain
  const SetupFrontOfficeText = getPagesNameText(t).Setup_Front_Office
  const StudentDetailsText = getPagesNameText(t).Student_Details
  const StudentAdmissionText = getPagesNameText(t).Student_Admission
  const DisabledStudentText = getPagesNameText(t).Disabled_Student
  const StudentCategoriesText = getPagesNameText(t).Student_Categories
  const StudentHouseText = getPagesNameText(t).Student_House
  const DisableReasonText = getPagesNameText(t).Disable_Reason
  const SearchFeesPaymentText = getPagesNameText(t).Search_Fees_Payment
  const ClassFeesText = getPagesNameText(t).Class_Fees
  const DueFeesText = getPagesNameText(t).Due_Fees
  const AddFineText = getPagesNameText(t).Add_Fine
  const FeeReceiptText = getPagesNameText(t).Fee_Receipt
  const FeesTypeText = getPagesNameText(t).Fees_Type
  const AddStudentFeesText = getPagesNameText(t).Add_Student_Fees
  const BalanceSheetText = getPagesNameText(t).Balance_Sheet
  const AddIncomeText = getPagesNameText(t).Add_Income
  const SearchIncomeText = getPagesNameText(t).Search_Income
  const IncomeHeadText = getPagesNameText(t).Income_Head
  const IncomeGroupText = getPagesNameText(t).Income_Group
  const AddExpenseText = getPagesNameText(t).Add_Expense
  const SearchExpenseText = getPagesNameText(t).Search_Expense
  const ExpenseHeadText = getPagesNameText(t).Expense_Head
  const ExpenseGroupText = getPagesNameText(t).Expense_Group
  const ExamGroupText = getPagesNameText(t).Exam_Group
  const ExamScheduleText = getPagesNameText(t).Exam_Schedule
  const DesignAdmitCardText = getPagesNameText(t).Design_Admit_Card
  const DesignMarksheetText = getPagesNameText(t).Design_Marksheet
  const PrintMarksheetText = getPagesNameText(t).Print_Marksheet
  const StudentAttendanceText = getPagesNameText(t).Student_Attendance
  const AttendanceByDateText = getPagesNameText(t).Attendance_By_Date
  const MonthlyAttendanceReportText = getPagesNameText(t).Monthly_Attendance_Report
  const ClassTimetableText = getPagesNameText(t).Class_Timetable
  const TeachersTimetableText = getPagesNameText(t).Teachers_Timetable
  const AssignClassTeacherText = getPagesNameText(t).Assign_Class_Teacher
  const PromoteStudentText = getPagesNameText(t).Promote_Student
  const ClassMarksManagementText = getPagesNameText(t).Marks_Management
  const SubjectGroupText = getPagesNameText(t).Subject_Group
  const SubjectsText = getPagesNameText(t).Subjects
  const DepartmentsText = getPagesNameText(t).Departments
  const ClassText = getPagesNameText(t).Class
  const SectionsText = getPagesNameText(t).Section
  const LessonText = getPagesNameText(t).Lesson
  const TopicText = getPagesNameText(t).Topic
  const StaffDirectoryText = getPagesNameText(t).Staff_Directory
  const ApproveLeaveReportText = getPagesNameText(t).Approve_Leave_Report
  const ApplyLeaveText = getPagesNameText(t).Apply_Leave
  const DepartmentText = getPagesNameText(t).Department
  const DesignationText = getPagesNameText(t).Designation
  const ContentTypeText = getPagesNameText(t).Content_Type
  const UploadShareContentText = getPagesNameText(t).Upload_Share_Content
  const VideoTutorialText = getPagesNameText(t).Video_Tutorial
  const AddHomeworkText = getPagesNameText(t).Add_Homework
  const DailyAssignmentText = getPagesNameText(t).Daily_Assignment
  const BookListText = getPagesNameText(t).Book_List
  const IssueReturnText = getPagesNameText(t).Issue_Return
  const AddStudentText = getPagesNameText(t).Add_Student
  const AddStaffMemberText = getPagesNameText(t).Add_Staff_Member
  const IssueItemText = getPagesNameText(t).Issue_Item
  const AddItemStockText = getPagesNameText(t).Add_Item_Stock
  const AddItemText = getPagesNameText(t).Add_Item
  const ItemCategoryText = getPagesNameText(t).Item_Category
  const ItemSupplierText = getPagesNameText(t).Item_Supplier
  const ItemStoreText = getPagesNameText(t).Item_Store
  const PickupPointsText = getPagesNameText(t).Pickup_Points
  const RoutesText = getPagesNameText(t).Routes
  const VehiclesText = getPagesNameText(t).Vehicles
  const AssignVehicleText = getPagesNameText(t).Assign_Vehicle
  const RoutePickupPointText = getPagesNameText(t).Route_Pickup_Point
  const StudentTrasportDetailsText = getPagesNameText(t).Student_Transport_Details
  const StudentTransportFeesText = getPagesNameText(t).Student_Transport_Fees
  const HostelRoomsText = getPagesNameText(t).Hostel_Rooms
  const HostelStudentAllocationText = getPagesNameText(t).Hostel_Student_Allocation
  const RoomTypeText = getPagesNameText(t).Room_Type
  const AddHostelFeesText = getPagesNameText(t).Add_Hostel_Fees
  const GenerateCertificateText = getPagesNameText(t).Generate_Certificate
  const StudentIDCardText = getPagesNameText(t).Student_ID_Card
  const StaffIDCardText = getPagesNameText(t).Staff_ID_Card
  const ManageAlumniText = getPagesNameText(t).Manage_Alumni
  const EventsText = getPagesNameText(t).Events
  const Session_SettingsText = getPagesNameText(t).Session_Settings
  const UsersText = getPagesNameText(t).Users
  const School_DashboardText = getPagesNameText(t).School_Dashboard
  const Techer_DashboardText = getPagesNameText(t).Teacher_Dashboard
  const Parent_DashboardText = getPagesNameText(t).Parent_Dashboard
  const Library_DashboardText = 'Library Dashboard'
  const Hostel_DashboardText = 'Hostel Dashboard'
  const Transport_DashboardText = 'Transport Dashboard'
  const Accountant_DashboardText = 'Accountant Dashboard'
  const Receptionist_DashboardText = 'Receptionist Dashboard'
  const CreateRoleText = getPagesNameText(t).Create_Role
  const AssignRoleText = getPagesNameText(t).Assign_Role
  const UserActivityText = getPagesNameText(t).User_Activity
  const GroupUserText = getPagesNameText(t).Group_User
  const SchoolGroupRolesText = getPagesNameText(t).School_Group_Roles

  // const SchoolGroupRolesText = "School Group Roles";

  const menuItems: MenuItem[] = [
    {
      title: DashboardText,
      items: [
        {
          name: School_DashboardText,
          path: '/school-dashboard',
          roles: 'SCHOOL_GROUP',
        },
        //  {
        //         name: School_DashboardText,
        //         path: "/school-dashboard",
        //         roles: "SCHOOL_ADMIN",
        //       },

        {
          name: School_DashboardText,
          path: '/school-dashboard',
          roles: 'SCHOOL',
        },
        {
          name: School_DashboardText,
          path: '/group-user-profile',
          roles: 'GROUP_ADMIN',
        },
        {
          name: Techer_DashboardText,
          path: '/teacher-dashboard',
          roles: 'TEACHER',
        },
        {
          name: Parent_DashboardText,
          path: '/parent-dashboard',
          roles: 'PARENT',
        },
        {
          name: Library_DashboardText,
          path: '/library-dashboard',
          roles: 'LIBRARIAN',
        },
        {
          name: Hostel_DashboardText,
          path: '/hostel-dashboard',
          roles: 'HOSTEL',
        },
        {
          name: Transport_DashboardText,
          path: '/transport-dashboard',
          roles: 'TRANSPORT',
        },
        {
          name: Accountant_DashboardText,
          path: '/accountant-dashboard',
          roles: 'ACCOUNTANT',
        },
        {
          name: Receptionist_DashboardText,
          path: '/receptionist-dashboard',
          roles: 'RECEPTIONIST',
        },
      ],
    },
    {
      title: FrontOfficeText,
      icon: 'FaBuilding',
      items: [
        { name: AdmissionEnquiryText, path: '/admission-enquiry' },
        { name: VisitorBookText, path: '/visitor-book' },
        { name: PhoneCallLogText, path: '/phone-call-log' },
        { name: PostalDispatchText, path: '/postal-dispatch' },
        { name: PostalReceiveText, path: '/postal-receive' },
        { name: ComplainText, path: '/complain' },
        { name: SetupFrontOfficeText, path: '/setup-front-office' },
      ],
      scope: 'FRONT_OFFICE',
    },
    {
      title: StudentInformationText,
      icon: 'FaUserGraduate',
      items: [
        { name: StudentDetailsText, path: '/student-details' },
        { name: StudentAdmissionText, path: '/student-admission' },
        { name: DisabledStudentText, path: '/disabled-student' },
        { name: StudentCategoriesText, path: '/student-categories' },
        { name: StudentHouseText, path: '/student-house' },
        { name: DisableReasonText, path: '/disable-reason' },
      ],
      scope: 'STUDENT',
    },
    {
      title: FeesCollectionText,
      icon: 'FaMoneyBillWave',
      items: [
        { name: ClassFeesText, path: '/class-fees' },
        { name: SearchFeesPaymentText, path: '/search-fees-payment' },
        { name: DueFeesText, path: '/search-due-fees' },
        { name: FeesTypeText, path: '/fees-type' },
        { name: AddFineText, path: '/add-fine' },
        { name: FeeReceiptText, path: '/fee-receipt' },
        { name: AddStudentFeesText, path: '/add-student-fees' },
        { name: BalanceSheetText, path: '/balance-sheet' },
      ],
      scope: 'FEES',
    },
    {
      title: IncomeText,
      icon: 'FaChartLine',
      items: [
        { name: AddIncomeText, path: '/add-income' },
        { name: SearchIncomeText, path: '/search-income' },
        { name: IncomeHeadText, path: '/income-head' },
        { name: IncomeGroupText, path: '/income-group' },
      ],
      scope: 'INCOME',
    },
    {
      title: ExpensesText,
      icon: 'FaReceipt',
      items: [
        { name: AddExpenseText, path: '/add-expense', scope: 'EXPENSES' },
        { name: SearchExpenseText, path: '/search-expense', scope: 'EXPENSES' },
        { name: ExpenseHeadText, path: '/expense-head', scope: 'EXPENSES' },
        { name: ExpenseGroupText, path: '/expense-group', scope: 'EXPENSES' },
      ],
      scope: 'EXPENSES',
    },
    {
      title: ExaminationText,
      icon: 'FaClipboardList',
      items: [
        { name: ExamGroupText, path: '/exam-group', scope: 'EXAMINATION' },
        {
          name: ExamScheduleText,
          path: '/exam-schedule',
          scope: 'EXAMINATION',
        },
        {
          name: DesignAdmitCardText,
          path: '/design-admit-card',
          scope: 'ADMIT_CARD',
        },
        {
          name: DesignMarksheetText,
          path: '/design-marksheet',
          scope: 'EXAM_MARKSHEET',
        },
        {
          name: PrintMarksheetText,
          path: '/print-marksheet',
          scope: 'EXAM_MARKSHEET',
        },
      ],
    },
    {
      title: AttendanceText,
      icon: 'FaCalendarCheck',
      items: [
        { name: StudentAttendanceText, path: '/student-attendance' },
        { name: AttendanceByDateText, path: '/attendance-by-date' },
        { name: MonthlyAttendanceReportText, path: '/monthly-attendance-report' },
      ],
      scope: 'ATTENDANCE',
    },
    {
      title: AcademicsText,
      icon: 'FaBookOpen',
      items: [
        {
          name: ClassTimetableText,
          path: '/class-timetable',
          scope: 'TIMETABLE',
        },
        {
          name: TeachersTimetableText,
          path: '/teachers-timetable',
          scope: 'TIMETABLE',
        },
        {
          name: AssignClassTeacherText,
          path: '/assign-class-teacher',
          scope: 'ACADEMICS',
        },
        {
          name: ClassMarksManagementText,
          path: '/marks-management',
          scope: 'ACADEMICS',
        },
        {
          name: PromoteStudentText,
          path: '/promote-student',
          scope: 'PROMOTE_STUDENT',
        },
        { name: SubjectGroupText, path: '/subject-group', scope: 'ACADEMICS' },
        { name: SubjectsText, path: '/subjects', scope: 'ACADEMICS' },
        { name: DepartmentsText, path: '/departments', scope: 'ACADEMICS' },
        { name: ClassText, path: '/class', scope: 'SCHOOL_CLASS' },
        { name: SectionsText, path: '/sections', scope: 'SCHOOL_CLASS' },
      ],
    },
    {
      title: LessonPlanText,
      icon: 'FaClipboard',
      items: [
        { name: LessonText, path: '/lesson' },
        { name: TopicText, path: '/topic' },
      ],
      scope: 'LESSON_PLAN',
    },
    {
      title: HumanResourceText,
      icon: 'FaUsers',
      items: [
        { name: StaffDirectoryText, path: '/staff-directory', scope: 'HR' },
        {
          name: ApproveLeaveReportText,
          path: '/approve-leave-report',
          scope: 'HR',
        },
        { name: ApplyLeaveText, path: '/apply-leave', scope: 'APPLY_LEAVE' },
        { name: DepartmentText, path: '/department', scope: 'HR' },
        { name: DesignationText, path: '/designation', scope: 'HR' },
      ],
    },
    //  { title: CommunicationText, icon: "FaBroadcastTower", items: [{ name: SendEmailText, path: "/send-email" }], featureCode: "COMMUNICATION", scope: "COMMUNICATION" },

    {
      title: DownloadCenterText,
      icon: 'FaDownload',
      items: [
        { name: ContentTypeText, path: '/content-type' },
        { name: UploadShareContentText, path: '/upload-/-share-content' },
        { name: VideoTutorialText, path: '/video-tutorial' },
      ],
      scope: 'DOWNLOAD_CENTRE',
    },
    {
      title: HomeworkText,
      icon: 'FaFlask',
      items: [
        { name: AddHomeworkText, path: '/add-homework' },
        { name: DailyAssignmentText, path: '/daily-assignment' },
      ],
      scope: 'HOMEWORK',
    },
    {
      title: LibraryText,
      icon: 'FaBookOpen',
      items: [
        { name: BookListText, path: '/book-list' },
        { name: IssueReturnText, path: '/issue---return' },
        { name: AddStudentText, path: '/add-student' },
        { name: AddStaffMemberText, path: '/add-staff-member' },
      ],
      scope: 'LIBRARY',
    },
    {
      title: InventoryText,
      icon: 'FaBoxOpen',
      items: [
        { name: IssueItemText, path: '/issue-item' },
        { name: AddItemStockText, path: '/add-item-stock' },
        { name: AddItemText, path: '/add-item' },
        { name: ItemCategoryText, path: '/item-category' },
        { name: ItemSupplierText, path: '/item-supplier' },
        { name: ItemStoreText, path: '/item-store' },
      ],
      scope: 'INVENTORY',
    },
    {
      title: TransportText,
      icon: 'FaCarSide',
      items: [
        { name: PickupPointsText, path: '/pickup-points' },
        { name: RoutesText, path: '/routes' },
        { name: VehiclesText, path: '/vehicles' },
        { name: AssignVehicleText, path: '/assign-vehicle' },
        { name: RoutePickupPointText, path: '/route-pickup-point' },
        { name: StudentTrasportDetailsText, path: '/student-transport-details' },
        { name: StudentTransportFeesText, path: '/student-transport-fees' },
      ],
      scope: 'TRANSPORT',
    },
    {
      title: HostelText,
      icon: 'FaKey',
      items: [
        { name: HostelRoomsText, path: '/hostel-rooms' },
        { name: RoomTypeText, path: '/room-type' },
        { name: HostelText, path: '/hostel' },
        { name: HostelStudentAllocationText, path: '/hostel-student-allocation' },
        { name: AddHostelFeesText, path: '/add-hostel-fees' },
        // { name: HostelDueFeesText, path: "/hostel-due-fees" },
      ],
      scope: 'HOSTEL',
    },
    {
      title: CertificateText,
      icon: 'FaCertificate',
      items: [
        { name: GenerateCertificateText, path: '/generate-certificate' },
        { name: StudentIDCardText, path: '/student-id-card' },
        { name: StaffIDCardText, path: '/staff-id-card' },
      ],
      scope: 'CERTIFICATE',
    },
    {
      title: AlumniText,
      icon: 'FaUserGraduate',
      items: [
        { name: ManageAlumniText, path: '/manage-alumni' },
        { name: EventsText, path: '/events' },
      ],
      // featureCode: "ALUMNI",
      scope: 'ALUMNI',
    },
    {
      title: RoleText,
      icon: 'FaUserShield',
      items: [
        { name: CreateRoleText, path: '/create-role' },
        { name: AssignRoleText, path: '/assign-role' },
      ],
      // featureCode: "OFFICE",
      scope: 'ROLE',
    },
    {
      title: SystemSettingsText,
      icon: 'FaTools',
      items: [
        {
          name: Session_SettingsText,
          path: '/session-settings',
          scope: 'SESSION_SETTING',
        },
        { name: GroupUserText, path: '/group-user', scope: 'SYSTEM_SETTINGS' },
        { name: SchoolGroupRolesText, path: '/school-group-roles', scope: 'SYSTEM_SETTINGS' },
        { name: UsersText, path: '/users', scope: 'SYSTEM_SETTINGS' },
        { name: UserActivityText, path: '/user-activity', scope: 'SYSTEM_SETTINGS' },
      ],
    },
  ]
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [activeItem, setActiveItem] = useState<string>('')
  const navigate = useNavigate()

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const newState: Record<string, boolean> = {}
      newState[section] = !prev[section]
      return newState
    })
  }

  const handleNavigation = (item: SubMenuItem) => {
    if (typeof item === 'object' && item.path) {
      setActiveItem(item.name)
      navigate(item.path)
    } else if (typeof item === 'string') {
      setActiveItem(item)
      const routePath = item.toLowerCase().replace(/\s+/g, '-')
      navigate(`/${routePath}`)
    }
    onClose()
  }

  useEffect(() => {
    const activeMenu = menuItems.find((menu) => menu.path === location.pathname)
    if (activeMenu) {
      setActiveItem(activeMenu.title)
    } else {
      menuItems.forEach((menu) => {
        if (menu.items) {
          menu.items.forEach((item) => {
            if (typeof item === 'object' && item.path === location.pathname) {
              setActiveItem(item.name)
              setOpenSections((prev) => ({ ...prev, [menu.title]: true }))
            } else if (typeof item === 'string') {
              const routePath = item.toLowerCase().replace(/\s+/g, '-')
              if (`/${routePath}` === location.pathname) {
                setActiveItem(item)
                setOpenSections((prev) => ({ ...prev, [menu.title]: true }))
              }
            }
          })
        }
      })
    }
  }, [location.pathname])

  // Filter menu items by user scope permissions.
  const filteredMenuItems = menuItems
    .filter((menu) => {
      return hasPermissionForScope(menu.scope)
    })
    .map((menu) => {
      // Special handling for Dashboard - filter items by role
      if (menu.title === DashboardText) {
        return {
          ...menu,
          items: menu.items?.filter((item) => {
            // if (role === "SCHOOL" || role === "SCHOOL_GROUP") return true;
            if (typeof item === 'object' && item.roles) {
              return item.roles == role
            }
            return true
          }),
        }
      }

      return {
        ...menu,
        items: menu.items?.filter((item) => {
          if (typeof item === 'object' && item.scope) {
            return hasPermissionForScope(item.scope)
          }
          return true
        }),
      }
    })
    .filter((menu) => menu.items && menu.items.length > 0)

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="campusflow-sidebar-backdrop md:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={`campusflow-sidebar ${isOpen ? 'campusflow-sidebar--open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="campusflow-sidebar__header">
          <div className="campusflow-sidebar__identity">
            <span className="campusflow-sidebar__identity-mark">
              <IconField name="FaSchool" size={17} />
            </span>
            <div>
              <p className="campusflow-sidebar__overline">School workspace</p>
              <h2>{sidebarText.quickLinks}</h2>
            </div>
          </div>
          <button
            type="button"
            className="campusflow-sidebar__close md:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <IconField name="FaTimes" size={20} />
          </button>
        </div>

        <nav className="campusflow-sidebar__nav">
          <p className="campusflow-sidebar__section-label">Modules</p>
          {filteredMenuItems.map((menu) => {
            const hasActiveItem = menu.items?.some(
              (item) => typeof item === 'object' && item.path === location.pathname,
            )
            const isExpanded = Boolean(openSections[menu.title])

            return (
              <div className="campusflow-sidebar__group" key={menu.title}>
                {menu.path ? (
                  <button
                    onClick={() => {
                      if (menu.title === DashboardText) {
                        window.location.href = menu.path!
                      } else {
                        navigate(menu.path!)
                      }
                      onClose()
                    }}
                    aria-current={location.pathname === menu.path ? 'page' : undefined}
                    className={`campusflow-sidebar__item ${location.pathname === menu.path ? 'campusflow-sidebar__item--active' : ''}`}
                  >
                    {menu.icon && <IconField name={menu.icon} size={17} />}
                    <span>{menu.title}</span>
                  </button>
                ) : (
                  <div className="campusflow-sidebar__section">
                    <button
                      onClick={() => toggleSection(menu.title)}
                      className={`campusflow-sidebar__item ${hasActiveItem ? 'campusflow-sidebar__item--section-active' : ''}`}
                      aria-expanded={isExpanded}
                    >
                      <span className="campusflow-sidebar__item-label">
                        {menu.icon && <IconField name={menu.icon} size={17} />}
                        <span>{menu.title}</span>
                      </span>
                      <span
                        className={`campusflow-sidebar__chevron ${isExpanded ? 'campusflow-sidebar__chevron--open' : ''}`}
                      >
                        <IconField name="FaAngleDown" size={13} />
                      </span>
                    </button>

                    {isExpanded && (
                      <ul className="campusflow-sidebar__submenu">
                        {menu.items?.map((item) => (
                          <li key={typeof item === 'object' ? item.path : item}>
                            <button
                              type="button"
                              className={`campusflow-sidebar__subitem ${
                                typeof item === 'object' && activeItem === item.name
                                  ? 'campusflow-sidebar__subitem--active'
                                  : ''
                              }`}
                              aria-current={
                                typeof item === 'object' && item.path === location.pathname
                                  ? 'page'
                                  : undefined
                              }
                              onClick={() => handleNavigation(item)}
                            >
                              <span className="campusflow-sidebar__subitem-dot" />
                              <span>{typeof item === 'object' ? item.name : item}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="campusflow-sidebar__footer">
          <span className="campusflow-sidebar__status-dot" />
          <span>School management</span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

import type { TFunction } from 'i18next'
// import { School } from 'lucide-react'
// import Templates from '../features/whatsapp/pages/Templates'

type header = {
  school_college_name: string
  search_placeholder: string
  Hello_User: string
  CampusFlow: string
  My_Profile: string
  Logout: string
}

type Footer = {
  Footer_name: string
}

type Dashboard = {
  PARENT: any
  dashboardTitle: string
  Fees_Awaiting_Payments: string
  Converted_Leads: string
  Staff_Present_Today: string
  Student_Present_Today: string
  feesCollectionAndExpenses: string
  feesCollected: string
  expenses: string
  data: number[]
  fees_and_expenses: string
  months: string[]
  Donation: string
  Old_Student_Donation: string
  income: string
  categories: string[]
  monthly_expenses: string
  unpai: string
  partial: string
  paid: string
  active: string
  won: string
  passive: string
  lost: string
  dueForReturn: string
  returned: string
  issuedOut: string
  present: string
  late: string
  absent: string
  monthlyFeesCollection: string
  monthlyFeesExpenses: string
  student: string
  electricityBill: string
  petrolChargesForVehicle: string
  adminAndStaffCount: string
  ADMIN: string
  TEACHER: string
  ACCOUNTANT: string
  LIBRARIAN: string
  RECEPTIONIST: string
  SUPER_ADMIN: string
  School_Calendar_Year: string
  Time: string
  scheduleTimes: string[]
  // days: string[];
  Timeline: string
  Amount: string
  Error_Loading_Data: string
  Authentication_Required: string
  Failed_To_Load_Data: string
  Current_Month: string
  Retry: string

  Fees_Collection_Expenses_For: string
  Income_Expenses: string
  Days_Of: string
  Months_Of_Year: string

  Jan: string
  Feb: string
  Mar: string
  Apr: string
  May: string
  Jun: string
  Jul: string
  Aug: string
  Sep: string
  Oct: string
  Nov: string
  Dec: string

  Total_Income: string
  Total_Expenses: string
  No_Income_Data: string
  No_Expense_Data: string
  School_Code_Not_Found: string
  Token_Not_Found: string
  Authentication_Failed: string
  No_Permission: string
  Network_Error: string
  Failed_To_Load_Finance_Data: string
  Unknown_Income_Head: string
  Unknown_Expense_Head: string

}
export interface TeacherDashboard {
  Welcome: string
  Take_Attendance: string
  Students_Distribution: string
  My_Assigned_Class: string
  Where_You_Are_The_Class_Teacher: string
  Class: string
  Section: string
  Not_Assigned_As_Class_Teacher: string
  Contact_Admin_For_Class: string
  Assign_Yourself_As_Class_Teacher: string
  My_Weekly_Timetable: string
  Your_Teacher_Weekly_Timetable: string
  Teaching_Schedule: string
  Periods: string
  Active_Days: string
  No_Timetable_Assigned: string
  No_Timetable_Assigned_Yet: string
  Contact_Admin_For_Timetable: string
  Contact_Admin_To_Get_Weekly_Schedule: string
  Free: string
  Monday: string
  Tuesday: string
  Wednesday: string
  Thursday: string
  Friday: string
  Saturday: string
  No_Data_Received: string
  Failed_To_Load_Dashboard: string
  Female_Students: string
  Male_Students: string
  Total_Students: string
  Total_Exams: string
  Graduate_Students: string
  Total_Income: string
  Notifications: string

}

type sidebar = {
  quickLinks: string
  Dashboard: string
  WhatsApp: string
  Front_Office: string
  Student_Information: string
  Fees_Collection: string
  Income: string
  Expenses: string
  Examination: string
  Attendance: string
  Online_Examination: string
  Academics: string
  Lesson_Plan: string
  Human_Resource: string
  Communication: string
  Download_Center: string
  Homework: string
  Library: string
  Inventory: string
  Transport: string
  Hostel: string
  Certificate: string
  Front_CMS: string
  Alumni: string
  Role: string
  System_Settings: string
}

type Pages_name = {
  // School_Dashboard: any;
  Teacher_Dashboard: string
  Parent_Dashboard: string
  School_Dashboard: string
  WhatsApp: string
  Admission_Enquiry: string
  Visitor_Book: string
  Phone_Call_Log: string
  Postal_Dispatch: string
  Postal_Receive: string
  Complain: string
  Exam_Type: string
  Setup_Front_Office: string
  Student_Details: string
  Student_Admission: string
  Online_Admission: string
  Disabled_Student: string
  Multi_Class_Student: string
  Bulk_Delete: string
  Student_Categories: string
  Student_House: string
  Disable_Reason: string
  Collect_Fees: string
  Offline_Bank_Payments: string
  Search_Fees_Payment: string
  Class_Fees: string
  Student_Fees: string
  Due_Fees: string
  Fees_Master: string
  Fees_Group: string
  Fees_Discount: string
  Fees_Type: string
  Add_Fine: string
  Add_Student_Fees: string
  Fee_Receipt: string
  Balance_Sheet: string
  Fees_Carry_Forward: string
  Fees_Reminder: string
  Add_Income: string
  Search_Income: string
  Income_Head: string
  Income_Group: string
  Add_Expense: string
  Search_Expense: string
  Expense_Head: string
  Expense_Group: string
  Exam_Group: string
  Exam_Schedule: string
  Exam_Result: string
  Design_Admit_Card: string
  Print_Admit_Card: string
  Design_Marksheet: string
  Print_Marksheet: string
  Print_Exam_Result: string
  Marks_Grade: string
  Marks_Division: string
  Student_Attendance: string
  Approve_Leave: string
  Attendance_By_Date: string
  Monthly_Attendance_Report: string
  Online_Exam: string
  Question_Bank: string
  Class_Timetable: string
  Teachers_Timetable: string
  Assign_Class_Teacher: string
  Promote_Student: string
  Marks_Management: string
  Subject_Group: string
  Subjects: string
  Class: string
  Section: string
  Departments: string
  COPY_OLD_LESSONS: string
  Manage_Lesson_Plan: string
  Manage_Syllabus_Status: string
  Lesson: string
  Topic: string
  Staff_Directory: string
  Staff_Attendance: string
  Payroll: string
  Approve_Leave_Report: string
  Apply_Leave: string
  Leave_Type: string
  Teachers_Ratings: string
  Department: string
  Designation: string
  Disabled_Staff: string
  Notice_Board: string
  Send_Email: string
  Send_SMS: string
  Email_SMS_Log: string
  Schedule_Email_SMS_Log: string
  Login_Credentials_Send: string
  Email_Template: string
  SMS_Template: string
  Content_Type: string
  Content_Share_List: string
  Upload_Share_Content: string
  Video_Tutorial: string
  Add_Homework: string
  Daily_Assignment: string
  Book_List: string
  Issue_Return: string
  Add_Student: string
  Add_Staff_Member: string
  Issue_Item: string
  Add_Item_Stock: string
  Add_Item: string
  Item_Category: string
  Item_Supplier: string
  Item_Store: string
  Fee_Master: string
  Pickup_Points: string
  Routes: string
  Vehicles: string
  Assign_Vehicle: string
  Route_Pickup_Point: string
  Student_Transport_Fees: string
  Student_Transport_Details: string

  Hostel_Rooms: string
  Room_Type: string
  Hostel: string
  Add_Hostel_Fees: string
  Hostel_Student_Allocation: string

  Student_Certificate: string
  Generate_Certificate: string
  Student_ID_Card: string
  Generate_ID_Card: string
  Staff_ID_Card: string
  Generate_Staff_ID_Card: string
  Gallery: string
  News: string
  Media_Manager: string
  Pages: string
  Menus: string
  Banner_Image: string
  Manage_Alumni: string
  Events: string
  Student_Information: string
  Finance: string
  Attendance: string
  Examination: string
  Online_Examination: string
  Lesson_Plan: string
  Human_Resource: string
  Homework: string
  Library: string
  Inventory: string
  Transport: string
  Hostel_Report: string
  Alumni: string
  Create_Role: string
  Assign_Role: string
  User_Log: string
  Audit_Trail_Report: string
  General_Settings: string
  Session_Settings: string
  Notification_Settings: string
  SMS_Settings: string
  Payment_Methods: string
  Email_Settings: string
  Print_Header_Footer: string
  Front_CMS_Settings: string
  Role_Permission: string
  Backup_Restore: string
  Languages: string
  Currency: string
  Users: string
  Addons: string
  Modules: string
  Custom_Fields: string
  Captcha_Settings: string
  System_Fields: string
  Student_Profile_Update: string
  Admission: string
  File_Types: string
  Sidebar_Menu: string
  System_Update: string
  Group_User: string
  School_Group_Roles: string
  User_Activity: string
}

// Header Translations
export const getHeaderText = (t: TFunction): header => ({
  school_college_name: t('header.school_college_name'),
  search_placeholder: t('header.search_placeholder'),
  Hello_User: t('header.Hello_User'),
  CampusFlow: t('header.CampusFlow'),
  My_Profile: t('header.My_Profile'),
  Logout: t('header.Logout'),
})

// Footer Translationse
export const getFooterText = (t: TFunction): Footer => ({
  Footer_name: t('Footer.Footer_name'),
})

// Dashboard Translations
export const getDashboardText = (t: TFunction): Dashboard => ({
  dashboardTitle: t('dashboard.dashboardTitle'),
  Fees_Awaiting_Payments: t('dashboard.summary.feesAwaitingPayments.Fees_Awaiting_Payments'),
  Converted_Leads: t('dashboard.summary.convertedLeads.Converted_Leads'),
  Staff_Present_Today: t('dashboard.summary.staffPresentToday.Staff_Present_Today'),
  Student_Present_Today: t('dashboard.summary.studentPresentToday.Student_Present_Today'),
  feesCollectionAndExpenses: t('dashboard.charts.feesCollectionAndExpenses.title'),
  feesCollected: t('dashboard.charts.feesCollectionAndExpenses.legend.feesCollected'),
  expenses: t('dashboard.charts.feesCollectionAndExpenses.legend.expenses'),
  data: t('dashboard.charts.feesCollectionAndExpenses.data.days', {
    returnObjects: true,
  }) as number[],
  fees_and_expenses: t('dashboard.fees_and_expenses.title'),
  months: t('dashboard.fees_and_expenses.months.mon', { returnObjects: true }) as string[],
  income: t('dashboard.charts.income.title'),
  Donation: t('dashboard.charts.income.legend.Donation'),
  Old_Student_Donation: t('dashboard.charts.income.legend.Old_Student_Donation'),
  categories: t('dashboard.charts.income.categories.name', { returnObjects: true }) as string[],
  monthly_expenses: t('dashboard.monthly_expenses.month'),
  unpai: t('dashboard.dashboardData.unpaid'),
  partial: t('dashboard.dashboardData.partial'),
  paid: t('dashboard.dashboardData.paid'),
  active: t('dashboard.dashboardData.active'),
  won: t('dashboard.dashboardData.won'),
  passive: t('dashboard.dashboardData.passive'),
  lost: t('dashboard.dashboardData.lost'),
  dueForReturn: t('dashboard.dashboardData.dueForReturn'),
  returned: t('dashboard.dashboardData.returned'),
  issuedOut: t('dashboard.dashboardData.issuedOut'),
  present: t('dashboard.dashboardData.present'),
  late: t('dashboard.dashboardData.late'),
  absent: t('dashboard.dashboardData.absent'),
  monthlyFeesCollection: t('dashboard.dashboardData.monthlyFeesCollection'),
  monthlyFeesExpenses: t('dashboard.dashboardData.monthlyFeesExpenses'),
  student: t('dashboard.dashboardData.student'),
  electricityBill: t('dashboard.dashboardData.electricityBill'),
  petrolChargesForVehicle: t('dashboard.dashboardData.petrolChargesForVehicle'),
  School_Calendar_Year: t('dashboard.schoolCalendar.School_Calendar_Year'),
  Time: t('dashboard.schoolCalendar.Time'),
  scheduleTimes: t('dashboard.schoolCalendar.scheduleTimes', { returnObjects: true }) as string[],
  // days: t('dashboard.schoolCalendar.days', { returnObjects: true }) as string[],
  adminAndStaffCount: t('dashboard.last.adminAndStaffCount'),
  ADMIN: t('dashboard.last.ADMIN'),
  TEACHER: t('dashboard.last.TEACHER'),
  ACCOUNTANT: t('dashboard.last.ACCOUNTANT'),
  LIBRARIAN: t('dashboard.last.LIBRARIAN'),
  PARENT: t('dashboard.last.PARENT'),
  RECEPTIONIST: t('dashboard.last.RECEPTIONIST'),
  SUPER_ADMIN: t('dashboard.last.SUPER ADMIN'),

  // Chart Common
  Timeline: t('dashboard.charts.common.Timeline'),
  Amount: t('dashboard.charts.common.Amount'),
  Error_Loading_Data: t('dashboard.charts.common.Error_Loading_Data'),
  Authentication_Required: t('dashboard.charts.common.Authentication_Required'),
  Failed_To_Load_Data: t('dashboard.charts.common.Failed_To_Load_Data'),
  Current_Month: t('dashboard.charts.common.Current_Month'),
  Retry: t('dashboard.charts.common.Retry'),

  // Fees Collection & Expenses Chart
  Fees_Collection_Expenses_For: t(
    'dashboard.charts.feesCollectionAndExpenses.Fees_Collection_Expenses_For',
  ),
  Income_Expenses: t(
    'dashboard.charts.feesCollectionAndExpenses.Income_Expenses',
  ),
  Days_Of: t(
    'dashboard.charts.feesCollectionAndExpenses.Days_Of',
  ),
  Months_Of_Year: t(
    'dashboard.charts.feesCollectionAndExpenses.Months_Of_Year',
  ),

  // Month Names
  Jan: t('dashboard.charts.months.Jan'),
  Feb: t('dashboard.charts.months.Feb'),
  Mar: t('dashboard.charts.months.Mar'),
  Apr: t('dashboard.charts.months.Apr'),
  May: t('dashboard.charts.months.May'),
  Jun: t('dashboard.charts.months.Jun'),
  Jul: t('dashboard.charts.months.Jul'),
  Aug: t('dashboard.charts.months.Aug'),
  Sep: t('dashboard.charts.months.Sep'),
  Oct: t('dashboard.charts.months.Oct'),
  Nov: t('dashboard.charts.months.Nov'),
  Dec: t('dashboard.charts.months.Dec'),

  // Pie Charts
  Total_Income: t('dashboard.pieCharts.Total_Income'),
  Total_Expenses: t('dashboard.pieCharts.Total_Expenses'),
  No_Income_Data: t('dashboard.pieCharts.No_Income_Data'),
  No_Expense_Data: t('dashboard.pieCharts.No_Expense_Data'),
  School_Code_Not_Found: t('dashboard.pieCharts.School_Code_Not_Found'),
  Token_Not_Found: t('dashboard.pieCharts.Token_Not_Found'),
  Authentication_Failed: t('dashboard.pieCharts.Authentication_Failed'),
  No_Permission: t('dashboard.pieCharts.No_Permission'),
  Network_Error: t('dashboard.pieCharts.Network_Error'),
  Failed_To_Load_Finance_Data: t('dashboard.pieCharts.Failed_To_Load_Finance_Data'),
  Unknown_Income_Head: t('dashboard.pieCharts.Unknown_Income_Head'),
  Unknown_Expense_Head: t('dashboard.pieCharts.Unknown_Expense_Head'),
})
export const getTeacherDashboardText = (
  t: TFunction,
): TeacherDashboard => ({
  Welcome: t('Teacher_Dashboard.Welcome'),
  Take_Attendance: t('Teacher_Dashboard.Take_Attendance'),
  Students_Distribution: t('Teacher_Dashboard.Students_Distribution'),

  My_Assigned_Class: t('Teacher_Dashboard.My_Assigned_Class'),
  Where_You_Are_The_Class_Teacher: t(
    'Teacher_Dashboard.Where_You_Are_The_Class_Teacher',
  ),

  Class: t('Teacher_Dashboard.Class'),
  Section: t('Teacher_Dashboard.Section'),

  Not_Assigned_As_Class_Teacher: t(
    'Teacher_Dashboard.Not_Assigned_As_Class_Teacher',
  ),

  Contact_Admin_For_Class: t(
    'Teacher_Dashboard.Contact_Admin_For_Class',
  ),

  Assign_Yourself_As_Class_Teacher: t(
    'Teacher_Dashboard.Assign_Yourself_As_Class_Teacher',
  ),

  My_Weekly_Timetable: t(
    'Teacher_Dashboard.My_Weekly_Timetable',
  ),

  Your_Teacher_Weekly_Timetable: t(
    'Teacher_Dashboard.Your_Teacher_Weekly_Timetable',
  ),

  Teaching_Schedule: t(
    'Teacher_Dashboard.Teaching_Schedule',
  ),

  Periods: t('Teacher_Dashboard.Periods'),
  Active_Days: t('Teacher_Dashboard.Active_Days'),

  No_Timetable_Assigned: t(
    'Teacher_Dashboard.No_Timetable_Assigned',
  ),

  No_Timetable_Assigned_Yet: t(
    'Teacher_Dashboard.No_Timetable_Assigned_Yet',
  ),

  Contact_Admin_For_Timetable: t(
    'Teacher_Dashboard.Contact_Admin_For_Timetable',
  ),

  Contact_Admin_To_Get_Weekly_Schedule: t(
    'Teacher_Dashboard.Contact_Admin_To_Get_Weekly_Schedule',
  ),

  Free: t('Teacher_Dashboard.Free'),

  Monday: t('Teacher_Dashboard.Monday'),
  Tuesday: t('Teacher_Dashboard.Tuesday'),
  Wednesday: t('Teacher_Dashboard.Wednesday'),
  Thursday: t('Teacher_Dashboard.Thursday'),
  Friday: t('Teacher_Dashboard.Friday'),
  Saturday: t('Teacher_Dashboard.Saturday'),

  No_Data_Received: t(
    'Teacher_Dashboard.No_Data_Received',
  ),

  Failed_To_Load_Dashboard: t(
    'Teacher_Dashboard.Failed_To_Load_Dashboard',
  ),

  Female_Students: t('Teacher_Dashboard.Female_Students'),
  Male_Students: t('Teacher_Dashboard.Male_Students'),
  Total_Students: t('Teacher_Dashboard.Total_Students'),
  Total_Exams: t('Teacher_Dashboard.Total_Exams'),
  Graduate_Students: t('Teacher_Dashboard.Graduate_Students'),
  Total_Income: t('Teacher_Dashboard.Total_Income'),
  Notifications: t('Teacher_Dashboard.Notifications'),
})

//Parent Dashboard
export const getParentDashboardText = (t: TFunction) => ({
  Welcome: t('ParentDashboard.welcome'),
  Dashboard_Overview: t('ParentDashboard.Dashboard_Overview'),
  Academic_Results: t('ParentDashboard.Academic_Results'),
  Tasks: t('ParentDashboard.Tasks'),
  Uploaded_Content: t('ParentDashboard.Uploaded_Content'),
  Class_Timetable: t('ParentDashboard.Class_Timetable'),
  Events: t('ParentDashboard.Events'),

  //Kid
  My_Kids: t('ParentDashboard.My_Kids'),
  No_Children_found: t('ParentDashboard.No_Children_found'),
  No_students_are_associated_with_your_account: t('ParentDashboard.No_students_are_associated_with_your_account'),
  Retry: t('ParentDashboard.Retry'),

  //Result
  No_Results_Available: t('ParentDashboard.No_Results_Available'),
  Results_havent_been_published_yet_for_your_children: t('ParentDashboard.Results_havent_been_published_yet_for_your_children'),
  Overall: t('ParentDashboard.Overall'),

  //Task
  Page: t('ParentDashboard.Page'),
  Previous: t('ParentDashboard.Previous'),
  Refresh: t('ParentDashboard.Refresh'),
  No_Tasks_Available: t('ParentDashboard.No_Tasks_Available'),
  Tasks_haven_been_assigned_yet_for_your_children: t('ParentDashboard.Tasks_haven_been_assigned_yet_for_your_children'),
  No_Tasks_Availablet: t('ParentDashboard.No_Tasks_Availablet'),

  //TimeTable
  No_timetable_found: t('ParentDashboard.No_timetable_found'),
  No_timetable_available: t('ParentDashboard.No_timetable_available'),

  //Upload Content
  No_video_tutorials_available: t('ParentDashboard.No_video_tutorials_available'),
  Open_Link: t('ParentDashboard.Open_Link'),
  Reference_Link: t('ParentDashboard.Reference_Link'),
  Download_File: t('ParentDashboard.Download_File'),
  File_Attachment: t('ParentDashboard.File_Attachment'),
  No_documents_or_links_available: t('ParentDashboard.No_documents_or_links_available'),
  Video_Tutorials: t('ParentDashboard.Video_Tutorials'),
  Documents_And_Links: t('ParentDashboard.Documents_And_Links'),
  No_content_has_been_uploaded_yet_for_your_children: t('ParentDashboard.No_content_has_been_uploaded_yet_for_your_children'),
  No_Uploaded_Content_Available: t('ParentDashboard.No_Uploaded_Content_Available'),

  //Event
  Past: t('ParentDashboard.Past'),
  UpComing: t('ParentDashboard.UpComing'),
  All_Students: t('ParentDashboard.All_Students'),
  No_events_have_been_scheduled_yet: t('ParentDashboard.No_events_have_been_scheduled_yet'),
  No_Events_Available: t('ParentDashboard.No_Events_Available'),

  //Card
  Total_Expenses: t('ParentDashboard.Total_Expenses'),
  Total_Results: t('ParentDashboard.Total_Results'),
  Due_Fees: t('ParentDashboard.Due_Fees'),

  })

  export const accountTranslation=(t: TFunction) =>({
    Accountant_Dashboard:t('Accountant.Accountant_Dashboard'),
    Welcome_back_Heres_your_financial_overview:t('Accountant.Welcome_back_Heres_your_financial_overview'),
    Collection:t('Accountant.Collection'),
    Total_Collection:t('Accountant.Total_Collection'),
    Recent_Transaction:t('Accountant.Recent_Transaction'),
    No_recent_transactions:t('Accountant.No_recent_transactions'),
    Due_Fees:t('Accountant.Due_Fees'),
    View_All:t('Accountant.View_All'),

    Total_Deductions:t('Accountant.Total_Deductions'),
    Fee_Deductions:t('Accountant.Fee_Deductions'),
    Fee_Collection_by_Type:t('Accountant.Fee_Collection_by_Type'),
    No_fee_deductions_fines_discounts_found_for_current_month:t('Accountant.No_fee_deductions_fines_discounts_found_for_current_month'),
    No_fee_collection_data_found_for_current_month:t('Accountant.No_fee_collection_data_found_for_current_month'),
    Fee_Collection:t('Accountant.Fee_Collection'),
    Error_Loading_Fee_Data:t('Accountant.Error_Loading_Fee_Data'),
    Retry:t('Accountant.Retry')

  })
// Sidebar Translations
export const getSidebarText = (t: TFunction): sidebar => ({
  quickLinks: t('sidebar.quickLinks'),
  Dashboard: t('sidebar.Dashboard'),
  WhatsApp: t('sidebar.WhatsApp'),
  Front_Office: t('sidebar.Front_Office'),
  Student_Information: t('sidebar.Student_Information'),
  Fees_Collection: t('sidebar.Fees_Collection'),
  Income: t('sidebar.Income'),
  Expenses: t('sidebar.Expenses'),
  Examination: t('sidebar.Examination'),
  Attendance: t('sidebar.Attendance'),
  Online_Examination: t('sidebar.Online_Examination'),
  Academics: t('sidebar.Academics'),
  Lesson_Plan: t('sidebar.Lesson_Plan'),
  Human_Resource: t('sidebar.Human_Resource'),
  Communication: t('sidebar.Communication'),
  Download_Center: t('sidebar.Download_Center'),
  Homework: t('sidebar.Homework'),
  Library: t('sidebar.Library'),
  Inventory: t('sidebar.Inventory'),
  Transport: t('sidebar.Transport'),
  Hostel: t('sidebar.Hostel'),
  Certificate: t('sidebar.Certificate'),
  Front_CMS: t('sidebar.Front_CMS'),
  Alumni: t('sidebar.Alumni'),
  Role: t('sidebar.Role'),
  System_Settings: t('sidebar.System_Settings'),
})

// Pages_name Translations
export const getPagesNameText = (t: TFunction): Pages_name => ({
  // Dashboard
  School_Dashboard: t('Pages_name.Dashboard.School_Dashboard'),
  Teacher_Dashboard: t('Pages_name.Dashboard.Teacher_Dashboard'),
  Parent_Dashboard: t('Pages_name.Dashboard.Parent_Dashboard'),



  // WhatsApp
  WhatsApp: t('Pages_name.Whats.WhatsApp'),

  // Front Office
  Admission_Enquiry: t('Pages_name.Front Office.Admission_Enquiry'),
  Visitor_Book: t('Pages_name.Front Office.Visitor_Book'),
  Phone_Call_Log: t('Pages_name.Front Office.Phone_Call_Log'),
  Postal_Dispatch: t('Pages_name.Front Office.Postal_Dispatch'),
  Postal_Receive: t('Pages_name.Front Office.Postal_Receive'),
  Complain: t('Pages_name.Front Office.Complain'),
  Setup_Front_Office: t('Pages_name.Front Office.Setup_Front_Office'),

  // Student Information
  Student_Details: t('Pages_name.Student Information.Student_Details'),
  Student_Admission: t('Pages_name.Student Information.Student_Admission'),
  Online_Admission: t('Pages_name.Student Information.Online_Admission'),
  Disabled_Student: t('Pages_name.Student Information.Disabled_Student'),
  Multi_Class_Student: t('Pages_name.Student Information.Multi_Class_Student'),
  Bulk_Delete: t('Pages_name.Student Information.Bulk_Delete'),
  Student_Categories: t('Pages_name.Student Information.Student_Categories'),
  Student_House: t('Pages_name.Student Information.Student_House'),
  Disable_Reason: t('Pages_name.Student Information.Disable_Reason'),

  //Fees Collection
  Collect_Fees: t('Pages_name.Fees Collection.Collect_Fees'),
  Offline_Bank_Payments: t('Pages_name.Fees Collection.Offline_Bank_Payments'),
  Search_Fees_Payment: t('Pages_name.Fees Collection.Search_Fees_Payment'),
  Class_Fees: t('Pages_name.Fees Collection.Class_Fees'),
  Student_Fees: t('Pages_name.Fees Collection.Student_Fees'),
  Due_Fees: t('Pages_name.Fees Collection.Due_Fees'),
  Fee_Receipt: t('Pages_name.Fees Collection.Fee_Receipt'),
  Fees_Master: t('Pages_name.Fees Collection.Fees_Master'),
  Fees_Group: t('Pages_name.Fees Collection.Fees_Group'),
  Fees_Discount: t('Pages_name.Fees Collection.Fees_Discount'),
  Fees_Type: t('Pages_name.Fees Collection.Fees_Type'),
  Add_Fine: t('Pages_name.Fees Collection.Add_Fine'),
  Add_Student_Fees: t('Pages_name.Fees Collection.Add_Student_Fees'),
  Balance_Sheet: t('Pages_name.Fees Collection.Balance_Sheet'),
  Fees_Carry_Forward: t('Pages_name.Fees Collection.Fees_Carry_Forward'),
  Fees_Reminder: t('Pages_name.Fees Collection.Fees_Reminder'),

  //Income
  Add_Income: t('Pages_name.Income.Add_Income'),
  Search_Income: t('Pages_name.Income.Search_Income'),
  Income_Head: t('Pages_name.Income.Income_Head'),
  Income_Group: t('Pages_name.Income.Income_Group'),

  //Expenses
  Add_Expense: t('Pages_name.Expenses.Add_Expense'),
  Search_Expense: t('Pages_name.Expenses.Search_Expense'),
  Expense_Head: t('Pages_name.Expenses.Expense_Head'),
  Expense_Group: t('Pages_name.Expenses.Expense_Group'),

  //Examination
  Exam_Type: t('Pages_name.Examination.Exam_Type'),
  Exam_Group: t('Pages_name.Examination.Exam_Group'),
  Exam_Schedule: t('Pages_name.Examination.Exam_Schedule'),
  Exam_Result: t('Pages_name.Examination.Exam_Result'),
  Design_Admit_Card: t('Pages_name.Examination.Design_Admit_Card'),
  Print_Admit_Card: t('Pages_name.Examination.Print_Admit_Card'),
  Design_Marksheet: t('Pages_name.Examination.Design_Marksheet'),
  Print_Marksheet: t('Pages_name.Examination.Print_Marksheet'),
  Marks_Grade: t('Pages_name.Examination.Marks_Grade'),
  Marks_Division: t('Pages_name.Examination.Marks_Division'),
  Print_Exam_Result: t('Pages_name.Examination.Print_Exam_Result'),

  //Attendance
  Student_Attendance: t('Pages_name.Attendance.Student_Attendance'),
  Approve_Leave: t('Pages_name.Attendance.Approve_Leave'),
  Attendance_By_Date: t('Pages_name.Attendance.Attendance_By_Date'),
  Monthly_Attendance_Report: t('Pages_name.Attendance.Monthly_Attendance_Report'),

  //Online Examination
  Online_Exam: t('Pages_name.Online Examination.Online_Exam'),
  Question_Bank: t('Pages_name.Online Examination.Question_Bank'),

  //Academics
  Class_Timetable: t('Pages_name.Academics.Class_Timetable'),
  Teachers_Timetable: t('Pages_name.Academics.Teachers_Timetable'),
  Assign_Class_Teacher: t('Pages_name.Academics.Assign_Class_Teacher'),
  Promote_Student: t('Pages_name.Academics.Promote_Student'),
  Marks_Management: t('Pages_name.Academics.Marks_Management'),
  Subject_Group: t('Pages_name.Academics.Subject_Group'),
  Subjects: t('Pages_name.Academics.Subjects'),
  Departments: t('Pages_name.Academics.Departments'),
  Class: t('Pages_name.Academics.Class'),
  Section: t('Pages_name.Academics.Section'),

  //Lesson Plan
  COPY_OLD_LESSONS: t('Pages_name.Lesson Plan.COPY_OLD_LESSONS'),
  Manage_Lesson_Plan: t('Pages_name.Lesson Plan.Manage_Lesson_Plan'),
  Manage_Syllabus_Status: t('Pages_name.Lesson Plan.Manage_Syllabus_Status'),
  Lesson: t('Pages_name.Lesson Plan.Lesson'),
  Topic: t('Pages_name.Lesson Plan.Topic'),

  //human Resource
  Staff_Directory: t('Pages_name.Human Resource.Staff_Directory'),
  Staff_Attendance: t('Pages_name.Human Resource.Staff_Attendance'),
  Payroll: t('Pages_name.Human Resource.Payroll'),
  Approve_Leave_Report: t('Pages_name.Human Resource.Approve_Leave_Report'),
  Apply_Leave: t('Pages_name.Human Resource.Apply_Leave'),
  Leave_Type: t('Pages_name.Human Resource.Leave_Type'),
  Teachers_Ratings: t('Pages_name.Human Resource.Teachers_Ratings'),
  Department: t('Pages_name.Human Resource.Department'),
  Designation: t('Pages_name.Human Resource.Designation'),
  Disabled_Staff: t('Pages_name.Human Resource.Disabled_Staff'),

  //Communication
  Notice_Board: t('Pages_name.Communication.Notice_Board'),
  Send_Email: t('Pages_name.Communication.Send_Email'),
  Send_SMS: t('Pages_name.Communication.Send_SMS'),
  Email_SMS_Log: t('Pages_name.Communication.Email_SMS_Log'),
  Schedule_Email_SMS_Log: t('Pages_name.Communication.Schedule_Email_SMS_Log'),
  Login_Credentials_Send: t('Pages_name.Communication.Login_Credentials_Send'),
  Email_Template: t('Pages_name.Communication.Email_Template'),
  SMS_Template: t('Pages_name.Communication.SMS_Template'),

  //download Center
  Content_Type: t('Pages_name.Download Center.Content_Type'),
  Content_Share_List: t('Pages_name.Download Center.Content_Share_List'),
  Upload_Share_Content: t('Pages_name.Download Center.Upload_Share_Content'),
  Video_Tutorial: t('Pages_name.Download Center.Video_Tutorial'),

  //Homework
  Add_Homework: t('Pages_name.Homework.Add_Homework'),
  Daily_Assignment: t('Pages_name.Homework.Daily_Assignment'),

  //Library
  Book_List: t('Pages_name.Library.Book_List'),
  Issue_Return: t('Pages_name.Library.Issue_Return'),
  Add_Student: t('Pages_name.Library.Add_Student'),
  Add_Staff_Member: t('Pages_name.Library.Add_Staff_Member'),

  //Inventory
  Issue_Item: t('Pages_name.Inventory.Issue_Item'),
  Add_Item_Stock: t('Pages_name.Inventory.Add_Item_Stock'),
  Add_Item: t('Pages_name.Inventory.Add_Item'),
  Item_Category: t('Pages_name.Inventory.Item_Category'),
  Item_Supplier: t('Pages_name.Inventory.Item_Supplier'),
  Item_Store: t('Pages_name.Inventory.Item_Store'),

  //Transport
  Fee_Master: t('Pages_name.Transport.Fee_Master'),
  Pickup_Points: t('Pages_name.Transport.Pickup_Points'),
  Routes: t('Pages_name.Transport.Routes'),
  Vehicles: t('Pages_name.Transport.Vehicles'),
  Assign_Vehicle: t('Pages_name.Transport.Assign_Vehicle'),
  Route_Pickup_Point: t('Pages_name.Transport.Route_Pickup_Point'),
  Student_Transport_Fees: t('Pages_name.Transport.Student_Transport_Fees'),
  Student_Transport_Details: t('Pages_name.Transport.Student_Transport_Details'),

  //Hostel
  Hostel_Rooms: t('Pages_name.Hostel.Hostel_Rooms'),
  Room_Type: t('Pages_name.Hostel.Room_Type'),
  Hostel: t('Pages_name.Hostel.Hostel'),
  Add_Hostel_Fees: t('Pages_name.Hostel.Add_Hostel_Fees'),
  Hostel_Student_Allocation: t('Pages_name.Hostel.Hostel_Student_Allocation'),

  //Certificate
  Student_Certificate: t('Pages_name.Certificate.Student_Certificate'),
  Generate_Certificate: t('Pages_name.Certificate.Generate_Certificate'),
  Student_ID_Card: t('Pages_name.Certificate.Student_ID_Card'),
  Generate_ID_Card: t('Pages_name.Certificate.Generate_ID_Card'),
  Staff_ID_Card: t('Pages_name.Certificate.Staff_ID_Card'),
  Generate_Staff_ID_Card: t('Pages_name.Certificate.Generate_Staff_ID_Card'),

  //Front CMS
  Gallery: t('Pages_name.Front CMS.Gallery'),
  News: t('Pages_name.Front CMS.News'),
  Media_Manager: t('Pages_name.Front CMS.Media_Manager'),
  Pages: t('Pages_name.Front CMS.Pages'),
  Menus: t('Pages_name.Front CMS.Menus'),
  Banner_Image: t('Pages_name.Front CMS.Banner_Image'),

  //Alumni
  Manage_Alumni: t('Pages_name.Alumni.Manage_Alumni'),
  Events: t('Pages_name.Alumni.Events'),

  //Role
  Create_Role: t('Pages_name.Role.Create_Role'),
  Assign_Role: t('Pages_name.Role.Assign_Role'),

  //Reports
  Student_Information: t('Pages_name.Reports.Student_Information'),
  Finance: t('Pages_name.Reports.Finance'),
  Attendance: t('Pages_name.Reports.Attendance'),
  Examination: t('Pages_name.Reports.Examination'),
  Online_Examination: t('Pages_name.Reports.Online_Examination'),
  Lesson_Plan: t('Pages_name.Reports.Lesson_Plan'),
  Human_Resource: t('Pages_name.Reports.Human_Resource'),
  Homework: t('Pages_name.Reports.Homework'),
  Library: t('Pages_name.Reports.Library'),
  Inventory: t('Pages_name.Reports.Inventory'),
  Transport: t('Pages_name.Reports.Transport'),
  Hostel_Report: t('Pages_name.Reports.Hostel_Report'),
  Alumni: t('Pages_name.Reports.Alumni'),
  User_Log: t('Pages_name.Reports.User_Log'),
  Audit_Trail_Report: t('Pages_name.Reports.Audit_Trail_Report'),

  //System Settings
  General_Settings: t('Pages_name.System Settings.General_Settings'),
  Session_Settings: t('Pages_name.System Settings.Session_Settings'),
  Notification_Settings: t('Pages_name.System Settings.Notification_Settings'),
  SMS_Settings: t('Pages_name.System Settings.SMS_Settings'),
  Payment_Methods: t('Pages_name.System Settings.Payment_Methods'),
  Email_Settings: t('Pages_name.System Settings.Email_Settings'),
  Print_Header_Footer: t('Pages_name.System Settings.Print_Header_Footer'),
  Front_CMS_Settings: t('Pages_name.System Settings.Front_CMS_Settings'),
  Role_Permission: t('Pages_name.System Settings.Role_Permission'),
  Backup_Restore: t('Pages_name.System Settings.Backup_Restore'),
  Languages: t('Pages_name.System Settings.Languages'),
  Currency: t('Pages_name.System Settings.Currency'),
  Users: t('Pages_name.System Settings.Users'),
  Addons: t('Pages_name.System Settings.Addons'),
  Modules: t('Pages_name.System Settings.Modules'),
  Custom_Fields: t('Pages_name.System Settings.Custom_Fields'),
  Captcha_Settings: t('Pages_name.System Settings.Captcha_Settings'),
  System_Fields: t('Pages_name.System Settings.System_Fields'),
  Student_Profile_Update: t('Pages_name.System Settings.Student_Profile_Update'),
  Admission: t('Pages_name.System Settings.Admission'),
  File_Types: t('Pages_name.System Settings.File_Types'),
  Sidebar_Menu: t('Pages_name.System Settings.Sidebar_Menu'),
  System_Update: t('Pages_name.System Settings.System_Update'),
  Group_User: t('Pages_name.System Settings.Group_User'),
  School_Group_Roles: t('Pages_name.System Settings.School_Group_Roles'),
  User_Activity: t('Pages_name.System Settings.User_Activity'),
})

//pages data translations
export const getPagesDataText = (t: TFunction) => ({
  //Button
  Download_XL_Template: t('pages_data.Common_buttons.Download_XL_Template'),
  Import_Book_XL: t('pages_data.Common_buttons.Import_Book_XL'),


  //Transport Dashboard
  Transport_Management_Dashboard: t('pages_data.Transport_Dashboard.Transport_Management_Dashboard'),
  Active_Routes: t('pages_data.Transport_Dashboard.Active_Routes'),
  //Total_Students: t('pages_data.Transport_Dashboard.Total_Students'),
  Vehicles: t('pages_data.Transport_Dashboard.Vehicles'),
  Route_Pickup_Points_Overview: t('pages_data.Transport_Dashboard.Route_Pickup_Points_Overview'),
  Students_Using_Transport: t('pages_data.Transport_Dashboard.Students_Using_Transport'),
  Routes_With_Pickups: t('pages_data.Transport_Dashboard.Routes_With_Pickups'),
  Total_Pickup_Points: t('pages_data.Transport_Dashboard.Total_Pickup_Points'),
  //Available: t('pages_data.Transport_Dashboard.Available'),
  // Assigned: t('pages_data.Transport_Dashboard.Assigned'),
  Total_Vehicles: t('pages_data.Transport_Dashboard.Total_Vehicles'),
  Inactive_Routes: t('pages_data.Transport_Dashboard.Inactive_Routes'),
  Total_Routes: t('pages_data.Transport_Dashboard.Total_Routes'),
  Vehicle_Status: t('pages_data.Transport_Dashboard.Vehicle_Status'),
  Route_Distribution: t('pages_data.Transport_Dashboard.Route_Distribution'),
  Vehicle_Type_Distribution: t('pages_data.Transport_Dashboard.Vehicle_Type_Distribution'),
  Route_Revenue: t('pages_data.Transport_Dashboard.Route_Revenue'),
  Utilization: t('pages_data.Transport_Dashboard.Utilization'),
  Vehicles_Assigned: t('pages_data.Transport_Dashboard.Vehicles_Assigned'),
  Coverage: t('pages_data.Transport_Dashboard.Coverage'),
  Total_Revenue: t('pages_data.Transport_Dashboard.Total_Revenue'),

  // Hostel Dashboard
  Beds_Left: t('pages_data.Hostel_Dashboard.Beds_Left'),
  Current_Status: t('pages_data.Hostel_Dashboard.Current_Status'),
  Beds: t('pages_data.Hostel_Dashboard.Beds'),
  Rooms: t('pages_data.Hostel_Dashboard.Rooms'),
  No_Student_Data_Available: t('pages_data.Hostel_Dashboard.No_Student_Data_Available'),
  Students_In_Hostels_By_Gender: t('pages_data.Hostel_Dashboard.Students_In_Hostels_By_Gender'),
  Gender_Distribution: t('pages_data.Hostel_Dashboard.Gender_Distribution'),
  Get_Started_By_Adding_Your_First_Hostel: t('pages_data.Hostel_Dashboard.Get_Started_By_Adding_Your_First_Hostel'),
  No_Hostels_Found: t('pages_data.Hostel_Dashboard.No_Hostels_Found'),
  Room_Types: t('pages_data.Hostel_Dashboard.Room_Types'),
  Total_Beds: t('pages_data.Hostel_Dashboard.Total_Beds'),
  Total_Rooms: t('pages_data.Hostel_Dashboard.Total_Rooms'),
  Total_Hostel: t('pages_data.Hostel_Dashboard.Total_Hostel'),
  Hostel_Dashboard: t('pages_data.Hostel_Dashboard.Hostel_Dashboard'),
  Quick_Actions: t('pages_data.Hostel_Dashboard.Quick_Actions'),
  Hostels_Overview: t('pages_data.Hostel_Dashboard.Hostels_Overview'),
  Manage_Rooms: t('pages_data.Hostel_Dashboard.Manage_Rooms'),
  Hostel_Allocations: t('pages_data.Hostel_Dashboard.Hostel_Allocations'),
  Booked: t('pages_data.Hostel_Dashboard.Booked'),
  Total_Capacity: t('pages_data.Hostel_Dashboard.Total_Capacity'),
  Total_Booked: t('pages_data.Hostel_Dashboard.Total_Booked'),
  No_Occupancy_Data_Available: t('pages_data.Hostel_Dashboard.No_Occupancy_Data_Available'),
  Bed_Distribution_Across_All_Hostels: t('pages_data.Hostel_Dashboard.Bed_Distribution_Across_All_Hostels'),
  Hostel_Status: t('pages_data.Hostel_Dashboard.Hostel_Status'),
  Location_Not_Provided: t('pages_data.Hostel_Dashboard.Location_Not_Provided'),

//Library Dashboard
Issue_Book: t('pages_data.Library_Dashboard.Issue_Book'),
Add_Student_Member: t('pages_data.Library_Dashboard.Add_Student_Member'),
Add_Staff_Member: t('pages_data.Library_Dashboard.Add_Staff_Member'),
Total_Books: t('pages_data.Library_Dashboard.Total_Books'),
Active_Loans: t('pages_data.Library_Dashboard.Active_Loans'),
Total_Members: t('pages_data.Library_Dashboard.Total_Members'),
View_Details: t('pages_data.Library_Dashboard.View_Details'),
Due_Returns_Alert: t('pages_data.Library_Dashboard.Due_Returns_Alert'),
Overdue_Books: t('pages_data.Library_Dashboard.Overdue_Books'),
Overdue: t('pages_data.Library_Dashboard.Overdue'),
Was_Due: t('pages_data.Library_Dashboard.Was_Due'),
Recent_Issues: t('pages_data.Library_Dashboard.Recent_Issues'),
View_All: t('pages_data.Library_Dashboard.View_All'),
Recent_Returns: t('pages_data.Library_Dashboard.Recent_Returns'),
Recent_Members: t('pages_data.Library_Dashboard.Recent_Members'),
Library_Summary: t('pages_data.Library_Dashboard.Library_Summary'),
Student_Members: t('pages_data.Library_Dashboard.Student_Members'),
Staff_Members: t('pages_data.Library_Dashboard.Staff_Members'),
Books_Issued: t('pages_data.Library_Dashboard.Books_Issued'),
Books_Returned: t('pages_data.Library_Dashboard.Books_Returned'),
Add_New_Book: t('pages_data.Library_Dashboard.Add_New_Book'),
Library_Dashboard: t('pages_data.Library_Dashboard.Library_Dashboard'),
Welcome_To_Your_Library_Management_System: t('pages_data.Library_Dashboard.Welcome_To_Your_Library_Management_System'),

  // Front Office
  // Admission Enquiry
  Student_Details: t('pages_data.Front_Office.Admission_Enquiry.Student_Details'),
  class: t('pages_data.Front_Office.Admission_Enquiry.class'),
  Submit: t('pages_data.Common_buttons.Submit'),
  source: t('pages_data.Front_Office.Admission_Enquiry.source'),
  enquiry_date: t('pages_data.Front_Office.Admission_Enquiry.enquiry_date'),
  enquiry_from_date: t('pages_data.Front_Office.Admission_Enquiry.enquiry_from_date'),
  status: t('pages_data.Front_Office.Admission_Enquiry.status'),
  search: t('pages_data.Common_buttons.Search'),
  Student_List: t('pages_data.Front_Office.Admission_Enquiry.Student_List'),
  Add: t('pages_data.Common_buttons.Add'),
  Delete_ALL: t('pages_data.Front_Office.Admission_Enquiry.Delete_ALL'),
  Edit: t('pages_data.Front_Office.Admission_Enquiry.Edit'),
  Student: t('pages_data.Front_Office.Admission_Enquiry.Student'),
  Update: t('pages_data.Common_buttons.Update'),
  Save: t('pages_data.Common_buttons.Save'),
  Delete_A: t('pages_data.Common_buttons.Delete_A'),
  Select: t('pages_data.Front_Office.Admission_Enquiry.Select'),
  This_field_is_required: t('pages_data.Front_Office.Admission_Enquiry.This_field_is_required'),
  Clear: t('pages_data.Front_Office.Admission_Enquiry.Clear'),
  Date_is_required: t('pages_data.Front_Office.Admission_Enquiry.Date_is_required'),
  Do_you_want_to_delete_this_entry: t(
    'pages_data.Common_buttons.Do_you_want_to_delete_this_entry?',
  ),

  //table
  Student_Name: t('pages_data.Front_Office.Admission_Enquiry.Student_Name'),
  Phone: t('pages_data.Front_Office.Admission_Enquiry.Phone'),
  Class: t('pages_data.Front_Office.Admission_Enquiry.Class'),
  Source: t('pages_data.Front_Office.Admission_Enquiry.Source'),
  Enquiry_Date: t('pages_data.Front_Office.Admission_Enquiry.Enquiry_Date'),
  Enquiry_From_Date: t('pages_data.Front_Office.Admission_Enquiry.Enquiry_From_Date'),
  Status: t('pages_data.Front_Office.Admission_Enquiry.Status'),
  Action: t('pages_data.Front_Office.Admission_Enquiry.Action'),
  Search: t('pages_data.Front_Office.Admission_Enquiry.Search...'),
  No_data_available_in_Table: t(
    'pages_data.Front_Office.Admission_Enquiry.No_data_available_in_Table',
  ),
  Records_0_to_0_of_0: t('pages_data.Front_Office.Admission_Enquiry.Records_0_to_0_of_0'),
  Records: t('pages_data.Front_Office.Admission_Enquiry.Records'),
  to: t('pages_data.Front_Office.Admission_Enquiry.to'),
  of: t('pages_data.Front_Office.Admission_Enquiry.of'),

  Name: t('pages_data.Front_Office.Admission_Enquiry.Name'),
  Email: t('pages_data.Front_Office.Admission_Enquiry.Email'),
  Address: t('pages_data.Front_Office.Admission_Enquiry.Address'),
  Description: t('pages_data.Front_Office.Admission_Enquiry.Description'),
  Note: t('pages_data.Front_Office.Admission_Enquiry.Note'),
  Date: t('pages_data.Front_Office.Admission_Enquiry.Date'),
  Next_Follow_Up_Date: t('pages_data.Front_Office.Admission_Enquiry.Next_Follow_Up_Date'),
  Number_Of_Child: t('pages_data.Front_Office.Admission_Enquiry.Number_Of_Child'),
  Reference: t('pages_data.Front_Office.Admission_Enquiry.Reference'),
  Assigned: t('pages_data.Front_Office.Admission_Enquiry.Assigned'),

  //Visitor Book
  Visitor_List: t('pages_data.Visitor_Book.Visitor_List'),
  Purpose: t('pages_data.Visitor_Book.Purpose'),
  Meeting_With: t('pages_data.Visitor_Book.Meeting_With'),
  Visitor_Name: t('pages_data.Visitor_Book.Visitor_Name'),
  // Phone: t('pages_data.Visitor_Book.Phone'),
  ID_Card: t('pages_data.Visitor_Book.ID_Card'),
  Number_Of_Person: t('pages_data.Visitor_Book.Number_Of_Person'),
  // Date: t('pages_data.Visitor_Book.Date'),
  In_Time: t('pages_data.Visitor_Book.In_Time'),
  Out_Time: t('pages_data.Visitor_Book.Out_Time'),
  Time: t('pages_data.Visitor_Book.Time'),
  Upload_Id_Document: t('pages_data.Visitor_Book.Upload_Id_Document'),
  Visitor: t('pages_data.Visitor_Book.Visitor'),
  Visitor_Details: t('pages_data.Visitor_Book.Visitor_Details'),
  Enter_name: t('pages_data.Visitor_Book.Enter_name'),
  Enter_Phone: t('pages_data.Visitor_Book.Enter_Phone'),
  Enter_Id: t('pages_data.Visitor_Book.Enter_Id'),
  Enter_number: t('pages_data.Visitor_Book.Enter_number'),
  Enter_Description: t('pages_data.Visitor_Book.Enter_Description'),

  //Phone Call Log
  Add_Phone_Call_Log: t('pages_data.Phone_Call_Log.Add_Phone_Call_Log'),
  Edit_Phone_Call_Log: t('pages_data.Phone_Call_Log.Edit_Phone_Call_Log'),
  Follow_Up_Date: t('pages_data.Phone_Call_Log.Follow_Up_Date'),
  Call_Type: t('pages_data.Phone_Call_Log.Call_Type'),
  Incoming: t('pages_data.Phone_Call_Log.Incoming'),
  Outgoing: t('pages_data.Phone_Call_Log.Outgoing'),
  Phone_Call_List: t('pages_data.Phone_Call_Log.Phone_Call_List'),
  Call_Duration: t('pages_data.Phone_Call_Log.Call_Duration'),
  Call_Log_Details: t('pages_data.Phone_Call_Log.Call_Log_Details'),

  //Postal Dispatch
  To_Title: t('pages_data.Postal_Dispatch.To_Title'),
  Reference_No: t('pages_data.Postal_Dispatch.Reference_No'),
  From_Title: t('pages_data.Postal_Dispatch.From_Title'),
  Postal_Dispatch_List: t('pages_data.Postal_Dispatch.Postal_Dispatch_List'),
  Attach_Document: t('pages_data.Postal_Dispatch.Attach_Document'),
  Add_Postal_Dispatch: t('pages_data.Postal_Dispatch.Add_Postal_Dispatch'),
  Update_Complaint: t('pages_data.Postal_Dispatch.Update_Complaint'),
  Complaint_List: t('pages_data.Postal_Dispatch.Complaint_List'),
  Cancel: t('pages_data.Common_buttons.Cancel'),
  Close: t('pages_data.Common_buttons.Close'),
  Complaint_Details: t('pages_data.Postal_Dispatch.Complaint_Details'),
  Documen: t('pages_data.Postal_Dispatch.Document'),
  View_Docume: t('pages_data.Postal_Dispatch.View_Document'),
  Enter_recipient_title: t('pages_data.Postal_Dispatch.Enter_recipient_title'),
  Enter_reference_number: t('pages_data.Postal_Dispatch.Enter_reference_number'),
  Postal_type: t('pages_data.Postal_Dispatch.Postal_type'),
  select_postal_type: t('pages_data.Postal_Dispatch.select_postal_type'),
  enter_sender_title: t('pages_data.Postal_Dispatch.enter_sender_title'),
  title_reference_from: t('pages_data.Postal_Dispatch.title_reference_from'),

  //Postal Receive
  Add_Postal_Receive: t('pages_data.Postal_Receive.Add_Postal_Receive'),
  Edit_Postal_Receive: t('pages_data.Postal_Receive.Edit_Postal_Receive'),
  Postal_Receive_List: t('pages_data.Postal_Receive.Postal_Receive_List'),
  Postal_Receive_Details: t('pages_data.Postal_Receive.Postal_Receive_Details'),

  //Complaint
  Add_Complaint: t('pages_data.Complaint.Add_Complaint'),
  Complaint_Type: t('pages_data.Complaint.Complaint_Type'),
  Complain_By: t('pages_data.Complaint.Complain_By'),
  Action_Taken: t('pages_data.Complaint.Action_Taken'),

  //Setup_Front_Office
  Add_Purpose: t('pages_data.Setup_Front_Office.Add_Purpose'),
  Edit_Purpose: t('pages_data.Setup_Front_Office.Edit_Purpose'),
  Purpose_List: t('pages_data.Setup_Front_Office.Purpose_List'),
  Enter_purpose: t('pages_data.Setup_Front_Office.Enter_purpose'),
  Write_description: t('pages_data.Setup_Front_Office.Write_description'),
  Add_Complaint_Type: t('pages_data.Setup_Front_Office.Add_Complaint_Type'),
  Edit_Complaint_Type: t('pages_data.Setup_Front_Office.Edit_Complaint_Type'),
  Complaint_Type_List: t('pages_data.Setup_Front_Office.Complaint_Type_List'),
  Enter_complaint_type: t('pages_data.Setup_Front_Office.Enter_complaint_type'),
  Add_Source: t('pages_data.Setup_Front_Office.Add_Source'),
  Edit_Source: t('pages_data.Setup_Front_Office.Edit_Source'),
  Source_List: t('pages_data.Setup_Front_Office.Source_List'),
  Enter_source: t('pages_data.Setup_Front_Office.Enter_source'),
  Add_Reference: t('pages_data.Setup_Front_Office.Add_Reference'),
  Edit_Reference: t('pages_data.Setup_Front_Office.Edit_Reference'),
  Reference_List: t('pages_data.Setup_Front_Office.Reference_List'),
  Enter_reference: t('pages_data.Setup_Front_Office.Enter_reference'),

  //Student Information
  //Student Details
  Basic_Information: t('pages_data.student_Informations.Student_Details.Basic_Information'),
  Name_Admission_UID: t('pages_data.student_Informations.Student_Details.Name_Admission_UID'),
  Search_Students: t('pages_data.student_Informations.Student_Details.Search_Students'),
  Clear_Filters: t('pages_data.Disabled_Student.Clear_Filters'),
  List_View: t('pages_data.student_Informations.Student_Details.List_View'),
  Details_View: t('pages_data.student_Informations.Student_Details.Details_View'),
  Admission_No: t('pages_data.student_Informations.Student_Details.Admission_No'),
  Roll_No: t('pages_data.student_Informations.Student_Details.Roll_No'),
  Father_Name: t('pages_data.student_Informations.Student_Details.Father_Name'),
  Date_Of_Birth: t('pages_data.student_Informations.Student_Details.Date_Of_Birth'),
  Gender: t('pages_data.student_Informations.Student_Details.Gender'),
  Category: t('pages_data.student_Informations.Student_Details.Category'),
  Mobile_Number: t('pages_data.student_Informations.Student_Details.Mobile_Number'),
  UID: t('pages_data.student_Informations.Student_Details.UID'),
  No_Record_Found: t('pages_data.student_Informations.Student_Details.No_Record_Found'),
  Info_Note: t('pages_data.student_Informations.Student_Details.Info_Note'),
  Section_Title: t('pages_data.student_Informations.Student_Details.Section_Title'),
  Staff_Id: t('pages_data.student_Informations.Student_Details.Staff_Id'),
  Local_Identification_Number: t(
    'pages_data.student_Informations.Student_Details.Local_Identification_Number',
  ),
  Guardian_Name: t('pages_data.student_Informations.Student_Details.Guardian_Name'),
  Guardian_Phone: t('pages_data.student_Informations.Student_Details.Guardian_Phone'),
  Role: t('pages_data.student_Informations.Student_Details.Role'),
  Designation: t('pages_data.student_Informations.Student_Details.Designation'),
  Department: t('pages_data.student_Informations.Student_Details.Department'),
  First_Name: t('pages_data.student_Informations.Student_Details.First_Name'),
  Last_Name: t('pages_data.student_Informations.Student_Details.Last_Name'),
  Mother_Name: t('pages_data.student_Informations.Student_Details.Mother_Name'),
  Email_Placeholder: t('pages_data.student_Informations.Student_Details.Email_Placeholder'),
  Date_Of_Joining: t('pages_data.student_Informations.Student_Details.Date_Of_Joining'),
  Date_Of_Leaving: t('pages_data.student_Informations.Student_Details.Date_Of_Leaving'),
  Date_Of_Birth_Placeholder: t(
    'pages_data.student_Informations.Student_Details.Date_Of_Birth_Placeholder',
  ),
  Emergency_Contact_Number: t(
    'pages_data.student_Informations.Student_Details.Emergency_Contact_Number',
  ),
  Marital_Status: t('pages_data.student_Informations.Student_Details.Marital_Status'),
  Photo: t('pages_data.student_Informations.Student_Details.Photo'),
  Current_Address: t('pages_data.student_Informations.Student_Details.Current_Address'),
  Current_Address_Placeholder: t(
    'pages_data.student_Informations.Student_Details.Current_Address_Placeholder',
  ),
  Permanent_Address: t('pages_data.student_Informations.Student_Details.Permanent_Address'),
  Permanent_Address_Placeholder: t(
    'pages_data.student_Informations.Student_Details.Permanent_Address_Placeholder',
  ),
  Qualification: t('pages_data.student_Informations.Student_Details.Qualification'),
  Work_Experience: t('pages_data.student_Informations.Student_Details.Work_Experience'),
  Note_Placeholder: t('pages_data.student_Informations.Student_Details.Note_Placeholder'),
  Add_More_Details: t('pages_data.student_Informations.Student_Details.Add_More_Details'),
  Payroll: t('pages_data.student_Informations.Student_Details.Payroll'),
  epf_no: t('pages_data.student_Informations.Student_Details.epf_no'),
  Contract_type: t('pages_data.student_Informations.Student_Details.contract_type'),
  basic_salary: t('pages_data.student_Informations.Student_Details.basic_salary'),
  work_shift: t('pages_data.student_Informations.Student_Details.work_shift'),
  work_location: t('pages_data.student_Informations.Student_Details.work_location'),
  date_of_leaving: t('pages_data.student_Informations.Student_Details.date_of_leaving'),
  Leaves: t('pages_data.student_Informations.Student_Details.Leaves'),
  SL: t('pages_data.student_Informations.Student_Details.SL'),
  cl: t('pages_data.student_Informations.Student_Details.cl'),
  maternity_leave: t('pages_data.student_Informations.Student_Details.maternity_leave'),
  Bank_Account_Details: t('pages_data.student_Informations.Student_Details.Bank_Account_Details'),
  account_title: t('pages_data.student_Informations.Student_Details.account_title'),
  bank_account_number: t('pages_data.student_Informations.Student_Details.bank_account_number'),
  bank_name: t('pages_data.student_Informations.Student_Details.bank_name'),
  ifsc_code: t('pages_data.student_Informations.Student_Details.ifsc_code'),
  bank_branch_name: t('pages_data.student_Informations.Student_Details.bank_branch_name'),
  Social_Media_Link: t('pages_data.student_Informations.Student_Details.Social_Media_Link'),
  facebook_page: t('pages_data.student_Informations.Student_Details.facebook_page'),
  witter_page: t('pages_data.student_Informations.Student_Details.witter_page'),
  twitter_page: t('pages_data.student_Informations.Student_Details.twitter_page'),
  linkedin_url: t('pages_data.student_Informations.Student_Details.linkedin_url'),
  instagram_url: t('pages_data.student_Informations.Student_Details.instagram_url'),
  resume: t('pages_data.student_Informations.Student_Details.resume'),
  joining_letter: t('pages_data.student_Informations.Student_Details.joining_letter'),
  resignation_letter: t('pages_data.student_Informations.Student_Details.resignation_letter'),
  dother_documents: t('pages_data.student_Informations.Student_Details.other_documents'),
  Upload_Documents: t('pages_data.student_Informations.Student_Details.Upload_Documents'),
  other_documents: t('pages_data.student_Informations.Student_Details.other_documents'),
  Session_history_loading: t('pages_data.Student_Admission.Session_history_loading'),
  Session_history_failed: t('pages_data.Student_Admission.Session_history_failed'),
  Session_history_refresh: t('pages_data.Student_Admission.Session_history_refresh'),
  No_session_history_available: t('pages_data.Student_Admission.No_session_history_available'),
  Session_Records_Available: t('pages_data.Student_Admission.Session_Records_Available'),
  Loading_transport_and_hostel_information: t('pages_data.Student_Admission.Loading_transport_and_hostel_information'),
  Transport_Information: t('pages_data.Student_Admission.Transport_Information'),
  Hostel_Information: t('pages_data.Student_Admission.Hostel_Information'),
  Fees_Information: t('pages_data.Student_Admission.Fees_Information'),
  Please_select_a_student_from_the_list_view_to_see_details: t('pages_data.Student_Admission.Please_select_a_student_from_the_list_view_to_see_details'),
  Update_Current_Session: t('pages_data.student_Informations.Student_Details.Update_Current_Session'),
  Saving: t('pages_data.student_Informations.Student_Details.Saving'),

  //Student Admission
  Student_Admission: t("pages_data.Student_Admission.Student_Admission"),
  Student_Edit: t("pages_data.Student_Admission.Student_Edit"),
  Import_Student: t("pages_data.Student_Admission.Import_Student"),
  Download_Tempalte: t("pages_data.Student_Admission.Download_Template"),
  STS_Number: t("pages_data.Student_Admission.STS_Number"),
  GR_Number: t("pages_data.Student_Admission.GR_Number"),
  udise: t("pages_data.Student_Admission.udise"),
  Aadhaar_Number: t("pages_data.Student_Admission.Aadhaar_Number"),
  Student_Aadhaar_File: t("pages_data.Student_Admission.Student_Aadhaar_File"),
  Birth_Certificate: t("pages_data.Student_Admission.Birth_Certificate"),
  Previous_School: t("pages_data.Student_Admission.Previous_School"),
  Previous_School_Class: t("pages_data.Student_Admission.Previous_School_Class"),
  Transfer_Certificate: t("pages_data.Student_Admission.Transfer_Certificate"),
  Migration_Bonafide: t("pages_data.Student_Admission.Migration_Bonafide"),
  Place_of_Birth_Location: t("pages_data.Student_Admission.Place_of_Birth_Location"),
  Place_of_Birth: t("pages_data.Student_Admission.Place_of_Birth"),
  Taluk: t("pages_data.Student_Admission.Taluk"),
  District: t("pages_data.Student_Admission.District"),
  State: t("pages_data.Student_Admission.State"),
  Nationality: t("pages_data.Student_Admission.Nationality"),
  Is_Student_Disabled: t("pages_data.Student_Admission.Is_Student_Disabled"),
  Disable_Status: t("pages_data.Student_Admission.Disable_Status"),
  Father_Aadhaar_File: t("pages_data.Student_Admission.Father_Aadhaar_File"),
  Mother_Aadhaar_File: t("pages_data.Student_Admission.Mother_Aadhaar_File"),
  Additional_Parent_Information: t("pages_data.Student_Admission.Additional_Parent_Information"),
  Default_Parent: t("pages_data.Student_Admission.Default_Parent"),
  Parent_Full_Name: t("pages_data.Student_Admission.Parent_Full_Name"),
  Annual_Income: t("pages_data.Student_Admission.Annual_Income"),
  Income_Certificate_No: t("pages_data.Student_Admission.Income_Certificate_No"),
  No_of_Dependents: t("pages_data.Student_Admission.No_of_Dependents"),
  Alternate_Phone: t("pages_data.Student_Admission.Alternate_Phone"),
  Parent_Email: t("pages_data.Student_Admission.Parent_Email"),
  Income_Certificate: t("pages_data.Student_Admission.Income_Certificate"),
  Sibling_Details: t("pages_data.Student_Admission.Sibling_Details"),
  Sibling_Class_Admission_No: t("pages_data.Student_Admission.Sibling_Class_Admission_No"),
  No_fee_types_selected: t("pages_data.Student_Admission.No_fee_types_selected"),
  Please_select_a_class_first_to_enable_fee_type_selection: t("pages_data.Student_Admission.Please_select_a_class_first_to_enable_fee_type_selection"),
  Additional_Details: t("pages_data.Student_Admission.Additional_Details"),
  Bank_Passbook_File: t("pages_data.Student_Admission.Bank_Passbook_File"),
  SSLC_Details: t("pages_data.Student_Admission.SSLC_Details"),
  SSLC_Registration_No: t("pages_data.Student_Admission.SSLC_Registration_No"),
  SSLC_Board_Registration_Number: t("pages_data.Student_Admission.SSLC_Board_Registration_Number"),
  SSLC_First_Language: t("pages_data.Student_Admission.SSLC_First_Language"),
  SSLC_Second_Language: t("pages_data.Student_Admission.SSLC_Second_Language"),
  SSLC_Third_Language: t("pages_data.Student_Admission.SSLC_Third_Language"),
  SSLC_Percentage: t("pages_data.Student_Admission.SSLC_Percentage"),
  SSLC_Marks_Obtained: t("pages_data.Student_Admission.SSLC_Marks_Obtained"),
  SSLC_Result: t("pages_data.Student_Admission.SSLC_Result"),
  SSLC_Hall_Ticket: t("pages_data.Student_Admission.SSLC_Hall_Ticket"),
  SSLC_Marks_Sheet: t("pages_data.Student_Admission.SSLC_Marks_Sheet"),
  Subject_Marks: t("pages_data.Student_Admission.Subject_Marks"),
  School_Name_And_Address: t("pages_data.Student_Admission.School_Name_And_Address"),
  Student_Ad: t("pages_data.Student_Admission.Student_Ad"),
  Admission_Number: t("pages_data.Student_Admission.Admission_Number"),
  Roll_Number: t("pages_data.Student_Admission.Roll_Number"),
  Religion: t("pages_data.Student_Admission.Religion"),
  Caste: t("pages_data.Student_Admission.Caste"),
  Admission_Date: t("pages_data.Student_Admission.Admission_Date"),
  Student_Photo: t("pages_data.Student_Admission.Student_Photo"),
  Blood_Group: t("pages_data.Student_Admission.Blood_Group"),
  House: t("pages_data.Student_Admission.House"),
  Height: t("pages_data.Student_Admission.Height"),
  Weight: t("pages_data.Student_Admission.Weight"),
  Measurement_Date: t("pages_data.Student_Admission.Measurement_Date"),
  Add_Sibling: t("pages_data.Student_Admission.Add_Sibling"),
  Sibling: t("pages_data.Student_Admission.Sibling"),
  Transport_Details: t("pages_data.Student_Admission.Transport_Details"),
  Route_List: t("pages_data.Student_Admission.Route_List"),
  Pickup_Point: t("pages_data.Student_Admission.Pickup_Point"),
  Fees_Month: t("pages_data.Student_Admission.Fees_Month"),
  Hostel_Details: t("pages_data.Student_Admission.Hostel_Details"),
  Hostel: t("pages_data.Student_Admission.Hostel"),
  Room_Number: t("pages_data.Student_Admission.Room_Number"),
  Class_1_General: t("pages_data.Student_Admission.Class_1_General"),
  Class_1_Lump_Sum: t("pages_data.Student_Admission.Class_1_Lump_Sum"),
  Exam: t("pages_data.Student_Admission.Exam"),
  Fees: t("pages_data.Student_Admission.Fees"),
  Balance_Master: t("pages_data.Student_Admission.Balance_Master"),
  PUC_1st: t("pages_data.Student_Admission.PUC_1st"),
  Parent_Guardian_Detail: t("pages_data.Student_Admission.Parent_Guardian_Detail"),
  Father_Details: t("pages_data.Student_Admission.Father_Details"),
  Mother_Details: t("pages_data.Student_Admission.Mother_Details"),
  Guardian_Details: t("pages_data.Student_Admission.Guardian_Details"),
  student_address_details: t("pages_data.Student_Admission.student_address_details"),
  if_guardian_is_current_address: t("pages_data.Student_Admission.if_guardian_is_current_address"),
  current_address: t("pages_data.Student_Admission.current_address"),
  if_permanent_is_current_address: t("pages_data.Student_Admission.if_permanent_is_current_address"),
  permanent_address: t("pages_data.Student_Admission.permanent_address"),
  miscellaneous_details: t("pages_data.Student_Admission.miscellaneous_details"),
  bank_ifsc_code: t("pages_data.Student_Admission.bank_ifsc_code"),
  national_identification_number: t("pages_data.Student_Admission.national_identification_number"),
  local_identification_number: t("pages_data.Student_Admission.local_identification_number"),
  rte: t("pages_data.Student_Admission.rte"),
  rte_yes: t("pages_data.Student_Admission.rte_yes"),
  rte_no: t("pages_data.Student_Admission.rte_no"),
  previous_school_details: t("pages_data.Student_Admission.previous_school_details"),
  note: t("pages_data.Student_Admission.note"),
  upload_documents: t("pages_data.Student_Admission.upload_documents"),
  title: t("pages_data.Student_Admission.title"),
  document: t("pages_data.Student_Admission.document"),
  current_address_placeholder: t("pages_data.Student_Admission.current_address_placeholder"),
  bank_ifsc_code_placeholder: t("pages_data.Student_Admission.bank_ifsc_code_placeholder"),
  national_identification_number_placeholder: t("pages_data.Student_Admission.national_identification_number_placeholder"),
  local_identification_number_placeholder: t("pages_data.Student_Admission.local_identification_number_placeholder"),
  previous_school_details_placeholder: t("pages_data.Student_Admission.previous_school_details_placeholder"),
  Changing_the_class_will_reset_selected_fee_types_and_amounts: t(
    "pages_data.Student_Admission.Changing_the_class_will_reset_selected_fee_types_and_amounts"
  ),
  "School_Name_&_Address": t("pages_data.Student_Admission.School_Name_&_Address"),
  Are_you_sure_you_want_to_change_the_class: t(
    "pages_data.Student_Admission.Are_you_sure_you_want_to_change_the_class",
  ),
  Session_history: t("pages_data.Student_Admission.Session_History"),
  Personal_Information: t("pages_data.Student_Admission.Personal_Information"),
  Parent_Information: t("pages_data.Student_Admission.Parent_Information"),
  Contact_Information: t("pages_data.Student_Admission.Contact_Information"),
  Physical_Details: t("pages_data.Student_Admission.Physical_Details"),
  My_Students: t("pages_data.Student_Admission.My_Students"),
  Search_by_Class_Section: t("pages_data.Student_Admission.Search_by_Class_Section"),
  Female_Students: t("pages_data.Student_Admission.Female_Students"),
  Male_Students: t("pages_data.Student_Admission.Male_Students"),

  //Online Admission
  Student_ListTitle: t('pages_data.Online_Admission.Student_ListTitle'),
  Student_Mobile_Number: t('pages_data.Online_Admission.Student_Mobile_Number'),
  From_Status: t('pages_data.Online_Admission.From_Status'),
  Payment_Status: t('pages_data.Online_Admission.Payment_Status'),
  Enrolled: t('pages_data.Online_Admission.Enrolled'),
  Created_At: t('pages_data.Online_Admission.Created_At'),

  //Disabled Student
  Inactive: t('pages_data.Disabled_Student.Inactive'),
  Section: t("Pages_name.Academics.Section"),
  Transport_Enrolled: t('pages_data.Disabled_Student.Transport_Enrolled'),
  Hostel_Enrolled: t('pages_data.Disabled_Student.Hostel_Enrolled'),
  Select_Disabled_Student: t('pages_data.Disabled_Student.Select_Disabled_Student'),
  Click_To_Open: t('pages_data.Disabled_Student.Click_To_Open'),
  Disabled_Students_Matching: t('pages_data.Disabled_Student.Disabled_Students_Matching'),
  No_Disabled_Students_Message: t('pages_data.Disabled_Student.No_Disabled_Students_Message'),
  Disabled_StudentTitle: t('pages_data.Disabled_Student.Disabled_StudentTitle'),
  Student_Name_Admission_No_UID: t('pages_data.Disabled_Student.Student_Name_Admission_No_UID'),
  Disabled_Student_List: t('pages_data.Disabled_Student.Disabled_Student_List'),
  Disabled_Reason: t('pages_data.Disabled_Student.Disabled_Reason'),
  Local_Identification_Numbe: t('pages_data.Disabled_Student.Local_Identification_Number'),
  Search_Disabled_Students: t('pages_data.Disabled_Student.Search_Disabled_Students'),
  Enter_name_admission_number_or_UID: t(
    'pages_data.Disabled_Student.Enter_name_admission_number_or_UID',
  ),
  There_are_currently_no_disabled_students_in_the_system: t(
    'pages_data.Disabled_Student.There_are_currently_no_disabled_students_in_the_system',
  ),

  //Multi Class Student
  // Select_Criteria: t('pages_data.Multi_Class_Student.Select_Criteria'),
  MultiClass_Student: t('pages_data.Multi_Class_Student.MultiClass_Student'),
  Remove: t('pages_data.Multi_Class_Student.Remove'),

  //Student Categories
  Add_Category: t('pages_data.Student_Categories.Add_Category'),
  Category_Name: t('pages_data.Student_Categories.Category_Name'),
  ID: t('pages_data.Student_Categories.ID'),
  Student_CategoriesTitle: t('pages_data.Student_Categories.Student_CategoriesTitle'),
  Edit_Category: t('pages_data.Student_Categories.Edit_Category'),
  Enter_Category_Name: t('pages_data.Student_Categories.Enter_Category_Name'),

  //Student Houses
  Add_House: t('pages_data.Student_Houses.Add_House'),
  House_Name: t('pages_data.Student_Houses.House_Name'),
  Student_HousesTitle: t('pages_data.Student_Houses.Student_HousesTitle'),
  Edit_House: t('pages_data.Student_Houses.Edit_House'),
  Description_A: t('pages_data.Student_Houses.Description_A'),

  //Disable Reason
  Add_Disable_Reason: t('pages_data.Disable_Reason.Add_Disable_Reason'),
  Disable_Reason: t('pages_data.Disable_Reason.Disable_Reason'),
  Disable_Reason_List: t('pages_data.Disable_Reason.Disable_Reason_List'),
  Edit_Disable_Reason: t('pages_data.Disable_Reason.Edit_Disable_Reason'),

  //Fess Collection
  //Collect Fees
  Name_or_Admission_No: t('pages_data.Fees_Collection.Collect_Fees.Name_or_Admission_No'),
  Edit_Student: t('pages_data.Fees_Collection.Collect_Fees.Edit_Student'),
  Add_Student: t('pages_data.Fees_Collection.Collect_Fees.Add_Student'),

  //OfflineBanckPyment
  Offline_Bank_PaymentsTitle: t('pages_data.Offline_Bank_Payments.Offline_Bank_PaymentsTitle'),
  Add_Payment: t('pages_data.Offline_Bank_Payments.Add_Payment'),
  Request_Id: t('pages_data.Offline_Bank_Payments.Request_Id'),
  Payment_Date: t('pages_data.Offline_Bank_Payments.Payment_Date'),
  Payment_ID: t('pages_data.Offline_Bank_Payments.Payment_ID'),
  Status_Date: t('pages_data.Offline_Bank_Payments.Status_Date'),
  Amount: t('pages_data.Offline_Bank_Payments.Amount'),
  Submit_Date: t('pages_data.Offline_Bank_Payments.Submit_Date'),
  Edit_Payment: t('pages_data.Offline_Bank_Payments.Edit_Payment'),

  //Search Fees Payment
  Search_Fees_PaymentTitle: t('pages_data.Search_Fees_Payment.Search_Fees_PaymentTitle'),
  Fees_Payment_Record: t('pages_data.Search_Fees_Payment.Fees_Payment_Records'),
  Edit_Payment_Record: t('pages_data.Search_Fees_Payment.Edit_Payment_Record'),
  Fees_Group: t('pages_data.Search_Fees_Payment.Fees_Group'),
  Fees_Type: t('pages_data.Search_Fees_Payment.Fees_Type'),
  Mode: t('pages_data.Search_Fees_Payment.Mode'),
  Paid: t('pages_data.Search_Fees_Payment.Paid'),
  Discount: t('pages_data.Search_Fees_Payment.Discount'),
  Fine: t('pages_data.Search_Fees_Payment.Fine'),
  Search_Filter: t('pages_data.Search_Fees_Payment.Search_Filter'),
  Search_By_Name_Admission_No: t('pages_data.Search_Fees_Payment.Search_By_Name_Admission_No'),
  Transaction_ID: t('pages_data.Search_Fees_Payment.Transaction_ID'),
  Receipt_Payment_ID: t('pages_data.Search_Fees_Payment.Receipt_Payment_ID'),
  Transactions: t('pages_data.Search_Fees_Payment.Transactions'),
  Enter_Receipt_Or_Payment_ID: t('pages_data.Search_Fees_Payment.Enter_Receipt_Or_Payment_ID'),
  Download_Report: t('pages_data.Search_Fees_Payment.Download_Report'),
  Enter_Name_Or_Admission_No: t('pages_data.Search_Fees_Payment.Enter_Name_Or_Admission_No'),
  Searching_Records_On_Server: t('pages_data.Search_Fees_Payment.Searching_Records_On_Server'),
  Loading_Transactions: t('pages_data.Search_Fees_Payment.Loading_Transactions'),
  Filtering: t('pages_data.Search_Fees_Payment.Filtering'),
  No_Transactions_Found: t('pages_data.Search_Fees_Payment.No_Transactions_Found'),
  No_Transactions_Match_Your_Search: t(
    'pages_data.Search_Fees_Payment.No_Transactions_Match_Your_Search',
  ),

  //Search Due Fees
  // Select_Criteria: t('pages_data.Search_Due_Fees.Select_Criteria'),
  Search_Results: t('pages_data.Search_Due_Fees.Search_Results'),
  Balance: t('pages_data.Search_Due_Fees.Balance'),
  Pending_Amount: t('pages_data.Search_Due_Fees.Pending_Amount'),
  Fine_Amount: t('pages_data.Search_Due_Fees.Fine_Amount'),
  Fee_Type: t('pages_data.Search_Due_Fees.Fee_Type'),
  Select_Fee_Type: t('pages_data.Search_Due_Fees.Select_Fee_Type'),
  Select_Multiple_Fee_Types: t('pages_data.Search_Due_Fees.Select_Multiple_Fee_Types'),
  Important_Notice: t('pages_data.Search_Due_Fees.Important_Notice'),
  Transaction_Delete_Warning: t('pages_data.Search_Due_Fees.Transaction_Delete_Warning'),
  New_Payment_Transaction: t('pages_data.Search_Due_Fees.New_Payment_Transaction'),
  Enter_Payment_Details_For_Each_Fee_Type: t(
    'pages_data.Search_Due_Fees.Enter_Payment_Details_For_Each_Fee_Type',
  ),
  Payment_Mode: t('pages_data.Search_Due_Fees.Payment_Mode'),
  Add_Transaction: t('pages_data.Search_Due_Fees.Add_Transaction'),
  Paid_Amount: t('pages_data.Search_Due_Fees.Paid_Amount'),
  Optional: t('pages_data.Search_Due_Fees.Optional'),
  Loading: t('pages_data.Search_Due_Fees.Loading'),
  Students_With_Due_Fees: t('pages_data.Search_Due_Fees.Students_With_Due_Fees'),
  Note_Optional: t('pages_data.Search_Due_Fees.Note_Optional'),
  Enter_Additional_Notes: t('pages_data.Search_Due_Fees.Enter_Additional_Notes'),
  Confirm_Payment: t('pages_data.Search_Due_Fees.Confirm_Payment'),
  Transaction_Successfully_Updated_For: t(
    'pages_data.Search_Due_Fees.Transaction_Successfully_Updated_For',
  ),
  Print_Updated_Receipt_Question: t('pages_data.Search_Due_Fees.Print_Updated_Receipt_Question'),
  Transaction_Recorded_For: t('pages_data.Search_Due_Fees.Transaction_Recorded_For'),
  Print_Receipt_Question: t('pages_data.Search_Due_Fees.Print_Receipt_Question'),
  Print_Receipt: t('pages_data.Search_Due_Fees.Print_Receipt'),
  Transaction_History: t('pages_data.Search_Due_Fees.Transaction_History'),
  Amount_Paid: t('pages_data.Search_Due_Fees.Amount_Paid'),
  Receipt_No: t('pages_data.Search_Due_Fees.Receipt_No'),
  Back_To_Search: t('pages_data.Search_Due_Fees.Back_To_Search'),
  Enter_Roll_Number: t('pages_data.Search_Due_Fees.Enter_Roll_Number'),
  Total_Pending: t('pages_data.Search_Due_Fees.Total_Pending'),
  Fee_Structure_Breakdown: t('pages_data.Search_Due_Fees.Fee_Structure_Breakdown'),
  Total_Fees: t('pages_data.Search_Due_Fees.Total_Fees'),

  //Add Fine
  No_Assigned_Fees_Message: t('pages_data.Add_Fine.No_Assigned_Fees_Message'),
  Reason: t('pages_data.Add_Fine.Reason'),
  Enter_Reason_For_Fine: t('pages_data.Add_Fine.Enter_Reason_For_Fine'),
  Add_Fine: t('pages_data.Add_Fine.Add_Fine'),
  Fee_Status: t('pages_data.Add_Fine.Fee_Status'),

  //Fee Receipt
  Unpaid: t('pages_data.Fee_Receipt.Unpaid'),
  Partial_Paid: t('pages_data.Fee_Receipt.Partial_Paid'),
  Fully_Paid: t('pages_data.Fee_Receipt.Fully_Paid'),

  //Balance Sheet

  Download_Balance_Sheet_Report: t('pages_data.Balance_Sheet.Download_Balance_Sheet_Report'),
  Select_Filter_Type: t('pages_data.Balance_Sheet.Select_Filter_Type'),
  Select_Session: t('pages_data.Balance_Sheet.Select_Session'),
  Select_Year: t('pages_data.Balance_Sheet.Select_Year'),

  //Add Student Fees

  Delete_Student_Fees: t('pages_data.Add_Student_Fees.Delete_Student_Fees'),
  This_Action_Cannot_Be_Undone: t('pages_data.Add_Student_Fees.This_Action_Cannot_Be_Undone'),
  Delete_Student_Fees_Confirmation: t(
    'pages_data.Add_Student_Fees.Delete_Student_Fees_Confirmation',
  ),
  Fee_Records: t('pages_data.Add_Student_Fees.Fee_Records'),
  Fee_Breakdown: t('pages_data.Add_Student_Fees.Fee_Breakdown'),
  Fee_Details: t('pages_data.Add_Student_Fees.Fee_Details'),
  Select_Fee_Types: t('pages_data.Add_Student_Fees.Select_Fee_Types'),
  Edit_Fees: t('pages_data.Add_Student_Fees.Edit_Fees'),
  Add_Fees: t('pages_data.Add_Student_Fees.Add_Fees'),
  Student_Fees: t('pages_data.Add_Student_Fees.Student_Fees'),
  Add_Student_Fees: t('pages_data.Add_Student_Fees.Add_Student_Fees'),
  Search_Students_To_Assign_Or_Update_Fees: t(
    'pages_data.Add_Student_Fees.Search_Students_To_Assign_Or_Update_Fees',
  ),
  Yes_Delete_All_Fees: t('pages_data.Add_Student_Fees.Yes_Delete_All_Fees'),
  No_Fees_To_Delete: t('pages_data.Add_Student_Fees.No_Fees_To_Delete'),
  View_Fees: t('pages_data.Add_Student_Fees.View_Fees'),

  //Class Fees
  Add_Class_Fee: t('pages_data.Class_Fees.Add_Class_Fee'),
  Class_Fee_List: t('pages_data.Class_Fees.Class_Fee_List'),
  Edit_Class_Fee: t('pages_data.Class_Fees.Edit_Class_Fee'),
  //Fees Master
  Add_Fees_MasterTitle: t('pages_data.Fees_Master.Add_Fees_MasterTitle'),
  Fees_Master_Entries: t('pages_data.Fees_Master.Fees_Master_Entries'),
  Edit_Fees_Master: t('pages_data.Fees_Master.Edit_Fees_Master'),
  Upadet_Fees_Master: t('pages_data.Fees_Master.Upadet_Fees_Master'),
  Due_Date: t('pages_data.Fees_Master.Due_Date'),
  Fine_Type: t('pages_data.Fees_Master.Fine_Type'),
  None: t('pages_data.Fees_Master.None'),
  Percentage: t('pages_data.Fees_Master.Percentage'),
  Fix_Amount: t('pages_data.Fees_Master.Fix_Amount'),
  Fees_Code: t('pages_data.Fees_Master.Fees_Code'),
  Fine_Details: t('pages_data.Fees_Master.Fine_Details'),

  //FeesGroup
  Add_Fees_Group: t('pages_data.Fees_Group.Add_Fees_Group'),
  Fees_Group_List: t('pages_data.Fees_Group.Fees_Group_List'),
  Edit_Fees_Group: t('pages_data.Fees_Group.Edit_Fees_Group'),
  Name_Plaseholder: t('pages_data.Fees_Group.Name_Plaseholder'),
  Description_Plaseholder: t('pages_data.Fees_Group.Description_Plaseholder'),

  //FeesDiscount
  Add_Fees_Discount: t('pages_data.Fees_Discount.Add_Fees_Discount'),
  Fees_Discount_List: t('pages_data.Fees_Discount.Fees_Discount_List'),
  Edit_Fees_Discount: t('pages_data.Fees_Discount.Edit_Fees_Discount'),
  Discount_Type: t('pages_data.Fees_Discount.Discount_Type'),
  Discount_Code: t('pages_data.Fees_Discount.Discount_Code'),

  //Fees Type
  Add_Fees_Type: t('pages_data.Fees_Type.Add_Fees_Type'),
  Fees_Type_List: t('pages_data.Fees_Type.Fees_Type_List'),
  Edit_Fees_Type: t('pages_data.Fees_Type.Edit_Fees_Type'),
  Enter_Fees_Code: t('pages_data.Fees_Type.Enter_Fees_Code'),

  //Previous Session Balance Fees
  Previous_Session_Balance_Fees: t('pages_data.Fees_Carry_Forward.Previous_Session_Balance_Fees'),
  Fees_Carry_Forward: t('pages_data.Fees_Carry_Forward.Fees_Carry_Forward_Entry'),

  //Fees Reminder
  Fees_ReminderTitle: t('pages_data.Fees_Reminder.Fees_ReminderTitle'),

  Reminder_Type: t('pages_data.Fees_Reminder.Reminder_Type'),
  Days: t('pages_data.Fees_Reminder.Days'),
  Before: t('pages_data.Fees_Reminder.Before'),
  After: t('pages_data.Fees_Reminder.After'),
  Number: t('pages_data.Fees_Reminder.Number'),
  Active: t('pages_data.Fees_Reminder.Active'),
  Record_updated_successfully: t('pages_data.Fees_Reminder.Record_updated_successfully'),

  //Add Income
  Add_IncomeTitle: t('pages_data.Add_Income.Add_IncomeTitle'),
  Income_List: t('pages_data.Add_Income.Income_List'),
  Income_Head: t('pages_data.Add_Income.Income_Head'),
  Invoice_Number: t('pages_data.Add_Income.Invoice_Number'),
  Upload_Document: t('pages_data.Add_Income.Upload_Document'),
  Income_Group: t('pages_data.Add_Income.Income_Group'),

  //Income_Group
  salary: t('pages_data.Income_GroupIncome_Group_salary'),

  //Search Income
  Search_Type: t('pages_data.Search_Income.Search_Type'),
  Search_By_Name: t('pages_data.Search_Income.Search_By_Name'),
  Grand_Total: t('pages_data.Search_Income.Grand_Total'),

  //Add Income Head
  Add_Income_Head: t('pages_data.Income_Head.Add_Income_Head'),
  Income_Head_List: t('pages_data.Income_Head.Income_Head_List'),
  Edit_Income_Head: t('pages_data.Income_Head.Edit_Income_Head'),

  //Add Expense
  Add_ExpenseTitle: t('pages_data.Add_Expense.Add_ExpenseTitle'),
  Expense_List: t('pages_data.Add_Expense.Expense_List'),
  Expense_Head: t('pages_data.Add_Expense.Expense_Head'),
  Enter_Number_Plasholder: t('pages_data.Add_Expense.Enter_Number_Plasholder'),
  Enter_Amount_Plasholder: t('pages_data.Add_Expense.Enter_Amount_Plasholder'),
  Expense_Group: t('pages_data.Add_Expense.Expense_Group'),
  Enter_Invoice_number: t('pages_data.Add_Expense.Enter_Invoice_number'),
  Enter_Amount: t('pages_data.Add_Expense.Enter_Amount'),
  // Enter_Description : t ("pages_data.Add_Expense.Enter_Description"),
  Name_Description: t('pages_data.Add_Expense.Name_Description'),
  Expense_Group_List: t('pages_data.Add_Expense.Expense_Group_List'),
  Expense_Group_Example: t('pages_data.Add_Expense.Expense_Group_Example'),
  Enter_Invoice_Number: t('pages_data.Add_Expense.Enter_Invoice_Number'),

  //Search Expense
  Search_By_Expense: t('pages_data.Search_Expense.Search_By_Expense'),
  Search_By_ExpensePlesholder: t('pages_data.Search_Expense.Search_By_ExpensePlesholder'),

  //Add Expense Head
  Add_Expense_Head: t('pages_data.Expense_Head.Add_Expense_Head'),
  Expense_Head_List: t('pages_data.Expense_Head.Expense_Head_List'),
  Edit_Expense_Head: t('pages_data.Expense_Head.Edit_Expense_Head'),
  Code: t('pages_data.Expense_Head.Code'),

  //Examination
  //Exam Group
  Exam_Type: t('pages_data.Examination.Exam_Group.Exam_Type'),
  Total_Exams: t('pages_data.Examination.Exam_Group.Total_Exams'),
  Exam_Group_List: t('pages_data.Examination.Exam_Group.Exam_Group_List'),
  No_of_Exams: t('pages_data.Examination.Exam_Group.No_of_Exams'),
  Enter_Name: t('pages_data.Examination.Exam_Group.Enter_Name'),
  There_Is_No_Class_Subject_Assigned_For_You: t(
    'pages_data.Examination.Exam_Group.There_Is_No_Class/Subject_Assigned_For_You.',
  ),

  //Exam Type
  Create_Exam_Type: t('pages_data.Examination.Exam_Type.Create_Exam_Type'),
  Exam_Type_List: t('pages_data.Examination.Exam_Type.Exam_Type_List'),

  //Exam Schedule
  Exam_Schedule_Title: t('pages_data.Examination.Exam_Schedule.Exam_Schedule_Title'),
  Subject: t('pages_data.Examination.Exam_Schedule.Subject'),
  Room_No: t('pages_data.Examination.Exam_Schedule.Room_No'),
  Date_From: t('pages_data.Examination.Exam_Schedule.Date_From'),
  Start_Time: t('pages_data.Examination.Exam_Schedule.Start_Time'),
  Duration: t('pages_data.Examination.Exam_Schedule.Duration'),
  Marks_Max: t('pages_data.Examination.Exam_Schedule.Marks_Max'),
  Marks_Min: t('pages_data.Examination.Exam_Schedule.Marks_Min'),
  Total_Subjects: t('pages_data.Examination.Exam_Schedule.Total_Subjects'),
  Add_Exam_Schedule: t('pages_data.Examination.Exam_Schedule.Add_Exam_Schedule'),
  Save_Schedule: t('pages_data.Examination.Exam_Schedule.Save_Schedule'),
  Add_New_Exam_Schedule: t('pages_data.Examination.Exam_Schedule.Add_New_Exam_Schedule'),
  Update_Exam_Schedule: t('pages_data.Examination.Exam_Schedule.Update_Exam_Schedule'),
  Update_Schedule: t('pages_data.Examination.Exam_Schedule.Update_Schedule'),

  //Exam Result
  Exam_Result_Title: t('pages_data.Examination.Exam_Result.Exam_Result_Title'),
  Exam_Group: t('pages_data.Examination.Exam_Result.Exam_Group'),
  No_data_found_for_selected_criteria: t(
    'pages_data.Examination.Exam_Result.No_data_found_for_selected_criteria',
  ),

  //Design Admit Card
  Design_Admit_Card: t('pages_data.Examination.Design_Admit_Card.Design_Admit_Card'),
  Admit_Card_Template: t('pages_data.Examination.Design_Admit_Card.Admit_Card_Template'),
  Template_Name: t('pages_data.Examination.Design_Admit_Card.Template_Name'),
  School_Name: t('pages_data.Examination.Design_Admit_Card.School_Name'),
  School_Address: t('pages_data.Examination.Design_Admit_Card.School_Address'),
  School_Logo: t('pages_data.Examination.Design_Admit_Card.School_Logo'),
  Principal_Sign: t('pages_data.Examination.Design_Admit_Card.Principal_Sign'),
  Select_Class: t('pages_data.Examination.Design_Admit_Card.Select_Class'),
  Save_Template: t('pages_data.Examination.Design_Admit_Card.Save_Template'),
  Saved_Templates: t('pages_data.Examination.Design_Admit_Card.Saved_Templates'),
  Field_Visibility_Toggles: t('pages_data.Examination.Design_Admit_Card.Field_Visibility_Toggles'),
  Generate_Admit_Cards: t('pages_data.Examination.Design_Admit_Card.Generate_Admit_Cards'),
  Back_To_Designer: t('pages_data.Examination.Design_Admit_Card.Back_To_Designer'),
  Template: t('pages_data.Examination.Design_Admit_Card.Template'),
  Select_Class_And_Exam_Group_First: t(
    'pages_data.Examination.Design_Admit_Card.Select_Class_And_Exam_Group_First',
  ),
  Search_Student: t('pages_data.Examination.Design_Admit_Card.Search_Student'),
  Generate_Selected_Cards: t('pages_data.Examination.Design_Admit_Card.Generate_Selected_Cards'),
  Enter_Template_Name: t('pages_data.Examination.Design_Admit_Card.Enter_Template_Name'),
  Enter_School_Name: t('pages_data.Examination.Design_Admit_Card.Enter_School_Name'),
  Enter_School_Address: t('pages_data.Examination.Design_Admit_Card.Enter_School_Address'),

  //Print Admit Card
  Session: t('pages_data.Examination.Print_Admit_Card.Session'),
  Generating_Marksheets: t('pages_data.Examination.Print_Admit_Card.Generating_Marksheets'),
  Generate_Marksheet: t('pages_data.Examination.Print_Admit_Card.Generate_Marksheet'),

  //Design Marksheet
  Add_Marksheet: t('pages_data.Examination.Design_Marksheet.Add_Marksheet'),
  Body_Text: t('pages_data.Examination.Design_Marksheet.Body_Text'),
  Header_Image: t('pages_data.Examination.Design_Marksheet.Header_Image'),
  Left_Sign: t('pages_data.Examination.Design_Marksheet.Left_Sign'),
  Right_Sign: t('pages_data.Examination.Design_Marksheet.Right_Sign'),
  Middle_Sign: t('pages_data.Examination.Design_Marksheet.Middle_Sign'),
  Exam_Section: t('pages_data.Examination.Design_Marksheet.Exam_Section'),
  Remark: t('pages_data.Examination.Design_Marksheet.Remark'),
  Rank: t('pages_data.Examination.Design_Marksheet.Rank'),
  Division: t('pages_data.Examination.Design_Marksheet.Division'),
  Marksheet_List: t('pages_data.Examination.Design_Marksheet.Marksheet_List'),
  View_Marksheet: t('pages_data.Examination.Design_Marksheet.View_Marksheet'),
  Higher_Secondary_School_Certificat: t(
    'pages_data.Examination.Design_Marksheet.Higher_Secondary_School_Certificat',
  ),
  NUM: t('pages_data.Examination.Design_Marksheet.NUM'),
  XXXX: t('pages_data.Examination.Design_Marksheet.XXXX'),
  Certificated_That: t('pages_data.Examination.Design_Marksheet.Certificated_That'),
  Max_Marks: t('pages_data.Examination.Design_Marksheet.Max_Marks'),
  Min_Marks: t('pages_data.Examination.Design_Marksheet.Min_Marks'),
  Marks_Obtained: t('pages_data.Examination.Design_Marksheet.Marks_Obtained'),
  GRAND_TOTAL_IN_WORDS: t('pages_data.Examination.Design_Marksheet.GRAND_TOTAL_IN_WORDS'),
  TWO_HUNDRED_EIGHTY_FOUR: t('pages_data.Examination.Design_Marksheet.TWO_HUNDRED_EIGHTY_FOUR'),
  PASS_IN_SECOND_DIVISION: t('pages_data.Examination.Design_Marksheet.PASS_IN_SECOND_DIVISION'),
  RESULT: t('pages_data.Examination.Design_Marksheet.RESULT'),
  22_01_2023: t('pages_data.Examination.Design_Marksheet.22_01_2023'),
  English: t('pages_data.Examination.Design_Marksheet.English'),
  Hindi: t('pages_data.Examination.Design_Marksheet.Hindi'),
  Math: t('pages_data.Examination.Design_Marksheet.Math'),
  Good: t('pages_data.Examination.Design_Marksheet.Good'),
  Very_Good: t('pages_data.Examination.Design_Marksheet.Very_Good'),
  Excellent: t('pages_data.Examination.Design_Marksheet.Excellent'),
  Marksheet_Template: t('pages_data.Examination.Design_Marksheet.Marksheet_Template'),
  Design_Marksheet: t('pages_data.Examination.Design_Marksheet.Design_Marksheet'),
  Template_Settings: t('pages_data.Examination.Design_Marksheet.Template_Settings'),
  Student_Fields: t('pages_data.Examination.Design_Marksheet.Student_Fields'),
  Display_Options: t('pages_data.Examination.Design_Marksheet.Display_Options'),
  Templates: t('pages_data.Examination.Design_Marksheet.Templates'),
  School_Stamp: t('pages_data.Examination.Design_Marksheet.School_Stamp'),
  Principal_Signature: t('pages_data.Examination.Design_Marksheet.Principal_Signature'),

  //Marks Grade
  Add_Mark_Grade: t('pages_data.Examination.Marks_Grade.Add_Mark_Grade'),
  Percent_From: t('pages_data.Examination.Marks_Grade.Percent_From'),
  Percent_Upto: t('pages_data.Examination.Marks_Grade.Percent_Upto'),
  Grade_Point: t('pages_data.Examination.Marks_Grade.Grade_Point'),
  Grade_Name: t('pages_data.Examination.Marks_Grade.Grade_Name'),
  Edit_Mark_Grade: t('pages_data.Examination.Marks_Grade.Edit_Mark_Grade'),
  Grade_Table: t('pages_data.Examination.Marks_Grade.Grade_Table'),

  //Marks Division
  Add_Mark_Division: t('pages_data.Examination.Marks_Division.Add_Mark_Division'),
  Division_Name: t('pages_data.Examination.Marks_Division.Division_Name'),
  Division_List: t('pages_data.Examination.Marks_Division.Division_List'),

  //Attendance
  //Student Attendance
  Attendance_Date: t('pages_data.Attendance.Student_Attendance.Attendance_Date'),
  Save_Attendance: t('pages_data.Attendance.Student_Attendance.Save_Attendance'),
  Set_attendance_for_all_students_as: t(
    'pages_data.Attendance.Student_Attendance.Set_attendance_for_all_students_as',
  ),
  Present: t('pages_data.Attendance.Student_Attendance.Present'),
  All_Student_Present: t('pages_data.Attendance.Student_Attendance.All_Student_Present'),
  Late: t('pages_data.Attendance.Student_Attendance.Late'),
  Absent: t('pages_data.Attendance.Student_Attendance.Absent'),
  Holiday: t('pages_data.Attendance.Student_Attendance.Holiday'),
  Half_Day: t('pages_data.Attendance.Student_Attendance.Half_Day'),
  Attendance: t('pages_data.Attendance.Student_Attendance.Attendance'),
  Total_Days: t('pages_data.Attendance.Student_Attendance.Total_Days'),
  Overall_Attendance: t('pages_data.Attendance.Student_Attendance.Overall_Attendance'),
  Daily_Attendance: t('pages_data.Attendance.Student_Attendance.Daily_Attendance'),
  // Student_Attendance: t('pages_data.Attendance.Student_Attendance.Student_Attendance'),
  Add_Note: t('pages_data.Attendance.Student_Attendance.Add_Note'),
  resource: t('pages_data.Attendance.Student_Attendance.Source'),
  Button_Massage: t('pages_data.Attendance.Student_Attendance.Button_Massage'),
  Attendance_has_been_saved_Successfully: t(
    'pages_data.Attendance.Student_Attendance.Attendance_has_been_saved_Successfully',
  ),

  //Approve Leave
  Leave_Approval_Records: t('pages_data.Attendance.Approve_Leave.Leave_Approval_Records'),
  Approve_Leave: t('pages_data.Attendance.Approve_Leave.Approve_Leave'),
  From_Date: t('pages_data.Attendance.Approve_Leave.From_Date'),
  Apply_Date: t('pages_data.Attendance.Approve_Leave.Apply_Date'),
  To_Date: t('pages_data.Attendance.Approve_Leave.To_Date'),
  // Reason: t('pages_data.Attendance.Approve_Leave.Reason'),
  Leave_Status: t('pages_data.Attendance.Approve_Leave.Leave_Status'),
  Pending: t('pages_data.Attendance.Approve_Leave.Pending'),
  Approved: t('pages_data.Attendance.Approve_Leave.Approved'),
  Rejected: t('pages_data.Attendance.Approve_Leave.Rejected'),
  Add_Leave: t('pages_data.Attendance.Approve_Leave.Add_Leave'),

  //Attendance By Date
  Edit_Attendance: t('pages_data.Attendance.Attendance_By_Date.Edit_Attendance'),
  Student_Attendance: t('pages_data.Attendance.Attendance_By_Date.Student_Attendance'),

  //Academic
  //Class Time Table
  Teacher_Time_Table: t('pages_data.Academics.Class_Timetable.Teacher_Time_Table'),
  Monday: t('pages_data.Academics.Class_Timetable.Monday'),
  Tuesday: t('pages_data.Academics.Class_Timetable.Tuesday'),
  Wednesday: t('pages_data.Academics.Class_Timetable.Wednesday'),
  Thursday: t('pages_data.Academics.Class_Timetable.Thursday'),
  Friday: t('pages_data.Academics.Class_Timetable.Friday'),
  Saturday: t('pages_data.Academics.Class_Timetable.Saturday'),
  Not_Scheduled: t('pages_data.Academics.Class_Timetable.Not_Scheduled'),
  Teacher: t('pages_data.Academics.Class_Timetable.Teacher'),
  Room: t('pages_data.Academics.Class_Timetable.Room'),
  Add_Entry: t('pages_data.Academics.Class_Timetable.Add_Entry'),
  End_Time: t('pages_data.Academics.Class_Timetable.End_Time'),
  Search_Timetable: t('pages_data.Academics.Class_Timetable.Search_Timetable'),
  No_Classes: t('pages_data.Academics.Class_Timetable.No_Classes'),
  Weekly_Schedule: t('pages_data.Academics.Class_Timetable.Weekly_Schedule'),
  Search_By_Teacher_Name: t('pages_data.Academics.Class_Timetable.Search_By_Teacher_Name'),
  No_Timetable_Found_For_This_Teacher: t(
    'pages_data.Academics.Class_Timetable.No_Timetable_Found_For_This_Teacher',
  ),
  Teacher_Has_No_Assigned_Classes_Yet: t(
    'pages_data.Academics.Class_Timetable.Teacher_Has_No_Assigned_Classes_Yet',
  ),

  //Assign Class Teacher
  Assign_Class_Teacher_Title: t(
    'pages_data.Academics.Assign_Class_Teacher.Assign_Class_Teacher_Title',
  ),
  Class_Teacher: t('pages_data.Academics.Assign_Class_Teacher.Class_Teacher'),
  SHRIKANT: t('pages_data.Academics.Assign_Class_Teacher.SHRIKANT_9002'),
  Class_Teacher_List: t('pages_data.Academics.Assign_Class_Teacher.Class_Teacher_List'),
  Update_Class_Teacher: t('pages_data.Academics.Assign_Class_Teacher.Update_Class_Teacher'),

  //Marks Management
  // Subject_Marks: t('pages_data.Academics.Marks_Management.Subject_Marks'),
  Total_Scores: t('pages_data.Academics.Marks_Management.Total_Scores'),
  // Subject_Type: t('pages_data.Academics.Marks_Management.Subject_Type'),
  // Total_Marks: t('pages_data.Academics.Marks_Management.Total_Marks'),
  Obtain_Marks: t('pages_data.Academics.Marks_Management.Obtain_Marks'),
  No_Marks_Found_For_This_Exam_Group: t(
    'pages_data.Academics.Marks_Management.No_Marks_Found_For_This_Exam_Group',
  ),
  Marks_Already_Exist_For_This_Exam_Group: t(
    'pages_data.Academics.Marks_Management.Marks_Already_Exist_For_This_Exam_Group',
  ),
  Student_Has_Marks_In_Exam_Groups: t(
    'pages_data.Academics.Marks_Management.Student_Has_Marks_In_Exam_Groups',
  ),
  Save_Marks: t('pages_data.Academics.Marks_Management.Save_Marks'),
  View_Marks: t('pages_data.Academics.Marks_Management.View_Marks'),
  Update_Marks: t('pages_data.Academics.Marks_Management.Update_Marks'),
  No_Exam_Groups_Available_For_Selected_Class: t(
    'pages_data.Academics.Marks_Management.No_Exam_Groups_Available_For_Selected_Class',
  ),
  No_Marks_Data_Available_For_This_Student: t(
    'pages_data.Academics.Marks_Management.No_Marks_Data_Available_For_This_Student',
  ),

  //Promote Student
  Promote_Students_In_Next_Session: t(
    'pages_data.Academics.Promote_Student.Promote_Students_In_Next_Session',
  ),
  Promote_In_Session: t('pages_data.Academics.Promote_Student.Promote_In_Session'),
  Current_Result: t('pages_data.Academics.Promote_Student.Current_Result'),
  Next_Session_Status: t('pages_data.Academics.Promote_Student.Next_Session_Status'),
  Pass: t('pages_data.Academics.Promote_Student.Pass'),
  Fail: t('pages_data.Academics.Promote_Student.Fail'),
  Continue: t('pages_data.Academics.Promote_Student.Continue'),
  Leave: t('pages_data.Academics.Promote_Student.Leave'),
  Promote: t('pages_data.Academics.Promote_Student.Promote'),
  Are_you_sure_you_want_to_promote_the_selected_students: t(
    'pages_data.Academics.Promote_Student.Are_you_sure_you_want_to_promote_the_selected_students',
  ),
  Promote_Confirmation: t('pages_data.Academics.Promote_Student.Promote_Confirmation'),

  Promote_Students: t('pages_data.Academics.Promote_Student.Promote_Students'),
  Current_Class: t('pages_data.Academics.Promote_Student.Current_Class'),
  Current_Section: t('pages_data.Academics.Promote_Student.Current_Section'),
  Student_Promotion: t('pages_data.Academics.Promote_Student.Student_Promotion'),
  Search_Students_For_Promotion: t(
    'pages_data.Academics.Promote_Student.Search_Students_For_Promotion',
  ),
  Continuing: t('pages_data.Academics.Promote_Student.Continuing'),
  Leaving: t('pages_data.Academics.Promote_Student.Leaving'),
  Passed: t('pages_data.Academics.Promote_Student.Passed'),
  Promotion_Details: t('pages_data.Academics.Promote_Student.Promotion_Details'),
  For_Continuing_Students_Only: t(
    'pages_data.Academics.Promote_Student.For_Continuing_Students_Only',
  ),
  Promote_To_Session: t('pages_data.Academics.Promote_Student.Promote_To_Session'),
  Promote_To_Class: t('pages_data.Academics.Promote_Student.Promote_To_Class'),
  Promote_To_Section: t('pages_data.Academics.Promote_Student.Promote_To_Section'),
  Select_Class_First_For_Fee_Types: t(
    'pages_data.Academics.Promote_Student.Select_Class_First_For_Fee_Types',
  ),
  Due_Fees_Forward_On_Message: t(
    'pages_data.Academics.Promote_Student.Due_Fees_Forward_On_Message',
  ),
  No_Fee_Types_Selected: t('pages_data.Academics.Promote_Student.No_Fee_Types_Selected'),
  Forward_Due_Fees: t('pages_data.Academics.Promote_Student.Forward_Due_Fees'),
  Add_Pending_Fees_From_Previous_Session: t(
    'pages_data.Academics.Promote_Student.Add_Pending_Fees_From_Previous_Session',
  ),
  Confirm_Promotion: t('pages_data.Academics.Promote_Student.Confirm_Promotion'),
  Confirm_Promotion_Message: t('pages_data.Academics.Promote_Student.Confirm_Promotion_Message'),
  Promoting_To: t('pages_data.Academics.Promote_Student.Promoting_To'),
  Continuing_Students: t('pages_data.Academics.Promote_Student.Continuing_Students'),
  Leaving_Students: t('pages_data.Academics.Promote_Student.Leaving_Students'),

  //Subject Group
  Add_Subject_Group: t('pages_data.Academics.Subject_Group.Add_Subject_Group'),
  Kannada: t('pages_data.Academics.Subject_Group.Kannada'),
  Social: t('pages_data.Academics.Subject_Group.Social'),
  Maths: t('pages_data.Academics.Subject_Group.Maths'),
  Social_Science: t('pages_data.Academics.Subject_Group.Social_Science'),
  Computer: t('pages_data.Academics.Subject_Group.Computer'),
  Science: t('pages_data.Academics.Subject_Group.Science'),
  Subject_Group_List: t('pages_data.Academics.Subject_Group.Subject_Group_List'),
  Edit_Subject_Group: t('pages_data.Academics.Subject_Group.Edit_Subject_Group'),
  Search_By_Group_Name: t('pages_data.Academics.Subject_Group.Search_By_Group_Name'),
  Enter_Subject_Group: t('pages_data.Academics.Subject_Group.Enter_Subject_Group'),
  Subjects_Selected: t('pages_data.Academics.Subject_Group.Subjects_Selected'),

  //Subject
  Add_Subject: t('pages_data.Academics.Subjects.Add_Subject'),
  Subject_List: t('pages_data.Academics.Subjects.Subject_List'),
  Subject_Name: t('pages_data.Academics.Subjects.Subject_Name'),
  Subject_Type: t('pages_data.Academics.Subjects.Subject_Type'),
  Subject_Code: t('pages_data.Academics.Subjects.Subject_Code'),
  Edit_Subject: t('pages_data.Academics.Subjects.Edit_Subject'),
  Theory: t('pages_data.Academics.Subjects.Theory'),
  Practical: t('pages_data.Academics.Subjects.Practical'),
  Subject_Name_placeholder: t('pages_data.Academics.Subjects.Subject_Name_placeholder'),
  Subject_Code_placeholder: t('pages_data.Academics.Subjects.Subject_Code_placeholder'),

  //Class
  Add_Class: t('pages_data.Academics.Class.Add_Class'),
  Class_List: t('pages_data.Academics.Class.Class_List'),
  Edit_Class: t('pages_data.Academics.Class.Edit_Class'),
  Enter_Class_Name: t('pages_data.Academics.Class.Enter_Class_Name'),
  Enter_Department_Name: t('pages_data.Academics.Class.Enter_Department_Name'),

  //Section
  Add_Section: t('pages_data.Academics.Section.Add_Section'),
  // Section: t('pages_data.Academics.Section.Section'),
  Section_Name: t('pages_data.Academics.Section.Section_Name'),
  Section_List: t('pages_data.Academics.Section.Section_List'),
  Edit_Section: t('pages_data.Academics.Section.Edit_Section'),
  Section_Name_placeholder: t('pages_data.Academics.Section.Section_Name_placeholder'),

  //Online Examinaction
  //Online Exam
  Online_Exam_List: t('pages_data.Online_Examination.Online_Exam.Online_Exam_List'),
  Upcoming_Exams: t('pages_data.Online_Examination.Online_Exam.Upcoming_Exams'),
  Closed_Exams: t('pages_data.Online_Examination.Online_Exam.Closed_Exams'),
  Online_Exams: t('pages_data.Online_Examination.Online_Exam.Online_Exams'),
  Quiz: t('pages_data.Online_Examination.Online_Exam.Quiz'),
  Questions: t('pages_data.Online_Examination.Online_Exam.Questions'),
  Attempt: t('pages_data.Online_Examination.Online_Exam.Attempt'),
  Exam_From: t('pages_data.Online_Examination.Online_Exam.Exam_From'),
  Exam_To: t('pages_data.Online_Examination.Online_Exam.Exam_To'),
  Exam_Published: t('pages_data.Online_Examination.Online_Exam.Exam_Published'),
  Result_Published: t('pages_data.Online_Examination.Online_Exam.Result_Published'),
  Add_Exam: t('pages_data.Online_Examination.Online_Exam.Add_Exam'),
  Total_Marks: t('pages_data.Online_Examination.Online_Exam.Total_Marks'),

  //Question Bank
  Question_Bank: t('pages_data.Online_Examination.QuestionBank.Question_Bank'),
  Question_Type: t('pages_data.Online_Examination.QuestionBank.Question_Type'),
  Level: t('pages_data.Online_Examination.QuestionBank.Level'),
  Created_By: t('pages_data.Online_Examination.QuestionBank.Created_By'),
  Question_Level: t('pages_data.Online_Examination.QuestionBank.Question_Level'),
  Add_Question: t('pages_data.Online_Examination.QuestionBank.Add_Question'),
  Edit_Question: t('pages_data.Online_Examination.QuestionBank.Edit_Question'),
  Import: t('pages_data.Online_Examination.QuestionBank.Import'),
  Upload: t('pages_data.Online_Examination.QuestionBank.Upload'),
  Question: t('pages_data.Online_Examination.QuestionBank.Question'),

  //Lesson Plan
  //COPY OLD LESSONS

  Subject_Group: t('pages_data.Lesson_Plan.COPY_OLD_LESSONS.Subject_Group'),


  //Manage Lesson Plan
  Manage_Lesson_Plan: t('pages_data.Lesson_Plan.Manage_Lesson_Plan.Manage_Lesson_PlanTitle'),
  Teachers: t('pages_data.Lesson_Plan.Manage_Lesson_Plan.Teachers'),

  //Manage Syllabus Status
  Syllabus_Records: t('pages_data.Lesson_Plan.Manage_Syllabus_Status.Syllabus_Records'),
  Topic: t('pages_data.Lesson_Plan.Manage_Syllabus_Status.Topic'),

  //Lesson
  Lesson_Management: t('pages_data.Lesson_Plan.Lesson.Lesson_Management'),
  Lesson_Name: t('pages_data.Lesson_Plan.Lesson.Lesson_Name'),
  Lesson: t('pages_data.Lesson_Plan.Lesson.Lesson'),
  Lesson_List: t('pages_data.Lesson_Plan.Lesson.Lesson_List'),
  Add_More: t('pages_data.Lesson_Plan.Lesson.Add_More'),
  Add_Lesson: t('pages_data.Lesson_Plan.Lesson.Add_Lesson'),
  Edit_Lesson: t('pages_data.Lesson_Plan.Lesson.Edit_Lesson'),

  //Topic
  Topic_Management: t('pages_data.Lesson_Plan.Topic.Topic_Management'),
  Topic_Name: t('pages_data.Lesson_Plan.Topic.Topic_Name'),
  Topic_List: t('pages_data.Lesson_Plan.Topic.Topic_List'),
  Add_Topic: t('pages_data.Lesson_Plan.Topic.Add_Topic'),
  Edit_Topic: t('pages_data.Lesson_Plan.Topic.Edit_Topic'),
  Topics: t('pages_data.Lesson_Plan.Topic.Topics'),

  //Human Resources
  //Staff Directory
  No_Leave_Requests_Found: t('pages_data.Human_Resource.Staff_Directory.No_Leave_Requests_Found'),
  No_Staff_Members_Found: t('pages_data.Human_Resource.Staff_Directory.No_Staff_Members_Found'),
  No_Staff_Members_Available: t('pages_data.Human_Resource.Staff_Directory.No_Staff_Members_Available'),
  Try_Adjusting_Search_Criteria: t('pages_data.Human_Resource.Staff_Directory.Try_Adjusting_Search_Criteria'),
  Error_loading_staff: t('pages_data.Human_Resource.Staff_Directory.Error_loading_staff'),
  Next: t('pages_data.Human_Resource.Staff_Directory.Next'),
  Keyword: t('pages_data.Human_Resource.Staff_Directory.Keyword'),
  Admin: t('pages_data.Human_Resource.Staff_Directory.Admin'),
  Add_Pluse: t('pages_data.Human_Resource.Staff_Directory.Add_pluse'),
  Card_View: t('pages_data.Human_Resource.Staff_Directory.Card_View'),
  Staff: t('pages_data.Human_Resource.Staff_Directory.Staff'),
  Edit_Staff: t('pages_data.Human_Resource.Staff_Directory.Edit_Staff'),
  No_Matching_Staff_Found: t('pages_data.Human_Resource.Staff_Directory.No_matching_staff_found.'),
  Search_By_Name_or_ID: t('pages_data.Human_Resource.Staff_Directory.Search_By_Name_or_ID'),
  Address_Details: t('pages_data.Human_Resource.Staff_Directory.Address_Details'),
  URL: t('pages_data.Human_Resource.Staff_Directory.URL'),
  total_net_salary_paid: t('pages_data.Human_Resource.Staff_Directory.total_net_salary_paid'),
  total_Gross_salary: t('pages_data.Human_Resource.Staff_Directory.total_Gross_salary'),
  total_Earning: t('pages_data.Human_Resource.Staff_Directory.total_Earning'),
  total_Deduction: t('pages_data.Human_Resource.Staff_Directory.total_Deduction'),
  PaySlip: t('pages_data.Human_Resource.Staff_Directory.PaySlip'),
  Month_Year: t('pages_data.Human_Resource.Staff_Directory.Month_Year'),
  Net_salary: t('pages_data.Human_Resource.Staff_Directory.Net_salary'),
  Submitted_Data: t('pages_data.Human_Resource.Staff_Directory.Submitted_Data'),
  Field: t('pages_data.Human_Resource.Staff_Directory.Field'),
  Value: t('pages_data.Human_Resource.Staff_Directory.Value'),
  Super_Admin: t('pages_data.Human_Resource.Staff_Directory.Super_Admin'),
  StaffID: t('pages_data.Human_Resource.Staff_Directory.StaffID'),
  View: t('pages_data.Human_Resource.Staff_Directory.View'),
  Staff_Name: t('pages_data.Human_Resource.Staff_Directory.Staff_Name'),
  Applied_Date: t('pages_data.Human_Resource.Staff_Directory.Applied_Date'),
  Available: t('pages_data.Human_Resource.Staff_Directory.Available'),
  Used: t('pages_data.Human_Resource.Staff_Directory.Used'),
  CL: t('pages_data.Human_Resource.Staff_Directory.CL'),
  Add_New_Staff_Member: t('pages_data.Human_Resource.Staff_Directory.Add_New_Staff_Member'),
  Fill_In_The_Information_Below_To_Add_A_New_Staff_Member: t(
    'pages_data.Human_Resource.Staff_Directory.Fill_In_The_Information_Below_To_Add_A_New_Staff_Member',
  ),
  Enter_First_Name: t('pages_data.Human_Resource.Staff_Directory.Enter_First_Name'),
  Enter_Last_Name: t('pages_data.Human_Resource.Staff_Directory.Enter_Last_Name'),
  Enter_Father_Name: t('pages_data.Human_Resource.Staff_Directory.Enter_Father_Name'),
  Enter_Mother_Name: t('pages_data.Human_Resource.Staff_Directory.Enter_Mother_Name'),
  Enter_Phone_Number: t('pages_data.Human_Resource.Staff_Directory.Enter_Phone_Number'),
  Enter_Emergency_Contact_Number: t(
    'pages_data.Human_Resource.Staff_Directory.Enter_Emergency_Contact_Number',
  ),
  Enter_Qualiication: t('pages_data.Human_Resource.Staff_Directory.Enter_Qualiication'),
  Enter_Work_Experience: t('pages_data.Human_Resource.Staff_Directory.Enter_Work_Experience'),
  Profile_Picture: t('pages_data.Human_Resource.Staff_Directory.Profile_Picture'),
  No_File_Chosen: t('pages_data.Human_Resource.Staff_Directory.No_File_Chosen'),
  Employment_Type: t('pages_data.Human_Resource.Staff_Directory.Employment_Type'),
  Enter_Basic_Salary: t('pages_data.Human_Resource.Staff_Directory.Enter_Basic_Salary'),
  Enter_Work_Location: t('pages_data.Human_Resource.Staff_Directory.Enter_Work_Location'),
  Sick_Leaves: t('pages_data.Human_Resource.Staff_Directory.Sick_Leaves'),
  Casual_Leaves: t('pages_data.Human_Resource.Staff_Directory.Casual_Leaves'),
  Maternity_Leaves: t('pages_data.Human_Resource.Staff_Directory.Maternity_Leaves'),
  Annual_Leaves: t('pages_data.Human_Resource.Staff_Directory.Annual_Leaves'),
  Enter_Bank_Name: t('pages_data.Human_Resource.Staff_Directory.Enter_Bank_Name'),
  Enter_Branch_Name: t('pages_data.Human_Resource.Staff_Directory.Enter_Branch_Name'),
  Enter_Account_Number: t('pages_data.Human_Resource.Staff_Directory.Enter_Account_Number'),
  Re_Enter_Account_Number: t('pages_data.Human_Resource.Staff_Directory.Re_Enter_Account_Number'),
  Enter_11_Digit_IFSC: t('pages_data.Human_Resource.Staff_Directory.Enter_11_Digit_IFSC'),
  Resume: t('pages_data.Human_Resource.Staff_Directory.Resume'),
  Joining_Letter: t('pages_data.Human_Resource.Staff_Directory.Joining_Letter'),
  Other_Document: t('pages_data.Human_Resource.Staff_Directory.Other_Document'),
  Confirm_Account_Number: t('pages_data.Human_Resource.Staff_Directory.Confirm_Account_Number'),
  Edit_Staff_Member: t('pages_data.Human_Resource.Staff_Directory.Edit_Staff_Member'),
  Update_The_Information_Below_To_Modify_Staff_Details: t(
    'pages_data.Human_Resource.Staff_Directory.Update_The_Information_Below_To_Modify_Staff_Details',
  ),

  //Staff View
  Profile: t('pages_data.Human_Resource.Staff_View.Profile'),
  Staff_Documents: t('pages_data.Human_Resource.Staff_View.Staff_Documents'),
  Social_Media_Links: t('pages_data.Human_Resource.Staff_View.Social_Media_Links'),
  Per_Monthly_Salary: t('pages_data.Human_Resource.Staff_View.Per_Monthly_Salary'),
  Contract_Status: t('pages_data.Human_Resource.Staff_View.Contract_Status'),
  Usage: t('pages_data.Human_Resource.Staff_View.Usage'),
  No_Of_Remaining_Leaves: t('pages_data.Human_Resource.Staff_View.No_Of_Remaining_Leaves'),
  Low_Balance: t('pages_data.Human_Resource.Staff_View.Low_Balance'),
  Leave_Summary: t('pages_data.Human_Resource.Staff_View.Leave_Summary'),
  Total_Assigned: t('pages_data.Human_Resource.Staff_View.Total_Assigned'),
  Total_Used: t('pages_data.Human_Resource.Staff_View.Total_Used'),
  Total_Available: t('pages_data.Human_Resource.Staff_View.Total_Available'),
  Overall_Usage: t('pages_data.Human_Resource.Staff_View.Overall_Usage'),
  UnableToLoadStaffInformation: t('pages_data.Human_Resource.Staff_View.UnableToLoadStaffInformation'),
  ErrorLoadingData: t('pages_data.Human_Resource.Staff_View.ErrorLoadingData'),

  //Staff Attendance
  Staff_List: t('pages_data.Human_Resource.Staff_Attendance.Staff_List'),
  Set_attendance_for_all_Staff_as: t(
    'pages_data.Human_Resource.Staff_Attendance.Set_attendance_for_all_Staff_as',
  ),
  Staff_ID: t('pages_data.Human_Resource.Staff_Attendance.Staff_ID'),
  Are_you_sure_to_mark_as: t('pages_data.Human_Resource.Staff_Attendance.Are_you_sure_to_mark_as'),
  Are_you_sure_to_mark_all_as: t(
    'pages_data.Human_Resource.Staff_Attendance.Are_you_sure_to_mark_all_as',
  ),

  //Payroll
  Month: t('pages_data.Human_Resource.Payroll.Month'),
  Year: t('pages_data.Human_Resource.Payroll.Year'),

  //Apply Leave Request
  Approve_Leave_Request: t('pages_data.Human_Resource.ApplyLeaveRequest.Approve_Leave_Request'),
  Leave_Type: t('pages_data.Human_Resource.ApplyLeaveRequest.Leave_Type'),
  Add_Leave_Request: t('pages_data.Human_Resource.ApplyLeaveRequest.Add_Leave_Request'),
  Leave_Dates: t('pages_data.Human_Resource.ApplyLeaveRequest.Leave_Dates'),
  View_Leave: t('pages_data.Human_Resource.ApplyLeaveRequest.View_Leave'),
  Search_By_Staff_Name_Or_Status: t(
    'pages_data.Human_Resource.ApplyLeaveRequest.Search_By_Staff_Name_Or_Status',
  ),
  Total_Requests: t('pages_data.Human_Resource.ApplyLeaveRequest.Total_Requests'),
  // Staff_Code: t('pages_data.Human_Resource.ApplyLeaveRequest.Staff_Code'),
  Approve: t('pages_data.Human_Resource.ApplyLeaveRequest.Approve'),
  Reject: t('pages_data.Human_Resource.ApplyLeaveRequest.Reject'),

  //Apply Leave
  Apply_Leave_r: t('pages_data.Human_Resource.Apply_Leave.Apply_Leave_r'),
  Apply_Leave: t('pages_data.Human_Resource.Apply_Leave.Apply_Leave'),
  Apply_For_Leave: t('pages_data.Human_Resource.Apply_Leave.Apply_For_Leave'),
  Select_Staff: t('pages_data.Human_Resource.Apply_Leave.Select_Staff'),
  Leave_Days: t('pages_data.Human_Resource.Apply_Leave.Leave_Days'),
  Enter_Reason: t('pages_data.Human_Resource.Apply_Leave.Enter_Reason'),
  Apply: t('pages_data.Human_Resource.Apply_Leave.Apply'),
  Leave_Requests: t('pages_data.Human_Resource.Apply_Leave.Leave_Requests'),

  //Leave Type
  Add_Leave_Type: t('pages_data.Human_Resource.Leave_Type.Add_Leave_Type'),
  Leave_Type_List: t('pages_data.Human_Resource.Leave_Type.Leave_Type_List'),
  Edit_Leave_Type: t('pages_data.Human_Resource.Leave_Type.Edit_Leave_Type'),

  //Teachers Ratings
  Teachers_Rating_List: t('pages_data.Human_Resource.Teachers_Ratings.Teachers_Rating_List'),
  Rating: t('pages_data.Human_Resource.Teachers_Ratings.Rating'),
  Comment: t('pages_data.Human_Resource.Teachers_Ratings.Comment'),

  //Department
  Add_Department: t('pages_data.Human_Resource.Department.Add_Department'),
  Department_Code: t('pages_data.Human_Resource.Department.Department_Code'),
  Department_Placeholder: t('pages_data.Human_Resource.Department.Department_Placeholder'),
  Department_List: t('pages_data.Human_Resource.Department.Department_List'),
  Edit_Department: t('pages_data.Human_Resource.Department.Edit_Department'),
  Department_Name: t('pages_data.Human_Resource.Department.Department_Name'),

  //Designation
  Add_Designation: t('pages_data.Human_Resource.Designation.Add_Designation'),
  Designation_List: t('pages_data.Human_Resource.Designation.Designation_List'),
  Designation_Name: t('pages_data.Human_Resource.Designation.Designation_Name'),
  Designation_Placeholder: t('pages_data.Human_Resource.Designation.Designation_Placeholder'),
  Edit_Designation: t('pages_data.Human_Resource.Designation.Edit_Designation'),

  //Homework
  //Add Homework

  Daily_Homework_List: t('pages_data.Homework.Add_Homework.Daily_Homework_List'),
  Add_Homework: t('pages_data.Homework.Add_Homework.Add_Homework'),
  Edit_Homework: t('pages_data.Homework.Add_Homework.Edit_Homework'),
  Upcoming_Homework: t('pages_data.Homework.Add_Homework.Upcoming_Homework'),
  Closed_Homework: t('pages_data.Homework.Add_Homework.Closed_Homework'),
  Homework_List: t('pages_data.Homework.Add_Homework.Homework_List'),
  Homework_Date: t('pages_data.Homework.Add_Homework.Homework_Date'),
  Submission_Date: t('pages_data.Homework.Add_Homework.Submission_Date'),
  Evaluation_Date: t('pages_data.Homework.Add_Homework.Evaluation_Date'),
  Assigned_Date: t('pages_data.Homework.Add_Homework.Assigned_Date'),
  Leave_Empty_To_Keep_Existing_File: t('pages_data.Homework.Add_Homework.Leave_Empty_To_Keep_Existing_File'),
  Current_File: t('pages_data.Homework.Add_Homework.Current_File'),
  Enter_Title: t('pages_data.Homework.Add_Homework.Enter_Title'),
  Assignment_Details: t('pages_data.Homework.Add_Homework.Assignment_Details'),
  Download_Attachment: t('pages_data.Homework.Add_Homework.Download_Attachment'),
  Attachment: t('pages_data.Homework.Add_Homework.Attachment'),

  //Daily Assignment
  Daily_Assignment_List: t('pages_data.Homework.Daily_Assignment.Daily_Assignment_List'),
  Add_Assignment: t('pages_data.Homework.Daily_Assignment.Add_Assignment'),
  Edit_Assignment: t('pages_data.Homework.Daily_Assignment.Edit_Assignment'),
  Evaluation_By: t('pages_data.Homework.Daily_Assignment.Evaluation_By'),
  Title: t('pages_data.Homework.Daily_Assignment.Title'),

  //Transport
  //Fee Master
  Transport_Fees_Master: t('pages_data.Transport.Fee_Master.Transport_Fees_Master'),
  Copy_First_Fees_Details_For_All_Month: t(
    'pages_data.Transport.Fee_Master.Copy_First_Fees_Details_For_All_Month',
  ),
  April: t('pages_data.Transport.Fee_Master.April'),
  May: t('pages_data.Transport.Fee_Master.May'),
  June: t('pages_data.Transport.Fee_Master.June'),
  July: t('pages_data.Transport.Fee_Master.July'),
  August: t('pages_data.Transport.Fee_Master.August'),
  September: t('pages_data.Transport.Fee_Master.September'),
  October: t('pages_data.Transport.Fee_Master.October'),
  November: t('pages_data.Transport.Fee_Master.November'),
  December: t('pages_data.Transport.Fee_Master.December'),
  January: t('pages_data.Transport.Fee_Master.January'),
  February: t('pages_data.Transport.Fee_Master.February'),
  March: t('pages_data.Transport.Fee_Master.March'),

  //Pickup Point
  Pickup_Point_List: t('pages_data.Transport.Pickup_Points.Pickup_Point_List'),
  Add_New: t('pages_data.Transport.Pickup_Points.Add_New'),
  Pickup_Point_Name: t('pages_data.Transport.Pickup_Points.Pickup_Point_Name'),
  Latitude: t('pages_data.Transport.Pickup_Points.Latitude'),
  Longitude: t('pages_data.Transport.Pickup_Points.Longitude'),
  Add_Pickup_Point: t('pages_data.Transport.Pickup_Points.Add_Pickup_Point'),
  Edit_Pickup_Point: t('pages_data.Transport.Pickup_Points.Edit_Pickup_Point'),
  Enter_Pickup_Point_Name: t('pages_data.Transport.Pickup_Points.Enter_Pickup_Point_Name'),

  //Routes
  Create_Route: t('pages_data.Transport.Routes.Create_Route'),
  Route_Title: t('pages_data.Transport.Routes.Route_Title'),
  Enter_Route_Title: t('pages_data.Transport.Routes.Enter_Route_Title'),

  // vehicle
  Vehicle: t('pages_data.Transport.Vehicle.Vehicle'),
  Add_Vehicle: t('pages_data.Transport.Vehicle.Add_Vehicle'),
  Edit_Vehicle: t('pages_data.Transport.Vehicle.Edit_Vehicle'),
  Vehicle_Number: t('pages_data.Transport.Vehicle.Vehicle_Number'),
  Vehicle_Model: t('pages_data.Transport.Vehicle.Vehicle_Model'),
  Year_Made: t('pages_data.Transport.Vehicle.Year_Made'),
  Registration_Number: t('pages_data.Transport.Vehicle.Registration_Number'),
  Chassis_Number: t('pages_data.Transport.Vehicle.Chassis_Number'),
  Max_Seating_Capacity: t('pages_data.Transport.Vehicle.Max_Seating_Capacity'),
  Driver_Licence: t('pages_data.Transport.Vehicle.Driver_Licence'),
  Driver_Contact: t('pages_data.Transport.Vehicle.Driver_Contact'),
  Enter_Vehicle_Number: t('pages_data.Transport.Vehicle.Enter_Vehicle_Number'),
  Enter_Vehicle_Model: t('pages_data.Transport.Vehicle.Enter_Vehicle_Model'),
  Enter_Year_Made: t('pages_data.Transport.Vehicle.Enter_Year_Made'),
  Enter_Registration_Number: t('pages_data.Transport.Vehicle.Enter_Registration_Number'),
  Enter_Chassis_Number: t('pages_data.Transport.Vehicle.Enter_Chassis_Number'),
  Enter_Max_Seating_Capacity: t('pages_data.Transport.Vehicle.Enter_Max_Seating_Capacity'),
  Enter_Driver_Licence: t('pages_data.Transport.Vehicle.Enter_Driver_Licence'),
  Enter_Driver_Contact: t('pages_data.Transport.Vehicle.Enter_Driver_Contact'),
  Enter_Driver_Name: t('pages_data.Transport.Vehicle.Enter_Driver_Name'),
  // Attach_Document: t("pages_data.Transport.Vehicle.Attach_Document"),
  Aadhar_Number: t('pages_data.Transport.Vehicle.Aadhar_Number'),
  Vehicle_Details: t('pages_data.Transport.Vehicle.Vehicle_Details'),

  //Assign vehicle
  Assigned_Vehicles_Routes: t('pages_data.Transport.Assign_Vehicle.Assigned_Vehicles_Routes'),
  Route: t('pages_data.Transport.Assign_Vehicle.Route'),
  Assign_Vehicle: t('pages_data.Transport.Assign_Vehicle.Assign_Vehicle'),
  Assign_Vehicle_to_Route: t('pages_data.Transport.Assign_Vehicle.Assign_Vehicle_to_Route'),

  //Route_Pickup_Point
  Route_Pickup_Point: t('pages_data.Transport.Route_Pickup_Point.Route_Pickup_Point'),
  Monthly_Fees: t('pages_data.Transport.Route_Pickup_Point.Monthly_Fees'),
  Distance: t('pages_data.Transport.Route_Pickup_Point.Distance'),
  Pickup_Time: t('pages_data.Transport.Route_Pickup_Point.Pickup_Time'),
  // Total_Fees: t('pages_data.Transport.Route_Pickup_Point.Total_Fees'),
  Enter_Total_Fees: t('pages_data.Transport.Route_Pickup_Point.Enter_Total_Fees'),
  Enter_Distance: t('pages_data.Transport.Route_Pickup_Point.Enter_Distance'),
  Drop_Off_Time: t('pages_data.Transport.Route_Pickup_Point.Drop_Off_Time'),
  Search_Route_Or_Pickup_Point: t(
    'pages_data.Transport.Route_Pickup_Point.Search_Route_Or_Pickup_Point',
  ),

  //StudentTransportfees
  Transport_Fee_Records: t("pages_data.Transport.Student_Transport_Fees.Transport_Fee_Records"),
  Start_Date: t("pages_data.Transport.Student_Transport_Fees.Start_Date"),
  Student_Transport_Fees: t("pages_data.Transport.Student_Transport_Fees.Student_Transport_Fees"),
  Filter_Description: t("pages_data.Transport.Student_Transport_Fees.Filter_Description"),
  Total_Months: t("pages_data.Transport.Student_Transport_Fees.Total_Months"),
  Total_Fees_Auto: t("pages_data.Transport.Student_Transport_Fees.Total_Fees_Auto"),
  Pending_Auto: t("pages_data.Transport.Student_Transport_Fees.Pending_Auto"),
  Monthly_Fee_Calculated_Message: t("pages_data.Transport.Student_Transport_Fees.Monthly_Fee_Calculated_Message"),
  Add_Transport_Fees: t("pages_data.Transport.Student_Transport_Fees.Add_Transport_Fees"),
  Search_Students_Transport_Fees: t("pages_data.Transport.Student_Transport_Fees.Search_Students_Transport_Fees"),
  View_Transport_Fees: t("pages_data.Transport.Student_Transport_Fees.View_Transport_Fees"),
  Transport_Assignment: t("pages_data.Transport.Student_Transport_Fees.Transport_Assignment"),
  Edit_Transport_Fees: t("pages_data.Transport.Student_Transport_Fees.Edit_Transport_Fees"),
  Max_payable: t("pages_data.Transport.Student_Transport_Fees.Max_payable"),
  Enter_amount_to_pay: t("pages_data.Transport.Student_Transport_Fees.Enter_amount_to_pay"),
  Payment_Amount: t("pages_data.Transport.Student_Transport_Fees.Payment_Amount"),
  Record_Payment: t("pages_data.Transport.Student_Transport_Fees.Record_Payment"),
  Route_pickup_point_not_configured: t("pages_data.Transport.Student_Transport_Fees.Route_pickup_point_not_configured"),
  Monthly_fee_calculated_from_route_pickup_point_configuration: t("pages_data.Transport.Student_Transport_Fees.Monthly_fee_calculated_from_route_pickup_point_configuration"),
  Click_Edit_Transport_FeesToAdd_Fees: t("pages_data.Transport.Student_Transport_Fees.Click_Edit_Transport_FeesToAdd_Fees"),
  Searching_Students: t("pages_data.Transport.Student_Transport_Fees.Searching_Students"),
  No_Sections_Available: t("pages_data.Transport.Student_Transport_Fees.No_Sections_Available"),
  Search_students_to_assign_or_update_their_transport_fees: t("pages_data.Transport.Student_Transport_Fees.Search_students_to_assign_or_update_their_transport_fees"),
  No_Transport_Fees_Assigned: t("pages_data.Transport.Student_Transport_Fees.No_Transport_Fees_Assigned"),
  View_and_manage_transport_fee_records_for_students: t("pages_data.Transport.Student_Transport_Fees.View_and_manage_transport_fee_records_for_students"),
  All_Routes: t("pages_data.Transport.Student_Transport_Fees.All_Routes"),
  Select_a_route_first: t("pages_data.Transport.Student_Transport_Fees.Select_a_route_first"),
  No_pickup_points_for_this_route: t("pages_data.Transport.Student_Transport_Fees.No_pickup_points_for_this_route"),
  All_Pickup_Points: t("pages_data.Transport.Student_Transport_Fees.All_Pickup_Points"),
  All_Classes: t("pages_data.Transport.Student_Transport_Fees.All_Classes"),
  Loading_transport_fee_records: t("pages_data.Transport.Student_Transport_Fees.Loading_transport_fee_records"),
  No_transport_fee_records_match_the_selected_filters: t("pages_data.Transport.Student_Transport_Fees.No_transport_fee_records_match_the_selected_filters"),
  No_transport_fee_records_found: t("pages_data.Transport.Student_Transport_Fees.No_transport_fee_records_found"),

  //hostel
  //hostelRooms
  Add_Hostel_Room: t("pages_data.Hostel.Hostel_Rooms.Add_Hostel_Room"),
  Edit_Hostel_Room: t("pages_data.Hostel.Hostel_Rooms.Edit_Hostel_Room"),
  Room_Type: t("pages_data.Hostel.Hostel_Rooms.Room_Type"),
  Number_Of_Bed: t("pages_data.Hostel.Hostel_Rooms.Number_Of_Bed"),
  Cost_Per_Bed: t("pages_data.Hostel.Hostel_Rooms.Cost_Per_Bed"),
  Hostel_Room_List: t("pages_data.Hostel.Hostel_Rooms.Hostel_Room_List"),
  Search_By_Room_Or_Hostel: t("pages_data.Hostel.Hostel_Rooms.Search_By_Room_Or_Hostel"),
  Enter_Room_Number: t("pages_data.Hostel.Hostel_Rooms.Enter_Room_Number"),
  Enter_No_Of_Beds: t("pages_data.Hostel.Hostel_Rooms.Enter_No_Of_Beds"),
  Enter_Cost_Per_Bed: t("pages_data.Hostel.Hostel_Rooms.Enter_Cost_Per_Bed"),

  //Room Type
  Add_Room_Type: t('pages_data.Hostel.Room_Type.Add_Room_Type'),
  Edit_Room_Type: t('pages_data.Hostel.Room_Type.Edit_Room_Type'),
  Room_Type_List: t('pages_data.Hostel.Room_Type.Room_Type_List'),

  //Hostel
  Add_Hostel: t("pages_data.Hostel.Hostel.Add_Hostel"),
  Update_Hostel: t("pages_data.Hostel.Hostel.Update_Hostel"),
  Hostel_Name: t("pages_data.Hostel.Hostel.Hostel_Name"),
  Type: t("pages_data.Hostel.Hostel.Type"),
  Intake: t("pages_data.Hostel.Hostel.Intake"),
  Hostel_List: t("pages_data.Hostel.Hostel.Hostel_List"),
  Enter_Hostel_Name: t("pages_data.Hostel.Hostel.Enter_Hostel_Name"),
  Enter_Hostel_Type: t("pages_data.Hostel.Hostel.Enter_Hostel_Type"),
  Enter_Intake: t("pages_data.Hostel.Hostel.Enter_Intake"),

  // Student Hostel Allocation
  Student_Hostel_Allocations: t("pages_data.Hostel.Student Hostel Allocation.Student_Hostel_Allocations"),
  Room_Name: t("pages_data.Hostel.Student Hostel Allocation.Room_Name"),
  Search_Name_Or_Admission_No: t("pages_data.Hostel.Student Hostel Allocation.Search_Name_Or_Admission_No"),

  //Add Hostel Fee
  Checking_Bed_Availability: t("pages_data.Hostel.Add_Hostel_Fees.Checking_Bed_Availability"),
  Occupied: t("pages_data.Hostel.Add_Hostel_Fees.Occupied"),
  Student_Hostel_Fees: t("pages_data.Hostel.Add_Hostel_Fees.Student_Hostel_Fees"),
  Add_Hostel_Fees: t("pages_data.Hostel.Add_Hostel_Fees.Add_Hostel_Fees"),
  Edit_Hostel_Fees: t("pages_data.Hostel.Add_Hostel_Fees.Edit_Hostel_Fees"),
  View_Hostel_Fees: t("pages_data.Hostel.Add_Hostel_Fees.View_Hostel_Fees"),
  End_Date: t("pages_data.Hostel.Add_Hostel_Fees.End_Date"),

  //communicate
  //Notice Board
  Notice_Board: t('pages_data.communicate.Notice_Board.Notice_BoardTitle'),
  Post_New_Message: t('pages_data.communicate.Notice_Board.Post_New_Message'),
  Compose_New_Message: t('pages_data.communicate.Notice_Board.Compose_New_Message'),
  Message_To: t('pages_data.communicate.Notice_Board.Message_To'),
  Send_By: t('pages_data.communicate.Notice_Board.Send_By'),
  Notice_Date: t('pages_data.communicate.Notice_Board.Notice_Date'),
  Publish_On: t('pages_data.communicate.Notice_Board.Publish_On'),
  Message: t('pages_data.communicate.Notice_Board.Message'),
  Parent: t('pages_data.communicate.Notice_Board.Parent'),
  Accountant: t('pages_data.communicate.Notice_Board.Accountant'),
  Librarian: t('pages_data.communicate.Notice_Board.Librarian'),
  Receptionist: t('pages_data.communicate.Notice_Board.Receptionist'),
  Send: t('pages_data.communicate.Notice_Board.Send'),
  write_your_message_here: t('pages_data.communicate.Notice_Board.Write_Your_Message_Here'),
  SMS: t('pages_data.communicate.Notice_Board.SMS'),

  //Send Email
  Send_Email: t('pages_data.communicate.Send_Email.Send_Email'),
  Email_Template: t('pages_data.communicate.Send_Email.Email_Template'),
  Group: t('pages_data.communicate.Send_Email.Group'),
  Individual: t('pages_data.communicate.Send_Email.Individual'),
  Today_s_birthday: t('pages_data.communicate.Send_Email.Today_s_birthday'),
  Guardians: t('pages_data.communicate.Send_Email.Guardians'),
  HOD: t('pages_data.communicate.Send_Email.HOD'),
  Multi_Admin: t('pages_data.communicate.Send_Email.Multi_Admin'),
  Send_Now: t('pages_data.communicate.Send_Email.Send_Now'),
  Schedule: t('pages_data.communicate.Send_Email.Schedule'),
  Login_Credentials_Send: t('pages_data.communicate.Send_Email.Login_Credentials_Send'),

  //Send SMS
  Send_SMS: t('pages_data.communicate.Send_SMS.Send_SMS'),
  Search_By: t('pages_data.communicate.Send_SMS.Search_By'),
  Search_By_Student_Name: t('pages_data.communicate.Send_SMS.Search_By_Student_Name'),
  Get_Content: t('pages_data.communicate.Send_SMS.Get_Content'),
  Send_Through: t('pages_data.communicate.Send_SMS.Send_Through'),
  sms: t('pages_data.communicate.Send_SMS.sms'),
  Mobile_App: t('pages_data.communicate.Send_SMS.Mobile_App'),

  //Email_SMS Log
  Email_SMS_Log: t('pages_data.communicate.Email_SMS_Log.Email_SMS_Log'),

  //Schedule Email/SMS Log
  Schedule_Email_SMS_Log: t('pages_data.communicate.Schedule_Email_SMS_Log.Schedule_Email_SMS_Log'),
  Schedule_Date: t('pages_data.communicate.Schedule_Email_SMS_Log.Schedule_Date'),

  //Login Credentials Send
  Notification_Type: t('pages_data.communicate.Login_Credentials_Send.Notification_Type'),

  //Email Template
  Email_Template_List: t('pages_data.communicate.Email_Template.Email_Template_List'),
  Add_Email_Template: t('pages_data.communicate.Email_Template.Add_Email_Template'),
  Edit_Template: t('pages_data.communicate.Email_Template.Edit_Template'),

  //SMS Template
  SMS_Template_List: t('pages_data.communicate.SMS_Template.SMS_Template_List'),
  Add_SMS_Template: t('pages_data.communicate.SMS_Template.Add_SMS_Template'),

  //Front CMS
  //Gallery
  Gallery: t('pages_data.Front_CMS.Gallery.Gallery'),
  Gallery_List: t('pages_data.Front_CMS.Gallery.Gallery_List'),
  Add_New_Article: t('pages_data.Front_CMS.Gallery.Add_New_Article'),
  Edit_Article: t('pages_data.Front_CMS.Gallery.Edit_Article'),
  url: t('pages_data.Front_CMS.Gallery.url'),

  //News
  News: t('pages_data.Front_CMS.News.News'),
  News_List: t('pages_data.Front_CMS.News.News_List'),

  //MidiaManager
  Email_is_required: t('pages_data.Front_CMS.Media_Manager.Email_is_required'),
  Media_Manager: t('pages_data.Front_CMS.Media_Manager.Media_Manager'),
  Drag_And_Drop_File_Here_Or_Click: t(
    'pages_data.Front_CMS.Media_Manager.Drag_And_Drop_File_Here_Or_Click',
  ),
  Upload_YouTube_Video_Link: t('pages_data.Front_CMS.Media_Manager.Upload_YouTube_Video_Link'),
  Search_by_file_name: t('pages_data.Front_CMS.Media_Manager.Search_by_file_name'),
  Filter_By_File_Type: t('pages_data.Front_CMS.Media_Manager.Filter_By_File_Type'),
  Enter_Key_Words: t('pages_data.Front_CMS.Media_Manager.Enter_Key_Words'),
  Delete_Confirm: t('pages_data.Front_CMS.Media_Manager.Delete_Confirm'),
  Are_you_sure_you_want_to_delete: t(
    'pages_data.Front_CMS.Media_Manager.Are_you_sure_you_want_to_delete',
  ),
  Delete: t('pages_data.Front_CMS.Media_Manager.Delete'),

  //Pages
  Pages_List: t('pages_data.Front_CMS.Pages.Pages_List'),
  Add_New_Page: t('pages_data.Front_CMS.Pages.Add_New_Page'),
  Edit_Page: t('pages_data.Front_CMS.Pages.Edit_Page'),
  Page_Type: t('pages_data.Front_CMS.Pages.Page_Type'),

  //Menus
  Menu: t('pages_data.Front_CMS.Menus.Menu'),
  Add_Menu: t('pages_data.Front_CMS.Menus.Add_Menu'),
  Menu_List: t('pages_data.Front_CMS.Menus.Menu_List'),
  Edit_Menu: t('pages_data.Front_CMS.Menus.Edit_Menu'),

  //Banner Image
  Banner_Images: t('pages_data.Front_CMS.Banner_Image.Banner_Images'),
  Add_Images: t('pages_data.Front_CMS.Banner_Image.Add_Images'),
  Upload_File: t('pages_data.Front_CMS.Banner_Image.Upload_File'),
  Select_File: t('pages_data.Front_CMS.Banner_Image.Select_File'),

  //Alumni
  //Manage Alumni
  Pass_Out_Session: t('pages_data.Alumni.Manage_Alumni.Pass_Out_Session'),
  Name_Admission_No: t('pages_data.Alumni.Manage_Alumni.Name,_Admission_No'),
  Details_Exams: t('pages_data.Alumni.Manage_Alumni.Details_Exams'),

  //Role
  //Create Role

  Role_Management: t('pages_data.Role.Create_Role.Role_Management'),
  Role_Name: t('pages_data.Role.Create_Role.Role_Name'),
  Operations: t('pages_data.Role.Create_Role.Operations'),
  Edit_Role_And_Permissions: t('pages_data.Role.Create_Role.Edit_Role_And_Permissions'),
  Select_Scope: t('pages_data.Role.Create_Role.Select_Scope'),
  Enter_Role_Name: t('pages_data.Role.Create_Role.Enter_Role_Name'),
  Default_PROFILE_Permission_Added: t('pages_data.Role.Create_Role.Default_PROFILE_Permission_Added'),
  CRUD_Permissions: t('pages_data.Role.Create_Role.CRUD_Permissions'),
  Create_Role_And_Permissions: t('pages_data.Role.Create_Role.Create_Role_And_Permissions'),

  //Assign Role
  Assigning: t('pages_data.Role.Assign_Role.Assigning'),
  Read: t('pages_data.Role.Assign_Role.Read'),
  Create: t('pages_data.Role.Assign_Role.Create'),
  Scope: t('pages_data.Role.Assign_Role.Scope'),
  Current_Role: t('pages_data.Role.Assign_Role.Current_Role'),
  // Name: t('pages_data.Role.Assign_Role.Name'),
  Name_Email_Phone_Search: t('pages_data.Role.Assign_Role.Name_Email_Phone_Search'),
  Assign_Role: t('pages_data.Role.Assign_Role.Assign_Role'),
  Role_Title: t('pages_data.Role.Assign_Role.Role_Title'),
  Staff_Directory: t('pages_data.Role.Assign_Role.Staff_Directory'),

  //Events
  Event_List: t('pages_data.Alumni.Events.Event_List'),
  Add_New_Event: t('pages_data.Alumni.Events.Add_New_Event'),
  Edit_Event: t('pages_data.Alumni.Events.Edit_Event'),
  Class_Section: t('pages_data.Alumni.Events.Class_Section'),
  Events: t('pages_data.Alumni.Events.Events'),
  Event_Title: t('pages_data.Alumni.Events.Event_Title'),

  // Download Center - Content Type
  Add_Content_Type: t('pages_data.Download_Center.Content_Type.Add_Content_Type'),
  Edit_Content_Type: t('pages_data.Download_Center.Content_Type.Edit_Content_Type'),
  Content_Type_List: t('pages_data.Download_Center.Content_Type.Content_Type_List'),
  Enter_Content_Name: t('pages_data.Download_Center.Content_Type.Enter_Content_Name'),
  Enter_Content_Description: t('pages_data.Download_Center.Content_Type.Enter_Content_Description'),

  // Download Center - Content Share List
  Content_Share_List: t('pages_data.Download_Center.Content_Share_List.Content_Share_List'),
  Share_Date: t('pages_data.Download_Center.Content_Share_List.Share_Date'),
  Valid_Upto: t('pages_data.Download_Center.Content_Share_List.Valid_Upto'),
  Send_To: t('pages_data.Download_Center.Content_Share_List.Send_To'),
  Shared_By: t('pages_data.Download_Center.Content_Share_List.Shared_By'),

  // Download Center - Upload Share Content
  DC_Content_List: t('pages_data.Download_Center.Upload_Share_Content.Content_List'),
  DC_Size: t('pages_data.Download_Center.Upload_Share_Content.Size'),
  Content_Type: t('pages_data.Download_Center.Upload_Share_Content.Content_Type'),
  DC_Upload_By: t('pages_data.Download_Center.Upload_Share_Content.Upload_By'),
  DC_Created_On: t('pages_data.Download_Center.Upload_Share_Content.Created_On'),
  DC_Selected_File: t('pages_data.Download_Center.Upload_Share_Content.Selected_File'),
  Upload_Youtube_Video: t('pages_data.Download_Center.Upload_Share_Content.Upload_Youtube_Video'),
  Drag_And_Drop_File: t('pages_data.Download_Center.Upload_Share_Content.Drag_And_Drop_File'),
  Video: t('pages_data.Download_Center.Upload_Share_Content.Video'),
  Pdf: t('pages_data.Download_Center.Upload_Share_Content.Pdf'),
  Add_New_Content: t('pages_data.Download_Center.Upload_Share_Content.Add_New_Content'),
  Title_Of_The_Content: t('pages_data.Download_Center.Upload_Share_Content.Title_Of_The_Content'),
  YouTube_Link_Or_URL: t('pages_data.Download_Center.Upload_Share_Content.YouTube_Link_Or_URL'),
  Add_Description: t('pages_data.Download_Center.Upload_Share_Content.Add_Description'),
  Edit_Content: t('pages_data.Download_Center.Upload_Share_Content.Edit_Content'),
  // Enter_Title: t('pages_data.Download_Center.Upload_Share_Content.Enter_Title'),

  // Download Center - Video Tutorial
  Video_Tutorial_List: t('pages_data.Download_Center.Video_Tutorial.Video_Tutorial_List'),
  Search_By_Title: t('pages_data.Download_Center.Video_Tutorial.Search_By_Title'),
  VT_1_ST: t('pages_data.Download_Center.Video_Tutorial.1_ST'),
  VT_2_ND: t('pages_data.Download_Center.Video_Tutorial.2_ND'),
  VT_5_TH: t('pages_data.Download_Center.Video_Tutorial.5_TH'),
  VT_SSLC: t('pages_data.Download_Center.Video_Tutorial.SSLC'),
  VT_PUC_2nd: t('pages_data.Download_Center.Video_Tutorial.PUC_2nd'),
  Lesson_1: t('pages_data.Download_Center.Video_Tutorial.Lesson_1'),
  Lesson_2: t('pages_data.Download_Center.Video_Tutorial.Lesson_2'),
  Lesson_1_Intro: t('pages_data.Download_Center.Video_Tutorial.Lesson_1_Intro'),
  Lesson_2_Intro: t('pages_data.Download_Center.Video_Tutorial.Lesson_2_Intro'),
  Video_Preview: t('pages_data.Download_Center.Video_Tutorial.Video_Preview'),
  No_video_tutorials_found_for_the_applied_filters: t('pages_data.Download_Center.Video_Tutorial.No_video_tutorials_found_for_the_applied_filters'),
  No_video_tutorials_found: t('pages_data.Download_Center.Video_Tutorial.No_video_tutorials_found'),

  // ---------------------- Library ----------------------

  // Library - Book List

  Add_Book: t("pages_data.Library.Book_List.Add_Book"),
  Book_Title: t("pages_data.Library.Book_List.Book_Title"),
  Book_Number: t("pages_data.Library.Book_List.Book_Number"),
  ISBN_Number: t("pages_data.Library.Book_List.ISBN_Number"),
  Publisher: t("pages_data.Library.Book_List.Publisher"),
  Author: t("pages_data.Library.Book_List.Author"),
  Rack_Number: t("pages_data.Library.Book_List.Rack_Number"),
  Qty: t("pages_data.Library.Book_List.Qty"),
  Book_Price: t("pages_data.Library.Book_List.Book_Price"),
  Post_Date: t("pages_data.Library.Book_List.Post_Date"),
  Download_Sample_Import_File: t(
    "pages_data.Library.Book_List.Download_Sample_Import_File"
  ),
  Point_1: t("pages_data.Library.Book_List.Point_1"),
  Point_2: t("pages_data.Library.Book_List.Point_2"),
  Sample_Data: t("pages_data.Library.Book_List.Sample_Data"),
  Select_CSV_File: t("pages_data.Library.Book_List.Select_CSV_File"),
  Import_Book: t("pages_data.Library.Book_List.Import_Book"),
  Book_Lis: t("pages_data.Library.Book_List.Book_Lis"),
  Loading_student_library_data: t("pages_data.Library.Book_List.Loading_student_library_data"),
  Manage_your_library_book_collection: t("pages_data.Library.Book_List.Manage_your_library_book_collection"),
  Title_ISBN_Publisher_Author: t("pages_data.Library.Book_List.Title_ISBN_Publisher_Author"),
  Enter_Book_Price: t("pages_data.Library.Book_List.Enter_Book_Price"),
  Enter_Quantity: t("pages_data.Library.Book_List.Enter_Quantity"),
  Enter_Rack_Number: t("pages_data.Library.Book_List.Enter_Rack_Number"),
  Enter_Subject: t("pages_data.Library.Book_List.Enter_Subject"),
  Enter_Author: t("pages_data.Library.Book_List.Enter_Author"),
  Enter_Publisher: t("pages_data.Library.Book_List.Enter_Publisher"),
  Enter_ISBN_Number: t("pages_data.Library.Book_List.Enter_ISBN_Number"),
  Enter_Book_Number: t("pages_data.Library.Book_List.Enter_Book_Number"),
  Enter_Book_Title: t("pages_data.Library.Book_List.Enter_Book_Title"),


  // Library - Issue Return
  Members: t('pages_data.Library.Issue_Return.Members'),
  Member_Id: t('pages_data.Library.Issue_Return.Member_Id'),
  Library_Card_No: t('pages_data.Library.Issue_Return.Library_Card_No'),
  Member_Type: t('pages_data.Library.Issue_Return.Member_Type'),
  Submit_Status: t('pages_data.Library.Issue_Return.Submit_Status'),
  Issue_Status: t('pages_data.Library.Issue_Return.Issue_Status'),
  Issue_Status_will_be: t('pages_data.Library.Issue_Return.Issue_Status_will_be_updated_to_returned'),
  Filter_by_Member_Type: t('pages_data.Library.Issue_Return.Filter_by_Member_Type'),

  // Library - Add Student
  Add_Library_Card: t('pages_data.Library.Add_Student.Add_Library_Card'),
  Edit_Library_Card: t('pages_data.Library.Add_Student.Edit_Library_Card'),
  Enter_Library_Card_Number: t('pages_data.Library.Add_Student.Enter_Library_Card_Number'),
  Class_1: t('pages_data.Library.Add_Student.Class_1'),
  Class_2: t('pages_data.Library.Add_Student.Class_2'),
  Class_3: t('pages_data.Library.Add_Student.Class_3'),

  // Library - Add Staff Member
  Staff_Member_List: t('pages_data.Library.Add_Staff_Member.Staff_Member_List'),
  Issue_Item_List: t('pages_data.Inventory.Issue_Item.Issue_Item_List'),
  Item: t('pages_data.Inventory.Issue_Item.Item'),
  Issue_Return: t('pages_data.Inventory.Issue_Item.Issue_Return'),
  Issue_To: t('pages_data.Inventory.Issue_Item.Issue_To'),
  Issue_By: t('pages_data.Inventory.Issue_Item.Issue_By'),
  Quantity: t('pages_data.Inventory.Issue_Item.Quantity'),
  // status: t("pages_data.Inventory.Issue_Item.Status"),
  User_Type: t('pages_data.Inventory.Issue_Item.User_Type'),
  Issue_Date: t('pages_data.Inventory.Issue_Item.Issue_Date'),
  Return_Date: t('pages_data.Inventory.Issue_Item.Return_Date'),
  Inv_Table: t('pages_data.Inventory.Issue_Item.Table'),
  Inv_Computer: t('pages_data.Inventory.Issue_Item.Computer'),
  Inv_Projector: t('pages_data.Inventory.Issue_Item.Projector'),
  Inv_Other: t('pages_data.Inventory.Issue_Item.Other'),
  Item_Name_Issue_To: t('pages_data.Inventory.Issue_Item.Item_Name_Issue_To'),
  Enter_Note: t('pages_data.Inventory.Issue_Item.Enter_Note'),
  Enter_Issue_To: t('pages_data.Inventory.Issue_Item.Enter_Issue_To'),

  // Inventory – Add Item Stock
  Supplier: t('pages_data.Inventory.Add_Item_Stock.Supplier'),
  Supplier_1: t('pages_data.Inventory.Add_Item_Stock.Supplier_1'),
  Supplier_2: t('pages_data.Inventory.Add_Item_Stock.Supplier_2'),
  Store: t('pages_data.Inventory.Add_Item_Stock.Store'),
  Store_1: t('pages_data.Inventory.Add_Item_Stock.Store_1'),
  Store_2: t('pages_data.Inventory.Add_Item_Stock.Store_2'),
  Purchase_Price: t('pages_data.Inventory.Add_Item_Stock.Purchase_Price'),
  Item_Stock: t('pages_data.Inventory.Add_Item_Stock.Item_Stock'),
  Enter_Purchase_Price: t('pages_data.Inventory.Add_Item_Stock.Enter_Purchase_Price'),

  // Inventory – Add Item
  Unit: t('pages_data.Inventory.Add_Item.Unit'),
  Unit_1: t('pages_data.Inventory.Issue_Item.Unit_1'),
  Unit_2: t('pages_data.Inventory.Issue_Item.Unit_2'),
  Unit_3: t('pages_data.Inventory.Issue_Item.Unit_3'),
  Item_1_Data: t('pages_data.Inventory.Issue_Item.Item_1'),
  Item_2_Data: t('pages_data.Inventory.Issue_Item.Item_2'),
  Item_3_Data: t('pages_data.Inventory.Issue_Item.Item_3'),
  Category_1: t('pages_data.Inventory.Issue_Item.Category_1'),
  Category_2: t('pages_data.Inventory.Issue_Item.Category_2'),
  Category_3: t('pages_data.Inventory.Issue_Item.Category_3'),
  Item_List: t('pages_data.Inventory.Add_Item.Item_List'),
  Search_By_Item: t('pages_data.Inventory.Add_Item.Search_By_Item'),
  Enter_Item: t('pages_data.Inventory.Add_Item.Enter_Item'),
  Enter_Unit: t('pages_data.Inventory.Add_Item.Enter_Unit'),

  // Inventory – Item Category
  Add_Item_Category: t('pages_data.Inventory.Item_Category.Add_Item_Category'),
  Item_Category_List: t('pages_data.Inventory.Item_Category.Item_Category_List'),
  Enter_Item_Category: t('pages_data.Inventory.Item_Category.Enter_Item_Category'),
  // Inventory – Item Supplier
  Add_Item_Supplier: t('pages_data.Inventory.Item_Supplier.Add_Item_Supplier'),
  Contact_Person_Name: t('pages_data.Inventory.Item_Supplier.Contact_Person_Name'),
  Contact_Person_Phone: t('pages_data.Inventory.Item_Supplier.Contact_Person_Phone'),
  Contact_Person_Email: t('pages_data.Inventory.Item_Supplier.Contact_Person_Email'),
  Item_Supplier_List: t('pages_data.Inventory.Item_Supplier.Item_Supplier_List'),
  Supplier_Phone: t('pages_data.Inventory.Item_Supplier.Supplier_Phone'),
  Supplier_Email: t('pages_data.Inventory.Item_Supplier.Supplier_Email'),
  Enter_Email: t('pages_data.Inventory.Item_Supplier.Enter_Email'),
  Enter_Supplier_Name: t('pages_data.Inventory.Item_Supplier.Enter_Supplier_Name'),
  Supplier_Name: t('pages_data.Inventory.Item_Supplier.Supplier_Name'),

  // Inventory – Item Store
  Add_Item_Store: t('pages_data.Inventory.Item_Store.Add_Item_Store'),
  Item_Store_Name: t('pages_data.Inventory.Item_Store.Item_Store_Name'),
  Item_Store_Code: t('pages_data.Inventory.Item_Store.Item_Store_Code'),
  Item_Store_List: t('pages_data.Inventory.Item_Store.Item_Store_List'),
  Enter_Item_Store_Name: t('pages_data.Inventory.Item_Store.Enter_Item_Store_Name'),
  Enter_Item_Store_Code: t('pages_data.Inventory.Item_Store.Enter_Item_Store_Code'),

  //Certificates
  Staff_Signature: t('pages_data.Certificat.Staff_ID_Card.Signature'),
  Staff_Header_Color: t('pages_data.Certificat.Staff_ID_Card.Header Color'),
  Barcode_QRCode: t('pages_data.Certificat.Staff_ID_Card.Barcode_QRCode'),
  Staff_ID_Card_List: t('pages_data.Certificat.Staff_ID_Card.Staff_ID_Card _List'),

  Staff_Horizontal_ID_Card: t(
    'pages_data.Certificat.Generate_Staff_ID_Card.Horizantal_Staff_ID_Card',
  ),
  Staff_Vertical_ID_Card: t('pages_data.Certificat.Generate_Staff_ID_Card.Vertical_Staff_ID_Card'),

  //Generate Certificate
  Certificate_Editor: t('pages_data.Certificat.Generate_Certificate.Certificate_Editor'),
  Internal_Template_Name: t('pages_data.Certificat.Generate_Certificate.Internal_Template_Name'),
  Enter_Certificate_Template_Name: t(
    'pages_data.Certificat.Generate_Certificate.Enter_Certificate_Template_Name',
  ),
  Main_Title: t('pages_data.Certificat.Generate_Certificate.Main_Title'),
  Subtitle: t('pages_data.Certificat.Generate_Certificate.Subtitle'),
  // CERTIFICATE: t('pages_data.Certificat.Generate_Certificate.CERTIFICATE'),
  Of_Achievement: t('pages_data.Certificat.Generate_Certificate.Of_Achievement'),
  Date_Field: t('pages_data.Certificat.Generate_Certificate.Date_Field'),
  TEXT01: t('pages_data.Certificat.Generate_Certificate.TEXT01'),
  Achievement_Message: t('pages_data.Certificat.Generate_Certificate.Achievement_Message'),
  Hopefully_This_Award_Can_Be_A_Motivation_To_Your_Abilities_In_The_Future: t(
    'pages_data.Certificat.Generate_Certificate.Hopefully_This_Award_Can_Be_A_Motivation_To_Your_Abilities_In_The_Future',
  ),
  Left_Name: t('pages_data.Certificat.Generate_Certificate.Left_Name'),
  Right_Name: t('pages_data.Certificat.Generate_Certificate.Right_Name'),
  Principal: t('pages_data.Certificat.Generate_Certificate.Principal'),
  Live_Preview: t('pages_data.Certificat.Generate_Certificate.Live_Preview'),
  Recent_Certificates: t('pages_data.Certificat.Generate_Certificate.Recent_Certificates'),
  // Template_Name: t("pages_data.Certificat.Generate_Certificate.Template_Name"),

  // Student ID Card
  Logo_Image: t('pages_data.Certificat.Student_ID_Card.Logo_Image'),
  Address_Phone_Email: t('pages_data.Certificat.Student_ID_Card.Address_Phone_Email'),
  ID_Card_Title: t('pages_data.Certificat.Student_ID_Card.ID_Card_Title'),
  Student_Address: t('pages_data.Certificat.Student_ID_Card.Student_Address'),
  Design_Type: t('pages_data.Certificat.Student_ID_Card.Design_Type'),
  ID_Card_List: t('pages_data.Certificat.Student_ID_Card.ID_Card_List'),
  Student_ID_Card_Template_Designer: t(
    'pages_data.Certificat.Student_ID_Card.Student_ID_Card_Template_Designer',
  ),
  Institution_Name: t('pages_data.Certificat.Student_ID_Card.Institution_Name'),
  Institution_Logo: t('pages_data.Certificat.Student_ID_Card.Institution_Logo'),
  Institution_Address: t('pages_data.Certificat.Student_ID_Card.Institution_Address'),
  Student_ID: t('pages_data.Certificat.Student_ID_Card.Student_ID'),
  Tag_Line: t('pages_data.Certificat.Student_ID_Card.Tag_Line'),
  Front_Card_Background: t('pages_data.Certificat.Student_ID_Card.Front_Card_Background'),
  Back_Card_Background_optional: t(
    'pages_data.Certificat.Student_ID_Card.Back_Card_Background_(optional)',
  ),
  Colours: t('pages_data.Certificat.Student_ID_Card.Colours'),
  Header_text: t('pages_data.Certificat.Student_ID_Card.Header_text'),
  Key_text: t('pages_data.Certificat.Student_ID_Card.Key_text'),
  Value_text: t('pages_data.Certificat.Student_ID_Card.Value_text'),
  Visible_Fields: t('pages_data.Certificat.Student_ID_Card.Visible_Fields'),
  Academic: t('pages_data.Certificat.Student_ID_Card.Academic'),
  Personal: t('pages_data.Certificat.Student_ID_Card.Personal'),
  Layout: t('pages_data.Certificat.Student_ID_Card.Layout'),
  Circular_Profile_Picture: t('pages_data.Certificat.Student_ID_Card.Circular_Profile_Picture'),
  Header_Body_Divider: t('pages_data.Certificat.Student_ID_Card.Header_Body_Divider'),
  Generate_ID_Cards: t('pages_data.Certificat.Student_ID_Card.Generate_ID_Cards'),
  Download_ZIP: t('pages_data.Certificat.Student_ID_Card.Download_ZIP'),
  Select_All: t('pages_data.Certificat.Student_ID_Card.Select_All'),

  //Staff ID Card
  Staff_ID_Card_Template_Designer: t(
    'pages_data.Certificat.Staff_ID_Card.Staff_ID_Card_Template_Designer',
  ),
  Tagline_Address: t('pages_data.Certificat.Staff_ID_Card.Tagline_Address'),
  Barcode_QR_Code: t('pages_data.Certificat.Staff_ID_Card.Barcode_QR_Code'),
  // Principal_Signature: t("pages_data.Certificat.Staff_ID_Card.Principal_Signature"),
  Display_Fields: t('pages_data.Certificat.Staff_ID_Card.Display_Fields'),
  // Saved_Templates: t("pages_data.Certificat.Staff_ID_Card.Saved_Templates"),
  // Save_Template: t("pages_data.Certificat.Staff_ID_Card.Save_Template"),
  Generate_Id_Card: t('pages_data.Certificat.Staff_ID_Card.Generate_Id_Card'),
  Generate_Staff_ID_Cards: t('pages_data.Certificat.Staff_ID_Card.Generate_Staff_ID_Cards'),
  Select_Template: t('pages_data.Certificat.Staff_ID_Card.Select_Template'),
  Staff_Code: t('pages_data.Certificat.Staff_ID_Card.Staff_Code'),
  Select_Criteria: t('pages_data.Certificat.Staff_ID_Card.Select_Criteria'),
  Search_Staff: t('pages_data.Certificat.Staff_ID_Card.Search_Staff'),
  // Back_To_Designer: t("pages_data.Certificat.Staff_ID_Card.Back_To_Designer"),


  // Student Information Reports
  Student_Information_Reports: t(
    'pages_data.Reports.Student_Information.Student_Information_Reports',
  ),
  Student_Report: t('pages_data.Reports.Student_Information.Student_Report'),
  Username: t('pages_data.Reports.Student_Information.Username'),
  Password: t('pages_data.Reports.Student_Information.Password'),
  Section_Details: t('pages_data.Reports.Student_Information.Section_Details'),
  Student_Login_Creditial_Report: t(
    'pages_data.Reports.Student_Information.Student_Login_Credential_Report',
  ),
  Student_Login_Creditial: t('pages_data.Reports.Student_Information.Student_Login_Credential'),
  Class_section_Report: t('pages_data.Reports.Student_Information.Class_& section_Report'),
  S_No: t('pages_data.Reports.Student_Information.S_No'),
  Student_count: t('pages_data.Reports.Student_Information.Student_count'),
  Guardian_Report: t('pages_data.Reports.Student_Information.Guardian_Report'),
  Guardian_Relation: t('pages_data.Reports.Student_Information.Guardian_Relation'),
  Father_Phone: t('pages_data.Reports.Student_Information.Father_Phone'),
  Mother_Phone: t('pages_data.Reports.Student_Information.Mother_Phone'),
  Student_history: t('pages_data.Reports.Student_Information.Student_history'),
  Admission_Year: t('pages_data.Reports.Student_Information.Admission_Year'),
  Class_Start_End: t('pages_data.Reports.Student_Information.Class_(Start-End)'),
  Session_Start_End: t('pages_data.Reports.Student_Information.Session_(Start-End)'),
  Years: t('pages_data.Reports.Student_Information.Years'),
  Student_History_Report: t('pages_data.Reports.Student_Information.Student_History_Report'),
  Parent_Login_Credential_Report: t(
    'pages_data.Reports.Student_Information.Parent_Login _Credential_Report',
  ),
  Parent_Login_Credential: t('pages_data.Reports.Student_Information.Parent_Login_Credential'),
  Parent_Username: t('pages_data.Reports.Student_Information.Parent_Username'),
  Parent_Password: t('pages_data.Reports.Student_Information.Parent_Password'),
  Class_Subject_Report: t('pages_data.Reports.Student_Information.Class_Subject_Report'),
  // Room_No: t("pages_data.Reports.Student_Information.Room_No"),
  Admission_Report: t('pages_data.Reports.Student_Information.Admission_Report'),
  Form_Status: t('pages_data.Reports.Student_Information.Form_Status'),
  amount: t('pages_data.Reports.Student_Information.amount'),
  Sibling_Report: t('pages_data.Reports.Student_Information.Sibling_Report'),
  Student_Profile: t('pages_data.Reports.Student_Information.Student_Profile'),
  Search_By_Admission_Date: t('pages_data.Reports.Student_Information.Search_By_Admission_Date'),
  Father_Occupation: t('pages_data.Reports.Student_Information.Father_Occupation'),
  Mother_Occupation: t('pages_data.Reports.Student_Information.Mother_Occupation'),
  Guardian_Occupation: t('pages_data.Reports.Student_Information.Guardian_Occupation'),
  If_Guardian_Is: t('pages_data.Reports.Student_Information.If_Guardian_Is'),
  Guardian_Email: t('pages_data.Reports.Student_Information.Guardian_Email'),
  Guardian_Address: t('pages_data.Reports.Student_Information.Guardian_Address'),
  Student_Gender_Ratio_Report: t(
    'pages_data.Reports.Student_Information.Student_Gender_Ratio_Report',
  ),

  Total_Boys: t('pages_data.Reports.Student_Information.Total_Boys'),
  Total_Girls: t('pages_data.Reports.Student_Information.Total_Girls'),
  Total_Students: t('pages_data.Reports.Student_Information.Total_Students'),
  Boys_Girls_Ratio: t('pages_data.Reports.Student_Information.Boys_Girls_Ratio'),
  Student_Teacher_Ratio_Report: t(
    'pages_data.Reports.Student_Information.Student_Teacher_Ratio_Report',
  ),
  Total_Assigned_Teacher: t('pages_data.Reports.Student_Information.Total_Assigned_eacher'),
  Student_Teacher_Ratio: t('pages_data.Reports.Student_Information.Student_Teacher_Ratio'),
  Online_Admission_Report: t('pages_data.Reports.Student_Information.Online_Admission_Report'),
  Admitted: t('pages_data.Reports.Student_Information.Admitted'),
  Pendding: t('pages_data.Reports.Student_Information.Pendding'),

  // Finance Reports
  Balance_Fees_Statement: t('pages_data.Reports.Finance.Balance_Fees_Statement'),
  Daily_Collection_Report: t('pages_data.Reports.Finance.Daily_Collection_Report'),
  Date_To: t('pages_data.Reports.Finance.Date_To'),
  Total_Transactions: t('pages_data.Reports.Finance.Total_Transactions'),
  Total_Amount: t('pages_data.Reports.Finance.Total_Amount'),
  Fees_Statement: t('pages_data.Reports.Finance.Fees_Statement'),
  // Balance: t("pages_data.Reports.Finance.Balance"),
  Balance_Fees_Report: t('pages_data.Reports.Finance.Balance_Fees_Report'),
  Fees_Collection_Report: t('pages_data.Reports.Finance.Fees_Collection _Report'),
  Search_Duration: t('pages_data.Reports.Finance.Search_Duration'),
  Collect_By: t('pages_data.Reports.Finance.Collect_By'),
  Group_By: t('pages_data.Reports.Finance.Group_By'),
  Total: t('pages_data.Reports.Finance.Total'),
  Online_Fees_Collection_Report: t('pages_data.Reports.Finance.Online_Fees_Collection_Report'),
  Balance_Fees_Report_with_Remark: t('pages_data.Reports.Finance.Balance_Fees_Report_with _Remark'),
  Student_Name_Admission_No: t('pages_data.Reports.Finance.Student_Name_(Admission No)'),
  Income_Report: t('pages_data.Reports.Finance.Income_Report'),
  Expense_Report: t('pages_data.Reports.Finance.Expense_Report'),
  Payroll_Report: t('pages_data.Reports.Finance.Payroll_Report'),
  Payslip: t('pages_data.Reports.Finance.Payslip'),
  Basic_salary: t('pages_data.Reports.Finance.Basic_salary'),
  Earning: t('pages_data.Reports.Finance.Earning'),
  Deduction: t('pages_data.Reports.Finance.Deduction'),
  Gross_salary: t('pages_data.Reports.Finance.Gross_salary'),
  Tax: t('pages_data.Reports.Finance.Tax'),
  Income_Group_Report: t('pages_data.Reports.Finance.Income_Group_Report'),
  Search_Income_Head: t('pages_data.Reports.Finance.Search_Income_Head'),
  Income_ID: t('pages_data.Reports.Finance.Income_ID'),
  Expense_Group_Report: t('pages_data.Reports.Finance.Expense_Group_Report'),
  Search_Expense_Head: t('pages_data.Reports.Finance.Search_Expense_Head'),
  Online_Admission_Fees_Collection_Report: t(
    'pages_data.Reports.Finance.Online_Admission_Fees_Collection_Report',
  ),

  // Attendance Reports
  Attendance_Report: t('pages_data.Reports.Attendance.Attendance_Report'),
  Student_Date: t('pages_data.Reports.Attendance.Student_Date'),
  Student_Attendance_Type: t('pages_data.Reports.Attendance.Student_Attendance_Type'),
  Attendance_Type: t('pages_data.Reports.Attendance.Attendance_Type'),
  Count: t('pages_data.Reports.Attendance.Count'),
  Student_Attendance_Type_Report: t('pages_data.Reports.Attendance.Student_Attendance_Type_Report'),
  Daily_Attendance_Report: t('pages_data.Reports.Attendance.Daily_Attendance_Report'),
  Total_Present: t('pages_data.Reports.Attendance.Total_Present'),
  Total_Absent: t('pages_data.Reports.Attendance.Total_Absent'),
  Absence: t('pages_data.Reports.Attendance.Absence'),
  Student_Day_Wise_Attendance: t('pages_data.Reports.Attendance.Student_Day_Wise_Attendance'),
  Staff_Day_Wise_Attendance_Report: t(
    'pages_data.Reports.Attendance.Staff_Day_Wise _Attendance_Report',
  ),
  Staff_Day_Wise_Attendance: t('pages_data.Reports.Attendance.Staff_Day_Wise_Attendance'),
  Staff_Attendance_Report: t('pages_data.Reports.Attendance.Staff_Attendance_Report'),
  Staff_Date: t('pages_data.Reports.Attendance.Staff_Date'),

  // Examination Reports
  examination_Report: t('pages_data.Reports.Examination_Report.examination_Report'),
  Result_Report: t('pages_data.Reports.Examination_Report.Result_Report'),
  // Exam: t("pages_data.Reports.Examination_Report.Exam"),

  // Online Examination Reports
  Online_Examination_Reports: t('pages_data.Reports.Online_Examination.Online_Examination_Reports'),
  Total_Attempt: t('pages_data.Reports.Online_Examination.Total_Attempt'),
  Remaining_Attempt: t('pages_data.Reports.Online_Examination.Remaining_Attempt'),
  Exam_Submitted: t('pages_data.Reports.Online_Examination.Exam_Submitted'),
  Date_Type: t('pages_data.Reports.Online_Examination.Date_Type'),
  Total_Duration: t('pages_data.Reports.Online_Examination.Total_Duration'),
  Exams_Rank_Report: t('pages_data.Reports.Online_Examination.Exams_Rank_Report'),
  Exam_Report: t('pages_data.Reports.Online_Examination.Exam_Report'),
  Student_Exam_Attempt_Report: t(
    'pages_data.Reports.Online_Examination.Student_Exam_Attempt_Report',
  ),
  Please_select_a_report_to_view: t(
    'pages_data.Reports.Online_Examination.Please_select_a_report_to_view',
  ),

  // Lesson Plan Reports
  Student_Information_Report: t('pages_data.Reports.Lesson_Plan.Student_Information_Report'),
  Syllabus_Status_Report: t('pages_data.Reports.Lesson_Plan.Syllabus_Status_Report'),
  Completion_Date: t('pages_data.Reports.Lesson_Plan.Completion_Date'),
  Subject_Lesson_Topic: t('pages_data.Reports.Lesson_Plan.Subject_Lesson_Topic'),
  Subject_Lesson_Plan_Report: t('pages_data.Reports.Lesson_Plan.Subject_Lesson_Plan_Report'),

  // Human Resource Reports
  Human_Resource_Reports: t('pages_data.Reports.Human_Resource.Human_Resource_Reports'),
  Staff_Report: t('pages_data.Reports.Human_Resource.Staff_Report'),
  Search_Type_By_Date_Of_Joining: t(
    'pages_data.Reports.Human_Resource.Search_Type_By-(Date_Of_Joining)',
  ),
  // Payroll_Report: t("pages_data.Reports.Human_Resource.Payroll_Report"),
  Class_Department: t('pages_data.Reports.Human_Resource.Class_Department'),
  // Month_Year: t("pages_data.Reports.Human_Resource.Month_Year"),

  // Homework Reports
  Homework_Reports: t('pages_data.Reports.Homework.Homework_Reports'),
  Student_Count: t('pages_data.Reports.Homework.Student_Count'),
  Homework_Submitted: t('pages_data.Reports.Homework.Homework_Submitted'),
  Pending_Student: t('pages_data.Reports.Homework.Pending_Student'),
  Homework_Evaluation_Report: t('pages_data.Reports.Homework.Homework_Evaluation_Report'),
  Complete_Incomplete: t('pages_data.Reports.Homework.Complete_Incomplete'),
  Complete: t('pages_data.Reports.Homework.Complete'),
  Daily_Assignment_Report: t('pages_data.Reports.Homework.Daily_Assignment_Report'),
  Total_Assignment: t('pages_data.Reports.Homework.Total_Assignment'),

  // Library Reports
  Library_Reports: t('pages_data.Reports.Library_Report.Library_Reports'),
  Book_Issue_Report: t('pages_data.Reports.Library_Report.Book_Issue_Report'),
  Due_Return_Date: t('pages_data.Reports.Library_Report.Due Return Date'),
  Issued_By: t('pages_data.Reports.Library_Report.Issued_By'),
  Book_Due_Report: t('pages_data.Reports.Library_Report.Book_Due_Report'),
  Book_Inventory_Report: t('pages_data.Reports.Library_Report.Book_Inventory_Report'),
  Book_Issue_Return_Report: t('pages_data.Reports.Library_Report.Book_Issue_Return_Report'),

  // Inventory Reports
  Inventory_Reports: t('pages_data.Reports.inventory.Inventory_Reports'),
  Stock_Report: t('pages_data.Reports.inventory.Stock_Report'),
  Available_Quantity: t('pages_data.Reports.inventory.Available_Quantity'),
  Total_Quantity: t('pages_data.Reports.inventory.Total_Quantity'),
  Total_Issued: t('pages_data.Reports.inventory.Total_Issued'),
  Add_Item_Report: t('pages_data.Reports.inventory.Add_Item_Report'),
  Issue_Item_Report: t('pages_data.Reports.inventory.Issue_Item_Report'),
  Issued_Return: t('pages_data.Reports.inventory.Issued_Return'),
  Issued_To: t('pages_data.Reports.inventory.Issued_To'),

  // Transport Reports
  Student_Transport_Report: t('pages_data.Reports.Transport.Student_Transport_Report'),
  Vehicle_No: t('pages_data.Reports.Transport.Vehicle_No'),
  Driver_Name: t('pages_data.Reports.Transport.Driver_Name'),

  // Hostel Reports
  Hostel_report: t('pages_data.Reports.Hostel_Report.Hostel_report'),
  Room_Number_Name: t('pages_data.Reports.Hostel_Report.Room_Number_Name'),

  // Alumni Reports

  Current_Email: t('pages_data.Reports.Alumni.Current_Email'),
  Current_Phone: t('pages_data.Reports.Alumni.Current_Phone'),

  // User Log Reports
  All_Users: t('pages_data.Reports.User_Log.All_Users'),
  Roles: t('pages_data.Reports.User_Log.Roles'),
  IP_Address: t('pages_data.Reports.User_Log.IP_Address'),
  Login_Date_Time: t('pages_data.Reports.User_Log.Login_Date_Time'),
  User_Agent: t('pages_data.Reports.User_Log.User_Agent'),

  // Audit Trail Reports
  Audit_Trail_Report_List: t('pages_data.Reports.Audit_Trail_Report.Audit_Trail_Report_List'),
  Clear_All_Records: t('pages_data.Reports.Audit_Trail_Report.Clear_All _Records'),
  Platform: t('pages_data.Reports.Audit_Trail_Report.Platform'),
  Agent: t('pages_data.Reports.Audit_Trail_Report.Agent'),
  Date_Time: t('pages_data.Reports.Audit_Trail_Report.Date_Time'),

  Add_Student_Certificate: t('pages_data.Certificat.Student_Certificate.Add_Student_Certificate'),
  Certificate_Type: t('pages_data.Certificat.Generate_Certificate.Certificate_Type'),
  header_Left_Text: t('pages_data.Certificat.Student_Certificate.header_Left_Text'),
  header_Center_Text: t('pages_data.Certificat.Student_Certificate.header_Center_Text'),
  header_Right_Text: t('pages_data.Certificat.Student_Certificate.header_Right_Text'),
  footer_Left_Text: t('pages_data.Certificat.Student_Certificate.footer_Left_Text'),
  footer_Center_Text: t('pages_data.Certificat.Student_Certificate.footer_Center_Text'),
  footer_Right_Text: t('pages_data.Certificat.Student_Certificate.footer_Right_Text'),
  header_Height: t('pages_data.Certificat.Student_Certificate.header_Height'),
  footer_Height: t('pages_data.Certificat.Student_Certificate.footer_Height'),
  body_Height: t('pages_data.Certificat.Student_Certificate.body_Height'),
  bodyWidth: t('pages_data.Certificat.Student_Certificate.bodyWidth'),
  Photo_Height: t('pages_data.Certificat.Student_Certificate.Photo_Height'),
  Upload_Background_Image: t('pages_data.Certificat.Student_Certificate.Upload_Background_Image'),
  Student_Certificate_List: t('pages_data.Certificat.Student_Certificate.Student_Certificate_List'),
  Logo: t('pages_data.Certificat.Student_ID_Card.Logo'),
  ID_Card_Template: t('pages_data.Certificat.Generate_ID_Card.ID_Card_Template'),
  Add_Staff_ID_Card: t('pages_data.Certificat.Staff_ID_Card.Add_Staff_ID_Card'),
  Signature: t('pages_data.Certificat.Staff_ID_Card.Signature'),
  Header_Color: t('pages_data.Certificat.Staff_ID_Card.Header Color'),
  Horizontal_Staff_ID_Card: t(
    'pages_data.Certificat.Generate_Staff_ID_Card.Horizantal_Staff_ID_Card',
  ),
  Vertical_Staff_ID_Card: t('pages_data.Certificat.Generate_Staff_ID_Card.Vertical_Staff_ID_Card'),

  ID_Card_Template_Designer: t('pages_data.Certificat.Student_ID_Card.ID_Card_Template_Designer'),
  Found: t('pages_data.Certificat.Student_ID_Card.Found'),
  No_Templates_Found: t('pages_data.Certificat.Student_ID_Card.No_Templates_Found'),


  Department_Subtitle: t('pages_data.Certificat.Student_ID_Card.Department_Subtitle'),

  // Horizontal: t("pages_data.Certificat.Horizontal"),
  // Vertical: t("pages_data.Certificat.Vertical"),
  // Untitled: t("pages_data.Certificat.Untitled"),
  // No_Image: t("pages_data.Certificat.No_Image"),

  //System_Settings
  //General_Components
  //General_Setting
  General_Setting: t(
    'pages_data.System_Settings.General_Components.General_Setting.General_Setting',
  ),
  After_saving_General_Setting_please_logout_and_re_login_for_changes_to_take_effect: t(
    'pages_data.System_Settings.General_Components.General_Setting.After_saving_General_Setting_please_logout_and_re_login_for_changes_to_take_effect',
  ),
  School_Code: t('pages_data.System_Settings.General_Components.General_Setting.School_Code'),
  Academic_Session: t(
    'pages_data.System_Settings.General_Components.General_Setting.Academic_Session',
  ),
  Session_Start_Month: t(
    'pages_data.System_Settings.General_Components.General_Setting.Session_Start_Month',
  ),
  Start_Date_Week: t(
    'pages_data.System_Settings.General_Components.General_Setting.Start_Date_Week',
  ),
  Currency: t('pages_data.System_Settings.General_Components.General_Setting.Currency'),
  Base_URL: t('pages_data.System_Settings.General_Components.General_Setting.Base_URL'),
  Upload_File_Path: t(
    'pages_data.System_Settings.General_Components.General_Setting.Upload_File_Path',
  ),
  Time_Zone: t('pages_data.System_Settings.General_Components.General_Setting.Time_Zone'),
  Select_Academic_Session: t(
    'pages_data.System_Settings.General_Components.General_Setting.Select_Academic_Session',
  ),
  Select_Month: t('pages_data.System_Settings.General_Components.General_Setting.Select_Month'),

  //Login_Page_Background
  Admin_Panel: t('pages_data.System_Settings.General_Components.Login_Page_Background.Admin_Panel'),
  User_Panel: t('pages_data.System_Settings.General_Components.Login_Page_Background.User_Panel'),

  //Background_Theme
  Backend_Theme: t('pages_data.System_Settings.General_Components.Background_Theme.Backend_Theme'),
  White: t('pages_data.System_Settings.General_Components.Background_Theme.White'),
  Blue: t('pages_data.System_Settings.General_Components.Background_Theme.Blue'),
  Green: t('pages_data.System_Settings.General_Components.Background_Theme.Green'),
  Red: t('pages_data.System_Settings.General_Components.Background_Theme.Red'),
  Orange: t('pages_data.System_Settings.General_Components.Background_Theme.Orange'),
  Gray: t('pages_data.System_Settings.General_Components.Background_Theme.Gray'),

  //Mobil App
  Mobile_app: t('pages_data.System_Settings.General_Components.Mobile_App.Mobile_App'),
  User_Mobile_App: t('pages_data.System_Settings.General_Components.Mobile_App.User_Mobile_App'),
  User_Mobile_App_API_URL: t(
    'pages_data.System_Settings.General_Components.Mobile_App.User_Mobile_App_API_URL',
  ),
  User_Mobile_App_Primary_Color_Code: t(
    'pages_data.System_Settings.General_Components.Mobile_App.User_Mobile_App_Primary_Color_Code',
  ),
  User_Mobile_App_Secondary_Color_Code: t(
    'pages_data.System_Settings.General_Components.Mobile_App.User_Mobile_App_Secondary_Color_Code',
  ),

  //General_Setting_Logo
  Print_Logo: t('pages_data.System_Settings.General_Components.General_Setting_Logo.Print_Logo'),
  Admin_Logo: t('pages_data.System_Settings.General_Components.General_Setting_Logo.Admin_Logo'),
  Admin_Small_Logo: t(
    'pages_data.System_Settings.General_Components.General_Setting_Logo.Admin_Small_Logo',
  ),
  App_Logo: t('pages_data.System_Settings.General_Components.General_Setting_Logo.App_Logo'),
  Image_Preview: t(
    'pages_data.System_Settings.General_Components.General_Setting_Logo.Image_Preview',
  ),

  //"Student Guardian Panel
  Student_Guardian_Panel: t(
    'pages_data.System_Settings.General_Components.Student_Guardian_Panel.Student/_Guardian_Panel',
  ),
  User_Login: t('pages_data.System_Settings.General_Components.Student_Guardian_Panel.User_Login'),
  Student_Login: t(
    'pages_data.System_Settings.General_Components.Student_Guardian_Panel.Student_Login',
  ),
  Parent_Login: t(
    'pages_data.System_Settings.General_Components.Student_Guardian_Panel.Parent_Login',
  ),
  Additional_Username_Option_For_Student_Login: t(
    'pages_data.System_Settings.General_Components.Student_Guardian_Panel.Additional_Username_Option_For_Student_Login',
  ),
  Additional_Username_Option_For_Parent_Login: t(
    'pages_data.System_Settings.General_Components.Student_Guardian_Panel.Additional_Username_Option_For_Parent_Login',
  ),
  Allow_Student_To_Add_Timeline: t(
    'pages_data.System_Settings.General_Components.Student_Guardian_Panel.Allow_Student_To_Add_Timeline',
  ),
  Resent: t('pages_data.System_Settings.General_Components.Student_Guardian_Panel.Resent'),
  Enabled: t('pages_data.System_Settings.General_Components.Student_Guardian_Panel.Enabled'),
  Disabled: t('pages_data.System_Settings.General_Components.Student_Guardian_Panel.Disabled'),
  Form_Reset_Successfully: t(
    'pages_data.System_Settings.General_Components.Student_Guardian_Panel.Form_Reset_Successfully',
  ),

  //General Attendance
  Day_Wise: t('pages_data.System_Settings.General_Components.General_Attendance.Day_Wise'),
  Period_Wise: t('pages_data.System_Settings.General_Components.General_Attendance.Period_Wise'),
  QR_Code_Barcode_Biometric_Attendance: t(
    'pages_data.System_Settings.General_Components.General_Attendance.QR_Code_Barcode_Biometric_Attendance',
  ),
  Devices_Separate_By_Comma: t(
    'pages_data.System_Settings.General_Components.General_Attendance.Devices_Separate_By_Comma',
  ),
  Low_Attendance_Limit_Percent: t(
    'pages_data.System_Settings.General_Components.General_Attendance.Low_Attendance_Limit_Percent',
  ),

  //General Fees
  // Fees: t("pages_data.System_Settings.General_Components.General_Fees.Fees"),
  Offline_Bank_Payment_In_Student_Panel: t(
    'pages_data.System_Settings.General_Components.General_Fees.Offline_Bank_Payment_In_Student_Panel',
  ),
  Offline_Bank_Payment_Instruction: t(
    'pages_data.System_Settings.General_Components.General_Fees.Offline_Bank_Payment_Instruction',
  ),
  Carry_Forward_Fees_Due_Days: t(
    'pages_data.System_Settings.General_Components.General_Fees.Carry_Forward_Fees_Due_Days',
  ),
  Lock_Student_Panel_If_Fees_Remaining: t(
    'pages_data.System_Settings.General_Components.General_Fees.Lock_Student_Panel_If_Fees_Remaining',
  ),
  Single_Page_Fees_Print: t(
    'pages_data.System_Settings.General_Components.General_Fees.Single_Page_Fees_Print',
  ),
  Collect_Fees_In_Back_Date: t(
    'pages_data.System_Settings.General_Components.General_Fees.Collect_Fees_In_Back_Date',
  ),
  Student_Guardian_Panel_Fees_Discount: t(
    'pages_data.System_Settings.General_Components.General_Fees.Student_Guardian_Panel_Fees_Discount',
  ),
  Print_Fees_Receipt_For: t(
    'pages_data.System_Settings.General_Components.General_Fees.Print_Fees_Receipt_For',
  ),
  Bank_Copy: t('pages_data.System_Settings.General_Components.General_Fees.Bank_Copy'),
  Student_Copy: t('pages_data.System_Settings.General_Components.General_Fees.Student_Copy'),
  Office_Copy: t('pages_data.System_Settings.General_Components.General_Fees.Office_Copy'),

  //General_Id_Auto
  ID_Auto_Generation: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.ID_Auto_Generation',
  ),
  Student_Admission_No_Auto_Generation: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Student_Admission_No_Auto_Generation',
  ),
  Auto_Admission_No: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Auto_Admission_No',
  ),
  Admission_No_Prefix: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Admission_No_Prefix',
  ),
  Admission_No_Digit: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Admission_No_Digit',
  ),
  Admission_Start_From: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Admission_Start_From',
  ),
  Staff_ID_Auto_Generation: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Staff_ID_Auto_Generation',
  ),
  Auto_Staff_ID: t('pages_data.System_Settings.General_Components.General_Id_Auto.Auto_Staff_ID'),
  Staff_ID_Prefix: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Staff_ID_Prefix',
  ),
  Staff_No_Digit: t('pages_data.System_Settings.General_Components.General_Id_Auto.Staff_No_Digit'),
  Staff_ID_Start_From: t(
    'pages_data.System_Settings.General_Components.General_Id_Auto.Staff_ID_Start_From',
  ),

  //General Miscellaneous
  Miscellaneous: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Miscellaneous',
  ),
  Exam_Result_Page_in_Front_Site: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Exam_Result_Page_in_Front_Site',
  ),
  ID_Card_Scan_Code: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.ID_Card_Scan_Code',
  ),
  Show_Me_Only_My_Question: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Show_Me_Only_My_Question',
  ),
  Online_Examination: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Online_Examination',
  ),
  Teacher_Restricted_Mode: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Teacher_Restricted_Mode',
  ),
  Superadmin_Visibility: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Superadmin_Visibility',
  ),
  Event_Reminder: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Event_Reminder',
  ),
  Calendar_Event_Reminder_Before_Days: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Calendar_Event_Reminder_Before_Days',
  ),
  Scan_Type: t('pages_data.System_Settings.General_Components.General_Miscellaneous.Scan_Type'),
  Staff_Apply_Leave_Notification_Email: t(
    'pages_data.System_Settings.General_Components.General_Miscellaneous.Staff_Apply_Leave_Notification_Email',
  ),

  //General_Maintenance
  Maintenance_Mode: t(
    'pages_data.System_Settings.General_Components.General_Maintenance.Maintenance_Mode',
  ),
  Maintenance: t('pages_data.System_Settings.General_Components.General_Maintenance.Maintenance'),
  Record_Saved_Successfully: t(
    'pages_data.System_Settings.General_Components.General_Maintenance.Record_Saved_Successfully',
  ),

  //General_Setting_Pages
  Login_Page_Background: t(
    'pages_data.System_Settings.General_Components.General_Setting_Pages.Login_Page_Background',
  ),
  // Background_Theme: t(
  //   'pages_data.System_Settings.General_Components.General_Setting_Pages.Background_Theme',
  // ),
  General_Setting_Logo: t(
    'pages_data.System_Settings.General_Components.General_Setting_Pages.General_Setting_Logo',
  ),
  General_Attendance: t(
    'pages_data.System_Settings.General_Components.General_Setting_Pages.General_Attendance',
  ),
  General_Fees: t(
    'pages_data.System_Settings.General_Components.General_Setting_Pages.General_Fees',
  ),
  General_Setting_Maintenance: t(
    'pages_data.System_Settings.General_Components.General_Setting_Pages.General_Setting_Maintenance',
  ),

  //Session_Setting
  Is_Current: t('pages_data.System_Settings.Session_Setting.Is_Current'),
  Active_session: t('pages_data.System_Settings.Session_Setting.Active_session'),
  changing_or_deleting_the_active_session_may_affect_student_records_and_class_assignments: t('pages_data.System_Settings.Session_Setting.Add_Session'),
  Set_as_Current: t('pages_data.System_Settings.Session_Setting.Set_as_Current'),
  Add_Session: t('pages_data.System_Settings.Session_Setting.Add_Session'),
  Edit_Session: t('pages_data.System_Settings.Session_Setting.Edit_Session'),
  Changing_the_session_name_format_may_cause_issues_on_some_pages_or_features_so_it_is_recommended_not_to_change_the_session_name_format:
    t(
      'pages_data.System_Settings.Session_Setting.Changing_the_session_name_format_may_cause_issues_on_some_pages_or_features_so_it_is_recommended_not_to_change_the_session_name_format',
    ),
  Session_List: t('pages_data.System_Settings.Session_Setting.Session_List'),
  Session_added_successfully: t(
    'pages_data.System_Settings.Session_Setting.Session_added_successfully..!',
  ),
  Session_updated_successfully: t(
    'pages_data.System_Settings.Session_Setting.Session updated successfully!',
  ),
  TransPort_Incharge: t('pages_data.System_Settings.Session_Setting.Transport_Incharge'),
  Hostel_Wardens: t('pages_data.System_Settings.Session_Setting.Hostel_Wardens'),
  Accountants: t('pages_data.System_Settings.Session_Setting.Accountants'),
  Receptionists: t('pages_data.System_Settings.Session_Setting.Receptionists'),

  //Group user
  Edit_Group_User: t('pages_data.System_Settings.Group_user.Edit_Group_User'),
  Add_Group_User: t('pages_data.System_Settings.Group_user.Add_Group_User'),
  Confirm_Password: t('pages_data.System_Settings.Group_user.Confirm_Password'),
  Group_Users: t('pages_data.System_Settings.Group_user.Group_Users'),

  //Role Management
  editRole: t('pages_data.System_Settings.school_group_roles.editRole'),
  createRole: t('pages_data.System_Settings.school_group_roles.createRole'),
  loading_title: t('pages_data.System_Settings.school_group_roles.loading_title'),
  TItLE_IS_REQUIRED: t('pages_data.System_Settings.school_group_roles.TItLE_IS_REQUIRED'),
  Loading_scopes_and_operations: t('pages_data.System_Settings.school_group_roles.Loading_scopes_and_operations'),
  PROFILE_scope_is_required: t('pages_data.System_Settings.school_group_roles.PROFILE_scope_is_required'),
  Remove_scope: t('pages_data.System_Settings.school_group_roles.Remove_scope'),
  READ_is_always_required_for_PROFILE: t('pages_data.System_Settings.school_group_roles.READ_is_always_required_for_PROFILE'),
  Role_Managenment: t('pages_data.System_Settings.school_group_roles.Role_Managenment'),
  User_Activity: t('Pages_name.System Settings.User_Activity'),
  All_Activity_Records: t('pages_data.System_Settings.school_group_roles.All_Activity_Records'),
  Filtered_Activity_Records: t('pages_data.System_Settings.school_group_roles.Filtered_Activity_Records'),



  //Notification_Settings
  Notification_Settings: t(
    'pages_data.System_Settings.Notification_Settings.Notification_Settings',
  ),
  Event: t('pages_data.System_Settings.Notification_Settings.Event'),
  Recipient: t('pages_data.System_Settings.Notification_Settings.Recipient'),
  Template_ID: t('pages_data.System_Settings.Notification_Settings.Template_ID'),
  Sample_Message: t('pages_data.System_Settings.Notification_Settings.Sample_Message'),
  Destination: t('pages_data.System_Settings.Notification_Settings.Destination'),
  You_can_use_variables: t(
    'pages_data.System_Settings.Notification_Settings.You_can_use_variables',
  ),

  //SMS_Settings
  SMS_Settings_Title: t('pages_data.System_Settings.SMS_Settings.SMS_Settings_Title'),
  Clickatell_SMS_Gateway: t('pages_data.System_Settings.SMS_Settings.Clickatell_SMS_Gateway'),
  Clickatell_Username: t('pages_data.System_Settings.SMS_Settings.Clickatell_Username'),
  Clickatell_Password: t('pages_data.System_Settings.SMS_Settings.Clickatell_Password'),
  Api_Key: t('pages_data.System_Settings.SMS_Settings.Api_Key'),
  Twilio_SMS_Gateway: t('pages_data.System_Settings.SMS_Settings.Twilio_SMS_Gateway'),
  Twilio_Account_SID: t('pages_data.System_Settings.SMS_Settings.Twilio_Account_SID'),
  Authentication_Token: t('pages_data.System_Settings.SMS_Settings.Authentication_Token'),
  Registered_Phone_Number: t('pages_data.System_Settings.SMS_Settings.Registered_Phone_Number'),
  MSG: t('pages_data.System_Settings.SMS_Settings.MSG'),
  Auth_Key: t('pages_data.System_Settings.SMS_Settings.Auth_Key'),
  Sender_ID: t('pages_data.System_Settings.SMS_Settings.Sender_ID'),
  Route_ID: t('pages_data.System_Settings.SMS_Settings.Route_ID'),
  Text_Local_SMS_Gateway: t('pages_data.System_Settings.SMS_Settings.Text_Local_SMS_Gateway'),
  Text_Local: t('pages_data.System_Settings.SMS_Settings.Text_Local'),
  Hashkey: t('pages_data.System_Settings.SMS_Settings.Hashkey'),
  SMS_Country: t('pages_data.System_Settings.SMS_Settings.SMS_Country'),
  Bulk_SMS: t('pages_data.System_Settings.SMS_Settings.Bulk_SMS'),
  Bulk_SMS_Username: t('pages_data.System_Settings.SMS_Settings.Bulk_SMS_Username'),
  Bulk_SMS_Password: t('pages_data.System_Settings.SMS_Settings.Bulk_SMS_Password'),
  Mobi_Reach: t('pages_data.System_Settings.SMS_Settings.Mobi_Reach'),
  Nexmo: t('pages_data.System_Settings.SMS_Settings.Nexmo'),
  Nexmo_API_Key: t('pages_data.System_Settings.SMS_Settings.Nexmo_API_Key'),
  Nexmo_API_Secret: t('pages_data.System_Settings.SMS_Settings.Nexmo_API_Secret'),
  Registered_Form_Number: t('pages_data.System_Settings.SMS_Settings.Registered_Form_Number'),
  Short_Code: t('pages_data.System_Settings.SMS_Settings.Short_Code'),
  Africas_Talking: t('pages_data.System_Settings.SMS_Settings.Africas_Talking'),
  SMS_Egypt: t('pages_data.System_Settings.SMS_Settings.SMS_Egypt'),

  // Username: t("pages_data.SMS_Settings.Username"),
  Custom_SMS_Gateway: t('pages_data.System_Settings.SMS_Settings.Custom_SMS_Gateway'),
  Gateway_Name: t('pages_data.System_Settings.SMS_Settings.Gateway_Name'),
  Local_SMS: t('pages_data.System_Settings.SMS_Settings.Local_SMS'),
  International_SMS: t('pages_data.System_Settings.SMS_Settings.International_SMS'),

  // Payment Methods
  Payment_Methods: t('pages_data.System_Settings.Payment_Methods.Payment_Methods'),
  Paypal: t('pages_data.System_Settings.Payment_Methods.Paypal'),
  Paypal_Username: t('pages_data.System_Settings.Payment_Methods.Paypal_Username'),
  Paypal_Password: t('pages_data.System_Settings.Payment_Methods.Paypal_Password'),
  Paypal_Signature: t('pages_data.System_Settings.Payment_Methods.Paypal_Signature'),
  Stripe: t('pages_data.System_Settings.Payment_Methods.Stripe'),
  Stripe_API_Secret_Key: t('pages_data.System_Settings.Payment_Methods.Stripe_API_Secret_Key'),
  Stripe_Publishable_Key: t('pages_data.System_Settings.Payment_Methods.Stripe_Publishable_Key'),
  PayU: t('pages_data.System_Settings.Payment_Methods.PayU'),
  PayU_Money_Key: t('pages_data.System_Settings.Payment_Methods.PayU_Money_Key'),
  PayU_Money_Salt: t('pages_data.System_Settings.Payment_Methods.PayU_Money_Salt'),
  CCAvenue: t('pages_data.System_Settings.Payment_Methods.CCAvenue'),
  CCAvenue_Merchant_ID: t('pages_data.System_Settings.Payment_Methods.CCAvenue_Merchant_ID'),
  CCAvenue_Working_Key: t('pages_data.System_Settings.Payment_Methods.CCAvenue_Working_Key'),
  Access_Code: t('pages_data.System_Settings.Payment_Methods.Access_Code'),
  InstaMojo: t('pages_data.System_Settings.Payment_Methods.InstaMojo'),
  Private_API_Key: t('pages_data.System_Settings.Payment_Methods.Private_API_Key'),
  Private_Auth_Token: t('pages_data.System_Settings.Payment_Methods.Private_Auth_Token'),
  Private_Salt: t('pages_data.System_Settings.Payment_Methods.Private_Salt'),
  Paystack: t('pages_data.System_Settings.Payment_Methods.Paystack'),
  Paystack_Secret_Key: t('pages_data.System_Settings.Payment_Methods.Paystack_Secret_Key'),
  Razorpay: t('pages_data.System_Settings.Payment_Methods.Razorpay'),
  Razorpay_Key_ID: t('pages_data.System_Settings.Payment_Methods.Razorpay_Key_ID'),
  Razorpay_Key_Secret: t('pages_data.System_Settings.Payment_Methods.Razorpay_Key_Secret'),
  Paytm: t('pages_data.System_Settings.Payment_Methods.Paytm'),
  Merchant_ID: t('pages_data.System_Settings.Payment_Methods.Merchant_ID'),
  Merchant_Key: t('pages_data.System_Settings.Payment_Methods.Merchant_Key'),
  Website: t('pages_data.System_Settings.Payment_Methods.Website'),
  Industry_Type: t('pages_data.System_Settings.Payment_Methods.Industry_Type'),
  Midtrans: t('pages_data.System_Settings.Payment_Methods.Midtrans'),
  Server_Key: t('pages_data.System_Settings.Payment_Methods.Server_Key'),
  Pesapal: t('pages_data.System_Settings.Payment_Methods.Pesapal'),
  Consumer_Key: t('pages_data.System_Settings.Payment_Methods.Consumer_Key'),
  Consumer_Secret: t('pages_data.System_Settings.Payment_Methods.Consumer_Secret'),
  Flutter_Wave: t('pages_data.System_Settings.Payment_Methods.Flutter_Wave'),
  Public_Key: t('pages_data.System_Settings.Payment_Methods.Public_Key'),
  Secret_Key: t('pages_data.System_Settings.Payment_Methods.Secret_Key'),
  IPay_Africa: t('pages_data.System_Settings.Payment_Methods.IPay_Africa'),
  Vendor_ID: t('pages_data.System_Settings.Payment_Methods.Vendor_ID'),
  HashKey: t('pages_data.System_Settings.Payment_Methods.HashKey'),
  JazzCash: t('pages_data.System_Settings.Payment_Methods.JazzCash'),
  Billplz: t('pages_data.System_Settings.Payment_Methods.Billplz'),
  Customer_Service_Email: t('pages_data.System_Settings.Payment_Methods.Customer_Service_Email'),
  SSLCommerz: t('pages_data.System_Settings.Payment_Methods.SSLCommerz'),
  Store_ID: t('pages_data.System_Settings.Payment_Methods.Store_ID'),
  Store_Password: t('pages_data.System_Settings.Payment_Methods.Store_Password'),
  Walkingm: t('pages_data.System_Settings.Payment_Methods.Walkingm'),
  Client_ID: t('pages_data.System_Settings.Payment_Methods.Client_ID'),
  Client_Secret: t('pages_data.System_Settings.Payment_Methods.Client_Secret'),
  Mollie: t('pages_data.System_Settings.Payment_Methods.Mollie'),
  Cashfree: t('pages_data.System_Settings.Payment_Methods.Cashfree'),
  App_ID: t('pages_data.System_Settings.Payment_Methods.App_ID'),
  Payfast: t('pages_data.System_Settings.Payment_Methods.Payfast'),
  Security_Passphrase: t('pages_data.System_Settings.Payment_Methods.Security_Passphrase'),
  ToyyibPay: t('pages_data.System_Settings.Payment_Methods.ToyyibPay'),
  Category_Code: t('pages_data.System_Settings.Payment_Methods.Category_Code'),
  Twocheckout: t('pages_data.System_Settings.Payment_Methods.Twocheckout'),
  Mearchant_Code: t('pages_data.System_Settings.Payment_Methods.Mearchant_Code'),
  Skrill: t('pages_data.System_Settings.Payment_Methods.Skrill'),
  Merchant_Account_Email: t('pages_data.System_Settings.Payment_Methods.Merchant_Account_Email'),
  Merchant_Secret_Salt: t('pages_data.System_Settings.Payment_Methods.Merchant_Secret_Salt'),
  Payhere: t('pages_data.System_Settings.Payment_Methods.Payhere'),
  Onepay: t('pages_data.System_Settings.Payment_Methods.Onepay'),

  //Email_Settings
  Email_Settings: t('pages_data.System_Settings.Email_Settings.Email_Settings'),
  Email_Engine: t('pages_data.System_Settings.Email_Settings.Email_Engine'),
  SMTP_Username: t('pages_data.System_Settings.Email_Settings.SMTP_Username'),
  SMTP_Password: t('pages_data.System_Settings.Email_Settings.SMTP_Password'),
  SMTP_Security: t('pages_data.System_Settings.Email_Settings.SMTP_Security'),
  SMTP_Server: t('pages_data.System_Settings.Email_Settings.SMTP_Server'),
  SMTP_Port: t('pages_data.System_Settings.Email_Settings.SMTP_Port'),

  //Print_Header_Footer
  Footer_Content: t(
    'pages_data.System_Settings.Print_Header_Footer.Print_Header_Footer_Component.Fees_Receipt.Footer_Content',
  ),
  Fees_Receipt: t(
    'pages_data.System_Settings.Print_Header_Footer.Print_Header_Footer_Component.Fees_Receipt.Fees_Receipt',
  ),
  Online_Exam: t(
    'pages_data.System_Settings.Print_Header_Footer.Print_Header_Footer_Component.Fees_Receipt.Online_Exam',
  ),
  Online_Admission_Receipt: t(
    'pages_data.System_Settings.Print_Header_Footer.Print_Header_Footer_Component.Fees_Receipt.Online_Admission_Receipt',
  ),
  Print_Header_Footer: t(
    'pages_data.System_Settings.Print_Header_Footer.Print_Header_Footer_Component.Fees_Receipt.Print_Header_Footer',
  ),
  Please_select_an_item_from_the_menu: t(
    'pages_data.System_Settings.Print_Header_Footer.Print_Header_Footer_Component.Fees_Receipt.Please_select_an_item_from_the_menu',
  ),

  //front cms setting
  Front_CMS_Setting: t('pages_data.System_Settings.Front_CMS_Settings.Front_CMS_Setting'),
  Front_CMS: t('pages_data.System_Settings.Front_CMS_Settings.Front_CMS'),
  Sidebar: t('pages_data.System_Settings.Front_CMS_Settings.Sidebar'),
  Language_RTL_Text_Mode: t('pages_data.System_Settings.Front_CMS_Settings.Language_RTL_Text_Mode'),
  Sidebar_Options: t('pages_data.System_Settings.Front_CMS_Settings.Sidebar_Options'),
  Language: t('pages_data.System_Settings.Front_CMS_Settings.Language'),
  Favicon: t('pages_data.System_Settings.Front_CMS_Settings.Favicon'),
  Cookie_Consent: t('pages_data.System_Settings.Front_CMS_Settings.Cookie_Consent'),
  Google_Analytics: t('pages_data.System_Settings.Front_CMS_Settings.Google_Analytics'),
  Select_Theme: t('pages_data.System_Settings.Front_CMS_Settings.Select_Theme'),
  default: t('pages_data.System_Settings.Front_CMS_Settings.default'),
  yellow: t('pages_data.System_Settings.Front_CMS_Settings.yellow'),
  darkgray: t('pages_data.System_Settings.Front_CMS_Settings.darkgray'),
  blue: t('pages_data.System_Settings.Front_CMS_Settings.blue'),
  white: t('pages_data.System_Settings.Front_CMS_Settings.white'),
  pink: t('pages_data.System_Settings.Front_CMS_Settings.pink'),
  Please_select_a_theme_before_saving: t(
    'pages_data.System_Settings.Front_CMS_Settings.Please_select_a_theme_before_saving',
  ),

  //Role Permission
  Save_Permission: t('pages_data.System_Settings.Role_Permission.Save_Permission'),
  Session_already_exists: t('pages_data.System_Settings.Role_Permission.Session_already_exists'),
  Assign_Permissions: t('pages_data.System_Settings.Role_Permission.Assign_Permissions'),
  Module: t('pages_data.System_Settings.Role_Permission.Module'),
  Features: t('pages_data.System_Settings.Role_Permission.Features'),
  Back: t('pages_data.System_Settings.Role_Permission.Back'),

  //Backup_Restore
  Backup_History: t('pages_data.System_Settings.Backup_Restore.Backup_History'),
  Cron_Secret_Key: t('pages_data.System_Settings.Backup_Restore.Cron_Secret_Key'),
  Do_you_want_to_Create_backup: t(
    'pages_data.System_Settings.Backup_Restore.Do_you_want_to_Create_backup',
  ),
  Create_backup: t('pages_data.System_Settings.Backup_Restore.Create_backup'),
  Upload_From_Local_Directory: t(
    'pages_data.System_Settings.Backup_Restore.Upload_From_Local_Directory',
  ),
  FileUpload: t('pages_data.System_Settings.Backup_Restore.FileUpload'),
  Regenerate: t('pages_data.System_Settings.Backup_Restore.Regenerate'),
  Download: t('pages_data.System_Settings.Backup_Restore.Download'),
  Backup_Files: t('pages_data.System_Settings.Backup_Restore.Backup_Files'),
  Record_Deleted_successfully: t(
    'pages_data.System_Settings.Backup_Restore.Record_Deleted_successfully',
  ),
  Do_you_want_to_view: t('pages_data.System_Settings.Backup_Restore.Do_you_want_to_view'),
  Do_you_want_to_download: t('pages_data.System_Settings.Backup_Restore.Do_you_want_to_download'),
  Do_you_want_to_Upload: t('pages_data.System_Settings.Backup_Restore.Do_you_want_to_Upload'),
  Do_you_want_to_Regenerate: t(
    'pages_data.System_Settings.Backup_Restore.Do_you_want_to_Regenerate',
  ),

  //Language
  Language_List: t('pages_data.System_Settings.Languages.Language_List'),
  Language_Added_Successfully_Ex: t(
    'pages_data.System_Settings.Languages.Language_Added_Successfully_Ex',
  ),
  Are_You_Sure_You_Want_To_Activate_This_Language: t(
    'pages_data.System_Settings.Languages.Are_You_Sure_You_Want_To_Activate_This_Language',
  ),
  To_change_language_key_phrases_edit_file: t(
    'pages_data.System_Settings.Languages.To_change_language_key_phrases_edit_file',
  ),
  Language_Added_Successfully: t(
    'pages_data.System_Settings.Languages.Language_Added_Successfully',
  ),
  Country_Code: t('pages_data.System_Settings.Languages.Country_Code'),
  RTL_toggled_for: t('pages_data.System_Settings.Languages.RTL_toggled_for'),
  Is_RTL: t('pages_data.System_Settings.Languages.Is_RTL'),
  Language_Short_Code: t('pages_data.System_Settings.Languages.Language_Short_Code'),

  //currency
  Currencies: t('pages_data.System_Settings.Currency.Currencies'),
  Currency_Symbol: t('pages_data.System_Settings.Currency.Currency_Symbol'),
  Conversion_Rate: t('pages_data.System_Settings.Currency.Conversion_Rate'),
  Base_Currency: t('pages_data.System_Settings.Currency.Base_Currency'),

  //Users
  Account_status_changed_successfully: t(
    'pages_data.System_Settings.Users.Account_status_changed_successfully',
  ),

  //Addons
  Addons: t('pages_data.System_Settings.Addons.Addons'),
  Smart_School_Thermal_Print: t('pages_data.System_Settings.Addons.Smart_School_Thermal_Print'),
  Smart_School_Quick_Fees_Create: t(
    'pages_data.System_Settings.Addons.Smart_School_Quick_Fees_Create',
  ),
  Smart_School_QR_Code_Attendance: t(
    'pages_data.System_Settings.Addons.Smart_School_QR_Code_Attendance',
  ),
  Smart_School_CBSE_Examination: t(
    'pages_data.System_Settings.Addons.Smart_School_CBSE_Examination',
  ),
  Smart_School_Two_Factor_Authentication: t(
    'pages_data.System_Settings.Addons.Smart_School_Two_Factor_Authentication',
  ),
  Smart_School_Multi_Branch: t('pages_data.System_Settings.Addons.Smart_School_Multi_Branch'),
  Smart_School_Behaviour_Records: t(
    'pages_data.System_Settings.Addons.Smart_School_Behaviour_Records',
  ),
  Smart_School_Online_Course: t('pages_data.System_Settings.Addons.Smart_School_Online_Course'),
  Smart_School_Gmeet_Live_Class: t(
    'pages_data.System_Settings.Addons.Smart_School_Gmeet_Live_Class',
  ),
  Smart_School_Zoom_Live_Class: t('pages_data.System_Settings.Addons.Smart_School_Zoom_Live_Class'),
  Install: t('pages_data.System_Settings.Addons.Install'),
  Uninstall: t('pages_data.System_Settings.Addons.Uninstall'),
  Buy_Now: t('pages_data.System_Settings.Addons.Buy_Now'),

  //Modules
  Modules: t('pages_data.System_Settings.Modules.Modules'),
  Modules_Student: t('pages_data.System_Settings.Modules.Modules_Student'),
  System: t('pages_data.System_Settings.Modules.System'),
  Modules_System: t('pages_data.System_Settings.Modules.Modules_System'),
  Modules_Parent: t('pages_data.System_Settings.Modules.Modules_Parent'),
  Are_You_Sure: t('pages_data.System_Settings.Modules.Are_You_Sure'),

  //Custom Fields
  Field_Belongs_To: t('pages_data.System_Settings.Custom_Fields.Field_Belongs_To'),
  Field_Type: t('pages_data.System_Settings.Custom_Fields.Field_Type'),
  Grid: t('pages_data.System_Settings.Custom_Fields.Grid'),
  Field_Values_Separate_By_Comma: t(
    'pages_data.System_Settings.Custom_Fields.Field_Values_Separate_By_Comma',
  ),
  Required: t('pages_data.System_Settings.Custom_Fields.Required'),
  On_Table: t('pages_data.System_Settings.Custom_Fields.On_Table'),
  Validation: t('pages_data.System_Settings.Custom_Fields.Validation'),
  Visibility: t('pages_data.System_Settings.Custom_Fields.Visibility'),
  Custom_Field_List: t('pages_data.System_Settings.Custom_Fields.Custom_Field_List'),

  //Captcha setting
  Captcha_Setting: t('pages_data.System_Settings.Captcha_Settings.Captcha_Setting'),
  User_login: t('pages_data.System_Settings.Captcha_Settings.User_login'),
  Login: t('pages_data.System_Settings.Captcha_Settings.Login'),
  Admission: t('pages_data.System_Settings.Captcha_Settings.Admission'),
  Complain: t('pages_data.System_Settings.Captcha_Settings.Complain'),
  Contact_Us: t('pages_data.System_Settings.Captcha_Settings.Contact_Us'),
  Are_you_sure_you_want_to_make_this_changes: t(
    'pages_data.System_Settings.Captcha_Settings.Are_you_sure_you_want_to_make_this_changes',
  ),

  //System Fields
  System_Fields_Title: t('pages_data.System_Settings.System_Fields.System_Fields_Title'),
  System_Fields: t('pages_data.System_Settings.System_Fields.System_Fields'),

  // student profile update
  Student_Profile_Update: t(
    'pages_data.System_Settings.Student_Profile_Update.Student_Profile_Update',
  ),
  Allow_Editable_Form_Fields: t(
    'pages_data.System_Settings.Student_Profile_Update.Allow_Editable_Form_Fields',
  ),
  Allowed_Edit_Form_Fields_On_Student_Profile: t(
    'pages_data.System_Settings.Student_Profile_Update.Allowed_Edit_Form_Fields_On_Student_Profile',
  ),
  Middle_Name: t('pages_data.System_Settings.Student_Profile_Update.Middle_Name'),
  AUID: t('pages_data.System_Settings.Student_Profile_Update.AUID'),
  CourseAmit_Singh: t('pages_data.System_Settings.Student_Profile_Update.CourseAmit_Singh'),

  // Admission
  Online_Admission: t('pages_data.System_Settings.Admission.Online_Admission'),
  Online_Admission_Form_Setting: t(
    'pages_data.System_Settings.Admission.Online_Admission_Form_Setting',
  ),
  Online_Admission_Fields_Setting: t(
    'pages_data.System_Settings.Admission.Online_Admission_Fields_Setting',
  ),
  Online_Admission_Payment_Option: t(
    'pages_data.System_Settings.Admission.Online_Admission_Payment_Option',
  ),
  Upload_Admission_Application_Form: t(
    'pages_data.System_Settings.Admission.Upload_Admission_Application_Form',
  ),
  Admission_Instructions: t('pages_data.System_Settings.Admission.Admission_Instructions'),
  Terms_Conditions: t('pages_data.System_Settings.Admission.Terms_Conditions'),
  Field_Name: t('pages_data.System_Settings.Admission.Field_Name'),
  Father_Photo: t('pages_data.System_Settings.Admission.Father_Photo'),
  Mother_Photo: t('pages_data.System_Settings.Admission.Mother_Photo'),
  Guardian_Photo: t('pages_data.System_Settings.Admission.Guardian_Photo'),
  If_Guardian_Address_Is_Current_Address: t(
    'pages_data.System_Settings.Admission.If_Guardian_Address_Is_Current_Address',
  ),
  If_Permanent_Address_Is_Current_Address: t(
    'pages_data.System_Settings.Admission.If_Permanent_Address_Is_Current_Address',
  ),
  Bank_Account_Number: t('pages_data.System_Settings.Admission.Bank_Account_Number'),
  Bank_Name: t('pages_data.System_Settings.Admission.Bank_Name'),
  IFSC_Code: t('pages_data.System_Settings.Admission.IFSC_Code'),
  National_Identification_Number: t(
    'pages_data.System_Settings.Admission.National_Identification_Number',
  ),
  RTE: t('pages_data.System_Settings.Admission.RTE'),
  Previous_School_Details: t('pages_data.System_Settings.Admission.Previous_School_Details'),

  //File types
  File_Types: t('pages_data.System_Settings.File_Types.File_Types'),
  Setting_For_Files: t('pages_data.System_Settings.File_Types.Setting_For_Files'),
  Allowed_Extension: t('pages_data.System_Settings.File_Types.Allowed_Extension'),
  Allowed_MIME_Type: t('pages_data.System_Settings.File_Types.Allowed_MIME_Type'),
  Upload_Size: t('pages_data.System_Settings.File_Types.Upload_Size'),
  Setting_For_Image: t('pages_data.System_Settings.File_Types.Setting_For_Image'),

  //sidebar menu
  Selected_Sidebar_Menus: t('pages_data.System_Settings.Sidebar_Menu.Selected_Sidebar_Menus'),

  //system update
  System_Update: t('pages_data.System_Settings.System_Update.System_Update'),
  Your_Smart_School_Version: t(
    'pages_data.System_Settings.System_Update.Your_Smart_School_Version',
  ),
  Invalid_Application_Or_Unregistered_Product: t(
    'pages_data.System_Settings.System_Update.Invalid_Application_Or_Unregistered_Product',
  ),
  Please_Check_Changelog_For_The_Latest_Version_Update: t(
    'pages_data.System_Settings.System_Update.Please_Check_Changelog_For_The_Latest_Version_Update',
  ),
  Hosting_Server_PHP_Information_PHP_Version: t(
    'pages_data.System_Settings.System_Update.Hosting_Server_PHP_Information_PHP_Version',
  ),
  Show: t('pages_data.System_Settings.System_Update.Show'),
})
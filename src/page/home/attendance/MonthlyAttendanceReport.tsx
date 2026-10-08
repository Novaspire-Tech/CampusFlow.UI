import React, { useState, useEffect, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import Dropdown from '../../../components/controlled/Dropdown'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { attendanceService } from '../../../services/attendence/attendanceservice'
import { studentService } from '../../../services/studentInformation/studentService'
import { StudentAttendanceStatus } from '../../../types/attendence/attendancetypes'
import { DateField, PastDateField } from '../../../components/controlled'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface AttendanceRecord {
  id: number
  studentId: number
  studentName: string
  rollNo: string
  admissionNo: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  holidayDays: number
  halfDays: number
  attendancePercentage: number
  className: string
  sectionName: string
  dateFrom: string
  dateTo: string
}

interface DailyAttendance {
  date: string
  attendance: StudentAttendanceStatus
  note: string
  studentAttendanceId?: number
}

interface StudentDetails extends AttendanceRecord {
  dailyAttendance: DailyAttendance[]
}

const MonthlyAttendanceReport: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t);
  
  const { data: classesData } = useSchoolClasses()

  const { control, handleSubmit, watch, setValue } = useForm<FieldValues>({
    defaultValues: {
      class: '',
      section: '',
      dateFrom: '',
      dateTo: '',
    },
  })

  useForm<FieldValues>({
    defaultValues: {
      attendance: '',
      note: '',
    },
  })

  const [reportData, setReportData] = useState<AttendanceRecord[]>([])
  const [showTable, setShowTable] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0)
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null)
  const [currentFilters, setCurrentFilters] = useState<{
    classId: number
    sectionId: number
    dateFrom: string
    dateTo: string
  } | null>(null)

  const [filteredStudentIds, setFilteredStudentIds] = useState<Set<string> | null>(null)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const watchClass = watch('class')

  const { data: sectionsData } = useSections(selectedClassForSections)

  useEffect(() => {
    if (watchClass) {
      setSelectedClassForSections(Number(watchClass))
      setValue('section', '')
    }
  }, [watchClass, setValue])

  const classOptions = useMemo(() => {
    return (
      classesData?.map((c: any) => ({
        value: c.id,
        label: c.name || c.className,
      })) || []
    )
  }, [classesData])

  const sectionOptions = useMemo(() => {
    return (
      sectionsData?.map((s: any) => ({
        value: s.id,
        label: s.name || s.sectionName,
      })) || []
    )
  }, [sectionsData])

  const getStatusDisplayName = (status: StudentAttendanceStatus): string => {
    const statusMap: Record<StudentAttendanceStatus, string> = {
      [StudentAttendanceStatus.PRESENT]: Text.Present || 'Present',
      [StudentAttendanceStatus.ABSENT]: Text.Absent || 'Absent',
      [StudentAttendanceStatus.LATE]: Text.Late || 'Late',
      [StudentAttendanceStatus.HOLIDAY]: 'Holiday',
      [StudentAttendanceStatus.HALFDAY]: Text.Half_Day || 'Half Day',
    }
    return statusMap[status] || status
  }

  const getStatusBadgeClass = (status: StudentAttendanceStatus): string => {
    const colorMap: Record<StudentAttendanceStatus, string> = {
      [StudentAttendanceStatus.PRESENT]: 'bg-green-100 text-green-800',
      [StudentAttendanceStatus.ABSENT]: 'bg-red-100 text-red-800',
      [StudentAttendanceStatus.LATE]: 'bg-yellow-100 text-yellow-800',
      [StudentAttendanceStatus.HOLIDAY]: 'bg-purple-100 text-purple-800',
      [StudentAttendanceStatus.HALFDAY]: 'bg-blue-100 text-blue-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const fetchMonthlyReport = async (
    classId: number,
    sectionId: number,
    dateFrom: string,
    dateTo: string,
  ) => {
    try {
      setIsLoading(true)

     

      const response = await attendanceService.getMonthlyReport(
        classId,
        sectionId,
        dateFrom,
        dateTo,
      )


      if (response && response.length > 0) {
        const mappedData = response.map((item: any) => ({
          id: item.studentId,
          studentId: item.studentId,
          studentName: item.studentName,
          rollNo: item.rollNo,
          admissionNo: item.admissionNo,
          totalDays: item.totalDays,
          presentDays: item.presentDays,
          absentDays: item.absentDays,
          lateDays: item.lateDays,
          holidayDays: item.holidayDays,
          halfDays: item.halfDays,
          attendancePercentage: item.attendancePercentage,
          className: item.className,
          sectionName: item.sectionName,
          dateFrom: item.dateFrom,
          dateTo: item.dateTo,
        }))

        setReportData(mappedData)
        setShowTable(true)
        setCurrentFilters({ classId, sectionId, dateFrom, dateTo })
      } else {
        setReportData([])
        setShowTable(false)
        toast.error(' No attendance records found for the selected criteria')
      }
    } catch (err: any) {
      console.error('Error fetching monthly report:', err)
      toast.error(` Error: ${err.message || 'Failed to fetch monthly attendance report'}`)
      setReportData([])
      setShowTable(false)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FieldValues) => {
    const { class: cls, section, dateFrom, dateTo } = data

    if (!cls || !section || !dateFrom || !dateTo) {
      toast.error('Please fill in all fields (Class, Section, Date From, and Date To)')
      setShowTable(false)
      return
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      toast.error("'Date From' cannot be after 'Date To'")
      setShowTable(false)
      return
    }

    try {
      const result = await studentService.searchAllPages(
        { schoolClassId: String(cls), sectionId: String(section) },
        'admissionNo',
        'asc',
      )
      const idSet = new Set<string>(
        (result.students || []).map((s: any) => String(s.studentId || s.id)),
      )
      setFilteredStudentIds(idSet.size > 0 ? idSet : null)
    } catch {
      setFilteredStudentIds(null)
    }

    setPage(0)
    await fetchMonthlyReport(Number(cls), Number(section), dateFrom, dateTo)
  }

  const visibleReportData = useMemo(() => {
    if (!filteredStudentIds || filteredStudentIds.size === 0) return reportData
    return reportData.filter((s) => filteredStudentIds.has(String(s.studentId)))
  }, [reportData, filteredStudentIds])

  const totalItems = visibleReportData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const pagedReportData = useMemo(() => {
    const start = page * pageSize
    return visibleReportData.slice(start, start + pageSize)
  }, [visibleReportData, page, pageSize])

  const handleViewDetails = async (studentId: string | number) => {
    const id = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId
    const student = reportData.find((s) => s.studentId === id)
    if (!student) {
      toast.error('Error: Student not found')
      return
    }

    try {
      setIsLoading(true)

      const dailyAttendance = await attendanceService.getByStudentAndDateRange(
        String(student.studentId),
        student.dateFrom,
        student.dateTo,
      )

      const studentDetails: StudentDetails = {
        ...student,
        dailyAttendance: dailyAttendance.map((att: any) => ({
          date: att.attendanceDate,
          attendance: att.attendance,
          note: att.note || '',
          studentAttendanceId: att.studentAttendanceId,
        })),
      }

      setSelectedStudent(studentDetails)
      setShowDetailsModal(true)
    } catch (err: any) {
      console.error(' Error fetching student details:', err)
      toast.error(` Error: ${err.message || 'Failed to fetch student details'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (ids.length === 0) {
      toast.error('Please select at least one student to delete their attendance')
      return
    }

    const confirmDelete = await confirmToast(
      Text.Delete_A ||
        `Are you sure you want to delete all attendance records for ${ids.length} students?`,
    )

    if (confirmDelete) {
      try {
        setIsLoading(true)

        const allAttendanceIds: number[] = []

        for (const id of ids) {
          const numericId = typeof id === 'string' ? parseInt(id, 10) : id
          const student = reportData.find((s) => s.studentId === numericId)

          if (student) {
            const dailyAttendance = await attendanceService.getByStudentAndDateRange(
              String(student.studentId),
              student.dateFrom,
              student.dateTo,
            )

            dailyAttendance.forEach((att: any) => {
              if (att.studentAttendanceId) {
                allAttendanceIds.push(att.studentAttendanceId)
              }
            })
          }
        }

        if (allAttendanceIds.length === 0) {
          toast.error(' No attendance records found to delete')
          setIsLoading(false)
          return
        }


        await attendanceService.deleteMultiple(allAttendanceIds)

        toast.success(
          ` Successfully deleted ${allAttendanceIds.length} attendance records for ${ids.length} students`,
        )

        if (currentFilters) {
          await fetchMonthlyReport(
            currentFilters.classId,
            currentFilters.sectionId,
            currentFilters.dateFrom,
            currentFilters.dateTo,
          )
        }
      } catch (err: any) {
        console.error(' Error deleting multiple:', err)
        toast.error(` Error: ${err.message || 'Failed to delete attendance records'}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const columns = [
    { label: Text.Student_Name || 'Student Name', key: 'studentName' },
    { label: Text.Roll_No || 'Roll No', key: 'rollNo' },
    { label: 'Total Days', key: 'totalDays' },
    { label:Text.Present || 'Present', key: 'presentDays' },
    { label: Text.Absent || 'Absent', key: 'absentDays' },
    { label: Text.Late || 'Late', key: 'lateDays' },
    { label: Text.Half_Day || 'Half Day', key: 'halfDays' },
    {
      label: Text.Attendance ||'Attendance %',
      key: 'attendancePercentage',
      render: (value: number) => `${value.toFixed(2)}%`,
    },
  ]

  const handleSchoolChange = () => {
    setReportData([])
    setShowTable(false)
    setFilteredStudentIds(null)
    setCurrentFilters(null)
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 py-4 sm:px-2 md:px-4 md:py-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-6 md:p-10 shadow-sm">
          <h1 className="font-medium text-xl sm:text-2xl md:text-3xl capitalize mb-4 sm:mb-5 md:mb-6">
            {'Monthly Attendance Report'}
          </h1>
          <hr className="border-[#A9A4A4] mb-4 sm:mb-5 md:mb-6 w-full" />

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            onSchoolChange={handleSchoolChange}
            queryKeys={['sections', 'schoolClasses']}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              <Dropdown
                label={Text.Class || 'Class'}
                name="class"
                control={control}
                required={true}
                options={classOptions}
              />
              <Dropdown
                label={Text.Section || 'Section'}
                name="section"
                control={control}
                required={true}
                options={sectionOptions}
              />
              <PastDateField
                label={Text.Date_From || 'Date From'}
                name="dateFrom"
                control={control}
                required={true}
              />
              <DateField
                label={Text.Date_To || 'Date To'}
                name="dateTo"
                control={control}
                required={true}
              />
            </div>
            <div className="sm:col-span-4 flex justify-end mt-4">
              <Button
                name={Text.Search || 'Search'}
                loading={isLoading}
                isDisable={isLoading}
                icon={<IconField name="FaSearch" />}
                showAlways={true}
              />
            </div>
          </AllSchoolDropdown>

          {isLoading && (
            <div className="mt-8 flex justify-center items-center p-10">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Generating report...</p>
              </div>
            </div>
          )}

          {showTable && !isLoading && (
            <div className="mt-8">
              <ControlledTable
                title={'Monthly Attendance Report'}
                columns={columns}
                data={pagedReportData.filter((student) =>
                  student.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
                )}
                fullData={visibleReportData}
                searchTerm={searchTerm}
                onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                onView={(id) => handleViewDetails(id)}
                onDeleteMultiple={handleDeleteMultiple}
                showSelectAll={false}
                enablePermissions={true}
                permissionScope="ATTENDANCE"
                serverPage={page}
                serverTotalPages={totalPages}
                serverTotalItems={totalItems}
                serverPageSize={pageSize}
                onServerPageChange={handlePageChange}
                onServerPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{'Attendance Details'}</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedStudent(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <IconField name="FaTimes" size={24} />
              </button>
            </div>

            {/* Student Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{Text.Student_Name || 'Student Name'}</p>
                <p className="font-semibold">{selectedStudent.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{Text.Roll_No || 'Roll No'}</p>
                <p className="font-semibold">{selectedStudent.rollNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{Text.Class || 'Class'}</p>
                <p className="font-semibold">{selectedStudent.className}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{Text.Section || 'Section'}</p>
                <p className="font-semibold">{selectedStudent.sectionName}</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">{Text.Total_Days || 'Total Days'}</p>
                <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalDays}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">{Text.Present || 'Present'}</p>
                <p className="text-2xl font-bold text-green-600">{selectedStudent.presentDays}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">{Text.Absent || 'Absent'}</p>
                <p className="text-2xl font-bold text-red-600">{selectedStudent.absentDays}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">{Text.Late || 'Late'}</p>
                <p className="text-2xl font-bold text-yellow-600">{selectedStudent.lateDays}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">{Text.Holiday || 'Holiday'}</p>
                <p className="text-2xl font-bold text-purple-600">{selectedStudent.holidayDays}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">{Text.Half_Day || 'Half Day'}</p>
                <p className="text-2xl font-bold text-indigo-600">{selectedStudent.halfDays}</p>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">{Text.Overall_Attendance || 'Overall Attendance'}</p>
              <p className="text-4xl font-bold text-indigo-600">
                {selectedStudent.attendancePercentage.toFixed(1)}%
              </p>
            </div> 

            {/* Daily Attendance Table */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold mb-3">{Text.Daily_Attendance || 'Daily Attendance'}</h3>
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">
                      {Text.Date || 'Date'}
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">
                      {Text.Status || 'Status'}
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">
                      {Text.Note || 'Note'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.dailyAttendance.length > 0 ? (
                    selectedStudent.dailyAttendance.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border text-sm">{record.date}</td>
                        <td className="px-4 py-2 border">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(record.attendance)}`}
                          >
                            {getStatusDisplayName(record.attendance)}
                          </span>
                        </td>
                        <td className="px-4 py-2 border text-sm text-gray-600">
                          {record.note || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No daily attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                name={Text.Close || 'Close'}
                loading={false}
                isDisable={false}
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedStudent(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthlyAttendanceReport

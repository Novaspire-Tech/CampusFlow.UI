import React, { useState, useEffect, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import Dropdown from '../../../components/controlled/Dropdown'
import DateField from '../../../components/controlled/DateField'
import TextField from '../../../components/controlled/TextField'
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
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface Student {
  id: number
  studentAttendanceId: number
  studentId: number
  name: string
  rollNo: string
  attendance: string
  class: string
  className: string
  classId: number
  section: string
  sectionName: string
  sectionId: number
  attendanceDate: string
  note: string
  admissionNo: string
}

const AttendanceByDate: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t);

  const { data: classesData } = useSchoolClasses()

  const { control, handleSubmit, watch, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      class: '',
      section: '',
      attendanceDate: '',
    },
  })

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    reset: resetEdit,
  } = useForm<FieldValues>({
    defaultValues: {
      attendance: '',
      note: '',
    },
  })

  const [studentData, setStudentData] = useState<Student[]>([])
  const [showTable, setShowTable] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [showEditForm, setShowEditForm] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0)

  const [filteredStudentIds, setFilteredStudentIds] = useState<Set<string> | null>(null)

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

  const attendanceOptions = [
    { value: StudentAttendanceStatus.PRESENT, label: Text.Present || 'Present' },
    { value: StudentAttendanceStatus.ABSENT, label: Text.Absent || 'Absent' },
    { value: StudentAttendanceStatus.LATE, label: Text.Late || 'Late' },
    { value: StudentAttendanceStatus.HOLIDAY, label: Text.Holiday || 'Holiday' },
    { value: StudentAttendanceStatus.HALFDAY, label: Text.Half_Day || 'Half Day' },
  ]

  const fetchAttendanceData = async (classId: number, sectionId: number, date: string) => {
    try {
      setIsLoading(true)


      const response = await attendanceService.getByClassSectionAndDate(classId, sectionId, date)
      if (response && response.length > 0) {
        const mappedData: Student[] = response.map((item: any) => ({
          id: item.studentId,
          studentAttendanceId: item.studentAttendanceId,
          studentId: item.studentId,
          name: item.studentName,
          rollNo: item.rollNo,
          admissionNo: item.admissionNo,
          attendance: item.attendance,
          class: item.className,
          className: item.className,
          classId: item.classId,
          section: item.sectionName,
          sectionName: item.sectionName,
          sectionId: item.sectionId,
          attendanceDate: item.attendanceDate,
          note: item.note || '',
        }))

        setStudentData(mappedData)
        setShowTable(true)
        toast.success(` Found ${mappedData.length} attendance record`)
      } else {
        setStudentData([])
        setShowTable(false)
        toast.error(' No attendance records found for the selected criteria')
      }
    } catch (err: any) {
      console.error(' Error fetching attendance:', err)
      toast.error(` Error: ${err.message || 'Failed to fetch attendance data'}`)
      setStudentData([])
      setShowTable(false)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FieldValues) => {
    const { class: cls, section, attendanceDate } = data

    if (!cls || !section || !attendanceDate) {
      toast.error(' Please fill in all fields (Class, Section, and Date)')
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

    await fetchAttendanceData(Number(cls), Number(section), attendanceDate)
    reset()
  }

  const visibleStudentData = useMemo(() => {
    if (!filteredStudentIds || filteredStudentIds.size === 0) return studentData
    return studentData.filter((s) => filteredStudentIds.has(String(s.studentId)))
  }, [studentData, filteredStudentIds])

  const handleDelete = async (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id
    const student = studentData.find((s) => s.id === numericId)

    if (!student) {
      toast.error(' Error: Student not found')
      return
    }

    const confirmDelete = await confirmToast(
      Text.Do_you_want_to_delete_this_entry ||
        'Do you want to delete this attendance record?',
    )

    if (confirmDelete) {
      try {
        await attendanceService.delete(String(student.studentAttendanceId))
        setStudentData((prev) => prev.filter((s) => s.id !== numericId))
        toast.success(' Attendance record deleted successfully')
      } catch (err: any) {
        console.error('Error deleting:', err)
        toast.error(` Error: ${err.message || 'Failed to delete attendance record'}`)
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (ids.length === 0) {
      toast.error(' Please select at least one record to delete')
      return
    }

    const confirmDelete = await confirmToast(
     Text.Delete_A || `Are you sure you want to delete ${ids.length} record(s)?`,
    )

    if (confirmDelete) {
      try {
        const attendanceIds = studentData
          .filter((s) => ids.includes(s.id))
          .map((s) => s.studentAttendanceId)

        await attendanceService.deleteMultiple(attendanceIds)
        setStudentData((prev) => prev.filter((s) => !ids.includes(s.id)))
        toast.success(`${ids.length} attendance records deleted successfully`)
      } catch (err: any) {
        console.error(' Error deleting multiple:', err)
        toast.error(` Error: ${err.message || 'Failed to delete attendance records'}`)
      }
    }
  }

  const handleEdit = (student: Student) => {
    setEditStudent(student)
    setEditValue('attendance', student.attendance)
    setEditValue('note', student.note)
    setShowEditForm(true)
  }

  const onEditSubmit = async (data: FieldValues) => {
    if (!editStudent) return

    try {
      setIsSubmitting(true)

      const updatePayload = {
        studentId: editStudent.studentId,
        attendance: data.attendance as StudentAttendanceStatus,
        note: data.note || '',
        attendanceDate: editStudent.attendanceDate,
        studentName: editStudent.name,
        rollNo: editStudent.rollNo,
        admissionNo: editStudent.admissionNo,
        classId: editStudent.classId,
        className: editStudent.className,
        sectionId: editStudent.sectionId,
        sectionName: editStudent.sectionName,
      }


      const updated = await attendanceService.update(
        String(editStudent.studentAttendanceId),
        updatePayload,
      )

      console.log('Updated successfully:', updated)

      setStudentData((prev) =>
        prev.map((s) =>
          s.id === editStudent.id
            ? { ...s, attendance: data.attendance, note: data.note || '' }
            : s,
        ),
      )

      toast.success('Attendance updated successfully')
      setShowEditForm(false)
      setEditStudent(null)
      resetEdit()
    } catch (err: any) {
      console.error(' Error updating:', err)
      toast.error(` Error: ${err.message || 'Failed to update attendance'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    { label: Text.Name || 'Name', key: 'name' },
    { label: Text.Roll_No || 'Roll No', key: 'rollNo' },
    { label:Text.Attendance || 'Attendance', key: 'attendance' },
    { label: Text.Class || 'Class', key: 'class' },
    { label: Text.Section || 'Section', key: 'section' },
    { label: Text.Attendance_Date || 'Date', key: 'attendanceDate' },
    { label: Text.Note || 'Note', key: 'note' },
  ]

  const handleSchoolChange = () => {
    setStudentData([])
    setShowTable(false)
    setFilteredStudentIds(null)
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 py-4 sm:px-2 md:px-4 md:py-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-6 md:p-10 shadow-sm">
          <h1 className="font-medium text-xl sm:text-2xl md:text-3xl capitalize mb-4 sm:mb-5 md:mb-6">
            {Text.Select_Criteria || 'Select Criteria'}
          </h1>
          <hr className="border-[#A9A4A4] mb-4 sm:mb-5 md:mb-6 w-full" />
          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            onSchoolChange={handleSchoolChange}
            queryKeys={['sections', 'schoolClasses']}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
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
              <DateField
                label={Text.Attendance_Date || 'Attendance Date'}
                name="attendanceDate"
                control={control}
                required={true}
                onlyToday
              />
            </div>
            <div className="sm:col-span-3 flex justify-end mt-4">
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
                <p className="text-gray-600">Loading attendance records...</p>
              </div>
            </div>
          )}

          {showTable && !isLoading && (
            <div className="mt-8">
              <ControlledTable
                title={Text.Student_Attendance || 'Student Attendance'}
                columns={columns}
                data={visibleStudentData.filter((student) =>
                  student.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )}
                fullData={visibleStudentData}
                searchTerm={searchTerm}
                onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                onEdit={(id) => {
                  const student = studentData.find((s) => s.id === id)
                  if (student) handleEdit(student)
                }}
                onDelete={handleDelete}
                onDeleteMultiple={handleDeleteMultiple}
                showSelectAll={true}
                enablePermissions={true}
                permissionScope="ATTENDANCE"
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditForm && editStudent && (
        <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl shadow-2xl relative">
            <h2 className="text-xl font-semibold mb-4">
              {Text.Edit_Attendance || 'Edit Attendance'}
            </h2>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>{Text.Student_Name || 'Student Name'}:</strong> {editStudent.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{Text.Roll_No || 'Roll No'}:</strong> {editStudent.rollNo}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{Text.Date || 'Date'}:</strong> {editStudent.attendanceDate}
              </p>
            </div>

            <form onSubmit={handleEditSubmit(onEditSubmit)} className="grid gap-4">
              <Dropdown
                label={Text.Attendance || 'Attendance'}
                name="attendance"
                control={editControl}
                required
                options={attendanceOptions}
              />
              <TextField
                label={Text.Note || 'Note'}
                name="note"
                control={editControl}
                placeholder={Text.Add_Note || 'Add Note'}
              />
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  name={Text.Cancel || 'Cancel'}
                  loading={false}
                  isDisable={isSubmitting}
                  onClick={() => {
                    setEditStudent(null)
                    setShowEditForm(false)
                    resetEdit()
                  }}
                />
                <Button
                  name={Text.Update || 'Update'}
                  loading={isSubmitting}
                  isDisable={isSubmitting}
                  icon={<IconField name="FaSave" />}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceByDate

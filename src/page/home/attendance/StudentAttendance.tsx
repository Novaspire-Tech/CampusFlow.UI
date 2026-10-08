import React, { useState, useEffect, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import Dropdown from '../../../components/controlled/Dropdown'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useStudentAttendance } from '../../../hooks/queries/attendence/useStudentAttendance'
import { StudentAttendanceStatus } from '../../../types/attendence/attendancetypes'
import { PastDateField } from '../../../components/controlled'
import { studentService } from '../../../services/studentInformation/studentService'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import RadioButton from '../../../components/controlled/RadioButton'
import TextField from '../../../components/controlled/TextField'

const StudentAttendance: React.FC = () => {
  const { t } = useTranslation()
 const Text = getPagesDataText(t);


  const { data: classesData } = useSchoolClasses()
  const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0)
  const { data: sectionsData } = useSections(selectedClassForSections)

  const [isFiltering, setIsFiltering] = useState(false)
  const [filteredStudentIds, setFilteredStudentIds] = useState<Set<string> | null>(null)

  const {
    attendanceData,
    showTable,
    isLoading: isLoadingAttendance,
    isSubmitting,
    searchStudents,
    handleAttendanceChange,
    handleNoteChange,
    setAttendanceForAll,
    saveAttendance,
  } = useStudentAttendance()

  const { handleSubmit, control, watch, setValue } = useForm<FieldValues>({
    defaultValues: {
      classId: '',
      sectionId: '',
      attendanceDate: '',
      setAllAttendance: '',
    },
  })

  const watchClass = watch('classId')
  const watchSetAll = watch('setAllAttendance')

  useEffect(() => {
    if (watchClass) {
      setSelectedClassForSections(Number(watchClass))
      setValue('sectionId', '')
    }
  }, [watchClass, setValue])

  useEffect(() => {
    if (watchSetAll) {
      setAttendanceForAll(watchSetAll as StudentAttendanceStatus)
    }
  }, [watchSetAll])

  useEffect(() => {
    attendanceData.forEach((student) => {
      setValue(`note_${student.studentId}`, student.note ?? '')
    })
  }, [attendanceData, setValue])

  const onSubmit = async (data: FieldValues) => {
    setIsFiltering(true)
    setFilteredStudentIds(null)

    try {
      const params: any = {}
      if (data.classId) params.schoolClassId = Number(data.classId)
      if (data.sectionId) params.sectionId = Number(data.sectionId)

      const result = await studentService.searchAllPages(params, 'admissionNo', 'asc')

      const idSet = new Set<string>(
        (result.students || []).map((s: any) => String(s.studentId || s.id)),
      )
      setFilteredStudentIds(idSet)
    } catch {
      setFilteredStudentIds(null)
    } finally {
      setIsFiltering(false)
    }

    await searchStudents({
      classId: data.classId,
      sectionId: data.sectionId,
      attendanceDate: data.attendanceDate,
    })
  }

  const handleSaveAttendance = async () => {
    await saveAttendance()
  }

  const handleSingleAttendanceChange = (studentId: number, value: StudentAttendanceStatus) => {
    handleAttendanceChange(studentId, value)
  }

  const visibleAttendanceData = useMemo(() => {
    if (!filteredStudentIds || filteredStudentIds.size === 0) return attendanceData
    return attendanceData.filter((s) => filteredStudentIds.has(String(s.studentId)))
  }, [attendanceData, filteredStudentIds])

  const classOptions = useMemo(() => {
    return (
      classesData?.map((cls: any) => ({
        value: cls.id || cls.schoolClassId,
        label: cls.name || cls.className,
      })) || []
    )
  }, [classesData])

  const sectionOptions = useMemo(() => {
    return (
      sectionsData?.map((sec: any) => ({
        value: sec.id || sec.sectionId,
        label: sec.name || sec.sectionName,
      })) || []
    )
  }, [sectionsData])

  const columns = [
    { key: 'name', label: Text.Name || 'Name' },
    { key: 'rollNo', label: Text.Roll_No || 'Roll No' },
    { key: 'attendance', label: Text.Attendance || 'Attendance' },
    { key: 'note', label: Text.Note || 'Note' },
  ]

  const attendanceStatuses = [
    { value: StudentAttendanceStatus.PRESENT, label: Text.Present || 'Present' },
    { value: StudentAttendanceStatus.LATE, label: Text.Late || 'Late' },
    { value: StudentAttendanceStatus.ABSENT, label: Text.Absent || 'Absent' },
    { value: StudentAttendanceStatus.HOLIDAY, label: Text.Holiday || 'Holiday' },
    { value: StudentAttendanceStatus.HALFDAY, label: Text.Half_Day || 'HalfDay' },
  ]

  const hasExistingAttendance = visibleAttendanceData.some((s) => s.studentAttendanceId)
  const buttonText = Text.Save_Attendance || 'Save Attendance'

  const isLoading = isLoadingAttendance || isFiltering

  const handleSchoolChange = () => {
    setFilteredStudentIds(null)
  }

  const handleSaveWithSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveAttendance()
  }

  if (isLoading && !showTable) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col overflow-auto">
      <div className="w-full max-w-7xl mx-auto mt-4 p-4 sm:p-6 lg:p-8 bg-white border border-gray-300 rounded-lg shadow-md">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
          {Text.Select_Criteria || 'Select Criteria'}
        </h1>
        <hr className="border-gray-300 mb-4" />

        <AllSchoolDropdown
          onSubmit={handleSubmit(onSubmit)}
          onSchoolChange={handleSchoolChange}
          queryKeys={['sections', 'schoolClasses']}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Dropdown
              label={Text.Class || 'Class'}
              name="classId"
              control={control}
              required
              options={classOptions}
            />
            <Dropdown
              label={Text.Section || 'Section'}
              name="sectionId"
              control={control}
              required
              options={sectionOptions}
            />
            <PastDateField
              name="attendanceDate"
              label={Text.Attendance_Date || 'Attendance Date'}
              control={control}
              required
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              name={Text.Search || 'Search'}
              loading={isLoading}
              isDisable={isLoading}
              icon={<IconField name="FaSearch" />}
              enablePermissions={true}
              permissionScope="ATTENDANCE"
              showAlways={true}
            />
          </div>
        </AllSchoolDropdown>
      </div>

      {isFiltering && (
        <div className="w-full max-w-7xl mx-auto mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
          <IconField name="FaSpinner" size={14} className="animate-spin" />
          <span>Fetching students from server...</span>
        </div>
      )}

      {showTable && (
        <div className="w-full max-w-7xl mx-auto mt-6 p-4 bg-white border border-gray-300 rounded-lg shadow-md">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {Text.Total_Students || 'Total Students'} : {visibleAttendanceData.length}
              </div>
              {hasExistingAttendance && (
                <div className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  Has Existing Records
                </div>
              )}
            </div>
            <div className="flex items-end gap-3">
              <AllSchoolDropdown
                onSubmit={handleSaveWithSchool}
                onSchoolChange={handleSchoolChange}
                queryKeys={['studentAttendance']}
                className="flex items-end gap-3"
              >
                <Button
                  name={buttonText}
                  loading={isSubmitting}
                  isDisable={isSubmitting}
                  onClick={handleSaveAttendance}
                  icon={<IconField name="FaSave" />}
                  enablePermissions={true}
                  permissionScope="ATTENDANCE"
                  showAlways={true}
                />
              </AllSchoolDropdown>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <RadioButton
              name="setAllAttendance"
              label={
                Text.Set_attendance_for_all_students_as ||
                'Set attendance for all students as'
              }
              control={control}
              options={attendanceStatuses}
            />
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b">
                  {columns.map((col) => (
                    <th key={col.key} className="py-2 px-4 text-left">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleAttendanceData.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        {student.studentName}
                        {student.studentAttendanceId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Existing
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-4">{student.rollNo}</td>

                    <td className="py-2 px-4">
                      <div className="flex flex-wrap gap-2">
                        {attendanceStatuses.map((status) => (
                          <label
                            key={status.value}
                            className="flex items-center cursor-pointer whitespace-nowrap"
                          >
                            <input
                              type="radio"
                              name={`desk_attendance_${student.studentId}`}
                              value={status.value}
                              checked={student.attendance === status.value}
                              onChange={() =>
                                handleSingleAttendanceChange(student.studentId, status.value)
                              }
                              className="cursor-pointer"
                              disabled={!Permissions}
                            />
                            <span className="ml-1">{status.label}</span>
                          </label>
                        ))}
                      </div>
                    </td>

                    <td className="py-2 px-4">
                      <TextField
                        name={`note_${student.studentId}`}
                        control={control}
                        placeholder={Text.Add_Note || 'Add Note'}
                        disabled={!Permissions}
                        onChange={(value) => handleNoteChange(student.studentId, value)}
                        inputClassName="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden flex flex-col gap-3">
            {visibleAttendanceData.map((student) => (
              <div
                key={student.studentId}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">
                      {student.studentName}
                    </span>
                    {student.studentAttendanceId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Existing
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                    {Text.Roll_No || 'Roll No'}: {student.rollNo}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {Text.Attendance || 'Attendance'}:
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {attendanceStatuses.map((status) => (
                      <label key={status.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`mob_attendance_${student.studentId}`}
                          value={status.value}
                          checked={student.attendance === status.value}
                          onChange={() =>
                            handleSingleAttendanceChange(student.studentId, status.value)
                          }
                          className="cursor-pointer"
                          disabled={!Permissions}
                        />
                        <span className="ml-1 text-sm">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <TextField
                    name={`note_${student.studentId}`}
                    label={Text.Note || 'Note'}
                    control={control}
                    placeholder={Text.Add_Note || 'Add note...'}
                    disabled={!Permissions}
                    onChange={(value) => handleNoteChange(student.studentId, value)}
                    inputClassName="p-2 border rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentAttendance
 
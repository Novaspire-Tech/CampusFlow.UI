import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useForm, type SubmitHandler, useFieldArray, type Control } from 'react-hook-form'
import { Button, Dropdown, NumberField } from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'

import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useStudents } from '../../../hooks/queries/studentInformation/useStudents'
import { useExamGroupsByClass } from '../../../hooks/queries/examination/useExamGroup'
import { useExamSchedules } from '../../../hooks/queries/examination/useExamSchedule'

import {
  useMarksManagements,
  useCreateMarksManagement,
  useUpdateMarksManagement,
  useDeleteMarksManagement,
  useDeleteMultipleMarksManagements,
} from '../../../hooks/queries/academics/useMarksManagement'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface SearchFormInputs {
  schoolClassId?: number
  examGroupId?: number
}

interface SubjectMarkEntry {
  subjectId: string | number
  subjectName: string
  subjectType: string
  totalMarks: string
  obtainMarks: string
}

interface ModalFormInputs {
  examGroupId: string
  marks: SubjectMarkEntry[]
}

interface Student {
  id: number | string
  admissionNo: string
  studentName: string
  class: string
  classId?: number | string
  section?: string
  sectionId?: string | number
  fatherName: string
  motherName?: string
  rollNo?: string
  dob: string
  gender: string
  mobile: string
  examGroupId?: string
  examGroupName?: string
  marks?: SubjectMarkEntry[]
  marksSummary?: string
  totalScore?: string
  marksRecordId?: string
  allMarksRecords?: any[]
  allExamGroupsDisplay?: string
  allMarksDisplay?: string
  allScoresDisplay?: string
}

const MarksManagement = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)


  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    watch: watchSearch,
    setValue: setSearchValue,
  } = useForm<SearchFormInputs>({
    defaultValues: {
      schoolClassId: undefined,
      examGroupId: undefined,
    },
  })
  const {
    control: modalControl,
    handleSubmit: handleModalSubmit,
    reset: resetModalForm,
    watch: watchModal,
  } = useForm<ModalFormInputs>({ defaultValues: { examGroupId: '', marks: [] } })

  const { fields, replace } = useFieldArray({ control: modalControl, name: 'marks' })

  const selectedSearchClassId = watchSearch('schoolClassId')
  const selectedSearchExamGroupId = watchSearch('examGroupId')
  const selectedModalExamGroupId = watchModal('examGroupId')

  const [students, setStudents] = useState<Student[]>([])
  const [results, setResults] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [selectedStudentData, setSelectedStudentData] = useState<Student | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(0, 100, 'asc')
  const { data: classesData } = useSchoolClasses()

  const { data: examGroupsByClass = [] } = useExamGroupsByClass(
    selectedSearchClassId && selectedSearchClassId > 0 ? Number(selectedSearchClassId) : undefined,
  )

  useEffect(() => {
    if (selectedSearchClassId && examGroupsByClass.length > 0) {
      const firstExamGroup = examGroupsByClass[0]
      if (firstExamGroup) {
        setSearchValue('examGroupId', Number(firstExamGroup.examGroupId || firstExamGroup.id), {
          shouldDirty: true,
        })
      }
    } else {
      setSearchValue('examGroupId', undefined, { shouldDirty: true })
    }
  }, [selectedSearchClassId, examGroupsByClass, setSearchValue])

  const { data: examSchedulesData, isLoading: isLoadingExamSchedules } = useExamSchedules(
    selectedSearchClassId && selectedSearchExamGroupId
      ? {
        schoolClassId: selectedSearchClassId.toString(),
        examGroupId: selectedSearchExamGroupId.toString(),
      }
      : undefined,
  )

  const { data: marksData, isLoading: isLoadingMarks } = useMarksManagements()
  const createMarksMutation = useCreateMarksManagement()
  const updateMarksMutation = useUpdateMarksManagement()
  const deleteMarksMutation = useDeleteMarksManagement()
  const deleteMultipleMarksMutation = useDeleteMultipleMarksManagements()

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: Number(c.id || c.schoolClassId),
      })) || [],
    [classesData],
  )

  const examGroupOptions = useMemo(
    () =>
      examGroupsByClass?.map((eg: any) => ({
        label: eg.examGroupName || eg.name,
        value: Number(eg.examGroupId || eg.id),
      })) || [],
    [examGroupsByClass],
  )

  useEffect(() => {
    if (!studentsData?.students) return

    const mapped: Student[] = studentsData.students.map((s: any) => {
      const allStudentMarksRecords =
        marksData?.filter((m: any) => String(m.studentId) === String(s.id || s.studentId)) || []

      const latestMarksRecord = allStudentMarksRecords.length > 0 ? allStudentMarksRecords[0] : null

      let marks: SubjectMarkEntry[] = []
      let examGroupId = ''
      let examGroupName = ''
      let marksSummary = ''
      let totalScore = ''
      let marksRecordId = ''

      if (latestMarksRecord) {
        marksRecordId = String(latestMarksRecord.id || latestMarksRecord.marksManagementId) || ''
        examGroupId = latestMarksRecord.examGroupId?.toString() || ''
        examGroupName =
          latestMarksRecord.examGroupName ||
          examGroupOptions.find((opt) => opt.value === Number(examGroupId))?.label ||
          ''

        const backendMarks = latestMarksRecord.marks || []
        if (Array.isArray(backendMarks) && backendMarks.length > 0) {
          marks = backendMarks.map((m: any) => {
            const obtainedValue =
              m.totalObtainMarks ??
              m.marks_obtained ??
              m.marksObtained ??
              m.obtainMarks ??
              m.obtained_marks ??
              0
            const totalValue = m.totalMarks ?? m.total_marks ?? 0
            return {
              subjectId: m.subjectId,
              subjectName: m.subjectName || 'Unknown',
              subjectType: m.subjectType || 'Theory',
              totalMarks: String(totalValue),
              obtainMarks: String(obtainedValue),
            }
          })

          marksSummary = marks.map((m) => `${m.subjectName}: ${m.obtainMarks}`).join(', ')

          const totalObtain = marks.reduce((sum, m) => sum + Number(m.obtainMarks), 0)
          const totalMax = marks.reduce((sum, m) => sum + Number(m.totalMarks), 0)
          totalScore = `${totalObtain}/${totalMax}`
        }
      }

      let allExamGroupsDisplay = ''
      let allMarksDisplay = ''
      let allScoresDisplay = ''

      if (allStudentMarksRecords.length > 0) {
        const examGroupNames: string[] = []
        const marksSummaries: string[] = []
        const scores: string[] = []

        allStudentMarksRecords.forEach((record: any) => {
          const egId = record.examGroupId?.toString() || ''
          const egName =
            record.examGroupName ||
            examGroupOptions.find((opt) => opt.value === Number(egId))?.label ||
            'Unknown'

          examGroupNames.push(egName)

          const recordMarks = record.marks || []
          if (Array.isArray(recordMarks) && recordMarks.length > 0) {
            const totalObtain = recordMarks.reduce((sum: number, m: any) => {
              const obtainedValue =
                m.totalObtainMarks ??
                m.marks_obtained ??
                m.marksObtained ??
                m.obtainMarks ??
                m.obtained_marks ??
                0
              return sum + Number(obtainedValue)
            }, 0)
            const totalMax = recordMarks.reduce((sum: number, m: any) => {
              const totalValue = m.totalMarks ?? m.total_marks ?? 0
              return sum + Number(totalValue)
            }, 0)

            scores.push(`${egName}: ${totalObtain}/${totalMax}`)

            const subjectMarks = recordMarks
              .map((m: any) => {
                const obtainedValue =
                  m.totalObtainMarks ??
                  m.marks_obtained ??
                  m.marksObtained ??
                  m.obtainMarks ??
                  m.obtained_marks ??
                  0
                return `${m.subjectName}: ${obtainedValue}`
              })
              .join(', ')

            marksSummaries.push(`${egName} (${subjectMarks})`)
          }
        })

        allExamGroupsDisplay = examGroupNames.join(' | ')
        allMarksDisplay = marksSummaries.join(' || ')
        allScoresDisplay = scores.join(' | ')
      }

      return {
        id: s.id || s.studentId,
        admissionNo: s.admissionNo || '',
        studentName: `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim(),
        class: s.className || '',
        classId: s.classId,
        section: s.sectionName || '',
        sectionId: s.sectionId,
        fatherName: s.fatherName || 'N/A',
        motherName: s.motherName || 'N/A',
        rollNo: s.rollNo || '',
        dob: s.dob || '',
        gender: s.gender || '',
        mobile: s.phoneNumber || '',
        marks,
        examGroupId,
        examGroupName,
        marksSummary,
        totalScore,
        marksRecordId,
        allMarksRecords: allStudentMarksRecords,
        allExamGroupsDisplay,
        allMarksDisplay,
        allScoresDisplay,
      }
    })

    setStudents(mapped)
    if (results.length > 0) {
      setResults((prev) => prev.map((r) => mapped.find((m) => String(m.id) === String(r.id)) || r))
    }
  }, [studentsData, marksData, examGroupOptions])

  useEffect(() => {
    if (!selectedModalExamGroupId || !selectedStudentData) return

    const studentMarksForExamGroup = selectedStudentData.allMarksRecords?.find(
      (record: any) => String(record.examGroupId) === String(selectedModalExamGroupId),
    )

    if (studentMarksForExamGroup) {
      const existingMarks = (studentMarksForExamGroup.marks || []).map((m: any) => {
        const obtainedValue =
          m.totalObtainMarks ??
          m.marks_obtained ??
          m.marksObtained ??
          m.obtainMarks ??
          m.obtained_marks ??
          0
        const totalValue = m.totalMarks ?? m.total_marks ?? 0
        return {
          subjectId: m.subjectId,
          subjectName: m.subjectName || 'Unknown',
          subjectType: m.subjectType || 'Theory',
          totalMarks: String(totalValue),
          obtainMarks: String(obtainedValue),
        }
      })
      replace(existingMarks)
    } else {
      if (isViewMode) {
        replace([])
        return
      }

      if (
        !examSchedulesData ||
        !Array.isArray(examSchedulesData) ||
        examSchedulesData.length === 0
      ) {
        replace([])
        return
      }

      const emptyMarks: SubjectMarkEntry[] = examSchedulesData.map((schedule: any) => ({
        subjectId: schedule.subjectId || schedule.subject?.id || '',
        subjectName: schedule.subjectName || schedule.subject?.subjectName || 'Unknown Subject',
        subjectType: schedule.subjectType || schedule.subject?.subjectType || 'Theory',
        totalMarks: String(schedule.totalMarks || schedule.total_marks || ''),
        obtainMarks: '',
      }))
      replace(emptyMarks)
    }
  }, [selectedModalExamGroupId, selectedStudentData, examSchedulesData, replace, isViewMode])

  const onSearchSubmit: SubmitHandler<SearchFormInputs> = (data) => {
    if (!data.examGroupId) {
      toast.error('Please select an Exam Group')
      setErrorMessage('Please select an Exam Group')
      return
    }

    if (!data.schoolClassId) {
      toast.error('Please select a Class')
      setErrorMessage('Please select a Class')
      return
    }

    if (isLoadingExamSchedules) {
      toast.info('Loading exam schedule data...')
      setErrorMessage('Loading exam schedule data...')
      return
    }

    if (!examSchedulesData || examSchedulesData.length === 0) {
      toast.warning('No exam schedule found for selected class and exam group!')
      setErrorMessage('No exam schedule found for selected class and exam group!')
      setResults([])
      return
    }

    const filtered = students.filter(
      (s) => !data.schoolClassId || String(s.classId) === String(data.schoolClassId),
    )
    setResults(filtered)
    setErrorMessage('')

    if (filtered.length === 0) {
      toast.info('No students found for the selected class')
    } else {
      toast.success(`Found ${filtered.length} student${filtered.length !== 1 ? 's' : ''}`)
    }
  }

  const filteredResults = results.filter((s) =>
    [s.studentName, s.admissionNo, s.rollNo, s.class].some((v) =>
      v?.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  const handleView = (idOrIndex: string | number) => {
    let student = students.find((s) => String(s.id) === String(idOrIndex))
    if (!student && typeof idOrIndex === 'number') student = filteredResults[idOrIndex]

    if (!student || !student.allMarksRecords || student.allMarksRecords.length === 0) {
      toast.warning(Text.No_Marks_Data_Available_For_This_Student)
      return
    }

    const firstRecord = student.allMarksRecords[0]
    const firstExamGroupId = firstRecord.examGroupId?.toString() || ''

    const firstMarks = (firstRecord.marks || []).map((m: any) => {
      const obtainedValue =
        m.totalObtainMarks ??
        m.marks_obtained ??
        m.marksObtained ??
        m.obtainMarks ??
        m.obtained_marks ??
        0
      const totalValue = m.totalMarks ?? m.total_marks ?? 0
      return {
        subjectId: m.subjectId,
        subjectName: m.subjectName || 'Unknown',
        subjectType: m.subjectType || 'Theory',
        totalMarks: String(totalValue),
        obtainMarks: String(obtainedValue),
      }
    })

    setSelectedStudentData(student)
    resetModalForm({ examGroupId: firstExamGroupId, marks: firstMarks })
    replace(firstMarks)
    setIsViewMode(true)
    setShowModal(true)
  }

  const handleAddOrEdit = (idOrIndex: string | number) => {
    if (!selectedSearchExamGroupId) {
      toast.error('Please select an Exam Group in criteria first!')
      setErrorMessage('Please select an Exam Group in criteria first!')
      return
    }

    if (!examSchedulesData || examSchedulesData.length === 0) {
      toast.error('No exam schedule found for selected class and exam group!')
      setErrorMessage('No exam schedule found for selected class and exam group!')
      return
    }

    let student = students.find((s) => String(s.id) === String(idOrIndex))
    if (!student && typeof idOrIndex === 'number') student = filteredResults[idOrIndex]

    if (!student) {
      toast.error('Student not found')
      return
    }

    setErrorMessage('')
    setSelectedStudentData(student)
    setIsViewMode(false)
    resetModalForm({ examGroupId: selectedSearchExamGroupId.toString(), marks: [] })

    const emptyMarks: SubjectMarkEntry[] = examSchedulesData.map((schedule: any) => ({
      subjectId: schedule.subjectId || schedule.subject?.id || '',
      subjectName: schedule.subjectName || schedule.subject?.subjectName || 'Unknown Subject',
      subjectType: schedule.subjectType || schedule.subject?.subjectType || 'Theory',
      totalMarks: String(schedule.totalMarks || schedule.total_marks || ''),
      obtainMarks: '',
    }))

    replace(emptyMarks)
    setShowModal(true)
  }

  const onFinalSubmit: SubmitHandler<ModalFormInputs> = async (formData) => {
    if (!selectedStudentData) {
      toast.error('No student selected')
      return
    }

    const studentId = String(selectedStudentData.id)
    const examGroupId = formData.examGroupId || selectedSearchExamGroupId?.toString() || ''

    if (!studentId || !examGroupId) {
      toast.error('Missing required student information or Exam Group')
      return
    }

    const invalidMarks = formData.marks.some((m) => {
      const obtained = Number(m.obtainMarks || 0)
      const total = Number(m.totalMarks || 0)
      return obtained > total || obtained < 0
    })

    if (invalidMarks) {
      toast.error('Obtained marks cannot be greater than total marks or negative')
      return
    }

    const emptyMarks = formData.marks.filter((m) => !m.obtainMarks || m.obtainMarks.trim() === '')
    if (emptyMarks.length > 0) {
      toast.warning(`Please enter marks for all ${formData.marks.length} subjects`)
      return
    }

    const marksPayload = {
      studentId: Number(studentId),
      examGroupId: Number(examGroupId),
      marks: formData.marks.map((m) => ({
        subjectId: Number(m.subjectId),
        totalMarks: Number(m.totalMarks || 0),
        totalObtainMarks: Number(m.obtainMarks || 0),
      })),
    }

    try {
      const existingRecordForExamGroup = selectedStudentData.allMarksRecords?.find(
        (record: any) => String(record.examGroupId) === String(formData.examGroupId),
      )

      if (existingRecordForExamGroup) {
        const recordId = String(
          existingRecordForExamGroup.id || existingRecordForExamGroup.marksManagementId,
        )
        await updateMarksMutation.mutateAsync({ id: recordId, data: marksPayload })
        toast.success(`Marks updated for ${selectedStudentData.studentName} successfully!`)
      } else {
        await createMarksMutation.mutateAsync(marksPayload)
        toast.success(`Marks added for ${selectedStudentData.studentName} successfully!`)
      }

      setShowModal(false)
      resetModalForm()
      setErrorMessage('')
    } catch (error: any) {
      console.error('Failed to save marks:', error)
      toast.error(error?.message || 'Failed to save marks. Please try again.')
      setErrorMessage('Failed to save marks. Please try again.')
    }
  }

  const handleDelete = async (id: string | number) => {
    const student = students.find((s) => String(s.id) === String(id))

    if (!student?.allMarksRecords || student.allMarksRecords.length === 0) {
      toast.warning('No marks record found to delete')
      return
    }

    if (student.allMarksRecords.length === 1) {
      if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return

      const recordId = String(
        student.allMarksRecords[0].id || student.allMarksRecords[0].marksManagementId,
      )
      try {
        await deleteMarksMutation.mutateAsync(recordId)
        toast.success(`Marks deleted for ${student.studentName} successfully!`)
      } catch (error: any) {
        console.error('Failed to delete marks:', error)
        toast.error(error?.message || 'Failed to delete marks.')
      }
      return
    }

    const examGroupsList = student.allMarksRecords
      .map((record: any, index: number) => {
        const egId = record.examGroupId?.toString() || ''
        const egName =
          record.examGroupName ||
          examGroupOptions.find((opt) => opt.value === Number(egId))?.label ||
          'Unknown'
        return `${index + 1}. ${egName}`
      })
      .join('\n')

    const selectedIndex = prompt(
      `This student has marks in multiple exam groups:\n\n${examGroupsList}\n\nEnter the number of exam group to delete (or 0 to delete all):`,
    )

    if (selectedIndex === null) return

    const indexNum = parseInt(selectedIndex)

    if (indexNum === 0) {
      if (!(await confirmToast(`Are you sure you want to delete marks for ALL exam groups?`)))
        return

      const allRecordIds = student.allMarksRecords.map((r: any) =>
        Number(r.id || r.marksManagementId),
      )

      try {
        await deleteMultipleMarksMutation.mutateAsync(allRecordIds)
        toast.success(`All marks deleted for ${student.studentName} successfully!`)
      } catch (error: any) {
        console.error('Failed to delete all marks:', error)
        toast.error(error?.message || 'Failed to delete marks.')
      }
      return
    }

    if (isNaN(indexNum) || indexNum < 1 || indexNum > student.allMarksRecords.length) {
      toast.error('Invalid selection!')
      return
    }

    const selectedRecord = student.allMarksRecords[indexNum - 1]
    const egId = selectedRecord.examGroupId?.toString() || ''
    const egName =
      selectedRecord.examGroupName ||
      examGroupOptions.find((opt) => opt.value === Number(egId))?.label ||
      'Unknown'

    if (!(await confirmToast(`Delete marks for exam group: ${egName}?`))) return

    const recordId = String(selectedRecord.id || selectedRecord.marksManagementId)
    try {
      await deleteMarksMutation.mutateAsync(recordId)
      toast.success(`Marks deleted for ${student.studentName} (${egName}) successfully!`)
    } catch (error: any) {
      console.error('Failed to delete marks:', error)
      toast.error(error?.message || 'Failed to delete marks.')
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (ids.length === 0) {
      toast.warning('Please select at least one student')
      return
    }

    const studentsToDelete = students.filter((s) => ids.map(String).includes(String(s.id)))

    if (studentsToDelete.length === 0) {
      toast.warning('No students selected')
      return
    }

    const hasMultipleGroups = studentsToDelete.some(
      (s) => s.allMarksRecords && s.allMarksRecords.length > 1,
    )

    if (hasMultipleGroups) {
      toast.warning(
        'One or more students have marks in multiple exam groups. Please delete them individually to select specific exam groups.',
      )
      return
    }

    if (!(await confirmToast(`Delete marks for ${studentsToDelete.length} student(s)?`))) return

    const marksIds = studentsToDelete
      .filter((s) => s.allMarksRecords && s.allMarksRecords.length > 0)
      .flatMap((s) => s.allMarksRecords!.map((r: any) => Number(r.id || r.marksManagementId)))

    if (!marksIds.length) {
      toast.warning('No marks record found to delete')
      return
    }

    try {
      await deleteMultipleMarksMutation.mutateAsync(marksIds)
      toast.success(
        `${studentsToDelete.length} marks record${studentsToDelete.length !== 1 ? 's' : ''} deleted successfully!`,
      )
    } catch (error: any) {
      console.error('Failed to delete multiple marks:', error)
      toast.error(error?.message || 'Failed to delete marks.')
    }
  }

  const columns = [
    { label: Text.Roll_No, key: 'rollNo' },
    { label: Text.Student_Name, key: 'studentName' },
    { label: Text.Class, key: 'class' },
    { label: NameText.Section, key: 'section' },
    { label: NameText.Exam_Group, key: 'allExamGroupsDisplay' },
    { label: Text.Subject_Marks, key: 'allMarksDisplay' },
    { label: Text.Total_Scores, key: 'allScoresDisplay' },
  ]

  if (isLoadingStudents || isLoadingMarks)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">{Text.Loading}</p>
        </div>
      </div>
    )

  const isSubmitting = createMarksMutation.isPending || updateMarksMutation.isPending

  const currentExamGroupMarksRecord = selectedStudentData?.allMarksRecords?.find(
    (record: any) => String(record.examGroupId) === String(selectedModalExamGroupId),
  )

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md border-red-200 flex items-center gap-2">
          <IconField name="FaExclamationCircle" /> {errorMessage}
        </div>
      )}

      {selectedSearchClassId && examGroupsByClass.length === 0 && (
        <div className="p-3 bg-amber-100 text-amber-700 rounded-md border-amber-200 flex items-center gap-2">
          <IconField name="FaExclamationCircle" /> {Text.No_Exam_Groups_Available_For_Selected_Class}
        </div>
      )}

      <div className="bg-white rounded shadow-sm">
        <div className="p-4 space-y-4">
          <AllSchoolDropdown
            queryKeys={['students', 'marksManagements', 'examSchedules', 'examGroupsByClass']}
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              handleSearchSubmit(onSearchSubmit)()
            }}
            children={undefined}
          ></AllSchoolDropdown>
        </div>
        <div className="p-4 bg-gray-100 border-b">
          <h2 className="text-lg font-medium">{Text.Select_Criteria}</h2>
        </div>
        <div className="p-4 grid sm:grid-cols-2 gap-4">
          <Dropdown
            label={Text.Class}
            name="schoolClassId"
            control={searchControl as Control<SearchFormInputs>}
            required
            options={classOptions}
          />
          <Dropdown
            label={Text.Exam_Group}
            name="examGroupId"
            control={searchControl as Control<SearchFormInputs>}
            required
            options={examGroupOptions}
          />
        </div>
        <div className="p-4 flex justify-end">
          <Button
            name={isLoadingExamSchedules ? Text.Loading : Text.Search}
            icon={<IconField name="FaSearch" />}
            onClick={handleSearchSubmit(onSearchSubmit)}
            loading={isLoadingExamSchedules}
            showAlways={true}
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white p-4 rounded shadow-sm">
          <ControlledTable
            columns={columns}
            data={filteredResults}
            searchTerm={searchTerm}
            onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onAdd={handleAddOrEdit}
            onEdit={handleAddOrEdit}
            onView={handleView}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            title={Text.Student_List}
            btn={false}
          />
        </div>
      )}

      {showModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">
                {isViewMode ? Text.View_Marks : currentExamGroupMarksRecord ? Text.Update_Marks : Text.Save_Marks} :
                <span className="text-sky-600"> {selectedStudentData.studentName}</span>
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setIsViewMode(false)
                }}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4 bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{Text.Student_Name}:</span>{' '}
                  {selectedStudentData.studentName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{Text.Class}:</span> {selectedStudentData.class}{' '}
                  {selectedStudentData.section && `- ${selectedStudentData.section}`}
                </p>
                {isViewMode &&
                  selectedStudentData.allMarksRecords &&
                  selectedStudentData.allMarksRecords.length > 1 && (
                    <p className="text-sm text-blue-600 mt-2">
                      <IconField name="FaInfoCircle" /> This student has marks in{' '}
                      {selectedStudentData.allMarksRecords.length} exam groups. Select exam group to
                      view different results.
                    </p>
                  )}
              </div>

              <div className="mb-6">
                <Dropdown
                  label={Text.Exam_Group}
                  name="examGroupId"
                  control={modalControl}
                  options={examGroupOptions}
                  required
                />
              </div>

              {!isViewMode && selectedModalExamGroupId && currentExamGroupMarksRecord && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-700 font-medium">
                    <IconField name="FaInfoCircle" />{Text.Marks_Already_Exist_For_This_Exam_Group}
                  </p>
                </div>
              )}

              {isViewMode && selectedModalExamGroupId && !currentExamGroupMarksRecord && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-700 font-medium">
                    <IconField name="FaExclamationCircle" /> {Text.No_Marks_Found_For_This_Exam_Group}
                  </p>
                </div>
              )}

              {fields.length > 0 ? (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase">{Text.Subject}</th>
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center w-32">
                          {Text.Subject_Type}
                        </th>
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center w-32">
                          {Text.Total_Marks}
                        </th>
                        <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center w-32">
                          {Text.Obtain_Marks}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {fields.map((field, index) => (
                        <tr key={field.id} className="hover:bg-gray-50">
                          <td className="p-3">{field.subjectName}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${field.subjectType === 'Practical'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                              {field.subjectType}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <NumberField
                              name={`marks.${index}.totalMarks`}
                              control={modalControl}
                              label=""
                              disabled={true}
                              inputClassName="text-center text-gray-700 font-medium"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <NumberField
                              name={`marks.${index}.obtainMarks`}
                              control={modalControl}
                              label=""
                              required={!isViewMode}
                              disabled={isViewMode}
                              placeholder="Enter marks"
                              inputClassName={`text-center ${isViewMode
                                ? 'text-gray-500'
                                : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'
                                }`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  {isViewMode
                    ? 'No marks data available for selected exam group'
                    : 'Please select an exam group to continue'}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <Button name={Text.Close} onClick={() => setShowModal(false)} loading={false} />
              {!isViewMode && (
                <Button
                  name={currentExamGroupMarksRecord ? Text.Update : Text.Save}
                  onClick={handleModalSubmit(onFinalSubmit)}
                  loading={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarksManagement

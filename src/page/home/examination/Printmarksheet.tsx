import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import Dropdown from '../../../components/controlled/Dropdown'
import Button from '../../../components/controlled/Button'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { toast } from 'react-toastify'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useExamGroupsByClass } from '../../../hooks/queries/examination/useExamGroup'
import {
  useMarkSheetTemplatesByClassAndExam,
  useGenerateMarkSheets,
} from '../../../hooks/queries/examination/useDesignMarksheet'
import { useStudents } from '../../../hooks/queries/studentInformation/useStudents'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface FormData {
  schoolClassId: number
  examGroupId: number
  templateId: number
}

interface StudentRow {
  id: number
  studentId: number
  studentName: string
  fatherName?: string
  motherName?: string
  rollNumber: string
  dateOfBirth: string
  admissionNo?: string
}

const Printmarksheet: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  // Queries and Mutations
  const { data: classesData } = useSchoolClasses()
  const generateMarksheetsMutation = useGenerateMarkSheets()

  const { handleSubmit, control, watch, setValue } = useForm<FormData>({
    defaultValues: {
      schoolClassId: 0,
      examGroupId: 0,
      templateId: 0,
    },
  })

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)

  const masterCheckboxRef = useRef<HTMLInputElement>(null)

  const watchClassId = watch('schoolClassId')
  const watchExamGroupId = watch('examGroupId')
  const watchTemplateId = watch('templateId')

  const { data: studentsData, isLoading: studentsLoading } = useStudents(0, 100, 'asc')

  const { data: examGroupsByClass = [] } = useExamGroupsByClass(
    watchClassId && watchClassId > 0 ? Number(watchClassId) : 0,
  )

  const {
    data: templates = [],
    isLoading: templatesLoading,
    isError: templatesError,
  } = useMarkSheetTemplatesByClassAndExam(
    watchClassId && watchClassId > 0 ? Number(watchClassId) : null,
    watchExamGroupId && watchExamGroupId > 0 ? Number(watchExamGroupId) : null,
  )

  const selectedTemplate = useMemo(() => {
    if (!watchTemplateId || watchTemplateId === 0) {
      return null
    }

    if (!templates || templates.length === 0) {
      return null
    }

    const found = templates.find((t: any) => {
      const templateId = t.marksSheetTemplateId || t.id
      return Number(templateId) === Number(watchTemplateId)
    })

    return found || null
  }, [watchTemplateId, templates])

  const students: StudentRow[] = useMemo(() => {
    if (!studentsData?.students || !Array.isArray(studentsData.students)) return []
    if (!searchPerformed || !watchClassId || watchClassId === 0) return []

    return studentsData.students
      .filter((student: any) => {
        const studentClassId = student.classId || student.schoolClassId || student.id
        return String(studentClassId) === String(watchClassId)
      })
      .map((student: any) => {
        const studentId = student.id || student.studentId
        return {
          id: studentId, 
          studentId: studentId,
          studentName:
            `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim(),
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          rollNumber: student.rollNo || '',
          dateOfBirth: student.dob || '',
          admissionNo: student.admissionNo || '',
        }
      })
  }, [studentsData, watchClassId, searchPerformed])

  useEffect(() => {
    if (watchClassId && examGroupsByClass.length > 0) {
      const firstExamGroup = examGroupsByClass[0]
      if (firstExamGroup) {
        const examGroupId = firstExamGroup.examGroupId || firstExamGroup.id
        setValue('examGroupId', Number(examGroupId), { shouldDirty: true })
      }
    } else {
      setValue('examGroupId', 0)
      setValue('templateId', 0)
    }
  }, [watchClassId, examGroupsByClass, setValue])

  useEffect(() => {
    if (templates.length > 0 && watchExamGroupId > 0) {
      const firstTemplate = templates[0]
      if (firstTemplate) {
        const templateId = firstTemplate.marksSheetTemplateId || firstTemplate.id
        setValue('templateId', Number(templateId), { shouldDirty: true })
      }
    } else {
      setValue('templateId', 0)
    }
  }, [templates, watchExamGroupId, setValue])

  // Prepare dropdown options
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

  const templateOptions = useMemo(
    () =>
      templates?.map((t: any) => ({
        label: t.templateName,
        value: Number(t.marksSheetTemplateId || t.id),
      })) || [],
    [templates],
  )

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!data.schoolClassId || data.schoolClassId === 0) {
      toast.error('Please select a class')
      return
    }
    if (!data.examGroupId || data.examGroupId === 0) {
      toast.error('Please select an exam group')
      return
    }
    if (!data.templateId || data.templateId === 0) {
      toast.error('Please select a marksheet template')
      return
    }

    setSearchPerformed(true)
    setSelectedIds([])
    toast.info('Fetching students...')
  }

  useEffect(() => {
    setSearchPerformed(false)
    setSelectedIds([])
  }, [watchClassId])

  useEffect(() => {
    if (searchPerformed && !studentsLoading && students.length > 0) {
      toast.success(`${students.length} student(s) loaded successfully`)
    } else if (searchPerformed && !studentsLoading && students.length === 0) {
      toast.warning('No students found for this class')
    }
  }, [students, studentsLoading, searchPerformed])

  // Update master checkbox state
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate =
        selectedIds.length > 0 && selectedIds.length < students.length
    }
  }, [selectedIds, students])

  const toggleCheckbox = (studentId: number) => {
    setSelectedIds((prev) =>
      prev.includes(studentId) ? prev.filter((x) => x !== studentId) : [...prev, studentId],
    )
  }

  const generateMarksheet = async () => {
    if (!watchTemplateId || watchTemplateId === 0) {
      toast.error('Please select a marksheet template')
      return
    }

    if (!selectedTemplate) {
      toast.error('Template data not available. Please try again or select a different template.')
      return
    }

    if (selectedIds.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    try {
      toast.info('Generating marksheets... Please wait.')

      const zipBlob = await generateMarksheetsMutation.mutateAsync({
        templateId: watchTemplateId,
        studentIds: selectedIds,
      })

      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `marksheets_${selectedTemplate.templateName}_${new Date().getTime()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast.success(`Successfully generated ${selectedIds.length} marksheet(s)!`)

      setSelectedIds([])
    } catch (error: any) {
      console.error('Error generating marksheets:', error)
      toast.error(error.message || 'Failed to generate marksheets. Please try again.')
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'select',
        label: Text.Select,
        render: (_: any, item: StudentRow) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(item.studentId)}
            onChange={() => toggleCheckbox(item.studentId)}
            className="h-4 w-4 cursor-pointer"
          />
        ),
      },
      { key: 'studentName', label: Text.Student_Name },
      { key: 'rollNumber', label: Text.Roll_Number },
      { key: 'motherName', label: Text.Mother_Name },
      { key: 'fatherName', label: Text.Father_Name },
      { key: 'dateOfBirth', label: Text.Date_Of_Birth },
      
    ],
    [selectedIds, students, Text],
  )

  const canGenerate = selectedIds.length > 0 && selectedTemplate !== null

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md ">
        <h2 className="font-semibold mb-4 text-lg text-slate-700">{Text.Select_Criteria}</h2>

        <AllSchoolDropdown
          onSubmit={handleSubmit(onSubmit)}
          queryKeys={['students', 'markSheet', 'examGroups', 'schoolClasses']}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dropdown
              label={Text.Class}
              name="schoolClassId"
              control={control}
              required
              options={classOptions}
            />

            <Dropdown
              label={Text.Exam_Group}
              name="examGroupId"
              control={control}
              required
              options={examGroupOptions}
            />

            <Dropdown
              label={Text.Marksheet_Template}
              name="templateId"
              control={control}
              required
              options={templateOptions}
            />
          </div>
          {templatesLoading && watchExamGroupId > 0 && (
            <div className="md:col-span-3 text-sm text-blue-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Loading templates...
            </div>
          )}

          {templatesError && (
            <div className="md:col-span-3 text-sm text-red-600 p-3 bg-red-50 rounded border border-red-200">
              Error loading templates. Please try again.
            </div>
          )}

          <div className="md:col-span-3 flex justify-end">
            <Button
              name={Text.Search}
              icon={<IconField name="FaSearch" />}
              loading={false}
              clr="bg-blue-600"
            />
          </div>
        </AllSchoolDropdown>
      </div>

      {studentsLoading && searchPerformed && (
        <div className="bg-white p-6 rounded-xl shadow-md border text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-slate-600">Loading students...</p>
          </div>
        </div>
      )}
      <AllSchoolDropdown onSubmit={generateMarksheet}>
        {students.length > 0 && !studentsLoading && (
          <>
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
              <div className="flex gap-3 items-center">
                <Button
                  name={Text.Generate_Marksheet || 'Generate Marksheet'}
                  isDisable={!canGenerate}
                  onClick={generateMarksheet}
                  icon={<IconField name="FaFileAlt" />}
                  loading={generateMarksheetsMutation.isPending}
                  clr="bg-blue-600"
                  showAlways={true}
                />
                {!selectedTemplate && watchTemplateId > 0 && (
                  <span className="text-amber-600 text-sm flex items-center gap-1">
                    <IconField name="FaExclamationTriangle" />
                    <span>Template not loaded</span>
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-600">
                {selectedIds.length} of {students.length} student(s) selected
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <ControlledTable
                title={Text.Student_List}
                columns={columns}
                data={students}
                fullData={students}
                actionColumn={false}
                showSearch
                enablePermissions={true}
                showSelectAll={false}
                permissionScope="EXAM_MARKSHEET"
              />
            </div>
          </>
        )}
      </AllSchoolDropdown>
      {generateMarksheetsMutation.isPending && (
        <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <h3 className="text-xl font-bold text-slate-700">{Text.Generate_Marksheet || 'Generate Marksheet'}</h3>
              <p className="text-slate-600 text-center">
                Please wait while we generate {selectedIds.length} marksheet(s)...
              </p>
              <p className="text-sm text-slate-500">This may take a few moments.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Printmarksheet

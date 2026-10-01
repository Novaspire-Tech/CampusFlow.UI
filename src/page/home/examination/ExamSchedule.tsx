import { useState, useEffect, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import Dropdown from '../../../components/controlled/Dropdown'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import DateField from '../../../components/controlled/DateField'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'
import {
  useExamGroups,
  useExamGroupsByClass,
} from '../../../hooks/queries/examination/useExamGroup'
import {
  useSchoolClasses,
  useSchoolClassesSubjects,
} from '../../../hooks/queries/academics/useClasses'
import {
  useAddExamSchedule,
  useUpdateExamSchedule,
  useDeleteExamSchedule,
} from '../../../hooks/queries/examination/useExamSchedule'
import type {
  CreateExamScheduleRequestDTO,
  ExamScheduleFilters,
} from '../../../types/examination/examSchedule'
import { examScheduleService } from '../../../services/examination/examScheduleService'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface SubjectSchedule {
  subjectId: string
  subjectName: string
  subjectType: string
  totalMarks: string
  examDate: string
  startTime: string
  duration: string
  roomNo: string
  examScheduleId?: string
}

interface ExamScheduleFormData {
  classId: string
  examGroupId: string
  subjects: SubjectSchedule[]
}

interface ScheduleData {
  classId: string
  className: string
  examGroupId: string
  examGroupName: string
  subjects: SubjectSchedule[]
}

const formatDateForInput = (date: string): string => {
  if (!date) return ''
  if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return date
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-')
    return `${day}-${month}-${year}`
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split('/')
    return `${day}-${month}-${year}`
  }

  return date
}

const formatDateForDisplay = (date: string): string => {
  if (!date) return ''

  let day: string, month: string, year: string
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    ;[year, month, day] = date.split('-')
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    ;[day, month, year] = date.split('-')
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    ;[day, month, year] = date.split('/')
  } else {
    return date
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const monthIndex = parseInt(month, 10) - 1
  return `${day} ${monthNames[monthIndex] ?? ''} ${year}`
}

function convert24To12(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24

  const parts = time24.split(':')
  const hourStr = parts[0] ?? '0'
  const minute = parts[1] ?? '00'
  let hour = parseInt(hourStr, 10)

  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  hour = hour === 0 ? 12 : hour

  return `${hour.toString().padStart(2, '0')}:${minute} ${period}`
}

function convert12To24(time12: string): string {
  if (!time12 || !time12.includes(':')) return time12

  if (!time12.includes('AM') && !time12.includes('PM')) return time12

  const [time, period] = time12.split(' ')
  if (!time || !period) return time12

  const timeParts = time.split(':')
  const hourStr = timeParts[0] ?? '0'
  const minute = timeParts[1] ?? '00'
  let hour = parseInt(hourStr, 10)

  if (period === 'PM' && hour !== 12) {
    hour += 12
  } else if (period === 'AM' && hour === 12) {
    hour = 0
  }

  return `${hour.toString().padStart(2, '0')}:${minute}`
}

interface PrintTimetableModalProps {
  isOpen: boolean
  onClose: () => void
  scheduleData: ScheduleData | null
}

const PrintTimetableModal: React.FC<PrintTimetableModalProps> = ({
  isOpen,
  onClose,
  scheduleData,
}) => {
  if (!isOpen || !scheduleData) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-225 max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative print:w-full print:h-full print:rounded-none print:shadow-none">
        {/* Action Buttons - Hidden on Print */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Exam Timetable</h2>
          <div className="flex gap-3">
            <Button
              name="Print Timetable"
              loading={false}
              clr="bg-blue-600 hover:bg-blue-700"
              onClick={handlePrint}
              icon={<IconField name="FaPrint" />}
            />
            <Button
              name="Close"
              loading={false}
              clr="bg-white text-black border border-gray-400 hover:bg-gray-100"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Timetable Content */}
        <div className="border rounded-lg p-6 bg-white print:border-0">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Examination Timetable</h1>
            <div className="text-lg font-semibold text-gray-700">
              {scheduleData.className} - {scheduleData.examGroupName}
            </div>
          </div>

          {/* Timetable Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-bold text-gray-700">
                    S.No
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-bold text-gray-700">
                    Subject Name
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-bold text-gray-700">
                    Type
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-bold text-gray-700">
                    Max Marks
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-bold text-gray-700">
                    Date
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-bold text-gray-700">
                    Start Time
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-bold text-gray-700">
                    Duration
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-bold text-gray-700">
                    Room No
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.subjects.map((subject, index) => (
                  <tr key={subject.subjectId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-3 font-medium">
                      {subject.subjectName}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          subject.subjectType === 'Practical'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {subject.subjectType}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">
                      {subject.totalMarks}
                    </td>
                    <td className="border border-gray-300 p-3">
                      {formatDateForDisplay(subject.examDate)}
                    </td>
                    <td className="border border-gray-300 p-3">{subject.startTime}</td>
                    <td className="border border-gray-300 p-3">{subject.duration}</td>
                    <td className="border border-gray-300 p-3">{subject.roomNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExamSchedule() {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const queryClient = useQueryClient()

  const [showFormModal, setShowFormModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null)

  const [, setViewSchoolClassId] = useState<string | null>(null)
  const [, setViewExamGroupId] = useState<string | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletedSubjects, setDeletedSubjects] = useState<SubjectSchedule[]>([])

  const { data: allExamGroups = [], refetch: refetchExamGroups } = useExamGroups()
  const { data: classesData = [] } = useSchoolClasses()
  const addExamSchedule = useAddExamSchedule()
  const updateExamSchedule = useUpdateExamSchedule()
  const deleteExamSchedule = useDeleteExamSchedule()

  const { control, handleSubmit, reset, setValue, watch, register } = useForm<ExamScheduleFormData>(
    {
      defaultValues: {
        classId: '',
        examGroupId: '',
        subjects: [],
      },
    },
  )

  const watchClassId = watch('classId')
  const watchExamGroupId = watch('examGroupId')

  const { data: examGroupsByClass = [] } = useExamGroupsByClass(
    watchClassId ? Number(watchClassId) : 0,
  )

  const { data: subjectsByClass = [] } = useSchoolClassesSubjects(watchClassId || '')

  const { fields, replace, remove } = useFieldArray({
    control,
    name: 'subjects',
  })

  useEffect(() => {
    if (watchClassId && watchExamGroupId && !editMode) {
      const subjectsToLoad = subjectsByClass?.map((subject) => ({
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        subjectType: subject.subjectType,
        totalMarks: '',
        examDate: '',
        startTime: '',
        duration: '',
        roomNo: '',
      }))
      replace(subjectsToLoad || [])
      setDeletedSubjects([])
    } else if (!watchClassId || !watchExamGroupId) {
      if (!editMode) {
        replace([])
        setDeletedSubjects([])
      }
    }
  }, [watchClassId, watchExamGroupId, subjectsByClass, editMode])

  const columns = [
    { key: 'className', label: Text.Class || 'Class' },
    { key: 'examGroupName', label: Text.Exam_Group || 'Exam Group' },
    { key: 'totalSubjects', label: Text.Total_Subjects || 'Total Subjects' },
  ]

  const handleAddNew = useCallback(() => {
    reset()
    setEditMode(false)
    replace([])
    setDeletedSubjects([])
    setShowFormModal(true)
  }, [reset, replace])

  const closeFormModal = useCallback(() => {
    setShowFormModal(false)
    setEditMode(false)
    reset()
    replace([])
    setDeletedSubjects([])
  }, [reset, replace])

  const handleEdit = useCallback(
    (schoolClassId: string | number, examGroupId: number) => {
      setEditMode(true)
      setViewSchoolClassId(schoolClassId.toString())
      setViewExamGroupId(examGroupId.toString())

      examScheduleService
        .getAll({
          schoolClassId: schoolClassId.toString(),
          examGroupId: examGroupId.toString(),
        })
        .then((scheduleData) => {
          setValue('classId', schoolClassId.toString())
          setValue('examGroupId', examGroupId.toString())

          const formattedSubjects = scheduleData.map((sub) => ({
            subjectId: sub.subjectId,
            subjectName: sub.subjectName,
            subjectType: sub.subjectType || 'Theory',
            examScheduleId: sub.examScheduleId,
            totalMarks: sub.totalMarks.toString(),
            examDate: sub.examDate,
            startTime: convert12To24(sub.startTime),
            duration: sub.duration.toString(),
            roomNo: sub.roomNo,
          }))

          replace(formattedSubjects)
          setShowFormModal(true)
        })
        .catch((err: unknown) => {
          console.error('Failed to load schedule for editing:', err)
          toast.error('Failed to load schedule data')
        })
    },
    [setValue, replace],
  )

  const handleView = useCallback(
    (schoolClassId: string | number, examGroupId: number) => {
      setViewSchoolClassId(schoolClassId.toString())
      setViewExamGroupId(examGroupId.toString())

      examScheduleService
        .getAll({
          schoolClassId: schoolClassId.toString(),
          examGroupId: examGroupId.toString(),
        })
        .then(
          (
            subjects: Array<{
              subjectId: string
              subjectType?: string
              subjectName: string
              totalMarks: string | number
              examDate: string
              startTime: string
              duration: string | number
              roomNo: string
            }>,
          ) => {
            const scheduleData: ScheduleData = {
              classId: schoolClassId.toString(),
              className:
                classesData.find((c) => c.schoolClassId === Number(schoolClassId))?.className ??
                'Unknown',
              examGroupId: examGroupId.toString(),
              examGroupName:
                allExamGroups.find((eg) => eg.examGroupId === Number(examGroupId))?.examGroupName ??
                'Unknown',
              subjects: subjects.map((sub) => ({
                subjectId: sub.subjectId,
                subjectType: sub.subjectType ?? 'Theory',
                subjectName: sub.subjectName,
                totalMarks: sub.totalMarks.toString(),
                examDate: sub.examDate,
                startTime: sub.startTime,
                duration: sub.duration.toString(),
                roomNo: sub.roomNo,
              })),
            }
            setSelectedSchedule(scheduleData)
            setShowPrintModal(true)
          },
        )
        .catch((err: unknown) => {
          console.error('Failed to fetch schedule for viewing:', err)
          toast.error('Failed to load schedule details')
        })
    },
    [classesData, allExamGroups],
  )

  const handleDeleteSubject = (index: number) => {
    const subjectToDelete = fields[index]
    // FIX 11: Guard against undefined field at index.
    if (!subjectToDelete) return
    setDeletedSubjects((prev) => [...prev, subjectToDelete])
    remove(index)
    toast.info(`${subjectToDelete.subjectName} removed temporarily`)
  }

  const handleResetSubjects = () => {
    if (deletedSubjects.length === 0) {
      toast.info('No deleted subjects to restore')
      return
    }

    const allSubjects = [...fields, ...deletedSubjects]
    replace(allSubjects)
    setDeletedSubjects([])
    toast.success('All deleted subjects restored')
  }

  const onSubmit = (formData: ExamScheduleFormData) => {
    const payload: CreateExamScheduleRequestDTO = {
      schoolClassId: formData.classId,
      examGroupId: formData.examGroupId,
      subjectDTOList: formData.subjects.map((s) => ({
        subjectId: s.subjectId,
        examDate: formatDateForInput(s.examDate),
        startTime: convert24To12(s.startTime),
        duration: s.duration,
        roomNo: s.roomNo,
        totalMarks: s.totalMarks,
        ...(s.examScheduleId && { examScheduleId: s.examScheduleId }),
      })),
    }

    if (editMode) {
      updateExamSchedule.mutate(payload, {
        onSuccess: () => {
          toast.success('Exam schedule updated successfully!')
          closeFormModal()
          queryClient.invalidateQueries({ queryKey: ['examGroups'] })
          queryClient.invalidateQueries({ queryKey: ['examSchedules'] })
          refetchExamGroups()
        },
        onError: (error: unknown) => {
          console.error('Update failed:', error)
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to update exam schedule. Please try again.'
          toast.error(message)
        },
      })
    } else {
      addExamSchedule.mutate(payload, {
        onSuccess: () => {
          toast.success('Exam schedule added successfully!')
          closeFormModal()
          queryClient.invalidateQueries({ queryKey: ['examGroups'] })
          queryClient.invalidateQueries({ queryKey: ['examSchedules'] })
          refetchExamGroups()
        },
        onError: (error: unknown) => {
          console.error('Add failed:', error)
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to add exam schedule. Please try again.'
          toast.error(message)
        },
      })
    }
  }

  const handleDelete = async (id: string | number) => {
    const item = allExamGroups.find((eg) => eg.examGroupId === Number(id))
    if (!item) {
      console.error('Exam group not found:', id)
      toast.error('Exam group not found.')
      return
    }

    const filters: ExamScheduleFilters = {
      schoolClassId: item.schoolClassId.toString(),
      examGroupId: item.examGroupId.toString(),
    }

    try {
      const schedules = await examScheduleService.getAll(filters)

      if (!schedules || schedules.length === 0) {
        toast.warning('No schedules found to delete.')
        return
      }

      for (const schedule of schedules) {
        await deleteExamSchedule.mutateAsync({
          schoolClassId: item.schoolClassId,
          examGroupId: item.examGroupId,
          examScheduleId: Number(schedule.examScheduleId),
        })
      }

      toast.success('Exam schedule deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['examGroups'] })
      queryClient.invalidateQueries({ queryKey: ['examSchedules'] })
      refetchExamGroups()
    } catch (error: unknown) {
      console.error('Delete failed:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete exam schedule.'
      toast.error(message)
    }
  }

  const filteredData = allExamGroups
    .map((examGroup) => ({
      ...examGroup,
      totalSubjects: examGroup.totalSubjects ?? 0,
      searchableText: `${examGroup.schoolClass} ${examGroup.examGroupName}`,
    }))
    .filter((item) => item.searchableText.toLowerCase().includes(searchTerm.toLowerCase()))

  const classOptions = classesData.map((cls) => ({
    label: cls.className,
    value: cls.schoolClassId,
  }))

  const examGroupOptions = examGroupsByClass.map((eg) => ({
    label: eg.examGroupName,
    value: eg.examGroupId,
  }))

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      <PrintTimetableModal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false)
          setSelectedSchedule(null)
        }}
        scheduleData={selectedSchedule}
      />

      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4  ">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">
                {editMode
                  ? Text.Update_Exam_Schedule || 'Update Exam Schedule'
                  : Text.Add_New_Exam_Schedule || 'Add New Exam Schedule'}
              </h3>
              <button
                onClick={closeFormModal}
                className="text-gray-400 hover:text-red-500 text-xl"
                type="button"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <AllSchoolDropdown
                onSubmit={handleSubmit(onSubmit)}
                queryKeys={['examGroups', 'schoolClasses', 'examSchedules']}
                onSchoolChange={reset}
              >
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Dropdown
                    name="classId"
                    label={Text.Class || 'Class'}
                    control={control}
                    required
                    options={classOptions}
                  />
                  <Dropdown
                    name="examGroupId"
                    label={Text.Exam_Group || 'Exam Group'}
                    control={control}
                    required
                    options={examGroupOptions}
                  />
                </div>

                {fields.length > 0 && (
                  <>
                    {deletedSubjects.length > 0 && (
                      <div className="flex justify-end mb-3">
                        <Button
                          name={`Reset (${deletedSubjects.length} deleted)`}
                          loading={false}
                          onClick={handleResetSubjects}
                          clr="bg-orange-500 text-white hover:bg-orange-600"
                          type="button"
                        />
                      </div>
                    )}

                    <div className="border rounded overflow-hidden mb-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-100 border-b">
                            <tr>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase w-40">
                                {Text.Subject}
                              </th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center w-28">
                                {Text.Type}
                              </th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center w-24">
                                {Text.Max_Marks}
                              </th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase w-44">
                                {Text.Date}
                              </th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase w-32">
                                {Text.Start_Time}
                              </th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase w-32">
                                {Text.Duration}
                              </th>
                              <th className="p-3 text-xs font-bold text-gray-500 uppercase w-32">
                                {Text.Room_No}
                              </th>
                              {!editMode && (
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center w-24">
                                  {Text.Action}
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {fields.map((field, index) => (
                              <tr key={field.id} className="hover:bg-gray-50">
                                <input
                                  type="hidden"
                                  {...register(`subjects.${index}.examScheduleId`)}
                                />
                                <input type="hidden" {...register(`subjects.${index}.subjectId`)} />
                                <input
                                  type="hidden"
                                  {...register(`subjects.${index}.subjectName`)}
                                />
                                <input
                                  type="hidden"
                                  {...register(`subjects.${index}.subjectType`)}
                                />

                                <td className="p-3">
                                  <div className="font-medium text-gray-900">
                                    {field.subjectName}
                                  </div>
                                </td>

                                <td className="p-3 text-center">
                                  <span
                                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                      field.subjectType === 'Practical'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {field.subjectType}
                                  </span>
                                </td>

                                <td className="p-3 text-center">
                                  <input
                                    type="number"
                                    className="w-20 border rounded px-2 py-1.5 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center font-semibold bg-green-50 text-green-700"
                                    {...register(`subjects.${index}.totalMarks`, {
                                      required: true,
                                    })}
                                  />
                                </td>

                                <td className="p-3">
                                  <div className="[&_.mb-2]:mb-0 [&_label]:hidden [&_input]:mt-0">
                                    <DateField
                                      name={`subjects.${index}.examDate`}
                                      control={control}
                                      required={true}
                                      onlyToday={false}
                                    />
                                  </div>
                                </td>

                                <td className="p-3">
                                  <input
                                    type="time"
                                    className="w-full border rounded px-2 py-1.5 text-sm border-gray-300 focus:border-blue-500"
                                    {...register(`subjects.${index}.startTime`, {
                                      required: true,
                                    })}
                                  />
                                </td>

                                <td className="p-3">
                                  <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full border rounded px-2 py-1.5 text-sm border-gray-300 focus:border-blue-500"
                                    {...register(`subjects.${index}.duration`, {
                                      required: true,
                                    })}
                                  />
                                </td>

                                <td className="p-3">
                                  <input
                                    type="text"
                                    className="w-full border rounded px-2 py-1.5 text-sm border-gray-300 focus:border-blue-500"
                                    {...register(`subjects.${index}.roomNo`, {
                                      required: true,
                                    })}
                                  />
                                </td>

                                {!editMode && (
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubject(index)}
                                      className="hover:bg-red-50 p-2 rounded transition-colors"
                                      title="Delete subject"
                                    >
                                      <IconField
                                        name="FaTrash"
                                        size={18}
                                        color="red"
                                        className="cursor-pointer hover:opacity-80"
                                      />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-6 border-t mb-8">
                  <Button
                    name={Text.Close || 'Close'}
                    loading={false}
                    onClick={closeFormModal}
                    clr="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    type="button"
                  />
                  <Button
                    name={
                      editMode
                        ? Text.Update_Schedule || 'Update Schedule'
                        : Text.Save_Schedule || 'Save Schedule'
                    }
                    loading={editMode ? updateExamSchedule.isPending : addExamSchedule.isPending}
                    type="submit"
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <ControlledTable
          title={Text.Exam_Schedule_Title || 'Examination Schedule'}
          columns={columns}
          data={filteredData}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          btn={true}
          btnName={Text.Add_Exam_Schedule || 'Add Exam Schedule'}
          showForm={handleAddNew}
          actionColumn={true}
          onEdit={(id) => {
            const item = allExamGroups.find((eg) => eg.examGroupId === Number(id))
            if (!item) return
            handleEdit(item.schoolClassId, item.examGroupId)
          }}
          onDelete={handleDelete}
          onView={(id) => {
            const item = allExamGroups.find((eg) => eg.examGroupId === Number(id))
            if (!item) return
            handleView(item.schoolClassId, item.examGroupId)
          }}
          showSelectAll={false}
        />
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Dropdown } from '../../../components/controlled'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { teacherService } from '../../../services/academics/teacherService'
import AxiosFunc from '../../../utils/axios'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface TimetableEntry {
  timetableId?: number
  day: string
  schoolClassId?: number
  schoolClassName?: string
  subjectId?: number
  subjectName?: string
  startTime: string
  endTime: string
  sectionId?: number
  sectionName?: string
  teacherId?: number
  teacherName?: string
}

interface FormValues {
  teacherId: string
}

const TeacherTimeTable: React.FC = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [showResults, setShowResults] = useState<boolean>(false)
  const [schoolCode, setSchoolCode] = useState<string>(
    () => localStorage.getItem('schoolCode') || '',
  )

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { teacherId: '' },
  })

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers', schoolCode],
    queryFn: () => teacherService.getAll(),
    enabled: !!schoolCode,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: timetables = [],
    isLoading: isLoadingTimetable,
    error: timetableError,
  } = useQuery<TimetableEntry[]>({
    queryKey: ['timetables-teacher', schoolCode, selectedTeacherId],
    queryFn: async () => {
      if (!selectedTeacherId) return []
      try {
        const url = `/school-group/{schoolGroupCode}/school/${schoolCode}/class-timetable/find-by-teacher`
        const response = await AxiosFunc.Get(url, {
          teacherId: Number(selectedTeacherId),
        })
        if (response.data?.status === 404) return []
        if (response.data?.status !== 200) {
          throw new Error(response.data?.message || 'Failed to fetch teacher timetables')
        }
        return response.data?.data || []
      } catch (error: any) {
        if (error.response?.data?.status === 404 || error.response?.status === 404) return []
        throw error
      }
    },
    enabled: !!schoolCode && !!selectedTeacherId && showResults,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const handleSchoolChange = () => {
    const newCode = localStorage.getItem('schoolCode') || ''
    setSchoolCode(newCode)
    reset()
    setSelectedTeacherId(null)
    setShowResults(false)
  }

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setSelectedTeacherId(data.teacherId)
    setShowResults(true)
  }

  const handleReset = () => {
    reset()
    setSelectedTeacherId(null)
    setShowResults(false)
  }

  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const days = [
    { key: 'MONDAY', label: Text.Monday || 'Monday' },
    { key: 'TUESDAY', label: Text.Tuesday || 'Tuesday' },
    { key: 'WEDNESDAY', label: Text.Wednesday || 'Wednesday' },
    { key: 'THURSDAY', label: Text.Thursday || 'Thursday' },
    { key: 'FRIDAY', label: Text.Friday || 'Friday' },
    { key: 'SATURDAY', label: Text.Saturday || 'Saturday' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {Text.Teacher_Time_Table || 'Teacher Timetable'}
        </h1>
      </div>

      {timetableError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error loading timetable. Please try again.</p>
        </div>
      )}

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {Text.Search || 'Search'}{' '}
          {Text.Teacher_Time_Table || 'Teacher Timetable'}
        </h2>
        <AllSchoolDropdown
          queryKeys={['teachers']}
          onSubmit={handleSubmit(onSubmit)}
          onSchoolChange={handleSchoolChange}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Dropdown
              label={Text.Teacher || 'Teacher'}
              name="teacherId"
              control={control}
              required={true}
              options={
                isLoadingTeachers
                  ? [{ value: '', label: 'Loading teachers...' }]
                  : teachers.length === 0
                    ? [{ value: '', label: 'No teachers available' }]
                    : teachers.map((teacher: any) => ({
                      value: String(teacher.teachersId || teacher.id),
                      label: teacher.name || 'Unknown Teacher',
                    }))
              }
            />

            <div className="flex items-end gap-2 mb-4">
              <Button
                name={Text.Search || 'Search'}
                loading={isLoadingTimetable}
                icon={<IconField name="FaSearch" />}
                showAlways={true}
              />
              {showResults && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  {Text.Cancel}
                </button>
              )}
            </div>
          </div>
        </AllSchoolDropdown>
      </div>

      {/* Results */}
      {showResults && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{Text.Weekly_Schedule}</h2>

          {isLoadingTimetable ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading timetable...</p>
            </div>
          ) : timetables.length === 0 ? (
            <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-gray-600 mb-2">{Text.No_Timetable_Found_For_This_Teacher}</p>
              <p className="text-sm text-gray-500">{Text.Teacher_Has_No_Assigned_Classes_Yet || 'This teacher has no assigned classes yet.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map((day) => {
                const dayItems = timetables.filter((item) => item.day === day.key)
                return (
                  <div key={day.key} className="border rounded-lg">
                    <div className="bg-gray-700 text-white p-3 font-semibold">{day.label}</div>
                    <div className="p-3 space-y-2">
                      {dayItems.length > 0 ? (
                        dayItems
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((item, index) => (
                            <div key={index} className="border rounded p-3 space-y-1">
                              <p className="font-semibold text-gray-800">{item.subjectName}</p>
                              <p className="text-sm text-gray-600">
                                <strong>{Text.Class || 'Class'}:</strong>{' '}
                                {item.schoolClassName}
                                {item.sectionName && ` - ${item.sectionName}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>{Text.Time || 'Time'}:</strong> {item.startTime} -{' '}
                                {item.endTime}
                              </p>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-4">
                          {Text.Not_Scheduled || 'No classes'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeacherTimeTable

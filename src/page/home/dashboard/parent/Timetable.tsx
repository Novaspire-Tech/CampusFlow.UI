import React, { useEffect, useState } from 'react'
import { parentDashboardService } from '../../../../services/dashboard/parentDashboardServices'
import { useTranslation } from 'react-i18next'
import { getParentDashboardText, getPagesDataText } from '../../../../helpers/useTranslations'

interface TimetableEntry {
  day: string
  endTime: string
  schoolClass: string
  section: string
  startTime: string
  subject: string
  teacher: string
  timetableId: number
}

interface StudentTimetable {
  studentId: number
  rollNo: string
  className: string
  section: string
  timeTable: TimetableEntry[]
}

interface TimetableData {
  [studentName: string]: StudentTimetable
}

const DAYS = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
]

const Timetable: React.FC = () => {
  const [timetableData, setTimetableData] = useState<TimetableData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const { t } = useTranslation()
  const texts = getParentDashboardText(t)
  const T = getPagesDataText(t);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await parentDashboardService.getTimeTable()

        if (data && typeof data === 'object') {
          setTimetableData(data as TimetableData)
          const firstStudent = Object.keys(data)[0]
          if (firstStudent) setSelectedStudent(firstStudent)
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to fetch timetable'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchTimetable()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
        {error}
      </div>
    )
  }

  const studentNames = Object.keys(timetableData)

  if (studentNames.length === 0) {
    return <p className="text-gray-500 text-center py-10">{texts.No_timetable_available}</p>
  }

  const currentStudent = selectedStudent ? timetableData[selectedStudent] : null

  return (
    <div className="p-2">
      {studentNames.length > 1 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {studentNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedStudent(name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStudent === name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {currentStudent && (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-5 py-4 mb-6 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{T.Student}</p>
              <p className="font-semibold text-gray-800 capitalize">{selectedStudent}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{T.Class}</p>
              <p className="font-semibold text-gray-800">{currentStudent.className}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{T.Section}</p>
              <p className="font-semibold text-gray-800">{currentStudent.section}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{T.Roll_No}</p>
              <p className="font-semibold text-gray-800">{currentStudent.rollNo}</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">{T.Weekly_Schedule}</h2>
          {currentStudent.timeTable.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{texts.No_timetable_found}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day) => {
                const dayItems = currentStudent.timeTable
                  .filter((t) => t.day === day.key)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))

                return (
                  <div key={day.key} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-700 text-white p-3 font-semibold">{day.label}</div>
                    <div className="p-3 space-y-2">
                      {dayItems.length > 0 ? (
                        dayItems.map((item, i) => (
                          <div key={i} className="border rounded p-3 space-y-1 bg-white">
                            <p className="font-semibold capitalize">{item.subject}</p>
                            <p className="text-sm text-gray-600">{item.teacher}</p>
                            <p className="text-sm text-gray-600">
                              {item.startTime} - {item.endTime}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-4">{T.No_Classes}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Timetable
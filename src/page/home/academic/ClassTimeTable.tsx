import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dropdown } from '../../../components/controlled'
import Button from '../../../components/controlled/Button'
import TimeField from '../../../components/controlled/TimeField'
import {
  useTimetablesBySection,
  useAddTimetable,
  useUpdateTimetable,
  useDeleteTimetable,
} from '../../../hooks/queries/academics/useTimetable'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useSubjects } from '../../../hooks/queries/academics/useSubject'
import { useTeachers } from '../../../hooks/queries/academics/useTeachers'
import type { ClassTimetable } from '../../../types/academics/timetabletypes'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { useState } from 'react'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'


interface FormValues {
  schoolClassId: string
  sectionId: string
  subjectId: string
  teacherId: string
  day: string
  startTime: string
  endTime: string
}

interface SearchFormValues {
  searchClassId: string
  searchSectionId: string
}

const ClassTimeTable: React.FC = () => {

  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>()
  const selectedClassId = watch('schoolClassId')

  const {
    control: searchControl,
    watch: searchWatch,
    setValue: setSearchValue,
  } = useForm<SearchFormValues>()

  const searchClassId = searchWatch('searchClassId')
  const searchSectionId = searchWatch('searchSectionId')

  const { data: classes = [] } = useSchoolClasses()
  const { data: subjects = [] } = useSubjects()
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers()

  const { data: sections = [], isLoading: isLoadingSections } = useSections(
    Number(selectedClassId) || 0,
  )

  const { data: searchSections = [], isLoading: isLoadingSearchSections } = useSections(
    Number(searchClassId) || 0,
  )

  const { data: timetables = [], refetch } = useTimetablesBySection(Number(searchSectionId) || 0)

  const addMutation = useAddTimetable()
  const updateMutation = useUpdateTimetable()
  const deleteMutation = useDeleteTimetable()

  useEffect(() => {
    if (selectedClassId) setValue('sectionId', '')
  }, [selectedClassId, setValue])

  useEffect(() => {
    setSearchValue('searchSectionId', '')
  }, [searchClassId, setSearchValue])

  const days = [
    { key: 'MONDAY', label: Text.Monday },
    { key: 'TUESDAY', label: Text.Tuesday },
    { key: 'WEDNESDAY', label: Text.Wednesday },
    { key: 'THURSDAY', label: Text.Thursday },
    { key: 'FRIDAY', label: Text.Friday },
    { key: 'SATURDAY', label: Text.Saturday },
  ]

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        schoolClassId: Number(data.schoolClassId),
        sectionId: Number(data.sectionId),
        subjectId: Number(data.subjectId),
        teacherId: Number(data.teacherId),
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
      }

      if (editingId) {
        await updateMutation.mutateAsync({
          timetableId: editingId,
          data: payload,
        })
        toast.success('Timetable updated successfully!')
        setEditingId(null)
      } else {
        await addMutation.mutateAsync(payload)
        toast.success('Timetable added successfully!')
      }
      reset()
      setShowForm(false)
      refetch()
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast.error(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleEdit = (item: ClassTimetable) => {
    setEditingId(item.timetableId || item.id)
    setValue('schoolClassId', String(item.schoolClassId))
    setValue('sectionId', String(item.sectionId))
    setValue('subjectId', String(item.subjectId))
    setValue('teacherId', String(item.teacherId))
    setValue('day', item.day)
    setValue('startTime', item.startTime)
    setValue('endTime', item.endTime)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (await confirmToast('Do you want to delete this entry?')) {
      try {
        await deleteMutation.mutateAsync({
          timetableId: id,
          sectionId: Number(searchSectionId) || undefined,
        })
        toast.success('Timetable deleted successfully!')
        refetch()
      } catch (error: any) {
        console.error('Error deleting timetable:', error)
        toast.error(error.message || 'Failed to delete timetable.')
      }
    }
  }

  const handleAddNew = () => {
    reset()
    setEditingId(null)
    setShowForm(true)
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setShowForm(false)
  }

  const searchSectionOptions = !searchClassId
    ? [{ value: '', label: 'Select class first' }]
    : isLoadingSearchSections
      ? [{ value: '', label: 'Loading...' }]
      : searchSections.length === 0
        ? [{ value: '', label: 'No sections available' }]
        : searchSections.map((s: any) => ({
          value: String(s.id || s.sectionId),
          label: s.name || s.sectionName,
        }))

  const sectionOptions = !selectedClassId
    ? [{ value: '', label: 'Select class first' }]
    : isLoadingSections
      ? [{ value: '', label: 'Loading...' }]
      : sections.length === 0
        ? [{ value: '', label: 'No sections available' }]
        : sections.map((s: any) => ({
          value: String(s.id || s.sectionId),
          label: s.name || s.sectionName,
        }))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{NameText.Class_Timetable}</h1>
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900"
          >
            {Text.Add_New}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Entry' : Text.Add_Entry}</h2>
          <AllSchoolDropdown
            queryKeys={['schoolClasses', 'sections', 'subjects', 'teachers']}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Dropdown
                label={Text.Class}
                name="schoolClassId"
                control={control}
                required
                options={classes.map((c: any) => ({
                  value: String(c.id || c.schoolClassId),
                  label: c.name || c.className,
                }))}
              />

              <Dropdown
                label={NameText.Section}
                name="sectionId"
                control={control}
                required
                disabled={!selectedClassId || isLoadingSections}
                options={sectionOptions}
              />

              <Dropdown
                label={NameText.Subjects}
                name="subjectId"
                control={control}
                required
                options={subjects.map((s: any) => ({
                  value: String(s.id || s.subjectId),
                  label: s.name || s.subjectName,
                }))}
              />

              <Dropdown
                label={Text.Teacher}
                name="teacherId"
                control={control}
                required
                disabled={isLoadingTeachers}
                options={
                  isLoadingTeachers
                    ? [{ value: '', label: 'Loading teachers...' }]
                    : !teachers || teachers.length === 0
                      ? [{ value: '', label: 'No teachers available' }]
                      : teachers.map((t: any) => ({
                        value: String(t.teachersId || t.id),
                        label: t.name || 'Unknown Teacher',
                      }))
                }
              />

              <Dropdown
                label={Text.Days}
                name="day"
                control={control}
                required
                options={days.map((d) => ({ value: d.key, label: d.label }))}
              />

              <TimeField label={Text.Start_Time} name="startTime" control={control} required />
              <TimeField label={Text.End_Time} name="endTime" control={control} required />
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                name={editingId ? Text.Update : Text.Save}
                loading={addMutation.isPending || updateMutation.isPending}
                isDisable={false}
              />
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                {Text.Cancel}
              </button>
            </div>
          </AllSchoolDropdown>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{Text.Search_Timetable}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Dropdown
            label={Text.Class}
            name="searchClassId"
            control={searchControl}
            options={classes.map((c: any) => ({
              value: String(c.id || c.schoolClassId),
              label: c.name || c.className,
            }))}
          />

          <Dropdown
            label={NameText.Section}
            name="searchSectionId"
            control={searchControl}
            disabled={!searchClassId || isLoadingSearchSections}
            options={searchSectionOptions}
          />

          <div className="flex items-end">
            <Button
              name={Text.Search}
              loading={false}
              isDisable={!searchSectionId}
              onClick={() => refetch()}
              showAlways={true}
            />
          </div>
        </div>
      </div>

      {searchSectionId && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{Text.Weekly_Schedule || "Weekly Schedule"}</h2>
          {timetables.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{Text.No_Classes || "No Classes"}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map((day) => {
                const dayItems = timetables.filter((t) => t.day === day.key)
                return (
                  <div key={day.key} className="border rounded-lg">
                    <div className="bg-gray-700 text-white p-3 font-semibold">{day.label}</div>
                    <div className="p-3 space-y-2">
                      {dayItems.length > 0 ? (
                        dayItems
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((item, i) => (
                            <div key={i} className="border rounded p-3 space-y-1">
                              <p className="font-semibold">{item.subjectName}</p>
                              <p className="text-sm text-gray-600">{item.teacherName}</p>
                              <p className="text-sm text-gray-600">
                                {item.startTime} - {item.endTime}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded"
                                >
                                  {Text.Edit}
                                </button>
                                <button
                                  onClick={() => handleDelete(item.timetableId || item.id)}
                                  className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded"
                                >
                                  {Text.Delete}
                                </button>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-4">{Text.No_Classes}</p>
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

export default ClassTimeTable

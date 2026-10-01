export interface ClassTimetable {
  schoolClassId(schoolClassId: any): string
  id: string
  timetableId: string
  teacherId: number
  teacherName: string
  subjectId: number
  subjectName: string
  sectionId: number
  sectionName: string
  schoolClassName: string
  day: string
  startTime: string
  endTime: string
}

export interface TimetableFormData {
  schoolClassId: any
  teacherId: number
  subjectId: number
  sectionId: number
  day: string
  startTime: string
  endTime: string
}

export interface TimetableStats {
  title: string
  value: string
  change: string
  icon: string
}

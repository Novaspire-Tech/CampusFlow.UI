export interface AssignClassTeacherFormData {
  classTeacher: string
  schoolClassId: string
  sectionId: string
  teacherId: string
}

export interface AssignClassTeacher {
  id?: string
  assignClassTeacherId?: string
  classTeacher?: string

  teacher?: {
    id: string
    name: string
    teacherName: string
    teacherId: string
  }

  schoolClass?: {
    id: string
    schoolClassId: string
    className: string
  }

  section?: {
    id: string
    sectionId: string
    sectionName: string
  }
}

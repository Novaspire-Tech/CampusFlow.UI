export interface Staff {
  staffId: number
  name: string
}

export interface Teacher {
  id?: string
  teachersId?: string
  name: string
  teacherCode: string
  staff?: Staff
  staffId?: number
}

export interface TeacherFormData {
  name: string
  teacherCode: string
  staffId?: number
}

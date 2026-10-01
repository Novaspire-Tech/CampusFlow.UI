export interface Subject {
  id?: string
  subjectId?: string
  subjectName?: string
  subjectType?: string
  subjectCode?: string
}

export interface SchoolClass {
  id?: string
  schoolClassId?: string
  className?: string
}

export interface SubjectGroup {
  name: string
  id?: string
  subjectGroupId?: string
  subjectGroup: string
  description?: string
  schoolClass?: SchoolClass
  subjects: Subject[]
  subject?: Subject
}

export interface SubjectGroupFormData {
  classId?: string | number
  subjectGroup: string
  description?: string
  schoolClassId: string | number
  subjectIds: string[] | number[]
  subjectId?: string | number
}

export interface SubjectGroupTableData extends SubjectGroup {
  className?: string
  subjectNames?: string
  subjectCount?: number
}

export interface SubjectGroupResponse {
  subjectGroupId: number

  subjectGroup: string
  description?: string
  classId: number
  className: string
  subjects: Array<{
    subjectId: number
    subjectName: string
    subjectType?: string
    subjectCode?: string
    totalMarks?: number
  }>
  subjectMarks?: Record<number, number> | Array<{ subjectId: number; marks: number }>
}

export interface SubjectGroupRequest {
  subjectGroup: string
  description?: string
  classId: number
  subjectIds: number[]
  subjectMarks?: Record<number, number>
}

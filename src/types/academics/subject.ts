export type SubjectType = 'Theory' | 'Practical'

export interface Subject {
  name: string
  subjectId: string
  subjectGroupId: any
  id: string
  subjectName: string
  subjectCode: string
  subjectType: SubjectType
  createdDate?: string
}

export interface SubjectFormData {
  subjectName: string
  subjectCode: string
  subjectType: SubjectType
}

export interface SubjectStats {
  title: string
  value: string
  change: string
  icon: string
}

export interface SubjectFromBackend {
  subjectId: string
  subjectName: string
  subjectCode: string
  subjectType: SubjectType
}

export interface CommonApiResponse {
  status: number
  message: string
  data?: any
  template?: any
  studentIdCardTemplate?: any
  timestamp?: string
}
export interface StudentIdCardTemplate {
  studentIdCardTemplateId: string
  id?: string

  templateName: string
  schoolName: string
  tagLine?: string | null
  address: string

  logo: string
  sign?: string | null
  backgroundImage?: string | null
  backCardBackgroundImage?: string | null

  name: boolean
  admissionNo: boolean
  dateOfBirth: boolean
  section: boolean
  classField: boolean
  photo: boolean
  signature: boolean
  fatherName: boolean
  parentPhone: boolean
  gender: boolean
  studentAddress: boolean
  bloodGroup: boolean
  circularProfilePicture: boolean
  headerBodyDividerLine: boolean

  headerTextColor?: string | null
  keyTextColor?: string | null
  valueTextColor?: string | null

  createdAt?: string
  updatedAt?: string
}

export interface StudentIdCardTemplateListItem {
  id: string
  templateName: string
  schoolName: string
  address: string
}

export interface StudentIdCardTemplateFormData {
  templateName: string
  schoolName: string
  tagLine?: string
  address: string

  logo: File | null
  sign?: File | null
  backgroundImage?: File | null
  backCardBackgroundImage?: File | null

  name: boolean
  admissionNo: boolean
  dateOfBirth: boolean
  section: boolean
  classField: boolean
  photo: boolean
  signature: boolean
  fatherName: boolean
  parentPhone: boolean
  gender: boolean
  studentAddress: boolean
  bloodGroup: boolean
  circularProfilePicture: boolean
  headerBodyDividerLine: boolean

  headerTextColor?: string | null
  keyTextColor?: string | null
  valueTextColor?: string | null
}

export interface GenerateStudentIdCardsDto {
  studentIds: number[]
}


export interface Student {
  studentId: number
  admissionNo: string
  firstName: string
  lastName: string
  studentName?: string
  class?: string
  className?: string
  section?: string
  sectionName?: string
  dob?: string
  rollNumber?: string
  photo?: string
  photoUrl?: string
}

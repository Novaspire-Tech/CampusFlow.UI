export interface StaffIDCard {
  staffIdCardId: string
  staff: {
    staffId: string
    staffName?: string
    department?: string
    designation?: string
    photoUrl?: string
    bloodGroup?: string
  }
  filePath: string
  createdAt?: string
  updatedAt?: string
}

export interface StaffIDCardFormData {
  staffId: string
  filePath: File | null
}


export interface StaffIdCardTemplateResponseDto {
  id: number
  templateName: string
  schoolName: string
  address: string
  tagLine?: string

  logo?: string | null
  sign?: string | null
  backgroundImage?: string | null
  backCardBackgroundImage?: string | null
  barcodeUrl?: string | null

  headerTextColor?: string
  keyTextColor?: string
  valueTextColor?: string

  staffCode?: boolean
  designation?: boolean
  department?: boolean
  dateOfJoining?: boolean
  dateOfBirth?: boolean
  staffAddress?: boolean
  bloodGroup?: boolean
  barcode?: boolean
  signature?: boolean
  circularProfilePicture?: boolean
  headerBodyDividerLine?: boolean
}

export interface StaffIdCardTemplate {
  staffIdCardTemplateId: number
  templateName: string
  schoolName: string
  tagLine: string
  address: string

  logo?: string | null
  sign?: string | null
  backgroundImage?: string | null
  backCardBackgroundImage?: string | null
  barcodeUrl?: string | null

  headerTextColor: string
  keyTextColor: string
  valueTextColor: string

  staffCode: boolean
  designation: boolean
  department: boolean
  dateOfJoining: boolean
  dateOfBirth: boolean
  staffAddress: boolean
  bloodGroup: boolean
  barcode: boolean
  signature: boolean
  circularProfilePicture: boolean
  headerBodyDividerLine: boolean

  createdAt?: string
  updatedAt?: string
}

export interface StaffIdCardTemplateFormData {
  templateName: string
  schoolName: string
  tagLine: string
  address: string

  headerTextColor: string
  keyTextColor: string
  valueTextColor: string

  logo: File | null
  sign?: File | null
  backgroundImage?: File | null
  backCardBackgroundImage?: File | null
  barcodeUrl?: File | null

  staffCode: boolean
  designation: boolean
  department: boolean
  dateOfJoining: boolean
  dateOfBirth: boolean
  staffAddress: boolean
  bloodGroup: boolean
  barcode: boolean
  signature: boolean
  circularProfilePicture: boolean
  headerBodyDividerLine: boolean
}

export interface GenerateStaffIdCardDto {
  staffIds: number[]
}

export interface CommonApiResponse<T = any> {
  status: number
  message: string
  data?: T
  timestamp?: string
}

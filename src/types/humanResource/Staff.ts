export interface Staff {
  classDepartment: any
  profilePicture: null
  resume: null
  joiningLetter: null
  otherDocument: null
  staffId: string
  id: string
  staffCode: string
  role: string
  firstName: string
  lastName: string
  fatherName?: string
  motherName?: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup: string
  dateOfJoining: string
  gender: string
  currentAddress?: string
  permanentAddress?: string
  emergencyContactNo?: string
  maritalStatus?: string
  qualification?: string
  workExperience?: string
  note?: string
  photo?: string | null
  department?: Department
  designation?: Designation
  staffAssignedLeave?: StaffAssignedLeave
  staffBankAccountDetails?: StaffBankAccountDetails
  payRoll?: PayRoll
  socialMediaLink?: StaffSocialMediaLink
  staffDocuments?: StaffDocuments
}

export interface Department {
  departmentId: number
  departmentName?: string
  name: string
}

export interface Designation {
  designationId: number
  designationName?: string
  name: string
}

export interface StaffAssignedLeave {
  sickLeaveAssigned: number
  sickLeaveCount?: number
  casualLeaveAssigned: number
  casualLeaveCount?: number
  maternityLeaveAssigned: number
  maternityLeaveCount?: number
  annualLeaveAssigned: number
  annualLeaveCount?: number
  staffAssignedLeaveId: number
}

export interface StaffBankAccountDetails {
  accountNumber: string
  confirmAccountNumber: string
  bankName: string
  IFSCCode: string
  branch: string
}

export interface PayRoll {
  basicSalary: number
  employmentType: string
  workLocation?: string | null
}

export interface StaffSocialMediaLink {
  faceBook?: string
  twitter?: string
  instagram?: string
  linkedIn?: string
}

export interface StaffDocuments {
  joiningLetter?: string
  resume?: string
  otherDocument?: string
}

export interface StaffFormData {
  classDepartmentId: number

  role: string
  firstName: string
  lastName: string
  fatherName?: string
  motherName?: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup: string
  dateOfJoining: string
  gender: string
  currentAddress?: string
  permanentAddress?: string
  emergencyContactNo?: string
  maritalStatus?: string
  qualification?: string
  workExperience?: string
  note?: string

  departmentId: number
  designationId: number

  leaves: {
    sickLeaves: number
    casualLeaves: number
    maternityLeaves: number
    annualLeaves: number
  }

  bankDetails?: {
    accountNumber: string
    confirmAccountNumber: string
    bankName: string
    ifscCode: string
    branchName: string
  }

  payroll: {
    basicSalary: number
    employmentType: string
    workLocation?: string | null
  }

  socialMediaLinks?: {
    faceBook?: string
    twitter?: string
    instagram?: string
    linkedIn?: string
  }

  profilePicture?: File | null
  resume?: File | null
  joiningLetter?: File | null
  otherDocument?: File | null
}

export interface StaffStats {
  title: string
  value: string
  change: string
  icon: string
}

export interface StaffListResponse {
  staffList: Staff[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface StaffSearchParams {
  role?: string
  designationId?: number
  departmentId?: number
  search?: string
}

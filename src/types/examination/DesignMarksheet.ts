// types/examination/markSheet.ts

export interface MarkSheetTemplate {
  id?: number;
  marksSheetTemplateId: number;
  templateName: string;
  schoolName: string;
  address: string;
  session: string;
  logo: string | null;
  principleSign?: string | null;
  fatherName: boolean;
  motherName: boolean;
  admissionNo: boolean;
  dateOfBirth: boolean;
  sign: boolean;
  stamp: boolean;
  schoolClass?: {
    schoolClassId: number;
    className: string;
  };
  examGroup?: {
    examGroupId: number;
    name: string;
  };
  schoolClassId: number;
  examGroupId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkSheetTemplateResponseDto {
  id: number;
  templateName: string;
  schoolName: string;
  address: string;
  session?: string;
  schoolClassId?: number;
  examGroupId?: number;
}

export interface MarkSheetTemplateFormData {
  templateName: string;
  schoolName: string;
  address: string;
  session: string;
  logo: File | null;
  principleSign?: File | null;
  fatherName: boolean;
  motherName: boolean;
  admissionNo: boolean;
  dateOfBirth: boolean;
  sign: boolean;
  stamp: boolean;
  schoolClassId: number;
  examGroupId: number;
}

export interface GenerateMarkSheetDto {
  studentIds: number[];
}

export interface MarkSheetSubject {
  subjectId: number;
  subjectName: string;
  maxMarks: number;
  obtainedMarks: number;
  attendance: boolean;
  passed: boolean;
}

export interface MarkSheetTemplateViewData {
  marksSheetTemplateId: number;
  templateName: string;
  schoolName: string;
  address: string;
  session: string;
  examGroupName: string;
  className: string;
  logo: string;
  principleSign?: string;
  studentNameValue: string;
  fatherNameValue: string;
  motherNameValue: string;
  admissionNoValue: string;
  dobValue: string;
  subjects: MarkSheetSubject[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  fatherName: boolean;
  motherName: boolean;
  admissionNo: boolean;
  dob: boolean;
  sign: boolean;
  stamp: boolean;
}

// Common API Response structure
export interface CommonApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  timestamp?: string;
}
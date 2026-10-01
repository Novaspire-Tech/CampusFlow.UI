// src/types/attendance.types.ts

export interface StudentAttendanceDto {
  attendanceId?: number;
  studentId: number;
  classId: number;
  sectionId: number;
  attendanceDate: string;
  attendance: string;
  note: string;
  student?: StudentInfo;
  schoolClass?: ClassInfo;
  section?: SectionInfo;
}

export interface StudentInfo {
  studentId: number;
  studentName: string;
  email?: string;
  rollNo?: string;
}

export interface ClassInfo {
  className: string;
}

export interface SectionInfo {
  sectionId: number;
  sectionName: string;
}

export interface AttendanceResponse {
  status: number;
  message: string;
  data: StudentAttendanceDto[] | AttendancePagedData | number | null;
}

export interface AttendancePagedData {
  attendance: StudentAttendanceDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface BulkAttendanceRequest {
  attendanceList: StudentAttendanceDto[];
}
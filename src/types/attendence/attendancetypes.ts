export const StudentAttendanceStatus = {
  PRESENT: "PRESENT",
  LATE: "LATE",
  ABSENT: "ABSENT",
  HOLIDAY: "HOLIDAY",
  HALFDAY: "HALFDAY"
} as const;


export type StudentAttendanceStatus = typeof StudentAttendanceStatus[keyof typeof StudentAttendanceStatus];

export interface StudentAttendanceDto {
  studentAttendanceId?: number;
  attendance: StudentAttendanceStatus;
  note?: string;
  attendanceDate?: string;
  studentId: number;
  studentName?: string;
  admissionNo?: string;
  rollNo?: string;
  classId?: number;
  className?: string;
  sectionId?: number;
  sectionName?: string;
}

export interface AttendanceRecord {
  studentId: number;
  attendance: StudentAttendanceStatus;
  note?: string;
}

export interface BulkAttendanceDto {
  attendanceDate: string;
  classId: number;
  sectionId: number;
  attendanceRecords: AttendanceRecord[];
}

export interface StudentForAttendance {
  studentId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  rollNo: string;
  admissionNo: string;
  attendance?: StudentAttendanceStatus;
  note?: string;
}

export interface AttendanceResponse {
  status: number;
  message: string;
  data: StudentAttendanceDto[] | null;
}

export interface ClassOption {
  value: number;
  label: string;
}

export interface SectionOption {
  value: number;
  label: string;
}

export interface AttendanceFormData {
  classId: number;
  sectionId: number;
  attendanceDate: string;
}
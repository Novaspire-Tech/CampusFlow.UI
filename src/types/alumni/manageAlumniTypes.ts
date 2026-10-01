
export interface StudentSessionRef {
  studentSessionId: string;
  sessionName: string;
  studentName: string;
  admissionNo?: string;
  email?: string | null;
  gender?: string;
  phoneNumber?: string | null;
  schoolClassId?: string;
  schoolClassName?: string;
  sectionId?: string;
  sectionName?: string;
  sessionId?: string;
}

export interface ManageAlumni {
  manageAlumniId: string;
  studentSessionId: string;
  studentSession: StudentSessionRef;
}

export interface ManageAlumniFormData {
  studentSessionId: string;
}
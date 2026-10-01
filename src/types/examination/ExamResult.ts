// types/examination/ExamResult.ts

export interface ExamResult {
  examResultID: number;
  templateName: string;
  school: string;
  schoolClass: SchoolClassRef;
  session: SessionRef;
}

/* Used only for dropdowns / selectors */
export interface SessionRef {
  sessionId: number;
  sessionName: string;
}

export interface SchoolClassRef {
  classId: number;
  className: string;
}

/* Used for create/update forms */
export interface ExamResultFormData {
  templateName: string;
  school: string;
  schoolClassId: number;
  sessionId: number;
}

/* DTO - matches backend ExamResultDto */
export interface ExamResultDto {
  examResultID?: number;
  templateName: string;
  school: string;
  schoolClassId: number;
  sessionId: number;
}
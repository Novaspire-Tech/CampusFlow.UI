export interface AcademicTask {
  // Backend returns "taskId" — we keep both for internal use
  id: string;           // mapped from taskId (string form)
  taskId: string;       // original backend field (string form)
  title: string;
  description: string;
  taskType: string;
  assignedDate: string;
  submissionDate: string;
  evaluationDate?: string;
  maxMarks: number;
  status: string;
  attachmentPath?: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
}

export interface AcademicTaskFormData {
  title: string;
  description: string;
  taskType: string;
  assignedDate: string;
  submissionDate: string;
  evaluationDate?: string;
  maxMarks: number;
  status: string;
  attachment?: File;
  sectionId: string;
  subjectId: string;
  teacherId: string;
}

export interface AcademicTaskFilters {
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  search?: string;
}

export interface AcademicTaskResponse {
  tasks: AcademicTask[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
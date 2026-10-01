
export interface ExamSchedule {
  examScheduleId: string;
  subjectId: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  duration: string;
  roomNo: string;
  totalMarks: string;
  subjectType?: string;
  subject?: {
    subjectId: string;
    subjectName: string;
    subjectType?: string;
  };
}

export interface SubjectDTO {
  subjectId: string;
  examDate: string;
  startTime: string;
  duration: string;
  roomNo: string;
  totalMarks: string;
  examScheduleId?: string;
}

export interface CreateExamScheduleRequestDTO {
  schoolClassId: string;
  examGroupId: string;
  subjectDTOList: SubjectDTO[];
}

export interface ExamScheduleFilters {
  schoolClassId: string;
  examGroupId: string;
}
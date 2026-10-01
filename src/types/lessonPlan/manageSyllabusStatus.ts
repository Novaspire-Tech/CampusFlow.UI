// types/lessonPlan/manageSyllabusStatus.ts

export interface ManageSyllabusStatus {
  id: string;
  class: string;
  section: string;
  subjectGroup: string;
  subject: string;
  topic: string;
  schoolClassId?: string;
  sectionId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  topicId?: string;
}

export interface ManageSyllabusStatusFormData {
  class: string;
  section: string;
  subjectGroup: string;
  subject: string;
  topic: string;
  schoolClassId: string;
  sectionId: string;
  subjectGroupId: string;
  subjectId: string;
  topicId: string;
}
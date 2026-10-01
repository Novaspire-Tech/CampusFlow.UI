export interface Lesson {
  id: string;
  lessonId: string;
  lessonName: string;
  className: string;
  section: string;
  subjectGroup: string;
  subject: string;
  lesson?: string;
  schoolClassId: string;
  sectionId: string;
  subjectGroupId: string;
  subjectId: string;
}

export interface LessonFormData {
  lessonName: string;
  lesson?: string;
  schoolClassId: string;
  sectionId: string;
  subjectGroupId: string;
  subjectId: string;
  className?: string;
  section?: string;
  subjectGroup?: string;
  subject?: string;
}

export interface FilterLessonDto {
  schoolClassId?: number;
  sectionId?: number;
  subjectGroupId?: number;
  subjectId?: number;
  search?: string;
}

export interface FilterLessonParams {
  dto: FilterLessonDto;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface LessonPagedResponse {
  lessons: Lesson[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
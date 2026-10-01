export interface Teacher {
  id: number;
  name: string;
}

export interface ManageLessonPlan {
  manageLessonPlanId: number;
  time: string;
  room: string;
  day: string;
  subject: { name: string };
  teachers: { id: number; firstName: string; lastName: string };
  schoolClass: { name: string };
}

export interface LessonPlanDto {
  time: string;
  room: string;
  day: string;
  subjectId: number;
  teacherId: number;
  classId: number;
}
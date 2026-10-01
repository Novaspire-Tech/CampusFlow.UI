export interface ExamGroup {
  examGroupId: number;
  id: number;
  name: string;
  description?: string;
  examGroupName: string;
  schoolClass?: {
    id: number;
    className: string;
  };
  schoolClassId: number;
  className?: string;
  totalSubjects?: number;
}

export interface ExamGroupFormData {
  name: string;
  description?: string;
  schoolClassId: number;
}

export interface MarkDivision {
  markDivisionId: string;
  divisionName: string;
  percentFrom: string;
  percentUpTo: string;
}

export interface ExamGroup {
  examGroupId: string;
  name: string;
}

export interface MarksGrade {
  id: string;
  marksGradeId?: string;
  gradePoint: string;
  gradeName?: string;
  markDivision?: MarkDivision;
  markDivisionId?: string;
  examGroup?: ExamGroup;
  examGroupId?: string;
}

export interface MarksGradeFormData {
  gradePoint: string;
  gradeName?: string;
  markDivisionId: string;
  examGroupId: string;
}
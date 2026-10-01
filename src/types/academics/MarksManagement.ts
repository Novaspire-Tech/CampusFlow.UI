 export interface MarksDto {
  marksId?: number;
  subjectId: number;
  subjectName?: string;
  totalMarks: number;
  totalObtainMarks: number;
}
 
export interface MarksManagementDto {
  marksManagementId?: number;
  id?: string;
  examGroupId: number;
  examGroupName?: string;
  studentId: number;
  subjectGroupId: number;
  studentName?: string;
  className?: string;
  rollNo?: string;
  admissionNo?: string;
  marks: MarksDto[];
}
 
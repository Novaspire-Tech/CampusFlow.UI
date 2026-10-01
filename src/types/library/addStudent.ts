export interface AddStudentMemberDto {
   addStudentMemberId?: string | number;
  id?: string;
  libraryCardNo: string;
  studentId: number;

  studentName: string;

  admissionNo?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  className?: string;
}

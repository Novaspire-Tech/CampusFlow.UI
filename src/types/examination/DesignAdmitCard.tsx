export interface GenerateAdmitCardFormData {
  //to send data in string format
  data: GenerateAdmitCardData;
 
  // required
  logo: File;
 
  // required ONLY if data.sign === true
  principleSign?: File | null;
}
 
export interface GenerateAdmitCardData {
  templateName: string;
  schoolName: string;
  address: string;
 
  // relations
  schoolClassId: number;
  examGroupId: number;
 
  // flags
  fatherName: boolean;
  motherName: boolean;
  admissionNo: boolean;
  dateOfBirth: boolean;
  sign: boolean;
}
 
export interface AdmitCardTemplate {
  id: number;
  templateName: string;
  schoolName: string;
  address: string;
}
 
export interface AdmitCardTemplateView {
  admitCardTemplateId: number;
 
  templateName: string;
  schoolName: string;
  address: string;
 
  logo: string;
  principleSign: string;
 
  // flags
  fatherName: boolean;
  motherName: boolean;
  admissionNo: boolean;
  dateOfBirth: boolean;
  sign: boolean;
 
  // exam info
  examGroupName: string;
 
  // subject schedules
  schedules: AdmitCardSubjectSchedule[];
}
 
export interface AdmitCardSubjectSchedule {
  subjectId: number;
  subjectName: string;
 
  examDate: string;   // dd/MM/yyyy
  startTime: string;  // hh:mm a
 
  duration: string | number;
  roomNo: string;
  totalMarks: number;
}
 
 
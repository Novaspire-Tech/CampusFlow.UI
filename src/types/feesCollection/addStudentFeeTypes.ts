export interface FeeRowData {
  feeTypeId: string;
  feeTypeName: string;
  totalFees: string;
  paid: string;
  pending: string;
  classFeesId: string;
  feesId: string;
}

export interface StudentFeeRecord {
  id: string | number;
  admissionNo: string;
  studentName: string;
  class: string;
  classId: string | number;
  section: string;
  sectionId: string | number;
  rollNo: string;
  fatherName: string;
  gender: string;
  mobile: string;
  totalFees: string;
  totalPaid: string;
  totalPending: string;
  feesList: FeeRowData[];
  hasFees: boolean;
  _raw: any;
}
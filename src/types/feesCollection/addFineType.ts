export interface FineTransactionDto {
  fineTransactionId?: number;
  amount: number;
  reason: string;
  date: string;
  feesId: number;
  studentId: number;
  feeTypeId: number;

  feesTotalFees?: number;
  feesPaid?: number;
  feesPending?: number;
  studentName?: string;
  admissionNo?: string;
  rollNo?: string;
  classId?: number;
  className?: string;
  sectionId?: number;
  sectionName?: string;
  feeTypeName?: string;
  feeTypeDescription?: string;
}

export interface FineTransactionsPaginatedResponse {
  fineTransactions: FineTransactionDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface FineTransactionCreateRequest {
  amount: number;
  reason: string;
  date: string;
  feesId: number;
  studentId: number;
  feeTypeId: number;
}

export interface FineTransactionUpdateRequest extends FineTransactionCreateRequest {
  fineTransactionId: number;
}

export interface FilterStudentDto {
  search?: string;
  searchQuery?: string;
  schoolClassId?: number;
  sectionId?: number;
  sessionStatus?: string;      
  rollNo?: string;
}

export interface FilterStudentParams {
  dto: FilterStudentDto;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}
export interface StudentListResponse {
  students: RawStudentRecord[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
export interface RawStudentRecord {
  studentId: number;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  className?: string;
  classId?: number;
  sectionName?: string;
  sectionId?: number;
  email?: string;
  phoneNumber?: string;
  transport?: any;
  hostel?: any;
  feesList?: Array<{
    feesId?: number;
    feeTypeId?: number;
    feeTypeName?: string;
    totalFees?: string;
    paid?: string;
    pending?: string;
    fine?: number;
  }>;
}

//  Student Display Types
export interface StudentData {
  id: number | string;
  studentId: number;
  class: string;
  classId?: number;
  admissionNo: string;
  studentName: string;
  rollNo: string;
  section: string;
  sectionId?: number;
  feeType: string;
  fine: number;
  reason: string;
  feesId?: number;
  email?: string;
  phoneNumber?: string;
  feesList?: {
    fine: number;
    feesId?: number;
    feeTypeId?: number;
    feeTypeName?: string;
    totalFees?: string;
    paid?: string;
    pending?: string;
  }[];
}

//  Form Types
export interface SearchFormData {
  class?: string;
  section?: string;
  search?: string;
  rollNo?: string;
}

/** Fine-adding modal form */
export interface FineFormData {
  amount: number;
  reason: string;
  feeTypeId: number;
  feeTypeName?: string;
}
export interface FeeType {
  id?: number;
  feeTypeId?: number;
  name?: string;
  feeTypeName?: string;
  description?: string;
  code?: string;
  feeCode?: string;
}

export interface Student {
  studentId: string | number;
  admissionNo: string;
  rollNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  className?: string;
  classId?: string | number;
  sectionName?: string;
  sectionId?: string | number;
  email?: string;
  phoneNumber?: string;
  feesList?: Array<{
    feesId?: number;
    feeTypeId?: number;
    feeTypeName?: string;
    totalFees?: string;
    paid?: string;
    pending?: string;
  }>;
}

export interface ModalState {
  isOpen: boolean;
  selectedStudent: StudentData | null;
}

export interface MessageState {
  success: string;
  error: string;
}

export interface FilterState {
  class: string;
  section: string;
  admissionNo: string;
  studentName: string;
  rollNo: string;
  searchTerm: string;
}

export interface TableColumn {
  label: string;
  key: keyof StudentData;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface ClassOption extends DropdownOption {}
export interface SectionOption extends DropdownOption {}
export interface FeeTypeOption extends DropdownOption {
  description?: string;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T | null;
}

export interface FineTransactionResponse extends ApiResponse<FineTransactionDto> {}
export interface FineTransactionsListResponse extends ApiResponse<FineTransactionsPaginatedResponse> {}

export type {
  StudentData as AddFineStudentData,
  SearchFormData as AddFineSearchForm,
  FineFormData as AddFineFineForm,
  FineTransactionCreateRequest as AddFineRequest,
  FineTransactionDto as AddFineFineTransaction,
};

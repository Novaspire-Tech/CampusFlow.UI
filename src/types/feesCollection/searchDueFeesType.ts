export interface FeeTransactionDto {
  fine: number;
  feeTransactionId?: number;
  amount: number;
  discountAmount: number;
  date: string;
  mode: string;
  receiptNo?: string;
  note?: string;
  feesId: number;
  studentId: number;
  feeTypeId: number;

  feesTotalFees?: number;
  feesPaid?: number;
  feesPending?: number;
  feesfine?: number;
  feesFine?: number;
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

export interface AddTransaction {
  amount?: number;
  mode: string;
  receiptNo: number;
  discountAmount: string;
  date: string;
  fine?: string;
  note?: string;
  feesId: number;
  studentId: number;
  feeTypeId: number;
}

export interface PaymentModeEntry {
  mode: string;
  amount: number;
  receiptNo?: string;
}

export interface FeeTransactionCreateRequest {
  discountAmount: number;
  date: string;
  fine?: number;
  note?: string;
  feesId: number;
  studentId: number;
  feeTypeId: number;
  paymentModes: PaymentModeEntry[];
}

export interface FeeTransactionUpdateRequest {
  feesId: number;
  studentId: number;
  feeTypeId: number;
  amount: number;
  discountAmount: number;
  fine: number;
  date: string;
  mode: string;
  receiptNo?: string | null;
  note?: string | null;
}

export interface FeeTransactionsPaginatedResponse {
  feeTransactions: FeeTransactionDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ParentData {
  parentId?: number;
  parentCode?: string;
  fatherName?: string;
  motherName?: string;
  fatherAadhaar?: string;
  motherAadhaar?: string;
  defaultParent?: string;
  name?: string;
  qualification?: string;
  occupation?: string;
  annualIncome?: number;
  incomeCertificateNumber?: string;
  noOfDependents?: number;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
}

export interface StudentFeesData {
  hostel: any;
  transport: any;
  id: number | string;
  studentId: number;
  class: string;
  classId: number;
  section: string;
  sectionId: number;
  admissionNo: string;
  studentName: string;
  rollNo: string;
  email?: string;
  phoneNumber?: string;

  parent?: ParentData;

  // Fees information
  feesList: FeeDetail[];

  // Calculated totals
  totalFees: number;
  totalPaid: number;
  totalPending: number;
  totalFine: number;
  totalDiscount: number;
}

export interface FeeDetail {
  feesId: number;
  feeTypeId: number;
  feeTypeName: string;
  totalFees: number;
  paid: number;
  pending: number;
  fine: number;
  discount: number;
}

export interface SearchFormData {
  class?: string;
  section?: string;
  session?: string;
  search?: string;
  rollNo?: string;
  minPending?: number;
  maxPending?: number;
}

export interface PaymentFormData {
  mode: string;
  transactionDate: string;
  feeTypeId: number;
  amount: number;
  fine: number;
  discountAmount: number;
  paymentMode: string;
  receiptNo?: string;
  note?: string;
  date?: string
  paymentModes?: PaymentModeEntry[];
}

export interface TransactionDisplayData {
  feeTransactionId: number;
  date: string;
  feeTypeName: string;
  feeTypeId?: number;
  feesId?: number;
  studentId?: number;
  mode: string;
  amount: number;
  discountAmount: number;
  fine: number;
  receiptNo?: string;
  note?: string;
}

export const PaymentMode = {
  CASH: "CASH",
  ONLINE: "ONLINE",
  CHEQUE: "CHEQUE",
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  UPI: "UPI",
  OTHER: "OTHER",
} as const;

export type PaymentMode = (typeof PaymentMode)[keyof typeof PaymentMode];

export const PAYMENT_MODE_OPTIONS = [
  { label: "Cash", value: PaymentMode.CASH },
  { label: "Online", value: PaymentMode.ONLINE },
  { label: "Cheque", value: PaymentMode.CHEQUE },
  { label: "Credit Card", value: PaymentMode.CREDIT_CARD },
  { label: "Debit Card", value: PaymentMode.DEBIT_CARD },
  { label: "UPI", value: PaymentMode.UPI },
  { label: "Other", value: PaymentMode.OTHER },
];

export interface ModalState {
  isOpen: boolean;
  selectedStudent: StudentFeesData | null;
}

export interface MessageState {
  success: string;
  error: string;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T | null;
}

export interface StudentsWithFeesResponse {
  students: StudentFeesData[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
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

export interface DropdownOption {
  value: string;
  label: string;
}

export interface TableColumn {
  label: string;
  key: string;
}

export interface FilterFeeTransactionsDto {
  studentId?: number | null;
  feeTypeId?: number | null;
  studentSessionStatus?: string | null;
  schoolClassId?: number | null;
  search?: string | null;
}

export interface FilterFeeTransactionsParams {
  dto: FilterFeeTransactionsDto;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface FilterFeeTransactionsState {
  isOpen: boolean;
  params: FilterFeeTransactionsDto;
  isFiltered: boolean;
}
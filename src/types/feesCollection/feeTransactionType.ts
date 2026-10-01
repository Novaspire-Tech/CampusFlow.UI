export interface FeeTransactionDto {
  feeTransactionId?: number;
  amount: number;
  discountAmount: number;
  date: string;
  fine?: number;
  mode: string;
  receiptNo?: string | null;
  note?: string | null;
  feesId: number;
  studentId: number;
  feeTypeId: number;

  feesTotalFees?: number;
  feesPaid?: number;
  feesPending?: number;
  feesFine?: number;
  studentName?: string;
  admissionNo?: string;
  rollNo?: string;
  classId?: number;
  className?: string;
  sectionId?: number;
  sectionName?: string;
  feeTypeName?: string;
}

export interface FeeTransactionsPaginatedResponse {
  feeTransactions: FeeTransactionDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
export interface FeeTransactionCreateRequest {
  amount: number;
  discountAmount: number;
  date: string;
  fine?: number;
  mode: PaymentMode;
  receiptNo?: string;
  note?: string;
  feesId: number;
  studentId: number;
  feeTypeId: number;
}

export interface FeeTransactionUpdateRequest
  extends FeeTransactionCreateRequest {
  feeTransactionId: number;
}

export interface FeeDetail {
  feesId?: number;
  feeTypeId: number;
  feeTypeName: string;
  totalFees: number;
  paid: number;
  pending: number;
  fine: number;
  discount: number;
}

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
  feeType?: string;
  feesId?: number;
  email?: string;
  phoneNumber?: string;
  totalFees?: number;
  paidAmount?: number;
  pendingAmount?: number;
  feesList?: FeeDetail[];
}
export interface SearchFormData {
  class?: string;
  section?: string;
  admissionNo?: string;
  studentName?: string;
  rollNo?: string;
}

export interface FeeTransactionFormData {
  amount: number;
  discountAmount: number;
  fine?: number;
  mode: PaymentMode;
  receiptNo?: string;
  note?: string;
  feeTypeId: number;
}

export interface TransactionDisplayData {
  feeTransactionId: number;
  date: string;
  feeTypeName: string;
  mode: PaymentMode;
  amount: number;
  discountAmount: number;
  fine: number;
  receiptNo?: string;
  note?: string;
}

export interface ModalState {
  isOpen: boolean;
  selectedStudent: StudentData | null;
}

export interface MessageState {
  success: string;
  error: string;
}

export type PaymentMode =
  | "CASH"
  | "ONLINE"
  | "CHEQUE"
  | "CARD"
  | "UPI"
  | "BANK_TRANSFER";

export const PAYMENT_MODES: ReadonlyArray<{
  label: string;
  value: PaymentMode;
}> = [
  { label: "Cash", value: "CASH" },
  { label: "Online", value: "ONLINE" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Card", value: "CARD" },
  { label: "UPI", value: "UPI" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
];

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T | null;
}

export interface FeeTransactionResponse
  extends ApiResponse<FeeTransactionDto> {}

export interface FeeTransactionsListResponse
  extends ApiResponse<FeeTransactionsPaginatedResponse> {}

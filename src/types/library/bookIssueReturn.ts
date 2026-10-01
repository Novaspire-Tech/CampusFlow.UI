export interface BookIssueReturn {
  id: string;
  memberType: 'STAFF' | 'STUDENT';
  libraryCardId: string;
  libraryCardNo: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  issueDate: string;
  returnDate: string;
  issueStatus?: string;
  submitStatus?: 'PENDING' | 'SUBMIT';
  submitDate?: string;
  fine?: number;
  isReturned?: boolean;
}

export interface BookIssueReturnFormData {
  libraryCardId: string;
  bookId: string;
  memberType: 'STAFF' | 'STUDENT';
  issueDate: string;
  returnDate: string;
  issueStatus?: string;
  submitStatus?: 'PENDING' | 'SUBMIT';
  submitDate?: string;
  fine: number;
}

export interface BookIssueReturnListResponse {
  bookIssueReturns: BookIssueReturn[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
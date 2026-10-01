export interface ExpenseHeadRef {
  id: string;
  name: string;
}

export interface AddExpense {
  id: string;
  addExpenseId: string;
  expenseHeadId: string;
  expenseGroupId: string;
  expenseHead: ExpenseHeadRef;
  expenseGroup: ExpenseHeadRef;
  expenseGroupName: string;
  expenseHeadName: string;
  name: string;
  invoiceNumber?: string;
  date: string;
  amount: number;
  document?: string | File | null;
  description?: string;
}

export interface AddExpenseFormData {
  expenseHeadId: string;
  expenseGroupId: string;
  name: string;
  invoiceNumber?: string;
  date: string;
  amount: number;
  document?: string | File | null;
  description?: string;
}


export interface PaginationMeta {
  currentPage: number; 
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

export interface PaginatedExpenses {
  expenses: AddExpense[];
  pagination: PaginationMeta;
}
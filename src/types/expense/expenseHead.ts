export interface ExpenseHead {
  expenseHeadId?: number;
  headName?: string;
  id: string;
  name: string;
  description: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface ExpenseHeadFormData {
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface ExpenseHeadStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}
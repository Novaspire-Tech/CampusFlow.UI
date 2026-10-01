export interface IncomeHeadRef {
  id: string;
  name: string;
}

export interface AddIncome {
  id: string;
  addIncomeId: string;
  incomeHeadId: string;
  incomeGroupId: string;
  groupName: string;
  incomeHead: IncomeHeadRef;
  incomeGroup: IncomeHeadRef;
  incomeHeadName: string;
  name: string;
  invoiceNumber?: string;
  date: string;
  amount: number;
  document?: string | File | null;
  description?: string;
}

export interface AddIncomeFormData {
  incomeHeadId: string;
  incomeGroupId: string;
  name: string;
  invoiceNumber?: string;
  date: string;
  amount: number;
  document?: string | File | null;
  description?: string;
}
export interface IncomeHead {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface IncomeHeadFormData {
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface IncomeHeadStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}
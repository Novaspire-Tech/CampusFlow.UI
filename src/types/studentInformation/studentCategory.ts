export interface StudentCategory {
  id: string;
  name: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface StudentCategoryFormData {
  name: string;
  status: 'Active' | 'Inactive';
}

export interface StudentCategoryStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}
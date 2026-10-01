export interface Department {
  departmentId?: string;
  id: string;
  name: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface DepartmentFormData {
  name: string;
  status: 'Active' | 'Inactive';
}

export interface DepartmentStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}
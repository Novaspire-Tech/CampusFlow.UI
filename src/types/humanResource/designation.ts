export interface Designation {
  designationId?: string;
  id: string;
  name: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface DesignationFormData {
  name: string;
  status: 'Active' | 'Inactive';
}

export interface DesignationStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}
export interface Reference {
  id: string;
  referenceId?: string;
  reference: string;
  description: string;
  createdDate?: string;
  status?: 'Active' | 'Inactive';
}

export interface ReferenceFormData {
  reference: string;
  description: string;
}
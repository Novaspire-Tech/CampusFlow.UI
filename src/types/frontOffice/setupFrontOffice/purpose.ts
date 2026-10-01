export interface Purpose {
  id: string;
  purposeId?: string;
  purpose: string;
  description: string;
  createdDate?: string;
  status?: 'Active' | 'Inactive';
}

export interface PurposeFormData {
  purpose: string;
  description: string;
}
export interface Source {
  id: string;
  sourceId?: string;
  source: string;
  description: string;
  createdDate?: string;
  status?: 'Active' | 'Inactive';
}

export interface SourceFormData {
  source: string;
  description: string;
}
export interface Purpose {
  id: string;
  purpose: string;
  description: string;
  createdDate?: string;
}

export interface ComplaintType {
  id: string;
  complaintType: string;
  description: string;
  createdDate?: string;
}

export interface Source {
  id: string;
  source: string;
  description: string;
  createdDate?: string;
}

export interface Reference {
  id: string;
  reference: string;
  description: string;
  createdDate?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
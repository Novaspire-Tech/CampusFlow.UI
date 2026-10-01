export interface BookList {
  id: string;
  bookTitle: string;
  bookNo: string;
  isbnNumber: string;
  publisher: string;
  author: string;
  subject: string;
  rackNumber: string;
  quantity: string;
  available: string;
  price: string;
  postDate: string;
  description: string;
}

export interface BookListFormData {
  bookTitle: string;
  bookNo: string;
  isbnNumber: string;
  publisher: string;
  author: string;
  subject: string;
  rackNumber: string;
  quantity: string;
  available: string;
  price: string;
  postDate: string;
  description: string;
}

export interface BookListStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}


export interface BookListResponse {
  books: BookList[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface BookListSearchParams {
  bookTitle?: string;
  author?: string;
  subject?: string;
  isbnNumber?: string;
  publisher?: string;
  search?: string;
}